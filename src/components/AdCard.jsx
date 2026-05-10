import { useStore, extractIgShortcode } from '../store/useStore.js'
import { fmt } from '../utils/fmt.js'

function IgEmbed({ shortcode, name }) {
  return (
    <div style={{ position: 'relative', width: '100%', aspectRatio: '9/16', background: '#000', borderRadius: '12px 12px 0 0', overflow: 'hidden' }}>
      <iframe
        src={`https://www.instagram.com/p/${shortcode}/embed`}
        scrolling="no"
        frameBorder="0"
        allowFullScreen
        loading="lazy"
        title={name}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 0 }}
      />
    </div>
  )
}

function ImageThumb({ src, name }) {
  return (
    <div style={{ position: 'relative', width: '100%', aspectRatio: '9/16', background: '#111', borderRadius: '12px 12px 0 0', overflow: 'hidden' }}>
      <img
        src={src}
        alt={name}
        loading="lazy"
        decoding="async"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
        onError={e => { e.target.style.display = 'none' }}
      />
    </div>
  )
}

function NoMedia() {
  return (
    <div style={{ width: '100%', aspectRatio: '9/16', background: '#111', borderRadius: '12px 12px 0 0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#555', gap: 8 }}>
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none"><path d="M15 10l4.553-2.069A1 1 0 0121 8.87v6.26a1 1 0 01-1.447.9L15 14M3 8a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" stroke="#555" strokeWidth="1.5" strokeLinecap="round"/></svg>
      <span style={{ fontSize: '.72rem' }}>No creative</span>
    </div>
  )
}

export function AdCard({ ad }) {
  const setSelectedAdId = useStore(s => s.setSelectedAdId)
  const roasColor = ad.roas >= 2 ? '#34d399' : ad.roas >= 1 ? '#ffb84d' : '#ff4d4d'
  const sc = extractIgShortcode(ad.permalink) || ad.igShortcode
  const shareLink = ad.permalink || ''

  const media = sc
    ? <IgEmbed shortcode={sc} name={ad.name} />
    : ad.imageUrl
      ? <ImageThumb src={ad.imageUrl} name={ad.name} />
      : <NoMedia />

  return (
    <div
      style={{
        background: 'rgba(20,20,23,0.5)',
        backdropFilter: 'blur(16px)',
        borderRadius: 18,
        border: '1px solid rgba(255,255,255,0.06)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer',
        transition: 'transform .25s, border-color .25s',
      }}
      onClick={() => setSelectedAdId(ad.id)}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = 'rgba(216,180,254,0.4)' }}
      onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)' }}
    >
      {/* Media */}
      <div style={{ position: 'relative' }}>
        {media}
        {/* Badges */}
        <div style={{ position: 'absolute', top: 10, left: 10, display: 'flex', gap: 6, pointerEvents: 'none' }}>
          {ad.platform === 'Instagram' && (
            <span style={{ background: 'rgba(180,90,200,0.95)', color: '#fff', padding: '4px 8px', borderRadius: 8, fontWeight: 800, fontSize: '.7rem' }}>📷 IG</span>
          )}
          <span style={{ background: 'linear-gradient(90deg,#2ecc71,#20c997)', color: '#001214', padding: '5px 9px', borderRadius: 8, fontWeight: 800, fontSize: '.74rem' }}>
            ROAS {fmt.roas(ad.roas)}
          </span>
          <span style={{ background: 'rgba(0,0,0,0.7)', color: '#fff', padding: '5px 9px', borderRadius: 8, fontWeight: 800, fontSize: '.74rem', border: '1px solid rgba(255,255,255,0.1)' }}>
            {fmt.currency(ad.spend)}
          </span>
        </div>
        {shareLink && (
          <div style={{ position: 'absolute', top: 10, right: 10, pointerEvents: 'auto' }}>
            <a
              href={shareLink}
              target="_blank"
              rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
              style={{ background: 'rgba(0,0,0,0.6)', color: '#fff', padding: '5px 8px', borderRadius: 8, textDecoration: 'none', fontWeight: 800, fontSize: '.75rem', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              🔗 Open
            </a>
          </div>
        )}
      </div>

      {/* Info */}
      <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
        <div style={{ fontWeight: 800, fontSize: '.9rem', lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {ad.name}
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <span style={{ background: '#121212', padding: '4px 8px', borderRadius: 8, fontSize: '.7rem', color: '#a1a1aa', border: '1px solid #222' }}>{ad.product}</span>
          <span style={{ background: '#121212', padding: '4px 8px', borderRadius: 8, fontSize: '.7rem', color: '#a1a1aa', border: '1px solid #222' }}>{ad.status}</span>
        </div>

        {/* Metrics row */}
        {ad.hasInsights ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
            {[
              { label: 'CTR', value: fmt.percent(ad.ctr) },
              { label: 'CPC', value: fmt.currencyDecimal(ad.cpc) },
              { label: 'Impressions', value: fmt.compact(ad.imp) },
              { label: 'CPM', value: fmt.currency(ad.cpm) },
            ].map(({ label, value }) => (
              <div key={label} style={{ background: '#0d0d0d', padding: '8px 10px', borderRadius: 8 }}>
                <div style={{ fontSize: '.66rem', color: '#71717a' }}>{label}</div>
                <div style={{ fontWeight: 800, fontSize: '.9rem', color: '#d8b4fe', marginTop: 4 }}>{value}</div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ padding: '8px 10px', background: '#0d0d0d', borderRadius: 8, fontSize: '.75rem', color: '#555' }}>
            ⏳ Loading insights...
          </div>
        )}

        {/* ROAS bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
          <span style={{ fontSize: '.72rem', color: '#71717a', flexShrink: 0 }}>ROAS</span>
          <div style={{ flex: 1, height: 4, background: '#1a1a1a', borderRadius: 999, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${Math.min((ad.roas / 5) * 100, 100)}%`, background: roasColor, borderRadius: 999, transition: 'width .4s' }} />
          </div>
          <span style={{ fontSize: '.78rem', fontWeight: 800, color: roasColor, flexShrink: 0 }}>{fmt.roas(ad.roas)}</span>
        </div>
      </div>
    </div>
  )
}
