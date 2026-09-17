const fontCache = new Map<string, ArrayBuffer>()

/**
 * Fetches a Google Font as a TrueType ArrayBuffer for use with Satori/next-og
 * ImageResponse (which cannot parse WOFF2). Google's CSS2 endpoint serves TTF
 * to clients that don't send a modern browser User-Agent, which is what an
 * unmodified server-side `fetch` looks like to it.
 */
export async function loadGoogleFont(family: string, weight: number): Promise<ArrayBuffer> {
  const cacheKey = `${family}:${weight}`
  const cached = fontCache.get(cacheKey)
  if (cached) return cached

  const cssUrl = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}:wght@${weight}`
  const css = await fetch(cssUrl).then((res) => res.text())
  const match = css.match(/src: url\(([^)]+)\) format\('(?:truetype|opentype)'\)/)

  if (!match) {
    throw new Error(`Could not resolve a TrueType source for ${family} ${weight}`)
  }

  const buffer = await fetch(match[1]).then((res) => res.arrayBuffer())
  fontCache.set(cacheKey, buffer)
  return buffer
}
