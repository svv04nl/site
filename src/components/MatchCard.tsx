import React from 'react'

type Props = {
  date: string
  homeTeam: string
  awayTeam: string
  homeTeamLogo?: string
  awayTeamLogo?: string
  isOwnHome?: boolean
  isOwnAway?: boolean
  isOwn?: boolean
  time?: string
  score?: string
  venue?: string
  status?: string
}

function TeamLogo({ name, logoUrl }: { name: string; logoUrl?: string }) {
  if (logoUrl) {
    return <img src={logoUrl} alt={name} className="next-match-logo" />
  }
  return (
    <div className="next-match-logo next-match-logo--placeholder">
      <img src="/logo.png" alt={name} />
    </div>
  )
}

export default function MatchCard({
  date,
  homeTeam,
  awayTeam,
  homeTeamLogo,
  awayTeamLogo,
  isOwnHome,
  isOwnAway,
  isOwn,
  time,
  score,
  venue,
  status,
}: Props) {
  const centerLabel = score ?? time ?? ''

  return (
    <div className={`next-match-card${isOwn ? ' next-match-card--own' : ''}`}>
      <div className="next-match-body">
        <div className="next-match-club">
          <TeamLogo name={homeTeam} logoUrl={homeTeamLogo} />
          <span className={`next-match-club-name${isOwnHome ? ' next-match-club-name--own' : ''}`}>
            {homeTeam}
          </span>
        </div>

        <div className="next-match-info">
          <time className="next-match-date">{date}</time>
          {centerLabel && (
            <div className={score ? 'next-match-score' : 'next-match-time'}>
              {centerLabel}
            </div>
          )}
          {(venue || status) && (
            <div className="next-match-meta">
              {venue && <span>{venue}</span>}
              {status && <span>{status}</span>}
            </div>
          )}
        </div>

        <div className="next-match-club">
          <TeamLogo name={awayTeam} logoUrl={awayTeamLogo} />
          <span className={`next-match-club-name${isOwnAway ? ' next-match-club-name--own' : ''}`}>
            {awayTeam}
          </span>
        </div>
      </div>
    </div>
  )
}
