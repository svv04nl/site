import type { Payload } from 'payload'
import type { Page } from '@/payload-types'

const MAX_DEPTH = 5

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

export function buildPagePath(section: string, slugPath: string[]): string {
  return `/${section}/${slugPath.join('/')}`
}
