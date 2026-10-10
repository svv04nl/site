const TIME_ZONE = 'Europe/Amsterdam'

/** Today as YYYY-MM-DD in Amsterdam time (Vercel servers run in UTC). */
export function todayInAmsterdam(now = new Date()): string {
  return new Intl.DateTimeFormat('sv-SE', { timeZone: TIME_ZONE }).format(now)
}

/** "zaterdag 10 oktober 2026, 14:05" for the system prompt. */
export function nowInAmsterdamLong(now = new Date()): string {
  return new Intl.DateTimeFormat('nl-NL', {
    timeZone: TIME_ZONE,
    dateStyle: 'full',
    timeStyle: 'short',
  }).format(now)
}

export function addDays(isoDate: string, days: number): string {
  const d = new Date(`${isoDate}T12:00:00Z`)
  d.setUTCDate(d.getUTCDate() + days)
  return d.toISOString().slice(0, 10)
}

/** "zondag 11 oktober 2026" for a YYYY-MM-DD date. Tools return this so the model never computes weekdays itself. */
export function dateLabel(isoDate: string): string {
  if (!/^\d{4}-\d{2}-\d{2}/.test(isoDate)) return isoDate
  return new Intl.DateTimeFormat('nl-NL', {
    timeZone: 'UTC',
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(`${isoDate.slice(0, 10)}T12:00:00Z`))
}

/** "zo 11 okt" for a YYYY-MM-DD date, for compact cards. */
export function dateShort(isoDate: string): string {
  if (!/^\d{4}-\d{2}-\d{2}/.test(isoDate)) return isoDate
  return new Intl.DateTimeFormat('nl-NL', {
    timeZone: 'UTC',
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  })
    .format(new Date(`${isoDate.slice(0, 10)}T12:00:00Z`))
    .replace(/\./g, '')
}
