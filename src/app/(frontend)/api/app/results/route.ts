import { todayInAmsterdam } from '@/lib/ai/time'
import { resultsRange, type ResultsPeriod } from '@/lib/app-api/dates'
import { appRoute, enumParam, listParam, TTL } from '@/lib/app-api/http'
import { filterMatches, groupByDay, loadClubResults } from '@/lib/app-api/matches'

export const dynamic = 'force-dynamic'

const PERIODS: readonly ResultsPeriod[] = ['last-weekend', 'this-weekend', 'last-week']

export const GET = appRoute(TTL.program, async (request) => {
  const url = new URL(request.url)
  const period = enumParam(url, 'period', PERIODS, 'last-weekend')
  const venue = enumParam(url, 'venue', ['all', 'home', 'away'] as const, 'all')
  const range = resultsRange(period, todayInAmsterdam())

  const results = (await loadClubResults()).filter(
    (m) => m.date >= range.from && m.date <= range.to,
  )
  const matches = filterMatches(results, { venue, teams: listParam(url, 'teams') })
  return {
    period: range,
    days: groupByDay(matches),
    moreUrl: { kind: 'externalApp', app: 'voetbalnl' },
  }
})
