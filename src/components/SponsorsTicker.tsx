import React from 'react'
import { getPayload } from 'payload'
import config from '@payload-config'
import type { Media } from '@/payload-types'

/**
 * Number of identical copies of the logo row in the track. The marquee moves
 * left by exactly one copy and loops, which only looks seamless while the
 * remaining copies keep the viewport filled. With few logos one copy is
 * narrower than a wide screen, so we need several copies: the visible window
 * must never exceed (COPIES - 1) copy-widths. The CSS reads this via
 * `--sponsors-copies` to translate by exactly one copy (`-100% / COPIES`),
 * keeping the two in sync.
 */
const COPIES = 4

export async function SponsorsTicker() {
  const payload = await getPayload({ config })

  const { docs: sponsors } = await payload.find({
    collection: 'sponsors',
    depth: 1,
    limit: 100,
  })

  const logos = sponsors
    .map((sponsor) => ({ src: (sponsor.logo as Media | undefined)?.url, name: sponsor.name }))
    .filter((logo): logo is { src: string; name: string } => Boolean(logo.src))

  if (logos.length === 0) return null

  const row = (copy: number) => (
    <div className="sponsors-ticker-inner" aria-hidden={copy > 0 || undefined}>
      {logos.map((logo) => (
        <span key={`${copy}-${logo.src}`} className="sponsors-ticker-logo">
          <img src={logo.src} alt={copy === 0 ? logo.name : ''} />
        </span>
      ))}
    </div>
  )

  return (
    <div className="sponsors-ticker">
      <div
        className="sponsors-ticker-track"
        style={{ '--sponsors-copies': COPIES } as React.CSSProperties}
      >
        {Array.from({ length: COPIES }, (_, copy) => (
          <React.Fragment key={copy}>{row(copy)}</React.Fragment>
        ))}
      </div>
    </div>
  )
}
