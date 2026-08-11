import React from 'react'
import Link from 'next/link'
import type { MatchData } from '@/components/NextMatchCard'

type Props = {
  match: MatchData
}

/**
 * Compacte wedstrijdkaart voor de fixtures-strip op de homepage (donkere band).
 * Toont een meta-regel (datum · tijd · thuis/uit) met daaronder de twee teams,
 * waarbij het eigen team rood wordt gemarkeerd. Losse presentational component —
 * de data komt uit de FixturesStrip-container.
 */
export default function FixtureCard({ match }: Props) {
  const ownIsHome = match.homeTeam.isOwn
  const location = ownIsHome ? 'Thuis' : 'Uit'
  const date = (match.dateShort ?? match.date).toUpperCase()

  const inner = (
    <>
      <div className="fixture-card-meta">
        {date} · {match.time} · {location}
      </div>
      <div className="fixture-card-teams">
        <span
          className={`fixture-card-team${match.homeTeam.isOwn ? ' fixture-card-team--own' : ''}`}
        >
          {match.homeTeam.name}
        </span>
        <span
          className={`fixture-card-team${match.awayTeam.isOwn ? ' fixture-card-team--own' : ''}`}
        >
          {match.awayTeam.name}
        </span>
      </div>
    </>
  )

  if (match.matchCode) {
    return (
      <Link href={`/wedstrijd/${match.matchCode}`} className="fixture-card fixture-card--clickable">
        {inner}
      </Link>
    )
  }

  return <div className="fixture-card">{inner}</div>
}
