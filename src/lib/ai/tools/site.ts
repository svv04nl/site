import { tool } from 'ai'
import { z } from 'zod'
import { getPayload } from 'payload'
import config from '@payload-config'
import type { Where } from 'payload'
import { searchQueryVariants } from '@/lib/search-query'
import { snippetAround } from '@/lib/search-text'
import { audienceHref, pageHref, postHref, teamHref } from '@/lib/ai/hrefs'
import { docToPlainText, richTextToPlainText, truncate } from '@/lib/ai/plain-text'
import { cached } from '@/lib/ai/cache'
import { stripUi } from '@/lib/ai/tools/ui'
import { filterTeamsByQuery, sortTeamsByPriority } from '@/lib/team-search'
import { ACCOMMODATIE, BANKRELATIE } from '@/lib/club-info'

const INDEX_TTL = 5 * 60 * 1000
const MAX_RESULTS = 8

// Everything below is public site content. The Local API runs without a user,
// so every query filters explicitly on what an anonymous visitor may see
// (e.g. only published posts) instead of relying on collection access rules.

type IndexedDoc = {
  type: 'pagina' | 'doelgroep'
  title: string
  url: string
  text: string
}

/** All pages and audience pages as plain text. Small collections (~30 docs), so searched in JS. */
export function loadContentIndex(): Promise<IndexedDoc[]> {
  return cached('content-index', INDEX_TTL, async () => {
    const payload = await getPayload({ config })
    const [pages, audiences] = await Promise.all([
      payload.find({ collection: 'pages', limit: 200, depth: 2, pagination: false }),
      payload.find({ collection: 'audiences', limit: 50, depth: 1, pagination: false }),
    ])
    return [
      ...pages.docs.map((page) => ({
        type: 'pagina' as const,
        title: page.title,
        url: pageHref(page),
        text: richTextToPlainText(page.content),
      })),
      ...audiences.docs.map((audience) => ({
        type: 'doelgroep' as const,
        title: audience.cardTitle || audience.name,
        url: audienceHref(audience),
        text: docToPlainText(audience as unknown as Record<string, unknown>, [
          'name',
          'cardTitle',
          'cardDescription',
          'metaTitle',
          'metaDescription',
          'heroImage',
          'cta',
        ]),
      })),
    ]
  })
}

/** Compact list of pages for the system prompt, so the model knows what exists. */
export async function siteMapForPrompt(): Promise<string> {
  const index = await loadContentIndex()
  return index.map((doc) => `- ${doc.title}: ${doc.url}`).join('\n')
}

const matches = (field: string, variants: string[]): Where => ({
  or: variants.map((v) => ({ [field]: { contains: v } })),
})

export const searchSite = tool({
  description:
    'Search the SVV\'04 website (pages, news articles, "voor jou" audience pages) by keyword. ' +
    'Returns titles, URLs and a snippet. Use getPage afterwards to read the full text of a hit.',
  inputSchema: z.object({
    query: z
      .string()
      .min(2)
      .max(100)
      .describe('Dutch keyword(s), e.g. "contributie" or "vrijwilliger"'),
  }),
  execute: async ({ query }) => {
    const variants = searchQueryVariants(query)
    const index = await loadContentIndex()

    type Hit = { type: string; title: string; url: string; snippet?: string }
    const titleHits: Hit[] = []
    const bodyHits: (Hit & { count: number })[] = []
    for (const doc of index) {
      if (variants.some((v) => doc.title.toLowerCase().includes(v))) {
        titleHits.push({ type: doc.type, title: doc.title, url: doc.url })
        continue
      }
      const snippet = snippetAround(doc.text, variants)
      if (snippet) {
        const lower = doc.text.toLowerCase()
        const count = variants.reduce((n, v) => n + lower.split(v).length - 1, 0)
        bodyHits.push({ type: doc.type, title: doc.title, url: doc.url, snippet, count })
      }
    }
    bodyHits.sort((a, b) => b.count - a.count)

    const payload = await getPayload({ config })
    const posts = await payload.find({
      collection: 'posts',
      where: {
        and: [
          { status: { equals: 'published' } },
          { or: [matches('title', variants), matches('excerpt', variants)] },
        ],
      },
      sort: '-publishedAt',
      depth: 0,
      limit: 5,
      select: { title: true, slug: true, excerpt: true, publishedAt: true },
    })

    const results = [
      ...titleHits,
      ...bodyHits.map(({ count: _count, ...hit }) => hit),
      ...posts.docs.map((post) => ({
        type: 'nieuws',
        title: post.title,
        url: postHref(post),
        snippet: post.excerpt ?? '',
        date: post.publishedAt?.slice(0, 10) ?? '',
      })),
    ].slice(0, MAX_RESULTS)

    return results.length ? { results } : { results: [], note: 'Geen resultaten op de website.' }
  },
})

export const getPage = tool({
  description:
    'Read the full text of one page of the website by its URL path (from searchSite or the site map), ' +
    'e.g. "/vereniging/lidmaatschap", "/nieuws/some-article", "/teams/svv04-1" or "/jeugd".',
  inputSchema: z.object({
    path: z.string().min(1).max(200).describe('URL path starting with "/"'),
  }),
  execute: async ({ path }) => {
    const clean =
      '/' +
      path
        .replace(/^https?:\/\/[^/]+/, '')
        .replace(/^\/+|\/+$/g, '')
        .split(/[?#]/)[0]
    const payload = await getPayload({ config })

    if (clean.startsWith('/nieuws/')) {
      const { docs } = await payload.find({
        collection: 'posts',
        where: {
          and: [
            { slug: { equals: clean.slice('/nieuws/'.length) } },
            { status: { equals: 'published' } },
          ],
        },
        depth: 1,
        limit: 1,
      })
      const post = docs[0]
      if (!post) {
        return { error: 'Pagina niet gevonden.' }
      }
      return {
        title: post.title,
        url: clean,
        date: post.publishedAt?.slice(0, 10),
        ...truncate(richTextToPlainText(post.content)),
        ui: {
          links: [
            {
              title: post.title,
              url: clean,
              kind: 'article' as const,
              date: post.publishedAt?.slice(0, 10),
            },
          ],
        },
      }
    }

    if (clean.startsWith('/teams/')) {
      const { docs } = await payload.find({
        collection: 'teams',
        where: { slug: { equals: clean.slice('/teams/'.length) } },
        depth: 0,
        limit: 1,
      })
      const team = docs[0]
      if (!team) {
        return { error: 'Pagina niet gevonden.' }
      }
      return {
        title: team.name,
        url: clean,
        category: team.category,
        ...truncate(richTextToPlainText(team.description)),
        ui: { links: [{ title: team.name, url: clean, kind: 'page' as const }] },
      }
    }

    const doc = (await loadContentIndex()).find((d) => d.url === clean)
    if (!doc) {
      return { error: 'Pagina niet gevonden. Gebruik searchSite om de juiste URL te vinden.' }
    }
    return {
      title: doc.title,
      url: doc.url,
      ...truncate(doc.text),
      ui: { links: [{ title: doc.title, url: doc.url, kind: 'page' as const }] },
    }
  },
  toModelOutput: stripUi,
})

export const getLatestNews = tool({
  description:
    'Get the most recent published news articles of the club (title, date, excerpt, URL).',
  inputSchema: z.object({
    limit: z.number().int().min(1).max(10).default(5),
  }),
  execute: async ({ limit }) => {
    const payload = await getPayload({ config })
    const { docs } = await payload.find({
      collection: 'posts',
      where: { status: { equals: 'published' } },
      sort: '-publishedAt',
      depth: 0,
      limit,
      select: { title: true, slug: true, excerpt: true, publishedAt: true },
    })
    return {
      posts: docs.map((post) => ({
        title: post.title,
        url: postHref(post),
        date: post.publishedAt?.slice(0, 10),
        excerpt: post.excerpt ?? '',
      })),
      ui: {
        links: docs.slice(0, 3).map((post) => ({
          title: post.title,
          url: postHref(post),
          kind: 'article' as const,
          date: post.publishedAt?.slice(0, 10),
        })),
      },
    }
  },
  toModelOutput: stripUi,
})

export const getContacts = tool({
  description:
    'Find the club contact person for a topic or function (e.g. "jeugd", "ledenadministratie", "penningmeester"). ' +
    'Returns name, functions, public e-mail/phone as shown on the contact page, and a link to the pre-filled contact form.',
  inputSchema: z.object({
    query: z
      .string()
      .max(100)
      .optional()
      .describe('Topic, function or name. Empty lists everyone.'),
  }),
  execute: async ({ query }) => {
    const payload = await getPayload({ config })
    const { docs } = await payload.find({
      collection: 'contacts',
      sort: 'order',
      depth: 0,
      limit: 100,
      pagination: false,
    })

    const variants = query ? searchQueryVariants(query) : []
    const matched = docs
      .filter((c) => {
        if (!variants.length) {
          return true
        }
        const haystack = [c.name, c.group, ...(c.roles ?? []).flatMap((r) => [r.title, r.topic])]
          .join(' ')
          .toLowerCase()
        return variants.some((v) => haystack.includes(v))
      })
      .slice(0, MAX_RESULTS)

    if (!matched.length) {
      return { contacts: [], note: 'Geen contactpersoon gevonden.' }
    }

    return {
      contacts: matched.map((c) => ({
        name: c.name,
        functions: (c.roles ?? []).map((r) => ({
          title: r.title,
          topic: r.topic ?? undefined,
          contactFormUrl: `/contact?afdeling=${encodeURIComponent(r.slug || r.title)}`,
        })),
        email: c.email ?? undefined,
        phone: c.phone ?? undefined,
      })),
      ui: {
        contacts: matched.slice(0, 3).map((c) => ({
          name: c.name,
          roles: (c.roles ?? []).map((r) => ({ title: r.title, slug: r.slug || undefined })),
          email: c.email ?? undefined,
          phone: c.phone ?? undefined,
        })),
      },
    }
  },
  toModelOutput: stripUi,
})

export type TeamSummary = {
  id: number
  name: string
  slug: string
  teamcode: number | null
  category: string | null
  type: string | null
  order: number | null
}

export function loadTeams(): Promise<TeamSummary[]> {
  return cached('teams', INDEX_TTL, async () => {
    const payload = await getPayload({ config })
    const { docs } = await payload.find({
      collection: 'teams',
      limit: 200,
      depth: 0,
      pagination: false,
      select: { name: true, slug: true, teamcode: true, category: true, type: true, order: true },
    })
    return docs.map((t) => ({
      id: t.id,
      name: t.name,
      slug: t.slug,
      teamcode: t.teamcode ?? null,
      category: t.category ?? null,
      type: t.type ?? null,
      order: t.order ?? null,
    }))
  })
}

/** Teams matching a free-text query, best match first. Exact name wins. */
export async function findTeams(query: string): Promise<TeamSummary[]> {
  const teams = await loadTeams()
  const exact = teams.filter((t) => t.name.toLowerCase() === query.trim().toLowerCase())
  if (exact.length === 1) {
    return exact
  }
  return sortTeamsByPriority(filterTeamsByQuery(teams, query))
}

export const listTeams = tool({
  description:
    'Find SVV\'04 teams (senior and youth) by name or category, e.g. "O11", "zondag", "vrouwen", "1e elftal". ' +
    'Empty query lists all teams.',
  inputSchema: z.object({
    query: z.string().max(100).default(''),
  }),
  execute: async ({ query }) => {
    const teams = query.trim() ? await findTeams(query) : sortTeamsByPriority(await loadTeams())
    return {
      teams: teams.slice(0, 30).map((t) => ({
        name: t.name,
        category: t.category,
        url: teamHref(t),
      })),
    }
  },
})

export const getClubInfo = tool({
  description:
    'Fixed club details: address of the sports park / clubhouse, main phone number and bank account (IBAN), as shown on the contact page.',
  inputSchema: z.object({}),
  execute: async () => ({
    accommodation: ACCOMMODATIE.items.map((item) => item.value),
    bank: BANKRELATIE.items.map((item) => item.value),
    contactPageUrl: '/contact',
  }),
})
