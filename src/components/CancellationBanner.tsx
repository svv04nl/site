import React from 'react'
import { clubScheduleQuery } from '@/lib/clubdata/queries'
import { shortTeamName } from '@/lib/app-api/format'
import { CancellationBannerClient, type CancelledMatch } from './CancellationBannerClient'

// Sportlink puts these words in a match's status when it does not go ahead.
const CANCELLED_KEYWORDS = ['afgelast', 'uitgesteld', 'gestaakt', 'afgekeurd']

// Show cancellations for today and the next few days, so a Saturday cancellation
// is already visible on Thursday or Friday.
const DAYS_AHEAD = 3

/** "YYYY-MM-DD" for today in Dutch time, plus `offset` days. */
function amsterdamDayKey(offset = 0) {
  const date = new Date(Date.now() + offset * 24 * 60 * 60 * 1000)
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Amsterdam' }).format(date)
}

/**
 * Yellow bar above the header listing our own matches that Sportlink marks as
 * cancelled in the coming days. Renders nothing when there are none, or when
 * the Sportlink data cannot be loaded.
 */
export default async function CancellationBanner() {
  let cancelled: CancelledMatch[] = []

  try {
    const matches = await clubScheduleQuery('alles').queryFn()
    const from = amsterdamDayKey(0)
    const to = amsterdamDayKey(DAYS_AHEAD)

    cancelled = matches
      .filter((m) => m.isOwn && m.dayKey >= from && m.dayKey <= to)
      .filter((m) => CANCELLED_KEYWORDS.some((kw) => m.status?.toLowerCase().includes(kw)))
      .map((m) => ({
        matchCode: m.matchCode,
        label: `${shortTeamName(m.homeTeam)} – ${shortTeamName(m.awayTeam)}`,
      }))
  } catch {
    return null
  }

  if (cancelled.length === 0) return null
  return <CancellationBannerClient matches={cancelled} />
}
