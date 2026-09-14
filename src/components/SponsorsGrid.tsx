'use client'

import React, { useEffect, useState } from 'react'

type GridSponsor = { id: string | number; name: string; url?: string | null; logoUrl?: string | null }

function shuffle(items: GridSponsor[]): GridSponsor[] {
  const result = [...items]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

export function SponsorsGrid({ sponsors }: { sponsors: GridSponsor[] }) {
  // Start with the server-rendered order to match SSR, then shuffle once the
  // component mounts in the browser so the order differs on every page load.
  const [order, setOrder] = useState(sponsors)

  useEffect(() => {
    setOrder(shuffle(sponsors))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="sponsors-grid">
      {order.map((sponsor) =>
        sponsor.url ? (
          <a
            key={sponsor.id}
            className="sponsors-grid-card"
            href={sponsor.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            {sponsor.logoUrl ? (
              <img src={sponsor.logoUrl} alt={sponsor.name} />
            ) : (
              <span className="sponsors-grid-name">{sponsor.name}</span>
            )}
          </a>
        ) : (
          <div key={sponsor.id} className="sponsors-grid-card">
            {sponsor.logoUrl ? (
              <img src={sponsor.logoUrl} alt={sponsor.name} />
            ) : (
              <span className="sponsors-grid-name">{sponsor.name}</span>
            )}
          </div>
        ),
      )}
    </div>
  )
}
