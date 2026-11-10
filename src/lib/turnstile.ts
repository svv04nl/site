// Botcontrole met Cloudflare Turnstile (vervangt Vercel BotID). De browser haalt per
// beschermd verzoek een token op (zie src/instrumentation-client.ts) en stuurt het mee in
// deze header; de server controleert het bij Cloudflare.

export const TURNSTILE_HEADER = 'x-turnstile-token'

/** De routes waar de browser automatisch een token aan meegeeft. */
export const TURNSTILE_PROTECTED_PATHS = ['/api/message-submit', '/api/chat', '/api/donatie']

const SITEVERIFY = 'https://challenges.cloudflare.com/turnstile/v0/siteverify'

/**
 * True als het verzoek van een mens komt. Zonder TURNSTILE_SECRET_KEY (lokaal, previews) staat
 * de controle uit, net als BotID buiten Vercel.
 */
export async function isHuman(request: { headers: Headers }): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY
  if (!secret) return true

  const token = request.headers.get(TURNSTILE_HEADER)
  if (!token || token.length > 2048) return false

  const body = new FormData()
  body.append('secret', secret)
  body.append('response', token)
  const ip = request.headers.get('cf-connecting-ip')
  if (ip) body.append('remoteip', ip)

  try {
    const res = await fetch(SITEVERIFY, { method: 'POST', body })
    const result = (await res.json()) as { success?: boolean }
    return result.success === true
  } catch {
    return false
  }
}
