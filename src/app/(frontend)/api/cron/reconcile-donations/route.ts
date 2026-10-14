import { revalidatePath } from 'next/cache'
import { getPayload } from 'payload'
import config from '@payload-config'
import { reconcileOpenDonations } from '@/lib/donations'

export const maxDuration = 120

// Called daily by Vercel Cron (see vercel.json), which authenticates with CRON_SECRET.
// Safety net for donations whose Mollie webhook and return page were both missed.
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET
  if (!secret || request.headers.get('authorization') !== `Bearer ${secret}`) {
    return new Response('Unauthorized', { status: 401 })
  }

  const payload = await getPayload({ config })
  const result = await reconcileOpenDonations(payload)
  if (result.paid > 0 || result.otherChange > 0) revalidatePath('/tribune')
  return Response.json(result)
}
