'use client'

import React, { useState } from 'react'
import { useQueries, useQuery } from '@tanstack/react-query'
import cx from 'classnames'
import { pouleScheduleQuery, teamScheduleQuery } from '@/lib/clubdata/queries'
import MatchCard from '@/components/ui/MatchCard'
import type { PouleInfo } from '@/lib/clubdata/types'
import type { MatchKind } from '@/lib/clubdata/transform'
import { useCupElimination } from '@/components/team/team-utils'

// A competition match needs no label; cup matches and friendlies get one (as on the results).
const KIND_LABEL: Partial<Record<MatchKind, string>> = {
  beker: 'Beker',
  oefen: 'Oefenwedstrijd',
}

const ALL_VALUE = 'all'
// The same as the results: a few cards at a time.
const PAGE = 5

type Props = {
  teamcode: number
  poules: PouleInfo[]
  /** The cup poules among `poules`: their matches are cup matches. */
  cupPoulecodes?: number[]
}

export default function ScheduleTab({ teamcode, poules, cupPoulecodes = [] }: Props) {
  const [selected, setSelected] = useState<string>(ALL_VALUE)
  const [filterOwn, setFilterOwn] = useState(true)
  const [shown, setShown] = useState(PAGE)

  const scheduleQueries = useQueries({
    queries: poules.map((p) => pouleScheduleQuery(p.poulecode, teamcode)),
  })

  // The team's own list also has the friendlies, which are in no poule.
  const teamQuery = useQuery(teamScheduleQuery(teamcode || null))
  const eliminatedIn = useCupElimination(teamcode || null)

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

  // A match from a cup poule is a cup match, whatever its own fields say.
  const fromPoule = (index: number) =>
    (scheduleQueries[index]?.data ?? []).map((m) =>
      cupPoulecodes.includes(poules[index].poulecode) ? { ...m, kind: 'beker' as const } : m,
    )
  const allMatches = isAll
    ? [...poules.flatMap((_, i) => fromPoule(i)), ...(teamQuery.data ?? [])]
    : fromPoule(selectedIndex)

  const seen = new Set<number>()
  const matches = (filterOwn ? allMatches.filter((m) => m.isOwn) : allMatches)
    .filter((m) => !seen.has(m.matchCode) && Boolean(seen.add(m.matchCode)))
    .sort((a, b) => `${a.dayKey} ${a.time}`.localeCompare(`${b.dayKey} ${b.time}`))

  return (
    <div>
      <div className="league-controls">
        <h2 className="league-title">Programma</h2>
        <div className="league-controls-right">
          {poules.length > 0 && (
            <select
              value={selected}
              onChange={(e) => {
                setSelected(e.target.value)
                setShown(PAGE)
              }}
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
              onClick={() => {
                setFilterOwn(false)
                setShown(PAGE)
              }}
              type="button"
            >
              Alle wedstrijden
            </button>
            <button
              className={cx('league-filter-btn', { 'is-active': filterOwn })}
              onClick={() => {
                setFilterOwn(true)
                setShown(PAGE)
              }}
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

      {eliminatedIn && (
        <p className="cup-status cup-status--out">Uitgeschakeld in de beker · {eliminatedIn}</p>
      )}

      {/* The same match cards as the results, on every screen. */}
      {!isError && isLoading && matches.length === 0 && (
        <div className="schedule-loading" aria-label="Laden…">
          <span className="schedule-spinner" />
        </div>
      )}
      {!isError && !isLoading && matches.length === 0 && (
        <p className="league-empty">Geen wedstrijden gevonden.</p>
      )}
      {matches.length > 0 && (
        <div className="result-cards">
          {matches.slice(0, shown).map((m) => (
            <article key={m.matchCode} className="result-card">
              {m.kind && KIND_LABEL[m.kind] && (
                <p className={`result-card__kind result-card__kind--${m.kind}`}>
                  {KIND_LABEL[m.kind]}
                </p>
              )}
              <MatchCard
                date={m.date}
                time={m.time}
                homeTeam={m.homeTeam}
                awayTeam={m.awayTeam}
                homeTeamRelatiecode={m.homeTeamRelatiecode}
                awayTeamRelatiecode={m.awayTeamRelatiecode}
                isOwnHome={m.isOwnHome}
                isOwnAway={m.isOwnAway}
                isOwn={m.isOwn}
                venue={m.venue}
                status={m.status}
                href={`/wedstrijd/${m.matchCode}`}
              />
            </article>
          ))}
          {matches.length > shown && (
            <button
              type="button"
              className="btn btn--outline-dark result-cards__more"
              onClick={() => setShown((n) => n + PAGE)}
            >
              Meer wedstrijden
            </button>
          )}
        </div>
      )}
    </div>
  )
}
