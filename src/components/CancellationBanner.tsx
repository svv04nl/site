import React from 'react'
import { clubScheduleQuery } from '@/lib/clubdata/queries'
import type { ScheduleMatch } from '@/lib/clubdata/transform'
import { isProduction } from '@/lib/site-env'
import { amsterdamToday, cancellationLabel, testCancelledCodes } from '@/lib/clubdata/cancellation'
import {
  CancellationBannerClient,
  type AllCancelled,
  type CancellationData,
  type CancelledMatch,
} from './CancellationBannerClient'

// Show cancellations for today and the next few days, so a Saturday cancellation
// is already visible on Thursday or Friday.
const DAYS_AHEAD = 3

// "Everything is cancelled" needs at least this many matches on that day, so one
// cancelled home match on a quiet Tuesday does not count as a club-wide decision.
const MIN_FOR_ALL = 2

const isCancelled = (m: ScheduleMatch) => cancellationLabel(m.status) !== null

/** "YYYY-MM-DD" for today in Dutch time, plus `offset` days. */
function amsterdamDayKey(offset = 0) {
  const date = new Date(Date.now() + offset * 24 * 60 * 60 * 1000)
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Amsterdam' }).format(date)
}

const dayFormat = (options: Intl.DateTimeFormatOptions) => (dayKey: string) =>
  new Intl.DateTimeFormat('nl-NL', { timeZone: 'Europe/Amsterdam', ...options })
    .format(new Date(`${dayKey}T12:00:00Z`))
    .replace(/\./g, '')

/** "za 14 nov" */
const shortDay = dayFormat({ weekday: 'short', day: 'numeric', month: 'short' })
/** "Zaterdag 14 november" */
const longDay = (dayKey: string) => {
  const s = dayFormat({ weekday: 'long', day: 'numeric', month: 'long' })(dayKey)
  return s.charAt(0).toUpperCase() + s.slice(1)
}

const toCancelled = (m: ScheduleMatch): CancelledMatch => ({
  matchCode: m.matchCode,
  dayKey: m.dayKey,
  day: shortDay(m.dayKey),
  time: m.time,
  home: m.homeTeam,
  away: m.awayTeam,
  isHome: m.isOwnHome,
})

/**
 * The first day on which all our matches, or all our home matches, are cancelled (at least
 * MIN_FOR_ALL of them). That is a decision for the whole club, like frost, and gets its own
 * popup. Worked out from Sportlink alone: nobody has to enter a reason.
 */
function findAllCancelled(own: ScheduleMatch[]): AllCancelled | null {
  const days = [...new Set(own.map((m) => m.dayKey))].sort()
  for (const dayKey of days) {
    const ofDay = own.filter((m) => m.dayKey === dayKey)
    const home = ofDay.filter((m) => m.isOwnHome)
    if (ofDay.length >= MIN_FOR_ALL && ofDay.every(isCancelled)) {
      return { dayKey, dayLong: longDay(dayKey), scope: 'alle' }
    }
    if (home.length >= MIN_FOR_ALL && home.every(isCancelled)) {
      return { dayKey, dayLong: longDay(dayKey), scope: 'thuis' }
    }
  }
  return null
}

/**
 * Test modes on previews and locally (never on the live site, see isProduction in
 * lib/site-env): ?afgelasting=test, =veel or =alles pretends that real upcoming matches are
 * cancelled. The same matches as on the programme and the match page in test mode
 * (testCancelledCodes), so the links in the bar lead to real match pages.
 */
function testData(all: ScheduleMatch[]): Record<string, CancellationData> {
  const today = amsterdamToday()
  const result: Record<string, CancellationData> = {}
  for (const mode of ['test', 'veel', 'alles'] as const) {
    const codes = testCancelledCodes(all, mode, today)
    const picked = all
      .filter((m) => codes.has(m.matchCode))
      .sort((a, b) => a.dayKey.localeCompare(b.dayKey) || a.time.localeCompare(b.time))
    const day = picked[0]?.dayKey
    result[mode] = {
      matches: picked.map(toCancelled),
      allCancelled:
        mode === 'alles' && day ? { dayKey: day, dayLong: longDay(day), scope: 'thuis' } : null,
    }
  }
  return result
}

/**
 * Cancelled matches of our own teams in the coming days: a yellow bar above the header on a
 * computer, a popup from the bottom on a phone. Renders nothing when there are none, or when
 * the Sportlink data cannot be loaded (apart from the test modes above).
 */
export default async function CancellationBanner() {
  let data: CancellationData = { matches: [], allCancelled: null }
  let all: ScheduleMatch[] = []

  try {
    const from = amsterdamDayKey(0)
    const to = amsterdamDayKey(DAYS_AHEAD)
    all = await clubScheduleQuery('alles').queryFn()
    const own = all.filter((m) => m.isOwn && m.dayKey >= from && m.dayKey <= to)
    const cancelled = own.filter(isCancelled)
    data = {
      matches: cancelled
        .sort((a, b) => a.dayKey.localeCompare(b.dayKey) || a.time.localeCompare(b.time))
        .map(toCancelled),
      allCancelled: cancelled.length ? findAllCancelled(own) : null,
    }
  } catch {
    // No Sportlink data: no bar.
  }

  const tests = isProduction() || all.length === 0 ? undefined : testData(all)
  if (data.matches.length === 0 && !tests) {
    return null
  }
  return <CancellationBannerClient data={data} tests={tests} />
}
