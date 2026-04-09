import React from 'react'
import Link from 'next/link'
import { getPayload } from 'payload'
import config from '@payload-config'
import NextMatchServer from '@/components/NextMatchServer'
import { fetchClubData } from '@/lib/clubdata/fetch'
import type { Post } from '@/payload-types'
import type { RawActiviteitenResponse } from '@/lib/clubdata/types'
import { NewsCard } from '@/components/ui/NewsCard'
import { MoreLink } from '@/components/ui/MoreLink'
import { Sidebar } from '@/components/ui/Sidebar'

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
      where: {
        and: [{ status: { equals: 'published' } }],
      },
      sort: '-publishedAt',
      limit: 4,
      depth: 1,
    }),
    fetchClubData<RawActiviteitenResponse>('verenigingsactiviteiten', {
      aantaldagen: '365',
    }).catch(() => [] as RawActiviteitenResponse),
  ])

  // Preserve the intended display order
  const teams = FEATURED_TEAM_SLUGS.map((slug) =>
    featuredTeams.find((t) => t.slug === slug),
  ).filter((t): t is NonNullable<typeof t> => !!t && !!t.teamcode)

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
              <h1 className="site-hero-title">
                Welkom bij <em>SVV&rsquo;04</em>
              </h1>
              <p className="site-hero-tagline">
                Een sterke gezellige voetbalvereniging uit Schoonebeek,
                <br className="site-hero-tagline-br" /> met een prachtige accommodatie.
              </p>
            </div>
          </div>
        </section>

        {/* Latest news + sidebar (matches + agenda) */}
        <section className="home-news-sidebar-section">
          <div className="home-news-sidebar-inner">
            {/* Left: news */}
            <div className="home-news-col">
              <div className="home-news-header">
                <h2 className="home-news-title">Laatste Nieuws</h2>
                <Link className="home-news-viewall" href="/nieuws">
                  Bekijk alles
                </Link>
              </div>
              <div className="home-news-layout">
                {latestPosts.map((post) => (
                  <NewsCard key={post.id} post={post as Post} />
                ))}
              </div>
            </div>

            {/* Right: sidebar */}
            <Sidebar>
              {/* Matches */}
              <div className="sidebar-section">
                <h2 className="sidebar-section-title">Komende wedstrijden</h2>
                <div className="sidebar-matches-list">
                  {teams.map((team) => (
                    <NextMatchServer
                      key={team.slug}
                      teamcode={team.teamcode!}
                      teamName={team.name}
                      showTitle={false}
                      maxDays={7}
                    />
                  ))}
                </div>
                <MoreLink href="/programma" text="Volledig programma" />
              </div>

              {/* Agenda */}
              <div className="sidebar-section">
                <h2 className="sidebar-section-title">Agenda</h2>
                <ul className="sidebar-agenda-list">
                  {activiteiten.length === 0 && (
                    <li style={{ color: '#888', fontSize: '0.875rem' }}>
                      Geen activiteiten gepland.
                    </li>
                  )}
                  {activiteiten.slice(0, 4).map((item, i) => {
                    const date = new Date(item.datumvan)
                    return (
                      <li key={i} className="sidebar-agenda-item">
                        <div
                          className={`sidebar-agenda-date-box${i === 0 ? ' sidebar-agenda-date-box--primary' : ''}`}
                        >
                          <span className="sidebar-agenda-day">{date.getDate()}</span>
                          <span className="sidebar-agenda-month">
                            {date.toLocaleDateString('nl-NL', { month: 'short' }).replace('.', '')}
                          </span>
                        </div>
                        <div className="sidebar-agenda-content">
                          {item.url ? (
                            <a
                              href={item.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="sidebar-agenda-name"
                            >
                              {item.activiteit}
                            </a>
                          ) : (
                            <span className="sidebar-agenda-name">{item.activiteit}</span>
                          )}
                          {item.plaats && (
                            <span className="sidebar-agenda-meta">{item.plaats}</span>
                          )}
                        </div>
                      </li>
                    )
                  })}
                </ul>
                <MoreLink href="/agenda" text="Volledige agenda" />
              </div>
            </Sidebar>
          </div>
        </section>

        {/* CTA tiles */}
        <section className="home-calendar-section">
          <div className="home-section-inner">
            <div className="cta-grid">
              <Link
                className="cta-tile"
                href="/meedoen/lid-worden"
                style={{ backgroundImage: 'url(/hero-sportpark.jpg)' }}
              >
                <div className="cta-tile-overlay" />
                <div className="cta-tile-content">
                  <h3 className="cta-tile-title">Lid worden</h3>
                  <p className="cta-tile-desc">
                    Wil jij voetballen bij SVV&rsquo;04? Word hier lid van onze club.
                  </p>
                  <span className="cta-tile-link">Lid worden &rarr;</span>
                </div>
              </Link>
              <Link
                className="cta-tile"
                href="/meedoen/sponsor-worden"
                style={{
                  backgroundImage: 'url(/hero-sportpark.jpg)',
                  backgroundPosition: '60% center',
                }}
              >
                <div className="cta-tile-overlay" />
                <div className="cta-tile-content">
                  <h3 className="cta-tile-title">Sponsor worden</h3>
                  <p className="cta-tile-desc">
                    Draag jij SVV&rsquo;04 een warm hart toe? Word sponsor van onze club.
                  </p>
                  <span className="cta-tile-link">Sponsoren &rarr;</span>
                </div>
              </Link>
              <Link
                className="cta-tile"
                href="/meedoen/vrijwilliger-worden"
                style={{
                  backgroundImage: 'url(/hero-sportpark.jpg)',
                  backgroundPosition: 'center 70%',
                }}
              >
                <div className="cta-tile-overlay" />
                <div className="cta-tile-content">
                  <h3 className="cta-tile-title">Vrijwilliger worden</h3>
                  <p className="cta-tile-desc">
                    We zijn altijd op zoek naar mensen die een steentje willen bijdragen.
                  </p>
                  <span className="cta-tile-link">Word vrijwilliger &rarr;</span>
                </div>
              </Link>
              <Link
                className="cta-tile"
                href="/vereniging/voetbal-nl-app"
                style={{
                  backgroundImage: 'url(/hero-sportpark.jpg)',
                  backgroundPosition: '80% 40%',
                }}
              >
                <div className="cta-tile-overlay" />
                <div className="cta-tile-content">
                  <h3 className="cta-tile-title">Voetbal.nl App</h3>
                  <p className="cta-tile-desc">
                    Volg wedstrijden en standen via de officiële voetbal.nl app.
                  </p>
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
            <a href="#" className="sponsors-ticker-logo">
              <img src="/sponsors/logo-anura.png" alt="Anura" />
            </a>
            <a href="#" className="sponsors-ticker-logo">
              <img src="/sponsors/Logo-Mind-Motion.png" alt="Lifestylecenter Mind &amp; Motion" />
            </a>
            <a href="#" className="sponsors-ticker-logo">
              <img src="/sponsors/Logo_Klaverblad_FC_Hor.png" alt="Klaverblad Verzekeringen" />
            </a>
            <a href="#" className="sponsors-ticker-logo">
              <img src="/sponsors/problicity_header-logo_geel.png" alt="Problicity" />
            </a>
            <a href="#" className="sponsors-ticker-logo">
              <img src="/sponsors/riant-logo-removebg-preview.png" alt="Riant Makelaars" />
            </a>
            <a href="#" className="sponsors-ticker-logo">
              <img
                src="/sponsors/logo-scholma-removebg-preview.png"
                alt="Scholma Print &amp; Media"
              />
            </a>
          </div>
          <div className="sponsors-ticker-inner" aria-hidden="true">
            <a href="#" className="sponsors-ticker-logo">
              <img src="/sponsors/logo-anura.png" alt="" />
            </a>
            <a href="#" className="sponsors-ticker-logo">
              <img src="/sponsors/Logo-Mind-Motion.png" alt="" />
            </a>
            <a href="#" className="sponsors-ticker-logo">
              <img src="/sponsors/Logo_Klaverblad_FC_Hor.png" alt="" />
            </a>
            <a href="#" className="sponsors-ticker-logo">
              <img src="/sponsors/problicity_header-logo_geel.png" alt="" />
            </a>
            <a href="#" className="sponsors-ticker-logo">
              <img src="/sponsors/riant-logo-removebg-preview.png" alt="" />
            </a>
            <a href="#" className="sponsors-ticker-logo">
              <img src="/sponsors/logo-scholma-removebg-preview.png" alt="" />
            </a>
          </div>
        </div>
      </div>
    </>
  )
}
