'use client'

import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { ScheduleWeekGroup, ScheduleMatch } from '@/lib/clubdata/transform'
import MatchCard from '@/components/ui/MatchCard'
import ClubLogo from '@/components/ClubLogo'

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

function TableHead() {
  return (
    <thead>
      <tr>
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
      </tr>
    </thead>
  )
}

function MatchRow({ m, onNavigate }: { m: ScheduleMatch; onNavigate: (href: string) => void }) {
  const href = `/wedstrijd/${m.matchCode}`
  return (
    <tr
      className={`league-row--link${m.isOwn ? ' league-schedule-own-row' : ''}`}
      onClick={() => onNavigate(href)}
    >
      <td className="league-schedule-time" data-label="Tijd">
        <Link href={href} className="league-row-link" onClick={(e) => e.stopPropagation()}>
          {m.time}
        </Link>
      </td>
      <td data-label="Thuis">
        <span className="league-schedule-team-cell">
          <ClubLogo
            clubcode={m.homeTeamRelatiecode}
            name={m.homeTeam}
            className="league-schedule-logo"
          />
          <span
            className={m.isOwnHome ? 'league-schedule-own-name' : ''}
            style={m.isOwnHome ? { color: '#c8102e', fontWeight: 600 } : undefined}
          >
            {m.homeTeam}
          </span>
        </span>
      </td>
      <td data-label="Uit">
        <span className="league-schedule-team-cell">
          <ClubLogo
            clubcode={m.awayTeamRelatiecode}
            name={m.awayTeam}
            className="league-schedule-logo"
          />
          <span
            className={m.isOwnAway ? 'league-schedule-own-name' : ''}
            style={m.isOwnAway ? { color: '#c8102e', fontWeight: 600 } : undefined}
          >
            {m.awayTeam}
          </span>
        </span>
      </td>
      <td className="league-schedule-location" data-label="Locatie">
        {m.venue}
      </td>
    </tr>
  )
}

type Props = {
  weekGroups: ScheduleWeekGroup[]
  subtitle?: string
  isLoading?: boolean
  emptyMessage?: string
  tableOnDesktop?: boolean
  showWeekLabel?: boolean
}

export default function ScheduleWeekGroups({
  weekGroups,
  subtitle,
  isLoading = false,
  emptyMessage = 'Geen wedstrijden gevonden.',
  tableOnDesktop = false,
  showWeekLabel = true,
}: Props) {
  const router = useRouter()

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
    <div
      style={{ opacity: isLoading ? 0.5 : 1, transition: 'opacity 0.15s' }}
      className={tableOnDesktop ? 'schedule--table-on-desktop' : undefined}
    >
      {weekGroups.map((group) => (
        <div key={group.weekKey} className="league-week-group">
          {showWeekLabel && <h3 className="league-title">{group.label}</h3>}
          {subtitle && <p className="league-subtitle">{subtitle}</p>}

          {tableOnDesktop && showWeekLabel && (
            <div className="league-week-table-wrap">
              <table className="league-schedule-table">
                <colgroup>
                  <col className="col-time" />
                  <col className="col-home" />
                  <col className="col-away" />
                  <col className="col-venue" />
                </colgroup>
                <TableHead />
                <tbody>
                  {group.days.map((day) => (
                    <React.Fragment key={day.dayKey}>
                      {day.label && (
                        <tr className="league-schedule-day-row">
                          <td colSpan={4}>{day.label}</td>
                        </tr>
                      )}
                      {day.matches.map((m) => (
                        <MatchRow key={m.matchCode} m={m} onNavigate={(href) => router.push(href)} />
                      ))}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {tableOnDesktop && !showWeekLabel && (
            <>
              {group.days.map((day) => (
                <div key={day.dayKey} className="league-day-group">
                  {day.label && <h4 className="league-day-title">{day.label}</h4>}
                  <div className="league-week-table-wrap">
                    <table className="league-schedule-table">
                      <colgroup>
                        <col className="col-time" />
                        <col className="col-home" />
                        <col className="col-away" />
                        <col className="col-venue" />
                            </colgroup>
                      <TableHead />
                      <tbody>
                        {day.matches.map((m) => (
                          <MatchRow key={m.matchCode} m={m} onNavigate={(href) => router.push(href)} />
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </>
          )}

          <div className="card-match-list">
            {group.days.map((day) => (
              <React.Fragment key={day.dayKey}>
                {day.label && <h4 className="league-day-title">{day.label}</h4>}
                {day.matches.map((m) => (
                  <MatchCard
                    key={m.matchCode}
                    date={day.label ? undefined : m.date}
                    homeTeam={m.homeTeam}
                    awayTeam={m.awayTeam}
                    homeTeamRelatiecode={m.homeTeamRelatiecode}
                    awayTeamRelatiecode={m.awayTeamRelatiecode}
                    isOwnHome={m.isOwnHome}
                    isOwnAway={m.isOwnAway}
                    isOwn={m.isOwn}
                    time={m.time}
                    venue={m.venue}
                    status={m.status}
                    href={`/wedstrijd/${m.matchCode}`}
                  />
                ))}
              </React.Fragment>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
