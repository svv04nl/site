import { createAgentUIStreamResponse } from 'ai'
import { checkBotId } from 'botid/server'
import { createAssistantAgent, isAssistantDebug, isAssistantEnabled } from '@/lib/ai/agent'
import { MAX_MESSAGES, MAX_USER_MESSAGE_CHARS } from '@/lib/ai/limits'
import type { AssistantMetadata } from '@/lib/ai/types'

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

export async function POST(request: Request) {
  if (!isAssistantEnabled()) return new Response('Not found', { status: 404 })

  const verification = await checkBotId()
  if (verification.isBot) return Response.json({ error: 'Access denied' }, { status: 403 })

  const body = (await request.json().catch(() => null)) as { messages?: IncomingMessage[] } | null
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

  return createAgentUIStreamResponse({
    agent: await createAssistantAgent(),
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
