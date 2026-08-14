import type { Endpoint, Where } from 'payload'
import { searchQueryVariants } from '@/lib/search-query'

const MIN_QUERY_LENGTH = 2
const RESULTS_PER_COLLECTION = 5
// Teams is a small, fixed collection (~25 docs) — fetch generously so the
// priority sort below always has the full candidate set to work with, then
// slice down to RESULTS_PER_COLLECTION.
const TEAM_FETCH_LIMIT = 100

// Matches `field` against any singular/plural variant of the query.
function matches(field: string, variants: string[]): Where {
  return { or: variants.map((v) => ({ [field]: { contains: v } })) }
}

// Colloquial team references that don't literally appear in any team's name
// or category — tied to this club's current team names.
const TEAM_QUERY_ALIASES: Record<string, string> = {
  '1e elftal': "SVV'04 1",
  'eerste elftal': "SVV'04 1",
  '1e team': "SVV'04 1",
  'eerste team': "SVV'04 1",
}

// A bare "team"/"teams" query is a request to browse teams, not a literal
// match — strip it out so the remaining tokens (if any) still narrow things
// down (e.g. "team zondag").
const TEAM_BROWSE_STOPWORDS = new Set(['team', 'teams'])

// `category` is a `select` field — Payload/Postgres doesn't support the
// `contains` operator on select fields (it 500s), only `equals`/`in`. The
// collection is tiny (~25 docs) either way, so team matching happens here in
// JS against the full fetched list rather than via the DB `where` clause.
function filterTeamsByQuery<T extends { name: string; category?: string | null }>(
  docs: T[],
  q: string,
): T[] {
  const alias = TEAM_QUERY_ALIASES[q.toLowerCase()]
  if (alias) return docs.filter((t) => t.name === alias)

  const tokens = q
    .toLowerCase()
    .split(/\s+/)
    .filter((t) => t && !TEAM_BROWSE_STOPWORDS.has(t))

  if (tokens.length === 0) return docs // browse-all

  // Every token must match somewhere — name (e.g. "35+1") or category (e.g.
  // "zondag") — so a query like "zondag 1" finds the team that is both.
  return docs.filter((team) => {
    const haystack = `${team.name} ${team.category ?? ''}`.toLowerCase()
    return tokens.every((token) =>
      searchQueryVariants(token).some((v) => haystack.includes(v)),
    )
  })
}

// Senior teams first (by team number), then youth teams from O21 down to
// O7 — the `order` field already encodes exactly this within each type.
function teamPriority(team: { type?: string | null; order?: number | null }): [number, number] {
  const typeRank = team.type === 'senior' ? 0 : team.type === 'youth' ? 1 : 2
  return [typeRank, team.order ?? Number.MAX_SAFE_INTEGER]
}

function sortTeamsByPriority<T extends { type?: string | null; order?: number | null }>(
  docs: T[],
): T[] {
  return [...docs].sort((a, b) => {
    const [aType, aOrder] = teamPriority(a)
    const [bType, bOrder] = teamPriority(b)
    return aType !== bType ? aType - bType : aOrder - bOrder
  })
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
        where: {
          and: [matches('title', variants), { section: { not_equals: 'meedoen' } }],
        },
        depth: 0,
        limit: RESULTS_PER_COLLECTION,
        select: { title: true, slug: true, section: true },
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
        items: pages.docs.map((page) => ({
          label: page.title,
          href: `/${page.section}/${page.slug}`,
        })),
      },
      {
        group: 'Voor jou',
        items: audiences.docs.map((audience) => ({
          label: audience.cardTitle || audience.name,
          sub: audience.cardDescription ?? undefined,
          href: `/voor-jou/${audience.slug}`,
        })),
      },
    ].filter((group) => group.items.length > 0)

    return Response.json({ groups })
  },
}
