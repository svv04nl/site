'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import type { ResultMatch } from '@/lib/clubdata/transform'
import MatchCard from '@/components/ui/MatchCard'
import ClubLogo from '@/components/ClubLogo'

// A played match shows its score; anything else (afgelast, uitgesteld, ...) shows
// its status in the same place.
function resultOf(m: ResultMatch): string {
  const played = !m.status || m.status.toLowerCase() === 'uitgespeeld'
  return played ? m.score : m.status
}

// The logo always sits next to the score: right of the home team, left of the away team.
function Team({
  name,
  clubcode,
  own,
  side,
}: {
  name: string
  clubcode?: string
  own: boolean
  side: 'home' | 'away'
}) {
  const logo = <ClubLogo clubcode={clubcode} name={name} className="league-schedule-logo" />
  const label = <span className={own ? 'league-schedule-own-name' : undefined}>{name}</span>
  return (
    <span className="league-schedule-team-cell">
      {side === 'home' ? (
        <>
          {label}
          {logo}
        </>
      ) : (
        <>
          {logo}
          {label}
        </>
      )}
    </span>
  )
}

/**
 * Results of one day of a poule or cup (the date is the heading above it): a table on large screens, match cards on small ones
 * (same pattern as the programma, see ScheduleWeekGroups).
 */
export default function ResultsList({ matches }: { matches: ResultMatch[] }) {
  const router = useRouter()

  return (
    <div className="schedule--table-on-desktop">
      <div className="league-week-table-wrap">
        <table className="league-schedule-table">
          <colgroup>
            <col />
            <col className="col-score" />
            <col />
          </colgroup>
          <thead>
            <tr>
              <th className="league-results-th-home">Thuisteam</th>
              <th className="league-schedule-th-score">Uitslag</th>
              <th>Uitteam</th>
            </tr>
          </thead>
          <tbody>
            {matches.map((m) => {
              const href = `/wedstrijd/${m.matchCode}`
              return (
                <tr
                  key={m.matchCode}
                  className={`league-row--link${m.isOwn ? ' league-schedule-own-row' : ''}`}
                  onClick={() => router.push(href)}
                >
                  <td className="league-results-home" data-label="Thuis">
                    <Team
                      name={m.homeTeam}
                      clubcode={m.homeTeamRelatiecode}
                      own={m.isOwnHome}
                      side="home"
                    />
                  </td>
                  <td
                    className={`league-schedule-score${/\d/.test(resultOf(m)) ? '' : ' league-schedule-score--text'}`}
                    data-label="Uitslag"
                  >
                    {resultOf(m)}
                  </td>
                  <td data-label="Uit">
                    <Team
                      name={m.awayTeam}
                      clubcode={m.awayTeamRelatiecode}
                      own={m.isOwnAway}
                      side="away"
                    />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="card-match-list">
        {matches.map((m) => (
          <MatchCard
            key={m.matchCode}
            homeTeam={m.homeTeam}
            awayTeam={m.awayTeam}
            homeTeamRelatiecode={m.homeTeamRelatiecode}
            awayTeamRelatiecode={m.awayTeamRelatiecode}
            isOwnHome={m.isOwnHome}
            isOwnAway={m.isOwnAway}
            isOwn={m.isOwn}
            score={resultOf(m)}
            href={`/wedstrijd/${m.matchCode}`}
          />
        ))}
      </div>
    </div>
  )
}
