import { icsResponse, matchesToIcs } from '@/lib/agenda/ics'
import { loadClubProgram } from '@/lib/app-api/matches'

// One SVV'04 match as an .ics file ("Zet in agenda" on the match page).
export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params
  if (!/^\d+$/.test(id)) return new Response('Niet gevonden', { status: 404 })

  const match = (await loadClubProgram()).find((m) => m.id === id)
  if (!match) return new Response('Deze wedstrijd staat niet (meer) in het programma.', { status: 404 })

  return icsResponse(matchesToIcs([match]), `svv04-wedstrijd-${id}.ics`, true)
}
