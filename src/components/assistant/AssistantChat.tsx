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

export const EXAMPLES = [
  "Wanneer speelt SVV'04 1 de volgende wedstrijd?",
  'Wat is er dit weekend thuis?',
  'Wat is de stand van de O11-1?',
  'Wie is de trainer van de O13-1?',
  'Hoe word ik lid?',
  'Wat kost de contributie voor een jeugdlid?',
]

// Direct routes for visitors who do not want to type a question (panel only).
const QUICK_LINKS = [
  { label: 'Teams', href: '/teams' },
  { label: 'Programma & uitslagen', href: '/programma' },
  { label: 'Nieuws', href: '/nieuws' },
  { label: 'Agenda', href: '/agenda' },
  { label: 'Contact', href: '/contact' },
  { label: 'Lid worden', href: '/vereniging/lidmaatschap' },
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

type ChatProps = {
  /** `panel` is the popup: fills its container, scrolls inside it and shows quick links. */
  variant?: 'page' | 'panel'
  /** Panel only: true while it is visible, so the input can take focus. */
  active?: boolean
  /** Panel only: a question to send as soon as the chat is ready. */
  question?: string | null
  onQuestionSent?: () => void
  /** Panel only: called when a link inside the chat is followed, so the popup can close. */
  onNavigate?: () => void
}

export default function AssistantChat({
  variant = 'page',
  active = true,
  question = null,
  onQuestionSent,
  onNavigate,
}: ChatProps) {
  const isPanel = variant === 'panel'
  const [input, setInput] = useState('')
  const { messages, sendMessage, setMessages, status, error, stop, clearError } =
    useChat<ChatMessage>({
      transport,
      onFinish: ({ message }) => logAnswer(message),
    })
  const busy = status === 'submitted' || status === 'streaming'
  const endRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [restored, setRestored] = useState(false)
  const full = messages.length >= MAX_MESSAGES

  // The page keeps its conversation across a reload or navigation. The popup does not:
  // it starts empty every time it is opened (see the reset on close below).
  useEffect(() => {
    if (!isPanel) {
      try {
        const saved = sessionStorage.getItem(STORAGE_KEY)
        if (saved) setMessages(JSON.parse(saved) as ChatMessage[])
      } catch {
        sessionStorage.removeItem(STORAGE_KEY)
      }
    }
    setRestored(true)
  }, [isPanel, setMessages])

  // Save once an answer is complete (not on every streamed token).
  useEffect(() => {
    if (isPanel || !restored || status !== 'ready') return
    if (messages.length) sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages))
    else sessionStorage.removeItem(STORAGE_KEY)
  }, [isPanel, messages, status, restored])

  // Closing the popup ends the conversation, also an answer that is still coming in.
  const wasActive = useRef(active)
  useEffect(() => {
    if (isPanel && wasActive.current && !active) {
      stop()
      setMessages([])
      clearError()
      setInput('')
    }
    wasActive.current = active
  }, [isPanel, active, stop, setMessages, clearError])

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages, status])

  const submit = (text: string) => {
    const trimmed = text.trim()
    if (!trimmed || busy || full) return
    sendMessage({ text: trimmed })
    setInput('')
  }

  // A question handed over by the homepage bar or Cmd+K: send it once, after the restore.
  useEffect(() => {
    if (!question || !restored) return
    submit(question)
    onQuestionSent?.()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [question, restored])

  useEffect(() => {
    if (isPanel && active) inputRef.current?.focus()
  }, [isPanel, active])

  // The page is long after a few answers; after clearing it, start at the top again.
  const resetConversation = () => {
    setMessages([])
    if (!isPanel) window.scrollTo({ top: 0, behavior: 'smooth' })
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
    <div className={`assistant${isPanel ? ' assistant--panel' : ''}`}>
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
          {isPanel && (
            <>
              <p className="assistant-examples__label">Of ga direct naar:</p>
              <ul className="assistant-quicklinks">
                {QUICK_LINKS.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} onClick={onNavigate}>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          )}
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
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={full ? 'Dit gesprek is vol' : "Wat wil je weten over SVV'04?"}
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
          Antwoorden komen van een AI en kunnen fouten bevatten. Controleer belangrijke zaken bij de
          club, bijvoorbeeld via het <Link href="/contact">contactformulier</Link>.
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
