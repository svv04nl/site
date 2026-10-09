import React from 'react'
import { preload } from 'react-dom'
import Link from 'next/link'
import { getPayload } from 'payload'
import config from '@payload-config'
import FixturesStrip from '@/components/FixturesStrip'
import type { Post } from '@/payload-types'
import { NewsRowCard } from '@/components/ui/NewsRowCard'
import { ActiviteitenSidebar } from '@/components/ActiviteitenSidebar'
import { SponsorSidebar } from '@/components/SponsorSidebar'
import { SponsorsTicker } from '@/components/SponsorsTicker'
import { FindYourWaySection } from '@/components/FindYourWaySection'
import { WebshopBanner } from '@/components/WebshopBanner'
import { HeroVideo } from '@/components/HeroVideo'
import { FeaturedPostHero } from '@/components/FeaturedPostHero'

const FEATURED_TEAM_SLUGS = ['svv04-1', 'svv04-2', 'svv04-o21-1', 'svv04-o19-1']

export default async function HomePage() {
  const payload = await getPayload({ config })
  const now = new Date().toISOString()

  const [{ docs: featuredTeams }, { docs: latestPosts }, { docs: heroPosts }] = await Promise.all([
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
    // At most one post is featured in the hero, and only within its date range.
    payload.find({
      collection: 'posts',
      where: {
        and: [
          { status: { equals: 'published' } },
          { heroFeatured: { equals: true } },
          { heroFrom: { less_than_equal: now } },
          { heroUntil: { greater_than_equal: now } },
        ],
      },
      sort: '-heroFrom',
      limit: 1,
      depth: 1,
    }),
  ])

  const heroPost = heroPosts[0]
  const newsPosts = latestPosts.filter((post) => post.id !== heroPost?.id).slice(0, 3)
  if (!heroPost) preload('/images/hero-sportpark.webp', { as: 'image', fetchPriority: 'high' })

  // Preserve the intended display order
  const teams = FEATURED_TEAM_SLUGS.map((slug) =>
    featuredTeams.find((t) => t.slug === slug),
  ).filter((t): t is NonNullable<typeof t> => !!t && !!t.teamcode)

  return (
    <>
      <main>
        {/* Hero — a featured news post while its date range is active, otherwise the welcome hero */}
        {heroPost ? (
          <FeaturedPostHero post={heroPost} />
        ) : (
          <section className="site-hero site-hero--centered">
            <div
              className="site-hero-image"
              aria-hidden="true"
              style={{ backgroundImage: 'url(/images/hero-sportpark.webp)' }}
            >
              <HeroVideo src="/videos/hero-sportpark.mp4" poster="/images/hero-sportpark.webp" />
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
        )}

        {/* Fixtures strip — prominent dark band, max 3 upcoming matches */}
        <FixturesStrip
          teams={teams.map((team) => ({ teamcode: team.teamcode!, teamName: team.name }))}
          maxDays={31}
          limit={3}
        />

        <div className="home-main">
          {/* Latest news; the post shown in the hero is skipped here */}
          <div className="home-main-news">
            <div className="home-news-head">
              <div>
                <p className="home-eyebrow">Nieuws</p>
                <h2 className="home-h2">
                  Laatste <span>nieuws</span>
                </h2>
              </div>
              <Link href="/nieuws" className="home-text-link">
                Bekijk alle nieuws &rarr;
              </Link>
            </div>
            <div className="home-news-list">
              {newsPosts.map((post) => (
                <NewsRowCard key={post.id} post={post as Post} />
              ))}
            </div>
          </div>

          {/* Sidebar: webshop, main sponsors, agenda */}
          <div className="home-main-side">
            <WebshopBanner />
            <SponsorSidebar />
            <ActiviteitenSidebar />
          </div>
        </div>

        {/* Vind jouw weg — audience cards */}
        <FindYourWaySection />

        {/* Sponsor strip — color, data-driven */}
        <SponsorsTicker />
      </main>
    </>
  )
}
