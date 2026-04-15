import { postgresAdapter } from '@payloadcms/db-postgres'
import { resendAdapter } from '@payloadcms/email-resend'
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob'
import { lexicalEditor, BlocksFeature, LinkFeature } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { nl } from 'payload/i18n/nl'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { CtaBlock } from './blocks/CtaBlock/config'
import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Posts } from './collections/Posts'
import { Teams } from './collections/Teams'
import { Sponsors } from './collections/Sponsors'
import { Pages } from './collections/Pages'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

const blobToken = process.env.BLOB_READ_WRITE_TOKEN || ''
const blobStoreId = blobToken.match(/^vercel_blob_rw_([a-z\d]+)_/i)?.[1]?.toLowerCase() ?? ''

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
  collections: [Users, Media, Posts, Teams, Sponsors, Pages],
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
        blocks: [CtaBlock],
      }),
    ],
  }),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || '',
    },
  }),
  sharp,
  plugins: [
    vercelBlobStorage({
      enabled: !!blobToken,
      collections: {
        media: {
          prefix: 'media',
          disablePayloadAccessControl: true,
          generateFileURL: ({ filename, prefix }) =>
            `https://${blobStoreId}.public.blob.vercel-storage.com/${prefix ?? 'media'}/${encodeURIComponent(filename)}`,
        },
      },
      token: blobToken,
    }),
  ],
})
