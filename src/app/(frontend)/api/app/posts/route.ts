import type { Where } from 'payload'
import { appRoute, badRequest, intParam, listParam, TTL } from '@/lib/app-api/http'
import { categories, findPosts, postsForTeams, toPostSummary } from '@/lib/app-api/posts'
import { loadTeamDocs } from '@/lib/app-api/teams'

export const dynamic = 'force-dynamic'

// The cursor is the sort position of the last post (publishedAt, id), so a post published
// while someone scrolls does not shift the next page.
const encodeCursor = (publishedAt: string, id: number) =>
  Buffer.from(JSON.stringify([publishedAt, id])).toString('base64url')

function decodeCursor(cursor: string): { publishedAt: string; id: number } {
  try {
    const [publishedAt, id] = JSON.parse(Buffer.from(cursor, 'base64url').toString())
    if (typeof publishedAt === 'string' && typeof id === 'number') return { publishedAt, id }
  } catch {
    // falls through to the error below
  }
  throw badRequest('Ongeldige cursor.')
}

export const GET = appRoute(TTL.news, async (request) => {
  const url = new URL(request.url)
  const limit = intParam(url, 'limit', 20, 1, 50)

  const category = url.searchParams.get('category')
  if (category && !categories.some((c) => c.slug === category)) throw badRequest('Onbekende categorie.')

  const teamSlugs = listParam(url, 'teams')
  const teamIds = teamSlugs.length
    ? (await loadTeamDocs()).filter((t) => teamSlugs.includes(t.slug)).map((t) => t.id)
    : []

  const cursor = url.searchParams.get('cursor')
  const after = cursor ? decodeCursor(cursor) : undefined

  const and: Where[] = [postsForTeams(teamIds)]
  if (category) and.push({ categories: { equals: category } })
  if (after) {
    and.push({
      or: [
        { publishedAt: { less_than: after.publishedAt } },
        { and: [{ publishedAt: { equals: after.publishedAt } }, { id: { less_than: after.id } }] },
      ],
    })
  }

  // One extra post tells whether there is a next page.
  const posts = await findPosts({ where: { and }, limit: limit + 1 })
  const page = posts.slice(0, limit)
  const last = page.at(-1)

  return {
    items: page.map((post) => toPostSummary(post)),
    nextCursor: posts.length > limit && last?.publishedAt ? encodeCursor(last.publishedAt, last.id) : null,
  }
})
