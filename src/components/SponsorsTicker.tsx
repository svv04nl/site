import React from 'react'

/**
 * Sponsor-ticker in kleur. Gebruikt de statische logo-assets uit
 * `public/sponsors/` (niet de CMS) en dupliceert de rij voor de
 * doorlopende marquee.
 */
const LOGOS = [
  { src: '/sponsors/logo-anura.webp', name: 'Anura' },
  { src: '/sponsors/Logo_Klaverblad_FC_Hor.webp', name: 'Klaverblad Verzekeringen' },
  { src: '/sponsors/Logo-Mind-Motion.webp', name: 'Lifestylecenter Mind & Motion' },
  { src: '/sponsors/logo-scholma-removebg-preview.webp', name: 'Scholma' },
  { src: '/sponsors/problicity_header-logo_geel.webp', name: 'Problicity' },
  { src: '/sponsors/riant-logo-removebg-preview.webp', name: 'Riant' },
] as const

/**
 * Number of identical copies of the logo row in the track. The marquee moves
 * left by exactly one copy and loops, which only looks seamless while the
 * remaining copies keep the viewport filled. With 6 logos one copy is narrower
 * than a wide screen, so we need several copies: the visible window must never
 * exceed (COPIES - 1) copy-widths. The CSS reads this via `--sponsors-copies`
 * to translate by exactly one copy (`-100% / COPIES`), keeping the two in sync.
 */
const COPIES = 4

export function SponsorsTicker() {
  const row = (copy: number) => (
    <div className="sponsors-ticker-inner" aria-hidden={copy > 0 || undefined}>
      {LOGOS.map((logo) => (
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
