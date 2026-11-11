import React from 'react'
import Link from 'next/link'
import { getPayload } from 'payload'
import config from '@payload-config'

/**
 * "Vind jouw weg bij SVV'04" on the homepage: one card per audience (Doelgroepen) in
 * the CMS. Title and description come from the audience itself; the card links to
 * its landing page at /[slug].
 */
export async function FindYourWaySection() {
  const payload = await getPayload({ config })

  const { docs: audiences } = await payload.find({
    collection: 'audiences',
    where: { showOnHome: { equals: true } },
    sort: 'order',
    limit: 20,
    depth: 0,
  })

  if (audiences.length === 0) {
    return null
  }

  return (
    <section className="findway-section" aria-labelledby="findway-title">
      <div className="findway-inner">
        <div className="findway-header">
          <p className="home-eyebrow">Voor jou</p>
          <h2 className="findway-title" id="findway-title">
            Vind jouw weg bij <span>SVV&rsquo;04</span>
          </h2>
          <p className="findway-subtitle">Kies je rol en ga direct naar jouw pagina.</p>
        </div>

        <ul className="findway-grid">
          {audiences.map((audience) => (
            <li key={audience.id}>
              <Link href={`/${audience.slug}`} className="findway-card">
                <h3 className="findway-card-title">{audience.cardTitle}</h3>
                <p className="findway-card-text">{audience.cardDescription}</p>
                <span className="findway-card-arrow" aria-hidden="true">
                  &rarr;
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
