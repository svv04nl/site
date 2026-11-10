import React from 'react'
import Link from 'next/link'

export const metadata = {
  title: "Pagina niet gevonden | SVV'04 Schoonebeek",
}

const QUICK_LINKS = [
  { href: '/programma', label: 'Programma' },
  { href: '/teams', label: 'Teams' },
  { href: '/nieuws', label: 'Nieuws' },
  { href: '/contact', label: 'Contact' },
]

export default function NotFound() {
  return (
    <main className="page not-found">
      <div className="page-inner not-found-inner">
        <img
          className="not-found-bram"
          src="/bram/bram-lekkebal.webp"
          alt="Bram de zebra met een lekke bal"
          width={593}
          height={640}
        />
        <div className="not-found-text">
          <p className="not-found-code">404</p>
          <h1 className="page-title">Het balletje blijft niet altijd rollen...</h1>
          <p className="not-found-intro">Deze pagina bestaat helaas niet meer.</p>
          <Link className="btn btn--primary" href="/">
            Naar de homepage
          </Link>
          <nav className="not-found-links" aria-label="Snel naar">
            {QUICK_LINKS.map((link) => (
              <Link key={link.href} href={link.href}>
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </main>
  )
}
