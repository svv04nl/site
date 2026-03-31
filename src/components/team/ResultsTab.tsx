'use client'

import React, { useState } from 'react'
import { useQueries } from '@tanstack/react-query'
import cx from 'classnames'
import { groupResultsByWeek } from '@/lib/clubdata/transform'
import { resultsQuery } from '@/lib/clubdata/queries'
import MatchCard from '@/components/ui/MatchCard'
import ClubLogo from '@/components/ClubLogo'
import type { PouleInfo } from '@/lib/clubdata/types'

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
  poules: PouleInfo[]
  initialIndex?: number
}

export default function ResultsTab({ poules, initialIndex = 0 }: Props) {
  const [selectedPoulecode, setSelectedPoulecode] = useState(poules[initialIndex]?.poulecode)
  const [filterOwn, setFilterOwn] = useState(false)

  const resultsQueries = useQueries({
    queries: poules.map((p) => resultsQuery(p.poulecode)),
  })

  const availablePoules = poules.filter((_, i) => {
    const q = resultsQueries[i]
    return !q.isFetched || (q.data && q.data.length > 0)
  })

  const poulecode =
    availablePoules.find((p) => p.poulecode === selectedPoulecode)?.poulecode ??
    availablePoules[0]?.poulecode

  const selectedPoule = poules.find((p) => p.poulecode === poulecode)
  const queryIndex = poules.findIndex((p) => p.poulecode === poulecode)
  const { data: allMatches, isLoading, isError } = resultsQueries[queryIndex] ?? {}

  if (!poulecode) {
    return <p className="league-empty">Geen competitiegegevens beschikbaar.</p>
  }

  const filtered = filterOwn ? (allMatches ?? []).filter((m) => m.isOwn) : (allMatches ?? [])
  const weekGroups = groupResultsByWeek(filtered)

  return (
    <div className="league-schedule">
      <div className="league-schedule-controls">
        <h2 className="league-standings-title">Uitslagen</h2>
        <div className="league-schedule-controls-right">
          <div className="league-filter-toggle">
            <button
              className={cx('league-filter-btn', { 'is-active': !filterOwn })}
              onClick={() => setFilterOwn(false)}
              type="button"
            >
              Alle wedstrijden
            </button>
            <button
              className={cx('league-filter-btn', { 'is-active': filterOwn })}
              onClick={() => setFilterOwn(true)}
              type="button"
            >
              Eigen club
            </button>
          </div>
          {availablePoules.length > 1 && (
            <select
              value={poulecode}
              onChange={(e) => setSelectedPoulecode(Number(e.target.value))}
              className="league-fase-select"
            >
              {availablePoules.map((p) => (
                <option key={p.poulecode} value={p.poulecode}>
                  {p.klasse}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {isError && <p className="league-error">Gegevens konden niet worden geladen.</p>}

      {!isError &&
        (isLoading && weekGroups.length === 0 ? (
          <div className="schedule-loading" aria-label="Laden…">
            <span className="schedule-spinner" />
          </div>
        ) : weekGroups.length === 0 ? (
          <p className="league-empty">Geen uitslagen gevonden.</p>
        ) : (
          <div style={{ opacity: isLoading ? 0.5 : 1, transition: 'opacity 0.15s' }}>
            {weekGroups.map((group) => (
              <div key={group.weekKey} className="league-week-group">
                <h2 className="league-week-title">{group.label}</h2>
                {selectedPoule?.klassepoule && (
                  <p className="league-standings-subtitle">{selectedPoule.klassepoule}</p>
                )}
                {/* Desktop: table */}
                <div className="league-week-table-wrap">
                  <table className="league-results-table">
                    <colgroup>
                      <col className="col-date" />
                      <col className="col-home" />
                      <col className="col-away" />
                      <col className="col-score" />
                      <col className="col-status" />
                    </colgroup>
                    <thead>
                      <tr>
                        <th>Datum</th>
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
                        <th>Uitslag</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {group.matches.map((m) => (
                        <tr
                          key={m.matchCode}
                          className={cx({ 'league-schedule-own-row': m.isOwn })}
                        >
                          <td className="league-schedule-date" data-label="Datum">
                            {m.date}
                          </td>
                          <td data-label="Thuis">
                            <span className="league-schedule-team-cell">
                              <ClubLogo
                                clubcode={m.homeTeamRelatiecode}
                                name={m.homeTeam}
                                className="league-schedule-logo"
                              />
                              <span
                                className={cx({ 'league-schedule-own-name': m.isOwnHome })}
                                style={
                                  m.isOwnHome ? { color: '#c8102e', fontWeight: 600 } : undefined
                                }
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
                                className={cx({ 'league-schedule-own-name': m.isOwnAway })}
                                style={
                                  m.isOwnAway ? { color: '#c8102e', fontWeight: 600 } : undefined
                                }
                              >
                                {m.awayTeam}
                              </span>
                            </span>
                          </td>
                          <td className="league-results-score" data-label="Uitslag">
                            {m.score}
                          </td>
                          <td className="league-schedule-status" data-label="Status">
                            {m.status}
                          </td>
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
                      homeTeamRelatiecode={m.homeTeamRelatiecode}
                      awayTeamRelatiecode={m.awayTeamRelatiecode}
                      isOwnHome={m.isOwnHome}
                      isOwnAway={m.isOwnAway}
                      isOwn={m.isOwn}
                      score={m.score}
                      status={m.status}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ))}
    </div>
  )
}
