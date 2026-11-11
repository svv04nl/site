import { getPayload } from 'payload'
import config from '@payload-config'
import { notFound } from 'next/navigation'
import CmsPage from '@/components/CmsPage'

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props) {
  const { slug } = await params
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'pages',
    where: { section: { equals: 'meedoen' }, slug: { equals: slug } },
    limit: 1,
  })
  if (!docs[0]) {
    return {}
  }
  return { title: `SVV'04 - ${docs[0].title}` }
}

export default async function MeedoenPage({ params }: Props) {
  const { slug } = await params
  const payload = await getPayload({ config })

  const { docs } = await payload.find({
    collection: 'pages',
    where: { section: { equals: 'meedoen' }, slug: { equals: slug } },
    limit: 1,
  })

  if (!docs[0]) {
    notFound()
  }
  const page = docs[0]

  return (
    <CmsPage
      title={page.title}
      section="meedoen"
      sectionLabel="Meedoen"
      content={page.content}
      slug={slug}
    />
  )
}
