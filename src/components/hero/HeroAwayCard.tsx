import React from 'react'
import Link from 'next/link'
import type { MatchDto, MatchTeamDto } from '@/lib/app-api/types'

// First two letters of the first word, for clubs without a logo (as on the match cards).
const initials = (name: string) => name.trim().split(/\s+/)[0].slice(0, 2).toUpperCase()

function Club({ team }: { team: MatchTeamDto }) {
  return (
    <span className="hero-away__club">
      {team.logoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img className="hero-away__logo" src={team.logoUrl} alt="" />
      ) : (
        <span className="hero-away__logo hero-away__logo--initials" aria-hidden="true">
          {initials(team.name)}
        </span>
      )}
      <span className={`hero-away__name${team.isOwn ? ' hero-away__name--own' : ''}`}>
        {team.name}
      </span>
    </span>
  )
}

/** The first team's away match in the homepage hero: time, place and a route button. */
export default function HeroAwayCard({ match, dayLabel }: { match: MatchDto; dayLabel: string }) {
  const cancelled = match.status === 'cancelled' || match.status === 'postponed'
  const route = match.venue.mapsQuery
    ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(match.venue.mapsQuery)}`
    : null

  return (
    <div className="hero-side-card hero-away">
      <span className="hero-side-card__label">Eerste elftal speelt uit</span>
      <div className="hero-away__teams">
        <Club team={match.home} />
        <span className="hero-away__when">
          {cancelled ? (
            <span className="hero-away__cancelled">
              {match.status === 'postponed' ? 'Uitgesteld' : 'Afgelast'}
            </span>
          ) : (
            <span className="hero-away__time">{match.kickoff}</span>
          )}
          <span className="hero-away__day">{dayLabel}</span>
        </span>
        <Club team={match.away} />
      </div>
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
