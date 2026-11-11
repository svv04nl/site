import React from 'react'
import { clubScheduleQuery } from '@/lib/clubdata/queries'
import type { ScheduleMatch } from '@/lib/clubdata/transform'
import { isProduction } from '@/lib/site-env'
import {
  CancellationBannerClient,
  type AllCancelled,
  type CancellationData,
  type CancelledMatch,
} from './CancellationBannerClient'

// Sportlink puts these words in a match's status when it does not go ahead.
const CANCELLED_KEYWORDS = ['afgelast', 'uitgesteld', 'gestaakt', 'afgekeurd']

// Show cancellations for today and the next few days, so a Saturday cancellation
// is already visible on Thursday or Friday.
const DAYS_AHEAD = 3

// "Everything is cancelled" needs at least this many matches on that day, so one
// cancelled home match on a quiet Tuesday does not count as a club-wide decision.
const MIN_FOR_ALL = 2

const isCancelled = (m: ScheduleMatch) =>
  CANCELLED_KEYWORDS.some((kw) => m.status?.toLowerCase().includes(kw))

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

// Test modes: on previews and locally (never on the live site, see isProduction in
// lib/site-env), add ?afgelasting=test, =veel or =alles to any URL.
function testData(): Record<string, CancellationData> {
  const day = amsterdamDayKey(2)
  const m = (
    matchCode: number,
    time: string,
    home: string,
    away: string,
    isHome = true,
  ): CancelledMatch => ({ matchCode, dayKey: day, day: shortDay(day), time, home, away, isHome })
  const few = [
    m(1, '14:00', "SVV'04 1", 'Testclub 1'),
    m(2, '09:00', "SVV'04 JO11-1", 'Testclub JO11-2'),
  ]
  const many = [
    ...few,
    m(3, '12:30', 'Testclub 2', "SVV'04 2", false),
    m(4, '10:30', "SVV'04 JO13-1", 'Testclub JO13-3'),
    m(5, '11:00', 'Testclub MO15-1', "SVV'04 MO15-1", false),
    m(6, '12:00', "SVV'04 VR1", 'Testclub VR1'),
    m(7, '08:30', "SVV'04 JO9-2", 'Testclub JO9-1'),
  ]
  const homeOnly = many.filter((x) => x.isHome)
  return {
    test: { matches: few, allCancelled: null },
    veel: { matches: many, allCancelled: null },
    alles: {
      matches: homeOnly,
      allCancelled: { dayKey: day, dayLong: longDay(day), scope: 'thuis' },
    },
  }
}

/**
 * Cancelled matches of our own teams in the coming days: a yellow bar above the header on a
 * computer, a popup from the bottom on a phone. Renders nothing when there are none, or when
 * the Sportlink data cannot be loaded (apart from the test modes above).
 */
export default async function CancellationBanner() {
  let data: CancellationData = { matches: [], allCancelled: null }

  try {
    const from = amsterdamDayKey(0)
    const to = amsterdamDayKey(DAYS_AHEAD)
    const own = (await clubScheduleQuery('alles').queryFn()).filter(
      (m) => m.isOwn && m.dayKey >= from && m.dayKey <= to,
    )
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

  const tests = isProduction() ? undefined : testData()
  if (data.matches.length === 0 && !tests) {
    return null
  }
  return <CancellationBannerClient data={data} tests={tests} />
}
