import React from 'react'
import ClubLogo from '@/components/ClubLogo'

type Props = {
  date: string
  homeTeam: string
  awayTeam: string
  homeTeamRelatiecode?: string
  awayTeamRelatiecode?: string
  isOwnHome?: boolean
  isOwnAway?: boolean
  isOwn?: boolean
  time?: string
  score?: string
  venue?: string
  status?: string
}

export default function MatchCard({
  date,
  homeTeam,
  awayTeam,
  homeTeamRelatiecode,
  awayTeamRelatiecode,
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
    <div className={`card-match card${isOwn ? ' card-match--own' : ''}`}>
      <div className="next-match-body">
        <div className="next-match-club">
          <ClubLogo clubcode={homeTeamRelatiecode} name={homeTeam} className="next-match-logo" />
          <span className={`next-match-club-name${isOwnHome ? ' next-match-club-name--own' : ''}`}>
            {homeTeam}
          </span>
        </div>

        <div className="next-match-info">
          <time className="next-match-date">{date}</time>
          {centerLabel && (
            <div className={score ? 'next-match-score' : 'next-match-time'}>{centerLabel}</div>
          )}
          {(venue || status) && (
            <div className="next-match-meta">
              {venue && <span>{venue}</span>}
              {status && <span>{status}</span>}
            </div>
          )}
        </div>

        <div className="next-match-club">
          <ClubLogo clubcode={awayTeamRelatiecode} name={awayTeam} className="next-match-logo" />
          <span className={`next-match-club-name${isOwnAway ? ' next-match-club-name--own' : ''}`}>
            {awayTeam}
          </span>
        </div>
      </div>
    </div>
  )
}
