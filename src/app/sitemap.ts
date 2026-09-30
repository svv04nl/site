import type { MetadataRoute } from 'next'
import { getPayload } from 'payload'
import config from '@payload-config'

const BASE = 'https://svv04.nl'

// Render on request, not at build time: the sitemap queries CMS content, so it
// must stay in sync with the database without a redeploy and must not make the
// build depend on database contents.
export const dynamic = 'force-dynamic'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const payload = await getPayload({ config })

  // ── Static routes ──────────────────────────────────────────────────────────
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE, priority: 1, changeFrequency: 'daily' },
    { url: `${BASE}/nieuws`, changeFrequency: 'daily' },
    { url: `${BASE}/teams`, changeFrequency: 'weekly' },
    { url: `${BASE}/programma`, changeFrequency: 'daily' },
    { url: `${BASE}/agenda`, changeFrequency: 'weekly' },
    { url: `${BASE}/contact`, changeFrequency: 'monthly' },
    { url: `${BASE}/privacy`, changeFrequency: 'yearly' },
    { url: `${BASE}/cookies`, changeFrequency: 'yearly' },
  ]

  // ── News articles (published only) ────────────────────────────────────────
  const { docs: posts } = await payload.find({
    collection: 'posts',
    where: { status: { equals: 'published' } },
    limit: 0,
    depth: 0,
    select: { slug: true, publishedAt: true },
  })

  const postRoutes: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${BASE}/nieuws/${post.slug}`,
    lastModified: post.publishedAt ? new Date(post.publishedAt) : undefined,
    changeFrequency: 'monthly',
  }))

  // ── Teams ─────────────────────────────────────────────────────────────────
  const { docs: teams } = await payload.find({
    collection: 'teams',
    limit: 0,
    depth: 0,
    select: { slug: true },
  })

  const teamRoutes: MetadataRoute.Sitemap = teams.map((team) => ({
    url: `${BASE}/teams/${team.slug}`,
    changeFrequency: 'weekly',
  }))

  // ── CMS pages (vereniging / commissies / meedoen) ─────────────────────────
  const { docs: pages } = await payload.find({
    collection: 'pages',
    limit: 0,
    depth: 0,
    select: { slug: true, section: true },
  })

  const pageRoutes: MetadataRoute.Sitemap = pages.map((page) => ({
    url: `${BASE}/${page.section}/${page.slug}`,
    changeFrequency: 'monthly',
  }))

  // ── Audience landing pages ─────────────────────────────────────────────────
  const { docs: audiences } = await payload.find({
    collection: 'audiences',
    limit: 0,
    depth: 0,
    select: { slug: true },
  })

  const audienceRoutes: MetadataRoute.Sitemap = audiences.map((audience) => ({
    url: `${BASE}/${audience.slug}`,
    changeFrequency: 'monthly',
    priority: 0.8,
  }))

  return [...staticRoutes, ...postRoutes, ...teamRoutes, ...pageRoutes, ...audienceRoutes]
}
