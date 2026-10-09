/**
 * Renames the meedoen action pages to their final slugs/titles:
 * lidmaatschap (already correct), vrijwilliger-worden -> vrijwilligerswerk,
 * sponsor-worden -> sponsoring. Also patches the audience docs and search
 * index that still point at the old slugs.
 *
 * Run with: node --no-deprecation --env-file=.env.local --import=tsx/esm src/scripts/rename-meedoen-pages.ts
 */

import { getPayload } from 'payload'
import config from '@payload-config'

const PAGE_RENAMES = [
  { from: 'vrijwilliger-worden', to: 'vrijwilligerswerk', title: 'Vrijwilligerswerk' },
  { from: 'sponsor-worden', to: 'sponsoring', title: 'Sponsoring' },
]

async function main() {
  const payload = await getPayload({ config })

  for (const { from, to, title } of PAGE_RENAMES) {
    const { docs } = await payload.find({
      collection: 'pages',
      where: { section: { equals: 'meedoen' }, slug: { equals: from } },
      limit: 1,
    })
    if (docs[0]) {
      await payload.update({
        collection: 'pages',
        id: docs[0].id,
        data: { slug: to, title },
      })
      console.log(`Renamed: meedoen/${from} -> meedoen/${to}`)
    } else {
      console.log(`Skip: meedoen/${from} (not found)`)
    }
  }

  const urlReplacements: [string, string][] = [
    ['/meedoen/vrijwilliger-worden', '/meedoen/vrijwilligerswerk'],
    ['/meedoen/sponsor-worden', '/meedoen/sponsoring'],
  ]

  const { docs: audiences } = await payload.find({ collection: 'audiences', limit: 50 })
  for (const audience of audiences) {
    let changed = false
    let cta = audience.cta
    if (cta?.buttonUrl) {
      const match = urlReplacements.find(([from]) => from === cta!.buttonUrl)
      if (match) {
        cta = { ...cta, buttonUrl: match[1] }
        changed = true
      }
    }
    if (changed) {
      await payload.update({
        collection: 'audiences',
        id: audience.id,
        data: { cta },
      })
      console.log(`Updated: audiences/${audience.slug}`)
    } else {
      console.log(`Skip: audiences/${audience.slug} (no matching URLs)`)
    }
  }

  console.log('Done.')
  process.exit(0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
