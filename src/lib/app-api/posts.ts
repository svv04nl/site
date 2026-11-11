import { getPayload, type Where } from 'payload'
import config from '@payload-config'
import { POST_CATEGORIES } from '@/collections/post-categories'
import type { Post, Team } from '@/payload-types'
import { SITE_URL } from '@/lib/app-api/config'
import { shortTeamName } from '@/lib/app-api/format'
import { mediaUrl, toImage } from '@/lib/app-api/media'
import type { CategoryDto, PostSummaryDto, TeamRefDto } from '@/lib/app-api/types'

export const categories: CategoryDto[] = POST_CATEGORIES.map((c) => ({
  slug: c.value,
  title: c.label,
}))

export const toTeamRef = (team: Pick<Team, 'slug' | 'name'>): TeamRefDto => ({
  slug: team.slug,
  name: team.name,
  shortName: shortTeamName(team.name),
})

/** Whether a post is the one featured in the homepage hero right now. */
export const isActiveHero = (post: Post, now = new Date().toISOString()) =>
  Boolean(
    post.heroFeatured &&
    post.heroFrom &&
    post.heroUntil &&
    post.heroFrom <= now &&
    post.heroUntil >= now,
  )

/**
 * A post as a list item. `asHero` uses the wide hero image (and the phone crop as `mobileUrl`)
 * instead of the card image, for the featured post on Mijn SVV'04.
 */
export function toPostSummary(post: Post, { asHero = false } = {}): PostSummaryDto {
  const hero = asHero ? toImage(post.heroImage, 'hero') : undefined
  const image = hero ?? toImage(post.featuredImage, 'featuredPost')
  const mobileUrl = hero ? mediaUrl(post.heroImageMobile) : undefined

  const postCategories = (post.categories ?? []).flatMap((slug) => {
    const category = categories.find((c) => c.slug === slug)
    return category ? [category] : []
  })
  const teams = (post.relatedTeams ?? []).flatMap((t) =>
    typeof t === 'object' ? [toTeamRef(t)] : [],
  )

  return {
    slug: post.slug,
    title: post.title,
    ...(post.excerpt ? { excerpt: post.excerpt } : {}),
    publishedAt: post.publishedAt ?? post.createdAt,
    ...(image ? { image: { ...image, ...(mobileUrl ? { mobileUrl } : {}) } } : {}),
    ...(postCategories.length ? { categories: postCategories } : {}),
    ...(teams.length ? { teams } : {}),
    webUrl: `${SITE_URL}/nieuws/${post.slug}`,
  }
}

const published: Where = { status: { equals: 'published' } }

/**
 * News for visitors who follow teams: posts about those teams plus club news that is about no team.
 * Without teams everything is returned.
 */
export const postsForTeams = (teamIds: number[]): Where =>
  teamIds.length
    ? {
        and: [
          published,
          { or: [{ relatedTeams: { in: teamIds } }, { relatedTeams: { exists: false } }] },
        ],
      }
    : published

export async function findPosts(args: {
  where: Where
  limit: number
  depth?: number
}): Promise<Post[]> {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'posts',
    where: args.where,
    sort: ['-publishedAt', '-id'],
    limit: args.limit,
    depth: args.depth ?? 1,
  })
  return docs
}

export const publishedPostsWhere = published
