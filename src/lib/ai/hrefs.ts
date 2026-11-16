import { pageHref, type PageLike } from '@/lib/pages'

export { pageHref }

export const postHref = (post: { slug?: string | null }) => `/nieuws/${post.slug}`
export const teamHref = (team: { slug?: string | null }) => `/teams/${team.slug}`
export const audienceHref = (audience: { slug?: string | null }) => `/${audience.slug}`

/** Href for a populated Payload relationship (used for internal richText links). */
export function docHref(relationTo: string, doc: unknown): string | undefined {
  if (!doc || typeof doc !== 'object') {
    return undefined
  }
  switch (relationTo) {
    case 'pages':
      return pageHref(doc as PageLike)
    case 'posts':
      return postHref(doc as { slug?: string | null })
    case 'teams':
      return teamHref(doc as { slug?: string | null })
    default:
      return undefined
  }
}
