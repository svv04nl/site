// Toegangscode voor de hele website. Staat SITE_ACCESS_CODE niet in de omgeving, dan is de
// poort uit (lokaal en op previews). De code zelf staat nooit in de repo of in een cookie:
// het cookie bevat een afgeleid token.
//
// Dit is een zachte afscherming van de pagina's, geen beveiliging van gegevens: de API
// (Payload, webhooks, cron) en het adminscherm hebben hun eigen toegangscontrole en blijven
// bereikbaar.

export const ACCESS_COOKIE = 'site_access'
export const ACCESS_PATH = '/toegang'
export const ACCESS_MAX_AGE = 60 * 60 * 24 * 30 // 30 dagen

export function getAccessCode(): string | undefined {
  const code = process.env.SITE_ACCESS_CODE?.trim()
  return code || undefined
}

// Plekken die altijd bereikbaar moeten blijven: Next-bestanden, alle API-routes (Mollie moet de
// webhook kunnen aanroepen en de cron zijn route; de rest heeft eigen controle), het adminscherm
// met eigen login, de media (waren op Vercel Blob ook openbaar), de toegangspagina zelf en wat
// die pagina of zoekmachines nodig hebben.
const EXEMPT_DIRS = ['/_next', '/api', '/media', '/admin', ACCESS_PATH]
const EXEMPT_FILES = new Set([
  '/robots.txt',
  '/favicon.ico',
  '/favicon.svg',
  '/favicon-96x96.png',
  '/apple-touch-icon.png',
  '/site.webmanifest',
  '/logo.webp',
])

// Een map is vrijgesteld als het pad er exact mee overeenkomt of eronder valt. Alleen
// "begint met" is te ruim: /administratie zou dan langs de poort komen.
export function isExemptPath(pathname: string): boolean {
  if (EXEMPT_FILES.has(pathname)) {
    return true
  }
  return EXEMPT_DIRS.some((dir) => pathname === dir || pathname.startsWith(`${dir}/`))
}

function toHex(buffer: ArrayBuffer): string {
  return [...new Uint8Array(buffer)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

// HMAC van de code, met PAYLOAD_SECRET als sleutel. Verandert de code, dan verlopen alle
// bestaande cookies meteen.
export async function accessToken(code: string): Promise<string> {
  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(process.env.PAYLOAD_SECRET || 'svv04-access'),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  return toHex(await crypto.subtle.sign('HMAC', key, encoder.encode(`access:${code}`)))
}

// Vergelijkt zonder vroegtijdig te stoppen, zodat de duur niets verklapt over de code.
export function safeEqual(a: string, b: string): boolean {
  const length = Math.max(a.length, b.length)
  let diff = a.length ^ b.length
  for (let i = 0; i < length; i++) {
    diff |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0)
  }
  return diff === 0
}

// Alleen een pad op deze site: geen andere host (//evil.com), geen schema en niet de poort zelf.
export function safeRedirectTarget(next: unknown): string {
  if (typeof next !== 'string' || !next.startsWith('/') || next.startsWith('//')) {
    return '/'
  }
  if (next.includes('\\') || next.startsWith(ACCESS_PATH)) {
    return '/'
  }
  return next
}
