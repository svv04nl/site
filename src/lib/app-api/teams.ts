import { getPayload } from 'payload'
import config from '@payload-config'
import type { Sponsor, Team } from '@/payload-types'
import { CLUB_RELATIECODE } from '@/lib/clubdata/config'
import { fetchClubData } from '@/lib/clubdata/fetch'
import { standingsQuery, teamPoulesQuery, teamRosterQuery } from '@/lib/clubdata/queries'
import { cached } from '@/lib/ai/cache'
import { mapMatches, nextMatchOf, type SportlinkMatch } from '@/lib/app-api/matches'
import { toImage } from '@/lib/app-api/media'
import { toTeamRef } from '@/lib/app-api/posts'
import type { MatchDto, SponsorDto, StandingsDto, TeamDto } from '@/lib/app-api/types'
import { sortTeamsByPriority } from '@/lib/team-search'

const TTL_MS = 5 * 60 * 1000
const LOGO_URL = 'https://logoapi.voetbal.nl/logo.php?clubcode='

/** All teams with their photo, in site order (seniors first, then youth from old to young). */
export function loadTeamDocs(): Promise<Team[]> {
  return cached('app-team-docs', TTL_MS, async () => {
    const payload = await getPayload({ config })
    const { docs } = await payload.find({
      collection: 'teams',
      sort: 'order',
      // Depth 2: the photo, the team sponsors and the logo of each sponsor.
      depth: 2,
      limit: 200,
      pagination: false,
    })
    return sortTeamsByPriority(docs)
  })
}

export const toTeam = (
  team: Team,
  { nextMatch, photoSize = 'teamCard' }: { nextMatch?: MatchDto | null; photoSize?: 'teamCard' | 'teamPhoto' } = {},
): TeamDto => {
  const photo = toImage(team.photo, photoSize)
  return {
    ...toTeamRef(team),
    type: team.type,
    ...(team.category ? { category: team.category } : {}),
    ...(team.order !== null && team.order !== undefined ? { order: team.order } : {}),
    ...(photo ? { photo } : {}),
    ...(nextMatch !== undefined ? { nextMatch } : {}),
  }
}

const GROUP_TITLES: Record<Team['type'], string> = {
  senior: 'Senioren',
  youth: 'Jeugd',
  other: 'Overig',
}

export async function teamGroups(includeNextMatch: boolean) {
  const teams = await loadTeamDocs()
  const dtos = await Promise.all(
    teams.map(async (team) =>
      toTeam(team, includeNextMatch ? { nextMatch: await nextMatchOf(team.slug) } : {}),
    ),
  )
  return (['senior', 'youth', 'other'] as const)
    .map((type) => ({
      title: GROUP_TITLES[type],
      type,
      teams: dtos.filter((t) => t.type === type),
    }))
    .filter((group) => group.teams.length > 0)
}

// ---------------------------------------------------------------------------------------------
// Staff (team-staff collection, synced from Sportlink). Only name and function are used.

type StaffRow = { name: string; role: string; teamId: number }

async function loadStaff(teamIds: number[]): Promise<StaffRow[]> {
  if (!teamIds.length) return []
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'team-staff',
    where: { team: { in: teamIds } },
    depth: 0,
    limit: 500,
    pagination: false,
    sort: 'name',
  })
  return docs.map((s) => ({
    name: s.name,
    role: s.role,
    teamId: typeof s.team === 'object' ? s.team.id : s.team,
  }))
}

// Head coach first, then assistants, then the team manager, then the rest.
const staffRank = (role: string) => {
  const r = role.toLowerCase()
  if (r.startsWith('assistent-trainer')) return 1
  if (r.startsWith('trainer')) return 0
  if (r.includes('teammanager')) return 2
  return 3
}

const sortStaff = <T extends { role: string; name: string }>(rows: T[]) =>
  [...rows].sort((a, b) => staffRank(a.role) - staffRank(b.role) || a.name.localeCompare(b.name, 'nl'))

/** Name of the head coach per team id (a "Trainer" or "Trainer/coach"; assistants do not count). */
export async function headCoaches(teamIds: number[]): Promise<Map<number, string>> {
  const rows = await loadStaff(teamIds)
  const coaches = new Map<number, string>()
  for (const row of sortStaff(rows)) {
    if (staffRank(row.role) === 0 && !coaches.has(row.teamId)) coaches.set(row.teamId, row.name)
  }
  return coaches
}

// ---------------------------------------------------------------------------------------------
// Team detail

const DETAIL_LIST_LIMIT = 15

/** Runs a Sportlink call; when KNVB is down the detail still returns, just without that part. */
async function optional<T>(run: () => Promise<T>): Promise<T | undefined> {
  try {
    return await run()
  } catch (error) {
    console.error('[app-api] team detail part failed', error)
    return undefined
  }
}

async function teamProgram(teamcode: number): Promise<MatchDto[]> {
  const raw = await fetchClubData<SportlinkMatch[]>('programma', {
    teamcode: String(teamcode),
    lokaleteamcode: 'NULL',
    aantaldagen: '365',
    aantalregels: String(DETAIL_LIST_LIMIT),
  })
  return mapMatches(raw)
}

async function teamResults(teamcode: number): Promise<MatchDto[]> {
  const poules = await teamPoulesQuery(teamcode).queryFn()
  const league = [...poules.poules, ...poules.fasePoules].filter((p) => p.poulecode)
  const cup = poules.cupPoules.filter((p) => p.poulecode)

  const lists = await Promise.all([
    ...league.map((p) =>
      fetchClubData<SportlinkMatch[]>('pouleuitslagen', {
        poulecode: String(p.poulecode),
        eigenwedstrijden: 'NEE',
        aantaldagen: '100',
      }),
    ),
    ...cup.map((p) =>
      fetchClubData<SportlinkMatch[]>('pouleuitslagen', {
        poulecode: String(p.poulecode),
        aantaldagen: '365',
        weekoffset: '-52',
        eigenwedstrijden: 'NEE',
        gebruiklokaleteamgegevens: 'NEE',
      }),
    ),
  ])

  // A poule lists every match in it; keep the matches this team played (once each).
  const own = new Map<number, SportlinkMatch>()
  for (const m of lists.flat()) {
    if (String(m.thuisteamid) === String(teamcode) || String(m.uitteamid) === String(teamcode)) {
      own.set(m.wedstrijdcode, m)
    }
  }
  const matches = await mapMatches([...own.values()])
  return matches
    .sort((a, b) => b.date.localeCompare(a.date) || b.kickoff.localeCompare(a.kickoff))
    .slice(0, DETAIL_LIST_LIMIT)
}

const faseNumber = (klasse: string) => Number(klasse.match(/\((\d+)[a-z]*\s+fase\)/i)?.[1] ?? -1)

/** The table the team page shows: the highest numbered phase, else the first poule. */
async function teamStandings(teamcode: number): Promise<StandingsDto | undefined> {
  const poules = await teamPoulesQuery(teamcode).queryFn()
  const candidates = [...poules.poules, ...poules.fasePoules].filter((p) => p.poulecode)
  if (!candidates.length) return undefined

  const poule = candidates.reduce((best, p) => (faseNumber(p.klasse) > faseNumber(best.klasse) ? p : best))
  const rows = await standingsQuery(poule.poulecode).queryFn()
  if (!rows.length) return undefined

  const fase = poule.klasse.match(/\((\d+e fase)\)/i)?.[1]
  return {
    competition: poule.klassepoule || poule.klasse,
    ...(fase ? { period: fase } : {}),
    rows: rows.map((row) => ({
      position: row.position,
      team: row.teamName,
      ...(row.clubRelatiecode ? { logoUrl: `${LOGO_URL}${row.clubRelatiecode}` } : {}),
      played: row.played,
      points: row.points,
      isOwn: row.isOwn ?? row.clubRelatiecode === CLUB_RELATIECODE,
    })),
  }
}

function toSponsor(sponsor: Sponsor | number): SponsorDto | undefined {
  if (typeof sponsor !== 'object') return undefined
  const logo = toImage(sponsor.logo)
  return {
    name: sponsor.name,
    ...(logo ? { logo } : {}),
    ...(sponsor.url ? { url: sponsor.url } : {}),
  }
}

export async function teamDetail(team: Team) {
  const teamcode = team.teamcode ?? undefined
  const [staff, roster, program, results, standings, nextMatch] = await Promise.all([
    loadStaff([team.id]),
    teamcode ? optional(() => teamRosterQuery(teamcode).queryFn()) : undefined,
    teamcode ? optional(() => teamProgram(teamcode)) : undefined,
    teamcode ? optional(() => teamResults(teamcode)) : undefined,
    teamcode ? optional(() => teamStandings(teamcode)) : undefined,
    nextMatchOf(team.slug),
  ])
  const kitSponsor = team.sponsors?.map(toSponsor).find(Boolean)

  return {
    ...toTeam(team, { photoSize: 'teamPhoto', nextMatch }),
    staff: sortStaff(staff).map(({ name, role }) => ({ name, role })),
    ...(roster
      ? { players: { names: roster.players.map((p) => p.name), hiddenCount: roster.hiddenCount } }
      : {}),
    ...(program ? { program } : {}),
    ...(results ? { results } : {}),
    ...(standings ? { standings } : {}),
    ...(kitSponsor ? { kitSponsor } : {}),
  }
}
