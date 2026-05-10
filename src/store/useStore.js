import { create } from 'zustand'

// ─── Helpers ──────────────────────────────────────────────────────────────────
const getAction = (actions, type) => {
  if (!Array.isArray(actions)) return 0
  return actions.filter(x => x.action_type === type).reduce((s, x) => (+x.value || 0) + s, 0)
}

const getProduct = (name) => {
  if (!name) return 'Other'
  const skipWords = /^(kz acc|sale|tof|ot|dt|advantage|reel|video|\d+-\d+|m\+f|m|f)$/i
  const parts = name.split('|').map(s => s.trim()).filter(Boolean)
  for (const p of parts) {
    if (skipWords.test(p)) continue
    if (p.length > 3) return p.split(' ').slice(0, 3).join(' ')
  }
  return 'Other'
}

export const extractIgShortcode = (url) => {
  if (!url) return null
  const m = url.match(/instagram\.com\/(?:p|reel)\/([^/?#]+)/i)
  return m?.[1] || null
}

// Merge raw ad + permalink + insights into one normalized ad object
export function normalizeAd(raw, permalink = {}, insights = {}) {
  const spend = +insights.spend || 0
  const imp = +insights.impressions || 0
  const reach = +insights.reach || 0
  const clicks = +insights.inline_link_clicks || 0
  const purchases = getAction(insights.actions, 'purchase') || getAction(insights.actions, 'offsite_conversion.fb_pixel_purchase')
  const rev = getAction(insights.action_values, 'purchase') || 0
  const roas = spend > 0 ? rev / spend : 0
  const lpv = getAction(insights.actions, 'landing_page_view')
  const atc = getAction(insights.actions, 'add_to_cart')
  const ci = getAction(insights.actions, 'initiate_checkout')
  const ctr = imp > 0 ? (clicks / imp) * 100 : 0
  const cpm = imp ? (spend * 1000 / imp) : +insights.cpm || 0
  const cpc = clicks ? spend / clicks : +insights.cpc || 0
  const cpp = purchases > 0 ? spend / purchases : 0
  const v3sec = getAction(insights.actions, 'video_view') || 0
  const thruplay = getAction(insights.video_thruplay_watched_actions, 'video_view') || 0
  const p100 = getAction(insights.video_p100_watched_actions, 'video_view') || 0
  const hookRate = imp > 0 ? (v3sec / imp) * 100 : 0
  const holdRate = imp > 0 ? (thruplay / imp) * 100 : 0
  const completionRate = imp > 0 ? (p100 / imp) * 100 : 0
  const lc2lpv = clicks > 0 ? (lpv / clicks) * 100 : 0
  const lpv2atc = lpv > 0 ? (atc / lpv) * 100 : 0
  const atc2ci = atc > 0 ? (ci / atc) * 100 : 0
  const ci2order = ci > 0 ? (purchases / ci) * 100 : 0
  const igSc = extractIgShortcode(permalink.permalink)

  return {
    id: raw.id,
    name: raw.name,
    account: raw.account,
    status: raw.effective_status || raw.status,
    product: getProduct(raw.name),
    platform: permalink.platform || 'Facebook',
    permalink: permalink.permalink || '',
    imageUrl: permalink.imageUrl || raw.creative?.image_url || raw.creative?.thumbnail_url || '',
    igShortcode: igSc || '',
    isReel: Boolean(igSc) || raw.platform === 'Instagram',
    // metrics
    spend, rev, roas, imp, reach, clicks, purchases, lpv, atc, ci,
    ctr, cpm, cpc, cpp, v3sec, thruplay, p100,
    hookRate, holdRate, completionRate,
    lc2lpv, lpv2atc, atc2ci, ci2order,
    frequency: +insights.frequency || 0,
    hasInsights: spend > 0 || imp > 0,
  }
}

// ─── Store ────────────────────────────────────────────────────────────────────
export const useStore = create((set, get) => ({
  // Config
  token: localStorage.getItem('kenaz_tk') || '',
  accounts: localStorage.getItem('kenaz_acc') || '',
  dateRange: { since: '', until: '' },
  adStatus: 'ACTIVE',
  manualMap: {},

  setToken: (token) => { set({ token }); localStorage.setItem('kenaz_tk', token) },
  setAccounts: (accounts) => { set({ accounts }); localStorage.setItem('kenaz_acc', accounts) },
  setDateRange: (dateRange) => set({ dateRange }),
  setAdStatus: (adStatus) => set({ adStatus }),
  setManualMap: (manualMap) => set({ manualMap }),

  // Ads data
  ads: [],
  insightsMap: {},        // adId → raw insights object
  loadingInsights: false,
  insightProgress: { done: 0, total: 0 },
  loadError: null,

  setAds: (ads) => set({ ads }),
  mergeInsights: (map) => set(s => ({ insightsMap: { ...s.insightsMap, ...map } })),
  setLoadingInsights: (b) => set({ loadingInsights: b }),
  setInsightProgress: (p) => set({ insightProgress: p }),
  setLoadError: (e) => set({ loadError: e }),

  // UI state
  activeTab: 'all',
  sortBy: 'spend-desc',
  searchQuery: '',
  selectedAdId: null,
  sidebarOpen: false,

  setActiveTab: (activeTab) => set({ activeTab }),
  setSortBy: (sortBy) => set({ sortBy }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setSelectedAdId: (selectedAdId) => set({ selectedAdId }),
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),

  // Derived: get normalized ads with insights merged
  getNormalizedAds: () => {
    const { ads, insightsMap } = get()
    return ads.map(ad => normalizeAd(ad, ad._permalink || {}, insightsMap[ad.id] || {}))
  },

  getFilteredAds: () => {
    const { activeTab, sortBy, searchQuery } = get()
    let list = get().getNormalizedAds()

    // Tab filter
    if (activeTab.startsWith('acc:')) list = list.filter(a => a.account === activeTab.slice(4))
    else if (activeTab.startsWith('prod:')) list = list.filter(a => a.product === activeTab.slice(5))

    // Search
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      list = list.filter(a =>
        [a.name, a.id, a.account, a.product, a.permalink].some(v => String(v || '').toLowerCase().includes(q))
      )
    }

    // Sort
    const [field, dir] = sortBy.split('-')
    list.sort((a, b) => dir === 'desc' ? (b[field] || 0) - (a[field] || 0) : (a[field] || 0) - (b[field] || 0))
    return list
  },
}))
