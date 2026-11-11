// "Zet in agenda" for one event, without a server: a link that opens Google Agenda or Outlook
// with the event filled in, and an .ics file for Apple and other calendar apps. A website
// cannot write into someone's calendar itself, so these are the ways to hand an event over.

export type CalendarEvent = {
  title: string
  /** Start and end as moments in time. Leave out for an event that lasts whole days. */
  start?: Date
  end?: Date
  /** Whole days, as YYYY-MM-DD in Dutch time. `lastDay` is included. */
  firstDay?: string
  lastDay?: string
  location?: string
  details?: string
}

const SENIOR_MINUTES = 120
const YOUTH_MINUTES = 90

/** Youth teams (JO11-1, MO15-2, O9-3) play shorter matches than seniors. */
export const matchMinutes = (ownTeamName: string) =>
  /\b[JM]?O\d{1,2}\b/i.test(ownTeamName) ? YOUTH_MINUTES : SENIOR_MINUTES

export const addMinutes = (d: Date, minutes: number) => new Date(d.getTime() + minutes * 60_000)

/** A date and time in Dutch time (Europe/Amsterdam) as a moment, wherever the visitor is. */
export function amsterdamTime(day: string, time: string): Date | undefined {
  const [y, m, d] = day.split('-').map(Number)
  const [h, min] = time.split(':').map(Number)
  if (!y || !m || !d || Number.isNaN(h) || Number.isNaN(min)) {
    return undefined
  }

  const guess = Date.UTC(y, m - 1, d, h, min)
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Europe/Amsterdam',
      hourCycle: 'h23',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
      .formatToParts(new Date(guess))
      .map((p) => [p.type, p.value]),
  )
  const shown = Date.UTC(+parts.year, +parts.month - 1, +parts.day, +parts.hour, +parts.minute)
  return new Date(guess - (shown - guess))
}

/** YYYY-MM-DD of a moment in Dutch time. */
export const amsterdamDay = (d: Date) =>
  new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Amsterdam' }).format(d)

function nextDay(day: string): string {
  const d = new Date(`${day}T12:00:00Z`)
  d.setUTCDate(d.getUTCDate() + 1)
  return d.toISOString().slice(0, 10)
}

const utcStamp = (d: Date) =>
  d
    .toISOString()
    .replace(/[-:]/g, '')
    .replace(/\.\d{3}/, '')
const compactDay = (day: string) => day.replace(/-/g, '')

export function googleCalendarUrl(e: CalendarEvent): string {
  const dates =
    e.start && e.end
      ? `${utcStamp(e.start)}/${utcStamp(e.end)}`
      : `${compactDay(e.firstDay!)}/${compactDay(nextDay(e.lastDay ?? e.firstDay!))}`
  const params = new URLSearchParams({ action: 'TEMPLATE', text: e.title, dates })
  if (e.location) {
    params.set('location', e.location)
  }
  if (e.details) {
    params.set('details', e.details)
  }
  return `https://calendar.google.com/calendar/render?${params}`
}

export function outlookCalendarUrl(e: CalendarEvent): string {
  const params = new URLSearchParams({
    path: '/calendar/action/compose',
    rru: 'addevent',
    subject: e.title,
  })
  if (e.start && e.end) {
    params.set('startdt', e.start.toISOString())
    params.set('enddt', e.end.toISOString())
  } else {
    params.set('startdt', e.firstDay!)
    params.set('enddt', nextDay(e.lastDay ?? e.firstDay!))
    params.set('allday', 'true')
  }
  if (e.location) {
    params.set('location', e.location)
  }
  if (e.details) {
    params.set('body', e.details)
  }
  return `https://outlook.live.com/calendar/0/deeplink/compose?${params}`
}

const escapeText = (s: string) =>
  s
    .replace(/\\/g, '\\\\')
    .replace(/\r?\n/g, '\\n')
    .replace(/([,;])/g, '\\$1')

/** The event as an .ics file, for Apple Agenda, Outlook on a computer and other apps. */
export function icsText(e: CalendarEvent): string {
  const when =
    e.start && e.end
      ? [`DTSTART:${utcStamp(e.start)}`, `DTEND:${utcStamp(e.end)}`]
      : [
          `DTSTART;VALUE=DATE:${compactDay(e.firstDay!)}`,
          `DTEND;VALUE=DATE:${compactDay(nextDay(e.lastDay ?? e.firstDay!))}`,
        ]
  const uid = `${compactDay(e.firstDay ?? (e.start ? amsterdamDay(e.start) : ''))}-${e.title.replace(/\W+/g, '').slice(0, 40)}@svv04.nl`
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    "PRODID:-//SVV'04//Agenda//NL",
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${utcStamp(new Date())}`,
    ...when,
    `SUMMARY:${escapeText(e.title)}`,
    ...(e.location ? [`LOCATION:${escapeText(e.location)}`] : []),
    ...(e.details ? [`DESCRIPTION:${escapeText(e.details)}`] : []),
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n')
}
