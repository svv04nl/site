'use client'

import { useQueries, useQuery } from '@tanstack/react-query'
import {
  cupResultsQuery,
  lineupQuery,
  pouleScheduleQuery,
  resultsQuery,
  teamPoulesQuery,
  teamResultsQuery,
} from '@/lib/clubdata/queries'
import { cancellationLabel } from '@/lib/clubdata/cancellation'
import type { ResultMatch } from '@/lib/clubdata/transform'
import type { PouleInfo } from '@/lib/clubdata/types'

const faseNumber = (klasse: string) => {
  const match = klasse.match(/\((\d+)[a-z]*\s+fase\)/i)
  return match ? parseInt(match[1]) : -1
}

/** The team's poules (the API can list one without name or code: skipped) and the current one. */
export function useTeamPoules(teamcode: number | null) {
  const { data, isLoading } = useQuery(teamPoulesQuery(teamcode))
  const regularPoules: PouleInfo[] = [...(data?.poules ?? []), ...(data?.fasePoules ?? [])].filter(
    (p) => p.klasse && p.poulecode,
  )
  const latestFaseIndex = regularPoules.reduce((best, p, i) => {
    return faseNumber(p.klasse) > faseNumber(regularPoules[best]?.klasse ?? '') ? i : best
  }, 0)
  return {
    regularPoules,
    cupPoules: data?.cupPoules ?? [],
    latestFaseIndex,
    currentPoule: regularPoules[latestFaseIndex] as PouleInfo | undefined,
    /** Still loading the poules (a team without a teamcode never loads: not loading). */
    isLoading: Boolean(teamcode) && isLoading,
  }
}

/** "3 - 1" (or "3-1", "3 – 1 (5-4)") as home and away goals; null when not a score. */
export function parseScore(score: string | null | undefined): [number, number] | null {
  const match = score?.match(/(\d+)\s*[-–]\s*(\d+)/)
  return match ? [Number(match[1]), Number(match[2])] : null
}

export type Outcome = 'W' | 'G' | 'V'

/** Won, drawn or lost, seen from our side; null for a match without a score. */
export function outcomeOf(m: ResultMatch): Outcome | null {
  const score = parseScore(m.score)
  if (!score || !m.isOwn) {
    return null
  }
  const [home, away] = score
  const ours = m.isOwnHome ? home : away
  const theirs = m.isOwnHome ? away : home
  return ours > theirs ? 'W' : ours < theirs ? 'V' : 'G'
}

/**
 * Our played matches in all regular poules of this season (every phase), newest first. Looking
 * at the current phase only gave just the last two or three matches right after a new phase began.
 */
/** "2026-07-01": the first day of the current season (a season runs from 1 July). */
export function seasonStartKey(now = new Date()): string {
  const year = now.getMonth() >= 6 ? now.getFullYear() : now.getFullYear() - 1
  return `${year}-07-01`
}

/**
 * Our played matches this season, newest first: competition, cup and (when the bond lists them)
 * friendlies. The poule lists go first, so a match keeps the kind its poule gives it.
 */
export function useOwnResults(teamcode: number | null) {
  const { regularPoules, cupPoules, isLoading: poulesLoading } = useTeamPoules(teamcode)
  const queries = useQueries({
    queries: [
      ...regularPoules.map((p) => resultsQuery(p.poulecode)),
      ...cupPoules.map((p) => cupResultsQuery(p.poulecode)),
    ],
  })
  // The poule results only cover the current poule; the team's own list covers the season.
  const teamQuery = useQuery(teamResultsQuery(teamcode))
  const start = seasonStartKey()
  const seen = new Set<number>()
  const results = [...queries.flatMap((q) => q.data ?? []), ...(teamQuery.data ?? [])]
    .filter((m) => m.isOwn && m.dayKey >= start && parseScore(m.score))
    .filter((m) => !cancellationLabel(m.status))
    .filter((m) => !seen.has(m.matchCode) && Boolean(seen.add(m.matchCode)))
    .sort((a, b) => b.dayKey.localeCompare(a.dayKey))
  return {
    results,
    isLoading: poulesLoading || teamQuery.isLoading || queries.some((q) => q.isLoading),
    isError: queries.length > 0 && queries.every((q) => q.isError),
  }
}

/** Lost, counting a shoot-out: "2 - 2 (3-4)" is a loss for the home side. */
function lostCupMatch(m: ResultMatch): boolean {
  const outcome = outcomeOf(m)
  if (outcome !== 'G') {
    return outcome === 'V'
  }
  const shootout = m.score.match(/\((\d+)\s*[-–]\s*(\d+)\)/)
  if (!shootout) {
    return false
  }
  const [home, away] = [Number(shootout[1]), Number(shootout[2])]
  return m.isOwnHome ? home < away : away < home
}

/**
 * The cup round the team went out in, or null. Only for a knockout round (its name has "ronde"
 * or "finale"), lost as our last cup match, with no cup match of ours still to play. A lost
 * match in a group phase is not the end, so that never counts.
 */
export function useCupElimination(teamcode: number | null): string | null {
  const { cupPoules } = useTeamPoules(teamcode)
  const results = useQueries({ queries: cupPoules.map((p) => cupResultsQuery(p.poulecode)) })
  const schedules = useQueries({
    queries: cupPoules.map((p) => pouleScheduleQuery(p.poulecode, teamcode ?? 0)),
  })
  if (results.some((q) => q.isLoading) || schedules.some((q) => q.isLoading)) {
    return null
  }
  if (schedules.some((q) => (q.data ?? []).some((m) => m.isOwn))) {
    return null
  }
  const start = seasonStartKey()
  const played = cupPoules
    .flatMap((p, i) => (results[i]?.data ?? []).map((m) => ({ m, klasse: p.klasse })))
    .filter(({ m }) => m.isOwn && m.dayKey >= start && parseScore(m.score))
    .sort((a, b) => b.m.dayKey.localeCompare(a.m.dayKey))
  const last = played[0]
  if (!last || !/ronde|finale/i.test(last.klasse) || !lostCupMatch(last.m)) {
    return null
  }
  return last.klasse
}

/** The class and the match day of the team, as the poule lists them ("4e klasse", "Zaterdag"). */
export function useTeamClass(teamcode: number | null) {
  const { currentPoule } = useTeamPoules(teamcode)
  const { data: lineup } = useQuery(lineupQuery(currentPoule?.poulecode))
  const day = lineup?.find((e) => e.isOwn)?.speeldag ?? ''
  return {
    klasse: currentPoule?.klasse ?? '',
    speeldag: day ? day.charAt(0).toUpperCase() + day.slice(1).toLowerCase() : '',
  }
}
