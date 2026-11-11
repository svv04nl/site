const BASE_URL = 'https://data.sportlink.com'

/**
 * A Club.Dataservice (Sportlink) article as JSON. By default the response sits five minutes in
 * Next's fetch cache. `fresh` skips that cache, for loaders that are cached as a whole already
 * (see sharedCache), so two caches do not add up.
 */
export async function fetchClubData<T>(
  article: string,
  params?: Record<string, string>,
  { fresh = false }: { fresh?: boolean } = {},
): Promise<T> {
  const clientId = process.env.NEXT_PUBLIC_CLUBDATA_CLIENT_ID
  if (!clientId) {
    throw new Error('NEXT_PUBLIC_CLUBDATA_CLIENT_ID is not set')
  }

  const url = new URL(`${BASE_URL}/${article}`)
  url.searchParams.set('client_id', clientId)
  for (const [k, v] of Object.entries(params ?? {})) {
    url.searchParams.set(k, v)
  }

  const res = await fetch(
    url.toString(),
    fresh ? { cache: 'no-store' } : { next: { revalidate: 300 } },
  )
  if (!res.ok) {
    throw new Error(`clubdata ${article}: HTTP ${res.status}`)
  }
  return res.json() as Promise<T>
}
