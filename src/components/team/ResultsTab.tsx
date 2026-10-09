'use client'

import React, { useState } from 'react'
import { useQueries } from '@tanstack/react-query'
import cx from 'classnames'
import { groupResultsByDay } from '@/lib/clubdata/transform'
import { resultsQuery } from '@/lib/clubdata/queries'
import ResultsList from '@/components/ui/ResultsList'
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
  const dayGroups = groupResultsByDay(filtered)

  return (
    <div>
      <div className="league-controls">
        <h2 className="league-title">Uitslagen</h2>
        <div className="league-controls-right">
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
      </div>

      {isError && <p className="league-error">Gegevens konden niet worden geladen.</p>}

      {!isError && selectedPoule?.klassepoule && (
        <p className="league-subtitle">{selectedPoule.klassepoule}</p>
      )}

      {!isError &&
        (isLoading && dayGroups.length === 0 ? (
          <div className="schedule-loading" aria-label="Laden…">
            <span className="schedule-spinner" />
          </div>
        ) : dayGroups.length === 0 ? (
          <p className="league-empty">Geen uitslagen gevonden.</p>
        ) : (
          <div style={{ opacity: isLoading ? 0.5 : 1, transition: 'opacity 0.15s' }}>
            {dayGroups.map((group) => (
              <div key={group.dayKey} className="league-results-day">
                {group.label && <h4 className="league-day-title">{group.label}</h4>}
                <ResultsList matches={group.matches} />
              </div>
            ))}
          </div>
        ))}
    </div>
  )
}
