import React from 'react'
import Link from 'next/link'
import { getPayload } from 'payload'
import config from '@payload-config'

export default async function FooterServer() {
  const payload = await getPayload({ config })

  const { docs: pages } = await payload.find({
    collection: 'pages',
    limit: 100,
    sort: 'title',
    select: { title: true, section: true, slug: true },
  })

  const verenigingPages = pages.filter((p) => p.section === 'vereniging')
  const commissiesPages = pages.filter((p) => p.section === 'commissies')

  const half = <T,>(arr: T[]) => Math.ceil(arr.length / 2)

  return (
    <footer className="site-footer">
      {/* Nav columns */}
      <div className="site-footer-nav-section">
        <div className="site-footer-inner site-footer-nav-grid">
          {/* Navigatie */}
          <div className="site-footer-col">
            <h3 className="site-footer-col-title">Navigatie</h3>
            <ul className="site-footer-nav">
              <li>
                <Link href="/nieuws">Nieuws</Link>
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

          {/* Teams */}
          <div className="site-footer-col">
            <h3 className="site-footer-col-title">Teams</h3>
            <ul className="site-footer-nav">
              <li>
                <Link href="/senioren">Senioren</Link>
              </li>
              <li>
                <Link href="/jeugd">Jeugd</Link>
              </li>
            </ul>
          </div>

          {/* Vereniging — spans 2 units */}
          <div className="site-footer-col">
            <h3 className="site-footer-col-title">Vereniging</h3>
            <div className="site-footer-nav-double">
              <ul className="site-footer-nav">
                {verenigingPages.slice(0, half(verenigingPages)).map((p) => (
                  <li key={p.id}>
                    <Link href={`/vereniging/${p.slug}`}>{p.title}</Link>
                  </li>
                ))}
              </ul>
              <ul className="site-footer-nav">
                {verenigingPages.slice(half(verenigingPages)).map((p) => (
                  <li key={p.id}>
                    <Link href={`/vereniging/${p.slug}`}>{p.title}</Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Commissies — spans 2 units */}
          <div className="site-footer-col">
            <h3 className="site-footer-col-title">Commissies</h3>
            <div className="site-footer-nav-double">
              <ul className="site-footer-nav">
                {commissiesPages.slice(0, half(commissiesPages)).map((p) => (
                  <li key={p.id}>
                    <Link href={`/commissies/${p.slug}`}>{p.title}</Link>
                  </li>
                ))}
              </ul>
              <ul className="site-footer-nav">
                {commissiesPages.slice(half(commissiesPages)).map((p) => (
                  <li key={p.id}>
                    <Link href={`/commissies/${p.slug}`}>{p.title}</Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
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
          <div className="site-footer-bottom-right">
            <a
              href="https://github.com/erwinsteffens/svv04-site"
              className="site-footer-github"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.303 3.438 9.8 8.205 11.387.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.84 1.237 1.84 1.237 1.07 1.834 2.807 1.304 3.492.997.108-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222 0 1.606-.015 2.898-.015 3.293 0 .322.216.694.825.576C20.565 21.795 24 17.298 24 12c0-6.63-5.37-12-12-12z" />
              </svg>
              GitHub
            </a>
            <p className="site-footer-copyright">&copy; 2026 SVV&rsquo;04 Schoonebeek</p>
          </div>
        </div>
      </div>
    </footer>
  )
}
