import { getPayload, type Where } from 'payload'
import config from '@payload-config'
import { notFound, permanentRedirect, redirect } from 'next/navigation'
import type { Page } from '@/payload-types'
import { resolvePagePath } from '@/lib/pages'

/** The page with this slug in one section (or audience), or null. */
export async function findPage(where: Where, slug: string): Promise<Page | null> {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'pages',
    where: { and: [where, { slug: { equals: slug } }] },
    limit: 1,
  })
  return docs[0] ?? null
}

/**
 * The page a catch-all route shows at `path` (e.g. /vereniging/vrijwilligerswerk/taken).
 * - Found, but its real address differs (other parent): redirect there.
 * - Not in this section, but a page with that slug lives elsewhere (moved to an audience or to
 *   /info): permanent redirect, so old links, search engines and the assistant keep working.
 * - Otherwise 404.
 */
export async function loadPage(path: string, where: Where, slug: string): Promise<Page> {
  const payload = await getPayload({ config })
  const page = await findPage(where, slug)

  if (page) {
    const canonical = await resolvePagePath(payload, page)
    if (canonical !== path) {
      redirect(canonical)
    }
    return page
  }

  const { docs } = await payload.find({
    collection: 'pages',
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 0,
  })
  const moved = docs[0]
  if (moved) {
    const target = await resolvePagePath(payload, moved)
    // A page whose real address is this very path but that the lookup above missed
    // (e.g. its audience was deleted) must not loop.
    if (target !== path) {
      permanentRedirect(target)
    }
  }
  notFound()
}
