/**
 * Uploads the jongste-jeugd team photo to the Media collection (idempotent
 * by filename) and prints its ID for use in update-membership-pages.ts.
 *
 * Run with: node --no-deprecation --env-file=.env.local --import=tsx/esm src/scripts/seed-jongste-jeugd-photo.ts
 */

import { readFile } from 'node:fs/promises'
import { getPayload } from 'payload'
import config from '@payload-config'

const SOURCE_PATH = '/Users/erwin/.claude/image-cache/adddad88-5213-4360-b1bf-d01cd5608bb0/1.png'
const FILENAME = 'jongste-jeugd-team.png'
const ALT = "Team foto van de jongste jeugd (puppy's) van SVV'04 op Sportpark De Kampen"

async function main() {
  const payload = await getPayload({ config })

  const { docs } = await payload.find({
    collection: 'media',
    where: { filename: { equals: FILENAME } },
    limit: 1,
  })

  if (docs[0]) {
    console.log(`Skip: media/${FILENAME} (already exists, id=${docs[0].id})`)
    console.log(docs[0].id)
    process.exit(0)
  }

  const data = await readFile(SOURCE_PATH)
  const media = await payload.create({
    collection: 'media',
    data: { alt: ALT },
    file: { data, mimetype: 'image/png', name: FILENAME, size: data.byteLength },
  })

  console.log(`Created: media/${FILENAME} (id=${media.id})`)
  console.log(media.id)
  process.exit(0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
