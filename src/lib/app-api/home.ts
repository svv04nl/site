import { getPayload } from 'payload'
import config from '@payload-config'
import { EXAMPLES } from '@/lib/ai/examples'
import { loadActivities } from '@/lib/app-api/activities'
import {
  audienceContact,
  audienceLinks,
  audienceQuestions,
  loadAudiences,
} from '@/lib/app-api/audiences'
import { thisWeekend } from '@/lib/app-api/dates'
import { isRoleSlug } from '@/lib/app-api/config'
import { badRequest, listParam, today } from '@/lib/app-api/http'
import { loadMatchesInRange, nextMatchOf } from '@/lib/app-api/matches'
import { findPosts, isActiveHero, postsForTeams, publishedPostsWhere, toPostSummary } from '@/lib/app-api/posts'
import { headCoaches, loadTeamDocs, toTeam } from '@/lib/app-api/teams'
import { shortTeamName } from '@/lib/app-api/format'
import type { RoleSlug } from '@/lib/app-api/types'

const NEWS_LIMIT = 5
const LINKS_LIMIT = 3
const SUGGESTIONS = 2

/** The post for the hero while its period runs, else the newest post. */
async function featuredPost() {
  const payload = await getPayload({ config })
  const now = new Date().toISOString()
  const { docs } = await payload.find({
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
  })
  if (docs[0] && isActiveHero(docs[0], now)) return toPostSummary(docs[0], { asHero: true })

  const [latest] = await findPosts({ where: publishedPostsWhere, limit: 1 })
  return latest ? toPostSummary(latest) : null
}

export async function buildHome(request: Request) {
  const url = new URL(request.url)
  const day = today(url)

  const roleParam = url.searchParams.get('role')
  if (roleParam && !isRoleSlug(roleParam)) throw badRequest('Onbekende rol.')

  const [teamDocs, audiences] = await Promise.all([loadTeamDocs(), loadAudiences()])

  // Unknown slugs (a team that was removed) are skipped; the rest keeps the order of the request.
  const favorites = listParam(url, 'teams').flatMap((slug) => teamDocs.find((t) => t.slug === slug) ?? [])
  const favoriteSlugs = new Set(favorites.map((t) => t.slug))
  const favoriteIds = favorites.map((t) => t.id)

  const weekend = thisWeekend(day)
  const [dayMatches, weekendMatches, featured, newsDocs, activities, coaches, nextMatches] = await Promise.all([
    favorites.length ? loadMatchesInRange({ from: day, to: day }) : [],
    loadMatchesInRange(weekend),
    featuredPost(),
    findPosts({ where: postsForTeams(favoriteIds), limit: NEWS_LIMIT }),
    loadActivities(),
    headCoaches(favoriteIds),
    Promise.all(favorites.map((t) => nextMatchOf(t.slug))),
  ])

  const audience =
    audiences.find((a) => a.slug === roleParam) ??
    (roleParam ? undefined : audiences.find((a) => isRoleSlug(a.slug)))
  const role = (roleParam ?? audience?.slug ?? 'spelers') as RoleSlug

  // Two example questions: one about the first followed team, the rest from the role's own FAQ.
  const first = favorites[0]
  const firstTeam = first && (shortTeamName(first.name) === first.name ? first.name : `de ${shortTeamName(first.name)}`)
  const askSuggestions = [
    ...(firstTeam ? [`Wie is de trainer van ${firstTeam}?`] : []),
    ...(audience ? audienceQuestions(audience) : []),
    ...EXAMPLES,
  ].slice(0, SUGGESTIONS)

  const played = weekendMatches.filter((m) => m.status !== 'cancelled')
  const contact = audience && audienceContact(audience)

  return {
    askSuggestions,
    today: dayMatches.filter((m) => favoriteSlugs.has(m.ownTeamSlug)),
    weekend: {
      matchCount: played.length,
      homeMatchCount: played.filter((m) => m.isHomeGame).length,
    },
    featuredPost: featured,
    myTeams: favorites.map((team, i) => {
      const coach = coaches.get(team.id)
      return {
        team: toTeam(team),
        nextMatch: nextMatches[i],
        ...(coach ? { headCoach: coach } : {}),
      }
    }),
    forYou: {
      role,
      links: audience ? audienceLinks(audience).slice(0, LINKS_LIMIT) : [],
      ...(contact ? { contact } : {}),
    },
    news: newsDocs.map((post) => toPostSummary(post)),
    nextActivity: activities.find((a) => a.date >= day) ?? null,
  }
}
