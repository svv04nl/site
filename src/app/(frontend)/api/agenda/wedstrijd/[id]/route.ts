import { icsResponse, matchesToIcs, siteUrlOf, withoutIcsExtension } from '@/lib/agenda/ics'
import { loadClubProgram } from '@/lib/app-api/matches'

// One SVV'04 match as an .ics file ("Zet in agenda" on the match page), from the club program
// that the whole site shares.
export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  // The URL ends in .ics: /api/agenda/wedstrijd/12345678.ics
  const id = withoutIcsExtension((await context.params).id)
  if (!id || !/^\d+$/.test(id)) {
    return new Response('Niet gevonden', { status: 404 })
  }

  const match = (await loadClubProgram()).find((m) => m.id === id)
  if (!match) {
    return new Response('Deze wedstrijd staat niet (meer) in het programma.', { status: 404 })
  }
  return icsResponse(
    matchesToIcs([match], undefined, siteUrlOf(request)),
    `svv04-wedstrijd-${id}.ics`,
    true,
  )
}
