import { getPayload } from 'payload'
import config from '@payload-config'
import type { Media } from '@/payload-types'
import { SponsorsTickerTrack } from '@/components/SponsorsTickerTrack'

export async function SponsorsTicker() {
  const payload = await getPayload({ config })

  const { docs: sponsors } = await payload.find({
    collection: 'sponsors',
    where: { logo: { exists: true } },
    depth: 1,
    limit: 100,
  })

  const logos = sponsors
    .map((sponsor) => ({ src: (sponsor.logo as Media | undefined)?.url, name: sponsor.name }))
    .filter((logo): logo is { src: string; name: string } => Boolean(logo.src))

  if (logos.length === 0) return null

  return <SponsorsTickerTrack logos={logos} />
}
