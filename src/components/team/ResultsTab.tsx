'use client'

import React, { useState } from 'react'
import { useQueries } from '@tanstack/react-query'
import cx from 'classnames'
import { groupResultsByWeek } from '@/lib/clubdata/transform'
import { resultsQuery } from '@/lib/clubdata/queries'
import MatchCard from '@/components/ui/MatchCard'
import type { PouleInfo } from '@/lib/clubdata/types'

type Props = {
  poules: PouleInfo[]
  initialIndex?: number
}

export default function ResultsTab({ poules, initialIndex = 0 }: Props) {
  const [selectedPoulecode, setSelectedPoulecode] = useState<number | undefined>(undefined)
  const [filterOwn, setFilterOwn] = useState(false)

  const resultsQueries = useQueries({
    queries: poules.map((p) => resultsQuery(p.poulecode)),
  })

  const availablePoules = poules.filter((_, i) => {
    const q = resultsQueries[i]
    return !q.isFetched || (q.data && q.data.length > 0)
  })

  const defaultPoulecode = poules[initialIndex]?.poulecode
  const poulecode =
    availablePoules.find((p) => p.poulecode === (selectedPoulecode ?? defaultPoulecode))
      ?.poulecode ?? availablePoules[0]?.poulecode

  const selectedPoule = poules.find((p) => p.poulecode === poulecode)
  const queryIndex = poules.findIndex((p) => p.poulecode === poulecode)
  const { data: allMatches, isLoading, isError } = resultsQueries[queryIndex] ?? {}

  if (!poulecode) {
    return <p className="league-empty">Geen competitiegegevens beschikbaar.</p>
  }

  const filtered = filterOwn ? (allMatches ?? []).filter((m) => m.isOwn) : (allMatches ?? [])
  const weekGroups = groupResultsByWeek(filtered)

  return (
    <div>
      <div className="league-controls">
        <h2 className="league-title">Uitslagen</h2>
        <div className="league-controls-right">
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
                  <p className="league-subtitle">{selectedPoule.klassepoule}</p>
                )}
                <div className="card-match-list">
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
                      href={`/wedstrijd/${m.matchCode}`}
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
