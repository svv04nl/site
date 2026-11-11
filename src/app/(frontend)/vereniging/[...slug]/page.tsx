import { getPayload } from 'payload'
import config from '@payload-config'
import { notFound, redirect } from 'next/navigation'
import CmsPage from '@/components/CmsPage'
import { resolvePageSlugPath, buildPagePath } from '@/lib/pages'

type Props = { params: Promise<{ slug: string[] }> }

export async function generateMetadata({ params }: Props) {
  const { slug } = await params
  const leafSlug = slug[slug.length - 1]
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'pages',
    where: { section: { equals: 'vereniging' }, slug: { equals: leafSlug } },
    limit: 1,
  })
  if (!docs[0]) {
    return {}
  }
  return { title: `SVV'04 - ${docs[0].title}` }
}

export default async function VerenigingPage({ params }: Props) {
  const { slug } = await params
  const leafSlug = slug[slug.length - 1]
  const payload = await getPayload({ config })

  const { docs } = await payload.find({
    collection: 'pages',
    where: { section: { equals: 'vereniging' }, slug: { equals: leafSlug } },
    limit: 1,
  })

  if (!docs[0]) {
    notFound()
  }
  const page = docs[0]

  const canonicalSlugs = await resolvePageSlugPath(payload, page)
  if (canonicalSlugs.join('/') !== slug.join('/')) {
    redirect(buildPagePath('vereniging', canonicalSlugs))
  }

  return (
    <CmsPage
      title={page.title}
      section="vereniging"
      sectionLabel="Vereniging"
      content={page.content}
      slug={leafSlug}
    />
  )
}
