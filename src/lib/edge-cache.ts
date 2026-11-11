// Whole responses in Cloudflare's edge cache (the Workers Cache API), keyed by URL. For public
// GET routes that are the same for everyone and expensive to build, like the agenda feeds that
// calendar apps fetch every few hours. The stored copy lives as long as its Cache-Control
// (s-maxage) says.
//
// The Cache API only works on a custom domain: on *.workers.dev (previews, and production until
// svv04.nl moves to Cloudflare) put and match do nothing, so every request builds the response.

export async function withEdgeCache(
  request: Request,
  build: () => Promise<Response>,
): Promise<Response> {
  const cache = typeof caches !== 'undefined' && 'default' in caches ? caches.default : undefined
  if (!cache) return build()

  // A plain GET with only the URL as key; the cache does not take Next's request object.
  const key = new Request(request.url)
  const hit = await cache.match(key)
  if (hit) return hit

  const response = await build()
  if (response.ok) {
    const stored = cache.put(key, response.clone())
    const { getCloudflareContext } = await import('@opennextjs/cloudflare')
    const context = await getCloudflareContext({ async: true }).catch(() => undefined)
    if (context) context.ctx.waitUntil(stored)
    else await stored
  }
  return response
}
