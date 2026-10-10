import type { Endpoint, Where } from 'payload'
import { searchQueryVariants } from '@/lib/search-query'
import { filterTeamsByQuery, sortTeamsByPriority } from '@/lib/team-search'
import { extractText, snippetAround } from '@/lib/search-text'

const MIN_QUERY_LENGTH = 2
const RESULTS_PER_COLLECTION = 5
// Teams is a small, fixed collection (~25 docs) — fetch generously so the
// priority sort below always has the full candidate set to work with, then
// slice down to RESULTS_PER_COLLECTION.
const TEAM_FETCH_LIMIT = 100
const PAGE_FETCH_LIMIT = 200

// Matches `field` against any singular/plural variant of the query.
function matches(field: string, variants: string[]): Where {
  return { or: variants.map((v) => ({ [field]: { contains: v } })) }
}

type PageDoc = {
  title: string
  slug?: string | null
  section?: string | null
  parent?: unknown
  content?: unknown
}

// Title matches first, then pages that only mention the query in their body.
function matchPages(docs: PageDoc[], variants: string[]): SearchResultItem[] {
  const titleHits: SearchResultItem[] = []
  const bodyHits: (SearchResultItem & { count: number })[] = []

  for (const page of docs) {
    const slugs = [page.slug]
    let parent = page.parent as { slug?: string; parent?: unknown } | null | undefined
    while (parent && typeof parent === 'object' && parent.slug) {
      slugs.unshift(parent.slug)
      parent = parent.parent as typeof parent
    }
    const href = `/${page.section}/${slugs.join('/')}`

    if (variants.some((v) => page.title.toLowerCase().includes(v))) {
      titleHits.push({ label: page.title, href })
      continue
    }
    const body = extractText(page.content).join(' ')
    const sub = snippetAround(body, variants)
    if (sub) {
      const lower = body.toLowerCase()
      const count = variants.reduce((n, v) => n + lower.split(v).length - 1, 0)
      bodyHits.push({ label: page.title, sub, href, count })
    }
  }

  // Most mentions first: a page about the topic beats one that mentions it in passing.
  bodyHits.sort((a, b) => b.count - a.count)
  return [...titleHits, ...bodyHits.map(({ count: _count, ...item }) => item)]
}

type SearchResultItem = {
  label: string
  sub?: string
  href: string
}

type SearchResultGroup = {
  group: string
  items: SearchResultItem[]
}

export const searchEndpoint: Endpoint = {
  path: '/search',
  method: 'get',
  handler: async (req) => {
    const q = new URL(req.url ?? '', 'http://localhost').searchParams.get('q')?.trim() ?? ''

    if (q.length < MIN_QUERY_LENGTH) {
      return Response.json({ groups: [] })
    }

    const { payload } = req
    const variants = searchQueryVariants(q)

    const [posts, teams, pages, audiences] = await Promise.all([
      payload.find({
        collection: 'posts',
        where: {
          and: [
            { status: { equals: 'published' } },
            { or: [matches('title', variants), matches('excerpt', variants)] },
          ],
        },
        depth: 0,
        limit: RESULTS_PER_COLLECTION,
        select: { title: true, slug: true, excerpt: true },
      }),
      payload.find({
        collection: 'teams',
        depth: 0,
        limit: TEAM_FETCH_LIMIT,
        select: { name: true, slug: true, category: true, type: true, order: true },
      }),
      payload.find({
        collection: 'pages',
        // 'meedoen' pages are already covered by the static "Meedoen" quick-link
        // group in the search modal — exclude them here to avoid duplicates.
        // Small collection (~20 docs): fetch all and match title + body in JS.
        where: { section: { not_equals: 'meedoen' } },
        depth: 1, // populates `parent` for nested URLs
        limit: PAGE_FETCH_LIMIT,
        select: { title: true, slug: true, section: true, parent: true, content: true },
      }),
      payload.find({
        collection: 'audiences',
        where: { or: [matches('name', variants), matches('cardTitle', variants)] },
        depth: 0,
        limit: RESULTS_PER_COLLECTION,
        select: { name: true, slug: true, cardTitle: true, cardDescription: true },
      }),
    ])

    const groups: SearchResultGroup[] = [
      {
        group: 'Nieuws',
        items: posts.docs.map((post) => ({
          label: post.title,
          sub: post.excerpt ?? undefined,
          href: `/nieuws/${post.slug}`,
        })),
      },
      {
        group: 'Teams',
        items: sortTeamsByPriority(filterTeamsByQuery(teams.docs, q))
          .slice(0, RESULTS_PER_COLLECTION)
          .map((team) => ({
            label: team.name,
            sub: team.category ?? undefined,
            href: `/teams/${team.slug}`,
          })),
      },
      {
        group: "Pagina's",
        items: matchPages(pages.docs, variants).slice(0, RESULTS_PER_COLLECTION),
      },
      {
        group: 'Voor jou',
        items: audiences.docs.map((audience) => ({
          label: audience.cardTitle || audience.name,
          sub: audience.cardDescription ?? undefined,
          href: `/${audience.slug}`,
        })),
      },
    ].filter((group) => group.items.length > 0)

    return Response.json({ groups })
  },
}
