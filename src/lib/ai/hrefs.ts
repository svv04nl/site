type PageLike = {
  slug?: string | null
  section?: string | null
  parent?: unknown
}

/**
 * Site path of a page, e.g. /vereniging/lidmaatschap/taken. Only as deep as the
 * `parent` chain was populated by the query (use depth >= 2 for nested pages).
 */
export function pageHref(page: PageLike): string {
  const slugs = [page.slug ?? '']
  let parent = page.parent as PageLike | null | undefined
  while (parent && typeof parent === 'object' && parent.slug) {
    slugs.unshift(parent.slug)
    parent = parent.parent as PageLike | null | undefined
  }
  return `/${page.section}/${slugs.join('/')}`
}

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
