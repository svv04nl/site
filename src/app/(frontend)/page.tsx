import React from 'react'
import { preload } from 'react-dom'
import Link from 'next/link'
import { getPayload } from 'payload'
import config from '@payload-config'
import FixturesStrip from '@/components/FixturesStrip'
import type { Post } from '@/payload-types'
import { NewsRowCard } from '@/components/ui/NewsRowCard'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { ActiviteitenSidebar } from '@/components/ActiviteitenSidebar'
import { SponsorSidebar } from '@/components/SponsorSidebar'
import { SponsorsTicker } from '@/components/SponsorsTicker'
import { FindYourWaySection } from '@/components/FindYourWaySection'
import { WebshopBanner } from '@/components/WebshopBanner'

const FEATURED_TEAM_SLUGS = ['svv04-1', 'svv04-2', 'svv04-o21-1', 'svv04-o19-1']

export default async function HomePage() {
  preload('/images/hero-sportpark.webp', { as: 'image', fetchPriority: 'high' })

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
        {/* Hero — centered, with clear actions */}
        <section className="site-hero site-hero--centered">
          <div
            className="site-hero-image"
            aria-hidden="true"
            style={{ backgroundImage: 'url(/images/hero-sportpark.webp)' }}
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
                Een sterke, gezellige club voor jong en oud. Kom voetballen, supporteren of gewoon
                een balletje trappen op ons prachtige sportpark.
              </p>
              <div className="site-hero-actions">
                <Link className="btn btn--primary btn--lg" href="/vereniging/lidmaatschap">
                  Word lid van SVV&rsquo;04 &rarr;
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Fixtures strip — prominent dark band, max 3 upcoming matches */}
        <FixturesStrip
          teams={teams.map((team) => ({ teamcode: team.teamcode!, teamName: team.name }))}
          maxDays={31}
          limit={3}
        />

        <div className="page">
          {/* Latest news + sidebar (sponsors + agenda) */}
          <div className="section-with-sidebar">
            {/* Left: news */}
            <div className="sidebar-content-col sidebar-content-col--no-gap">
              <SectionHeader
                title="Laatste Nieuws"
                link={{ href: '/nieuws', label: 'Bekijk alle nieuws' }}
              />
              <div className="home-news-layout">
                {latestPosts.slice(0, 3).map((post) => (
                  <NewsRowCard key={post.id} post={post as Post} />
                ))}
              </div>
            </div>

            {/* Right: sidebar */}
            <div className="sidebar-col sidebar-col--plain">
              <div className="sidebar-col__inner">
                <WebshopBanner />
                <SponsorSidebar />
                <ActiviteitenSidebar />
              </div>
            </div>
          </div>
        </div>

        {/* Sponsor strip — color, data-driven */}
        <SponsorsTicker />

        {/* Vind jouw weg — audience cards */}
        <FindYourWaySection />
      </main>
    </>
  )
}
