import React from 'react'
import Link from 'next/link'
import { getPayload } from 'payload'
import config from '@payload-config'
import NextMatchServer from '@/components/NextMatchServer'
import { fetchClubData } from '@/lib/clubdata/fetch'
import type { Media } from '@/payload-types'
import type { RawActiviteitenResponse } from '@/lib/clubdata/types'

const FEATURED_TEAM_SLUGS = ['svv04-1', 'svv04-o21-1', 'svv04-jo9-1']

export default async function HomePage() {
  const payload = await getPayload({ config })

  const [{ docs: featuredTeams }, { docs: latestPosts }, activiteiten] = await Promise.all([
    payload.find({
      collection: 'teams',
      where: { slug: { in: FEATURED_TEAM_SLUGS } },
      depth: 0,
      limit: 10,
    }),
    payload.find({
      collection: 'posts',
      where: { status: { equals: 'published' } },
      sort: '-publishedAt',
      limit: 3,
      depth: 1,
    }),
    fetchClubData<RawActiviteitenResponse>('verenigingsactiviteiten', null, {
      aantaldagen: '365',
    }).catch(() => [] as RawActiviteitenResponse),
  ])

  // Preserve the intended display order
  const teams = FEATURED_TEAM_SLUGS
    .map((slug) => featuredTeams.find((t) => t.slug === slug))
    .filter((t): t is NonNullable<typeof t> => !!t && !!t.teamcode)

  return (
    <>
      <main>

        {/* Hero */}
        <section className="site-hero">
          <div
            className="site-hero-image"
            aria-hidden="true"
            style={{ backgroundImage: 'url(/hero-sportpark.jpg)' }}
          >
            <div className="site-hero-overlay" />
          </div>
          <div className="site-hero-inner">
            <div className="site-hero-content">
              <p className="site-hero-eyebrow">Schoonebeekse Voetbal Vereniging</p>
              <h1 className="site-hero-title">Welkom bij <em>SVV&rsquo;04</em></h1>
            </div>
          </div>
        </section>

        {/* Fixtures */}
        <section className="matches-section">
          <div className="home-section-inner">
            <h2 className="matches-title">Wedstrijden</h2>
            <div className="matches-grid">
              {teams.map((team) => (
                <NextMatchServer key={team.slug} teamcode={team.teamcode!} teamName={team.name} showTitle={false} />
              ))}
            </div>
            <div className="matches-footer">
              <Link className="home-section-link" href="/programma">Volledig programma &rarr;</Link>
            </div>
          </div>
        </section>

        {/* Latest news */}
        <section className="home-section">
          <div className="home-section-inner">
            <div className="home-section-header">
              <h2 className="home-section-title">
                Het Laatste nieuws{' '}
                <Link className="home-section-inline-link" href="/nieuws">Bekijk alle nieuws &rarr;</Link>
              </h2>
            </div>
            <div className="news-grid">
              {latestPosts.map((post) => {
                const image = post.featuredImage as Media | null | undefined
                const imageUrl = image?.url ?? null
                return (
                  <article key={post.id} className="news-card">
                    <div className={`news-card-img-wrap${imageUrl ? '' : ' news-card-img-wrap--accent'}`}>
                      {imageUrl && (
                        <img src={imageUrl} alt={image?.alt ?? post.title} className="news-card-img" />
                      )}
                    </div>
                    <div className="news-card-body">
                      <time className="news-card-date">
                        {post.publishedAt
                          ? new Date(post.publishedAt).toLocaleDateString('nl-NL', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                            })
                          : ''}
                      </time>
                      <h3 className="news-card-title">
                        <Link href={`/nieuws/${post.slug}`}>{post.title}</Link>
                      </h3>
                    </div>
                  </article>
                )
              })}
            </div>
          </div>
        </section>

        {/* Agenda + CTA tiles */}
        <section className="home-calendar-section">
          <div className="home-section-inner home-calendar-inner">

            <div className="calendar-panel">
              <h2 className="calendar-title">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /><circle cx="12" cy="15" r="1" fill="currentColor" />
                </svg>
                Agenda
              </h2>
              <ol className="calendar-list">
                {activiteiten.length === 0 && (
                  <li className="calendar-item calendar-item--empty">Geen activiteiten gepland.</li>
                )}
                {activiteiten.map((item, i) => {
                  const date = new Date(item.datumvan)
                  const formatted = date.toLocaleDateString('nl-NL', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                  })
                  return (
                    <li key={i} className="calendar-item">
                      <time className="calendar-date">{formatted}</time>
                      <span className="calendar-event">
                        {item.url ? (
                          <a href={item.url} target="_blank" rel="noopener noreferrer">{item.activiteit}</a>
                        ) : item.activiteit}
                      </span>
                    </li>
                  )
                })}
              </ol>
              <Link className="calendar-more" href="/agenda">Volledige agenda bekijken &rarr;</Link>
            </div>

            <div className="cta-grid">
              <Link className="cta-tile" href="#" style={{ backgroundImage: 'url(/hero-sportpark.jpg)' }}>
                <div className="cta-tile-overlay" />
                <div className="cta-tile-content">
                  <h3 className="cta-tile-title">Lid worden</h3>
                  <p className="cta-tile-desc">Wil jij voetballen bij SVV&rsquo;04? Word hier lid van onze club.</p>
                  <span className="cta-tile-link">Lid worden &rarr;</span>
                </div>
              </Link>
              <Link className="cta-tile" href="#" style={{ backgroundImage: 'url(/hero-sportpark.jpg)', backgroundPosition: '60% center' }}>
                <div className="cta-tile-overlay" />
                <div className="cta-tile-content">
                  <h3 className="cta-tile-title">Sponsor worden</h3>
                  <p className="cta-tile-desc">Draag jij SVV&rsquo;04 een warm hart toe? Word sponsor van onze club.</p>
                  <span className="cta-tile-link">Sponsoren &rarr;</span>
                </div>
              </Link>
              <Link className="cta-tile" href="#" style={{ backgroundImage: 'url(/hero-sportpark.jpg)', backgroundPosition: 'center 70%' }}>
                <div className="cta-tile-overlay" />
                <div className="cta-tile-content">
                  <h3 className="cta-tile-title">Vrijwilliger worden</h3>
                  <p className="cta-tile-desc">We zijn altijd op zoek naar mensen die een steentje willen bijdragen.</p>
                  <span className="cta-tile-link">Word vrijwilliger &rarr;</span>
                </div>
              </Link>
              <Link className="cta-tile" href="#" style={{ backgroundImage: 'url(/hero-sportpark.jpg)', backgroundPosition: '80% 40%' }}>
                <div className="cta-tile-overlay" />
                <div className="cta-tile-content">
                  <h3 className="cta-tile-title">Voetbal.nl App</h3>
                  <p className="cta-tile-desc">Volg wedstrijden en standen via de officiële voetbal.nl app.</p>
                  <span className="cta-tile-link">Downloaden &rarr;</span>
                </div>
              </Link>
            </div>

          </div>
        </section>

      </main>

      {/* Sponsor strip */}
      <div className="sponsors-ticker">
        <div className="sponsors-ticker-track">
          <div className="sponsors-ticker-inner">
            <a href="#" className="sponsors-ticker-logo"><img src="/sponsors/logo-anura.png" alt="Anura" /></a>
            <a href="#" className="sponsors-ticker-logo"><img src="/sponsors/Logo-Mind-Motion.png" alt="Lifestylecenter Mind &amp; Motion" /></a>
            <a href="#" className="sponsors-ticker-logo"><img src="/sponsors/Logo_Klaverblad_FC_Hor.png" alt="Klaverblad Verzekeringen" /></a>
            <a href="#" className="sponsors-ticker-logo"><img src="/sponsors/problicity_header-logo_geel.png" alt="Problicity" /></a>
            <a href="#" className="sponsors-ticker-logo"><img src="/sponsors/riant-logo-removebg-preview.png" alt="Riant Makelaars" /></a>
            <a href="#" className="sponsors-ticker-logo"><img src="/sponsors/logo-scholma-removebg-preview.png" alt="Scholma Print &amp; Media" /></a>
          </div>
          <div className="sponsors-ticker-inner" aria-hidden="true">
            <a href="#" className="sponsors-ticker-logo"><img src="/sponsors/logo-anura.png" alt="" /></a>
            <a href="#" className="sponsors-ticker-logo"><img src="/sponsors/Logo-Mind-Motion.png" alt="" /></a>
            <a href="#" className="sponsors-ticker-logo"><img src="/sponsors/Logo_Klaverblad_FC_Hor.png" alt="" /></a>
            <a href="#" className="sponsors-ticker-logo"><img src="/sponsors/problicity_header-logo_geel.png" alt="" /></a>
            <a href="#" className="sponsors-ticker-logo"><img src="/sponsors/riant-logo-removebg-preview.png" alt="" /></a>
            <a href="#" className="sponsors-ticker-logo"><img src="/sponsors/logo-scholma-removebg-preview.png" alt="" /></a>
          </div>
        </div>
      </div>
    </>
  )
}
