import { useMemo, useState } from 'react'
import { useStore } from './store/useStore.js'
import { Sidebar } from './components/Sidebar.jsx'
import { SummaryBar } from './components/SummaryBar.jsx'
import { VirtualGrid } from './components/VirtualGrid.jsx'
import { exportToExcel } from './utils/export.js'

const SORTS = [
  { value: 'spend-desc', label: 'Spend ↓' },
  { value: 'spend-asc', label: 'Spend ↑' },
  { value: 'roas-desc', label: 'ROAS ↓' },
  { value: 'roas-asc', label: 'ROAS ↑' },
  { value: 'cpc-asc', label: 'CPC ↑' },
  { value: 'purchases-desc', label: 'Purchases ↓' },
  { value: 'ctr-desc', label: 'CTR ↓' },
]

export default function App() {
  const {
    ads, loadingInsights, insightProgress, loadError,
    activeTab, sortBy, searchQuery,
    setActiveTab, setSortBy, setSearchQuery, setSidebarOpen,
    getFilteredAds, getNormalizedAds,
  } = useStore()

  const filtered = useMemo(() => getFilteredAds(), [ads, useStore.getState().insightsMap, activeTab, sortBy, searchQuery])
  const allNormalized = useMemo(() => getNormalizedAds(), [ads, useStore.getState().insightsMap])

  // Tabs: All + unique products
  const products = useMemo(() => [...new Set(allNormalized.map(a => a.product))].sort(), [allNormalized])
  const accounts = useMemo(() => [...new Set(ads.map(a => a.account))], [ads])

  const tabs = useMemo(() => [
    { key: 'all', label: `All (${ads.length})` },
    ...accounts.map(acc => ({ key: `acc:${acc}`, label: `${acc.replace('act_', '').slice(0, 8)} (${allNormalized.filter(a => a.account === acc).length})` })),
    ...products.map(p => ({ key: `prod:${p}`, label: `${p} (${allNormalized.filter(a => a.product === p).length})` })),
  ], [ads.length, products, accounts, allNormalized])

  return (
    <div style={{ minHeight: '100vh', color: '#f4f4f5' }}>
      {/* Header */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 40,
        background: 'rgba(9,9,11,0.75)', backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <div style={{ fontWeight: 800, color: '#d8b4fe', fontSize: '1.1rem', flexShrink: 0 }}>Kenaz Ad Studio</div>

        {/* Search */}
        <div style={{
          flex: 1, maxWidth: 500, display: 'flex', alignItems: 'center',
          background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 999, padding: '4px 12px', gap: 8,
        }}>
          <input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by name, id, product..."
            style={{ flex: 1, background: 'transparent', border: 0, color: '#f4f4f5', fontSize: '.9rem', outline: 'none', padding: '6px 0' }}
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} style={{ background: 'none', border: 0, color: '#71717a', cursor: 'pointer', fontSize: '1rem' }}>✕</button>
          )}
        </div>

        {/* Status pill */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(24,24,27,0.7)', border: '1px solid #242424', padding: '6px 12px', borderRadius: 999, color: '#a1a1aa', fontSize: '.85rem', flexShrink: 0 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: loadingInsights ? '#ff9800' : '#34d399', display: 'inline-block' }} />
          {loadingInsights
            ? `Insights ${insightProgress.done}/${insightProgress.total || '?'}`
            : ads.length ? `${ads.length} ads` : 'Ready'}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 8, marginLeft: 'auto', flexShrink: 0 }}>
          {ads.length > 0 && (
            <button
              onClick={() => exportToExcel(filtered)}
              style={{ padding: '8px 14px', borderRadius: 10, background: 'rgba(255,255,255,0.05)', border: '1px solid #222', color: '#f4f4f5', cursor: 'pointer', fontWeight: 700, fontSize: '.85rem' }}
            >
              ↓ Excel
            </button>
          )}
          <button
            onClick={() => setSidebarOpen(true)}
            style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(255,255,255,0.05)', border: '1px solid #222', color: '#f4f4f5', cursor: 'pointer', fontSize: '1.1rem' }}
            title="Settings"
          >
            ⚙
          </button>
        </div>
      </header>

      <Sidebar />

      {/* Main content */}
      <main style={{ maxWidth: 1400, margin: '0 auto', padding: '18px 20px' }}>

        {/* Error */}
        {loadError && (
          <div style={{ background: '#1a0000', border: '1px solid #ff4d4d', borderRadius: 12, padding: '16px 20px', marginBottom: 16, color: '#ff4d4d' }}>
            <strong>Error:</strong> {loadError}
            <br />
            <button onClick={() => setSidebarOpen(true)} style={{ marginTop: 10, padding: '6px 14px', background: '#ff4d4d', border: 0, borderRadius: 8, color: '#fff', cursor: 'pointer', fontWeight: 700 }}>
              Open Settings
            </button>
          </div>
        )}

        {/* Empty state */}
        {!ads.length && !loadError && (
          <div style={{ textAlign: 'center', padding: '80px 20px', color: '#52525b' }}>
            <div style={{ fontSize: '3rem', marginBottom: 12 }}>📊</div>
            <h3 style={{ color: '#71717a', marginBottom: 8 }}>No ads loaded yet</h3>
            <p style={{ marginBottom: 20 }}>Open Settings, add your token and account IDs, then hit Load.</p>
            <button
              onClick={() => setSidebarOpen(true)}
              style={{ padding: '10px 24px', background: '#d8b4fe', border: 0, borderRadius: 12, color: '#001018', fontWeight: 800, cursor: 'pointer', fontSize: '1rem' }}
            >
              Open Settings
            </button>
          </div>
        )}

        {ads.length > 0 && (
          <>
            {/* Summary */}
            <SummaryBar ads={filtered} />

            {/* Toolbar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
              {/* Tabs */}
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', flex: 1 }}>
                {tabs.map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    style={{
                      padding: '6px 12px', borderRadius: 999, border: '1px solid #242424',
                      background: activeTab === tab.key ? 'linear-gradient(90deg,#d8b4fe,#5eb3ff)' : 'transparent',
                      color: activeTab === tab.key ? '#001018' : '#f4f4f5',
                      fontWeight: 700, cursor: 'pointer', fontSize: '.8rem',
                      boxShadow: activeTab === tab.key ? '0 0 14px rgba(216,180,254,0.35)' : 'none',
                    }}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Sort */}
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                style={{ background: '#121212', border: '1px solid #242424', padding: '7px 12px', borderRadius: 8, color: '#f4f4f5', fontWeight: 700, cursor: 'pointer', fontSize: '.85rem' }}
              >
                {SORTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>

            {/* Grid */}
            {filtered.length > 0
              ? <VirtualGrid ads={filtered} />
              : <div style={{ textAlign: 'center', padding: 60, color: '#52525b' }}>No ads match your filters.</div>
            }
          </>
        )}
      </main>
    </div>
  )
}
