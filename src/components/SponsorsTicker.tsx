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

export function SponsorsTicker() {
  const row = (duplicate: boolean) => (
    <div className="sponsors-ticker-inner" aria-hidden={duplicate || undefined}>
      {LOGOS.map((logo) => (
        <span key={`${duplicate ? 'b' : 'a'}-${logo.src}`} className="sponsors-ticker-logo">
          <img src={logo.src} alt={duplicate ? '' : logo.name} />
        </span>
      ))}
    </div>
  )

  return (
    <div className="sponsors-ticker">
      <div className="sponsors-ticker-track">
        {row(false)}
        {row(true)}
      </div>
    </div>
  )
}
