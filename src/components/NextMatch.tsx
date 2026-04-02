import React from 'react'
import Link from 'next/link'
import ClubLogo from '@/components/ClubLogo'

export type MatchData = {
  date: string // e.g. "ZA 5 APR"
  time: string // e.g. "14:30"
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

export default function NextMatch({ match, teamName, showTitle = true }: Props) {
  return (
    <div className="card-match card">
      {showTitle && <h2 className="next-match-title">Volgende wedstrijd</h2>}
      {match ? (
        <div className="next-match-body">
          <div className="next-match-club">
            <ClubLogo
              clubcode={match.homeTeam.clubRelatiecode}
              name={match.homeTeam.name}
              className="next-match-logo"
            />
            <span className="next-match-club-name">{match.homeTeam.name}</span>
          </div>

          <div className="next-match-info">
            <time className="next-match-date">{match.date}</time>
            <div className="next-match-time">{match.time}</div>
          </div>

          <div className="next-match-club">
            <ClubLogo
              clubcode={match.awayTeam.clubRelatiecode}
              name={match.awayTeam.name}
              className="next-match-logo"
            />
            <span className="next-match-club-name">{match.awayTeam.name}</span>
          </div>
        </div>
      ) : (
        <p className="next-match-empty">
          {teamName ? `Nog geen wedstrijd gepland voor ${teamName}.` : 'Wedstrijdgegevens volgen.'}
        </p>
      )}
    </div>
  )
}
