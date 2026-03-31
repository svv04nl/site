import { getPayload } from 'payload'
import config from '@payload-config'

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/'/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

const teams = [
  { name: "SVV'04 2", type: 'senior', category: 'Mannen zaterdag', order: 2 },
  { name: "SVV'04 1", type: 'senior', category: 'Mannen zondag', order: 1 },
  { name: "SVV'04 3", type: 'senior', category: 'Mannen zondag', order: 3 },
  { name: "SVV'04 4", type: 'senior', category: 'Mannen zondag', order: 4 },
  { name: "SVV'04 1 Futsal", type: 'senior', category: 'Futsal', order: 10 },
  { name: "SVV'04 VR18+1", type: 'senior', category: 'Vrouwen 18+', order: 20 },
  { name: "SVV'04 35+1", type: 'senior', category: 'Mannen 35+', order: 30 },
  { name: "SVV'04 45+1", type: 'senior', category: 'Mannen 45+', order: 31 },
  { name: "SVV'04 O21-1", type: 'youth', category: 'Jeugd onder 21', order: 1 },
  { name: "SVV'04 JO19-1", type: 'youth', category: 'Jeugd onder 19', order: 2 },
  { name: "SVV'04 JO17-1", type: 'youth', category: 'Jeugd onder 17', order: 3 },
  { name: "SVV'04 JO15-1JM", type: 'youth', category: 'Jeugd onder 15', order: 4 },
  { name: "SVV'04 JO15-2JM", type: 'youth', category: 'Jeugd onder 15', order: 5 },
  { name: "SVV'04 JO13-1", type: 'youth', category: 'Jeugd onder 13', order: 6 },
  { name: "SVV'04 JO12-1JM", type: 'youth', category: 'Jeugd onder 12', order: 7 },
  { name: "SVV'04 JO11-1JM", type: 'youth', category: 'Jeugd onder 11', order: 8 },
  { name: "SVV'04 JO10-1", type: 'youth', category: 'Jeugd onder 10', order: 9 },
  { name: "SVV'04 JO10-2JM", type: 'youth', category: 'Jeugd onder 10', order: 10 },
  { name: "SVV'04 JO9-1", type: 'youth', category: 'Jeugd onder 9', order: 11 },
  { name: "SVV'04 JO9-2JM", type: 'youth', category: 'Jeugd onder 9', order: 12 },
  { name: "SVV'04 JO9-3JM", type: 'youth', category: 'Jeugd onder 9', order: 13 },
  { name: "SVV'04 JO8-1JM", type: 'youth', category: 'Jeugd onder 8', order: 14 },
  { name: "SVV'04 JO7-1JM", type: 'youth', category: 'Jeugd onder 7', order: 15 },
  { name: "SVV'04 JO7-2", type: 'youth', category: 'Jeugd onder 7', order: 16 },
  { name: "SVV'04 JO7-3JM", type: 'youth', category: 'Jeugd onder 7', order: 17 },
] as const

async function seed() {
  const payload = await getPayload({ config })

  // Clear existing teams
  const existing = await payload.find({ collection: 'teams', limit: 200 })
  console.log(`Deleting ${existing.docs.length} existing teams...`)
  for (const doc of existing.docs) {
    await payload.delete({ collection: 'teams', id: doc.id })
  }

  console.log('Seeding teams...')
  for (const team of teams) {
    await payload.create({
      collection: 'teams',
      data: { ...team, slug: toSlug(team.name) },
    })
    console.log(`  ✓ ${team.name} (${toSlug(team.name)})`)
  }

  console.log('Done.')
  process.exit(0)
}

seed().catch((err) => {
  console.error(err)
  process.exit(1)
})
