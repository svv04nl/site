'use client'

import React, { useState } from 'react'
import { useQueries } from '@tanstack/react-query'
import cx from 'classnames'
import { groupScheduleByWeek } from '@/lib/clubdata/transform'
import { pouleScheduleQuery } from '@/lib/clubdata/queries'
import ScheduleWeekGroups from '@/components/ui/ScheduleWeekGroups'
import type { PouleInfo } from '@/lib/clubdata/types'

const ALL_VALUE = 'all'

type Props = {
  teamcode: number
  poules: PouleInfo[]
}

export default function ScheduleTab({ teamcode, poules }: Props) {
  const [selected, setSelected] = useState<string>(ALL_VALUE)
  const [filterOwn, setFilterOwn] = useState(true)

  const scheduleQueries = useQueries({
    queries: poules.map((p) => pouleScheduleQuery(p.poulecode, teamcode)),
  })

  const isAll = selected === ALL_VALUE
  const poulecode = isAll ? undefined : Number(selected)
  const selectedPoule = poules.find((p) => p.poulecode === poulecode)
  const selectedIndex = poules.findIndex((p) => p.poulecode === poulecode)

  const isLoading = isAll
    ? scheduleQueries.some((q) => q.isLoading)
    : (scheduleQueries[selectedIndex]?.isLoading ?? false)
  const isError = isAll
    ? scheduleQueries.some((q) => q.isError)
    : (scheduleQueries[selectedIndex]?.isError ?? false)

  const allMatches = isAll
    ? scheduleQueries.flatMap((q) => q.data ?? [])
    : (scheduleQueries[selectedIndex]?.data ?? [])

  const filtered = filterOwn ? allMatches.filter((m) => m.isOwn) : allMatches
  const weekGroups = groupScheduleByWeek(filtered)

  return (
    <div>
      <div className="league-controls">
        <h2 className="league-title">Programma</h2>
        <div className="league-controls-right">
          {poules.length > 0 && (
            <select
              value={selected}
              onChange={(e) => setSelected(e.target.value)}
              className="league-fase-select"
            >
              <option value={ALL_VALUE}>Volledig programma</option>
              {poules.map((p) => (
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

      {isError && <p className="league-error">Programma kon niet worden geladen.</p>}

      {!isError && !isAll && selectedPoule?.klassepoule && (
        <p className="league-subtitle">{selectedPoule.klassepoule}</p>
      )}

      {!isError && (
        <ScheduleWeekGroups
          weekGroups={weekGroups}
          isLoading={isLoading}
          emptyMessage="Geen wedstrijden gevonden."
          tableOnDesktop
          showWeekLabel={false}
        />
      )}
    </div>
  )
}
