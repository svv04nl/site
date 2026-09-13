'use client'

import React, { useEffect, useState } from 'react'

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

function shuffle(items: Logo[]): Logo[] {
  const result = [...items]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

export function SponsorsTickerTrack({ logos }: { logos: Logo[] }) {
  // Start with the server-rendered order to match SSR, then shuffle once the
  // component mounts in the browser so the order differs on every page load.
  const [order, setOrder] = useState(logos)

  useEffect(() => {
    setOrder(shuffle(logos))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const row = (copy: number) => (
    <div className="sponsors-ticker-inner" aria-hidden={copy > 0 || undefined}>
      {order.map((logo) => (
        <span key={`${copy}-${logo.src}`} className="sponsors-ticker-logo">
          <img src={logo.src} alt={copy === 0 ? logo.name : ''} />
        </span>
      ))}
    </div>
  )

  return (
    <div className="sponsors-ticker">
      <div
        className="sponsors-ticker-track"
        style={{ '--sponsors-copies': COPIES } as React.CSSProperties}
      >
        {Array.from({ length: COPIES }, (_, copy) => (
          <React.Fragment key={copy}>{row(copy)}</React.Fragment>
        ))}
      </div>
    </div>
  )
}
