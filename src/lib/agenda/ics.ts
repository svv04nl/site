import { SITE_URL } from '@/lib/app-api/config'
import type { MatchDto } from '@/lib/app-api/types'

// Matches as an iCalendar file (RFC 5545), for "Zet in agenda" on a match and the agenda feed
// per team. Times go out in UTC, so no time zone block is needed. No gathering time: Sportlink
// does not have it for every team.

const SENIOR_MINUTES = 120
const YOUTH_MINUTES = 90

/** Youth teams (JO11-1, MO15-2, O9-3) play shorter matches than seniors. */
const isYouth = (name: string) => /\b[JM]?O\d{1,2}\b/i.test(name)

const escapeText = (s: string) =>
  s
    .replace(/\\/g, '\\\\')
    .replace(/\r?\n/g, '\\n')
    .replace(/([,;])/g, '\\$1')

/** Lines may be at most 75 octets; longer lines continue on the next line after a space. */
function fold(line: string): string {
  const bytes = new TextEncoder()
  if (bytes.encode(line).length <= 75) {
    return line
  }
  const parts: string[] = []
  let current = ''
  for (const char of line) {
    const limit = parts.length ? 74 : 75
    if (bytes.encode(current + char).length > limit) {
      parts.push(current)
      current = char
    } else {
      current += char
    }
  }
  parts.push(current)
  return parts.join('\r\n ')
}

const utcStamp = (d: Date) =>
  d
    .toISOString()
    .replace(/[-:]/g, '')
    .replace(/\.\d{3}/, '')
const dateOnly = (iso: string) => iso.replace(/-/g, '')

function nextDay(iso: string): string {
  const d = new Date(`${iso}T12:00:00Z`)
  d.setUTCDate(d.getUTCDate() + 1)
  return d.toISOString().slice(0, 10)
}

function matchEvent(m: MatchDto, now: Date): string[] {
  const ownName = m.isHomeGame ? m.home.name : m.away.name
  const prefix =
    m.status === 'cancelled' ? 'Afgelast: ' : m.status === 'postponed' ? 'Uitgesteld: ' : ''
  const summary = `${prefix}${m.home.name} - ${m.away.name}`

  const start = m.startsAt ? new Date(m.startsAt) : null
  const when =
    start && !Number.isNaN(start.getTime())
      ? [
          `DTSTART:${utcStamp(start)}`,
          `DTEND:${utcStamp(new Date(start.getTime() + (isYouth(ownName) ? YOUTH_MINUTES : SENIOR_MINUTES) * 60_000))}`,
        ]
      : // No kickoff time known yet: the match goes in as a whole day.
        [`DTSTART;VALUE=DATE:${dateOnly(m.date)}`, `DTEND;VALUE=DATE:${dateOnly(nextDay(m.date))}`]

  // Home: venue and address. Away: venue and place (mapsQuery already holds both).
  const location = m.venue.address
    ? [m.venue.name, m.venue.address].filter(Boolean).join(', ')
    : m.venue.mapsQuery || m.venue.name

  const url = `${SITE_URL}/wedstrijd/${m.id}`
  const description = [
    m.competition,
    m.venue.field ? `Veld ${m.venue.field}` : '',
    `Kijk op ${url} voor de laatste stand van zaken, zoals afgelastingen.`,
  ]
    .filter(Boolean)
    .join('\n')

  return [
    'BEGIN:VEVENT',
    `UID:wedstrijd-${m.id}@svv04.nl`,
    `DTSTAMP:${utcStamp(now)}`,
    ...when,
    `SUMMARY:${escapeText(summary)}`,
    ...(location ? [`LOCATION:${escapeText(location)}`] : []),
    `DESCRIPTION:${escapeText(description)}`,
    `URL:${url}`,
    `STATUS:${m.status === 'cancelled' ? 'CANCELLED' : 'CONFIRMED'}`,
    'END:VEVENT',
  ]
}

/** A calendar with the given matches. `name` makes it a feed you can subscribe to. */
export function matchesToIcs(matches: MatchDto[], name?: string): string {
  const now = new Date()
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    "PRODID:-//SVV'04//Wedstrijden//NL",
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    ...(name
      ? [
          `X-WR-CALNAME:${escapeText(name)}`,
          'X-WR-TIMEZONE:Europe/Amsterdam',
          'REFRESH-INTERVAL;VALUE=DURATION:PT6H',
          'X-PUBLISHED-TTL:PT6H',
        ]
      : []),
    ...matches.flatMap((m) => matchEvent(m, now)),
    'END:VCALENDAR',
  ]
  return lines.map(fold).join('\r\n') + '\r\n'
}

export function icsResponse(body: string, filename: string, download: boolean): Response {
  return new Response(body, {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': `${download ? 'attachment' : 'inline'}; filename="${filename}"`,
      'Cache-Control': 'public, max-age=0, s-maxage=1800, stale-while-revalidate=3600',
    },
  })
}

/**
 * The name in an agenda URL without its `.ics` extension (`svv04-1.ics` gives `svv04-1`), or
 * null when the extension is missing. Calendar apps recognise a feed by that extension.
 */
export function withoutIcsExtension(segment: string): string | null {
  const match = /^(.+)\.ics$/i.exec(segment)
  return match ? match[1] : null
}
