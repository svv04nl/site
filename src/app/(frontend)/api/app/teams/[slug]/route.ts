import { appRouteWithParams, notFound, slugParam, TTL } from '@/lib/app-api/http'
import { loadTeamDocs, teamDetail } from '@/lib/app-api/teams'

export const dynamic = 'force-dynamic'

export const GET = appRouteWithParams<{ slug: string }>(TTL.content, async (_request, { slug }) => {
  const team = (await loadTeamDocs()).find((t) => t.slug === slugParam(slug, 'Dit team'))
  if (!team) throw notFound('Dit team')
  return teamDetail(team)
})
