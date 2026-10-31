import { appRoute, TTL } from '@/lib/app-api/http'
import { buildHome } from '@/lib/app-api/home'

export const dynamic = 'force-dynamic'

export const GET = appRoute(TTL.program, buildHome)
