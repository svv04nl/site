import React from 'react'
import Link from 'next/link'

export type MatchData = {
  date: string        // e.g. "ZA 5 APR"
  time: string        // e.g. "14:30"
  homeTeam: {
    name: string
    shortName?: string
    logoUrl?: string
    isOwn?: boolean
    location: 'Thuis' | 'Uit'
  }
  awayTeam: {
    name: string
    shortName?: string
    logoUrl?: string
    isOwn?: boolean
    location: 'Thuis' | 'Uit'
  }
}

type Props = {
  match?: MatchData | null
  teamName?: string
  showTitle?: boolean
}

function ClubLogo({ name, logoUrl }: { name: string; logoUrl?: string }) {
  if (logoUrl) {
    return <img src={logoUrl} alt={name} className="next-match-logo" />
  }
  return (
    <div className="next-match-logo next-match-logo--placeholder">
      <img src="/logo.png" alt={name} />
    </div>
  )
}

export default function NextMatch({ match, teamName, showTitle = true }: Props) {
  return (
    <div className="next-match-card">
      {showTitle && <h2 className="next-match-title">Volgende wedstrijd</h2>}
      {match ? (
        <div className="next-match-body">
          <div className="next-match-club">
            <ClubLogo name={match.homeTeam.name} logoUrl={match.homeTeam.logoUrl} />
            <span className="next-match-club-name">{match.homeTeam.name}</span>
          </div>

          <div className="next-match-info">
            <time className="next-match-date">{match.date}</time>
            <div className="next-match-time">{match.time}</div>
          </div>

          <div className="next-match-club">
            <ClubLogo name={match.awayTeam.name} logoUrl={match.awayTeam.logoUrl} />
            <span className="next-match-club-name">{match.awayTeam.name}</span>
          </div>
        </div>
      ) : (
        <p className="next-match-empty">
          {teamName
            ? `Nog geen wedstrijd gepland voor ${teamName}.`
            : 'Wedstrijdgegevens volgen.'}
        </p>
      )}
    </div>
  )
}
