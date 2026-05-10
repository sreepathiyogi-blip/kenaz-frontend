import { useCallback, useRef } from 'react'
import { fetchAds, fetchInsightsBatch, fetchPermalinks } from '../api/meta.js'
import { useStore } from '../store/useStore.js'

export function useLoadAds() {
  const { token, accounts, dateRange, adStatus, setAds, mergeInsights,
    setLoadingInsights, setInsightProgress, setLoadError } = useStore()
  const abortRef = useRef(null)

  const load = useCallback(async () => {
    // Cancel any in-flight request
    abortRef.current?.abort()
    const ctrl = new AbortController()
    abortRef.current = ctrl
    const { signal } = ctrl

    setLoadError(null)
    setLoadingInsights(true)
    setInsightProgress({ done: 0, total: 0 })

    try {
      const accountList = accounts
        .split(/[\n,]/)
        .map(s => s.trim())
        .filter(Boolean)

      if (!token) throw new Error('No access token. Open Settings and paste your token.')
      if (!accountList.length) throw new Error('No account IDs. Add at least one in Settings.')

      // Step 1: fetch all ads across accounts in parallel
      const adArrays = await Promise.all(
        accountList.map(acc => fetchAds(acc, token, adStatus, signal))
      )
      const rawAds = adArrays.flat()

      // Step 2: fetch permalinks (image URLs + IG links)
      // Group by account to avoid cross-account calls
      const byAccount = {}
      rawAds.forEach(ad => {
        if (!byAccount[ad.account]) byAccount[ad.account] = []
        byAccount[ad.account].push(ad)
      })
      const permalinkMaps = await Promise.all(
        Object.values(byAccount).map(group => fetchPermalinks(group, token, signal))
      )
      const permalinkMap = Object.assign({}, ...permalinkMaps)

      // Attach permalink data to each raw ad
      const adsWithMeta = rawAds.map(ad => ({
        ...ad,
        _permalink: permalinkMap[ad.id] || {},
      }))

      // Commit ads to store immediately so UI renders without insights
      setAds(adsWithMeta)

      // Step 3: fetch insights in small batches (5 at a time, 500ms gap)
      // This is the fix for the "reduce data" error
      const adIds = adsWithMeta.map(a => a.id)
      const since = dateRange.since
      const until = dateRange.until

      const insightsMap = await fetchInsightsBatch(
        adIds, since, until, token, signal,
        (progress) => setInsightProgress(progress)
      )
      mergeInsights(insightsMap)

    } catch (e) {
      if (e.name !== 'AbortError') {
        setLoadError(e.message || String(e))
      }
    } finally {
      setLoadingInsights(false)
    }
  }, [token, accounts, dateRange, adStatus, setAds, mergeInsights, setLoadingInsights, setInsightProgress, setLoadError])

  const cancel = useCallback(() => {
    abortRef.current?.abort()
    setLoadingInsights(false)
  }, [setLoadingInsights])

  return { load, cancel }
}
