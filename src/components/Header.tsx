'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useScroll } from '@reactuses/core'

const NavArrow = () => (
  <svg className="nav-arrow" width="10" height="6" viewBox="0 0 10 6" fill="none" aria-hidden="true">
    <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const MobileNavArrow = () => (
  <svg className="mobile-nav-arrow" width="10" height="6" viewBox="0 0 10 6" fill="none" aria-hidden="true">
    <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

type Team = {
  id: string | number
  name: string
  slug: string
  type: string
  category?: string | null
}

type ActionPage = {
  id: string | number
  title: string
  slug: string
  section: string
}

type Props = {
  seniorTeams: Team[]
  youthTeams: Team[]
  actiePages: ActionPage[]
}

export default function Header({ seniorTeams, youthTeams, actiePages }: Props) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null)
  const pathname = usePathname()
  const isHome = pathname === '/'

  const [, scrollY] = useScroll(
    typeof window !== 'undefined' ? window : null,
    { throttle: 50 },
  )
  const isScrolled = !isHome || scrollY > 40

  // Close mobile menu on navigation
  useEffect(() => {
    setMobileOpen(false)
    setOpenSubmenu(null)
  }, [pathname])

  const toggleSubmenu = (name: string) =>
    setOpenSubmenu((prev) => (prev === name ? null : name))

  // Split into balanced columns (max ~5 per col, items distributed evenly)
  function balancedChunk<T>(arr: T[], maxPerCol: number): T[][] {
    const n = arr.length
    if (n === 0) return []
    const cols = Math.ceil(n / maxPerCol)
    const base = Math.floor(n / cols)
    const remainder = n % cols
    const result: T[][] = []
    let i = 0
    for (let c = 0; c < cols; c++) {
      const size = base + (c < remainder ? 1 : 0)
      result.push(arr.slice(i, i + size))
      i += size
    }
    return result
  }

  return (
    <header className={`site-header${isScrolled ? ' is-scrolled' : ''}`}>

      {/* Topbar */}
      <div className="site-header-topbar">
        <div className="site-header-topbar-inner">
          <Link className="site-header-topbar-logo" href="/" aria-label="SVV'04 Schoonebeek - home">
            <img
              src="/logo.png"
              alt="SVV'04 Schoonebeek"
              className="site-header-topbar-logo-img"
            />
          </Link>
          <div className="site-header-topbar-right">
            {actiePages.length > 0 && (
              <nav aria-label="Actie links">
                <ul className="site-header-topbar-list">
                  {actiePages.map((page) => (
                    <li key={page.id}>
                      <Link href={`/${page.section}/${page.slug}`}>{page.title}</Link>
                    </li>
                  ))}
                </ul>
              </nav>
            )}
            <div className="site-header-topbar-social">
              <a href="https://www.facebook.com/svv04" className="site-header-topbar-social-link" aria-label="Facebook" target="_blank" rel="noopener noreferrer">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
              <a href="https://www.instagram.com/svv04_schoonebeek" className="site-header-topbar-social-link" aria-label="Instagram" target="_blank" rel="noopener noreferrer">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Mainbar */}
      <nav
        className={`site-header-mainbar${mobileOpen ? ' js-nav-active' : ''}`}
        aria-label="Hoofdnavigatie"
        id="nav"
      >
        <div className="site-header-mainbar-inner">

          {/* Mobile: hamburger */}
          <button
            className="nav-toggle"
            id="nav-toggle"
            aria-expanded={mobileOpen}
            aria-label="Menu openen"
            type="button"
            onClick={() => setMobileOpen((o) => !o)}
          >
            <span className="hamburger-bar" />
            <span className="hamburger-bar" />
            <span className="hamburger-bar" />
          </button>

          {/* Mobile: logo */}
          <Link className="site-header-mobile-logo" href="/">
            <img src="/logo.png" alt="SVV'04" className="site-header-mobile-logo-img" />
          </Link>

          {/* Mobile: webshop */}
          <a className="site-header-mobile-cta" href="https://clubs.deventrade.com/nl/svv-04/clubcollectie" target="_blank" rel="noopener noreferrer">Webshop</a>

          {/* Desktop nav */}
          <div className="site-header-nav-right">
            <ul className="menu-items">
              <li><Link href="/nieuws">Nieuws</Link></li>
              <li><Link href="/agenda">Agenda</Link></li>
              <li><Link href="/programma">Programma</Link></li>
              {([
                {
                  label: 'Senioren',
                  content: (
                    <div className="sub-menu-grid">
                      {balancedChunk(seniorTeams.length > 0 ? seniorTeams : [], 5).map((col, i) => (
                        <ul key={i} className="sub-menu-list">
                          {col.map((team) => (
                            <li key={team.id}><Link href={`/teams/${team.slug}`}>{team.name}</Link></li>
                          ))}
                        </ul>
                      ))}
                    </div>
                  ),
                },
                {
                  label: 'Jeugd',
                  content: (
                    <div className="sub-menu-grid">
                      {balancedChunk(youthTeams.length > 0 ? youthTeams : [], 5).map((col, i) => (
                        <ul key={i} className="sub-menu-list">
                          {col.map((team) => (
                            <li key={team.id}><Link href={`/teams/${team.slug}`}>{team.name}</Link></li>
                          ))}
                        </ul>
                      ))}
                    </div>
                  ),
                },
                {
                  label: 'Vereniging',
                  content: (
                    <div className="sub-menu-grid">
                      <ul className="sub-menu-list">
                        <li><Link href="/vereniging/algemeen">Algemeen</Link></li>
                        <li><Link href="/vereniging/bestuur">Bestuur</Link></li>
                        <li><Link href="/vereniging/historie">Historie</Link></li>
                        <li><Link href="/vereniging/sportpark">Sportpark</Link></li>
                      </ul>
                      <ul className="sub-menu-list">
                        <li><Link href="/vereniging/clubblad">Clubblad</Link></li>
                        <li><Link href="/vereniging/lidmaatschap">Lidmaatschap</Link></li>
                        <li><Link href="/vereniging/clubkleding">Clubkleding</Link></li>
                      </ul>
                      <ul className="sub-menu-list">
                        <li><Link href="/vereniging/vrijwilligers">Vrijwilligers</Link></li>
                        <li><Link href="/vereniging/jeugdafdeling">Jeugdafdeling</Link></li>
                        <li><Link href="/vereniging/sponsoren">Sponsoren</Link></li>
                      </ul>
                    </div>
                  ),
                },
                {
                  label: 'Commissies',
                  content: (
                    <div className="sub-menu-grid">
                      <ul className="sub-menu-list">
                        <li><Link href="/commissies/activiteitencommissie">Activiteitencommissie</Link></li>
                        <li><Link href="/commissies/kantinecommissie">Kantinecommissie</Link></li>
                        <li><Link href="/commissies/toernooicommissie">Toernooicommissie</Link></li>
                      </ul>
                      <ul className="sub-menu-list">
                        <li><Link href="/commissies/commerciele-commissie">Commerciële commissie</Link></li>
                        <li><Link href="/commissies/scheidsrechterscommissie">Scheidsrechterscommissie</Link></li>
                        <li><Link href="/commissies/vertrouwenspersoon">Vertrouwenspersoon</Link></li>
                      </ul>
                      <ul className="sub-menu-list">
                        <li><Link href="/commissies/technische-commissie">Technische Commissie</Link></li>
                        <li><Link href="/commissies/communicatie-commissie">Communicatie commissie</Link></li>
                        <li><Link href="/commissies/kleding-en-materiaal">Kleding &amp; materiaal</Link></li>
                      </ul>
                    </div>
                  ),
                },
              ] as const).map(({ label, content }) => (
                <li
                  key={label}
                  className={`menu-item-has-children${openSubmenu === label ? ' is-open' : ''}`}
                  onMouseEnter={() => setOpenSubmenu(label)}
                  onMouseLeave={() => setOpenSubmenu(null)}
                >
                  <a href="#" onClick={(e) => e.preventDefault()}>{label} <NavArrow /></a>
                  <div className="sub-menu-panel sub-menu-panel--wide">{content}</div>
                </li>
              ))}

              <li><Link href="/contact">Contact</Link></li>
              <li className="menu-item-webshop"><a href="https://clubs.deventrade.com/nl/svv-04/clubcollectie" target="_blank" rel="noopener noreferrer">Webshop</a></li>
            </ul>
          </div>
        </div>

        {/* Mobile nav overlay */}
        <div className={`mobile-nav${mobileOpen ? ' is-open' : ''}`} id="mobile-nav" aria-hidden={!mobileOpen}>
          <ul className="mobile-nav-list">
            <li><Link href="/nieuws">Nieuws</Link></li>
            <li><Link href="/agenda">Agenda</Link></li>
            <li><Link href="/programma">Programma</Link></li>
            {([
              {
                label: 'Senioren',
                items: seniorTeams.map((t) => ({ label: t.name, href: `/teams/${t.slug}` })),
              },
              {
                label: 'Jeugd',
                items: youthTeams.map((t) => ({ label: t.name, href: `/teams/${t.slug}` })),
              },
              {
                label: 'Vereniging',
                items: [
                  { label: 'Algemeen', href: '/vereniging/algemeen' },
                  { label: 'Bestuur', href: '/vereniging/bestuur' },
                  { label: 'Historie', href: '/vereniging/historie' },
                  { label: 'Sportpark', href: '/vereniging/sportpark' },
                  { label: 'Clubblad', href: '/vereniging/clubblad' },
                  { label: 'Lidmaatschap', href: '/vereniging/lidmaatschap' },
                  { label: 'Clubkleding', href: '/vereniging/clubkleding' },
                  { label: 'Vrijwilligers', href: '/vereniging/vrijwilligers' },
                  { label: 'Jeugdafdeling', href: '/vereniging/jeugdafdeling' },
                  { label: 'Sponsoren', href: '/vereniging/sponsoren' },
                ],
              },
              {
                label: 'Commissies',
                items: [
                  { label: 'Activiteitencommissie', href: '/commissies/activiteitencommissie' },
                  { label: 'Kantinecommissie', href: '/commissies/kantinecommissie' },
                  { label: 'Toernooicommissie', href: '/commissies/toernooicommissie' },
                  { label: 'Commerciële commissie', href: '/commissies/commerciele-commissie' },
                  { label: 'Scheidsrechterscommissie', href: '/commissies/scheidsrechterscommissie' },
                  { label: 'Vertrouwenspersoon', href: '/commissies/vertrouwenspersoon' },
                  { label: 'Technische Commissie', href: '/commissies/technische-commissie' },
                  { label: 'Communicatie commissie', href: '/commissies/communicatie-commissie' },
                  { label: 'Kleding & materiaal', href: '/commissies/kleding-en-materiaal' },
                ],
              },
            ] as const).map(({ label, items }) => (
              <li key={label} className={`mobile-nav-has-children${openSubmenu === label ? ' is-open' : ''}`}>
                <button
                  className="mobile-nav-toggle"
                  aria-expanded={openSubmenu === label}
                  onClick={() => toggleSubmenu(label)}
                >
                  {label} <MobileNavArrow />
                </button>
                <ul className="mobile-nav-sub">
                  {items.map((item) => (
                    <li key={item.label}><Link href={item.href}>{item.label}</Link></li>
                  ))}
                </ul>
              </li>
            ))}

            <li><Link href="/contact">Contact</Link></li>
            {actiePages.length > 0 && (
              <>
                <li className="mobile-nav-divider" />
                {actiePages.map((page) => (
                  <li key={page.id}><Link href={`/${page.section}/${page.slug}`}>{page.title}</Link></li>
                ))}
              </>
            )}
            <li><a href="https://clubs.deventrade.com/nl/svv-04/clubcollectie" className="mobile-nav-cta" target="_blank" rel="noopener noreferrer">Webshop</a></li>
          </ul>
        </div>
      </nav>
    </header>
  )
}
