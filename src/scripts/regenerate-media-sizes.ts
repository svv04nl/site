/**
 * Regenerates all image sizes for media records linked to teams.
 * Downloads the original from Vercel Blob and re-processes through Payload,
 * which runs sharp to produce all configured sizes and uploads them to blob.
 *
 * Run with: pnpm regenerate:media-sizes
 */

import { getPayload } from 'payload'
import config from '@payload-config'
import { list } from '@vercel/blob'
import type { Media } from '@/payload-types'

async function fetchFileBuffer(url: string): Promise<{ data: Buffer; mimetype: string; size: number }> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status} ${res.statusText}`)
  const contentType = res.headers.get('content-type') ?? 'image/jpeg'
  const arrayBuffer = await res.arrayBuffer()
  const data = Buffer.from(arrayBuffer)
  return { data, mimetype: contentType.split(';')[0].trim(), size: data.length }
}

async function buildBlobIndex(): Promise<Map<string, string>> {
  const index = new Map<string, string>()
  let cursor: string | undefined
  do {
    const { blobs, cursor: next } = await list({ prefix: 'media/', limit: 1000, cursor })
    for (const blob of blobs) {
      // key by the bare filename (strip "media/" prefix)
      const filename = blob.pathname.replace(/^media\//, '')
      index.set(filename, blob.url)
    }
    cursor = next
  } while (cursor)
  return index
}

async function main() {
  const payload = await getPayload({ config })

  console.log('Building blob index...')
  const blobIndex = await buildBlobIndex()
  console.log(`Blob index: ${blobIndex.size} file(s)`)

  // Find all teams with a photo
  const { docs: teams } = await payload.find({
    collection: 'teams',
    depth: 1,
    limit: 500,
    pagination: false,
  })

  const mediaIds = new Set<number>()
  for (const team of teams) {
    if (team.photo && typeof team.photo === 'object') {
      mediaIds.add((team.photo as Media).id)
    }
  }

  console.log(`Found ${mediaIds.size} unique team photo(s) to regenerate`)

  let done = 0
  for (const id of mediaIds) {
    const doc = await payload.findByID({ collection: 'media', id })

    if (!doc.filename) {
      console.warn(`  Skipping media #${id} — no filename`)
      continue
    }

    const blobUrl = blobIndex.get(doc.filename)
    if (!blobUrl) {
      console.warn(`  Skipping media #${id} (${doc.filename}) — not found in blob store`)
      continue
    }

    console.log(`  [${++done}/${mediaIds.size}] Regenerating media #${id} (${doc.filename})...`)

    let fileData: { data: Buffer; mimetype: string; size: number }
    try {
      fileData = await fetchFileBuffer(blobUrl)
    } catch (err) {
      console.error(`  Error fetching ${blobUrl}:`, err)
      continue
    }

    await payload.update({
      collection: 'media',
      id,
      data: {},
      file: {
        data: fileData.data,
        mimetype: fileData.mimetype,
        name: doc.filename!,
        size: fileData.size,
      },
    })

    console.log(`  Done`)
  }

  console.log(`\nRegenerated ${done} media record(s).`)
  process.exit(0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
