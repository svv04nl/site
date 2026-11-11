import { getCloudflareContext } from '@opennextjs/cloudflare'

// Uploaded files (Payload's media collection) straight from the R2 bucket svv04-media, where
// they live under media/<filename> (see mediaFileUrl in lib/media-sizes.ts). No Payload here:
// the files are public, like they were on Vercel Blob. Uploads get a new filename when they
// change, so the response may stay cached for a year.
const CACHE = 'public, max-age=31536000, immutable'

type Params = { path: string[] }

export async function GET(request: Request, { params }: { params: Promise<Params> }) {
  const { path } = await params
  if (!path.length || path.some((part) => part === '..' || part === '')) {
    return new Response('Not found', { status: 404 })
  }
  const key = `media/${path.join('/')}`

  const cache = typeof caches !== 'undefined' && 'default' in caches ? caches.default : undefined
  const cacheKey = new Request(new URL(request.url).origin + '/' + key)
  const cached = await cache?.match(cacheKey)
  if (cached) {
    return cached
  }

  const context = await getCloudflareContext({ async: true }).catch(() => undefined)
  const object = await context?.env.MEDIA?.get(key)
  if (!object) {
    return new Response('Not found', { status: 404 })
  }

  const headers = new Headers()
  object.writeHttpMetadata(headers)
  headers.set('ETag', object.etag)
  headers.set('Cache-Control', CACHE)
  if (request.headers.get('If-None-Match') === object.etag) {
    return new Response(null, { status: 304, headers })
  }

  const response = new Response(object.body, { headers })
  if (cache && context) {
    context.ctx.waitUntil(cache.put(cacheKey, response.clone()))
  }
  return response
}
