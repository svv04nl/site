import { todayInAmsterdam } from '@/lib/ai/time'
import { programRange, type ProgramPeriod } from '@/lib/app-api/dates'
import { appRoute, enumParam, listParam, TTL } from '@/lib/app-api/http'
import { filterMatches, groupByDay, loadMatchesInRange } from '@/lib/app-api/matches'

export const dynamic = 'force-dynamic'

const PERIODS: readonly ProgramPeriod[] = [
  'this-weekend',
  'next-weekend',
  'this-week',
  'next-week',
  'next-3-weeks',
]

export const GET = appRoute(TTL.program, async (request) => {
  const url = new URL(request.url)
  const period = enumParam(url, 'period', PERIODS, 'this-weekend')
  const venue = enumParam(url, 'venue', ['all', 'home', 'away'] as const, 'all')
  const range = programRange(period, todayInAmsterdam())

  const matches = filterMatches(await loadMatchesInRange(range), {
    venue,
    teams: listParam(url, 'teams'),
  })
  return {
    period: range,
    days: groupByDay(matches),
    moreUrl: { kind: 'externalApp', app: 'voetbalnl' },
  }
})
