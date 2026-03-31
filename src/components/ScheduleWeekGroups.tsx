import React from 'react'
import type { ScheduleWeekGroup } from '@/lib/clubdata/transform'
import MatchCard from '@/components/MatchCard'

const ShieldIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
)

type Props = {
  weekGroups: ScheduleWeekGroup[]
  logoMap?: Map<string, string | undefined>
  subtitle?: string
  isLoading?: boolean
  emptyMessage?: string
}

export default function ScheduleWeekGroups({
  weekGroups,
  logoMap,
  subtitle,
  isLoading = false,
  emptyMessage = 'Geen wedstrijden gevonden.',
}: Props) {
  if (isLoading && weekGroups.length === 0) {
    return (
      <div className="schedule-loading" aria-label="Laden…">
        <span className="schedule-spinner" />
      </div>
    )
  }

  if (!isLoading && weekGroups.length === 0) {
    return <p className="league-empty">{emptyMessage}</p>
  }

  return (
    <div style={{ opacity: isLoading ? 0.5 : 1, transition: 'opacity 0.15s' }}>
      {weekGroups.map((group) => (
        <div key={group.weekKey} className="league-week-group">
          <h2 className="league-week-title">{group.label}</h2>
          {subtitle && <p className="league-standings-subtitle">{subtitle}</p>}

          {/* Desktop: table */}
          <div className="league-week-table-wrap">
            <table className="league-schedule-table">
              <colgroup>
                <col className="col-date" />
                <col className="col-time" />
                <col className="col-home" />
                <col className="col-away" />
                <col className="col-venue" />
                <col className="col-status" />
              </colgroup>
              <thead>
                <tr>
                  <th>Datum</th>
                  <th>Tijd</th>
                  <th>
                    <span className="league-schedule-th-team">
                      <ShieldIcon />
                      Thuisteam
                    </span>
                  </th>
                  <th>
                    <span className="league-schedule-th-team">
                      <ShieldIcon />
                      Uitteam
                    </span>
                  </th>
                  <th>Accommodatie</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {group.matches.map((m) => (
                  <tr key={m.matchCode} className={m.isOwn ? 'league-schedule-own-row' : ''}>
                    <td className="league-schedule-date" data-label="Datum">{m.date}</td>
                    <td className="league-schedule-time" data-label="Tijd">{m.time}</td>
                    <td data-label="Thuis">
                      <span className="league-schedule-team-cell">
                        {(m.homeTeamLogo ?? logoMap?.get(m.homeTeam)) && (
                          <img
                            src={m.homeTeamLogo ?? logoMap?.get(m.homeTeam)}
                            alt=""
                            className="league-schedule-logo"
                          />
                        )}
                        <span className={m.isOwnHome ? 'league-schedule-own-name' : ''}>
                          {m.homeTeam}
                        </span>
                      </span>
                    </td>
                    <td data-label="Uit">
                      <span className="league-schedule-team-cell">
                        {(m.awayTeamLogo ?? logoMap?.get(m.awayTeam)) && (
                          <img
                            src={m.awayTeamLogo ?? logoMap?.get(m.awayTeam)}
                            alt=""
                            className="league-schedule-logo"
                          />
                        )}
                        <span className={m.isOwnAway ? 'league-schedule-own-name' : ''}>
                          {m.awayTeam}
                        </span>
                      </span>
                    </td>
                    <td className="league-schedule-location" data-label="Locatie">{m.venue}</td>
                    <td className="league-schedule-status" data-label="Status">{m.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile: cards */}
          <div className="next-match-cards-list">
            {group.matches.map((m) => (
              <MatchCard
                key={m.matchCode}
                date={m.date}
                homeTeam={m.homeTeam}
                awayTeam={m.awayTeam}
                homeTeamLogo={m.homeTeamLogo ?? logoMap?.get(m.homeTeam)}
                awayTeamLogo={m.awayTeamLogo ?? logoMap?.get(m.awayTeam)}
                isOwnHome={m.isOwnHome}
                isOwnAway={m.isOwnAway}
                isOwn={m.isOwn}
                time={m.time}
                venue={m.venue}
                status={m.status}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
