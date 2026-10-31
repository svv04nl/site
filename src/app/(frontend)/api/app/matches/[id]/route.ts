import { appRouteWithParams, notFound, TTL } from '@/lib/app-api/http'
import { loadMatchDetail } from '@/lib/app-api/match-detail'

export const dynamic = 'force-dynamic'

export const GET = appRouteWithParams<{ id: string }>(TTL.program, async (_request, { id }) => {
  if (!/^\d{1,12}$/.test(id)) throw notFound('Deze wedstrijd')
  try {
    return await loadMatchDetail(id)
  } catch {
    // Club.Dataservice kent deze wedstrijdcode niet (of is even niet bereikbaar).
    throw notFound('Deze wedstrijd')
  }
})
