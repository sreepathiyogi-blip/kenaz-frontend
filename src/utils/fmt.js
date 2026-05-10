export const fmt = {
  currency: (v) => {
    try {
      return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Math.round(+v || 0))
    } catch { return `₹${Math.round(+v || 0)}` }
  },
  currencyDecimal: (v) => {
    try {
      return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(+v || 0)
    } catch { return `₹${(+v || 0).toFixed(2)}` }
  },
  number: (v) => {
    try { return new Intl.NumberFormat('en-IN').format(Math.round(+v || 0)) }
    catch { return String(Math.round(+v || 0)) }
  },
  compact: (v) => {
    const n = +v || 0
    if (n >= 1e7) return (n / 1e7).toFixed(2) + 'Cr'
    if (n >= 1e5) return (n / 1e5).toFixed(2) + 'L'
    if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K'
    return Math.round(n).toLocaleString('en-IN')
  },
  percent: (v) => `${(+v || 0).toFixed(2)}%`,
  roas: (v) => `${(+v || 0).toFixed(2)}x`,
  isoDate: () => new Date().toISOString().split('T')[0],
  daysAgo: (n) => {
    const d = new Date()
    return new Date(d - n * 86400000).toISOString().split('T')[0]
  },
}

export function getFatigue(ad) {
  const freq = ad.frequency || 0
  const cpm = ad.cpm || 0
  const ctr = ad.ctr || 0
  let score = 0
  if (freq >= 5) score += 3; else if (freq >= 3) score += 2; else if (freq >= 2) score += 1
  if (cpm >= 300) score += 2; else if (cpm >= 150) score += 1
  if (ctr < 0.5) score += 2; else if (ctr < 1.0) score += 1
  if (score >= 5) return { label: '🔴 Fatigued', color: '#ff4d4d' }
  if (score >= 3) return { label: '🟡 Watch', color: '#ffb84d' }
  return { label: '🟢 Fresh', color: '#34d399' }
}
