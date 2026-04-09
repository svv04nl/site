'use client'

import React, { useState } from 'react'
import { useQueries } from '@tanstack/react-query'
import cx from 'classnames'
import { groupScheduleByWeek } from '@/lib/clubdata/transform'
import { pouleScheduleQuery } from '@/lib/clubdata/queries'
import ScheduleWeekGroups from '@/components/ui/ScheduleWeekGroups'
import type { PouleInfo } from '@/lib/clubdata/types'

type Props = {
  poules: PouleInfo[]
  teamcode: number
  initialFaseIndex?: number
}

export default function ScheduleTab({ poules, teamcode, initialFaseIndex = 0 }: Props) {
  const [selectedPoulecode, setSelectedPoulecode] = useState<number | undefined>(undefined)
  const [filterOwn, setFilterOwn] = useState(false)

  const scheduleQueries = useQueries({
    queries: poules.map((p) => pouleScheduleQuery(p.poulecode, teamcode)),
  })

  const availablePoules = poules.filter((_, i) => {
    const q = scheduleQueries[i]
    return !q.isFetched || (q.data && q.data.length > 0)
  })

  const defaultPoulecode = poules[initialFaseIndex]?.poulecode
  const poulecode =
    availablePoules.find((p) => p.poulecode === (selectedPoulecode ?? defaultPoulecode))?.poulecode ??
    availablePoules[0]?.poulecode

  const selectedPoule = poules.find((p) => p.poulecode === poulecode)
  const queryIndex = poules.findIndex((p) => p.poulecode === poulecode)
  const { data: allMatches, isLoading, isError, error } = scheduleQueries[queryIndex] ?? {}

  if (!poulecode) {
    return <p className="league-empty">Geen competitiegegevens beschikbaar.</p>
  }

  const filtered = filterOwn ? (allMatches ?? []).filter((m) => m.isOwn) : (allMatches ?? [])
  const weekGroups = groupScheduleByWeek(filtered)

  return (
    <div className="league-schedule">
      <div className="league-schedule-controls">
        <h2 className="league-standings-title">Programma</h2>
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

      {isError && (
        <p className="league-error">
          Programma kon niet worden geladen:{' '}
          {error instanceof Error ? error.message : 'Onbekende fout'}
        </p>
      )}

      {!isError && (
        <ScheduleWeekGroups
          weekGroups={weekGroups}
          subtitle={selectedPoule?.klassepoule}
          isLoading={isLoading ?? false}
        />
      )}
    </div>
  )
}
