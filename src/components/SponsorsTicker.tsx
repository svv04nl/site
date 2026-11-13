import Link from 'next/link'
import { getPayload } from 'payload'
import config from '@payload-config'
import type { Media, Sponsor } from '@/payload-types'
import { SponsorsTickerTrack } from '@/components/SponsorsTickerTrack'

// The fixed cards at the top of the block, in this order. Everyone else rolls by below.
const TIERS = [
  { value: 'main', label: 'Hoofdsponsor' },
  { value: 'sub', label: 'Subsponsor' },
  { value: 'youth', label: 'Hoofdsponsor jeugd' },
] as const

const TIER_VALUES: string[] = TIERS.map((t) => t.value)

function TierCard({ sponsor, label }: { sponsor: Sponsor; label: string }) {
  const logo = sponsor.logo as Media | undefined
  const inner = (
    <>
      <span className="sponsors-tier-logo">
        {logo?.url ? <img src={logo.url} alt={sponsor.name} /> : <span>{sponsor.name}</span>}
      </span>
      <span className="sponsors-tier-text">
        <span className="sponsors-tier-label">{label}</span>
        <span className="sponsors-tier-name">{sponsor.name}</span>
      </span>
    </>
  )

  return sponsor.url ? (
    <a className="sponsors-tier-card" href={sponsor.url} target="_blank" rel="noopener noreferrer">
      {inner}
    </a>
  ) : (
    <div className="sponsors-tier-card">{inner}</div>
  )
}

/**
 * "Onze sponsoren" on the homepage: the main sponsors as fixed cards, and the other
 * website sponsors in the scrolling logo bar below them.
 */
export async function SponsorsTicker() {
  const payload = await getPayload({ config })

  const [{ docs: tiered }, { docs: websiteSponsors }] = await Promise.all([
    payload.find({
      collection: 'sponsors',
      where: { tier: { in: TIER_VALUES } },
      depth: 1,
      limit: 20,
    }),
    payload.find({
      collection: 'sponsors',
      where: { websiteSponsor: { equals: true } },
      depth: 1,
      limit: 100,
    }),
  ])

  const cards = TIERS.flatMap((tier) =>
    tiered.filter((s) => s.tier === tier.value).map((sponsor) => ({ sponsor, label: tier.label })),
  )

  // The main sponsors already have a card, so they do not roll by again.
  const logos = websiteSponsors
    .filter((sponsor) => !TIER_VALUES.includes(sponsor.tier ?? 'regular'))
    .map((sponsor) => ({ src: (sponsor.logo as Media | undefined)?.url, name: sponsor.name }))
    .filter((logo): logo is { src: string; name: string } => Boolean(logo.src))

  if (cards.length === 0 && logos.length === 0) {
    return null
  }

  return (
    <section className="sponsors-section" aria-label="Onze sponsoren">
      <div className="sponsors-section-head">
        <p className="home-eyebrow">Onze sponsoren</p>
        <Link href="/sponsoring" className="home-text-link">
          Sponsor worden &rarr;
        </Link>
      </div>
      {cards.length > 0 && (
        <div className="sponsors-tiers">
          {cards.map(({ sponsor, label }) => (
            <TierCard key={sponsor.id} sponsor={sponsor} label={label} />
          ))}
        </div>
      )}
      {logos.length > 0 && <SponsorsTickerTrack logos={logos} />}
    </section>
  )
}
