import { useState, useEffect } from 'react'
import { useStore } from '../store/useStore.js'
import { useLoadAds } from '../hooks/useLoadAds.js'
import { fmt } from '../utils/fmt.js'

const inputStyle = {
  width: '100%', background: 'transparent', border: '1px solid #242424',
  color: '#f4f4f5', padding: '10px', borderRadius: 10, fontSize: '.9rem',
  outline: 'none', boxSizing: 'border-box',
}

const DATE_PRESETS = [
  { label: '7d', days: 7 },
  { label: '30d', days: 30 },
  { label: '60d', days: 60 },
  { label: '90d', days: 90 },
]

export function Sidebar() {
  const { token, accounts, dateRange, adStatus, sidebarOpen,
    setToken, setAccounts, setDateRange, setAdStatus, setSidebarOpen, setManualMap } = useStore()
  const { load, cancel } = useLoadAds()
  const loadingInsights = useStore(s => s.loadingInsights)
  const progress = useStore(s => s.insightProgress)
  const [activePreset, setActivePreset] = useState(30)
  const [localSince, setLocalSince] = useState(dateRange.since || fmt.daysAgo(30))
  const [localUntil, setLocalUntil] = useState(dateRange.until || fmt.isoDate())
  const [manualMapText, setManualMapText] = useState(localStorage.getItem('kenaz_permmap') || '')

  useEffect(() => {
    setDateRange({ since: localSince, until: localUntil })
  }, [localSince, localUntil])

  const applyPreset = (days) => {
    setActivePreset(days)
    setLocalSince(fmt.daysAgo(days))
    setLocalUntil(fmt.isoDate())
  }

  const handleLoad = () => {
    // Parse manual map
    const map = {}
    manualMapText.split(/\r?\n/).forEach(line => {
      const idx = line.indexOf('|')
      if (idx === -1) return
      const key = line.slice(0, idx).trim()
      const url = line.slice(idx + 1).trim()
      if (key && url) map[key] = url
    })
    setManualMap(map)
    localStorage.setItem('kenaz_permmap', manualMapText)
    setAccounts(accounts)
    setSidebarOpen(false)
    load()
  }

  if (!sidebarOpen) return null

  return (
    <>
      {/* Overlay */}
      <div
        onClick={() => setSidebarOpen(false)}
        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 70, backdropFilter: 'blur(2px)' }}
      />

      {/* Sidebar panel */}
      <aside style={{
        position: 'fixed', right: 0, top: 0, width: 360, maxWidth: '100vw', height: '100vh',
        background: 'rgba(9,9,11,0.95)', backdropFilter: 'blur(24px)',
        borderLeft: '1px solid rgba(255,255,255,0.08)', zIndex: 80,
        overflowY: 'auto', display: 'flex', flexDirection: 'column',
        boxShadow: '-8px 0 40px rgba(0,0,0,0.6)',
      }}>
        <div style={{ padding: '18px 20px 14px', borderBottom: '1px solid #1e1e1e', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, background: '#141414', zIndex: 5 }}>
          <span style={{ fontWeight: 800, fontSize: '1.05rem' }}>Settings</span>
          <button onClick={() => setSidebarOpen(false)} style={{ background: 'none', border: 0, color: '#f4f4f5', fontSize: '1.4rem', cursor: 'pointer' }}>×</button>
        </div>

        <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Token */}
          <label style={{ display: 'block' }}>
            <span style={{ fontSize: '.76rem', color: '#a1a1aa', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.6px', display: 'block', marginBottom: 6 }}>Access Token</span>
            <input type="password" style={inputStyle} value={token} onChange={e => setToken(e.target.value)} placeholder="EAAHe..." autoComplete="off" />
          </label>

          {/* Accounts */}
          <label style={{ display: 'block' }}>
            <span style={{ fontSize: '.76rem', color: '#a1a1aa', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.6px', display: 'block', marginBottom: 6 }}>Ad Account IDs</span>
            <textarea
              style={{ ...inputStyle, resize: 'vertical' }}
              rows={4}
              value={accounts}
              onChange={e => setAccounts(e.target.value)}
              placeholder={'act_123456789\nact_987654321'}
            />
            <span style={{ fontSize: '.74rem', color: '#52525b', marginTop: 4, display: 'block' }}>One per line or comma-separated</span>
          </label>

          {/* Date presets */}
          <div>
            <span style={{ fontSize: '.76rem', color: '#a1a1aa', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.6px', display: 'block', marginBottom: 8 }}>Date Range</span>
            <div style={{ display: 'flex', gap: 6, marginBottom: 8, flexWrap: 'wrap' }}>
              {DATE_PRESETS.map(({ label, days }) => (
                <button
                  key={days}
                  onClick={() => applyPreset(days)}
                  style={{
                    padding: '6px 12px', borderRadius: 999, border: '1px solid #2b2b2b',
                    background: activePreset === days ? '#d8b4fe' : '#222',
                    color: activePreset === days ? '#001018' : '#f4f4f5',
                    fontWeight: 700, cursor: 'pointer', fontSize: '.82rem',
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <input type="date" style={inputStyle} value={localSince} onChange={e => { setLocalSince(e.target.value); setActivePreset(null) }} />
              <input type="date" style={inputStyle} value={localUntil} onChange={e => { setLocalUntil(e.target.value); setActivePreset(null) }} />
            </div>
          </div>

          {/* Status */}
          <label style={{ display: 'block' }}>
            <span style={{ fontSize: '.76rem', color: '#a1a1aa', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.6px', display: 'block', marginBottom: 6 }}>Ad Status</span>
            <select style={{ ...inputStyle, cursor: 'pointer' }} value={adStatus} onChange={e => setAdStatus(e.target.value)}>
              <option value="ACTIVE">Active Only</option>
              <option value="PAUSED">Paused Only</option>
              <option value="">All</option>
            </select>
          </label>

          {/* Manual permalink map */}
          <label style={{ display: 'block' }}>
            <span style={{ fontSize: '.76rem', color: '#a1a1aa', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.6px', display: 'block', marginBottom: 6 }}>Manual Permalink Map</span>
            <textarea
              style={{ ...inputStyle, resize: 'vertical', fontSize: '.78rem' }}
              rows={4}
              value={manualMapText}
              onChange={e => setManualMapText(e.target.value)}
              placeholder={'adId|https://instagram.com/p/xxx\nadName|https://...'}
            />
            <span style={{ fontSize: '.74rem', color: '#52525b', marginTop: 4, display: 'block' }}>Format: adId|permalink</span>
          </label>

          {/* Progress indicator */}
          {loadingInsights && (
            <div style={{ background: '#0d0d0d', border: '1px solid #1a1a1a', padding: '12px', borderRadius: 10 }}>
              <div style={{ fontSize: '.78rem', color: '#a1a1aa', marginBottom: 8 }}>
                Fetching insights {progress.done} / {progress.total || '?'}
              </div>
              <div style={{ height: 4, background: '#1a1a1a', borderRadius: 999, overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  width: progress.total ? `${(progress.done / progress.total) * 100}%` : '0%',
                  background: '#d8b4fe',
                  borderRadius: 999,
                  transition: 'width .3s',
                }} />
              </div>
            </div>
          )}

          {/* Load button */}
          <button
            onClick={loadingInsights ? cancel : handleLoad}
            style={{
              width: '100%', padding: 12, borderRadius: 12, border: 0,
              background: loadingInsights ? 'linear-gradient(90deg,#555,#666)' : 'linear-gradient(90deg,#ef4444,#f87171)',
              color: '#fff', fontWeight: 800, cursor: 'pointer', fontSize: '1rem',
              marginTop: 4,
            }}
          >
            {loadingInsights ? '⏹ Cancel Load' : '🚀 Load All Ads'}
          </button>
        </div>
      </aside>
    </>
  )
}
