import { icsResponse, matchesToIcs } from '@/lib/agenda/ics'
import { loadTeams } from '@/lib/ai/tools/site'
import { loadClubProgram, loadClubResults } from '@/lib/app-api/matches'

// Agenda feed of one team: the matches still to play plus those of the last weeks, so a
// subscribed calendar keeps recent matches. Calendar apps fetch this again every few hours.
export async function GET(_request: Request, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params
  const team = (await loadTeams()).find((t) => t.slug === slug)
  if (!team) return new Response('Team niet gevonden', { status: 404 })

  const [program, results] = await Promise.all([loadClubProgram(), loadClubResults()])
  const byId = new Map<string, (typeof program)[number]>()
  for (const m of [...results, ...program]) if (m.ownTeamSlug === slug) byId.set(m.id, m)

  const matches = [...byId.values()].sort(
    (a, b) => a.date.localeCompare(b.date) || a.kickoff.localeCompare(b.kickoff),
  )
  return icsResponse(matchesToIcs(matches, /svv/i.test(team.name) ? team.name : `SVV'04 ${team.name}`), `svv04-${slug}.ics`, false)
}
