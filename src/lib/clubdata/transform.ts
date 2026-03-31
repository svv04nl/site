import { parse, parseISO, isValid, startOfISOWeek, addDays, format, getISOWeek } from 'date-fns'
import { nl } from 'date-fns/locale'
import type {
  RawProgrammaResponse,
  RawPoulestandResponse,
  RawTeamIndelingResponse,
  RawPouleIndelingResponse,
  RawPouleUitslagenResponse,
} from './types'
import type { StandingRow } from '@/components/TeamLeagueTabs'
import type { MatchData } from '@/components/NextMatch'

// ─── Date utilities ───────────────────────────────────────────────────────────

function parseDateStr(s: string): Date | null {
  if (!s) return null

  // ISO 8601 with time: "2026-04-04T08:45:00+0200"
  if (s.includes('T')) {
    const d = parseISO(s)
    return isValid(d) ? d : null
  }

  const dateOnly = s.split(' ')[0]  // trim time suffix: "2026-04-11 00:00:00.00" → "2026-04-11"

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


function formatWeekRange(mondayKey: string): string {
  const monday = parse(mondayKey, 'yyyy-MM-dd', new Date())
  if (!isValid(monday)) return mondayKey
  const sunday = addDays(monday, 6)
  const week = getISOWeek(monday)
  return `Week ${week} · ${format(monday, 'd MMMM', { locale: nl })} – ${format(sunday, 'd MMMM', { locale: nl })}`
}

function formatDisplayDate(d: Date): string {
  return format(d, 'EEE d MMMM', { locale: nl })
}

// ─── Next match ───────────────────────────────────────────────────────────────

export function transformNextMatch(
  raw: RawProgrammaResponse,
  teamcode: number,
): MatchData | null {
  const match = raw[0]
  if (!match) return null

  const isHome = match.thuisteamid === teamcode

  const matchDate = parseDateStr(match.wedstrijddatum) ?? parseDateStr(match.datum)
  const displayDate = matchDate ? format(matchDate, 'EEE d MMMM', { locale: nl }) : (match.datum ?? '')

  return {
    date: displayDate,
    time: match.aanvangstijd,   // "10:30"
    homeTeam: {
      name: match.thuisteam,
      logoUrl: match.thuisteamlogo || undefined,
      isOwn: isHome,
      location: 'Thuis',
    },
    awayTeam: {
      name: match.uitteam,
      logoUrl: match.uitteamlogo || undefined,
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

  for (const lid of raw) {
    if (lid.relatiecode === null) {
      hiddenCount++
      continue
    }

    const name = formatName(lid)
    const entry: TeamMember = { name, role: lid.functie || undefined }

    if (lid.rol === 'Teamspeler') {
      players.push(entry)
    } else {
      const key = lid.functie || lid.rol
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
  date: string           // e.g. "za 5 april" for display
  time: string
  homeTeam: string
  homeTeamLogo?: string
  awayTeam: string
  awayTeamLogo?: string
  venue: string
  status: string
  isOwnHome: boolean
  isOwnAway: boolean
  isOwn: boolean
  weekKey: string        // "YYYY-MM-DD" Monday of the week
}

export type ScheduleWeekGroup = {
  weekKey: string
  label: string
  matches: ScheduleMatch[]
}

export function transformSchedule(
  raw: RawProgrammaResponse,
  clubRelatiecode: string,
): ScheduleMatch[] {
  return raw.map((w) => {
    const isOwnHome = w.thuisteamclubrelatiecode === clubRelatiecode
    const isOwnAway = w.uitteamclubrelatiecode === clubRelatiecode
    const isOwn = isOwnHome || isOwnAway

    // poule-programma uses `datum` as the date field; programma uses `wedstrijddatum`
    const date = parseDateStr(w.wedstrijddatum) ?? parseDateStr(w.datum)
    const weekKey = date ? getMondayKey(date) : 'unknown'
    const displayDate = date ? formatDisplayDate(date) : (w.datum || '')

    return {
      matchCode: w.wedstrijdcode,
      date: displayDate,
      time: w.aanvangstijd,
      homeTeam: w.thuisteam,
      homeTeamLogo: w.thuisteamlogo || undefined,
      awayTeam: w.uitteam,
      awayTeamLogo: w.uitteamlogo || undefined,
      venue: w.accommodatie,
      status: w.status || 'Te spelen',
      isOwnHome,
      isOwnAway,
      isOwn,
      weekKey,
    }
  })
}

export function groupScheduleByWeek(matches: ScheduleMatch[]): ScheduleWeekGroup[] {
  const thisWeek = getMondayKey(new Date())
  const nextWeek = format(addDays(parse(thisWeek, 'yyyy-MM-dd', new Date()), 7), 'yyyy-MM-dd')
  const map = new Map<string, ScheduleMatch[]>()

  for (const m of matches) {
    if (!map.has(m.weekKey)) map.set(m.weekKey, [])
    map.get(m.weekKey)!.push(m)
  }

  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([weekKey, wMatches]) => ({
      weekKey,
      label: weekKey === thisWeek
        ? 'Deze week'
        : weekKey === nextWeek
          ? 'Volgende week'
          : `Week ${getISOWeek(parse(weekKey, 'yyyy-MM-dd', new Date()))}`,
      matches: wMatches,
    }))
}

// ─── Standings (poulestand) ───────────────────────────────────────────────────

export function transformStandings(raw: RawPoulestandResponse): StandingRow[] {
  return raw.map((row) => ({
    position: row.positie,
    teamName: row.teamnaam,
    logoUrl: row.clublogo || undefined,
    isOwn: row.eigenteam === 'true',
    played: row.gespeeldewedstrijden,
    won: row.gewonnen,
    drawn: row.gelijk,
    lost: row.verloren,
    goalsFor: row.doelpuntenvoor,
    goalsAgainst: row.doelpuntentegen,
    goalDiff: row.doelsaldo,
    points: row.punten,
  }))
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
  awayTeam: string
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
    const displayDate = date ? formatDisplayDate(date) : (w.datumopgemaakt || '')

    return {
      matchCode: w.wedstrijdcode,
      date: displayDate,
      homeTeam: w.thuisteam,
      awayTeam: w.uitteam,
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
