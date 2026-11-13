'use client'

import { useQuery } from '@tanstack/react-query'
import { lineupQuery, resultsQuery, teamPoulesQuery } from '@/lib/clubdata/queries'
import { cancellationLabel } from '@/lib/clubdata/cancellation'
import type { ResultMatch } from '@/lib/clubdata/transform'
import type { PouleInfo } from '@/lib/clubdata/types'

const faseNumber = (klasse: string) => {
  const match = klasse.match(/\((\d+)[a-z]*\s+fase\)/i)
  return match ? parseInt(match[1]) : -1
}

/** The team's poules (the API can list one without name or code: skipped) and the current one. */
export function useTeamPoules(teamcode: number | null) {
  const { data } = useQuery(teamPoulesQuery(teamcode))
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

/** Our played matches in the current poule, newest first. */
export function useOwnResults(teamcode: number | null) {
  const { currentPoule } = useTeamPoules(teamcode)
  const { data, isLoading, isError } = useQuery(resultsQuery(currentPoule?.poulecode))
  const results = (data ?? [])
    .filter((m) => m.isOwn && parseScore(m.score) && !cancellationLabel(m.status))
    .sort((a, b) => b.dayKey.localeCompare(a.dayKey))
  return { results, isLoading: isLoading || !currentPoule, isError }
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
