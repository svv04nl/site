import { todayInAmsterdam } from '@/lib/ai/time'
import { loadActivities } from '@/lib/app-api/activities'
import { appRoute, dateParam, intParam, TTL } from '@/lib/app-api/http'

export const dynamic = 'force-dynamic'

export const GET = appRoute(TTL.content, async (request) => {
  const url = new URL(request.url)
  const from = dateParam(url, 'from') ?? todayInAmsterdam()
  const limit = intParam(url, 'limit', 30, 1, 100)

  return (await loadActivities()).filter((a) => a.date >= from).slice(0, limit)
})
