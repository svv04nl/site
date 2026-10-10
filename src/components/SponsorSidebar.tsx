import React from 'react'
import { getPayload } from 'payload'
import config from '@payload-config'
import type { Media } from '@/payload-types'

// De drie zichtbare tiers in de homepage-sidebar, in weergavevolgorde.
const TIERS = [
  { value: 'main', label: 'Hoofdsponsor' },
  { value: 'sub', label: 'Subsponsor' },
  { value: 'youth', label: 'Hoofdsponsor jeugd' },
] as const

type Props = {
  /**
   * 'side' sits in the homepage sidebar; 'stacked' is the copy above the sponsor ticker
   * that replaces it once the sidebar wraps below the news (see _sponsors.scss).
   */
  variant?: 'side' | 'stacked'
}

export async function SponsorSidebar({ variant = 'side' }: Props) {
  const payload = await getPayload({ config })

  const { docs: sponsors } = await payload.find({
    collection: 'sponsors',
    where: { tier: { in: ['main', 'sub', 'youth'] } },
    depth: 1,
    limit: 20,
  })

  const items = TIERS.map((tier) => ({
    ...tier,
    sponsor: sponsors.find((s) => (s as { tier?: string }).tier === tier.value),
  })).filter((item): item is typeof item & { sponsor: NonNullable<typeof item.sponsor> } =>
    Boolean(item.sponsor),
  )

  if (items.length === 0) return null

  const content = (
    <div className={`sidebar-section sponsor-sidebar sponsor-sidebar--${variant}`}>
      {items.map(({ value, label, sponsor }) => {
        const logo = sponsor.logo as Media | undefined
        const href = (sponsor as { url?: string | null }).url || undefined

        const inner = (
          <>
            <div className="sponsor-tier-label">{label}</div>
            <div className="sponsor-tier-logo">
              {logo?.url && <img src={logo.url} alt={sponsor.name} />}
            </div>
          </>
        )

        return href ? (
          <a
            key={value}
            className="sponsor-tier-card"
            href={href}
            target="_blank"
            rel="noopener noreferrer"
          >
            {inner}
          </a>
        ) : (
          <div key={value} className="sponsor-tier-card">
            {inner}
          </div>
        )
      })}
    </div>
  )

  return variant === 'stacked' ? <div className="home-sponsor-tiers">{content}</div> : content
}
