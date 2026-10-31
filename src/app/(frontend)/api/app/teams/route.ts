import { appRoute, badRequest, TTL } from '@/lib/app-api/http'
import { teamGroups } from '@/lib/app-api/teams'

export const dynamic = 'force-dynamic'

export const GET = appRoute(TTL.program, async (request) => {
  const include = (new URL(request.url).searchParams.get('include') ?? '')
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean)
  if (include.some((v) => v !== 'nextMatch')) throw badRequest('Parameter include kent alleen nextMatch.')

  return { groups: await teamGroups(include.includes('nextMatch')) }
})
