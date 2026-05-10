// ─── Meta Graph API ───────────────────────────────────────────────────────────
const API_VERSION = 'v21.0'
const BASE = `https://graph.facebook.com/${API_VERSION}`

const AD_FIELDS = [
  'id', 'name', 'status', 'effective_status',
  'creative{id,object_story_id,image_url,thumbnail_url,video_id,instagram_permalink_url}',
].join(',')

const INSIGHT_FIELDS = [
  'spend', 'impressions', 'reach', 'ctr', 'cpc', 'cpm', 'frequency',
  'inline_link_clicks', 'actions', 'action_values',
  'video_thruplay_watched_actions', 'video_p100_watched_actions',
].join(',')

async function gql(path, params, token, signal) {
  const url = new URL(`${BASE}/${path}`)
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))
  url.searchParams.set('access_token', token)
  const res = await fetch(url, { signal })
  const json = await res.json()
  if (json?.error) throw new Error(json.error.message || JSON.stringify(json.error))
  return json
}

// Fetch all ads for one account (auto-paginates)
export async function fetchAds(accountId, token, status, signal) {
  const ads = []
  let url = `${BASE}/${accountId}/ads?fields=${encodeURIComponent(AD_FIELDS)}&limit=100&access_token=${token}`
  if (status) {
    url += '&filtering=' + encodeURIComponent(JSON.stringify([{ field: 'effective_status', operator: 'IN', value: [status] }]))
  }
  const crawl = async (pageUrl) => {
    const res = await fetch(pageUrl, { signal })
    const json = await res.json()
    if (json?.error) throw new Error(json.error.message)
    if (json.data) ads.push(...json.data.map(a => ({ ...a, account: accountId })))
    if (json?.paging?.next) await crawl(json.paging.next)
  }
  await crawl(url)
  return ads
}

// Fetch insights for a batch of ad IDs (returns map: adId → insights)
// BATCH_SIZE=5 and 500ms sleep between batches prevents Meta rate-limit errors
export async function fetchInsightsBatch(adIds, since, until, token, signal, onProgress) {
  const BATCH_SIZE = 5
  const DELAY_MS = 500
  const results = {}

  for (let i = 0; i < adIds.length; i += BATCH_SIZE) {
    if (signal?.aborted) break
    const chunk = adIds.slice(i, i + BATCH_SIZE)
    onProgress?.({ done: i, total: adIds.length })

    const batchReqs = chunk.map(id => ({
      method: 'GET',
      relative_url: `${encodeURIComponent(id)}/insights?fields=${encodeURIComponent(INSIGHT_FIELDS)}&time_range=${encodeURIComponent(JSON.stringify({ since, until }))}`,
    }))

    try {
      const res = await fetch(`${BASE}/?access_token=${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ batch: batchReqs }),
        signal,
      })
      const batchResults = await res.json()
      if (Array.isArray(batchResults)) {
        batchResults.forEach((r, idx) => {
          if (r?.code === 200 && r.body) {
            try {
              const parsed = JSON.parse(r.body)
              if (parsed.data?.[0]) results[chunk[idx]] = parsed.data[0]
            } catch (_) {}
          }
        })
      }
    } catch (e) {
      if (e.name !== 'AbortError') console.warn('Insight batch failed:', e)
    }

    if (i + BATCH_SIZE < adIds.length) {
      await new Promise(r => setTimeout(r, DELAY_MS))
    }
  }

  return results
}

// Fetch instagram permalink + image for each ad
export async function fetchPermalinks(ads, token, signal) {
  const results = {}
  const BATCH = 20
  const adIds = ads.map(a => a.id)

  for (let i = 0; i < adIds.length; i += BATCH) {
    const batch = adIds.slice(i, i + BATCH)
    const filter = JSON.stringify([{ field: 'id', operator: 'IN', value: batch }])
    try {
      const url = `${BASE}/${ads[0].account}/ads?access_token=${encodeURIComponent(token)}&fields=${encodeURIComponent('id,creative{object_story_id,effective_object_story_id,instagram_permalink_url,image_url,thumbnail_url}')}&filtering=${encodeURIComponent(filter)}&limit=50`
      const res = await fetch(url, { signal })
      const json = await res.json()
      if (json.data) {
        json.data.forEach(ad => {
          const c = ad.creative || {}
          const igPermalink = c.instagram_permalink_url || ''
          const storyId = c.object_story_id || c.effective_object_story_id || ''
          const imageUrl = c.image_url || c.thumbnail_url || ''
          if (igPermalink) {
            results[ad.id] = { permalink: igPermalink, platform: 'Instagram', imageUrl }
          } else if (storyId?.includes('_')) {
            const [pageId, postId] = storyId.split('_', 2)
            results[ad.id] = { permalink: `https://www.facebook.com/${pageId}/posts/${postId}`, platform: 'Facebook', imageUrl }
          } else {
            results[ad.id] = { permalink: '', platform: 'Facebook', imageUrl }
          }
        })
      }
    } catch (e) {
      console.warn('Permalink batch failed:', e)
    }
    if (i + BATCH < adIds.length) await new Promise(r => setTimeout(r, 300))
  }
  return results
}
