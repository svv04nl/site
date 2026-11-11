import { revalidatePath } from 'next/cache'
import { getPayload } from 'payload'
import config from '@payload-config'
import { syncDonation } from '@/lib/donations'

// Mollie stuurt alleen het betaal-id (form-encoded) mee. De status halen we zelf bij
// Mollie op, dus een nagemaakte aanroep kan een donatie niet als betaald markeren.
export async function POST(request: Request) {
  const form = await request.formData().catch(() => null)
  const id = form?.get('id')
  if (typeof id !== 'string' || !/^tr_[A-Za-z0-9]+$/.test(id)) {
    return new Response(null, { status: 400 })
  }

  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'donations',
    where: { mollieId: { equals: id } },
    limit: 1,
  })
  if (!docs[0]) {
    return new Response(null, { status: 200 })
  }

  try {
    await syncDonation(docs[0])
    // De donateurslijst en voortgang op /tribune verversen. Revalideren kan alleen
    // buiten het renderen, dus hier en niet in syncDonation.
    revalidatePath('/tribune')
  } catch (err) {
    payload.logger.error(`Mollie webhook failed for ${id}: ${err}`)
    // Een foutstatus laat Mollie het later opnieuw proberen.
    return new Response(null, { status: 500 })
  }
  return new Response(null, { status: 200 })
}
