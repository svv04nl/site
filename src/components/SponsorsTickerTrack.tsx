'use client'

import React, { useMemo } from 'react'
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

  // Duration scales with the number of logos so the scroll speed (px/sec)
  // stays roughly constant regardless of how many sponsors are in the CMS —
  // otherwise a fixed duration makes the ticker race by as sponsors are added.
  // ~5.3s per logo gives roughly 70px/sec with the current logo size (88px high).
  const duration = Math.min(320, Math.max(30, order.length * 5.3))

  return (
    <div className="sponsors-ticker">
      <div
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
