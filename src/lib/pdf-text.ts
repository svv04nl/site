import type { Payload, PayloadRequest } from 'payload'
import { extractText, getDocumentProxy } from 'unpdf'

// The files live in R2 and the Worker serves them; scripts and migrations have no bucket.
const SITE = 'https://site.svv04.workers.dev'

/**
 * Plain text from a PDF for the assistant's search index: no runs of spaces, at most one empty
 * line between paragraphs.
 */
export function cleanPdfText(raw: string): string {
  return raw
    .replace(/\f/g, '\n')
    .split('\n')
    .map((line) => line.replace(/[ \t]+/g, ' ').trim())
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

/** The text of a PDF file. */
export async function pdfText(bytes: Uint8Array): Promise<string> {
  const { text } = await extractText(await getDocumentProxy(bytes), { mergePages: false })
  return cleanPdfText(text.join('\n\n'))
}

/**
 * Fills `text` of every PDF in Media, so the assistant can search the club documents
 * (lib/ai/tools/site.ts). Used by `pnpm media:pdf-text` and the migration that added the field.
 * A PDF that cannot be fetched or read is skipped, never thrown: a migration must not fail on it.
 */
export async function fillPdfText(payload: Payload, req?: PayloadRequest): Promise<string[]> {
  const { docs } = await payload.find({
    collection: 'media',
    where: { mimeType: { equals: 'application/pdf' } },
    limit: 0,
    depth: 0,
    req,
  })
  const log: string[] = []
  for (const doc of docs) {
    try {
      const response = await fetch(`${SITE}${doc.url}`)
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }
      const text = await pdfText(new Uint8Array(await response.arrayBuffer()))
      if (text === (doc.text ?? '')) {
        log.push(`${doc.filename}: ongewijzigd`)
        continue
      }
      await payload.update({ collection: 'media', id: doc.id, data: { text }, req })
      log.push(`${doc.filename}: ${text.split(/\s+/).length} woorden`)
    } catch (error) {
      log.push(`${doc.filename}: overgeslagen (${error instanceof Error ? error.message : error})`)
    }
  }
  return log
}
