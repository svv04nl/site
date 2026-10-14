import { getPayload, type Payload } from 'payload'
import config from '@payload-config'
import type { Donation } from '@/payload-types'
import { getPayment, type MolliePaymentStatus } from '@/lib/mollie'
import { formatEuro } from '@/lib/fundraiser'

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

function describe(donation: Donation): string {
  const parts: string[] = []
  if (donation.seats > 0) {
    const seatsAmount = donation.amount - donation.freeAmount
    parts.push(
      `${donation.seats} ${donation.seats === 1 ? 'stoeltje' : 'stoeltjes'} (${formatEuro(seatsAmount)})`,
    )
  }
  if (donation.freeAmount > 0) parts.push(`een vrije donatie van ${formatEuro(donation.freeAmount)}`)
  return parts.join(' en ')
}

async function sendPaidEmails(payload: Payload, donation: Donation) {
  const who = donation.isCompany && donation.companyName ? donation.companyName : donation.name

  try {
    await payload.sendEmail({
      to: donation.email,
      subject: "Bedankt voor je donatie aan de tribune van SVV'04",
      html: `<p>Hoi ${escapeHtml(donation.name)},</p>
<p>Bedankt voor je donatie aan de renovatie van de tribune van SVV'04. We hebben je betaling van ${formatEuro(donation.amount)} ontvangen, voor ${escapeHtml(describe(donation))}.</p>
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
      subject: `Nieuwe donatie tribune: ${formatEuro(donation.amount)} van ${who}`,
      html: `<p>Er is een donatie betaald voor de tribune-actie.</p>
<table cellpadding="4">
<tr><td>Naam</td><td>${escapeHtml(donation.name)}</td></tr>
${donation.isCompany ? `<tr><td>Bedrijf</td><td>${escapeHtml(donation.companyName ?? '')}</td></tr>` : ''}
<tr><td>E-mail</td><td>${escapeHtml(donation.email)}</td></tr>
<tr><td>Stoeltjes</td><td>${donation.seats}</td></tr>
<tr><td>Vrije donatie</td><td>${formatEuro(donation.freeAmount)}</td></tr>
<tr><td>Totaal</td><td>${formatEuro(donation.amount)}</td></tr>
<tr><td>Naam op de website</td><td>${donation.showOnList ? 'ja' : 'nee'}</td></tr>
<tr><td>Naam op de tribune</td><td>${donation.nameOnTribune ? 'ja' : 'nee'}</td></tr>
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
