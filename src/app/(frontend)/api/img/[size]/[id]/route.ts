import { getCloudflareContext } from '@opennextjs/cloudflare'
import { getPayload } from 'payload'
import config from '@payload-config'
import {
  MEDIA_SIZES,
  canTransform,
  fitsSize,
  isMediaSizeName,
  sizedDimensions,
} from '@/lib/media-sizes'

// Een beeldformaat van een mediabestand, gemaakt met Cloudflare Images. De URL bevat
// ?v=<updatedAt> (zie de afterRead-hook in collections/Media.ts), dus een gewijzigd focuspunt
// of een nieuw bestand krijgt vanzelf een nieuwe URL en het resultaat mag een jaar in de cache.
const IMMUTABLE = 'public, max-age=31536000, immutable'

type Params = { size: string; id: string }

export async function GET(request: Request, { params }: { params: Promise<Params> }) {
  const { size, id } = await params
  if (!isMediaSizeName(size) || !/^\d+$/.test(id)) {
    return new Response('Not found', { status: 404 })
  }

  const cache = typeof caches !== 'undefined' && 'default' in caches ? caches.default : undefined
  // Een gewone GET met alleen de URL als sleutel; het NextRequest zelf accepteert de cache niet.
  const cacheKey = new Request(request.url)
  const cached = await cache?.match(cacheKey)
  if (cached) {
    return cached
  }

  const payload = await getPayload({ config })
  const media = await payload
    // Zonder select: de url berekent de storage-adapter uit filename.
    .findByID({ collection: 'media', id, depth: 0 })
    .catch(() => null)
  if (!media?.url) {
    return new Response('Not found', { status: 404 })
  }

  // Zonder Images-binding (bijv. next dev zonder bindings) of voor een SVG: het origineel.
  const original = new URL(media.url, request.url).toString()
  const context = await getCloudflareContext({ async: true }).catch(() => undefined)
  const images = context?.env.IMAGES
  if (!context || !images || !canTransform(media.mimeType)) {
    return Response.redirect(original, 302)
  }

  const spec = MEDIA_SIZES[size]
  if (!fitsSize(spec, media.width, media.height)) {
    return Response.redirect(original, 302)
  }

  // Het origineel rechtstreeks uit de R2-bucket (zie lib/media-sizes.ts voor de sleutel).
  const source = media.filename
    ? await context.env.MEDIA?.get(`${media.prefix || 'media'}/${media.filename}`)
    : null
  if (!source) {
    return Response.redirect(original, 302)
  }

  const { width, height } = sizedDimensions(spec, media.width, media.height)
  const result = await images
    .input(source.body)
    .transform({
      width,
      ...(height && spec.height
        ? {
            height,
            fit: 'cover' as const,
            gravity: {
              x: (media.focalX ?? 50) / 100,
              y: (media.focalY ?? 50) / 100,
              mode: 'box-center' as const,
            },
          }
        : { fit: 'scale-down' as const }),
    })
    .output({ format: 'image/webp', quality: spec.quality })
    .catch((error: unknown) => {
      console.error(`[api/img] ${size}/${id}:`, error)
      return null
    })
  // Lukt het transformeren niet (bijv. de limiet van Images bereikt), dan het origineel.
  if (!result) {
    return Response.redirect(original, 302)
  }

  const response = result.response({ headers: { 'Cache-Control': IMMUTABLE } })
  if (cache) {
    context.ctx.waitUntil(cache.put(cacheKey, response.clone()))
  }
  return response
}
