import { createAgentUIStreamResponse } from 'ai'
import { getPayload } from 'payload'
import config from '@payload-config'
import { checkBotId } from 'botid/server'
import { createAssistantAgent, isAssistantDebug, isAssistantEnabled } from '@/lib/ai/agent'
import { MAX_MESSAGES, MAX_USER_MESSAGE_CHARS } from '@/lib/ai/limits'
import type { AssistantMetadata } from '@/lib/ai/types'
import { handleAppChat, isAppChatBody } from '@/lib/app-api/chat'
import { errorResponse } from '@/lib/app-api/http'

export const maxDuration = 60

type IncomingMessage = { role?: unknown; parts?: unknown }

function textOf(message: IncomingMessage): string {
  if (!Array.isArray(message.parts)) return ''
  return message.parts
    .map((p) =>
      p && typeof p === 'object' && (p as { type?: unknown }).type === 'text'
        ? String((p as { text?: unknown }).text ?? '')
        : '',
    )
    .join('')
}

async function findAudienceName(slug: string): Promise<string | null> {
  if (!slug || slug.length > 60) return null
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'audiences',
    where: { slug: { equals: slug } },
    select: { name: true },
    limit: 1,
    depth: 0,
  })
  return docs[0]?.name ?? null
}

export async function POST(request: Request) {
  const rawBody: unknown = await request.json().catch(() => null)

  // The SVV'04 app (openapi.yaml, POST /chat) sends `{ messages: [{ role, text }] }` and gets
  // `{ text, cards }` back. A native app cannot pass the BotID check, so it has its own rate limit.
  if (isAppChatBody(rawBody)) {
    try {
      return await handleAppChat(request, rawBody)
    } catch (error) {
      return errorResponse(error)
    }
  }

  if (!isAssistantEnabled()) return new Response('Not found', { status: 404 })

  const verification = await checkBotId()
  if (verification.isBot) return Response.json({ error: 'Access denied' }, { status: 403 })

  const body = rawBody as {
    messages?: IncomingMessage[]
    audience?: unknown
  } | null
  const messages = body?.messages
  if (!Array.isArray(messages) || messages.length === 0 || messages.length > MAX_MESSAGES) {
    return Response.json({ error: 'Ongeldig verzoek.' }, { status: 400 })
  }
  const tooLong = messages.some(
    (m) => m.role === 'user' && textOf(m).length > MAX_USER_MESSAGE_CHARS,
  )
  if (tooLong || messages.at(-1)?.role !== 'user') {
    return Response.json({ error: 'Ongeldig verzoek.' }, { status: 400 })
  }

  // The visitor's perspective comes from a "Voor jou" page. Only the slug is accepted; the name that
  // reaches the prompt is read from the database, so client input never ends up in the instructions.
  const audience = typeof body?.audience === 'string' ? await findAudienceName(body.audience) : null

  return createAgentUIStreamResponse({
    agent: await createAssistantAgent({ audience }),
    uiMessages: messages,
    abortSignal: request.signal,
    messageMetadata: ({ part }): AssistantMetadata | undefined => {
      if (!isAssistantDebug()) return undefined
      if (part.type === 'start') return { startedAt: Date.now() }
      if (part.type === 'finish') {
        const { inputTokens, outputTokens, totalTokens } = part.totalUsage
        return { finishedAt: Date.now(), usage: { inputTokens, outputTokens, totalTokens } }
      }
      return undefined
    },
  })
}
