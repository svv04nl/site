// Collects the plain text of a Lexical document, including the `text` fields
// of custom blocks (quotes etc.). The `content` column is JSON, so it can't be
// searched with a `where` clause and is matched in JS instead.
export function extractText(node: unknown, out: string[] = []): string[] {
  if (Array.isArray(node)) {
    for (const child of node) {
      extractText(child, out)
    }
  } else if (node && typeof node === 'object') {
    for (const [key, value] of Object.entries(node)) {
      if (key === 'text' && typeof value === 'string') {
        out.push(value)
      } else if (value && typeof value === 'object') {
        extractText(value, out)
      }
    }
  }
  return out
}

const SNIPPET_CONTEXT = 50

// A short excerpt around the first match, so a body-text hit shows why it matched.
export function snippetAround(text: string, variants: string[]): string | undefined {
  const lower = text.toLowerCase()
  const index = Math.min(...variants.map((v) => lower.indexOf(v)).filter((i) => i !== -1))
  if (!Number.isFinite(index)) {
    return undefined
  }
  const start = Math.max(0, index - SNIPPET_CONTEXT)
  const end = Math.min(text.length, index + SNIPPET_CONTEXT * 2)
  return `${start > 0 ? '…' : ''}${text.slice(start, end).trim()}${end < text.length ? '…' : ''}`
}
