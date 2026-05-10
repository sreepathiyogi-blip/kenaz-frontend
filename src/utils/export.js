import * as XLSX from 'xlsx'
import { fmt } from './fmt.js'

export function exportToExcel(ads) {
  const data = ads.map(a => ({
    'Ad ID': a.id,
    'Ad Name': a.name,
    'Ad Link': a.permalink || '',
    'Status': a.status,
    'Platform': a.platform,
    'Product': a.product,
    'Spend': a.spend?.toFixed(2) || '0.00',
    'Revenue': a.rev?.toFixed(2) || '0.00',
    'ROAS': a.roas?.toFixed(2) || '0.00',
    'Impressions': a.imp || 0,
    'Clicks': a.clicks || 0,
    'CTR%': a.ctr?.toFixed(2) || '0.00',
    'CPC': a.cpc?.toFixed(2) || '0.00',
    'CPM': a.cpm?.toFixed(2) || '0.00',
    'Purchases': a.purchases || 0,
    'Cost per Purchase': a.cpp?.toFixed(2) || '0.00',
    'Reach': a.reach || 0,
    'Frequency': a.frequency?.toFixed(2) || '0.00',
    '3s Views': a.v3sec || 0,
    'Thruplays': a.thruplay || 0,
    '100% Views': a.p100 || 0,
    'Hook Rate%': a.hookRate?.toFixed(2) || '0.00',
    'Hold Rate%': a.holdRate?.toFixed(2) || '0.00',
    'Completion Rate%': a.completionRate?.toFixed(2) || '0.00',
    'LPV': a.lpv || 0,
    'ATC': a.atc || 0,
    'LC→LPV%': a.lc2lpv?.toFixed(2) || '0.00',
    'LPV→ATC%': a.lpv2atc?.toFixed(2) || '0.00',
    'ATC→CI%': a.atc2ci?.toFixed(2) || '0.00',
    'CI→Order%': a.ci2order?.toFixed(2) || '0.00',
  }))

  const ws = XLSX.utils.json_to_sheet(data)

  // Auto-fit column widths
  const cols = Object.keys(data[0] || {}).map(key => ({
    wch: Math.max(key.length, ...data.map(row => String(row[key] || '').length)) + 2
  }))
  ws['!cols'] = cols

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Ads')
  XLSX.writeFile(wb, `kenaz_ads_${fmt.isoDate()}.xlsx`)
}
