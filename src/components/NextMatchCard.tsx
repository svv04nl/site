import React from 'react'
import Link from 'next/link'
import ClubLogo from '@/components/ClubLogo'

export type MatchData = {
  date: string // e.g. "ZA 5 APR"
  time: string // e.g. "14:30"
  matchCode?: number
  homeTeam: {
    name: string
    shortName?: string
    clubRelatiecode?: string
    isOwn?: boolean
    location: 'Thuis' | 'Uit'
  }
  awayTeam: {
    name: string
    shortName?: string
    clubRelatiecode?: string
    isOwn?: boolean
    location: 'Thuis' | 'Uit'
  }
}

type Props = {
  match?: MatchData | null
  teamName?: string
  showTitle?: boolean
}

function MatchCardContent({
  match,
  teamName,
  showTitle,
}: {
  match?: MatchData | null
  teamName?: string
  showTitle: boolean
}) {
  return (
    <>
      {showTitle && <h2 className="card-match-title">Volgende wedstrijd</h2>}
      {match ? (
        <div className="card-match-body">
          <div className="card-match-club">
            <ClubLogo
              clubcode={match.homeTeam.clubRelatiecode}
              name={match.homeTeam.name}
              className="card-match-logo"
            />
            <span className="card-match-club-name">{match.homeTeam.name}</span>
          </div>

          <div className="card-match-info">
            <time className="card-match-date">{match.date}</time>
            <div className="card-match-time">{match.time}</div>
          </div>

          <div className="card-match-club">
            <ClubLogo
              clubcode={match.awayTeam.clubRelatiecode}
              name={match.awayTeam.name}
              className="card-match-logo"
            />
            <span className="card-match-club-name">{match.awayTeam.name}</span>
          </div>
        </div>
      ) : (
        <p className="card-match-empty">
          {teamName ? `Nog geen wedstrijd gepland voor ${teamName}.` : 'Wedstrijdgegevens volgen.'}
        </p>
      )}
    </>
  )
}

export default function NextMatchCard({ match, teamName, showTitle = true }: Props) {
  const href = match?.matchCode ? `/wedstrijd/${match.matchCode}` : undefined

  if (href) {
    return (
      <Link href={href} className="card-match card card-match--clickable">
        <MatchCardContent match={match} teamName={teamName} showTitle={showTitle} />
      </Link>
    )
  }

  return (
    <div className="card-match card">
      <MatchCardContent match={match} teamName={teamName} showTitle={showTitle} />
    </div>
  )
}
