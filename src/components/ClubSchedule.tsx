'use client'

import React, { useMemo, useState } from 'react'
import { useClientValue } from '@/lib/use-client-value'
import { useQuery } from '@tanstack/react-query'
import {
  groupScheduleByWeek,
  filterScheduleByRange,
  type ScheduleRange,
} from '@/lib/clubdata/transform'
import { clubScheduleQuery } from '@/lib/clubdata/queries'
import {
  amsterdamToday,
  browserTestMode,
  testCancelledCodes,
  type CancellationTestMode,
} from '@/lib/clubdata/cancellation'
import ScheduleWeekGroups from '@/components/ui/ScheduleWeekGroups'
import ProgramCalendarButton from '@/components/ProgramCalendarButton'

type Filter = 'thuis' | 'uit' | 'alles'

type Props = {
  range?: ScheduleRange
  emptyMessage?: string
}

export default function ClubSchedule({ range, emptyMessage }: Props) {
  const [filter, setFilter] = useState<Filter>('alles')

  const { data, isLoading, isError } = useQuery(clubScheduleQuery(filter))

  // Test mode on previews (?afgelasting=test, =veel or =alles): the same matches as in the
  // cancellation bar show as cancelled.
  const testMode = useClientValue<CancellationTestMode | null>(browserTestMode, null)
  const matches = useMemo(() => {
    if (!testMode || !data) {
      return data
    }
    const codes = testCancelledCodes(data, testMode, amsterdamToday())
    return data.map((m) => (codes.has(m.matchCode) ? { ...m, status: 'Afgelast' } : m))
  }, [data, testMode])

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
        <ProgramCalendarButton />
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
