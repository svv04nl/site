'use client'

import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  groupScheduleByWeek,
  filterScheduleByRange,
  type ScheduleRange,
} from '@/lib/clubdata/transform'
import { clubScheduleQuery } from '@/lib/clubdata/queries'
import ScheduleWeekGroups from '@/components/ui/ScheduleWeekGroups'

type Filter = 'thuis' | 'uit' | 'alles'

type Props = {
  range?: ScheduleRange
  emptyMessage?: string
}

export default function ClubSchedule({ range, emptyMessage }: Props) {
  const [filter, setFilter] = useState<Filter>('alles')

  const { data: matches, isLoading, isError } = useQuery(clubScheduleQuery(filter))

  const scopedMatches = range ? filterScheduleByRange(matches ?? [], range) : (matches ?? [])
  const weekGroups = groupScheduleByWeek(scopedMatches)

  return (
    <div className="programma-section">
      <div className="programma-controls">
        <div className="league-filter-toggle">
          <button
            className={`league-filter-btn${filter === 'thuis' ? ' is-active' : ''}`}
            onClick={() => setFilter('thuis')}
            type="button"
          >
            Thuis
          </button>
          <button
            className={`league-filter-btn${filter === 'uit' ? ' is-active' : ''}`}
            onClick={() => setFilter('uit')}
            type="button"
          >
            Uit
          </button>
          <button
            className={`league-filter-btn${filter === 'alles' ? ' is-active' : ''}`}
            onClick={() => setFilter('alles')}
            type="button"
          >
            Alle wedstrijden
          </button>
        </div>
      </div>

      {isError && (
        <p className="league-error">
          Programma kon niet worden geladen. Probeer het later opnieuw.
        </p>
      )}

      {!isError && (
        <ScheduleWeekGroups
          weekGroups={weekGroups}
          isLoading={isLoading}
          emptyMessage={emptyMessage ?? 'Geen wedstrijden gevonden.'}
          tableOnDesktop
          showWeekLabel={false}
        />
      )}
    </div>
  )
}
