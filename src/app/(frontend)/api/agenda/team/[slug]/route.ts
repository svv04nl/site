import { icsResponse, matchesToIcs, withoutIcsExtension } from '@/lib/agenda/ics'
import { loadTeams } from '@/lib/ai/tools/site'
import { loadTeamMatches } from '@/lib/app-api/matches'
import { withEdgeCache } from '@/lib/edge-cache'

// Agenda feed of one team: the matches still to play plus those of the last weeks, so a
// subscribed calendar keeps recent matches. Calendar apps fetch this again every few hours, so
// the whole feed sits in the edge cache (s-maxage in icsResponse) and only that team's matches
// are asked from Sportlink.
export async function GET(request: Request, context: { params: Promise<{ slug: string }> }) {
  // The URL ends in .ics: /api/agenda/team/svv04-1.ics
  const slug = withoutIcsExtension((await context.params).slug)
  if (!slug) {
    return new Response('Niet gevonden', { status: 404 })
  }
  return withEdgeCache(request, async () => {
    const team = (await loadTeams()).find((t) => t.slug === slug)
    if (!team) {
      return new Response('Team niet gevonden', { status: 404 })
    }
    if (!team.teamcode) {
      return new Response('Voor dit team is geen programma bekend', { status: 404 })
    }

    const matches = await loadTeamMatches(team.teamcode)
    const name = /svv/i.test(team.name) ? team.name : `SVV'04 ${team.name}`
    return icsResponse(matchesToIcs(matches, name), `svv04-${slug}.ics`, false)
  })
}
