import { tool } from 'ai'
import { z } from 'zod'
import { fetchClubData } from '@/lib/clubdata/fetch'
import { CLUB_RELATIECODE } from '@/lib/clubdata/config'
import {
  activiteitenQuery,
  clubScheduleQuery,
  cupResultsQuery,
  gameInfoQuery,
  resultsQuery,
  standingsQuery,
  teamPoulesQuery,
} from '@/lib/clubdata/queries'
import { transformSchedule } from '@/lib/clubdata/transform'
import type { ScheduleMatch, ResultMatch } from '@/lib/clubdata/transform'
import type { RawProgrammaResponse } from '@/lib/clubdata/types'
import { teamHref } from '@/lib/ai/hrefs'
import { addDays, dateLabel, dateShort, todayInAmsterdam } from '@/lib/ai/time'
import { MAX_MATCH_CARDS, type MatchCardData } from '@/lib/ai/card-types'
import { stripUi } from '@/lib/ai/tools/ui'
import { findTeams, type TeamSummary } from '@/lib/ai/tools/site'

// Club.Dataservice (Sportlink / KNVB). Only match data of our own club's
// competitions: schedules, results, standings, activities. No player data.

const UNAVAILABLE = { error: 'De wedstrijdgegevens van de KNVB zijn nu niet beschikbaar.' }

// A slow or hung KNVB call must not hold the whole chat answer (and the function) up.
const TOOL_TIMEOUT_MS = 12_000

async function safe<T>(run: () => Promise<T>): Promise<T | typeof UNAVAILABLE> {
  let timer: ReturnType<typeof setTimeout> | undefined
  try {
    return await Promise.race([
      run(),
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new Error('timeout')), TOOL_TIMEOUT_MS)
      }),
    ])
  } catch (error) {
    console.error('[assistant] clubdata tool failed', error)
    return UNAVAILABLE
  } finally {
    clearTimeout(timer)
  }
}

type ResolvedTeam = { team: TeamSummary & { teamcode: number } } | { error: string }

async function resolveTeam(query: string): Promise<ResolvedTeam> {
  const teams = (await findTeams(query)).filter((t) => t.teamcode)
  if (!teams.length) return { error: `Geen team gevonden voor "${query}".` }
  if (teams.length > 1) {
    return {
      error: `Meerdere teams passen bij "${query}": ${teams.map((t) => t.name).join(', ')}. Vraag welk team bedoeld wordt.`,
    }
  }
  return { team: teams[0] as TeamSummary & { teamcode: number } }
}

// The teams endpoint can list a poule without a code (e.g. between competition
// phases); querying it returns HTTP 400.
const withCode = <T extends { poulecode: number | null }>(poules: T[]) =>
  poules.filter((p) => p.poulecode)

const teamInput = z
  .string()
  .min(1)
  .max(80)
  .describe('Team name, e.g. "O11-1", "SVV\'04 1", "vrouwen"')

const scheduleRow = (m: ScheduleMatch) => ({
  date: dateLabel(m.dayKey),
  isoDate: m.dayKey,
  time: m.time,
  home: m.homeTeam,
  away: m.awayTeam,
  venue: [m.venue, m.venuePlaats].filter(Boolean).join(', '),
  competition: m.competitie,
  status: m.status,
  matchUrl: `/wedstrijd/${m.matchCode}`,
  matchCode: m.matchCode,
})

const resultRow = (m: ResultMatch) => ({
  date: dateLabel(m.dayKey),
  isoDate: m.dayKey,
  home: m.homeTeam,
  away: m.awayTeam,
  score: m.score,
  status: m.status,
  matchUrl: `/wedstrijd/${m.matchCode}`,
  matchCode: m.matchCode,
})

const scheduleCard = (m: ScheduleMatch): MatchCardData => ({
  date: dateShort(m.dayKey),
  time: m.time,
  home: m.homeTeam,
  away: m.awayTeam,
  homeRelatiecode: m.homeTeamRelatiecode,
  awayRelatiecode: m.awayTeamRelatiecode,
  isOwnHome: m.isOwnHome,
  isOwnAway: m.isOwnAway,
  venue: m.venue,
  status: m.status,
  matchUrl: `/wedstrijd/${m.matchCode}`,
})

const resultCard = (m: ResultMatch): MatchCardData => ({
  date: dateShort(m.dayKey),
  score: m.score,
  home: m.homeTeam,
  away: m.awayTeam,
  homeRelatiecode: m.homeTeamRelatiecode,
  awayRelatiecode: m.awayTeamRelatiecode,
  isOwnHome: m.isOwnHome,
  isOwnAway: m.isOwnAway,
  status: m.status,
  matchUrl: `/wedstrijd/${m.matchCode}`,
})

/** Cards for the first MAX_MATCH_CARDS matches, plus a button to the rest. */
const matchUi = (cards: MatchCardData[], more: { label: string; url: string }) => ({
  matches: cards.slice(0, MAX_MATCH_CARDS),
  ...(cards.length > MAX_MATCH_CARDS ? { more } : {}),
})

export const getTeamSchedule = tool({
  description:
    "Upcoming matches of one SVV'04 team (date with weekday, time, opponent, venue). " +
    'Use competition "beker" for cup matches only, "competitie" for league matches only. ' +
    'The chat shows a card for every match returned, so use a low limit (1 for "the next match").',
  inputSchema: z.object({
    team: teamInput,
    competition: z.enum(['alles', 'competitie', 'beker']).default('alles'),
    limit: z.number().int().min(1).max(15).default(5),
  }),
  execute: ({ team, competition, limit }) =>
    safe(async () => {
      const resolved = await resolveTeam(team)
      if ('error' in resolved) return resolved
      const { teamcode, name } = resolved.team
      const teamUrl = teamHref(resolved.team)
      const raw = await fetchClubData<RawProgrammaResponse>('programma', {
        teamcode: String(teamcode),
        aantaldagen: '120',
        // Filtering happens after the fetch, so ask for enough rows to still fill `limit`.
        aantalregels: String(competition === 'alles' ? limit : 40),
      })
      const wanted = raw.filter(
        (w) =>
          competition === 'alles' || (competition === 'beker') === (w.competitiesoort === 'beker'),
      )
      const matches = transformSchedule(wanted, CLUB_RELATIECODE, teamcode).slice(0, limit)
      return {
        team: name,
        teamUrl,
        matches: matches.map(scheduleRow),
        ui: {
          ...matchUi(matches.map(scheduleCard), {
            label: 'Bekijk het hele programma',
            url: `${teamUrl}?tab=programma`,
          }),
          link: { label: `Bekijk het programma van ${name}`, url: `${teamUrl}?tab=programma` },
        },
        ...(matches.length
          ? {}
          : {
              note: 'Geen komende wedstrijden bekend in de KNVB-gegevens (het programma van een volgende fase of periode kan nog niet gepubliceerd zijn).',
            }),
      }
    }),
  toModelOutput: stripUi,
})

export const getTeamResults = tool({
  description:
    'Recent results (final scores) of one SVV\'04 team, newest first. Use competition "beker" for cup matches.',
  inputSchema: z.object({
    team: teamInput,
    competition: z.enum(['competitie', 'beker']).default('competitie'),
    limit: z.number().int().min(1).max(15).default(5),
  }),
  execute: ({ team, competition, limit }) =>
    safe(async () => {
      const resolved = await resolveTeam(team)
      if ('error' in resolved) return resolved
      const { teamcode, name } = resolved.team
      const teamUrl = teamHref(resolved.team)
      const poules = await teamPoulesQuery(teamcode).queryFn()
      const pouleCodes =
        competition === 'beker'
          ? withCode(poules.cupPoules)
          : withCode([...poules.poules, ...poules.fasePoules])

      const lists = await Promise.all(
        pouleCodes.map((p) =>
          (competition === 'beker'
            ? cupResultsQuery(p.poulecode)
            : resultsQuery(p.poulecode)
          ).queryFn(),
        ),
      )
      const own = new Map<number, ResultMatch>()
      for (const m of lists.flat()) if (m.isOwn) own.set(m.matchCode, m)

      const matches = [...own.values()]
        .sort((a, b) => b.dayKey.localeCompare(a.dayKey))
        .slice(0, limit)
      return {
        team: name,
        teamUrl,
        results: matches.map(resultRow),
        ui: {
          ...matchUi(matches.map(resultCard), {
            label: 'Bekijk alle uitslagen',
            url: `${teamUrl}?tab=uitslagen`,
          }),
          link: { label: `Bekijk de uitslagen van ${name}`, url: `${teamUrl}?tab=uitslagen` },
        },
        ...(matches.length ? {} : { note: 'Geen uitslagen gevonden.' }),
      }
    }),
  toModelOutput: stripUi,
})

export const getTeamStandings = tool({
  description:
    'League table(s) of the competition(s) one SVV\'04 team plays in. Youth teams can have several phases ("fases"); report the relevant one. ' +
    'Use competition "beker" for the table of the cup poule.',
  inputSchema: z.object({
    team: teamInput,
    competition: z.enum(['competitie', 'beker']).default('competitie'),
  }),
  execute: ({ team, competition }) =>
    safe(async () => {
      const resolved = await resolveTeam(team)
      if ('error' in resolved) return resolved
      const { teamcode, name } = resolved.team
      const teamUrl = teamHref(resolved.team)
      const poules = await teamPoulesQuery(teamcode).queryFn()
      const all = (
        competition === 'beker'
          ? withCode(poules.cupPoules)
          : withCode([...poules.poules, ...poules.fasePoules])
      ).slice(0, 3)

      const tables = await Promise.all(
        all.map(async (p) => ({
          competition: p.klasse,
          poule: p.klassepoule,
          rows: await standingsQuery(p.poulecode).queryFn(),
        })),
      )
      const competitions = tables.map((t) => ({
        competition: t.competition,
        poule: t.poule,
        standings: t.rows.map((row) => ({
          position: row.position,
          team: row.teamName,
          played: row.played,
          won: row.won,
          drawn: row.drawn,
          lost: row.lost,
          goalDifference: row.goalDiff,
          points: row.points,
          isSvv04: row.isOwn ?? false,
          note: row.note,
        })),
      }))

      // Same choice as the team page: the highest numbered phase, else the first table.
      const faseNumber = (klasse: string) =>
        Number(klasse.match(/\((\d+)[a-z]*\s+fase\)/i)?.[1] ?? -1)
      const shown = tables.reduce(
        (best, t) => (faseNumber(t.competition) > faseNumber(best.competition) ? t : best),
        tables[0],
      )
      return {
        team: name,
        teamUrl,
        competitions,
        ui: {
          ...(shown && shown.rows.length
            ? {
                standings: [
                  {
                    // The poule name usually repeats the competition; use the longer of the two.
                    title: shown.poule.includes(shown.competition)
                      ? shown.poule
                      : [shown.competition, shown.poule].filter(Boolean).join(' · '),
                    rows: shown.rows.map((row) => ({
                      position: row.position,
                      team: row.teamName,
                      clubRelatiecode: row.clubRelatiecode,
                      isOwn: row.isOwn ?? false,
                      played: row.played,
                      won: row.won,
                      drawn: row.drawn,
                      lost: row.lost,
                      goalDiff: row.goalDiff,
                      points: row.points,
                    })),
                  },
                ],
              }
            : {}),
          link: {
            label: `Bekijk de stand van ${name}`,
            url: `${teamUrl}?tab=${competition === 'beker' ? 'beker' : 'stand'}`,
          },
        },
        ...(competitions.length
          ? {}
          : {
              note:
                competition === 'beker'
                  ? 'Geen bekerstand beschikbaar (geen bekerpoule bekend voor dit team).'
                  : 'Geen stand beschikbaar.',
            }),
      }
    }),
  toModelOutput: stripUi,
})

export const getClubSchedule = tool({
  description:
    'Matches of ALL SVV\'04 teams in a date range, e.g. "what is played at home this weekend". ' +
    'Dates are YYYY-MM-DD. Defaults: today until 14 days ahead.',
  inputSchema: z.object({
    fromDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .optional(),
    toDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .optional(),
    venue: z.enum(['thuis', 'uit', 'alles']).default('alles'),
  }),
  execute: ({ fromDate, toDate, venue }) =>
    safe(async () => {
      const from = fromDate ?? todayInAmsterdam()
      const to = toDate ?? addDays(from, 14)
      const all = await clubScheduleQuery(venue).queryFn()
      const matches = all
        .filter((m) => m.dayKey >= from && m.dayKey <= to)
        .sort((a, b) => a.dayKey.localeCompare(b.dayKey) || a.time.localeCompare(b.time))
      const limited = matches.slice(0, 40)
      return {
        from,
        to,
        matches: limited.map(scheduleRow),
        ui: matchUi(limited.map(scheduleCard), {
          label: 'Bekijk het hele programma',
          url: '/programma',
        }),
        ...(matches.length > limited.length
          ? { note: `Eerste ${limited.length} van ${matches.length} wedstrijden.` }
          : {}),
        ...(matches.length ? {} : { note: 'Geen wedstrijden in deze periode.' }),
      }
    }),
  toModelOutput: stripUi,
})

export const getMatchDetails = tool({
  description:
    'Details of one match by matchCode (from other tool results): score, venue, field, changing rooms, remarks.',
  inputSchema: z.object({ matchCode: z.number().int() }),
  execute: ({ matchCode }) =>
    safe(async () => {
      const raw = await gameInfoQuery(matchCode).queryFn()
      const info = raw.wedstrijdinformatie
      return {
        matchUrl: `/wedstrijd/${matchCode}`,
        home: info.thuisteam,
        away: info.uitteam,
        competition: info.klasse,
        date: dateLabel(info.wedstrijddatum),
        time: info.aanvangstijd,
        homeScore: info.thuisscore,
        awayScore: info.uitscore,
        field: info.veldnaam,
        venue: [raw.accommodatie.naam, raw.accommodatie.straat, raw.accommodatie.plaats]
          .filter(Boolean)
          .join(', '),
        changingRooms: raw.kleedkamers,
        remarks: info.opmerkingen || undefined,
        ui: {
          matches: [
            {
              date: dateShort(info.wedstrijddatum),
              time: info.thuisscore === null ? info.aanvangstijd.slice(0, 5) : undefined,
              score: info.thuisscore === null ? undefined : `${info.thuisscore} - ${info.uitscore}`,
              home: info.thuisteam,
              away: info.uitteam,
              // This endpoint has no club codes, so own-club marking goes by name.
              isOwnHome: info.thuisteam.startsWith("SVV'04"),
              isOwnAway: info.uitteam.startsWith("SVV'04"),
              venue: info.veldnaam,
              matchUrl: `/wedstrijd/${matchCode}`,
            },
          ],
        },
      }
    }),
  toModelOutput: stripUi,
})

export const getClubActivities = tool({
  description: 'Club activities and events from the club calendar (not matches).',
  inputSchema: z.object({ days: z.number().int().min(1).max(365).default(60) }),
  execute: ({ days }) =>
    safe(async () => {
      const raw = await activiteitenQuery(days).queryFn()
      return {
        activities: raw.map((a) => ({
          name: a.activiteit,
          calendar: a.kalendernaam,
          from: a.datumvan,
          to: a.datumtm,
          allDay: a.heledag === 'true',
          place: a.plaats ?? undefined,
          remarks: a.opmerkingen || undefined,
          url: a.url ?? undefined,
        })),
      }
    }),
})
