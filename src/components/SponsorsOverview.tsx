import React from 'react'
import type { Media, Sponsor } from '@/payload-types'
import { SponsorsGrid } from '@/components/SponsorsGrid'

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

  const rest = sponsors.filter((s) => s.tier !== 'main' && s.tier !== 'youth')

  const withLogo = rest
    .filter((s) => (s.logo as Media | null | undefined)?.url)
    .map((s) => ({
      id: s.id,
      name: s.name,
      url: s.url,
      logoUrl: (s.logo as Media).url as string,
    }))

  const withoutLogo = rest
    .filter((s) => !(s.logo as Media | null | undefined)?.url)
    .sort((a, b) => a.name.localeCompare(b.name, 'nl'))

  if (sponsors.length === 0) {
    return <p className="news-empty">Geen sponsors gevonden.</p>
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
                <span className="sponsors-featured-body">
                  <span className="sponsors-featured-logo">
                    {logo?.url && <img src={logo.url} alt={sponsor.name} />}
                  </span>
                </span>
              </SponsorLink>
            )
          })}
        </div>
      )}

      {withLogo.length > 0 && (
        <>
          <h2 className="sponsors-section-title">Website sponsoren</h2>
          <SponsorsGrid sponsors={withLogo} />
        </>
      )}

      {withoutLogo.length > 0 && (
        <>
          <h2 className="sponsors-section-title">Overige sponsoren</h2>
          <ul className="sponsors-list">
            {withoutLogo.map((sponsor) => (
              <li key={sponsor.id} className="sponsors-list-item">
                <span className="sponsors-list-name">{sponsor.name}</span>
                {sponsor.url && (
                  <a
                    className="sponsors-list-link"
                    href={sponsor.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {sponsor.url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')}
                  </a>
                )}
              </li>
            ))}
          </ul>
        </>
      )}
    </>
  )
}
