import { parse, format as formatDate } from 'date-fns'
import { nl } from 'date-fns/locale'
import { clubScheduleQuery } from '@/lib/clubdata/queries'
import { filterScheduleByRange, type ScheduleMatch } from '@/lib/clubdata/transform'

const CANCELLED_KEYWORDS = ['afgelast', 'uitgesteld', 'gestaakt', 'afgekeurd']

export type SocialMatchRow = {
  matchCode: number
  dayKey: string
  time: string
  homeTeam: string
  homeTeamClubcode?: string
  awayTeam: string
  awayTeamClubcode?: string
  isOwnHome: boolean
  venue: string
  venuePlaats: string
  cancelled: boolean
}

export type SocialTeamGroup = {
  /** Group heading — the shared venue name. */
  label: string
  rows: SocialMatchRow[]
  venue?: string
  venuePlaats?: string
}

export type SocialSchedule = {
  teamGroups: SocialTeamGroup[]
  periodLabel: string
}

export type SocialDayOption = {
  dayKey: string
  label: string
}

function capitalize(label: string) {
  return label.charAt(0).toUpperCase() + label.slice(1)
}

/** The 18+/35+/45+/VR18+ categories play in KNVB's "Toernooivorm 7x7" format —
 * several teams sharing one host venue for a whole evening — which the raw
 * `competitie` label always names explicitly (e.g. "0295 Mannen 35+ Vrijdag
 * Toernooivorm 7x7 (najaar)"). That's a more reliable signal than pattern
 * matching team names, and needs no extra lookup — it's on every match already. */
function isTournamentFormat(competitie: string) {
  return /7x7/i.test(competitie)
}

type GroupKey = { key: string; label: string; venue?: string; venuePlaats?: string }

// Some age categories (e.g. mini-toernooien for the youngest teams) list our
// team as "uit" in Sportlink even though the whole event is hosted at our own
// Sportpark de Kampen. So "thuis" is decided by the actual venue, not the
// thuis/uit flag — otherwise those matches silently vanish into "uit".
const HOME_VENUE_MATCH = 'kampen'

function isAtHomeVenue(venue: string) {
  return venue.toLowerCase().includes(HOME_VENUE_MATCH)
}

/** 7x7 tournament matches group by their real shared venue (several
 * categories can each be their own evening at a different sportpark). Every
 * other match groups only by thuis/uit — the specific opponent's venue on an
 * away day isn't useful the way the shared 7x7 venue is. */
function groupKeyFor(m: ScheduleMatch): GroupKey {
  if (isTournamentFormat(m.competitie)) {
    const venue = m.venue || 'Onbekende locatie'
    return { key: `venue:${venue}`, label: venue, venue: m.venue, venuePlaats: m.venuePlaats }
  }
  if (isAtHomeVenue(m.venue)) {
    return { key: 'thuis', label: m.venue, venue: m.venue, venuePlaats: m.venuePlaats }
  }
  return { key: 'uit', label: 'Uitwedstrijden' }
}

function buildVenueGroups(matches: ScheduleMatch[]): SocialTeamGroup[] {
  const groups = new Map<string, SocialTeamGroup>()

  for (const m of matches) {
    const { key, label, venue, venuePlaats } = groupKeyFor(m)
    const cancelled = CANCELLED_KEYWORDS.some((kw) => m.status?.toLowerCase().includes(kw))

    if (!groups.has(key)) groups.set(key, { label, rows: [], venue, venuePlaats })
    groups.get(key)!.rows.push({
      matchCode: m.matchCode,
      dayKey: m.dayKey,
      time: m.time,
      homeTeam: m.homeTeam,
      homeTeamClubcode: m.homeTeamRelatiecode,
      awayTeam: m.awayTeam,
      awayTeamClubcode: m.awayTeamRelatiecode,
      isOwnHome: m.isOwnHome,
      venue: m.venue,
      venuePlaats: m.venuePlaats,
      cancelled,
    })
  }

  return Array.from(groups.values())
    .map((g) => ({
      ...g,
      rows: g.rows.sort(
        (a, b) => a.time.localeCompare(b.time) || a.homeTeam.localeCompare(b.homeTeam, 'nl'),
      ),
    }))
    .sort((a, b) => a.label.localeCompare(b.label, 'nl'))
}

/** All own matches for the current ISO week, across every day. */
export async function getWeekMatches(): Promise<ScheduleMatch[]> {
  const matches = await clubScheduleQuery('alles').queryFn()
  return filterScheduleByRange(matches, 'deze-week').filter((m) => m.isOwn)
}

/** Distinct match days within the week, for a day picker. */
export function getDayOptions(matches: ScheduleMatch[]): SocialDayOption[] {
  const dayKeys = Array.from(new Set(matches.map((m) => m.dayKey)))
    .filter((k) => k !== 'unknown')
    .sort()

  return dayKeys.map((dayKey) => {
    const date = parse(dayKey, 'yyyy-MM-dd', new Date())
    return { dayKey, label: capitalize(formatDate(date, 'EEEE d MMMM', { locale: nl })) }
  })
}

/** The first match day that hasn't passed yet, or the first day overall as a fallback. */
export function pickDefaultDay(options: SocialDayOption[]): string | null {
  if (options.length === 0) return null
  const todayKey = formatDate(new Date(), 'yyyy-MM-dd')
  return options.find((d) => d.dayKey >= todayKey)?.dayKey ?? options[0].dayKey
}

export function getScheduleForDay(matches: ScheduleMatch[], dayKey: string): SocialSchedule {
  const dayMatches = matches.filter((m) => m.dayKey === dayKey)
  const date = parse(dayKey, 'yyyy-MM-dd', new Date())

  return {
    teamGroups: buildVenueGroups(dayMatches),
    periodLabel: capitalize(formatDate(date, 'EEEE d MMMM yyyy', { locale: nl })),
  }
}
