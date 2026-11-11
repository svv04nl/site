const MIN_LENGTH_FOR_SINGULAR_FALLBACK = 3

/**
 * A query typed as a plural ("vrijwilligers") should still match content
 * titled in the singular ("Vrijwilliger worden"), and vice versa. Dutch
 * plurals are usually just a trailing "s" or "en", so this is a light
 * heuristic, not a real stemmer — it only needs to cover that common case.
 */
export function searchQueryVariants(query: string): string[] {
  const q = query.trim().toLowerCase()
  if (!q) {
    return []
  }

  const variants = new Set([q])
  if (q.length > MIN_LENGTH_FOR_SINGULAR_FALLBACK) {
    if (q.endsWith('en')) {
      variants.add(q.slice(0, -2))
    } else if (q.endsWith('s')) {
      variants.add(q.slice(0, -1))
    }
  }
  return [...variants]
}
