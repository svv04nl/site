import type { CollectionConfig, PayloadRequest } from 'payload'
import { MEDIA_SIZES, canTransform, fitsSize, mediaFileUrl, sizedDimensions } from '@/lib/media-sizes'

// Origin van een REST- of GraphQL-request, zodat een externe lezer een volledige URL krijgt.
// De Local API (servercomponenten, de app-API) heeft geen echte request-URL: dan een relatief
// pad, dat de site zelf goed oplost (de app-API maakt het absoluut, zie lib/app-api/media.ts).
function originOf(req: PayloadRequest): string {
  if (req.payloadAPI === 'local' || !req.url) return ''
  try {
    return new URL(req.url).origin
  } catch {
    return ''
  }
}

export const Media: CollectionConfig = {
  slug: 'media',
  labels: {
    singular: 'Mediabestand',
    plural: 'Media',
  },
  access: {
    read: () => true,
  },
  hooks: {
    afterRead: [
      ({ doc, req }) => {
        if (!doc?.id) return doc
        const origin = originOf(req)
        // File URLs come from the filename (also in next build and scripts, where the R2 plugin
        // has no bucket). The stored url columns still hold old Blob URLs.
        const sizes: Record<string, any> = {}
        for (const [name, size] of Object.entries(doc.sizes ?? {}) as [string, any][]) {
          sizes[name] = size?.filename
            ? { ...size, url: `${origin}${mediaFileUrl(size.filename, doc.prefix)}` }
            : size
        }
        const withUrls = {
          ...doc,
          ...(doc.filename ? { url: `${origin}${mediaFileUrl(doc.filename, doc.prefix)}` } : {}),
          sizes,
        }
        if (!canTransform(doc.mimeType)) return withUrls

        const version = encodeURIComponent(doc.updatedAt ?? '')
        for (const [name, size] of Object.entries(MEDIA_SIZES)) {
          if (sizes[name]?.url || !fitsSize(size, doc.width, doc.height)) continue
          sizes[name] = {
            ...sizes[name],
            ...sizedDimensions(size, doc.width, doc.height),
            mimeType: 'image/webp',
            url: `${origin}/api/img/${name}/${doc.id}?v=${version}`,
          }
        }
        return { ...withUrls, sizes }
      },
    ],
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
    },
  ],
  upload: {
    // Blijven staan voor de bestaande formaten in de database. Nieuwe uploads krijgen ze niet
    // meer (geen sharp op Workers); die vult de afterRead-hook hieronder aan.
    imageSizes: Object.entries(MEDIA_SIZES).map(([name, size]) => ({
      name,
      width: size.width,
      height: size.height,
      ...(size.height ? { position: 'centre' as const } : {}),
      formatOptions: { format: 'webp' as const, options: { quality: size.quality } },
    })),
    adminThumbnail: 'featuredPost',
    focalPoint: true,
    withMetadata: true,
    resizeOptions: {
      width: 3840,
      withoutEnlargement: true,
    },
    formatOptions: {
      format: 'webp',
      options: { quality: 85 },
    },
  },
}
