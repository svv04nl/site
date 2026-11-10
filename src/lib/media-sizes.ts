// De beeldformaten van media. Vroeger maakte sharp ze bij het uploaden; op Cloudflare Workers
// bestaat sharp niet, dus maakt de route /api/img/<formaat>/<id> ze op het moment van tonen
// met Cloudflare Images (en cachet ze). Media die al formaten in Blob heeft, houdt die.

export type MediaSizeName = 'newsCard' | 'featuredPost' | 'hero' | 'teamCard' | 'teamPhoto'

type MediaSize = {
  width: number
  /** Met hoogte: bijgesneden op het focuspunt. Zonder: verhouding van het origineel. */
  height?: number
  quality: number
}

export const MEDIA_SIZES: Record<MediaSizeName, MediaSize> = {
  newsCard: { width: 600, height: 300, quality: 80 },
  featuredPost: { width: 1200, height: 600, quality: 82 },
  // Homepage-hero van een uitgelicht bericht (zie Posts.heroFeatured).
  hero: { width: 2400, height: 1000, quality: 80 },
  // Teamkaarten op de overzichtspagina's.
  teamCard: { width: 600, quality: 90 },
  // Teamfoto op de teampagina.
  teamPhoto: { width: 900, quality: 90 },
}

export function isMediaSizeName(name: string): name is MediaSizeName {
  return Object.hasOwn(MEDIA_SIZES, name)
}

/** Formaten die Cloudflare Images kan maken (geen SVG of PDF). */
export function canTransform(mimeType: string | null | undefined): boolean {
  return Boolean(mimeType?.startsWith('image/')) && mimeType !== 'image/svg+xml'
}

/**
 * Of een formaat voor dit origineel bestaat. Net als sharp in Payload (withoutEnlargement): is
 * het origineel kleiner dan het formaat, dan is er geen formaat en toont de site het origineel.
 */
export function fitsSize(
  size: MediaSize,
  width: number | null | undefined,
  height: number | null | undefined,
): boolean {
  if (!width || !height) return false
  return width >= size.width && (!size.height || height >= size.height)
}

/** Afmetingen van een formaat voor een origineel van width x height, zonder te vergroten. */
export function sizedDimensions(
  size: MediaSize,
  width: number | null | undefined,
  height: number | null | undefined,
): { width: number; height?: number } {
  if (size.height) return { width: size.width, height: size.height }
  if (!width || !height) return { width: size.width }
  const w = Math.min(size.width, width)
  return { width: w, height: Math.round((height * w) / width) }
}
