import React from 'react'
import Link from 'next/link'
import ClubLogo from '@/components/ClubLogo'
import type { MatchData } from '@/components/NextMatchCard'

type Props = {
  match: MatchData
  /** Niet van het 1e elftal: wordt op kleine schermen verborgen. */
  secondary?: boolean
}

/**
 * Wedstrijdkaart voor de fixtures-strip op de homepage (donkere band). Zelfde opzet
 * als de MatchCard op de andere pagina's: thuisteam en uitteam links en rechts met
 * clublogo, datum en tijd in het midden. Het eigen team wordt rood gemarkeerd.
 * Losse presentational component, de data komt uit de FixturesStrip-container.
 */
export default function FixtureCard({ match, secondary }: Props) {
  const className = `fixture-card${secondary ? ' fixture-card--secondary' : ''}`
  const date = match.dateShort ?? match.date

  const inner = (
    <>
      <div className="fixture-card-club">
        <ClubLogo
          clubcode={match.homeTeam.clubRelatiecode}
          name={match.homeTeam.name}
          className="fixture-card-logo"
        />
        <span
          className={`fixture-card-team${match.homeTeam.isOwn ? ' fixture-card-team--own' : ''}`}
        >
          {match.homeTeam.name}
        </span>
      </div>

      <div className="fixture-card-info">
        <time className="fixture-card-date">{date}</time>
        <div className="fixture-card-time">{match.time}</div>
      </div>

      <div className="fixture-card-club">
        <ClubLogo
          clubcode={match.awayTeam.clubRelatiecode}
          name={match.awayTeam.name}
          className="fixture-card-logo"
        />
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
      <Link href={`/wedstrijd/${match.matchCode}`} className={`${className} fixture-card--clickable`}>
        {inner}
      </Link>
    )
  }

  return <div className={className}>{inner}</div>
}
