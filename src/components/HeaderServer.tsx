import { getPayload } from 'payload'
import config from '@payload-config'
import Header, { type ActionPage } from './Header'

// Hardcoded on purpose: these link to normal vereniging pages, not to a
// dynamic 'meedoen' section — see feedback that the dynamic section made the
// site structure confusing (lidmaatschap etc. belong under vereniging).
const ACTION_LINKS: ActionPage[] = [
  {
    id: 'lidmaatschap',
    title: 'Lidmaatschap',
    actionLabel: 'Lid worden',
    slug: 'lidmaatschap',
    section: 'vereniging',
  },
  {
    id: 'vrijwilligerswerk',
    title: 'Vrijwilligerswerk',
    actionLabel: 'Vrijwilliger worden',
    slug: 'vrijwilligerswerk',
    section: 'vereniging',
  },
  {
    id: 'sponsoring',
    title: 'Sponsoring',
    actionLabel: 'Sponsor worden',
    slug: 'sponsoring',
    section: 'vereniging',
  },
]

export default async function HeaderServer() {
  const payload = await getPayload({ config })

  const [{ docs: teams }, { docs: verenigingPages }, { docs: commissiesPages }] = await Promise.all([
    payload.find({ collection: 'teams', limit: 100, sort: 'order' }),
    payload.find({
      collection: 'pages',
      where: {
        section: { equals: 'vereniging' },
        hideFromNav: { not_equals: true },
        parent: { exists: false },
      },
      sort: 'title',
      limit: 50,
      select: { title: true, slug: true, section: true },
    }),
    payload.find({
      collection: 'pages',
      where: {
        section: { equals: 'commissies' },
        hideFromNav: { not_equals: true },
        parent: { exists: false },
      },
      sort: 'title',
      limit: 50,
      select: { title: true, slug: true, section: true },
    }),
  ])

  const seniorTeams = teams.filter((t) => t.type === 'senior')
  const youthTeams = teams.filter((t) => t.type === 'youth')

  return (
    <Header
      seniorTeams={seniorTeams}
      youthTeams={youthTeams}
      actiePages={ACTION_LINKS}
      verenigingPages={verenigingPages}
      commissiesPages={commissiesPages}
    />
  )
}
