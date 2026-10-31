import type { Contact } from '@/payload-types'
import { toContact } from '@/lib/app-api/contacts'
import { slugify } from '@/lib/app-api/format'
import { hrefToTarget, linkToHref, screenTarget } from '@/lib/app-api/links'
import { toImage } from '@/lib/app-api/media'
import type { BlockDto, InlineDto, LinkTarget } from '@/lib/app-api/types'

// Payload richText (Lexical) to the typed blocks of the app API. No HTML ever leaves the server.
// Unknown or unsuitable blocks become `unsupported`, so a new CMS block does not break the app.

type LexNode = { type?: string; children?: LexNode[]; [key: string]: any }

export type RichTextContext = {
  /** Page on the website, for blocks the app cannot show ("Bekijk op de website"). */
  webUrl?: string
}

// Lexical text format bit flags.
const BOLD = 1
const ITALIC = 2

// Blocks without an in-app version that are worth a link to the website; the rest is skipped.
const SKIP_BLOCKS = new Set(['qrCodeBlock'])

function linkTargetOf(node: LexNode): LinkTarget | undefined {
  const fields = node.fields ?? {}
  if (fields.linkType === 'internal' && fields.doc) {
    const doc = fields.doc.value
    if (!doc || typeof doc !== 'object' || !doc.slug) return undefined
    switch (fields.doc.relationTo) {
      case 'pages':
        return screenTarget('page', { slug: doc.slug })
      case 'posts':
        return screenTarget('post', { slug: doc.slug })
      case 'teams':
        return screenTarget('team', { slug: doc.slug })
      default:
        return undefined
    }
  }
  const href = fields.quickLink || fields.url
  return href ? hrefToTarget(href) : undefined
}

function inlinesOf(nodes: LexNode[] | undefined, link?: LinkTarget): InlineDto[] {
  const out: InlineDto[] = []
  for (const node of nodes ?? []) {
    switch (node.type) {
      case 'text': {
        if (!node.text) break
        const format = Number(node.format ?? 0)
        out.push({
          text: node.text,
          ...(format & BOLD ? { bold: true } : {}),
          ...(format & ITALIC ? { italic: true } : {}),
          ...(link ? { link } : {}),
        })
        break
      }
      case 'linebreak':
        out.push({ text: '\n' })
        break
      case 'tab':
        out.push({ text: '\t' })
        break
      case 'link':
      case 'autolink':
        out.push(...inlinesOf(node.children, linkTargetOf(node) ?? link))
        break
      default:
        out.push(...inlinesOf(node.children, link))
    }
  }
  return out
}

const plainText = (nodes: LexNode[] | undefined): string =>
  inlinesOf(nodes)
    .map((i) => i.text)
    .join('')

function listItems(list: LexNode): InlineDto[][] {
  const items: InlineDto[][] = []
  for (const item of list.children ?? []) {
    // A list item holds its own text and, for nested lists, a child list: flatten those after it.
    const nested = (item.children ?? []).filter((c) => c.type === 'list')
    const own = (item.children ?? []).filter((c) => c.type !== 'list')
    const inlines = inlinesOf(own)
    if (inlines.length) items.push(inlines)
    for (const child of nested) items.push(...listItems(child))
  }
  return items
}

/** "€193,20" to 19320. Anything else (a sentence, a range) is not a plain amount. */
function euroCents(text: string | null | undefined): number | undefined {
  const match = text?.trim().match(/^€?\s*(\d{1,3}(?:\.\d{3})*|\d+)(?:,(\d{1,2}))?$/)
  if (!match) return undefined
  const euros = Number(match[1].replace(/\./g, ''))
  const cents = match[2] ? Number(match[2].padEnd(2, '0')) : 0
  return euros * 100 + cents
}

function pricingTable(fields: any): BlockDto {
  const rows = (fields.rows ?? []).map((row: any) => {
    const quarter = euroCents(row.perKwartaal)
    const season = euroCents(row.perSeizoen)
    // What cannot be a number stays readable as a note.
    const notes = [
      row.perKwartaal && quarter === undefined ? `Per kwartaal: ${row.perKwartaal}` : '',
      row.perSeizoen && season === undefined ? `Per seizoen: ${row.perSeizoen}` : '',
    ].filter(Boolean)
    return {
      label: row.category as string,
      amounts: {
        ...(quarter !== undefined ? { quarter } : {}),
        ...(season !== undefined ? { season } : {}),
      },
      ...(notes.length ? { note: notes.join('. ') } : {}),
    }
  })
  return {
    type: 'pricingTable',
    columns: [
      { key: 'quarter', title: 'Per kwartaal' },
      { key: 'season', title: 'Per seizoen' },
    ],
    rows,
  }
}

function blockOf(node: LexNode, ctx: RichTextContext): BlockDto[] {
  const fields = node.fields ?? {}
  switch (fields.blockType) {
    case 'ctaBlock':
      return [
        {
          type: 'cta',
          title: fields.buttonLabel,
          action: linkToHref(fields.buttonLabel, fields.buttonUrl),
        },
      ]
    case 'contactBlock': {
      const contacts = ((fields.contacts ?? []) as unknown[]).filter(
        (c): c is Contact => !!c && typeof c === 'object',
      )
      return [
        ...(fields.heading
          ? [{ type: 'heading' as const, level: 3 as const, text: fields.heading as string }]
          : []),
        ...contacts.map((contact) => ({ type: 'contact' as const, contact: toContact(contact) })),
      ]
    }
    case 'quoteBlock':
      return [{ type: 'quote', text: fields.text }]
    case 'documentDownloadBlock': {
      const file = fields.file
      if (!file || typeof file !== 'object' || !file.url) return []
      return [
        {
          type: 'documentDownload',
          title: fields.title,
          url: file.url,
          ...(file.mimeType ? { mimeType: file.mimeType } : {}),
          ...(file.filesize ? { sizeBytes: file.filesize } : {}),
        },
      ]
    }
    case 'addressBlock':
      return [
        {
          type: 'address',
          name: fields.name,
          address: fields.address,
          mapsQuery: fields.plusCode || `${fields.name}, ${fields.address}`,
        },
      ]
    case 'pricingTableBlock':
      return [pricingTable(fields)]
    case 'appStoreButtonsBlock':
      return [{ type: 'appStoreButtons', app: 'voetbalnl' }]
    case 'galleryBlock':
      return ((fields.images ?? []) as any[]).flatMap((item) => {
        const image = toImage(item.image, 'teamPhoto')
        return image
          ? [{ type: 'image' as const, image, ...(item.caption ? { caption: item.caption } : {}) }]
          : []
      })
    default: {
      if (SKIP_BLOCKS.has(fields.blockType)) return []
      return [
        {
          type: 'unsupported',
          blockType: fields.blockType,
          ...(fields.heading || fields.title ? { title: fields.heading || fields.title } : {}),
          ...(ctx.webUrl ? { webUrl: ctx.webUrl } : {}),
        },
      ]
    }
  }
}

export function lexicalToBlocks(state: unknown, ctx: RichTextContext = {}): BlockDto[] {
  const root = (state as { root?: LexNode } | null | undefined)?.root
  const usedIds = new Set<string>()
  const blocks: BlockDto[] = []

  for (const node of root?.children ?? []) {
    switch (node.type) {
      case 'paragraph': {
        const children = inlinesOf(node.children)
        if (children.some((c) => c.text.trim())) blocks.push({ type: 'paragraph', children })
        break
      }
      case 'heading': {
        const text = plainText(node.children).trim()
        if (!text) break
        let id = slugify(text) || 'kop'
        for (let n = 2; usedIds.has(id); n++) id = `${slugify(text) || 'kop'}-${n}`
        usedIds.add(id)
        // The app has two heading levels: h1 and h2 are the section level, deeper ones the sub level.
        const level = node.tag === 'h1' || node.tag === 'h2' ? 2 : 3
        blocks.push({ type: 'heading', level, id, text })
        break
      }
      case 'list': {
        const items = listItems(node)
        if (items.length) blocks.push({ type: 'list', ordered: node.listType === 'number', items })
        break
      }
      case 'quote': {
        const text = plainText(node.children).trim()
        if (text) blocks.push({ type: 'quote', text })
        break
      }
      case 'upload': {
        const doc = node.value
        if (!doc || typeof doc !== 'object') break
        if (doc.mimeType?.startsWith('image')) {
          const image = toImage(doc, 'teamPhoto')
          const alt = node.fields?.alt || doc.alt
          if (image) blocks.push({ type: 'image', image: { ...image, ...(alt ? { alt } : {}) } })
        } else if (doc.url) {
          blocks.push({
            type: 'documentDownload',
            title: doc.filename ?? 'Bestand',
            url: doc.url,
            ...(doc.mimeType ? { mimeType: doc.mimeType } : {}),
            ...(doc.filesize ? { sizeBytes: doc.filesize } : {}),
          })
        }
        break
      }
      case 'block':
        blocks.push(...blockOf(node, ctx))
        break
      default:
        break
    }
  }
  return blocks
}

/** The "Op deze pagina" chips: the level 2 headings. */
export function anchorsOf(blocks: BlockDto[]) {
  return blocks.flatMap((b) =>
    b.type === 'heading' && b.level === 2 && b.id ? [{ id: b.id, title: b.text }] : [],
  )
}

// ---------------------------------------------------------------------------------------------
// Markdown (privacy and cookie statement, src/content/*.md). Only what those files use:
// ## and ### headings, paragraphs, "- " lists, **bold** and [text](url).

function markdownInlines(text: string): InlineDto[] {
  const out: InlineDto[] = []
  const token = /\*\*(.+?)\*\*|\[([^\]]+)\]\(([^)]+)\)/g
  let last = 0
  for (const match of text.matchAll(token)) {
    if (match.index > last) out.push({ text: text.slice(last, match.index) })
    if (match[1] !== undefined) out.push({ text: match[1], bold: true })
    else out.push({ text: match[2], link: hrefToTarget(match[3]) })
    last = match.index + match[0].length
  }
  if (last < text.length) out.push({ text: text.slice(last) })
  return out
}

export function markdownToBlocks(markdown: string): BlockDto[] {
  const blocks: BlockDto[] = []
  const usedIds = new Set<string>()
  let paragraph: string[] = []
  let list: string[] = []

  const flush = () => {
    if (paragraph.length) blocks.push({ type: 'paragraph', children: markdownInlines(paragraph.join(' ')) })
    if (list.length) blocks.push({ type: 'list', ordered: false, items: list.map(markdownInlines) })
    paragraph = []
    list = []
  }

  for (const raw of markdown.split(/\r?\n/)) {
    const line = raw.trim()
    const heading = line.match(/^(#{2,3})\s+(.+)$/)
    if (heading) {
      flush()
      const text = heading[2].trim()
      let id = slugify(text) || 'kop'
      for (let n = 2; usedIds.has(id); n++) id = `${slugify(text) || 'kop'}-${n}`
      usedIds.add(id)
      blocks.push({ type: 'heading', level: heading[1].length === 2 ? 2 : 3, id, text })
    } else if (line.startsWith('- ')) {
      if (paragraph.length) flush()
      list.push(line.slice(2))
    } else if (!line) {
      flush()
    } else {
      if (list.length) flush()
      paragraph.push(line)
    }
  }
  flush()
  return blocks
}
