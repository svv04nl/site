'use client'

import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import cx from 'classnames'
import { standingsQuery, cupResultsQuery } from '@/lib/clubdata/queries'
import MatchCard from '@/components/ui/MatchCard'
import ClubLogo from '@/components/ClubLogo'
import type { PouleInfo } from '@/lib/clubdata/types'

type Props = {
  poules: PouleInfo[]
}

export default function CupTab({ poules }: Props) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [filterOwn, setFilterOwn] = useState(true)

  const selectedPoule = poules[selectedIndex]
  const poulecode = selectedPoule?.poulecode

  const { data: results, isLoading: resultsLoading } = useQuery(cupResultsQuery(poulecode))
  const { data: standing, isLoading: standingLoading } = useQuery(standingsQuery(poulecode))

  const filtered = filterOwn ? (results ?? []).filter((m) => m.isOwn) : (results ?? [])

  if (!poulecode) {
    return <p className="league-empty">Geen bekergegevens beschikbaar.</p>
  }

  return (
    <div className="league-standings">
      <div className="league-standings-controls">
        <h2 className="league-standings-title">Beker</h2>
        {poules.length > 1 && (
          <select
            className="league-fase-select"
            value={selectedIndex}
            onChange={(e) => setSelectedIndex(Number(e.target.value))}
          >
            {poules.map((p, i) => (
              <option key={p.poulecode} value={i}>
                {p.klasse}
              </option>
            ))}
          </select>
        )}
      </div>

      {selectedPoule.klassepoule && (
        <p className="league-standings-subtitle">{selectedPoule.klassepoule}</p>
      )}

      {/* Uitslagen */}
      <div className="league-schedule-controls">
        <h2 className="league-standings-title league-standings-title--sm">Uitslagen</h2>
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
      </div>

      {filtered.length > 0 ? (
        <div className="card-match-list" style={{ opacity: resultsLoading ? 0.5 : 1, transition: 'opacity 0.15s' }}>
          {filtered.map((m) => (
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
              href={`/wedstrijd/${m.matchCode}`}
            />
          ))}
        </div>
      ) : (
        !resultsLoading && <p className="league-empty">Geen uitslagen gevonden.</p>
      )}

      <div style={{ marginBottom: '2rem' }} />

      {/* Stand */}
      <h2 className="league-standings-title league-standings-title--sm">Stand</h2>
      {standing ? (
        <div style={{ opacity: standingLoading ? 0.5 : 1, transition: 'opacity 0.15s' }}>
          <table className="league-table">
            <thead>
              <tr>
                <th>#</th>
                <th />
                <th>Team</th>
                <th>GW</th>
                <th>W</th>
                <th>G</th>
                <th>V</th>
                <th>DV</th>
                <th>DT</th>
                <th>DS</th>
                <th>
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-label="Aantekening"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                </th>
                <th>P</th>
              </tr>
            </thead>
            <tbody>
              {standing.map((row) => (
                <tr key={row.position} className={cx({ 'league-table-own-row': row.isOwn })}>
                  <td className="league-table-pos">{row.position}</td>
                  <td className="league-table-logo-cell">
                    <ClubLogo
                      clubcode={row.clubRelatiecode}
                      name={row.teamName}
                      className="league-table-logo"
                    />
                  </td>
                  <td className={cx('league-table-name', { 'is-own': row.isOwn })}>
                    {row.teamName}
                  </td>
                  <td>{row.played}</td>
                  <td>{row.won}</td>
                  <td>{row.drawn}</td>
                  <td>{row.lost}</td>
                  <td>{row.goalsFor}</td>
                  <td>{row.goalsAgainst}</td>
                  <td>{row.goalDiff}</td>
                  <td className="league-table-note-cell">
                    {row.note && (
                      <span
                        className="league-table-note-icon"
                        title={row.note}
                        aria-label={row.note}
                      >
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          aria-hidden="true"
                        >
                          <circle cx="12" cy="12" r="10" />
                          <line x1="12" y1="8" x2="12" y2="12" stroke="white" strokeWidth="2" />
                          <line x1="12" y1="16" x2="12.01" y2="16" stroke="white" strokeWidth="2" />
                        </svg>
                      </span>
                    )}
                  </td>
                  <td className="league-table-pts">{row.points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        !standingLoading && <p className="league-empty">Geen standgegevens gevonden.</p>
      )}
    </div>
  )
}
