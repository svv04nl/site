import { icsResponse, matchesToIcs } from '@/lib/agenda/ics'
import { loadClubProgram } from '@/lib/app-api/matches'
import { withEdgeCache } from '@/lib/edge-cache'

// One SVV'04 match as an .ics file ("Zet in agenda" on the match page). The club program is
// cached already; the edge cache spares building the file again for every click.
export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params
  if (!/^\d+$/.test(id)) return new Response('Niet gevonden', { status: 404 })

  return withEdgeCache(request, async () => {
    const match = (await loadClubProgram()).find((m) => m.id === id)
    if (!match) return new Response('Deze wedstrijd staat niet (meer) in het programma.', { status: 404 })
    return icsResponse(matchesToIcs([match]), `svv04-wedstrijd-${id}.ics`, true)
  })
}
