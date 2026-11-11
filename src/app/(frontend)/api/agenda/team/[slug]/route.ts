import { icsResponse, matchesToIcs, siteUrlOf, withoutIcsExtension } from '@/lib/agenda/ics'
import { loadTeams } from '@/lib/ai/tools/site'
import { loadTeamMatches } from '@/lib/app-api/matches'

// Agenda feed of one team: the matches still to play plus those of the last weeks, so a
// subscribed calendar keeps recent matches. Filters the club's matches, which the whole site
// shares (loadClubMatches in lib/app-api/matches.ts), so building the feed costs no Sportlink
// call.
export async function GET(request: Request, context: { params: Promise<{ slug: string }> }) {
  // The URL ends in .ics: /api/agenda/team/svv04-1.ics
  const slug = withoutIcsExtension((await context.params).slug)
  if (!slug) {
    return new Response('Niet gevonden', { status: 404 })
  }

  const team = (await loadTeams()).find((t) => t.slug === slug)
  if (!team) {
    return new Response('Team niet gevonden', { status: 404 })
  }

  const matches = await loadTeamMatches(slug)
  const name = /svv/i.test(team.name) ? team.name : `SVV'04 ${team.name}`
  return icsResponse(matchesToIcs(matches, name, siteUrlOf(request)), `svv04-${slug}.ics`, false)
}
