/**
 * Sets the topbar/search actionLabel for the meedoen action pages, so the
 * quick-action surfaces read "Lid worden" / "Sponsor worden" /
 * "Vrijwilliger worden" while the pages themselves keep their broader
 * titles (Lidmaatschap / Sponsoring / Vrijwilligerswerk).
 *
 * Run with: node --no-deprecation --env-file=.env.local --import=tsx/esm src/scripts/set-meedoen-action-labels.ts
 */

import { getPayload } from 'payload'
import config from '@payload-config'

const ACTION_LABELS: Record<string, string> = {
  lidmaatschap: 'Lid worden',
  sponsoring: 'Sponsor worden',
  vrijwilligerswerk: 'Vrijwilliger worden',
}

async function main() {
  const payload = await getPayload({ config })

  for (const [slug, actionLabel] of Object.entries(ACTION_LABELS)) {
    const { docs } = await payload.find({
      collection: 'pages',
      where: { section: { equals: 'meedoen' }, slug: { equals: slug } },
      limit: 1,
    })
    if (docs[0]) {
      await payload.update({ collection: 'pages', id: docs[0].id, data: { actionLabel } })
      console.log(`Set actionLabel: meedoen/${slug} -> "${actionLabel}"`)
    } else {
      console.log(`Skip: meedoen/${slug} (not found)`)
    }
  }

  console.log('Done.')
  process.exit(0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
