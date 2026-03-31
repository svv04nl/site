const BASE_URL = 'https://data.sportlink.com'

export async function fetchClubData<T>(
  article: string,
  teamcode?: string | number | null,
  params?: Record<string, string>,
): Promise<T> {
  const clientId = process.env.NEXT_PUBLIC_CLUBDATA_CLIENT_ID
  if (!clientId) throw new Error('NEXT_PUBLIC_CLUBDATA_CLIENT_ID is not set')

  const url = new URL(`${BASE_URL}/${article}`)
  if (teamcode != null) url.searchParams.set('teamcode', String(teamcode))
  url.searchParams.set('client_id', clientId)
  for (const [k, v] of Object.entries(params ?? {})) {
    url.searchParams.set(k, v)
  }

  const res = await fetch(url.toString(), { next: { revalidate: 300 } })
  if (!res.ok) throw new Error(`clubdata ${article}: HTTP ${res.status}`)
  return res.json() as Promise<T>
}
