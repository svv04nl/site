import type { MetadataRoute } from 'next'
import { getPayload } from 'payload'
import config from '@payload-config'

const BASE = 'https://svv04.nl'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const payload = await getPayload({ config })

  // ── Static routes ──────────────────────────────────────────────────────────
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE, priority: 1, changeFrequency: 'daily' },
    { url: `${BASE}/nieuws`, changeFrequency: 'daily' },
    { url: `${BASE}/senioren`, changeFrequency: 'weekly' },
    { url: `${BASE}/jeugd`, changeFrequency: 'weekly' },
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

  return [...staticRoutes, ...postRoutes, ...teamRoutes, ...pageRoutes]
}
