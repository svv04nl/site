import { parse, parseISO, isValid, startOfISOWeek, addDays, format, getISOWeek } from 'date-fns'
import { nl } from 'date-fns/locale'
import type {
  RawProgrammaResponse,
  RawPoulestandResponse,
  RawPeriodestandResponse,
  RawTeamIndelingResponse,
  RawPouleIndelingResponse,
  RawPouleUitslagenResponse,
  StandingRow,
} from './types'
import type { MatchData } from '@/components/NextMatchCard'

// ─── Date utilities ───────────────────────────────────────────────────────────

function parseDateStr(s: string): Date | null {
  if (!s) return null

  // ISO 8601 with time: "2026-04-04T08:45:00+0200"
  if (s.includes('T')) {
    const d = parseISO(s)
    return isValid(d) ? d : null
  }

  const dateOnly = s.split(' ')[0] // trim time suffix: "2026-04-11 00:00:00.00" → "2026-04-11"

  // "YYYY-MM-DD"
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateOnly)) {
    const d = parseISO(dateOnly)
    return isValid(d) ? d : null
  }
  // "DD-MM-YYYY"
  const d2 = parse(dateOnly, 'dd-MM-yyyy', new Date())
  if (isValid(d2)) return d2
  // "YYYYMMDD"
  const d3 = parse(dateOnly, 'yyyyMMdd', new Date())
  if (isValid(d3)) return d3

  return null
}

function getMondayKey(date: Date): string {
  return format(startOfISOWeek(date), 'yyyy-MM-dd')
}

function formatDisplayDate(d: Date): string {
  return format(d, 'EEE d MMMM', { locale: nl })
}

function formatDayLabel(d: Date): string {
  const label = format(d, 'EEEE d MMMM yyyy', { locale: nl })
  return label.charAt(0).toUpperCase() + label.slice(1)
}

// ─── Next match ───────────────────────────────────────────────────────────────

export function transformNextMatch(raw: RawProgrammaResponse, teamcode: number): MatchData | null {
  const match = raw.find((m) => m.eigenteam === 'true') ?? raw[0]
  if (!match) return null

  const isHome = match.thuisteamid === teamcode

  const matchDate = parseDateStr(match.wedstrijddatum) ?? parseDateStr(match.datum)
  const displayDate = matchDate
    ? format(matchDate, 'EEE d MMMM', { locale: nl })
    : (match.datum ?? '')
  const displayDateShort = matchDate
    ? format(matchDate, 'EEE d MMM', { locale: nl })
    : (match.datum ?? '')

  return {
    date: displayDate,
    dateShort: displayDateShort,
    dateISO: matchDate ? matchDate.toISOString() : undefined,
    time: match.aanvangstijd, // "10:30"
    matchCode: match.wedstrijdcode,
    homeTeam: {
      name: match.thuisteam,
      clubRelatiecode: match.thuisteamclubrelatiecode || undefined,
      isOwn: isHome,
      location: 'Thuis',
    },
    awayTeam: {
      name: match.uitteam,
      clubRelatiecode: match.uitteamclubrelatiecode || undefined,
      isOwn: !isHome,
      location: 'Uit',
    },
  }
}

// ─── Team roster ──────────────────────────────────────────────────────────────

export type TeamMember = {
  name: string
  role?: string
}

export type TeamRosterData = {
  players: TeamMember[]
  staff: { role: string; members: TeamMember[] }[]
  hiddenCount: number
}

export function transformTeamRoster(raw: RawTeamIndelingResponse): TeamRosterData {
  let hiddenCount = 0
  const players: TeamMember[] = []
  const staffMap = new Map<string, TeamMember[]>()

  for (const member of raw) {
    if (member.relatiecode === null) {
      hiddenCount++
      continue
    }

    const name = formatName(member)
    const entry: TeamMember = { name, role: member.functie || undefined }

    if (member.rol === 'Teamspeler') {
      players.push(entry)
    } else {
      const key = member.functie || member.rol
      if (!staffMap.has(key)) staffMap.set(key, [])
      staffMap.get(key)!.push(entry)
    }
  }

  players.sort((a, b) => a.name.localeCompare(b.name, 'nl'))

  const staff = Array.from(staffMap.entries()).map(([role, members]) => ({
    role,
    members: members.sort((a, b) => a.name.localeCompare(b.name, 'nl')),
  }))

  return { players, staff, hiddenCount }
}

function formatName(lid: {
  voornaam: string | null
  tussenvoegsel: string | null
  achternaam: string | null
}): string {
  const parts = [lid.voornaam, lid.tussenvoegsel, lid.achternaam].filter(Boolean)
  return parts.join(' ')
}

// ─── Schedule (poule-programma) ───────────────────────────────────────────────

export type ScheduleMatch = {
  matchCode: number
  date: string // e.g. "za 5 april" for display
  time: string
  homeTeam: string
  homeTeamRelatiecode?: string
  awayTeam: string
  awayTeamRelatiecode?: string
  venue: string
  status: string
  isOwnHome: boolean
  isOwnAway: boolean
  isOwn: boolean
  weekKey: string // "YYYY-MM-DD" Monday of the week
  dayKey: string // "YYYY-MM-DD"
}

export type ScheduleDayGroup = {
  dayKey: string
  label: string // e.g. "Zondag 10 september 2026"
  matches: ScheduleMatch[]
}

export type ScheduleWeekGroup = {
  weekKey: string
  label: string
  days: ScheduleDayGroup[]
}

export function transformSchedule(
  raw: RawProgrammaResponse,
  clubRelatiecode: string,
  teamcode?: number,
): ScheduleMatch[] {
  return raw.map((w) => {
    const isOwnHome =
      w.thuisteamclubrelatiecode !== undefined
        ? w.thuisteamclubrelatiecode === clubRelatiecode
        : teamcode !== undefined && w.thuisteamid === teamcode
    const isOwnAway =
      w.uitteamclubrelatiecode !== undefined
        ? w.uitteamclubrelatiecode === clubRelatiecode
        : teamcode !== undefined && w.uitteamid === teamcode
    const isOwn = w.eigenteam !== undefined ? w.eigenteam === 'true' : isOwnHome || isOwnAway

    // poule-programma uses `datum` as the date field; programma uses `wedstrijddatum`
    const date = parseDateStr(w.wedstrijddatum) ?? parseDateStr(w.datum)
    const weekKey = date ? getMondayKey(date) : 'unknown'
    const dayKey = date ? format(date, 'yyyy-MM-dd') : 'unknown'
    const displayDate = date ? formatDisplayDate(date) : w.datum || ''

    const homeRelatiecode = w.thuisteamclubrelatiecode || undefined
    const awayRelatiecode = w.uitteamclubrelatiecode || undefined

    return {
      matchCode: w.wedstrijdcode,
      date: displayDate,
      time: w.aanvangstijd,
      homeTeam: w.thuisteam,
      homeTeamRelatiecode: homeRelatiecode,
      awayTeam: w.uitteam,
      awayTeamRelatiecode: awayRelatiecode,
      venue: w.accommodatie,
      status: w.status,
      isOwnHome,
      isOwnAway,
      isOwn,
      weekKey,
      dayKey,
    }
  })
}

function groupMatchesByDay(matches: ScheduleMatch[]): ScheduleDayGroup[] {
  const map = new Map<string, ScheduleMatch[]>()

  for (const m of matches) {
    if (!map.has(m.dayKey)) map.set(m.dayKey, [])
    map.get(m.dayKey)!.push(m)
  }

  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([dayKey, dMatches]) => ({
      dayKey,
      label: dayKey === 'unknown' ? '' : formatDayLabel(parse(dayKey, 'yyyy-MM-dd', new Date())),
      matches: dMatches,
    }))
}

export function groupScheduleByWeek(matches: ScheduleMatch[]): ScheduleWeekGroup[] {
  const map = new Map<string, ScheduleMatch[]>()

  for (const m of matches) {
    if (!map.has(m.weekKey)) map.set(m.weekKey, [])
    map.get(m.weekKey)!.push(m)
  }

  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([weekKey, wMatches]) => ({
      weekKey,
      label: `Week ${getISOWeek(parse(weekKey, 'yyyy-MM-dd', new Date()))}`,
      days: groupMatchesByDay(wMatches),
    }))
}

export type ScheduleRange = 'vandaag' | 'deze-week' | 'volgende-week'

export function filterScheduleByRange(
  matches: ScheduleMatch[],
  range: ScheduleRange,
): ScheduleMatch[] {
  if (range === 'vandaag') {
    const todayKey = format(new Date(), 'yyyy-MM-dd')
    return matches.filter((m) => m.dayKey === todayKey)
  }

  const thisWeekKey = getMondayKey(new Date())
  if (range === 'deze-week') {
    return matches.filter((m) => m.weekKey === thisWeekKey)
  }

  const nextWeekKey = format(addDays(parse(thisWeekKey, 'yyyy-MM-dd', new Date()), 7), 'yyyy-MM-dd')
  return matches.filter((m) => m.weekKey === nextWeekKey)
}

// ─── Standings (poulestand) ───────────────────────────────────────────────────

export function transformStandings(
  raw: RawPoulestandResponse,
  ownRelatiecode?: string,
): StandingRow[] {
  return raw.map((row) => {
    const isOwn =
      row.eigenteam === 'true' || (!!ownRelatiecode && row.clubrelatiecode === ownRelatiecode)

    const note =
      row.aantekening || (row.verliespunten > 0 ? `${row.verliespunten} verliespunten` : undefined)

    return {
      position: row.positie,
      teamName: row.teamnaam,
      clubRelatiecode: row.clubrelatiecode || undefined,
      isOwn,
      played: row.gespeeldewedstrijden,
      won: row.gewonnen,
      drawn: row.gelijk,
      lost: row.verloren,
      goalsFor: row.doelpuntenvoor,
      goalsAgainst: row.doelpuntentegen,
      goalDiff: row.doelsaldo,
      points: row.punten,
      note,
    }
  })
}

export function transformPeriodeStandings(
  raw: RawPeriodestandResponse,
  ownRelatiecode?: string,
): StandingRow[] {
  return raw.map((row) => {
    const isOwn = row.eigenteam === 'true' || (!!ownRelatiecode && row.clubcode === ownRelatiecode)

    const note =
      row.aantekening || (row.verliespunten > 0 ? `${row.verliespunten} verliespunten` : undefined)

    return {
      position: row.positie,
      teamName: row.teamnaam,
      clubRelatiecode: row.clubcode || undefined,
      isOwn,
      played: row.aantalwedstrijden,
      won: row.gewonnen,
      drawn: row.gelijkspel,
      lost: row.verloren,
      goalsFor: row.doelpuntenvoor,
      goalsAgainst: row.tegendoelpunten,
      goalDiff: row.doelsaldo,
      points: row.totaalpunten,
      note,
    }
  })
}

// ─── Lineup (poule-indeling) ──────────────────────────────────────────────────

export type LineupEntry = {
  teamName: string
  speelnummer: string
  speeldag: string
  starttijd: string
  isOwn: boolean
}

export function transformLineup(raw: RawPouleIndelingResponse): LineupEntry[] {
  return raw.map((e) => ({
    teamName: e.teamnaam,
    speelnummer: e.speelnummer,
    speeldag: e.speeldag,
    starttijd: e.starttijd,
    isOwn: e.eigenteam === 'true',
  }))
}

// ─── Results (pouleuitslagen) ─────────────────────────────────────────────────

export type ResultMatch = {
  matchCode: number
  date: string
  homeTeam: string
  homeTeamRelatiecode?: string
  awayTeam: string
  awayTeamRelatiecode?: string
  score: string
  status: string
  isOwnHome: boolean
  isOwnAway: boolean
  isOwn: boolean
  weekKey: string
}

export function transformResults(
  raw: RawPouleUitslagenResponse,
  clubRelatiecode: string,
): ResultMatch[] {
  return raw.map((w) => {
    const isOwnHome = w.thuisteamclubrelatiecode === clubRelatiecode
    const isOwnAway = w.uitteamclubrelatiecode === clubRelatiecode
    const isOwn = isOwnHome || isOwnAway

    const date = parseDateStr(w.datum) ?? parseDateStr(w.wedstrijddatum)
    const weekKey = date ? getMondayKey(date) : 'unknown'
    const displayDate = date ? formatDisplayDate(date) : w.datumopgemaakt || ''

    const homeRelatiecode = w.thuisteamclubrelatiecode || undefined
    const awayRelatiecode = w.uitteamclubrelatiecode || undefined

    return {
      matchCode: w.wedstrijdcode,
      date: displayDate,
      homeTeam: w.thuisteam,
      homeTeamRelatiecode: homeRelatiecode,
      awayTeam: w.uitteam,
      awayTeamRelatiecode: awayRelatiecode,
      score: w.uitslag,
      status: w.status,
      isOwnHome,
      isOwnAway,
      isOwn,
      weekKey,
    }
  })
}

export function groupResultsByWeek(
  matches: ResultMatch[],
): { weekKey: string; label: string; matches: ResultMatch[] }[] {
  const map = new Map<string, ResultMatch[]>()
  for (const m of matches) {
    if (!map.has(m.weekKey)) map.set(m.weekKey, [])
    map.get(m.weekKey)!.push(m)
  }

  return Array.from(map.entries())
    .sort(([a], [b]) => b.localeCompare(a)) // newest first
    .map(([weekKey, wMatches]) => ({
      weekKey,
      label: `Week ${getISOWeek(parse(weekKey, 'yyyy-MM-dd', new Date()))}`,
      matches: wMatches,
    }))
}
