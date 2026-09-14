import React from 'react'
import type { Media, Sponsor } from '@/payload-types'

const TIER_LABEL: Record<string, string> = {
  main: 'Hoofdsponsor',
  youth: 'Hoofdsponsor jeugd',
}

function SponsorLink({
  sponsor,
  className,
  children,
}: {
  sponsor: Sponsor
  className: string
  children: React.ReactNode
}) {
  return sponsor.url ? (
    <a className={className} href={sponsor.url} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  ) : (
    <div className={className}>{children}</div>
  )
}

export function SponsorsOverview({ sponsors }: { sponsors: Sponsor[] }) {
  const TIER_ORDER = ['main', 'youth']
  const featured = sponsors
    .filter((s) => TIER_ORDER.includes(s.tier ?? ''))
    .sort((a, b) => TIER_ORDER.indexOf(a.tier ?? '') - TIER_ORDER.indexOf(b.tier ?? ''))
  const rest = sponsors
    .filter((s) => s.tier !== 'main' && s.tier !== 'youth')
    .sort((a, b) => a.name.localeCompare(b.name, 'nl'))

  if (sponsors.length === 0) {
    return <p className="news-empty">Geen sponsoren gevonden.</p>
  }

  return (
    <>
      {featured.length > 0 && (
        <div className="sponsors-featured">
          {featured.map((sponsor) => {
            const logo = sponsor.logo as Media | null | undefined
            return (
              <SponsorLink key={sponsor.id} sponsor={sponsor} className="sponsors-featured-card">
                <span className="sponsors-featured-label">{TIER_LABEL[sponsor.tier ?? '']}</span>
                <span className="sponsors-featured-logo">
                  {logo?.url && <img src={logo.url} alt={sponsor.name} />}
                </span>
                <span className="sponsors-featured-name">{sponsor.name}</span>
              </SponsorLink>
            )
          })}
        </div>
      )}

      {rest.length > 0 && (
        <div className="sponsors-grid">
          {rest.map((sponsor) => {
            const logo = sponsor.logo as Media | null | undefined
            return (
              <SponsorLink key={sponsor.id} sponsor={sponsor} className="sponsors-grid-card">
                {logo?.url ? (
                  <img src={logo.url} alt={sponsor.name} />
                ) : (
                  <span className="sponsors-grid-name">{sponsor.name}</span>
                )}
              </SponsorLink>
            )
          })}
        </div>
      )}
    </>
  )
}
