import { appRoute, TTL } from '@/lib/app-api/http'
import { categories } from '@/lib/app-api/posts'

export const dynamic = 'force-dynamic'

export const GET = appRoute(TTL.content, async () => categories)
