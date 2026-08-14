import { getPayload } from 'payload'
import config from '@payload-config'
import Header from './Header'

export default async function HeaderServer() {
  const payload = await getPayload({ config })

  const { docs: actiePages } = await payload.find({
    collection: 'pages',
    where: { section: { equals: 'meedoen' } },
    sort: 'title',
    limit: 20,
    select: { title: true, slug: true, section: true },
  })

  return <Header actiePages={actiePages} />
}
