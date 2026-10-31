import { getPayload } from 'payload'
import config from '@payload-config'
import { appRoute, TTL } from '@/lib/app-api/http'
import { toImage } from '@/lib/app-api/media'

export const dynamic = 'force-dynamic'

// In the order of the tier options in the Sponsors collection.
const TIERS = [
  { tier: 'main', title: 'Hoofdsponsor' },
  { tier: 'sub', title: 'Subsponsor' },
  { tier: 'youth', title: 'Hoofdsponsor jeugd' },
  { tier: 'regular', title: 'Regulier' },
] as const

export const GET = appRoute(TTL.content, async () => {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'sponsors',
    sort: 'name',
    depth: 1,
    limit: 500,
    pagination: false,
  })

  return {
    tiers: TIERS.map(({ tier, title }) => ({
      title,
      sponsors: docs
        .filter((s) => (s.tier ?? 'regular') === tier)
        .map((s) => {
          // Like the website: only sponsors with the "Website sponsor" counterpart show their logo.
          const logo = s.websiteSponsor ? toImage(s.logo) : undefined
          return { name: s.name, ...(logo ? { logo } : {}), ...(s.url ? { url: s.url } : {}) }
        }),
    })).filter((group) => group.sponsors.length > 0),
  }
})
