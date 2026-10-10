import { getPayload } from 'payload'
import config from '@payload-config'
import { syncTeamStaff } from '@/lib/clubdata/sync-staff'

export const maxDuration = 120

// Called daily by Vercel Cron (see vercel.json), which authenticates with CRON_SECRET.
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET
  if (!secret || request.headers.get('authorization') !== `Bearer ${secret}`) {
    return new Response('Unauthorized', { status: 401 })
  }

  const payload = await getPayload({ config })
  const result = await syncTeamStaff(payload)
  return Response.json(result)
}
