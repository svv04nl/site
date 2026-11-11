import { CLUB_RELATIECODE } from '@/lib/clubdata/config'
import { fetchClubData } from '@/lib/clubdata/fetch'
import { cached } from '@/lib/ai/cache'
import { loadTeams, type TeamSummary } from '@/lib/ai/tools/site'
import { CLUB_ACCOMMODATION } from '@/lib/app-api/config'
import { dayLabel, type DateRange } from '@/lib/app-api/dates'
import { slugify, titleCase } from '@/lib/app-api/format'
import type { MatchDayDto, MatchDto, MatchTeamDto } from '@/lib/app-api/types'

// Club.Dataservice (Sportlink) matches in the shape of the app API. The two club-wide lists
// (everything still to play, and the last weeks of results) are fetched once and cached for a
// few minutes; program, results, home and the team cards all filter those.

/** Fields of a match in `programma`, `uitslagen`, `pouleuitslagen` and `poule-programma`. */
export type SportlinkMatch = {
  wedstrijdcode: number
  wedstrijddatum: string
  aanvangstijd?: string | null
  thuisteam: string
  uitteam: string
  thuisteamid: number | string
  uitteamid: number | string
  thuisteamclubrelatiecode?: string | null
  uitteamclubrelatiecode?: string | null
  status?: string | null
  accommodatie?: string | null
  veld?: string | null
  plaats?: string | null
  klasse?: string | null
  competitie?: string | null
  competitienaam?: string | null
  uitslag?: string | null
}

const TTL_MS = 5 * 60 * 1000
const LOGO_URL = 'https://logoapi.voetbal.nl/logo.php?clubcode='

const CLUB_PARAMS = {
  teamcode: 'NULL',
  lokaleteamcode: 'NULL',
  sorteervolgorde: 'datum',
  gebruiklokaleteamgegevens: 'NEE',
  eigenwedstrijden: 'JA',
  spelsoort: 'ALLES',
  competitiesoort: 'ALLES',
  dagsoort: 'ALLES',
  leeftijdscategorie: 'ALLES',
  wedstrijdtype: '',
  thuis: 'ja',
  uit: 'ja',
}

type TeamLookup = {
  byCode: Map<number, TeamSummary>
  byName: Map<string, TeamSummary>
}

async function teamLookup(): Promise<TeamLookup> {
  const teams = await loadTeams()
  return {
    byCode: new Map(teams.filter((t) => t.teamcode).map((t) => [t.teamcode!, t])),
    byName: new Map(teams.map((t) => [t.name.toLowerCase(), t])),
  }
}

function statusOf(raw: string | null | undefined, hasResult: boolean): MatchDto['status'] {
  const status = (raw ?? '').toLowerCase()
  if (status.includes('afgelast')) {
    return 'cancelled'
  }
  if (status.includes('uitgesteld') || status.includes('verplaatst')) {
    return 'postponed'
  }
  if (status.includes('uitgespeeld') || status.includes('gestaakt') || hasResult) {
    return 'played'
  }
  return 'scheduled'
}

function resultOf(uitslag: string | null | undefined): MatchDto['result'] {
  const match = uitslag?.match(/^\s*(\d+)\s*-\s*(\d+)\s*$/)
  return match ? { home: Number(match[1]), away: Number(match[2]) } : null
}

/** "Hoofdklasse (2e fase)" -> "Hoofdklasse"; "B1410 Mannen beker 1e ronde" -> "Mannen beker 1e ronde". */
function competitionOf(raw: SportlinkMatch): string | undefined {
  const withoutPhase = (value: string) => value.replace(/\s*\(\d+e fase\)/i, '').trim()
  if (raw.klasse) {
    return withoutPhase(raw.klasse)
  }
  const name = (raw.competitienaam || raw.competitie)?.replace(/^[A-Z]?\d{3,5}\s+/, '')
  return name ? withoutPhase(name) : undefined
}

/** "2026-10-31T08:30:00+0100" -> "2026-10-31T08:30:00+01:00". */
const isoWithColon = (value: string) => value.replace(/([+-]\d{2})(\d{2})$/, '$1:$2')

function teamDto(
  name: string,
  clubcode: string | null | undefined,
  own: boolean,
  slug: string | undefined,
): MatchTeamDto {
  return {
    name,
    isOwn: own,
    ...(own && slug ? { teamSlug: slug } : {}),
    ...(clubcode ? { logoUrl: `${LOGO_URL}${clubcode}` } : {}),
  }
}

export function toMatch(raw: SportlinkMatch, lookup: TeamLookup): MatchDto {
  const ownHome = raw.thuisteamclubrelatiecode === CLUB_RELATIECODE
  const ownAway = raw.uitteamclubrelatiecode === CLUB_RELATIECODE

  const ownId = Number(ownHome ? raw.thuisteamid : raw.uitteamid)
  const ownName = ownHome ? raw.thuisteam : raw.uitteam
  const team = lookup.byCode.get(ownId) ?? lookup.byName.get(ownName.toLowerCase())
  const ownTeamSlug = team?.slug ?? slugify(ownName)

  const result = resultOf(raw.uitslag)
  const status = statusOf(raw.status, result !== null)
  const venueName = raw.accommodatie || (ownHome ? CLUB_ACCOMMODATION.name : '')
  const place = raw.plaats ? titleCase(raw.plaats) : ''

  return {
    id: String(raw.wedstrijdcode),
    date: raw.wedstrijddatum.slice(0, 10),
    kickoff: (raw.aanvangstijd || raw.wedstrijddatum.slice(11, 16)).slice(0, 5),
    startsAt: isoWithColon(raw.wedstrijddatum),
    status,
    ...(competitionOf(raw) ? { competition: competitionOf(raw) } : {}),
    ownTeamSlug,
    isHomeGame: ownHome,
    home: teamDto(
      raw.thuisteam,
      raw.thuisteamclubrelatiecode,
      ownHome,
      ownHome ? ownTeamSlug : undefined,
    ),
    away: teamDto(
      raw.uitteam,
      raw.uitteamclubrelatiecode,
      ownAway,
      ownAway ? ownTeamSlug : undefined,
    ),
    venue: {
      name: venueName,
      ...(venueName ? { shortName: venueName.replace(/^sportpark\s+/i, '') } : {}),
      ...(ownHome ? { address: CLUB_ACCOMMODATION.address } : {}),
      ...(venueName
        ? {
            mapsQuery: ownHome
              ? CLUB_ACCOMMODATION.mapsQuery
              : [venueName, place].filter(Boolean).join(', '),
          }
        : {}),
      ...(raw.veld ? { field: raw.veld } : {}),
    },
    // A cancelled or postponed match has no score.
    result: status === 'played' ? result : null,
  }
}

export async function mapMatches(raw: SportlinkMatch[]): Promise<MatchDto[]> {
  const lookup = await teamLookup()
  return raw.map((m) => toMatch(m, lookup))
}

const byKickoff = (a: MatchDto, b: MatchDto) =>
  a.date.localeCompare(b.date) || a.kickoff.localeCompare(b.kickoff)

/** Every SVV'04 match that still has to be played this season, soonest first. */
export function loadClubProgram(): Promise<MatchDto[]> {
  return cached('app-club-program', TTL_MS, async () => {
    const raw = await fetchClubData<SportlinkMatch[]>('programma', {
      ...CLUB_PARAMS,
      aantalregels: '600',
      aantaldagen: '365',
      weekoffset: '0',
    })
    return (await mapMatches(raw)).sort(byKickoff)
  })
}

/** Results of the last four weeks (and today), soonest first. Longer ago is not needed by any endpoint. */
export function loadClubResults(): Promise<MatchDto[]> {
  return cached('app-club-results', TTL_MS, async () => {
    const raw = await fetchClubData<SportlinkMatch[]>('uitslagen', {
      ...CLUB_PARAMS,
      aantalregels: '500',
      aantaldagen: '35',
      weekoffset: '-4',
    })
    return (await mapMatches(raw)).sort(byKickoff)
  })
}

const inRange = (m: MatchDto, range: DateRange) => m.date >= range.from && m.date <= range.to

/** Matches (to play and played) in a date range. A result replaces the same match in the program. */
export async function loadMatchesInRange(range: DateRange): Promise<MatchDto[]> {
  const [program, results] = await Promise.all([loadClubProgram(), loadClubResults()])
  const merged = new Map<string, MatchDto>()
  for (const m of program) {
    if (inRange(m, range)) {
      merged.set(m.id, m)
    }
  }
  for (const m of results) {
    if (inRange(m, range)) {
      merged.set(m.id, m)
    }
  }
  return [...merged.values()].sort(byKickoff)
}

export function groupByDay(matches: MatchDto[]): MatchDayDto[] {
  const days = new Map<string, MatchDto[]>()
  for (const m of [...matches].sort(byKickoff)) {
    days.set(m.date, [...(days.get(m.date) ?? []), m])
  }
  return [...days.entries()].map(([date, list]) => ({ date, label: dayLabel(date), matches: list }))
}

/** The next match of a team that has not been played yet (a cancelled one still shows, as "Afgelast"). */
export async function nextMatchOf(teamSlug: string): Promise<MatchDto | null> {
  const program = await loadClubProgram()
  return program.find((m) => m.ownTeamSlug === teamSlug && m.status !== 'played') ?? null
}

/** The `venue` and `teams` filters of /program and /results. */
export function filterMatches(
  matches: MatchDto[],
  { venue, teams }: { venue: 'all' | 'home' | 'away'; teams: string[] },
): MatchDto[] {
  return matches.filter(
    (m) =>
      (venue === 'all' || (venue === 'home') === m.isHomeGame) &&
      (!teams.length || teams.includes(m.ownTeamSlug)),
  )
}
