import { useRef, useMemo } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import { AdCard } from './AdCard.jsx'

const CARD_WIDTH = 300
const GAP = 16

export function VirtualGrid({ ads }) {
  const parentRef = useRef(null)

  // Calculate columns based on container width
  const cols = useMemo(() => {
    if (typeof window === 'undefined') return 3
    const containerW = window.innerWidth - 40 // 20px padding each side
    return Math.max(1, Math.floor((containerW + GAP) / (CARD_WIDTH + GAP)))
  }, [])

  // Group ads into rows
  const rows = useMemo(() => {
    const result = []
    for (let i = 0; i < ads.length; i += cols) {
      result.push(ads.slice(i, i + cols))
    }
    return result
  }, [ads, cols])

  // Estimated row height: 9/16 aspect ratio card + ~180px info section
  const estimatedRowH = Math.floor(CARD_WIDTH * (16 / 9)) + 180

  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => document.scrollingElement,
    estimateSize: () => estimatedRowH + GAP,
    overscan: 3,
  })

  return (
    <div ref={parentRef}>
      <div style={{ height: virtualizer.getTotalSize(), position: 'relative' }}>
        {virtualizer.getVirtualItems().map(vRow => {
          const rowAds = rows[vRow.index]
          return (
            <div
              key={vRow.key}
              data-index={vRow.index}
              ref={virtualizer.measureElement}
              style={{
                position: 'absolute',
                top: vRow.start,
                left: 0,
                right: 0,
                display: 'grid',
                gridTemplateColumns: `repeat(${cols}, 1fr)`,
                gap: GAP,
                paddingBottom: GAP,
              }}
            >
              {rowAds.map(ad => <AdCard key={ad.id} ad={ad} />)}
            </div>
          )
        })}
      </div>
    </div>
  )
}
