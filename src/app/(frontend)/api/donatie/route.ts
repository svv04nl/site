import { randomUUID } from 'node:crypto'
import { getPayload } from 'payload'
import config from '@payload-config'
import { createPayment } from '@/lib/mollie'
import { isHuman } from '@/lib/turnstile'
import { FUNDRAISER_SLUG, parseDonationInput, paymentTotal } from '@/lib/fundraiser'

export async function POST(request: Request) {
  if (!(await isHuman(request))) {
    return Response.json({ error: 'Access denied' }, { status: 403 })
  }

  const body = await request.json().catch(() => ({}))

  // Honeypot: echte bezoekers laten dit verborgen veld leeg.
  if (body && typeof body === 'object' && 'website' in body && body.website) {
    return Response.json({ error: 'Access denied' }, { status: 403 })
  }

  const payload = await getPayload({ config })
  const { docs: fundraisers } = await payload.find({
    collection: 'fundraisers',
    where: { slug: { equals: FUNDRAISER_SLUG } },
    limit: 1,
    depth: 0,
  })
  const fundraiser = fundraisers[0]
  if (!fundraiser?.active) {
    return Response.json({ error: 'Deze actie is gesloten.' }, { status: 410 })
  }

  const parsed = parseDonationInput(body, fundraiser.unitPrice)
  if (!parsed.ok) {
    return Response.json({ error: parsed.error }, { status: 400 })
  }
  const input = parsed.data
  const { amount } = input
  const fee = input.coverFee ? (fundraiser.transactionFee ?? 0) : 0
  const donation = await payload.create({
    collection: 'donations',
    data: {
      fundraiser: fundraiser.id,
      name: input.name,
      email: input.email,
      isCompany: input.isCompany,
      companyName: input.companyName,
      showOnList: input.showOnList,
      nameOnObject: input.nameOnObject,
      units: input.units,
      freeAmount: input.freeAmount,
      amount,
      fee,
      status: 'open',
      publicToken: randomUUID(),
    },
  })

  // Mollie kan een webhook niet naar localhost sturen. Lokaal valt de terugkeerpagina
  // terug op een directe statuscheck.
  const origin = new URL(request.url).origin
  const isLocal = /^https?:\/\/(localhost|127\.0\.0\.1)/.test(origin)

  try {
    const payment = await createPayment({
      amount: paymentTotal(amount, fee),
      description: `Donatie ${fundraiser.title}`,
      redirectUrl: `${origin}/tribune/bedankt?t=${donation.publicToken}`,
      webhookUrl: isLocal ? undefined : `${origin}/api/mollie-webhook`,
      metadata: { donationId: donation.id },
    })
    await payload.update({
      collection: 'donations',
      id: donation.id,
      data: { mollieId: payment.id },
    })

    const checkoutUrl = payment._links?.checkout?.href
    if (!checkoutUrl) throw new Error('Mollie gaf geen checkout-URL')
    return Response.json({ checkoutUrl })
  } catch (err) {
    payload.logger.error(`Creating Mollie payment failed (donation ${donation.id}): ${err}`)
    await payload.update({ collection: 'donations', id: donation.id, data: { status: 'mislukt' } })
    return Response.json(
      { error: 'De betaling kon niet worden gestart. Probeer het later opnieuw.' },
      { status: 502 },
    )
  }
}
