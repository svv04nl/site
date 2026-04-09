'use client'

import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { groupScheduleByWeek } from '@/lib/clubdata/transform'
import { clubScheduleQuery } from '@/lib/clubdata/queries'
import ScheduleWeekGroups from '@/components/ui/ScheduleWeekGroups'

type Filter = 'thuis' | 'uit' | 'alles'

export default function ClubSchedule() {
  const [filter, setFilter] = useState<Filter>('alles')

  const { data: matches, isLoading, isError } = useQuery(clubScheduleQuery(filter))

  const weekGroups = groupScheduleByWeek(matches ?? [])

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
          emptyMessage="Geen wedstrijden gevonden."
          tableOnDesktop
        />
      )}
    </div>
  )
}
