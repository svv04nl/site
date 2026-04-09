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
        {(venue || (status && status !== 'Te spelen' && status !== 'Uitgespeeld')) && (
          <div className="next-match-meta">
            {venue && <span>{venue}</span>}
            {status && status !== 'Te spelen' && status !== 'Uitgespeeld' && <span>{status}</span>}
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
