import React from 'react'
import Link from 'next/link'
import type { MatchDto } from '@/lib/app-api/types'
import HeroMatchCard from '@/components/hero/HeroMatchCard'

/**
 * The first team's match in the hero: the match card, the place and, for an away match, a route
 * button. A home match without a pupil van de week uses it too.
 */
export default function HeroAwayCard({
  match,
  dayLabel,
  home = false,
}: {
  match: MatchDto
  dayLabel: string
  home?: boolean
}) {
  const cancelled = match.status === 'cancelled' || match.status === 'postponed'
  const route =
    !home && match.venue.mapsQuery
      ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(match.venue.mapsQuery)}`
      : null

  return (
    <div className="hero-side-card hero-away">
      <span className="hero-side-card__label">
        {home ? 'Eerste elftal speelt thuis' : 'Eerste elftal speelt uit'}
      </span>
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
