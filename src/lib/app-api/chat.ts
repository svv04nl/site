import { getPayload } from 'payload'
import config from '@payload-config'
import { isAssistantEnabled, createAssistantAgent } from '@/lib/ai/agent'
import type { ToolUi } from '@/lib/ai/card-types'
import { MAX_MESSAGES, MAX_USER_MESSAGE_CHARS } from '@/lib/ai/limits'
import { loadTeams } from '@/lib/ai/tools/site'
import { CLUB_RELATIECODE } from '@/lib/clubdata/config'
import { gameInfoQuery } from '@/lib/clubdata/queries'
import { isRoleSlug } from '@/lib/app-api/config'
import { loadContacts, roleKey, toContact } from '@/lib/app-api/contacts'
import { toE164 } from '@/lib/app-api/format'
import { badRequest, json, problem } from '@/lib/app-api/http'
import { hrefToTarget } from '@/lib/app-api/links'
import {
  loadClubProgram,
  loadClubResults,
  mapMatches,
  type SportlinkMatch,
} from '@/lib/app-api/matches'
import { checkRateLimit, clientKey } from '@/lib/app-api/rate-limit'
import { toTeamRef } from '@/lib/app-api/posts'
import type { ChatCardDto, ContactDto, LinkDto, MatchDto } from '@/lib/app-api/types'

// POST /api/chat for the app: the whole conversation in, a short text and cards out (no streaming).
// It runs the same assistant as the website; the cards are built from the tool results, as there.

type AppChatBody = {
  messages: { role: 'user' | 'assistant'; text: string }[]
  context?: { role?: string; teams?: string[]; client?: string }
}

/** The app sends `{ text }` per message, the website `{ parts }`. */
export function isAppChatBody(body: unknown): body is AppChatBody {
  const messages = (body as { messages?: unknown } | null)?.messages
  return (
    Array.isArray(messages) &&
    messages.length > 0 &&
    messages.every(
      (m) => m && typeof m === 'object' && typeof m.text === 'string' && !('parts' in m),
    )
  )
}

function validate(body: AppChatBody): AppChatBody {
  const { messages } = body
  if (messages.length > MAX_MESSAGES) {
    throw badRequest('Het gesprek is te lang.')
  }
  for (const m of messages) {
    if (m.role !== 'user' && m.role !== 'assistant') {
      throw badRequest('Onbekende rol in een bericht.')
    }
    if (m.text.length > MAX_USER_MESSAGE_CHARS) {
      throw badRequest(`Een bericht mag maximaal ${MAX_USER_MESSAGE_CHARS} tekens zijn.`)
    }
  }
  const last = messages.at(-1)!
  if (last.role !== 'user' || !last.text.trim()) {
    throw badRequest('Het laatste bericht moet een vraag zijn.')
  }
  return body
}

// ---------------------------------------------------------------------------------------------
// Cards

const matchCode = (url: string) => url.match(/\/wedstrijd\/(\d+)/)?.[1]

/** A match from the cached club lists, else from the match detail (older results, cup matches). */
async function findMatch(code: string): Promise<MatchDto | null> {
  const [results, program] = await Promise.all([loadClubResults(), loadClubProgram()])
  const known = results.find((m) => m.id === code) ?? program.find((m) => m.id === code)
  if (known) {
    return known
  }

  try {
    const raw = await gameInfoQuery(code).queryFn()
    const info = raw.wedstrijdinformatie
    // This endpoint has no club codes, so the own club is recognised by name (as the assistant tool does).
    const ownHome = info.thuisteam.startsWith("SVV'04")
    const ownAway = info.uitteam.startsWith("SVV'04")
    const played = info.thuisscore !== null && info.uitscore !== null
    const match: SportlinkMatch = {
      wedstrijdcode: Number(code),
      wedstrijddatum: info.wedstrijddatetime || info.wedstrijddatum,
      aanvangstijd: info.aanvangstijd,
      thuisteam: info.thuisteam,
      uitteam: info.uitteam,
      thuisteamid: info.thuisteamid,
      uitteamid: info.uitteamid,
      thuisteamclubrelatiecode: ownHome ? CLUB_RELATIECODE : undefined,
      uitteamclubrelatiecode: ownAway ? CLUB_RELATIECODE : undefined,
      status: played ? 'Uitgespeeld' : 'Te spelen',
      accommodatie: raw.accommodatie.naam,
      veld: info.veldnaam,
      plaats: raw.accommodatie.plaats,
      klasse: info.klasse,
      uitslag: played ? `${info.thuisscore} - ${info.uitscore}` : null,
    }
    return (await mapMatches([match]))[0]
  } catch (error) {
    console.error('[app-api] chat match lookup failed', error)
    return null
  }
}

const uniqueBy = <T>(items: T[], key: (item: T) => string) => [
  ...new Map(items.map((item) => [key(item), item])).values(),
]

async function cardsFrom(uis: ToolUi[]): Promise<ChatCardDto[]> {
  const cards: ChatCardDto[] = []

  const matchRefs = uniqueBy(
    uis.flatMap((ui) => ui.matches ?? []),
    (m) => m.matchUrl,
  )
  const matches = await Promise.all(
    matchRefs.map((m) => (matchCode(m.matchUrl) ? findMatch(matchCode(m.matchUrl)!) : null)),
  )
  for (const match of matches) {
    if (match) {
      cards.push({ type: 'match', match })
    }
  }

  for (const table of uniqueBy(
    uis.flatMap((ui) => ui.standings ?? []),
    (t) => t.title,
  )) {
    cards.push({
      type: 'standings',
      ...(table.team ? { team: toTeamRef(table.team) } : {}),
      standings: {
        competition: table.title,
        rows: table.rows.map((row) => ({
          position: row.position,
          team: row.team,
          ...(row.clubRelatiecode
            ? { logoUrl: `https://logoapi.voetbal.nl/logo.php?clubcode=${row.clubRelatiecode}` }
            : {}),
          played: row.played,
          points: row.points,
          isOwn: row.isOwn,
        })),
      },
    })
  }

  const contactRefs = uniqueBy(
    uis.flatMap((ui) => ui.contacts ?? []),
    (c) => c.name,
  )
  if (contactRefs.length) {
    const docs = await loadContacts()
    for (const ref of contactRefs) {
      // Prefer the contact record (photo, same phone formatting as the contact screen).
      const doc = docs.find((c) => c.name === ref.name)
      const role = doc?.roles?.find(
        (r) => roleKey(r) === (ref.roles[0]?.slug || ref.roles[0]?.title),
      )
      const contact: ContactDto = doc
        ? toContact(doc, role)
        : {
            name: ref.name,
            role: ref.roles[0]?.title ?? '',
            ...(toE164(ref.phone) ? { phone: toE164(ref.phone) } : {}),
            ...(ref.email ? { email: ref.email } : {}),
          }
      cards.push({ type: 'contact', contact })
    }
  }

  const links: LinkDto[] = uniqueBy(
    [
      ...uis
        .flatMap((ui) => ui.links ?? [])
        .map((l) => ({
          url: l.url,
          title: `${l.kind === 'article' ? 'Lees' : 'Bekijk'}: ${l.title}`,
        })),
      ...uis.flatMap((ui) => (ui.more ? [{ url: ui.more.url, title: ui.more.label }] : [])),
      ...uis.flatMap((ui) => (ui.link ? [{ url: ui.link.url, title: ui.link.label }] : [])),
    ],
    (l) => l.url,
  ).map((l) => ({ title: l.title, target: hrefToTarget(l.url) }))
  for (const link of links) {
    cards.push({ type: 'link', link })
  }

  return cards
}

/**
 * The model writes markdown (the website renders it). The app wants plain text with *accent*:
 * links keep their label (internal ones also become a link card), **bold** becomes *accent*.
 */
function toPlainAnswer(text: string): { text: string; links: LinkDto[] } {
  const links: LinkDto[] = []
  const plain = text
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_m, label: string, href: string) => {
      if (href.startsWith('/') || /^https?:\/\/(www\.)?svv04\.nl/.test(href)) {
        links.push({ title: label, target: hrefToTarget(href) })
      }
      return label
    })
    .replace(/\*\*([^*]+)\*\*/g, '*$1*')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/`([^`]+)`/g, '$1')
    .trim()
  return { text: plain, links }
}

// ---------------------------------------------------------------------------------------------

export async function handleAppChat(request: Request, rawBody: AppChatBody): Promise<Response> {
  if (!isAssistantEnabled()) {
    return problem(404, 'Niet beschikbaar', 'De assistent staat uit.')
  }

  const limit = checkRateLimit(clientKey(request))
  if (!limit.ok) {
    return problem(429, 'Te veel vragen achter elkaar', 'Wacht even en probeer het opnieuw.', {
      'Retry-After': String(limit.retryAfter),
    })
  }

  const body = validate(rawBody)
  const context = body.context ?? {}

  // Only slugs reach the database; the names that end up in the prompt come from the CMS.
  const audience =
    context.role && isRoleSlug(context.role) ? await audienceName(context.role) : null
  const slugs = (Array.isArray(context.teams) ? context.teams : [])
    .filter((t) => typeof t === 'string')
    .slice(0, 10)
  const favoriteTeams = (await loadTeams()).filter((t) => slugs.includes(t.slug)).map((t) => t.name)

  const agent = await createAssistantAgent({ audience, favoriteTeams })
  const result = await agent.generate({
    messages: body.messages.map((m) => ({ role: m.role, content: m.text })),
    abortSignal: request.signal,
  })

  const uis = result.steps
    .flatMap((step) => step.toolResults)
    .map((r) => (r.output as { ui?: ToolUi } | undefined)?.ui)
    .filter((ui): ui is ToolUi => !!ui)

  const answer = toPlainAnswer(result.text)
  const cards = await cardsFrom(uis)
  const known = new Set(
    cards.flatMap((c) => (c.type === 'link' ? [JSON.stringify(c.link.target)] : [])),
  )
  for (const link of answer.links) {
    if (!known.has(JSON.stringify(link.target))) {
      cards.push({ type: 'link', link })
    }
  }

  return json({ text: answer.text, cards }, 0)
}

async function audienceName(slug: string): Promise<string | null> {
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
