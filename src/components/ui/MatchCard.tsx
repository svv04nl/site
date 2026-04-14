import React from 'react'
import Link from 'next/link'
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
  href?: string
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
  href,
}: Props) {
  const centerLabel = score ?? time ?? ''
  const className = `card-match card${href ? ' card-match--clickable' : ''}`

  const body = (
    <div className="card-match-body">
      <div className="card-match-club">
        <ClubLogo clubcode={homeTeamRelatiecode} name={homeTeam} className="card-match-logo" />
        <span className={`card-match-club-name${isOwnHome ? ' card-match-club-name--own' : ''}`}>
          {homeTeam}
        </span>
      </div>

      <div className="card-match-info">
        <time className="card-match-date">{date}</time>
        {centerLabel && (
          <div className={score ? 'card-match-score' : 'card-match-time'}>{centerLabel}</div>
        )}
        {(venue || (status && status !== 'Te spelen' && status !== 'Uitgespeeld')) && (
          <div className="card-match-meta">
            {venue && <span>{venue}</span>}
            {status && status !== 'Te spelen' && status !== 'Uitgespeeld' && <span>{status}</span>}
          </div>
        )}
      </div>

      <div className="card-match-club">
        <ClubLogo clubcode={awayTeamRelatiecode} name={awayTeam} className="card-match-logo" />
        <span className={`card-match-club-name${isOwnAway ? ' card-match-club-name--own' : ''}`}>
          {awayTeam}
        </span>
      </div>
    </div>
  )

  if (href) {
    return (
      <Link href={href} className={className}>
        {body}
      </Link>
    )
  }

  return <div className={className}>{body}</div>
}
