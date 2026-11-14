import CmsPage from '@/components/CmsPage'
import { findPage, loadPage } from '@/lib/page-route'

type Props = { params: Promise<{ slug: string[] }> }

// Pages shared by several audiences (e.g. the WhatsApp community): in no menu, the audience
// pages link to them.
const scope = { section: { equals: 'info' } } as const

export async function generateMetadata({ params }: Props) {
  const { slug } = await params
  const page = await findPage(scope, slug[slug.length - 1])
  return page ? { title: `SVV'04 - ${page.title}` } : {}
}

export default async function InfoPage({ params }: Props) {
  const { slug } = await params
  const leafSlug = slug[slug.length - 1]
  const page = await loadPage(`/info/${slug.join('/')}`, scope, leafSlug)

  return (
    <CmsPage
      title={page.title}
      scope={scope}
      basePath="/info"
      content={page.content}
      showSubpageMenu={false}
      slug={leafSlug}
    />
  )
}
