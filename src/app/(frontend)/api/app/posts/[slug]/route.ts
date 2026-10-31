import { getPayload } from 'payload'
import config from '@payload-config'
import { appRouteWithParams, notFound, slugParam, TTL } from '@/lib/app-api/http'
import { findPosts, publishedPostsWhere, toPostSummary } from '@/lib/app-api/posts'
import { lexicalToBlocks } from '@/lib/app-api/richtext'
import { SITE_URL } from '@/lib/app-api/config'

export const dynamic = 'force-dynamic'

const RELATED = 3

export const GET = appRouteWithParams<{ slug: string }>(TTL.news, async (_request, { slug }) => {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'posts',
    where: { and: [publishedPostsWhere, { slug: { equals: slugParam(slug, 'Dit bericht') } }] },
    // Depth 2: images and links in the text, and the photo of a contact block.
    depth: 2,
    limit: 1,
  })
  const post = docs[0]
  if (!post) throw notFound('Dit bericht')

  // "Meer nieuws": posts about the same teams or in the same categories first, then the newest.
  const teamIds = new Set((post.relatedTeams ?? []).map((t) => (typeof t === 'object' ? t.id : t)))
  const categorySet = new Set(post.categories ?? [])
  const score = (other: typeof post) =>
    (other.relatedTeams ?? []).filter((t) => teamIds.has(typeof t === 'object' ? t.id : t)).length * 2 +
    (other.categories ?? []).filter((c) => categorySet.has(c)).length

  const others = await findPosts({
    where: { and: [publishedPostsWhere, { id: { not_equals: post.id } }] },
    limit: 12,
  })
  const related = [...others].sort((a, b) => score(b) - score(a)).slice(0, RELATED)

  return {
    ...toPostSummary(post),
    content: lexicalToBlocks(post.content, { webUrl: `${SITE_URL}/nieuws/${post.slug}` }),
    related: related.map((other) => toPostSummary(other)),
  }
})
