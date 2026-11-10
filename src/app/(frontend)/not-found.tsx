import React from 'react'
import Link from 'next/link'

export const metadata = {
  title: "Pagina niet gevonden | SVV'04 Schoonebeek",
}

const QUICK_LINKS = [
  { href: '/programma', label: 'Programma' },
  { href: '/teams', label: 'Teams' },
  { href: '/vereniging/lidmaatschap', label: 'Lid worden' },
  { href: '/contact', label: 'Contact' },
]

export default function NotFound() {
  return (
    <main className="page not-found">
      <div className="page-inner not-found-inner">
        <span className="not-found-bram">
          <img
            src="/bram/bram-lekkebal.webp"
            alt="Bram de zebra met een lekke bal"
            width={593}
            height={640}
          />
        </span>
        <div className="not-found-text">
          <p className="not-found-code">Foutcode 404</p>
          <h1 className="not-found-title">Het balletje blijft niet altijd rollen...</h1>
          <p className="not-found-intro">Deze pagina bestaat helaas niet meer. Misschien zoek je dit:</p>
          <nav className="not-found-links" aria-label="Snel naar">
            {QUICK_LINKS.map((link) => (
              <Link key={link.href} href={link.href}>
                {link.label}
              </Link>
            ))}
          </nav>
          <Link className="btn btn--primary" href="/">
            Naar de homepage
          </Link>
        </div>
      </div>
    </main>
  )
}
