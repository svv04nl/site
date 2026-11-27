import React from 'react'
import Link from 'next/link'
import type { MatchDto } from '@/lib/app-api/types'
import HeroMatchCard from '@/components/hero/HeroMatchCard'

/** The first team's away match in the hero: the match card, the place and a route button. */
export default function HeroAwayCard({ match, dayLabel }: { match: MatchDto; dayLabel: string }) {
  const cancelled = match.status === 'cancelled' || match.status === 'postponed'
  const route = match.venue.mapsQuery
    ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(match.venue.mapsQuery)}`
    : null

  return (
    <div className="hero-side-card hero-away">
      <span className="hero-side-card__label">Eerste elftal speelt uit</span>
      <HeroMatchCard match={match} dayLabel={dayLabel} />
      {match.venue.name && <p className="hero-away__venue">{match.venue.name}</p>}
      {!cancelled && (
        <div className="hero-away__actions">
          {route && (
            <a className="btn btn--primary" href={route} target="_blank" rel="noopener noreferrer">
              Route
            </a>
          )}
          <Link className="btn btn--outline-dark" href={`/wedstrijd/${match.id}`}>
            Wedstrijdinfo
          </Link>
        </div>
      )}
      <p className="hero-away__cheer">Kom ons aanmoedigen!</p>
    </div>
  )
}
