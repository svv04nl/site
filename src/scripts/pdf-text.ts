// Fills `text` of every PDF in Media, so the assistant can search the club documents
// (lib/ai/tools/site.ts). Needs `pdftotext` (brew install poppler). Run it again after a new
// or changed PDF; it targets the database in DATABASE_URL.
import { execFileSync } from 'node:child_process'
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { getPayload } from 'payload'
import config from '@payload-config'
import { cleanPdfText } from '@/lib/pdf-text'

// The files live in R2 and the Worker serves them; the Local API has no file access here.
const SITE = 'https://site.svv04.workers.dev'

const payload = await getPayload({ config })
const { docs } = await payload.find({
  collection: 'media',
  where: { mimeType: { equals: 'application/pdf' } },
  limit: 0,
  depth: 0,
})

const dir = mkdtempSync(join(tmpdir(), 'pdf-text-'))
try {
  for (const doc of docs) {
    const response = await fetch(`${SITE}${doc.url}`)
    if (!response.ok) {
      console.error(`${doc.filename}: ${response.status}, overgeslagen`)
      continue
    }
    const file = join(dir, 'doc.pdf')
    writeFileSync(file, Buffer.from(await response.arrayBuffer()))
    const text = cleanPdfText(
      execFileSync('pdftotext', ['-layout', '-enc', 'UTF-8', file, '-'], {
        encoding: 'utf-8',
        maxBuffer: 50 * 1024 * 1024,
      }),
    )
    if (text === (doc.text ?? '')) {
      console.log(`${doc.filename}: ongewijzigd`)
      continue
    }
    await payload.update({ collection: 'media', id: doc.id, data: { text } })
    console.log(`${doc.filename}: ${text.split(/\s+/).length} woorden`)
  }
} finally {
  rmSync(dir, { recursive: true, force: true })
}
process.exit(0)
