import React from 'react'
import Link from 'next/link'
import { getPayload } from 'payload'
import config from '@payload-config'
import NextMatchServer from '@/components/NextMatchServer'
import type { Post } from '@/payload-types'
import { NewsCard } from '@/components/ui/NewsCard'
import { MoreLink } from '@/components/ui/MoreLink'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { ActiviteitenSidebar } from '@/components/ActiviteitenSidebar'

const FEATURED_TEAM_SLUGS = ['svv04-1', 'svv04-o21-1', 'svv04-jo19-1']

export default async function HomePage() {
  const payload = await getPayload({ config })

  const [{ docs: featuredTeams }, { docs: latestPosts }] = await Promise.all([
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

        <div className="page">
          {/* Latest news + sidebar (matches + agenda) */}
          <div className="section-with-sidebar">
            {/* Left: news */}
            <div className="sidebar-content-col sidebar-content-col--no-gap">
              <SectionHeader
                title="Laatste Nieuws"
                link={{ href: '/nieuws', label: 'Bekijk alles' }}
              />
              <div className="home-news-layout">
                {latestPosts.map((post) => (
                  <NewsCard key={post.id} post={post as Post} />
                ))}
              </div>
            </div>

            {/* Right: sidebar */}
            <div className="sidebar-col">
              <div className="sidebar-col__inner">
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
                <ActiviteitenSidebar />
              </div>
            </div>
          </div>
        </div>

        {/* CTA tiles */}
        <section className="home-cta-section">
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
              <img src="/sponsors/logo-anura.webp" alt="Anura" />
            </a>
            <a href="#" className="sponsors-ticker-logo">
              <img src="/sponsors/Logo-Mind-Motion.webp" alt="Lifestylecenter Mind &amp; Motion" />
            </a>
            <a href="#" className="sponsors-ticker-logo">
              <img src="/sponsors/Logo_Klaverblad_FC_Hor.webp" alt="Klaverblad Verzekeringen" />
            </a>
            <a href="#" className="sponsors-ticker-logo">
              <img src="/sponsors/problicity_header-logo_geel.webp" alt="Problicity" />
            </a>
            <a href="#" className="sponsors-ticker-logo">
              <img src="/sponsors/riant-logo-removebg-preview.webp" alt="Riant Makelaars" />
            </a>
            <a href="#" className="sponsors-ticker-logo">
              <img
                src="/sponsors/logo-scholma-removebg-preview.webp"
                alt="Scholma Print &amp; Media"
              />
            </a>
          </div>
          <div className="sponsors-ticker-inner" aria-hidden="true">
            <a href="#" className="sponsors-ticker-logo">
              <img src="/sponsors/logo-anura.webp" alt="" />
            </a>
            <a href="#" className="sponsors-ticker-logo">
              <img src="/sponsors/Logo-Mind-Motion.webp" alt="" />
            </a>
            <a href="#" className="sponsors-ticker-logo">
              <img src="/sponsors/Logo_Klaverblad_FC_Hor.webp" alt="" />
            </a>
            <a href="#" className="sponsors-ticker-logo">
              <img src="/sponsors/problicity_header-logo_geel.webp" alt="" />
            </a>
            <a href="#" className="sponsors-ticker-logo">
              <img src="/sponsors/riant-logo-removebg-preview.webp" alt="" />
            </a>
            <a href="#" className="sponsors-ticker-logo">
              <img src="/sponsors/logo-scholma-removebg-preview.webp" alt="" />
            </a>
          </div>
        </div>
      </div>
    </>
  )
}
