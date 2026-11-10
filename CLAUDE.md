# Payload CMS Development Rules

This project uses [Payload CMS](https://payloadcms.com/) with Next.js and TypeScript.

## Core Principles

1. **TypeScript-First**: Always use TypeScript with proper types from Payload
2. **Security-Critical**: Follow all security patterns, especially access control
3. **Type Generation**: Run `generate:types` script after schema changes
4. **Transaction Safety**: Always pass `req` to nested operations in hooks
5. **Access Control**: Understand Local API bypasses access control by default
6. **Access Control**: Ensure roles exist when modifying collection or globals with access controls

### Migration Workflow

Development uses **dev push** (automatic schema sync, no migration files needed). Only create migrations when deploying to production:

1. Before committing schema changes, run: `pnpm payload migrate:create --name <description>`
2. Commit the generated migration file alongside the collection changes
3. Production runs `pnpm migrate` (= `payload migrate` with `NODE_ENV=production`) which applies only unapplied migrations

**Never** run `migrate:create` during normal local development — only when preparing a production deployment.

### Code Validation

- To validate TypeScript correctness after modifying code run `tsc --noEmit`
- Generate import maps after creating or modifying components

## Project Structure

```
src/
├── app/
│   ├── (frontend)/          # Frontend routes
│   └── (payload)/           # Payload admin routes
├── collections/             # Collection configs (Users, Posts, Teams, Media, Pages, Sponsors)
├── components/              # Custom React components
│   ├── team/                # Team-specific components (tabs, roster, schedule, etc.)
│   └── ui/                  # Shared UI components (cards, headers, etc.)
├── blocks/                  # Custom Lexical editor blocks
├── lib/
│   └── clubdata/            # Club.Dataservice (Sportlink) integration
│       ├── config.ts        # API configuration
│       ├── fetch.ts         # HTTP client
│       ├── queries.ts       # GraphQL queries
│       ├── transform.ts     # Response transformers
│       └── types.ts         # TypeScript types
├── migrations/              # PostgreSQL migration files
├── scripts/                 # Maintenance scripts (media, sync)
└── payload.config.ts        # Main Payload config
```

## Configuration

### Minimal Config Pattern

This project uses **PostgreSQL via Neon** and **Vercel Blob** for media storage.

```typescript
import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob'
import path from 'path'
import { fileURLToPath } from 'url'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: 'users',
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [Users, Media],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET,
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: { connectionString: process.env.DATABASE_URL },
  }),
  plugins: [
    vercelBlobStorage({
      enabled: true,
      token: process.env.BLOB_READ_WRITE_TOKEN,
      collections: { media: true },
    }),
  ],
})
```

## Collections

### Basic Collection

```typescript
import type { CollectionConfig } from 'payload'

export const Posts: CollectionConfig = {
  slug: 'posts',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'author', 'status', 'createdAt'],
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'slug', type: 'text', unique: true, index: true },
    { name: 'content', type: 'richText' },
    { name: 'author', type: 'relationship', relationTo: 'users' },
  ],
  timestamps: true,
}
```

### Auth Collection with RBAC

This project uses a single `role` field (not an array) with `admin` and `editor` values:

```typescript
export const Users: CollectionConfig = {
  slug: 'users',
  auth: true,
  fields: [
    {
      name: 'role',
      type: 'select',
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'Editor', value: 'editor' },
      ],
      defaultValue: 'editor',
      required: true,
      saveToJWT: true, // Include in JWT for fast access checks
    },
  ],
}
```

Access checks use `user?.role === 'admin'` (not `user?.roles?.includes('admin')`).

## Fields

### Common Patterns

```typescript
// Auto-generate slugs
import { slugField } from 'payload'
slugField({ fieldToUse: 'title' })

// Relationship with filtering
{
  name: 'category',
  type: 'relationship',
  relationTo: 'categories',
  filterOptions: { active: { equals: true } },
}

// Conditional field
{
  name: 'featuredImage',
  type: 'upload',
  relationTo: 'media',
  admin: {
    condition: (data) => data.featured === true,
  },
}

// Virtual field
{
  name: 'fullName',
  type: 'text',
  virtual: true,
  hooks: {
    afterRead: [({ siblingData }) => `${siblingData.firstName} ${siblingData.lastName}`],
  },
}
```

## CRITICAL SECURITY PATTERNS

### 1. Local API Access Control (MOST IMPORTANT)

```typescript
// ❌ SECURITY BUG: Access control bypassed
await payload.find({
  collection: 'posts',
  user: someUser, // Ignored! Operation runs with ADMIN privileges
})

// ✅ SECURE: Enforces user permissions
await payload.find({
  collection: 'posts',
  user: someUser,
  overrideAccess: false, // REQUIRED
})

// ✅ Administrative operation (intentional bypass)
await payload.find({
  collection: 'posts',
  // No user, overrideAccess defaults to true
})
```

**Rule**: When passing `user` to Local API, ALWAYS set `overrideAccess: false`

### 2. Transaction Safety in Hooks

```typescript
// ❌ DATA CORRUPTION RISK: Separate transaction
hooks: {
  afterChange: [
    async ({ doc, req }) => {
      await req.payload.create({
        collection: 'audit-log',
        data: { docId: doc.id },
        // Missing req - runs in separate transaction!
      })
    },
  ],
}

// ✅ ATOMIC: Same transaction
hooks: {
  afterChange: [
    async ({ doc, req }) => {
      await req.payload.create({
        collection: 'audit-log',
        data: { docId: doc.id },
        req, // Maintains atomicity
      })
    },
  ],
}
```

**Rule**: ALWAYS pass `req` to nested operations in hooks

### 3. Prevent Infinite Hook Loops

```typescript
// ❌ INFINITE LOOP
hooks: {
  afterChange: [
    async ({ doc, req }) => {
      await req.payload.update({
        collection: 'posts',
        id: doc.id,
        data: { views: doc.views + 1 },
        req,
      }) // Triggers afterChange again!
    },
  ],
}

// ✅ SAFE: Use context flag
hooks: {
  afterChange: [
    async ({ doc, req, context }) => {
      if (context.skipHooks) return

      await req.payload.update({
        collection: 'posts',
        id: doc.id,
        data: { views: doc.views + 1 },
        context: { skipHooks: true },
        req,
      })
    },
  ],
}
```

## Access Control

### Collection-Level Access

```typescript
import type { Access } from 'payload'

// Boolean return
const authenticated: Access = ({ req: { user } }) => Boolean(user)

// Query constraint (row-level security)
const ownPostsOnly: Access = ({ req: { user } }) => {
  if (!user) return false
  if (user?.role === 'admin') return true

  return {
    author: { equals: user.id },
  }
}

// Async access check
const projectMemberAccess: Access = async ({ req, id }) => {
  const { user, payload } = req

  if (!user) return false
  if (user.role === 'admin') return true

  const project = await payload.findByID({
    collection: 'projects',
    id: id as string,
    depth: 0,
  })

  return project.members?.includes(user.id)
}
```

### Field-Level Access

```typescript
// Field access ONLY returns boolean (no query constraints)
{
  name: 'salary',
  type: 'number',
  access: {
    read: ({ req: { user }, doc }) => {
      if (user?.id === doc?.id) return true
      return user?.role === 'admin'
    },
    update: ({ req: { user } }) => {
      return user?.role === 'admin'
    },
  },
}
```

### Common Access Patterns

```typescript
export const anyone: Access = () => true
export const authenticated: Access = ({ req: { user } }) => Boolean(user)
export const adminOnly: Access = ({ req: { user } }) => user?.role === 'admin'
export const adminOrSelf: Access = ({ req: { user } }) => {
  if (user?.role === 'admin') return true
  return { id: { equals: user?.id } }
}
export const authenticatedOrPublished: Access = ({ req: { user } }) => {
  if (user) return true
  return { _status: { equals: 'published' } }
}
```

## Hooks

### Common Hook Patterns

```typescript
export const Posts: CollectionConfig = {
  slug: 'posts',
  hooks: {
    // Before validation - format data
    beforeValidate: [
      async ({ data, operation }) => {
        if (operation === 'create') {
          data.slug = slugify(data.title)
        }
        return data
      },
    ],

    // Before save - business logic
    beforeChange: [
      async ({ data, req, operation, originalDoc }) => {
        if (operation === 'update' && data.status === 'published') {
          data.publishedAt = new Date()
        }
        return data
      },
    ],

    // After save - side effects
    afterChange: [
      async ({ doc, req, operation, previousDoc, context }) => {
        if (context.skipNotification) return
        if (operation === 'create') {
          await sendNotification(doc)
        }
        return doc
      },
    ],

    // After read - computed fields
    afterRead: [
      async ({ doc, req }) => {
        doc.viewCount = await getViewCount(doc.id)
        return doc
      },
    ],

    // Before delete - cascading deletes
    beforeDelete: [
      async ({ req, id }) => {
        await req.payload.delete({
          collection: 'comments',
          where: { post: { equals: id } },
          req, // Important for transaction
        })
      },
    ],
  },
}
```

## Queries

### Local API

```typescript
// Find with complex query
const posts = await payload.find({
  collection: 'posts',
  where: {
    and: [{ status: { equals: 'published' } }, { 'author.name': { contains: 'john' } }],
  },
  depth: 2,
  limit: 10,
  sort: '-createdAt',
  select: { title: true, author: true },
})

// Find by ID
const post = await payload.findByID({ collection: 'posts', id: '123', depth: 2 })

// Create
const newPost = await payload.create({
  collection: 'posts',
  data: { title: 'New Post', status: 'draft' },
})

// Update
await payload.update({ collection: 'posts', id: '123', data: { status: 'published' } })

// Delete
await payload.delete({ collection: 'posts', id: '123' })
```

### Query Operators

```typescript
{ status: { equals: 'published' } }
{ status: { not_equals: 'draft' } }
{ price: { greater_than: 100 } }
{ age: { less_than_equal: 65 } }
{ title: { contains: 'payload' } }   // case-insensitive
{ description: { like: 'cms headless' } } // all words present
{ category: { in: ['tech', 'news'] } }
{ image: { exists: true } }
{ location: { near: [-122.4194, 37.7749, 10000] } } // geospatial
```

### AND/OR Logic

```typescript
{ or: [{ status: { equals: 'published' } }, { author: { equals: user.id } }] }
{ and: [{ status: { equals: 'published' } }, { featured: { equals: true } }] }
```

## Getting Payload Instance

```typescript
// In API routes (Next.js)
import { getPayload } from 'payload'
import config from '@payload-config'

export async function GET() {
  const payload = await getPayload({ config })
  const posts = await payload.find({ collection: 'posts' })
  return Response.json(posts)
}

// In Server Components
export default async function Page() {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({ collection: 'posts' })
  return <div>{docs.map(post => <h1 key={post.id}>{post.title}</h1>)}</div>
}
```

## Components

The Admin Panel can be extensively customized using React Components. Custom Components can be Server Components (default) or Client Components.

### Defining Components

Components are defined using **file paths** (not direct imports) in your config:

- Paths are relative to project root or `config.admin.importMap.baseDir`
- Named exports: use `#ExportName` suffix or `exportName` property
- Default exports: no suffix needed
- File extensions can be omitted

```typescript
export default buildConfig({
  admin: {
    components: {
      graphics: { Logo: '/components/Logo', Icon: '/components/Icon' },
      Nav: '/components/CustomNav',
      beforeNavLinks: ['/components/CustomNavItem'],
      header: ['/components/AnnouncementBanner'],
      actions: ['/components/ClearCache'],
      beforeDashboard: ['/components/WelcomeMessage'],
      views: { dashboard: { Component: '/components/CustomDashboard' } },
    },
  },
})
```

### Server vs Client Components

**Server Components** (default) can use Local API directly:

```tsx
async function MyServerComponent({ payload }: { payload: Payload }) {
  const posts = await payload.find({ collection: 'posts' })
  return <div>{posts.totalDocs} posts</div>
}
```

**Client Components** need `'use client'`:

```tsx
'use client'
import { useAuth } from '@payloadcms/ui'

export function MyClientComponent() {
  const { user } = useAuth()
  return <div>{user?.email}</div>
}
```

### Available Client Hooks

```tsx
'use client'
import {
  useAuth,          // Current user
  useConfig,        // Payload config (client-safe)
  useDocumentInfo,  // Document info (id, collection, etc.)
  useField,         // Field value and setter
  useForm,          // Form state
  useFormFields,    // Multiple field values (optimized — prefer over useForm)
  useLocale,        // Current locale
  useTranslation,   // i18n translations
  usePayload,       // Local API methods
} from '@payloadcms/ui'
```

### Collection/Global Components

```typescript
export const Posts: CollectionConfig = {
  slug: 'posts',
  admin: {
    components: {
      edit: {
        PreviewButton: '/components/PostPreview',
        SaveButton: '/components/CustomSave',
      },
      list: {
        Header: '/components/ListHeader',
        beforeList: ['/components/BulkActions'],
      },
    },
  },
}
```

### Field Components

```typescript
{
  name: 'status',
  type: 'select',
  options: ['draft', 'published'],
  admin: {
    components: {
      Field: '/components/StatusField',
      Cell: '/components/StatusCell',
      Label: '/components/StatusLabel',
      Description: '/components/StatusDescription',
      Error: '/components/StatusError',
    },
  },
}

// UI field (presentational only, no data)
{
  name: 'refundButton',
  type: 'ui',
  admin: { components: { Field: '/components/RefundButton' } },
}
```

### Performance

```tsx
// ❌ Re-renders on every form change
const { fields } = useForm()

// ✅ Only re-renders when specific field changes
const value = useFormFields(([fields]) => fields[path])
```

Prefer Server Components — only use Client Components for state, effects, event handlers, or browser APIs.

### Import Map

Payload auto-generates `app/(payload)/admin/importMap.js`. Regenerate manually:

```bash
payload generate:importmap
```

## Custom Endpoints

```typescript
import type { Endpoint } from 'payload'
import { APIError } from 'payload'

export const protectedEndpoint: Endpoint = {
  path: '/protected',
  method: 'get',
  handler: async (req) => {
    if (!req.user) throw new APIError('Unauthorized', 401)

    const data = await req.payload.find({
      collection: 'posts',
      where: { author: { equals: req.user.id } },
    })

    return Response.json(data)
  },
}

// Route parameters
export const trackingEndpoint: Endpoint = {
  path: '/:id/tracking',
  method: 'get',
  handler: async (req) => {
    const { id } = req.routeParams
    const tracking = await getTrackingInfo(id)
    if (!tracking) return Response.json({ error: 'not found' }, { status: 404 })
    return Response.json(tracking)
  },
}
```

## Drafts & Versions

```typescript
export const Pages: CollectionConfig = {
  slug: 'pages',
  versions: {
    drafts: { autosave: true, schedulePublish: true, validate: false },
    maxPerDoc: 100,
  },
  access: {
    read: ({ req: { user } }) => {
      if (!user) return { _status: { equals: 'published' } }
      return true
    },
  },
}

// Create draft
await payload.create({ collection: 'pages', data: { title: 'Draft' }, draft: true })

// Read with draft
const page = await payload.findByID({ collection: 'pages', id: '123', draft: true })
```

## Field Type Guards

```typescript
import {
  fieldAffectsData,
  fieldHasSubFields,
  fieldIsArrayType,
  fieldSupportsMany,
} from 'payload'

function processField(field: Field) {
  if (fieldAffectsData(field)) console.log(field.name)
  if (fieldHasSubFields(field)) field.fields.forEach(processField)
  if (fieldIsArrayType(field)) console.log(field.minRows, field.maxRows)
  if (fieldSupportsMany(field) && field.hasMany) console.log('Multiple values supported')
}
```

## Plugins

### Using Plugins

```typescript
import { seoPlugin } from '@payloadcms/plugin-seo'

export default buildConfig({
  plugins: [seoPlugin({ collections: ['posts', 'pages'] })],
})
```

### Creating Plugins

```typescript
import type { Config, Plugin } from 'payload'

export const myPlugin =
  (options: { collections?: string[]; enabled?: boolean }): Plugin =>
  (config: Config): Config => ({
    ...config,
    collections: config.collections?.map((collection) => {
      if (options.collections?.includes(collection.slug)) {
        return {
          ...collection,
          fields: [...collection.fields, { name: 'pluginField', type: 'text' }],
        }
      }
      return collection
    }),
  })
```

Always spread existing config. Never overwrite arrays — always spread and append.

## Best Practices

### Security

1. Always set `overrideAccess: false` when passing `user` to Local API
2. Field-level access only returns boolean (no query constraints)
3. Default to restrictive access, gradually add permissions
4. Never trust client-provided data
5. Use `saveToJWT: true` for the `role` field to avoid database lookups

### Performance

1. Index frequently queried fields
2. Use `select` to limit returned fields
3. Set `maxDepth` on relationships to prevent over-fetching
4. Use query constraints over async operations in access control
5. Cache expensive operations in `req.context`

### Data Integrity

1. Always pass `req` to nested operations in hooks
2. Use context flags to prevent infinite hook loops
3. Enable transactions for PostgreSQL (this project uses Neon — transactions work out of the box)
4. Use `beforeValidate` for data formatting, `beforeChange` for business logic

### Type Safety

1. Run `generate:types` after schema changes
2. Import types from generated `payload-types.ts`
3. Type your user object: `import type { User } from '@/payload-types'`
4. Use field type guards for runtime type checking

### Organization

1. Keep collections in separate files
2. Extract access control to `access/` directory
3. Extract hooks to `hooks/` directory
4. Use reusable field factories for common patterns

## Common Gotchas

1. **Local API Default**: Access control bypassed unless `overrideAccess: false`
2. **Transaction Safety**: Missing `req` in nested operations breaks atomicity
3. **Hook Loops**: Operations in hooks can trigger the same hooks
4. **Field Access**: Cannot use query constraints, only boolean
5. **Relationship Depth**: Default depth is 2, set to 0 for IDs only
6. **Draft Status**: `_status` field auto-injected when drafts enabled
7. **Type Generation**: Types not updated until `generate:types` runs
8. **PostgreSQL Transactions**: Work out of the box with Neon — pass `req` to keep operations atomic
9. **Role Field**: This project uses `user.role` (string), not `user.roles` (array) — access checks use `user?.role === 'admin'`
10. **Unpooled Connection Required for Migrations**: DDL statements (migrations) must use `DATABASE_URL_UNPOOLED`

## SVV'04 Site Conventions

Project-specific patterns for this club website, on top of the generic Payload rules above.

### Content editing workflow

- For one-off content changes (rewriting a page, adding a block, fixing a typo), edit directly via the Payload Local API in an inline `node --env-file=.env.local --import=tsx/esm -e "..."` command. **Do not** create a persistent script file for a single content edit — that's noise in the repo. Only write a real script file for something that will be re-run (seeding, a repeatable migration-style transform).
- Never invent content. Page copy must come from real sources: the old site (`svv04.nl/web2022/...`), club documents (PDFs), or facts the user gives directly. When summarizing/rewriting a source, say so; don't present a paraphrase as a literal quote.
- Written copy follows the `humanizer` skill's rules: no em-dashes, no "niet alleen X maar ook Y", no invented statistics, direct sentences, informal-zakelijk Dutch tone matching existing pages.

### Internal linking

- Always use internal Payload links (`linkType: 'internal'`, relationship to the target doc) instead of hardcoded paths inside richText — see `resolveInternalUrl`/`buildNestedPagePath` in `src/lib/richtext.tsx`. This keeps links correct across page renames and nesting changes.
- **Contact deep-linking by role**: to link a CTA button (or any link) straight to a pre-filled contact form for a specific role, use `/contact?afdeling=<role-slug>` — the slug comes from the matching entry in that contact's `roles` array (`src/collections/Contacts.ts`), auto-generated from the role's `title` if left blank. The contact page (`src/app/(frontend)/contact/page.tsx`) matches this against `role.slug || role.title` to pre-select the dropdown and show the contact card. Check the actual stored slug before hardcoding it (the auto-slugify can mangle diacritics, e.g. "coördinator" → "cordinator").

### Page nesting

- Pages (`pages` collection) can nest via the `parent` field. Nested pages automatically appear indented under their parent in the section sidebar (`buildNavTree`/`NavList` in `src/components/CmsPage.tsx`) and get the correct multi-segment URL via the `[...slug]` catch-all routes (`src/app/(frontend)/vereniging/[...slug]/page.tsx`, `.../commissies/[...slug]/page.tsx`).
- Set `hideFromNav: true` on a page to keep it out of both the sidebar and the topbar dropdowns while still being reachable via a direct link/button from another page (e.g. a detail page meant to be opened from a CTA rather than browsed).
- **Depth pitfall**: page content queries must not use `depth: 0` if the richText can contain `upload` nodes (images) or internal `link` nodes — those need the related doc populated to render. Omit `depth` (defaults to 2) or set it explicitly ≥1. This was a real bug once (routes rewritten with `depth: 0` for the nesting feature silently broke every image on those pages).

### "Voor jou" (audience) pages

- `audiences` collection, rendered by `src/app/(frontend)/[slug]/page.tsx`. The hero is fixed, with a configurable title (`heroTitle`, `*accent*` words; empty = "Alles voor <naam> van SVV'04") and a breadcrumb of just Home › name; everything below it comes from the `layout` blocks field, in the order the editor picks: `content` (a richText with the same custom blocks as normal pages, rendered with `cmsJsxConverters` from `src/lib/cms-richtext.tsx`; each one is a full-width band with a `background` of white, light or dark, so alternate them for rhythm), `themes` (the link groups from `themes`), `contact` (contact person card + optional CTA bar) and `assistant` (the "Stel je vraag" band). An empty `layout` falls back to the old order: `body`, themes, assistant, contact.
- The assistant gets the page's perspective through `AssistantAudienceContext`; the example questions come from the page's `faq` questions. The FAQ is no longer shown, it only feeds those examples.
- The contact card links to `/contact?afdeling=<role slug>` (first role with a topic); the function shown on it is that contact's first role title, `contact.label` only overrides it.
- The sponsor options live on `/sponsoring` (a content layout), not on `/vereniging/sponsoring` (hidden from navigation and redirected in `next.config.ts`; its child page `advertenties-aanleveren` stays under the old path).

### App API (`/api/app/*`)

The public, read-only API of the SVV'04 app. `openapi.yaml` is the contract: change it first, then the code. One route handler per endpoint in `src/app/(frontend)/api/app/`, all shared logic in `src/lib/app-api/`.

- Every route is `appRoute(ttl, handler)` / `appRouteWithParams` from `lib/app-api/http.ts`: JSON with `Cache-Control`, errors as `application/problem+json`. Throw `badRequest()` / `notFound()` for client errors.
- Payload and Sportlink data never leave as-is. Mappers produce the contract shapes: `matches.ts` (Sportlink to `Match`, with two cached club-wide lists), `teams.ts`, `posts.ts`, `audiences.ts`, `contacts.ts`, `media.ts`, and `richtext.ts` (Lexical and the privacy/cookie markdown to typed `Block`s; an unknown CMS block becomes `unsupported`, so a new block never breaks the app).
- Site paths become app targets in `links.ts` (`hrefToTarget`). A new page type or route on the website needs a case there.
- Only publish what the site shows publicly: no phone numbers without a contact record, no `whatsapp` flag (no consent field exists), player names only as the team page shows them.
- The chat is `POST /api/chat` with `{ messages: [{ role, text }] }` (`lib/app-api/chat.ts`); the website's own body (`parts`) takes the old streaming path. The app branch skips BotID and uses a per-instance rate limit.
- Check a change against the contract by calling the route handlers with a `Request` and validating the JSON against the schemas in `openapi.yaml` (the handlers need no dev server). `tests/int/app-api.int.spec.ts` covers the mappers.
- `APP_MIN_VERSION_IOS` / `APP_MIN_VERSION_ANDROID` set `minAppVersion` in `GET /config` (default `1.0.0`).

### Custom richText blocks (`src/blocks/`)

Each block is a `config.ts` (Payload `Block` definition) + `Component.tsx` (renderer), registered in `payload.config.ts`'s `BlocksFeature` and in the JSX converter map in `src/components/CmsPage.tsx`. Current blocks and when to reach for them:

- `ctaBlock` — a single action button (label + URL). Use for "Word vrijwilliger", "Direct aanmelden", etc.
- `contactBlock` — one or more contact cards by contact ID.
- `quoteBlock` — centered pull-quote for a policy statement or value the club wants to highlight. Wrap words in `*asterisks*` in the `text` field to render them in the club's accent color (this is a deliberate editorial choice per word, not automatic all-caps detection).
- `documentDownloadBlock` — a downloadable file card (title, optional description, `file` upload). Opens in a new tab.
- `addressBlock` — address card with an embedded Google Maps card.
- `pricingTableBlock`, `taskTableBlock` — tabular data (pricing tiers, volunteer tasks).
- `qrCodeBlock`, `appStoreButtonsBlock` — small utility blocks for the app pages.
- `factsBlock` — a row of 2–4 key figures (value + label). Only use real numbers from club sources.
- `optionCardsBlock` — a grid of icon cards (title, text, optional detail chips and corner badge). Used for the sponsor options; styles in `styles/pages/_sponsoring.scss`. The `compact` variant shows each card's one-line `summary` and fits four in a row.
- `sectionHeaderBlock` — eyebrow + big title (+ optional intro), the same look as the homepage section headers. Wrap words in `*asterisks*` for the accent colour. Start a content band on an audience page with it.
- `packageTiersBlock` — tier cards (basis/brons/zilver/goud) with a duration and a checklist. Deliberately has no price field: prices are discussed with the sponsorgroep. Four tiers sit next to each other on a wide screen inside an audience band.
- `adFormatsBlock` — ad sizes drawn to scale (mm in, 1 mm = 0.5 px) with label and dimensions.
- `boardMembersBlock` — board member rows (round portrait, name, role, responsibility chips, phone/email). Name, photo, phone and email come from the linked `contacts` doc (fetched in the component, since the portrait is two relationships deep); only the role override and responsibility areas live in the block. Styles in `styles/pages/_board.scss`.

- `teamDirectoryBlock` — "wie is wie" cards per function or commission (title, names, optional linked `contacts` doc or role email). A linked contact supplies phone and email; people without a contact record only get a name (no private phone numbers on the site). Styles in `styles/pages/_board.scss`; the email link rule is shared in `src/lib/contact-links.ts`.

All the centered "card" blocks (`quoteBlock`, `documentDownloadBlock`, `addressBlock`, `contact-person-card`) share one width via `$content-block-width` in `src/app/(frontend)/styles/_variables.scss` — change that one variable rather than each block's own `max-width`.

## Resources

- Docs: https://payloadcms.com/docs
- LLM Context: https://payloadcms.com/llms-full.txt
- GitHub: https://github.com/payloadcms/payload
- Examples: https://github.com/payloadcms/payload/tree/main/examples
