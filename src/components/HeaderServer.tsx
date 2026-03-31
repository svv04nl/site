import { getPayload } from 'payload'
import config from '@payload-config'
import Header from './Header'

export default async function HeaderServer() {
  const payload = await getPayload({ config })

  const { docs: teams } = await payload.find({
    collection: 'teams',
    limit: 100,
    sort: 'order',
  })

  const seniorTeams = teams.filter((t) => t.type === 'senior')
  const youthTeams = teams.filter((t) => t.type === 'youth')

  return <Header seniorTeams={seniorTeams} youthTeams={youthTeams} />
}
