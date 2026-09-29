import React from 'react'
import Link from 'next/link'
import { getPayload } from 'payload'
import config from '@payload-config'

/**
 * "Vind jouw weg bij SVV'04" — a grid of audience cards on the homepage.
 * Each card links to its audience landing page at /[slug].
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

  if (audiences.length === 0) return null

  return (
    <section className="findway-section">
      <div className="home-section-inner">
        <div className="findway-header">
          <h2 className="findway-title">Vind jouw weg bij SVV&rsquo;04</h2>
          <p className="findway-subtitle">
            Kies je rol en spring direct naar wat voor jou relevant is.
          </p>
        </div>
        <div className="findway-grid">
          {audiences.map((audience) => (
            <Link
              key={audience.id}
              href={`/${audience.slug}`}
              className="findway-card"
            >
              <h3 className="findway-card-title">{audience.cardTitle}</h3>
              <p className="findway-card-desc">{audience.cardDescription}</p>
              <span className="findway-card-link">Bekijk pagina &rarr;</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
