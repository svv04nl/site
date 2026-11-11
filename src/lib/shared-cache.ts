import { unstable_cache } from 'next/cache'

// Data that is the same for every visitor (the club's matches, the club calendar), cached once
// for the whole site with Next's unstable_cache. On Cloudflare that is OpenNext's incremental
// cache in R2: shared by every Worker instance and data centre, previews included. After
// `revalidate` seconds the next caller gets the stored copy while a fresh one is fetched.
//
// Outside a Next request (tests, scripts) there is no incremental cache; then the loader just
// runs.

export function sharedCache<T>(
  load: () => Promise<T>,
  key: string,
  { revalidate, tags = [key] }: { revalidate: number; tags?: string[] },
): () => Promise<T> {
  const cachedLoad = unstable_cache(load, [key], { revalidate, tags })
  return async () => {
    try {
      return await cachedLoad()
    } catch (error) {
      if (error instanceof Error && error.message.includes('incrementalCache missing')) {
        return load()
      }
      throw error
    }
  }
}
