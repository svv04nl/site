import React from 'react'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@payload-config'
import DonationForm from '@/components/tribune/DonationForm'
import { getFundraiserStats } from '@/lib/fundraiser-stats'
import { FUNDRAISER_SLUG, formatEuro } from '@/lib/fundraiser'

export const revalidate = 60

const WORK = [
  {
    title: 'Nieuwe gevel- en dakbeplating',
    text: "Onze jeugdspelers hebben heel wat ballen tegen de achterbeplating geschoten. Dat is natuurlijk mooi, maar de beplating heeft daardoor zijn beste tijd gehad. We willen de gevel- en dakbeplating vervangen door nieuwe, strakke platen, zodat de tribune er weer fris uitziet.",
    photos: [
      {
        src: '/tribune/gevel-achterwand.jpg',
        alt: 'De grijze achterwand van de tribune boven de stoeltjes',
        caption: 'De achterwand van de tribune',
      },
      {
        src: '/tribune/gevel-dak.jpg',
        alt: 'Het golfplaten dak van de tribune gezien van bovenaf',
        caption: 'Het dak van bovenaf',
      },
    ],
  },
  {
    title: 'Schilderwerk',
    text: 'De tribune gaat in de verf, zodat hij er weer fris uitziet en dezelfde kleur heeft als de overige gebouwen.',
    photos: [
      {
        src: '/tribune/schilder-tribune.jpg',
        alt: "De tribune van SVV'04 met de overige gebouwen op de achtergrond",
        caption: 'De tribune met de overige gebouwen erachter',
      },
      {
        src: '/tribune/schilder-gebouwen.jpg',
        alt: "De overige gebouwen op het sportcomplex van SVV'04",
        caption: 'De overige gebouwen op het complex',
      },
    ],
  },
  {
    title: 'Nieuwe dugouts',
    text: 'Het metselwerk van de dugouts is gescheurd en er is lekkage. We willen de dugouts vervangen door nieuwe betonnen wanden.',
    photos: [
      {
        src: '/tribune/dugout-links.jpg',
        alt: 'De dugout aan de linkerkant met een bakstenen wand en roze stoeltjes',
        caption: 'De dugout aan de linkerkant',
      },
      {
        src: '/tribune/dugout-rechts.jpg',
        alt: 'De dugout aan de rechterkant met een bakstenen wand en roze stoeltjes',
        caption: 'De dugout aan de rechterkant',
      },
    ],
  },
  {
    title: 'Nieuwe stoeltjes',
    text: "De huidige rode stoeltjes zijn verouderd en verweerd. We willen de tribune voorzien van nieuwe stoeltjes in de clubkleuren van SVV'04.",
    photos: [
      {
        src: '/tribune/stoeltjes-links.jpg',
        alt: 'De rode stoeltjes in het linkerdeel van de tribune',
        caption: 'Het linkerdeel van de tribune',
      },
      {
        src: '/tribune/stoeltjes-rechts.jpg',
        alt: 'De rode stoeltjes in het rechterdeel van de tribune',
        caption: 'Het rechterdeel van de tribune',
      },
    ],
  },
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

  const { seatPrice, goalAmount, active, transactionFee } = fundraiser
  const stats = await getFundraiserStats(fundraiser.id)
  const progress = goalAmount ? Math.min(100, Math.round((stats.totalAmount / goalAmount) * 100)) : null

  return (
    <main className="fr">
      <header className="fr-hero">
        <img className="fr-hero-img" src="/tribune/hero.jpg" alt="De tribune van SVV'04 vanaf het middenveld" />
        <div className="fr-hero-shade" />
        <div className="fr-hero-inner">
          <a className="fr-logo" href="https://svv04.nl" aria-label="SVV'04 Schoonebeek, naar svv04.nl">
            <img src="/logo.webp" alt="SVV'04 Schoonebeek" width={278} height={336} />
          </a>
          <div className="fr-hero-copy">
            <p className="fr-eyebrow">Fundraiser</p>
            <h1>Steun de renovatie van onze tribune!</h1>
            <p className="fr-lead">
              Onze tribune gaat al een tijdje mee en is toe aan een renovatie.
              <span className="fr-lead-price">
                Help mee en doneer een stoeltje voor{' '}
                {formatEuro(seatPrice)}. Een vrij bedrag geven kan ook!
              </span>
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
        <section className="fr-section fr-section--dark" aria-label="Voortgang">
          <div className="fr-wrap">
            <h2>Tot nu toe</h2>
            <div className="fr-stats">
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
          </div>
        </section>
      )}

      <section className="fr-section">
        <div className="fr-wrap">
          <h2>Wat gaan we doen?</h2>
          <div className="fr-items">
            {WORK.map((item, i) => (
              <article key={item.title} className="fr-item">
                <div className="fr-item-head">
                  <span className="fr-work-nr">{i + 1}</span>
                  <div>
                    <h3>{item.title}</h3>
                    <p>{item.text}</p>
                  </div>
                </div>
                <div className="fr-item-media">
                  <p className="fr-item-label">Huidige staat</p>
                  <div className="fr-item-photos">
                    {item.photos.map((photo) => (
                      <figure key={photo.src}>
                        <img src={photo.src} alt={photo.alt} loading="lazy" />
                        <figcaption>{photo.caption}</figcaption>
                      </figure>
                    ))}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="fr-section fr-section--alt">
        <div className="fr-wrap">
          <h2>Zo kan de tribune eruitzien</h2>
          <figure className="fr-impression">
            <img
              src="/tribune/impressie.jpg"
              alt="AI-impressie van de gerenoveerde tribune met zwart-witte stoeltjes"
              loading="lazy"
            />
            <span className="fr-ai-badge">AI-impressie</span>
            <figcaption>
              Dit is een AI-impressie van na de renovatie. Het echte resultaat kan afwijken.
            </figcaption>
          </figure>
        </div>
      </section>

      <section className="fr-section" id="doneer">
        <div className="fr-wrap fr-wrap--narrow">
          <h2>Doneer</h2>
          {active ? (
            <>
              <p className="fr-section-lead">
                Eén nieuw stoeltje kost {formatEuro(seatPrice)}. Kies het aantal stoeltjes of vul zelf
                een bedrag in.
              </p>
              <div className="fr-card">
                <DonationForm seatPrice={seatPrice} transactionFee={transactionFee ?? 0} />
              </div>
            </>
          ) : (
            <p className="fr-section-lead">
              Deze actie is afgesloten. Bedankt aan iedereen die heeft meegedaan.
            </p>
          )}
          <p className="fr-contact">
            Heb je vragen of goede ideeën? Wil je sponsoring op maat?
            <br />
            <a href="/contact?afdeling=sponsorgroep">Neem contact op met de sponsorgroep.</a>
          </p>
        </div>
      </section>

      {stats.publicDonors.length > 0 && (
        <section className="fr-section fr-section--alt">
          <div className="fr-wrap fr-wrap--narrow">
            <h2>Dank aan onze donateurs</h2>
            <ul className="fr-donors">
              {stats.publicDonors.map((donor, i) => (
                <li key={`${donor.name}-${i}`}>
                  <span className="fr-donor-name">{donor.name}</span>
                  <span className="fr-donor-gift">
                    {donor.seats > 0 &&
                      `${donor.seats} ${donor.seats === 1 ? 'stoeltje' : 'stoeltjes'} \u00b7 `}
                    {formatEuro(donor.amount)}
                  </span>
                </li>
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
