import { getPayload, type Where } from 'payload'
import config from '@payload-config'
import { notFound } from 'next/navigation'
import CmsPage from '@/components/CmsPage'
import { findPage, loadPage } from '@/lib/page-route'

type Props = { params: Promise<{ slug: string; path: string[] }> }

async function getAudience(slug: string) {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'audiences',
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 0,
  })
  return docs[0] ?? null
}

const scopeOf = (audienceId: number): Where => ({
  section: { equals: 'doelgroep' },
  audience: { equals: audienceId },
})

const capitalise = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

export async function generateMetadata({ params }: Props) {
  const { slug, path } = await params
  const audience = await getAudience(slug)
  const page = audience && (await findPage(scopeOf(audience.id), path[path.length - 1]))
  return page ? { title: `SVV'04 - ${page.title}` } : {}
}

/** A page of one audience, e.g. /ouders/jongste-jeugd: breadcrumb and sidebar of that audience. */
export default async function AudiencePage({ params }: Props) {
  const { slug, path } = await params
  const audience = await getAudience(slug)
  if (!audience) {
    notFound()
  }
  const leafSlug = path[path.length - 1]
  const scope = scopeOf(audience.id)
  const page = await loadPage(`/${slug}/${path.join('/')}`, scope, leafSlug)

  return (
    <CmsPage
      title={page.title}
      scope={scope}
      basePath={`/${audience.slug}`}
      sectionLabel={capitalise(audience.name)}
      sectionHref={`/${audience.slug}`}
      content={page.content}
      slug={leafSlug}
    />
  )
}
