import React from 'react'
import Link from 'next/link'

type Props = {
  /** Omit when the card sits under a heading that already shows the day. */
  date?: string
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
  /** Small line under the home / away club, e.g. "Kleedkamer 3". */
  homeNote?: string
  awayNote?: string
  /** "Thuis" or "Uit". Derived from isOwnHome/isOwnAway when omitted. */
  location?: 'Thuis' | 'Uit' | null
  href?: string
}

// First two letters of the first word, for clubs without a logo.
function initials(name: string): string {
  return name.trim().split(/\s+/)[0].slice(0, 2).toUpperCase()
}

function Club({
  name,
  clubcode,
  own,
  note,
}: {
  name: string
  clubcode?: string
  own?: boolean
  note?: string
}) {
  return (
    <div className="match-card-club">
      {clubcode ? (
        <img
          src={`https://logoapi.voetbal.nl/logo.php?clubcode=${clubcode}`}
          alt={name}
          className="match-card-logo"
        />
      ) : (
        <span className="match-card-logo match-card-logo--initials" aria-hidden="true">
          {initials(name)}
        </span>
      )}
      <span className={`match-card-team${own ? ' match-card-team--own' : ''}`}>{name}</span>
      {note && <span className="match-card-note">{note}</span>}
    </div>
  )
}

/**
 * The match card used across the site (homepage band, programma, team pages):
 * home club left, away club right, date, time or score and home/away in the
 * middle. The own club is marked red; clubs without a logo get their initials.
 */
export default function MatchCard({
  date,
  homeTeam,
  awayTeam,
  homeTeamRelatiecode,
  awayTeamRelatiecode,
  isOwnHome,
  isOwnAway,
  time,
  score,
  venue,
  status,
  homeNote,
  awayNote,
  location,
  href,
}: Props) {
  const centerLabel = score ?? time ?? ''
  const where = location !== undefined ? location : isOwnHome ? 'Thuis' : isOwnAway ? 'Uit' : null
  const showStatus = status && status !== 'Te spelen' && status !== 'Uitgespeeld'
  const className = `match-card${href ? ' match-card--clickable' : ''}`

  const body = (
    <>
      <Club name={homeTeam} clubcode={homeTeamRelatiecode} own={isOwnHome} note={homeNote} />

      <div className="match-card-info">
        {date && <time className="match-card-date">{date}</time>}
        {centerLabel && (
          <div
            className={`match-card-time${/\d/.test(centerLabel) ? '' : ' match-card-time--text'}`}
          >
            {centerLabel}
          </div>
        )}
        {where && <span className="match-card-location">{where}</span>}
        {(venue || showStatus) && (
          <div className="match-card-meta">
            {venue && <span>{venue}</span>}
            {showStatus && <span>{status}</span>}
          </div>
        )}
      </div>

      <Club name={awayTeam} clubcode={awayTeamRelatiecode} own={isOwnAway} note={awayNote} />
    </>
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
