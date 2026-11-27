// Fills `text` of every PDF in Media for the assistant (see lib/pdf-text.ts). Run it again after a
// new or changed PDF; it writes to the database in DATABASE_URL.
import { getPayload } from 'payload'
import config from '@payload-config'
import { fillPdfText } from '@/lib/pdf-text'

const payload = await getPayload({ config })
console.log((await fillPdfText(payload)).join('\n'))
process.exit(0)
