import React from 'react'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@payload-config'
import DonationForm from '@/components/tribune/DonationForm'
import { getFundraiserStats } from '@/lib/fundraiser-stats'
import { FUNDRAISER_SLUG, formatEuro } from '@/lib/fundraiser'

export const revalidate = 60

const WORK = [
  { title: 'Nieuwe gevel- en dakbeplating', text: 'De beplating van gevel en dak wordt vervangen.' },
  { title: 'Schilderwerk', text: 'De tribune gaat in de verf.' },
  { title: 'Nieuwe dugouts', text: 'De dugouts worden vervangen.' },
  { title: 'Nieuwe stoeltjes', text: 'Alle stoeltjes worden vervangen door zwart-witte stoeltjes.' },
]

export default async function TribunePage() {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'fundraisers',
    where: { slug: { equals: FUNDRAISER_SLUG } },
    limit: 1,
    depth: 0,
  })
  const fundraiser = docs[0]
  if (!fundraiser) notFound()

  const { seatPrice, goalAmount, active } = fundraiser
  const stats = await getFundraiserStats(fundraiser.id)
  const progress = goalAmount ? Math.min(100, Math.round((stats.totalAmount / goalAmount) * 100)) : null

  return (
    <main className="fr">
      <header className="fr-hero">
        <img className="fr-hero-img" src="/tribune/hero.jpg" alt="De tribune van SVV'04 vanaf het middenveld" />
        <div className="fr-hero-shade" />
        <div className="fr-hero-inner">
          <a className="fr-brand" href="https://svv04.nl">
            <img src="/logo.webp" alt="" width={44} height={44} />
            <span>SVV&apos;04 Schoonebeek</span>
          </a>
          <div className="fr-hero-copy">
            <p className="fr-eyebrow">Fundraiser</p>
            <h1>Help ons de tribune renoveren</h1>
            <p className="fr-lead">
              De tribune van SVV&apos;04 krijgt nieuwe beplating, een nieuwe verflaag, nieuwe dugouts en
              nieuwe stoeltjes. Een stoeltje doneer je voor {formatEuro(seatPrice)}.
            </p>
            {active && (
              <a className="fr-cta" href="#doneer">
                Doneer nu
              </a>
            )}
          </div>
        </div>
      </header>

      {stats.donorCount > 0 && (
        <section className="fr-stats" aria-label="Voortgang">
          <div>
            <strong>{formatEuro(stats.totalAmount)}</strong>
            <span>{goalAmount ? `van ${formatEuro(goalAmount)} opgehaald` : 'opgehaald'}</span>
          </div>
          <div>
            <strong>{stats.totalSeats}</strong>
            <span>{stats.totalSeats === 1 ? 'stoeltje gedoneerd' : 'stoeltjes gedoneerd'}</span>
          </div>
          <div>
            <strong>{stats.donorCount}</strong>
            <span>{stats.donorCount === 1 ? 'donateur' : 'donateurs'}</span>
          </div>
          {progress !== null && (
            <div
              className="fr-progress"
              role="progressbar"
              aria-valuenow={progress}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <span style={{ width: `${progress}%` }} />
            </div>
          )}
        </section>
      )}

      <section className="fr-section">
        <div className="fr-wrap">
          <h2>Wat gaan we doen?</h2>
          <ul className="fr-work">
            {WORK.map((item, i) => (
              <li key={item.title}>
                <span className="fr-work-nr">{i + 1}</span>
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="fr-section fr-section--alt">
        <div className="fr-wrap">
          <h2>Zo ziet de tribune er nu uit</h2>
          <div className="fr-photos">
            <img src="/tribune/tribune-voorkant.jpg" alt="De tribune van voren gezien" loading="lazy" />
            <img src="/tribune/veld.jpg" alt="De tribune vanuit de lucht" loading="lazy" />
          </div>
        </div>
      </section>

      <section className="fr-section" id="doneer">
        <div className="fr-wrap fr-wrap--narrow">
          <h2>Doneer</h2>
          {active ? (
            <>
              <p className="fr-section-lead">
                Eén nieuw stoeltje kost {formatEuro(seatPrice)}. Je kunt ook een vrij bedrag geven,
                alleen of samen met een of meer stoeltjes.
              </p>
              <div className="fr-card">
                <DonationForm seatPrice={seatPrice} />
              </div>
            </>
          ) : (
            <p className="fr-section-lead">
              Deze actie is afgesloten. Bedankt aan iedereen die heeft meegedaan.
            </p>
          )}
          <p className="fr-contact">
            Speciale wensen? <a href="/contact?afdeling=sponsorgroep">Neem contact op met de sponsorgroep</a>.
          </p>
        </div>
      </section>

      {stats.publicDonors.length > 0 && (
        <section className="fr-section fr-section--alt">
          <div className="fr-wrap fr-wrap--narrow">
            <h2>Dank aan onze donateurs</h2>
            <ul className="fr-donors">
              {stats.publicDonors.map((name, i) => (
                <li key={`${name}-${i}`}>{name}</li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <footer className="fr-footer">
        <p>SVV&apos;04 Schoonebeek · De Kampen 18, 7761 CK Schoonebeek</p>
        <p>
          <a href="https://svv04.nl">svv04.nl</a> · <a href="/privacy">Privacyverklaring</a>
        </p>
      </footer>
    </main>
  )
}
