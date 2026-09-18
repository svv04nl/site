/**
 * Seed script: creates sponsor records (with their logo uploaded to Media).
 * Idempotent — skips a sponsor if one with the same name already exists.
 *
 * Only sponsors that appear in the homepage sidebar (tier main/sub/youth) are
 * worth seeding for now: the `sponsors` collection is only rendered there, one
 * per tier. Regular sponsors and the ticker use separate assets, so they are
 * intentionally left out until logos + tier mapping are available.
 *
 * Local (dev branch):  pnpm seed:sponsors
 * Other branches:      run with the matching --env-file (see package.json)
 */

import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { getPayload } from 'payload'
import config from '@payload-config'

const dirname = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(dirname, '../..')

type SponsorSeed = {
  name: string
  tier: 'main' | 'sub' | 'youth' | 'regular'
  url?: string
  /** Logo file, relative to public/. */
  logo: string
  mimetype: string
}

// DNN-Groep was the last pending entry here — already seeded (logo on
// Vercel Blob). Add new sponsors below as they come in.
const SPONSORS: SponsorSeed[] = []

async function main() {
  const payload = await getPayload({ config })

  console.log(`Seeding ${SPONSORS.length} sponsor(s)…`)

  for (const sponsor of SPONSORS) {
    const { docs } = await payload.find({
      collection: 'sponsors',
      where: { name: { equals: sponsor.name } },
      limit: 1,
    })

    if (docs.length > 0) {
      console.log(`  skip    ${sponsor.name} (already exists)`)
      continue
    }

    const filePath = path.join(projectRoot, 'public', sponsor.logo)
    const data = await readFile(filePath)
    const filename = path.basename(sponsor.logo)

    const media = await payload.create({
      collection: 'media',
      data: { alt: `Logo ${sponsor.name}` },
      file: { data, mimetype: sponsor.mimetype, name: filename, size: data.byteLength },
    })

    await payload.create({
      collection: 'sponsors',
      data: {
        name: sponsor.name,
        tier: sponsor.tier,
        url: sponsor.url,
        logo: media.id,
      },
    })

    console.log(`  created ${sponsor.name} (${sponsor.tier})`)
  }

  console.log('Done.')
  process.exit(0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
