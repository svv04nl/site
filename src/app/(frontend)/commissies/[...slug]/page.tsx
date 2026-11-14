import CmsPage from '@/components/CmsPage'
import { findPage, loadPage } from '@/lib/page-route'

type Props = { params: Promise<{ slug: string[] }> }

const scope = { section: { equals: 'commissies' } } as const

export async function generateMetadata({ params }: Props) {
  const { slug } = await params
  const page = await findPage(scope, slug[slug.length - 1])
  return page ? { title: `SVV'04 - ${page.title}` } : {}
}

export default async function CommissiePage({ params }: Props) {
  const { slug } = await params
  const leafSlug = slug[slug.length - 1]
  const page = await loadPage(`/commissies/${slug.join('/')}`, scope, leafSlug)

  return (
    <CmsPage
      title={page.title}
      scope={scope}
      basePath="/commissies"
      sectionLabel="Commissies"
      content={page.content}
      slug={leafSlug}
    />
  )
}
