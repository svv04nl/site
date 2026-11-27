'use client'

import React, { useEffect, useMemo, useRef } from 'react'
import { seededShuffle, usePageSeed } from '@/lib/use-client-value'

type Logo = { src: string; name: string }

/**
 * Number of identical copies of the logo row in the track. The marquee moves
 * left by exactly one copy and loops, which only looks seamless while the
 * remaining copies keep the viewport filled. With few logos one copy is
 * narrower than a wide screen, so we need several copies: the visible window
 * must never exceed (COPIES - 1) copy-widths. The CSS reads this via
 * `--sponsors-copies` to translate by exactly one copy (`-100% / COPIES`),
 * keeping the two in sync.
 */
const COPIES = 4

/** Scroll speed in px per second, the same on every screen and for any number of logos. */
const SPEED = 60

export function SponsorsTickerTrack({ logos }: { logos: Logo[] }) {
  // The server-rendered order during SSR and hydration, then an order that differs per page
  // load (and stays the same while the page is open).
  const seed = usePageSeed()
  const order = useMemo(() => (seed ? seededShuffle(logos, seed) : logos), [logos, seed])

  const row = (copy: number) => (
    <div className="sponsors-ticker-inner" aria-hidden={copy > 0 || undefined}>
      {order.map((logo) => (
        <span key={`${copy}-${logo.src}`} className="sponsors-ticker-logo">
          <img src={logo.src} alt={copy === 0 ? logo.name : ''} />
        </span>
      ))}
    </div>
  )

  // A first guess for the server render: ~5.3s per logo. Once the logos are on screen the
  // duration is set from the real width of one copy, so the speed no longer depends on how
  // many logos there are or how wide they are. A fixed guess made the bar crawl with only a
  // few logos, and on a phone, where the logos are smaller.
  const duration = Math.min(320, Math.max(30, order.length * 5.3))
  const trackRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const track = trackRef.current
    if (!track) {
      return
    }
    const update = () => {
      const copyWidth = track.scrollWidth / COPIES
      if (copyWidth > 0) {
        track.style.setProperty('--sponsors-duration', `${(copyWidth / SPEED).toFixed(1)}s`)
      }
    }
    update()
    // Logos that load later, and a turned phone, change the width.
    const observer = new ResizeObserver(update)
    observer.observe(track)
    return () => observer.disconnect()
  }, [order])

  return (
    <div className="sponsors-ticker">
      <div
        ref={trackRef}
        className="sponsors-ticker-track"
        style={
          {
            '--sponsors-copies': COPIES,
            '--sponsors-duration': `${duration}s`,
          } as React.CSSProperties
        }
      >
        {Array.from({ length: COPIES }, (_, copy) => (
          <React.Fragment key={copy}>{row(copy)}</React.Fragment>
        ))}
      </div>
    </div>
  )
}
