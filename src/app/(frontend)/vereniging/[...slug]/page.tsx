import CmsPage from '@/components/CmsPage'
import { findPage, loadPage } from '@/lib/page-route'

type Props = { params: Promise<{ slug: string[] }> }

const scope = { section: { equals: 'vereniging' } } as const

export async function generateMetadata({ params }: Props) {
  const { slug } = await params
  const page = await findPage(scope, slug[slug.length - 1])
  return page ? { title: `SVV'04 - ${page.title}` } : {}
}

export default async function VerenigingPage({ params }: Props) {
  const { slug } = await params
  const leafSlug = slug[slug.length - 1]
  const page = await loadPage(`/vereniging/${slug.join('/')}`, scope, leafSlug)

  return (
    <CmsPage
      title={page.title}
      scope={scope}
      basePath="/vereniging"
      sectionLabel="Vereniging"
      content={page.content}
      slug={leafSlug}
    />
  )
}
