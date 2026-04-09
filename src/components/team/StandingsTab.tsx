'use client'

import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import cx from 'classnames'
import { standingsQuery, periodStandingQuery, periodNumbersQuery } from '@/lib/clubdata/queries'
import ClubLogo from '@/components/ClubLogo'
import type { PouleInfo } from '@/lib/clubdata/types'

type Props = {
  poules: PouleInfo[]
  initialIndex?: number
}

type Mode = 'seizoen' | number // number = periodeNummer

export default function StandingsTab({ poules, initialIndex = 0 }: Props) {
  const [mode, setMode] = useState<Mode>('seizoen')
  const [explicitIndex, setExplicitIndex] = useState<number | undefined>(undefined)

  const selectedIndex = explicitIndex ?? initialIndex
  const selectedPoule = poules[selectedIndex]
  const poulecode = selectedPoule?.poulecode

  const { data: periodes } = useQuery(periodNumbersQuery(poulecode))

  const hasPeriodes = (periodes?.length ?? 0) > 0
  const isPeriodeMode = mode !== 'seizoen'
  const periodeNummer = isPeriodeMode ? (mode as number) : 1

  const {
    data: seizoenStanding,
    isLoading: seizoenLoading,
    isError: seizoenError,
  } = useQuery(standingsQuery(isPeriodeMode ? undefined : poulecode))

  const {
    data: periodeStanding,
    isLoading: periodeLoading,
    isError: periodeError,
  } = useQuery(periodStandingQuery(isPeriodeMode ? poulecode : undefined, periodeNummer))

  const standing = isPeriodeMode ? periodeStanding : seizoenStanding
  const isLoading = isPeriodeMode ? periodeLoading : seizoenLoading
  const isError = isPeriodeMode ? periodeError : seizoenError
  const hasStandings = !isError && standing?.length !== 0

  if (!hasStandings) {
    return (
      <div className="league-no-standings">
        <h2 className="league-no-standings-title">Geen uitslagen en standen</h2>
        <p className="league-no-standings-body">
          Bij deze competitie worden geen uitslagen en standen weergegeven. De spelers in deze
          leeftijdscategorieën bevinden zich in een ontwikkelfase, waarbij de competitie geen doel
          maar een middel is dat bijdraagt aan het spelplezier en de individuele ontwikkeling.
        </p>
      </div>
    )
  }

  if (!poulecode) {
    return <p className="league-empty">Geen competitiegegevens beschikbaar.</p>
  }

  const handlePouleChange = (index: number) => {
    setExplicitIndex(index)
    setMode('seizoen')
  }

  return (
    <div className="league-standings">
      <div className="league-standings-controls">
        <h2 className="league-standings-title">Stand</h2>
        <div className="league-standings-controls-right">
          {hasPeriodes && (
            <div className="league-filter-toggle">
              <button
                className={cx('league-filter-btn', { 'is-active': mode === 'seizoen' })}
                onClick={() => setMode('seizoen')}
                type="button"
              >
                Seizoen
              </button>
              {periodes!.map((p) => (
                <button
                  key={p.periodenummer}
                  className={cx('league-filter-btn', { 'is-active': mode === p.periodenummer })}
                  onClick={() => setMode(p.periodenummer)}
                  type="button"
                >
                  Periode {p.periodenummer}
                </button>
              ))}
            </div>
          )}
          {!isPeriodeMode && poules.length > 1 && (
            <select
              className="league-fase-select"
              value={selectedIndex}
              onChange={(e) => handlePouleChange(Number(e.target.value))}
            >
              {poules.map((p, i) => (
                <option key={p.poulecode} value={i}>
                  {p.klasse}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {selectedPoule?.klassepoule && (
        <p className="league-standings-subtitle">
          {isPeriodeMode
            ? `${selectedPoule.klassepoule} (Periode ${periodeNummer})`
            : selectedPoule.klassepoule}
        </p>
      )}

      {isError && <p className="league-error">Gegevens konden niet worden geladen.</p>}

      <div style={{ opacity: isLoading ? 0.5 : 1, transition: 'opacity 0.15s' }}>
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
            {standing?.map((row) => (
              <tr key={row.position} className={cx({ 'league-table-own-row': row.isOwn })}>
                <td className="league-table-pos">{row.position}</td>
                <td className="league-table-logo-cell">
                  <ClubLogo
                    clubcode={row.clubRelatiecode}
                    name={row.teamName}
                    className="league-table-logo"
                  />
                </td>
                <td className={cx('league-table-name', { 'is-own': row.isOwn })}>{row.teamName}</td>
                <td>{row.played}</td>
                <td>{row.won}</td>
                <td>{row.drawn}</td>
                <td>{row.lost}</td>
                <td>{row.goalsFor}</td>
                <td>{row.goalsAgainst}</td>
                <td>{row.goalDiff}</td>
                <td className="league-table-note-cell">
                  {row.note && (
                    <span className="league-table-note-icon" title={row.note} aria-label={row.note}>
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
    </div>
  )
}
