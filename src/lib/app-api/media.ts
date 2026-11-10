import type { Media } from '@/payload-types'

// Beeldformaten die Cloudflare Images maakt, hebben een relatief pad (/api/img/...); de app
// heeft een volledige URL nodig.
const SITE_URL = 'https://svv04.nl'

function absoluteUrl(url: string): string {
  return url.startsWith('/') ? `${SITE_URL}${url}` : url
}

/**
 * A populated media doc as the app image shape. `size` is one of the Media image sizes
 * (see collections/Media.ts); when that size does not exist the original is used.
 * Returns undefined for an unpopulated relationship (a bare id) or a doc without a file.
 */
export function toImage(
  media: Media | number | string | null | undefined,
  size?: 'newsCard' | 'featuredPost' | 'hero' | 'teamCard' | 'teamPhoto',
): { url: string; width?: number; height?: number; alt?: string } | undefined {
  if (!media || typeof media !== 'object' || !media.url) return undefined

  const sized = size ? media.sizes?.[size] : undefined
  const useSize = Boolean(sized?.url)
  const source = useSize ? sized! : media
  return {
    url: absoluteUrl((useSize ? sized!.url : media.url) as string),
    ...(source.width ? { width: source.width } : {}),
    ...(source.height ? { height: source.height } : {}),
    ...(media.alt ? { alt: media.alt } : {}),
  }
}

/** Only the url of a media doc, e.g. for `mobileUrl`. */
export function mediaUrl(
  media: Media | number | string | null | undefined,
  size?: 'newsCard' | 'featuredPost' | 'hero' | 'teamCard' | 'teamPhoto',
) {
  return toImage(media, size)?.url
}
