import { getPayload } from 'payload'
import config from '@payload-config'
import Header from './Header'

export default async function HeaderServer() {
  const payload = await getPayload({ config })

  const [{ docs: teams }, { docs: actiePages }] = await Promise.all([
    payload.find({ collection: 'teams', limit: 100, sort: 'order' }),
    payload.find({
      collection: 'pages',
      where: { section: { equals: 'meedoen' } },
      sort: 'title',
      limit: 20,
      select: { title: true, slug: true, section: true },
    }),
  ])

  const seniorTeams = teams.filter((t) => t.type === 'senior')
  const youthTeams = teams.filter((t) => t.type === 'youth')

  return <Header seniorTeams={seniorTeams} youthTeams={youthTeams} actiePages={actiePages} />
}
