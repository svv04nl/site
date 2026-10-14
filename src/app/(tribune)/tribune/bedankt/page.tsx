import React from 'react'
import type { Metadata } from 'next'
import { getPayload } from 'payload'
import config from '@payload-config'
import { syncDonation } from '@/lib/donations'
import { formatEuro } from '@/lib/fundraiser'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: "Bedankt | SVV'04", robots: { index: false } }

type Props = { searchParams: Promise<{ t?: string }> }

export default async function ThanksPage({ searchParams }: Props) {
  const { t } = await searchParams
  const payload = await getPayload({ config })

  let donation = null
  if (t && /^[0-9a-f-]{36}$/.test(t)) {
    const { docs } = await payload.find({
      collection: 'donations',
      where: { publicToken: { equals: t } },
      limit: 1,
    })
    donation = docs[0] ?? null
  }

  // Webhook kan nog onderweg zijn (of ontbreekt lokaal): vraag de status direct op.
  if (donation) {
    try {
      donation = await syncDonation(donation)
    } catch (err) {
      payload.logger.error(`Sync on return page failed: ${err}`)
    }
  }

  const status = donation?.status

  return (
    <main className="fr fr-thanks">
      <div className="fr-thanks-card">
        <a className="fr-brand fr-brand--dark" href="https://svv04.nl">
          <img src="/logo.webp" alt="" width={44} height={44} />
          <span>SVV&apos;04 Schoonebeek</span>
        </a>

        {status === 'betaald' && donation && (
          <>
            <h1>Bedankt, {donation.name}!</h1>
            <p>
              Je donatie van {formatEuro(donation.amount)} voor de renovatie van de tribune is
              binnen. We sturen een bevestiging naar {donation.email}.
            </p>
          </>
        )}

        {status === 'open' && (
          <>
            <h1>We verwerken je betaling</h1>
            <p>
              De bank heeft de betaling nog niet bevestigd. Ververs deze pagina over een paar
              minuten. Als het gelukt is, krijg je een bevestiging per e-mail.
            </p>
          </>
        )}

        {(status === 'geannuleerd' || status === 'verlopen' || status === 'mislukt') && (
          <>
            <h1>De betaling is niet gelukt</h1>
            <p>Er is niets afgeschreven. Je kunt het opnieuw proberen.</p>
          </>
        )}

        {!donation && (
          <>
            <h1>Donatie niet gevonden</h1>
            <p>We konden deze donatie niet terugvinden.</p>
          </>
        )}

        <a
          className="fr-cta"
          href={status === 'betaald' || !donation ? 'https://svv04.nl' : '/tribune#doneer'}
        >
          {status === 'betaald' || !donation ? 'Naar svv04.nl' : 'Opnieuw proberen'}
        </a>
      </div>
    </main>
  )
}
