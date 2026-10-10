import { docHref } from '@/lib/ai/hrefs'

type Node = Record<string, unknown>

const isObject = (v: unknown): v is Node => !!v && typeof v === 'object' && !Array.isArray(v)

// Keys that carry structure or ids rather than content.
const SKIP_KEYS = new Set([
  'id',
  'blockType',
  'blockName',
  'slug',
  'order',
  'createdAt',
  'updatedAt',
])

function inlineText(node: Node): string {
  switch (node.type) {
    case 'text':
      return typeof node.text === 'string' ? node.text : ''
    case 'linebreak':
      return '\n'
    case 'link':
    case 'autolink': {
      const label = childrenOf(node).map(inlineText).join('')
      const fields = isObject(node.fields) ? node.fields : {}
      let href: string | undefined
      if (fields.linkType === 'internal' && isObject(fields.doc)) {
        href = docHref(String(fields.doc.relationTo), fields.doc.value)
      } else if (typeof fields.url === 'string') {
        href = fields.url
      }
      return href ? `${label} (${href})` : label
    }
    default:
      return childrenOf(node).map(inlineText).join('')
  }
}

const childrenOf = (node: Node): Node[] =>
  Array.isArray(node.children) ? node.children.filter(isObject) : []

function blockLines(node: Node, out: string[]): void {
  switch (node.type) {
    case 'heading':
    case 'paragraph':
    case 'quote': {
      const text = inlineText(node).trim()
      if (text) out.push(text)
      return
    }
    case 'list':
      for (const item of childrenOf(node)) {
        const text = inlineText(item).trim()
        if (text) out.push(`- ${text}`)
      }
      return
    case 'block':
      if (isObject(node.fields)) flattenFields(node.fields, out)
      return
    default:
      for (const child of childrenOf(node)) blockLines(child, out)
  }
}

/** Plain text of a Lexical richText value, including the content of custom blocks. */
export function richTextToPlainText(value: unknown): string {
  const root = isObject(value) && isObject(value.root) ? value.root : value
  if (!isObject(root)) return ''
  const out: string[] = []
  for (const child of childrenOf(root)) blockLines(child, out)
  return out.join('\n')
}

const isRichText = (v: unknown) => isObject(v) && isObject(v.root)

// Populated relationships and uploads are content of another document.
const isForeignDoc = (v: Node) => 'createdAt' in v || 'mimeType' in v

/**
 * Flattens block/array fields to "key: value" lines (table rows become one
 * line per row), so pricing tables, FAQs etc. are readable by the model.
 */
export function flattenFields(fields: Node, out: string[]): void {
  for (const [key, value] of Object.entries(fields)) {
    if (SKIP_KEYS.has(key)) continue
    if (typeof value === 'string') {
      if (value.trim()) out.push(`${key}: ${value}`)
    } else if (isRichText(value)) {
      const text = richTextToPlainText(value)
      if (text) out.push(text)
    } else if (Array.isArray(value)) {
      for (const item of value) {
        if (typeof item === 'string') out.push(item)
        else if (isObject(item) && !isForeignDoc(item)) {
          const row: string[] = []
          flattenFields(item, row)
          if (row.length) out.push(row.join(' | '))
        }
      }
    } else if (isObject(value) && !isForeignDoc(value)) {
      flattenFields(value, out)
    }
  }
}

/** Plain text of a whole document (e.g. an audience page): all content fields. */
export function docToPlainText(doc: Node, skip: string[] = []): string {
  const fields = Object.fromEntries(Object.entries(doc).filter(([k]) => !skip.includes(k)))
  const out: string[] = []
  flattenFields(fields, out)
  return out.join('\n')
}

const MAX_CHARS = 12000

export function truncate(text: string, max = MAX_CHARS): { text: string; truncated: boolean } {
  return text.length > max
    ? { text: text.slice(0, max), truncated: true }
    : { text, truncated: false }
}
