import { getPayload } from 'payload'
import config from '@payload-config'
import { fetchClubData } from '@/lib/clubdata/fetch'
import type { RawTeamsResponse } from '@/lib/clubdata/types'

async function syncTeamcodes() {
  const payload = await getPayload({ config })

  // Fetch all teams from the Sportlink API
  console.log('Fetching teams from Sportlink API...')
  const apiTeams = await fetchClubData<RawTeamsResponse>('teams')

  // Deduplicate: one entry per unique teamcode (API returns one row per poule)
  const byTeamcode = new Map<number, string>()
  for (const entry of apiTeams) {
    if (!byTeamcode.has(entry.teamcode)) {
      byTeamcode.set(entry.teamcode, entry.teamnaam)
    }
  }
  console.log(`Found ${byTeamcode.size} unique teams in API`)

  // Fetch all teams from Payload
  const { docs: payloadTeams } = await payload.find({
    collection: 'teams',
    limit: 200,
    depth: 0,
  })
  console.log(`Found ${payloadTeams.length} teams in database\n`)

  let updated = 0
  let skipped = 0

  for (const [teamcode, teamnaam] of byTeamcode) {
    const match = payloadTeams.find((t) => t.name === teamnaam)
    if (!match) {
      console.log(`  — No match for API team: "${teamnaam}" (${teamcode})`)
      skipped++
      continue
    }

    if (match.teamcode === teamcode) {
      console.log(`  ✓ Already up to date: ${match.name} (${teamcode})`)
      continue
    }

    await payload.update({
      collection: 'teams',
      id: match.id,
      data: { teamcode },
    })
    console.log(`  ✓ Updated: ${match.name} → teamcode ${teamcode}`)
    updated++
  }

  console.log(`\nDone. ${updated} updated, ${skipped} unmatched.`)
  process.exit(0)
}

syncTeamcodes().catch((err) => {
  console.error(err)
  process.exit(1)
})
