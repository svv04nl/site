import type { Endpoint } from 'payload'
import { isHuman } from '@/lib/turnstile'

export const messageSubmitEndpoint: Endpoint = {
  path: '/message-submit',
  method: 'post',
  handler: async (req) => {
    if (!(await isHuman(req))) {
      return Response.json({ error: 'Access denied' }, { status: 403 })
    }

    const body = (await req.json?.()) ?? {}
    const { name, email, message, afdeling, onderwerp, pageUrl } = body as Record<string, unknown>

    if (!name || !email || !message) {
      return Response.json({ error: 'Naam, e-mail en bericht zijn verplicht.' }, { status: 400 })
    }

    const doc = await req.payload.create({
      collection: 'messages',
      data: {
        name: String(name),
        email: String(email),
        message: String(message),
        afdeling: afdeling ? String(afdeling) : undefined,
        onderwerp: onderwerp ? String(onderwerp) : undefined,
        pageUrl: pageUrl ? String(pageUrl) : undefined,
      },
      req,
    })

    return Response.json({ success: true, id: doc.id })
  },
}
