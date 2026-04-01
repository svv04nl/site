/**
 * One-time migration script: updates media records whose `url` still points to
 * `/api/media/file/<filename>` (old local-API route) to the direct Vercel Blob URL.
 *
 * Run against production:
 *   pnpm fix:media-urls
 */

import { getPayload } from 'payload'
import config from '@payload-config'

const BLOB_BASE = 'https://cwvhguuf0nqhoqwv.public.blob.vercel-storage.com'
const API_PREFIX = '/api/media/file/'

function toBlobUrl(relativeUrl: string): string {
  const filename = relativeUrl.slice(API_PREFIX.length)
  return `${BLOB_BASE}/media/${filename}`
}

function isRelative(url: string | null | undefined): url is string {
  return typeof url === 'string' && url.startsWith(API_PREFIX)
}

async function main() {
  const payload = await getPayload({ config })

  const { docs, totalDocs } = await payload.find({
    collection: 'media',
    where: { url: { contains: API_PREFIX } },
    limit: 1000,
    pagination: false,
  })

  console.log(`Found ${totalDocs} media record(s) with legacy API-route URLs`)

  for (const doc of docs) {
    const patch: Record<string, unknown> = {}

    if (isRelative(doc.url)) {
      patch.url = toBlobUrl(doc.url)
    }
    if (isRelative(doc.thumbnailURL)) {
      patch.thumbnailURL = toBlobUrl(doc.thumbnailURL)
    }

    const sizes: Record<string, Record<string, unknown>> = {}
    if (isRelative(doc.sizes?.newsCard?.url)) {
      sizes.newsCard = { ...doc.sizes!.newsCard, url: toBlobUrl(doc.sizes!.newsCard!.url!) }
    }
    if (isRelative(doc.sizes?.featuredPost?.url)) {
      sizes.featuredPost = {
        ...doc.sizes!.featuredPost,
        url: toBlobUrl(doc.sizes!.featuredPost!.url!),
      }
    }
    if (Object.keys(sizes).length > 0) {
      patch.sizes = { ...doc.sizes, ...sizes }
    }

    if (Object.keys(patch).length === 0) continue

    await payload.update({
      collection: 'media',
      id: doc.id,
      data: patch,
    })

    console.log(`Updated media #${doc.id} (${doc.filename}):`, patch)
  }

  console.log('Done.')
  process.exit(0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
