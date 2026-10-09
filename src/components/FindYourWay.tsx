'use client'

import React, { useState } from 'react'
import Link from 'next/link'

export type FindYourWayItem = {
  slug: string
  /** Label on the role chip, e.g. "Ouder". */
  label: string
  eyebrow: string
  title: string
  intro: string
  cta: string
  links: { title: string; description?: string | null; href: string }[]
}

// Role picker of the homepage: choose who you are and see the most relevant pages
// for that audience. The audience is picked via aria-pressed chips, the panel is a
// polite live region.
export function FindYourWay({
  items,
  defaultSlug,
}: {
  items: FindYourWayItem[]
  defaultSlug?: string
}) {
  const [activeSlug, setActiveSlug] = useState(
    items.some((i) => i.slug === defaultSlug) ? defaultSlug : items[0]?.slug,
  )
  const active = items.find((i) => i.slug === activeSlug) ?? items[0]
  if (!active) return null

  return (
    <section className="findway-section" aria-labelledby="findway-title">
      <div className="findway-inner">
        <div className="findway-header">
          <div>
            <p className="home-eyebrow">Voor jou</p>
            <h2 className="findway-title" id="findway-title">
              Vind jouw weg bij <span>SVV&rsquo;04</span>
            </h2>
          </div>
          <p className="findway-subtitle">
            Kies wie je bent. Je ziet dan meteen de pagina&rsquo;s die voor jou het belangrijkst
            zijn.
          </p>
        </div>

        <div className="findway-chips">
          {items.map((item) => (
            <button
              key={item.slug}
              type="button"
              className={`findway-chip${item.slug === active.slug ? ' is-active' : ''}`}
              aria-pressed={item.slug === active.slug}
              onClick={() => setActiveSlug(item.slug)}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="findway-panel" aria-live="polite">
          <div className="findway-panel-intro">
            <p className="findway-panel-eyebrow">{active.eyebrow}</p>
            <h3 className="findway-panel-title">{active.title}</h3>
            <p className="findway-panel-text">{active.intro}</p>
            <Link href={`/${active.slug}`} className="btn btn--primary btn--lg findway-panel-cta">
              {active.cta} &rarr;
            </Link>
          </div>
          <ul className="findway-panel-links">
            {active.links.map((link) => (
              <li key={link.href + link.title}>
                <Link href={link.href} className="findway-link">
                  <span>
                    <span className="findway-link-title">{link.title}</span>
                    {link.description && (
                      <span className="findway-link-sub">{link.description}</span>
                    )}
                  </span>
                  <span className="findway-link-arrow" aria-hidden="true">
                    &rarr;
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
