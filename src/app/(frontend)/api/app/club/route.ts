import { getPayload } from 'payload'
import config from '@payload-config'
import { loadAudiences, rolesOf } from '@/lib/app-api/audiences'
import { TRIBUNE_URL, WEBSHOP_URL } from '@/lib/app-api/config'
import { appRoute, TTL } from '@/lib/app-api/http'
import { link, screenTarget } from '@/lib/app-api/links'

export const dynamic = 'force-dynamic'

export const GET = appRoute(TTL.content, async () => {
  const payload = await getPayload({ config })
  // The same pages as the Vereniging menu on the website: top level, not hidden.
  const { docs: pages } = await payload.find({
    collection: 'pages',
    where: {
      section: { equals: 'vereniging' },
      hideFromNav: { not_equals: true },
      parent: { exists: false },
    },
    sort: 'title',
    limit: 100,
    depth: 0,
    select: { title: true, slug: true },
  })

  return {
    roles: rolesOf(await loadAudiences()),
    sections: [
      {
        title: 'Vereniging',
        links: pages.map((page) => link(page.title, screenTarget('page', { slug: page.slug }))),
      },
      {
        title: 'Meer',
        links: [
          link('Contact', screenTarget('contacts'), { subtitle: 'Sportpark & bestuur' }),
          link('Agenda', screenTarget('activities'), { subtitle: 'Evenementen & data' }),
          link('Tribune', { kind: 'browser', url: TRIBUNE_URL, inApp: true }),
          link('Sponsors', screenTarget('sponsors')),
          link(
            'Webshop',
            { kind: 'browser', url: WEBSHOP_URL, inApp: false },
            { subtitle: 'Clubkleding & merch' },
          ),
        ],
      },
    ],
  }
})
