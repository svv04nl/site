import React from 'react'
import Link from 'next/link'
import { getPayload } from 'payload'
import config from '@payload-config'

// Capitalise only the first letter, leaving the rest as-is (Dutch casing).
const capitalise = (value: string) => value.charAt(0).toUpperCase() + value.slice(1)

export default async function FooterServer() {
  const payload = await getPayload({ config })

  const [{ docs: pages }, { docs: audiences }] = await Promise.all([
    payload.find({
      collection: 'pages',
      // Pages hidden from the menus (detail pages, pages that moved) stay out of the footer too.
      where: { hideFromNav: { not_equals: true } },
      limit: 100,
      sort: 'title',
      select: { title: true, section: true, slug: true },
    }),
    payload.find({
      collection: 'audiences',
      limit: 100,
      sort: 'order',
      select: { name: true, slug: true },
    }),
  ])

  const verenigingPages = pages.filter((p) => p.section === 'vereniging')
  const commissiesPages = pages.filter((p) => p.section === 'commissies')

  return (
    <footer className="site-footer">
      {/* Nav columns */}
      <div className="site-footer-nav-section">
        <div className="site-footer-inner site-footer-nav-grid">
          {/* Brand */}
          <div className="site-footer-brand">
            <Link href="/" className="site-footer-brand-link" aria-label="SVV'04 Schoonebeek - home">
              <img
                src="/logo.webp"
                alt="SVV'04 Schoonebeek"
                className="site-footer-brand-logo"
                width="278"
                height="336"
              />
              <span className="site-footer-brand-name">SVV&rsquo;04</span>
            </Link>
            <p className="site-footer-brand-desc">
              Schoonebeekse Voetbal Vereniging &rsquo;04
              <br />
              <br />
              Sportpark De Kampen
              <br />
              De Kampen 18, 7761 CK Schoonebeek
            </p>
            <div className="site-footer-social">
              <a
                href="https://www.facebook.com/svv04"
                className="site-footer-social-link"
                aria-label="Facebook"
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
              <a
                href="https://www.instagram.com/svv04_schoonebeek"
                className="site-footer-social-link"
                aria-label="Instagram"
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Navigatie */}
          <div className="site-footer-col">
            <h3 className="site-footer-col-title">Navigatie</h3>
            <ul className="site-footer-nav">
              <li>
                <Link href="/nieuws">Nieuws</Link>
              </li>
              <li>
                <Link href="/teams">Teams</Link>
              </li>
              <li>
                <Link href="/agenda">Agenda</Link>
              </li>
              <li>
                <Link href="/programma">Programma</Link>
              </li>
              <li>
                <Link href="/contact">Contact</Link>
              </li>
            </ul>
          </div>

          {/* Vereniging */}
          <div className="site-footer-col">
            <h3 className="site-footer-col-title">Vereniging</h3>
            <ul className="site-footer-nav">
              {verenigingPages.map((p) => (
                <li key={p.id}>
                  <Link href={`/vereniging/${p.slug}`}>{p.title}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Commissies */}
          <div className="site-footer-col">
            <h3 className="site-footer-col-title">Commissies</h3>
            <ul className="site-footer-nav">
              {commissiesPages.map((p) => (
                <li key={p.id}>
                  <Link href={`/commissies/${p.slug}`}>{p.title}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Voor jou */}
          {audiences.length > 0 && (
            <div className="site-footer-col">
              <h3 className="site-footer-col-title">Voor jou</h3>
              <ul className="site-footer-nav">
                {audiences.map((a) => (
                  <li key={a.id}>
                    <Link href={`/${a.slug}`}>{capitalise(a.name)}</Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="site-footer-bottom">
        <div className="site-footer-inner site-footer-bottom-inner">
          <nav className="site-footer-bottom-links">
            <Link href="/privacy">Privacyverklaring</Link>
            <Link href="/cookies">Cookies</Link>
            <Link href="/contact">Contact</Link>
          </nav>
          <p className="site-footer-copyright">&copy; 2026 SVV&rsquo;04 Schoonebeek</p>
        </div>
      </div>
    </footer>
  )
}
