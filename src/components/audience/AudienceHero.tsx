import React from 'react'
import Link from 'next/link'
import type { Audience, Media } from '@/payload-types'

type Crumb = { label: string; href?: string }

// Grass background for audiences that have no hero image of their own.
const DEFAULT_BACKDROP = '/images/hero-gras.webp'

// Hero of an audience landing page. Uses the same markup and styles as the
// homepage hero for a featured news post (FeaturedPostHero), so both stay uniform.
export function AudienceHero({ audience, crumbs }: { audience: Audience; crumbs: Crumb[] }) {
  const image = audience.heroImage as Media | null | undefined
  const imageUrl = image ? (image.sizes?.hero?.url ?? image.url ?? null) : null
  const focalX = image?.focalX ?? 50
  const focalY = image?.focalY ?? 50
  const actions = audience.heroActions ?? []

  return (
    <section className="site-hero site-hero--post site-hero--lg">
      <div className="site-hero-image" aria-hidden="true">
        <img
          src={imageUrl ?? DEFAULT_BACKDROP}
          alt=""
          className="site-hero-photo"
          fetchPriority="high"
          style={{ objectPosition: `${focalX}% ${focalY}%` }}
        />
        <div className="site-hero-overlay site-hero-overlay--side" />
      </div>
      <div className="site-hero-inner">
        <div className="site-hero-content">
          <nav className="site-hero-crumbs" aria-label="Breadcrumbs">
            {crumbs.map((crumb, i) => {
              const isLast = i === crumbs.length - 1
              return (
                <React.Fragment key={crumb.label}>
                  {i > 0 && <span aria-hidden="true">&rsaquo;</span>}
                  {crumb.href && !isLast ? (
                    <Link href={crumb.href}>{crumb.label}</Link>
                  ) : (
                    <span aria-current={isLast ? 'page' : undefined}>{crumb.label}</span>
                  )}
                </React.Fragment>
              )
            })}
          </nav>
          <h1 className="site-hero-title">
            Alles voor <em>{audience.name}</em>
            {' van SVV’04'}
          </h1>
          {audience.intro && <p className="site-hero-tagline">{audience.intro}</p>}
          {actions.length > 0 && (
            <div className="site-hero-actions">
              {actions.map((action) => (
                <Link key={action.id} className="btn btn--primary btn--lg" href={action.href}>
                  {action.label} &rarr;
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
