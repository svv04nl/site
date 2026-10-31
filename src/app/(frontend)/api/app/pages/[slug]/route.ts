import { readFileSync } from 'fs'
import { join } from 'path'
import { getPayload } from 'payload'
import config from '@payload-config'
import { SITE_URL } from '@/lib/app-api/config'
import { appRouteWithParams, notFound, slugParam, TTL } from '@/lib/app-api/http'
import { anchorsOf, lexicalToBlocks, markdownToBlocks } from '@/lib/app-api/richtext'
import { buildPagePath, resolvePageSlugPath } from '@/lib/pages'

export const dynamic = 'force-dynamic'

// The privacy and cookie statements are not CMS pages; they live in src/content as markdown.
const LEGAL = {
  privacy: { title: 'Privacyverklaring', file: 'privacy.md' },
  cookies: { title: 'Cookiebeleid', file: 'cookies.md' },
} as const

export const GET = appRouteWithParams<{ slug: string }>(TTL.content, async (_request, { slug }) => {
  slugParam(slug, 'Deze pagina')

  if (slug === 'privacy' || slug === 'cookies') {
    const { title, file } = LEGAL[slug]
    const content = markdownToBlocks(readFileSync(join(process.cwd(), 'src/content', file), 'utf-8'))
    return { slug, title, section: 'juridisch', anchors: anchorsOf(content), content, webUrl: `${SITE_URL}/${slug}` }
  }

  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'pages',
    where: { slug: { equals: slug } },
    // Depth 2: images and links in the text, and the photo of a contact block.
    depth: 2,
    limit: 5,
  })
  // A slug can exist in more than one section; the Vereniging page wins.
  const page = docs.find((p) => p.section === 'vereniging') ?? docs[0]
  if (!page) throw notFound('Deze pagina')

  const webUrl = `${SITE_URL}${buildPagePath(page.section, await resolvePageSlugPath(payload, page))}`
  const content = lexicalToBlocks(page.content, { webUrl })
  return {
    slug: page.slug,
    title: page.title,
    section: page.section,
    anchors: anchorsOf(content),
    content,
    updatedAt: page.updatedAt,
    webUrl,
  }
})
