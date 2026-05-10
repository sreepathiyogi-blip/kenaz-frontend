import { fmt } from '../utils/fmt.js'

export function SummaryBar({ ads }) {
  if (!ads.length) return null

  const totalSpend = ads.reduce((s, a) => s + (a.spend || 0), 0)
  const totalRev = ads.reduce((s, a) => s + (a.rev || 0), 0)
  const totalPurchases = ads.reduce((s, a) => s + (a.purchases || 0), 0)
  const totalClicks = ads.reduce((s, a) => s + (a.clicks || 0), 0)
  const avgRoas = totalSpend > 0 ? totalRev / totalSpend : 0
  const avgCpc = totalClicks > 0 ? totalSpend / totalClicks : 0
  const avgCpa = totalPurchases > 0 ? totalSpend / totalPurchases : 0

  const roasColor = avgRoas >= 2 ? '#34d399' : avgRoas >= 1 ? '#ffb84d' : '#ff4d4d'

  const cards = [
    { label: 'Spend', value: fmt.currency(totalSpend) },
    { label: 'Revenue', value: fmt.currency(totalRev) },
    { label: 'ROAS', value: fmt.roas(avgRoas), color: roasColor },
    { label: 'Purchases', value: fmt.number(totalPurchases) },
    { label: 'Avg CPC', value: fmt.currencyDecimal(avgCpc) },
    { label: 'Avg CPA', value: fmt.currency(avgCpa) },
    { label: 'Total Ads', value: ads.length },
  ]

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(120px,1fr))', gap: 10, marginBottom: 16 }}>
      {cards.map(({ label, value, color }) => (
        <div
          key={label}
          style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.05)',
            borderRadius: 14,
            padding: '14px 16px',
          }}
        >
          <div style={{ fontSize: '.68rem', color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '.6px' }}>{label}</div>
          <div style={{ fontWeight: 900, fontSize: '1.2rem', marginTop: 6, color: color || '#f4f4f5' }}>{value}</div>
        </div>
      ))}
    </div>
  )
}
