// A small per-instance limit for the public chat endpoint. Fluid Compute reuses instances, so this
// stops one phone hammering the assistant, but it is not a global limit: for that, add a rate limit
// rule in the Vercel firewall for /api/chat.

const hits = new Map<string, number[]>()

const LIMIT = 10
const WINDOW_MS = 60_000

export function checkRateLimit(key: string, now = Date.now()): { ok: true } | { ok: false; retryAfter: number } {
  const recent = (hits.get(key) ?? []).filter((t) => now - t < WINDOW_MS)
  if (recent.length >= LIMIT) {
    hits.set(key, recent)
    return { ok: false, retryAfter: Math.max(1, Math.ceil((recent[0] + WINDOW_MS - now) / 1000)) }
  }
  recent.push(now)
  hits.set(key, recent)

  // Keep the map small: forget visitors whose window has passed.
  if (hits.size > 5000) {
    for (const [k, times] of hits) if (now - times[times.length - 1] >= WINDOW_MS) hits.delete(k)
  }
  return { ok: true }
}

export function clientKey(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
  return forwarded || request.headers.get('x-real-ip') || 'unknown'
}
