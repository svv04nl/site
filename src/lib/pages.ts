import type { Payload } from 'payload'
import type { Page } from '@/payload-types'

const MAX_DEPTH = 5

/** Sections whose pages live under their own path: /vereniging/..., /commissies/..., /meedoen/... */
export const SECTION_PATHS = ['vereniging', 'commissies', 'meedoen'] as const

/**
 * A page as far as its address goes. `parent` and `audience` can be ids or populated docs;
 * only populated ones are followed.
 */
export type PageLike = {
  slug?: string | null
  section?: string | null
  parent?: unknown
  audience?: unknown
}

const slugOf = (ref: unknown): string | undefined =>
  ref && typeof ref === 'object' && 'slug' in ref && typeof ref.slug === 'string'
    ? ref.slug
    : undefined

/**
 * Where a page's path starts: /vereniging for a Vereniging page, /ouders for a page of the
 * "ouders" audience, /info for a page shared by several audiences.
 */
export function pagePrefix(page: PageLike): string {
  if (page.section === 'info') {
    return '/info'
  }
  if (page.section === 'doelgroep') {
    // Unpopulated audience: /vereniging/<slug> finds the page and redirects to its real address.
    const audience = slugOf(page.audience)
    return audience ? `/${audience}` : '/vereniging'
  }
  return `/${page.section ?? 'vereniging'}`
}

/**
 * Site path of a page, e.g. /vereniging/vrijwilligerswerk/taken or /ouders/jongste-jeugd.
 * Only as deep as `parent` and `audience` were populated (use depth >= 2 for nested pages).
 */
export function pageHref(page: PageLike): string {
  const slugs = [page.slug ?? '']
  let parent = page.parent
  while (slugOf(parent)) {
    slugs.unshift(slugOf(parent)!)
    parent = (parent as PageLike).parent
  }
  return `${pagePrefix(page)}/${slugs.join('/')}`
}

/**
 * Paths of every page in a flat list (as a depth 0 query returns them), without extra queries:
 * parents and audiences are looked up in the lists themselves.
 */
export function pageHrefs<T extends PageLike & { id: number | string }>(
  pages: T[],
  audiences: { id: number | string; slug?: string | null }[],
): Map<T['id'], string> {
  const byId = new Map(pages.map((p) => [String(p.id), p]))
  const audienceById = new Map(audiences.map((a) => [String(a.id), a]))
  const idOf = (ref: unknown) =>
    ref && typeof ref === 'object' && 'id' in ref ? String(ref.id) : ref ? String(ref) : undefined

  const populate = (page: PageLike, depth = 0): PageLike => {
    const parentId = idOf(page.parent)
    const parent = parentId ? byId.get(parentId) : undefined
    const audienceId = idOf(page.audience)
    return {
      ...page,
      parent: parent && depth < MAX_DEPTH ? populate(parent, depth + 1) : undefined,
      audience: audienceId ? audienceById.get(audienceId) : undefined,
    }
  }

  return new Map(pages.map((p) => [p.id, pageHref(populate(p))]))
}

/**
 * Walks a page's `parent` chain and returns the full slug path, e.g.
 * ['vrijwilligerswerk', 'taken'] for a page nested one level deep.
 */
export async function resolvePageSlugPath(payload: Payload, page: Page): Promise<string[]> {
  const slugs: string[] = [page.slug ?? '']
  let parentRef = page.parent
  let depth = 0

  while (parentRef && depth < MAX_DEPTH) {
    const parentId = typeof parentRef === 'object' ? parentRef.id : parentRef
    const parent: Page | null = await payload
      .findByID({ collection: 'pages', id: parentId, depth: 0 })
      .catch(() => null)
    if (!parent) {
      break
    }
    slugs.unshift(parent.slug ?? '')
    parentRef = parent.parent
    depth++
  }

  return slugs
}

/** The full site path of a page, fetching its parents and audience where they are not populated. */
export async function resolvePagePath(payload: Payload, page: Page): Promise<string> {
  let audience = page.audience
  if (page.section === 'doelgroep' && audience && typeof audience !== 'object') {
    audience = await payload
      .findByID({ collection: 'audiences', id: audience, depth: 0 })
      .catch(() => null)
  }
  const slugs = await resolvePageSlugPath(payload, page)
  return `${pagePrefix({ ...page, audience })}/${slugs.join('/')}`
}
