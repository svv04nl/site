import {
  activitiesToIcs,
  icsResponse,
  matchesToIcs,
  siteUrlOf,
  withoutIcsExtension,
} from '@/lib/agenda/ics'
import { loadActivities } from '@/lib/app-api/activities'
import { loadClubProgram, loadClubResults } from '@/lib/app-api/matches'

// Two club-wide feeds next to the one per team:
// - /api/agenda/programma.ics: all our own matches, or only those of the teams in ?teams=a,b,
//   optionally only home matches (?thuis=1). Chosen in "Zet in mijn agenda" on /programma.
// - /api/agenda/clubagenda.ics: the activities from the agenda page.
// Both filter data that the whole site shares (sharedCache), so every team selection is cheap.

const MAX_TEAMS = 30
const SLUG = /^[a-z0-9-]{1,60}$/

export async function GET(request: Request, context: { params: Promise<{ feed: string }> }) {
  const feed = withoutIcsExtension((await context.params).feed)

  if (feed === 'clubagenda') {
    return icsResponse(
      activitiesToIcs(await loadActivities(), "SVV'04 clubagenda", siteUrlOf(request)),
      'svv04-clubagenda.ics',
      false,
    )
  }

  if (feed === 'programma') {
    const url = new URL(request.url)
    const teams = (url.searchParams.get('teams') ?? '')
      .split(',')
      .map((t) => t.trim())
      .filter((t) => SLUG.test(t))
      .slice(0, MAX_TEAMS)
    const homeOnly = url.searchParams.get('thuis') === '1'

    const [program, results] = await Promise.all([loadClubProgram(), loadClubResults()])
    const byId = new Map<string, (typeof program)[number]>()
    // A result replaces the same match from the program (today's matches are in both).
    for (const m of [...program, ...results]) {
      if (teams.length && !teams.includes(m.ownTeamSlug)) {
        continue
      }
      if (homeOnly && !m.isHomeGame) {
        continue
      }
      byId.set(m.id, m)
    }
    const matches = [...byId.values()].sort(
      (a, b) => a.date.localeCompare(b.date) || a.kickoff.localeCompare(b.kickoff),
    )
    const name = teams.length ? "SVV'04 mijn teams" : "SVV'04 programma"
    return icsResponse(
      matchesToIcs(matches, name, siteUrlOf(request)),
      'svv04-programma.ics',
      false,
    )
  }

  return new Response('Niet gevonden', { status: 404 })
}
