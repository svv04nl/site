'use client'

import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { fetchClubData } from '@/lib/clubdata/fetch'
import { transformSchedule, groupScheduleByWeek } from '@/lib/clubdata/transform'
import { CLUB_RELATIECODE } from '@/lib/clubdata/config'
import ScheduleWeekGroups from '@/components/ScheduleWeekGroups'
import type { RawProgrammaResponse } from '@/lib/clubdata/types'

type Filter = 'thuis' | 'uit' | 'alles'

const SHARED_PARAMS = {
  teamcode: 'NULL',
  lokaleteamcode: 'NULL',
  sorteervolgorde: 'datum',
  gebruiklokaleteamgegevens: 'NEE',
  aantalregels: '100',
  aantaldagen: '365',
  weekoffset: '0',
  eigenwedstrijden: 'JA',
  spelsoort: 'ALLES',
  competitiesoort: 'ALLES',
  dagsoort: 'ALLES',
  leeftijdscategorie: 'ALLES',
  wedstrijdtype: '',
}

export default function ProgrammaClient() {
  const [filter, setFilter] = useState<Filter>('thuis')

  const { data: matches, isLoading, isError } = useQuery({
    queryKey: ['programma', filter],
    queryFn: async () => {
      const raw = await fetchClubData<RawProgrammaResponse>('programma', null, {
        ...SHARED_PARAMS,
        thuis: filter !== 'uit' ? 'ja' : 'nee',
        uit: filter !== 'thuis' ? 'ja' : 'nee',
      })
      return transformSchedule(raw, CLUB_RELATIECODE)
    },
    staleTime: 5 * 60 * 1000,
  })

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

      {isError && <p className="league-empty">Gegevens konden niet worden geladen.</p>}

      {!isError && (
        <ScheduleWeekGroups
          weekGroups={weekGroups}
          isLoading={isLoading}
          emptyMessage="Geen wedstrijden gevonden."
        />
      )}
    </div>
  )
}
