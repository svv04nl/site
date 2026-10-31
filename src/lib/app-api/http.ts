import { todayInAmsterdam } from '@/lib/ai/time'

// Cache lifetimes in seconds, the guideline from the contract.
export const TTL = {
  program: 300,
  news: 300,
  content: 3600,
  config: 3600,
} as const

/** A failure the app can act on. Anything else becomes a plain 500. */
export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly title: string,
    readonly detail?: string,
  ) {
    super(title)
  }
}

export const notFound = (what: string) => new ApiError(404, 'Niet gevonden', `${what} bestaat niet.`)
export const badRequest = (detail: string) => new ApiError(400, 'Ongeldig verzoek', detail)

export function problem(status: number, title: string, detail?: string, headers?: HeadersInit) {
  return new Response(JSON.stringify({ title, status, ...(detail ? { detail } : {}) }), {
    status,
    headers: {
      'Content-Type': 'application/problem+json',
      'Cache-Control': 'no-store',
      ...headers,
    },
  })
}

/** A ttl of 0 means the response is never cached (chat answers). */
export function json(data: unknown, ttl: number) {
  return new Response(JSON.stringify(data), {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control':
        ttl > 0
          ? `public, max-age=${ttl}, s-maxage=${ttl}, stale-while-revalidate=${ttl}`
          : 'no-store',
    },
  })
}

export function errorResponse(error: unknown) {
  if (error instanceof ApiError) return problem(error.status, error.title, error.detail)
  console.error('[app-api]', error)
  return problem(500, 'Er ging iets mis', 'Probeer het later opnieuw.')
}

/** Wraps a GET handler: JSON with Cache-Control on success, problem+json on failure. */
export function appRoute(ttl: number, handler: (request: Request) => Promise<unknown>) {
  return async (request: Request) => {
    try {
      return json(await handler(request), ttl)
    } catch (error) {
      return errorResponse(error)
    }
  }
}

/** Same for routes with a path parameter (Next 16 passes `params` as a promise). */
export function appRouteWithParams<P>(
  ttl: number,
  handler: (request: Request, params: P) => Promise<unknown>,
) {
  return async (request: Request, context: { params: Promise<P> }) => {
    try {
      return json(await handler(request, await context.params), ttl)
    } catch (error) {
      return errorResponse(error)
    }
  }
}

const SLUG = /^[a-z0-9-]+$/

/** A path slug. Anything that is not a slug cannot exist, so it is a 404 without a lookup. */
export function slugParam(slug: string, what: string): string {
  if (!SLUG.test(slug)) throw notFound(what)
  return slug
}

/** `teams=a,b` -> ['a', 'b']. Entries that are not slugs are dropped. */
export function listParam(url: URL, name: string, max = 30): string[] {
  const values = (url.searchParams.get(name) ?? '').split(',').map((v) => v.trim())
  return [...new Set(values.filter((v) => v && SLUG.test(v)))].slice(0, max)
}

export function enumParam<T extends string>(
  url: URL,
  name: string,
  allowed: readonly T[],
  fallback: T,
): T {
  const value = url.searchParams.get(name)
  if (value === null || value === '') return fallback
  if (!(allowed as readonly string[]).includes(value)) {
    throw badRequest(`Parameter ${name} moet een van ${allowed.join(', ')} zijn.`)
  }
  return value as T
}

export function intParam(url: URL, name: string, fallback: number, min: number, max: number) {
  const raw = url.searchParams.get(name)
  if (raw === null || raw === '') return fallback
  const value = Number(raw)
  if (!Number.isInteger(value) || value < min || value > max) {
    throw badRequest(`Parameter ${name} moet een geheel getal tussen ${min} en ${max} zijn.`)
  }
  return value
}

export function dateParam(url: URL, name: string): string | undefined {
  const raw = url.searchParams.get(name)
  if (!raw) return undefined
  if (!/^\d{4}-\d{2}-\d{2}$/.test(raw) || Number.isNaN(Date.parse(raw))) {
    throw badRequest(`Parameter ${name} moet een datum zijn (JJJJ-MM-DD).`)
  }
  return raw
}

export const today = (url?: URL) => (url && dateParam(url, 'date')) || todayInAmsterdam()
