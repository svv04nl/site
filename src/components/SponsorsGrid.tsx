'use client'

import React, { useMemo } from 'react'
import { seededShuffle, usePageSeed } from '@/lib/use-client-value'

type GridSponsor = { id: string | number; name: string; url?: string | null; logoUrl: string }

export function SponsorsGrid({ sponsors }: { sponsors: GridSponsor[] }) {
  // The server-rendered order during SSR and hydration, then an order that differs per page
  // load (and stays the same while the page is open).
  const seed = usePageSeed()
  const order = useMemo(() => (seed ? seededShuffle(sponsors, seed) : sponsors), [sponsors, seed])

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
            <img src={sponsor.logoUrl} alt={sponsor.name} />
          </a>
        ) : (
          <div key={sponsor.id} className="sponsors-grid-card">
            <img src={sponsor.logoUrl} alt={sponsor.name} />
          </div>
        ),
      )}
    </div>
  )
}
