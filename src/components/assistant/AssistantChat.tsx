'use client'

import React, { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport, type UIMessage } from 'ai'
import MatchCard from '@/components/ui/MatchCard'
import { ContactPerson } from '@/components/ui/ContactPerson'
import StandingsCard from '@/components/assistant/StandingsCard'
import type { ToolUi } from '@/lib/ai/card-types'
import { MAX_MESSAGES, MAX_USER_MESSAGE_CHARS } from '@/lib/ai/limits'
import type { AssistantMetadata } from '@/lib/ai/types'

// Kept in this tab only (cleared when it closes) and never sent anywhere but the chat route.
const STORAGE_KEY = 'svv04-assistant-conversation'

const EXAMPLES = [
  "Wanneer speelt SVV'04 1 de volgende wedstrijd?",
  'Wat is er dit weekend thuis?',
  'Wat is de stand van de O11-1?',
  'Wie is de trainer van de O13-1?',
  'Hoe word ik lid?',
  'Wat kost de contributie voor een jeugdlid?',
]

// Shown while a tool runs, so visitors see what the assistant is doing.
const TOOL_LABELS: Record<string, string> = {
  searchSite: 'Zoekt op de website',
  getPage: 'Leest een pagina',
  getLatestNews: 'Haalt het nieuws op',
  getContacts: 'Zoekt een contactpersoon',
  getClubInfo: 'Zoekt de clubgegevens op',
  listTeams: 'Zoekt teams',
  findStaff: 'Zoekt de staf',
  getTeamSchedule: 'Zoekt het programma',
  getTeamResults: 'Zoekt de uitslagen',
  getTeamStandings: 'Zoekt de stand',
  getClubSchedule: 'Zoekt het programma van de club',
  getMatchDetails: 'Zoekt de wedstrijdgegevens',
  getClubActivities: 'Zoekt de activiteiten',
}

// The SDK only passes the response text on, so a 429 (rate limit) is turned into a marker error here.
const RATE_LIMITED = 'rate-limited'
const transport = new DefaultChatTransport({
  api: '/api/chat',
  fetch: async (input, init) => {
    const response = await fetch(input, init)
    if (response.status === 429) throw new Error(RATE_LIMITED)
    return response
  },
})

type ChatMessage = UIMessage<AssistantMetadata>
type ToolPart = { type: string; state: string; input?: unknown; output?: unknown }

const toolParts = (message: ChatMessage) =>
  message.parts.filter((part) => part.type.startsWith('tool-')) as unknown as ToolPart[]
const toolName = (part: ToolPart) => part.type.replace('tool-', '')

function MarkdownLink({ href, children }: { href?: string; children?: React.ReactNode }) {
  if (href?.startsWith('/')) return <Link href={href}>{children}</Link>
  return (
    <a href={href} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  )
}

const uniqueBy = <T,>(items: T[], key: (item: T) => string) => [
  ...new Map(items.map((item) => [key(item), item])).values(),
]

/** Cards and buttons for what the tools found. Built from tool output, not from the model's text. */
function MessageCards({ message }: { message: ChatMessage }) {
  const uis = toolParts(message)
    .filter((part) => part.state === 'output-available')
    .map((part) => (part.output as { ui?: ToolUi } | undefined)?.ui)
    .filter((ui): ui is ToolUi => !!ui)

  const matches = uniqueBy(
    uis.flatMap((ui) => ui.matches ?? []),
    (m) => m.matchUrl,
  )
  const standings = uniqueBy(
    uis.flatMap((ui) => ui.standings ?? []),
    (t) => t.title,
  )
  const contacts = uniqueBy(
    uis.flatMap((ui) => ui.contacts ?? []),
    (c) => c.name,
  )
  const actions = uniqueBy(
    [
      ...uis
        .flatMap((ui) => ui.links ?? [])
        .map((link) => ({
          url: link.url,
          label: `${link.kind === 'article' ? 'Lees' : 'Bekijk'}: ${link.title}`,
        })),
      ...uis.flatMap((ui) => (ui.more ? [ui.more] : [])),
      ...uis.flatMap((ui) => (ui.link ? [ui.link] : [])),
    ],
    (action) => action.url,
  )
  if (!matches.length && !standings.length && !contacts.length && !actions.length) return null

  return (
    <div className="assistant-cards">
      {matches.map((m) => (
        <MatchCard
          key={m.matchUrl}
          date={m.date}
          homeTeam={m.home}
          awayTeam={m.away}
          homeTeamRelatiecode={m.homeRelatiecode}
          awayTeamRelatiecode={m.awayRelatiecode}
          isOwnHome={m.isOwnHome}
          isOwnAway={m.isOwnAway}
          time={m.time}
          score={m.score}
          venue={m.venue}
          status={m.status}
          href={m.matchUrl}
        />
      ))}
      {standings.map((table) => (
        <StandingsCard key={table.title} table={table} />
      ))}
      {contacts.map((c) => (
        <ContactPerson key={c.name} contact={c} layout="card" linkEmailToContactForm />
      ))}
      {actions.length > 0 && (
        <div className="assistant-actions">
          {actions.map((action) => (
            <Link key={action.url} href={action.url} className="btn btn--outline-dark">
              {action.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

/** Steps, tool calls, tokens and timing of one answer. Metadata only arrives with AI_ASSISTANT_DEBUG. */
function logAnswer(message: ChatMessage) {
  const { startedAt, finishedAt, usage } = message.metadata ?? {}
  if (!usage) return
  const steps = message.parts.filter((p) => p.type === 'step-start').length
  const seconds = startedAt && finishedAt ? (finishedAt - startedAt) / 1000 : undefined
  console.groupCollapsed(
    `[assistent] ${steps} stappen · ${usage.inputTokens ?? '?'} tokens in · ${usage.outputTokens ?? '?'} tokens uit` +
      (seconds === undefined ? '' : ` · ${seconds.toFixed(1)} s`),
  )
  for (const part of toolParts(message)) {
    console.log(toolName(part), { input: part.input, output: part.output })
  }
  console.groupEnd()
}

export default function AssistantChat() {
  const [input, setInput] = useState('')
  const { messages, sendMessage, setMessages, status, error, stop } = useChat<ChatMessage>({
    transport,
    onFinish: ({ message }) => logAnswer(message),
  })
  const busy = status === 'submitted' || status === 'streaming'
  const endRef = useRef<HTMLDivElement>(null)
  const restored = useRef(false)
  const full = messages.length >= MAX_MESSAGES

  // Restore the conversation after a reload or navigation.
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY)
      if (saved) setMessages(JSON.parse(saved) as ChatMessage[])
    } catch {
      sessionStorage.removeItem(STORAGE_KEY)
    }
    restored.current = true
  }, [setMessages])

  // Save once an answer is complete (not on every streamed token).
  useEffect(() => {
    if (!restored.current || status !== 'ready') return
    if (messages.length) sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages))
    else sessionStorage.removeItem(STORAGE_KEY)
  }, [messages, status])

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages, status])

  const submit = (text: string) => {
    const trimmed = text.trim()
    if (!trimmed || busy || full) return
    sendMessage({ text: trimmed })
    setInput('')
  }

  // The page is long after a few answers; after clearing it, start at the top again.
  const resetConversation = () => {
    setMessages([])
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // What the assistant is doing right now, taken from the latest unfinished tool call.
  const last = messages.at(-1)
  const runningTool = busy
    ? last &&
      toolParts(last)
        .reverse()
        .find((p) => p.state !== 'output-available' && p.state !== 'output-error')
    : undefined
  const waiting =
    status === 'submitted' ||
    (busy && last?.role === 'assistant' && !last.parts.some((p) => p.type === 'text' && p.text))
  const statusText = runningTool
    ? `${TOOL_LABELS[toolName(runningTool)] ?? 'Zoekt het op'}…`
    : waiting
      ? 'Denkt na…'
      : ''

  return (
    <div className="assistant">
      {messages.length === 0 ? (
        <div className="assistant-examples">
          <p className="assistant-examples__label">Probeer bijvoorbeeld:</p>
          <ul>
            {EXAMPLES.map((example) => (
              <li key={example}>
                <button type="button" onClick={() => submit(example)}>
                  {example}
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="assistant-messages" aria-live="polite">
          {messages.map((message) => {
            const text = message.parts.filter((p) => p.type === 'text')
            const hasText = text.some((p) => p.type === 'text' && p.text)
            return (
              <div
                key={message.id}
                className={`assistant-message assistant-message--${message.role}`}
              >
                {message.role === 'user' ? (
                  <p>{text.map((p) => (p.type === 'text' ? p.text : '')).join('')}</p>
                ) : (
                  hasText &&
                  text.map((p, i) =>
                    p.type === 'text' ? (
                      <ReactMarkdown key={i} components={{ a: MarkdownLink }}>
                        {p.text}
                      </ReactMarkdown>
                    ) : null,
                  )
                )}
                {/* Cards follow the text, so they do not appear before the answer does. */}
                {message.role === 'assistant' && hasText && <MessageCards message={message} />}
              </div>
            )
          })}
          {statusText && <p className="assistant-status">{statusText}</p>}
          {error && (
            <p className="assistant-error" role="alert">
              {error.message === RATE_LIMITED
                ? 'Je stelt veel vragen achter elkaar. Wacht een minuutje en probeer het dan opnieuw.'
                : 'Er ging iets mis. Probeer het zo nog een keer.'}
            </p>
          )}
          <div ref={endRef} />
        </div>
      )}

      {full && (
        <p className="assistant-status">
          Dit gesprek is vol. Start een nieuw gesprek om verder te vragen.
        </p>
      )}

      <form
        className="assistant-form"
        onSubmit={(e) => {
          e.preventDefault()
          submit(input)
        }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={full ? 'Dit gesprek is vol' : "Stel een vraag over SVV'04"}
          disabled={full}
          maxLength={MAX_USER_MESSAGE_CHARS}
          aria-label="Je vraag"
          autoComplete="off"
        />
        {busy ? (
          <button type="button" className="btn btn--outline-dark" onClick={stop}>
            Stop
          </button>
        ) : (
          input.trim() && (
            <button type="submit" className="btn btn--primary" disabled={full}>
              Verstuur
            </button>
          )
        )}
      </form>

      <div className="assistant-footer">
        <p>
          De assistent is een AI en kan fouten maken. Controleer belangrijke zaken bij de club,
          bijvoorbeeld via het <Link href="/contact">contactformulier</Link>.
        </p>
        {messages.length > 0 && (
          <button
            type="button"
            className="assistant-reset"
            onClick={resetConversation}
            disabled={busy}
          >
            Nieuw gesprek
          </button>
        )}
      </div>
    </div>
  )
}
