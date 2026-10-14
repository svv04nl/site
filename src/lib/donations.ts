import { getPayload, type Payload } from 'payload'
import config from '@payload-config'
import type { Donation, Fundraiser } from '@/payload-types'
import { getPayment, type MolliePaymentStatus } from '@/lib/mollie'
import { formatEuro, formatUnits, getUnit, paymentTotal } from '@/lib/fundraiser'

type DonationStatus = Donation['status']

const FALLBACK_NOTIFY_EMAIL = 'algemenezaken@svv04.nl'
const SPONSOR_ROLE_SLUG = 'sponsorgroep'

export function mapMollieStatus(status: MolliePaymentStatus): DonationStatus {
  switch (status) {
    case 'paid':
      return 'betaald'
    case 'canceled':
      return 'geannuleerd'
    case 'expired':
      return 'verlopen'
    case 'failed':
      return 'mislukt'
    default:
      return 'open'
  }
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function describe(donation: Donation, fundraiser: Fundraiser): string {
  const unit = getUnit(fundraiser)
  const parts: string[] = []
  if (unit && donation.units > 0) {
    const unitsAmount = donation.amount - donation.freeAmount
    parts.push(`${formatUnits(donation.units, unit)} (${formatEuro(unitsAmount)})`)
  }
  if (donation.freeAmount > 0) parts.push(`een vrije donatie van ${formatEuro(donation.freeAmount)}`)
  return parts.join(' en ')
}

async function sendPaidEmails(payload: Payload, donation: Donation) {
  const who = donation.isCompany && donation.companyName ? donation.companyName : donation.name
  const fundraiser = await payload.findByID({
    collection: 'fundraisers',
    id: typeof donation.fundraiser === 'object' ? donation.fundraiser.id : donation.fundraiser,
    depth: 0,
  })
  const unit = getUnit(fundraiser)

  try {
    await payload.sendEmail({
      to: donation.email,
      subject: "Bedankt voor je donatie aan SVV'04",
      html: `<p>Hoi ${escapeHtml(donation.name)},</p>
<p>Bedankt voor je donatie voor &ldquo;${escapeHtml(fundraiser.title)}&rdquo;. We hebben je betaling van ${formatEuro(paymentTotal(donation.amount, donation.fee ?? 0))} ontvangen, voor ${escapeHtml(describe(donation, fundraiser))}${donation.fee ? ` en ${formatEuro(donation.fee)} transactiekosten` : ''}.</p>
<p>Heb je een vraag of een speciale wens? Neem dan contact op met de sponsorgroep via <a href="https://svv04.nl/contact?afdeling=${SPONSOR_ROLE_SLUG}">svv04.nl/contact</a>.</p>
<p>Sportieve groet,<br />SVV'04</p>`,
    })
  } catch (err) {
    payload.logger.error(`Donation confirmation email failed (donation ${donation.id}): ${err}`)
  }

  try {
    let to = FALLBACK_NOTIFY_EMAIL
    const { docs } = await payload.find({
      collection: 'contacts',
      where: { 'roles.slug': { equals: SPONSOR_ROLE_SLUG } },
      limit: 1,
      depth: 0,
    })
    if (docs[0]?.email) to = docs[0].email

    await payload.sendEmail({
      to,
      subject: `Nieuwe donatie ${fundraiser.title}: ${formatEuro(donation.amount)} van ${who}`,
      html: `<p>Er is een donatie betaald voor &ldquo;${escapeHtml(fundraiser.title)}&rdquo;.</p>
<table cellpadding="4">
<tr><td>Naam</td><td>${escapeHtml(donation.name)}</td></tr>
${donation.isCompany ? `<tr><td>Bedrijf</td><td>${escapeHtml(donation.companyName ?? '')}</td></tr>` : ''}
<tr><td>E-mail</td><td>${escapeHtml(donation.email)}</td></tr>
${unit ? `<tr><td>${escapeHtml(unit.namePlural)}</td><td>${donation.units}</td></tr>\n` : ''}<tr><td>Vrije donatie</td><td>${formatEuro(donation.freeAmount)}</td></tr>
<tr><td>Donatie</td><td>${formatEuro(donation.amount)}</td></tr>
<tr><td>Transactiekosten meebetaald</td><td>${formatEuro(donation.fee ?? 0)}</td></tr>
<tr><td>Naam op de website</td><td>${donation.showOnList ? 'ja' : 'nee'}</td></tr>
<tr><td>Naam fysiek plaatsen</td><td>${donation.nameOnObject ? 'ja' : 'nee'}</td></tr>
</table>`,
    })
  } catch (err) {
    payload.logger.error(`Donation notification email failed (donation ${donation.id}): ${err}`)
  }
}

// Haalt de actuele betaalstatus bij Mollie op en werkt de donatie bij. De webhook
// en de terugkeerpagina gebruiken dezelfde functie, dus aanroepen is idempotent:
// de mails gaan alleen weg bij de overgang naar "betaald".
export async function syncDonation(donation: Donation): Promise<Donation> {
  if (!donation.mollieId || donation.status === 'betaald') return donation

  const payload = await getPayload({ config })
  const payment = await getPayment(donation.mollieId)
  const status = mapMollieStatus(payment.status)
  if (status === donation.status) return donation

  if (status !== 'betaald') {
    return payload.update({ collection: 'donations', id: donation.id, data: { status } })
  }

  // Alleen de aanroep die de status daadwerkelijk wijzigt, stuurt de mails.
  const { docs } = await payload.update({
    collection: 'donations',
    where: { id: { equals: donation.id }, status: { not_equals: 'betaald' } },
    data: { status: 'betaald', paidAt: new Date().toISOString(), method: payment.method ?? null },
  })
  const paid = docs[0]
  if (!paid) return { ...donation, status: 'betaald' }

  await sendPaidEmails(payload, paid)
  return paid
}

// Vangnet voor als de webhook en de terugkeerpagina allebei gemist zijn (bijvoorbeeld
// een donateur die na het betalen de browser sluit terwijl de webhook faalt): loopt de
// donaties langs die nog "open" staan en vraagt de status opnieuw bij Mollie op. Recente
// donaties laten we met rust, want die zijn mogelijk nog bezig met betalen.
export async function reconcileOpenDonations(
  payload: Payload,
  { minAgeMinutes = 15, maxAgeDays = 30, limit = 100 } = {},
) {
  const now = Date.now()
  const { docs } = await payload.find({
    collection: 'donations',
    where: {
      and: [
        { status: { equals: 'open' } },
        { mollieId: { exists: true } },
        { createdAt: { less_than: new Date(now - minAgeMinutes * 60_000).toISOString() } },
        { createdAt: { greater_than: new Date(now - maxAgeDays * 86_400_000).toISOString() } },
      ],
    },
    sort: 'createdAt',
    limit,
    depth: 0,
  })

  const result = { checked: docs.length, paid: 0, otherChange: 0, unchanged: 0, failed: 0 }
  for (const donation of docs) {
    try {
      const updated = await syncDonation(donation)
      if (updated.status === 'betaald') result.paid++
      else if (updated.status !== donation.status) result.otherChange++
      else result.unchanged++
    } catch (err) {
      // Eén mislukte controle mag de rest niet tegenhouden.
      result.failed++
      payload.logger.error(`Reconciling donation ${donation.id} failed: ${err}`)
    }
  }
  return result
}
