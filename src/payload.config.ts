import { postgresAdapter } from '@payloadcms/db-postgres'
import { resendAdapter } from '@payloadcms/email-resend'
import { r2Storage } from '@payloadcms/storage-r2'
import { lexicalEditor, BlocksFeature, LinkFeature } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { nl } from 'payload/i18n/nl'
import { fileURLToPath } from 'url'

import { CtaBlock } from './blocks/CtaBlock/config'
import { ContactBlock } from './blocks/ContactBlock/config'
import { PricingTableBlock } from './blocks/PricingTableBlock/config'
import { QrCodeBlock } from './blocks/QrCodeBlock/config'
import { AppStoreButtonsBlock } from './blocks/AppStoreButtonsBlock/config'
import { AddressBlock } from './blocks/AddressBlock/config'
import { TaskTableBlock } from './blocks/TaskTableBlock/config'
import { QuoteBlock } from './blocks/QuoteBlock/config'
import { DocumentDownloadBlock } from './blocks/DocumentDownloadBlock/config'
import { DocumentCardsBlock } from './blocks/DocumentCardsBlock/config'
import { GalleryBlock } from './blocks/GalleryBlock/config'
import { FactsBlock } from './blocks/FactsBlock/config'
import { OptionCardsBlock } from './blocks/OptionCardsBlock/config'
import { PackageTiersBlock } from './blocks/PackageTiersBlock/config'
import { AdFormatsBlock } from './blocks/AdFormatsBlock/config'
import { BoardMembersBlock } from './blocks/BoardMembersBlock/config'
import { TeamDirectoryBlock } from './blocks/TeamDirectoryBlock/config'
import { SectionHeaderBlock } from './blocks/SectionHeaderBlock/config'
import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Posts } from './collections/Posts'
import { Teams } from './collections/Teams'
import { Sponsors } from './collections/Sponsors'
import { Pages } from './collections/Pages'
import { Contacts } from './collections/Contacts'
import { Audiences } from './collections/Audiences'
import { Messages } from './collections/Messages'
import { Donations } from './collections/Donations'
import { Fundraisers } from './collections/Fundraisers'
import { TeamStaff } from './collections/TeamStaff'
import { searchEndpoint } from './endpoints/search'
import { messageSubmitEndpoint } from './endpoints/message-submit'
import { mediaFileUrl } from './lib/media-sizes'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

// The Cloudflare bindings: in the Worker, and under next dev through
// initOpenNextCloudflareForDev (next.config.ts). Not there in payload CLI commands, scripts and
// next build; then the database is DATABASE_URL and the media plugin gets a stand-in bucket
// (see noMediaBucket below).
const onWorkers = typeof navigator !== 'undefined' && navigator.userAgent === 'Cloudflare-Workers'

async function cloudflareEnv(): Promise<CloudflareEnv | undefined> {
  try {
    const { getCloudflareContext } = await import('@opennextjs/cloudflare')
    return (await getCloudflareContext({ async: true })).env
  } catch {
    return undefined
  }
}

const cloudflare = await cloudflareEnv()

// Stand-in for the media bucket where there is no binding (scripts, next build). The R2 plugin
// must stay on there: switched off it also drops its `prefix` field (alwaysInsertFields does not
// apply to a disabled plugin), and dev push would then want to remove that column. Reading media
// needs no bucket; only an upload or delete reaches this and fails clearly.
const noMediaBucket = new Proxy({} as NonNullable<CloudflareEnv['MEDIA']>, {
  get() {
    throw new Error('Media bucket not available here: uploads only work in the Worker and next dev')
  },
})

// In production the database goes through Hyperdrive (Cloudflare's connection pool). Previews
// have no Hyperdrive and use the DATABASE_URL of their own Neon branch.
const databaseUrl =
  (onWorkers ? cloudflare?.HYPERDRIVE?.connectionString : undefined) || process.env.DATABASE_URL || ''

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  email: resendAdapter({
    defaultFromAddress: 'noreply@svv04.nl',
    defaultFromName: "SVV'04",
    apiKey: process.env.RESEND_API_KEY || '',
  }),
  i18n: {
    supportedLanguages: { nl },
    fallbackLanguage: 'nl',
  },
  collections: [Users, Media, Posts, Teams, Sponsors, Pages, Contacts, Audiences, Messages, Fundraisers, Donations, TeamStaff],
  endpoints: [searchEndpoint, messageSubmitEndpoint],
  editor: lexicalEditor({
    features: ({ defaultFeatures }) => [
      ...defaultFeatures.filter((f) => f.key !== 'link'),
      LinkFeature({
        enabledCollections: ['pages', 'posts', 'teams'],
        fields: ({ defaultFields }) => [
          ...defaultFields,
          {
            name: 'quickLink',
            type: 'select' as const,
            label: 'Snelle link',
            options: [
              { label: 'Nieuws', value: '/nieuws' },
              { label: 'Agenda', value: '/agenda' },
              { label: 'Programma', value: '/programma' },
              { label: 'Senioren', value: '/senioren' },
              { label: 'Jeugd', value: '/jeugd' },
              { label: 'Contact', value: '/contact' },
            ],
            admin: {
              condition: (data) => data.linkType !== 'internal',
              description: 'Of kies een vaste pagina (vervangt de URL hierboven).',
            },
          },
        ],
      }),
      BlocksFeature({
        blocks: [
          CtaBlock,
          ContactBlock,
          PricingTableBlock,
          QrCodeBlock,
          AppStoreButtonsBlock,
          AddressBlock,
          TaskTableBlock,
          QuoteBlock,
          DocumentDownloadBlock,
          DocumentCardsBlock,
          GalleryBlock,
          FactsBlock,
          OptionCardsBlock,
          PackageTiersBlock,
          AdFormatsBlock,
          BoardMembersBlock,
          TeamDirectoryBlock,
          SectionHeaderBlock,
        ],
      }),
    ],
  }),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: databaseUrl,
      // Een Worker mag een verbinding niet over requests heen hergebruiken.
      ...(onWorkers ? { maxUses: 1 } : {}),
    },
  }),
  // Geen sharp: dat draait niet op Workers. Beeldformaten maakt Cloudflare Images op het
  // moment van tonen (zie collections/Media.ts en app/(frontend)/api/img).
  plugins: [
    // Uploads in the R2 bucket svv04-media, under the same keys as the old Blob store
    // (media/<file>). Visitors get them from /media/<file> (app/(frontend)/media), straight
    // from R2 without Payload.
    r2Storage({
      alwaysInsertFields: true,
      bucket: cloudflare?.MEDIA ?? noMediaBucket,
      collections: {
        media: {
          prefix: 'media',
          disablePayloadAccessControl: true,
          generateFileURL: ({ filename, prefix }) => mediaFileUrl(filename, prefix),
        },
      },
    }),
  ],
})
