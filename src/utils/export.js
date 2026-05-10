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
  }))

  const ws = XLSX.utils.json_to_sheet(data)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Ads')
  XLSX.writeFile(wb, `kenaz_ads_${fmt.isoDate()}.xlsx`)
}
