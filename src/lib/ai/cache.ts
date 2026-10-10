const store = new Map<string, { expires: number; value: unknown }>()

/**
 * Tiny per-instance TTL cache for data that is the same for every visitor
 * (page index, team list). Fluid Compute reuses instances, so this saves a
 * database round trip on most requests; a cold instance just refetches.
 */
export async function cached<T>(key: string, ttlMs: number, load: () => Promise<T>): Promise<T> {
  const hit = store.get(key)
  if (hit && hit.expires > Date.now()) return hit.value as T
  const value = await load()
  store.set(key, { expires: Date.now() + ttlMs, value })
  return value
}
