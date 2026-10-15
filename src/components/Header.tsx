'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BreadcrumbBar } from './BreadcrumbContext'
import SearchModal from './SearchModal'
import { useAssistant } from '@/components/assistant/AssistantProvider'
import { SparkleIcon } from '@/components/assistant/icons'

const NavArrow = () => (
  <svg
    className="nav-arrow"
    width="10"
    height="6"
    viewBox="0 0 10 6"
    fill="none"
    aria-hidden="true"
  >
    <path
      d="M1 1l4 4 4-4"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

const MobileNavArrow = () => (
  <svg
    className="mobile-nav-arrow"
    width="10"
    height="6"
    viewBox="0 0 10 6"
    fill="none"
    aria-hidden="true"
  >
    <path
      d="M1 1l4 4 4-4"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

type Team = {
  id: string | number
  name: string
  slug: string
  type: string
  category?: string | null
}

export type ActionPage = {
  id: string | number
  title: string
  actionLabel?: string | null
  slug: string
  section: string
}

export type NavPage = {
  id: string | number
  title: string
  slug: string
  section: string
}

export type AudienceNavItem = {
  id: string | number
  title: string
  href: string
}

type Props = {
  seniorTeams: Team[]
  youthTeams: Team[]
  actiePages: ActionPage[]
  verenigingPages: NavPage[]
  commissiesPages: NavPage[]
  audiencePages: AudienceNavItem[]
}

export default function Header({
  seniorTeams,
  youthTeams,
  actiePages,
  verenigingPages,
  commissiesPages,
  audiencePages,
}: Props) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null)
  const [searchOpen, setSearchOpen] = useState(false)
  const pathname = usePathname()
  const assistant = useAssistant()

  // Close mobile menu on navigation
  useEffect(() => {
    setMobileOpen(false)
    setOpenSubmenu(null)
  }, [pathname])

  // Cmd/Ctrl+K opens search from anywhere; Escape closes it. With the assistant on, the
  // assistant takes over both (see AssistantProvider).
  useEffect(() => {
    if (assistant.enabled) return
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault()
        setSearchOpen(true)
      } else if (e.key === 'Escape') {
        setSearchOpen(false)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [assistant.enabled])

  const openFinder = () => {
    setMobileOpen(false)
    if (assistant.enabled) assistant.openAssistant()
    else setSearchOpen(true)
  }

  const toggleSubmenu = (name: string) => setOpenSubmenu((prev) => (prev === name ? null : name))

  // Split into columns of at most `size` rows so long lists wrap sideways instead of overflowing the panel height.
  function chunk<T>(arr: T[], size: number): T[][] {
    const result: T[][] = []
    for (let i = 0; i < arr.length; i += size) {
      result.push(arr.slice(i, i + size))
    }
    return result
  }

  return (
    <header className="site-header">
      {/* Topbar */}
      <div className="site-header-topbar">
        <div className="site-header-topbar-inner">
          <Link className="site-header-topbar-logo" href="/" aria-label="SVV'04 Schoonebeek - home">
            <img src="/logo.webp" alt="SVV'04 Schoonebeek" className="site-header-topbar-logo-img" width="278" height="336" />
          </Link>
          <div className="site-header-topbar-right">
            {actiePages.length > 0 && (
              <nav aria-label="Actie links">
                <ul className="site-header-topbar-list">
                  {actiePages.map((page) => (
                    <li key={page.id}>
                      <Link href={`/${page.section}/${page.slug}`}>
                        {page.actionLabel || page.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            )}
            {assistant.enabled ? (
              <button
                type="button"
                className="assistant-trigger"
                aria-label="Stel je vraag"
                onClick={openFinder}
              >
                <SparkleIcon />
                Stel je vraag
              </button>
            ) : (
              <button
                type="button"
                className="search-trigger"
                aria-label="Zoeken"
                onClick={openFinder}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  aria-hidden="true"
                >
                  <circle cx="11" cy="11" r="7" />
                  <path d="M21 21l-4.3-4.3" />
                </svg>
                Zoeken
              </button>
            )}
            <div className="site-header-topbar-social">
              <a
                href="https://www.facebook.com/svv04"
                className="site-header-topbar-social-link"
                aria-label="Facebook"
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
              <a
                href="https://www.instagram.com/svv04_schoonebeek"
                className="site-header-topbar-social-link"
                aria-label="Instagram"
                target="_blank"
                rel="noopener noreferrer"
              >
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
            <img src="/logo.webp" alt="SVV'04" className="site-header-mobile-logo-img" width="278" height="336" />
          </Link>

          {/* Mobile: assistant (webshop stays in the menu), or the webshop while the assistant is off */}
          {assistant.enabled ? (
            <button
              type="button"
              className="site-header-mobile-cta"
              aria-label="Stel je vraag"
              onClick={openFinder}
            >
              <SparkleIcon size={13} />
              Stel je vraag
            </button>
          ) : (
            <a
              className="site-header-mobile-cta"
              href="https://clubs.deventrade.com/nl/svv-04/clubcollectie"
              target="_blank"
              rel="noopener noreferrer"
            >
              Webshop
            </a>
          )}

          {/* Desktop nav */}
          <div className="site-header-nav-right">
            <ul className="menu-items">
              <li>
                <Link href="/nieuws">Nieuws</Link>
              </li>
              <li>
                <Link href="/agenda">Agenda</Link>
              </li>
              <li>
                <Link href="/programma">Programma</Link>
              </li>
              {(
                [
                  {
                    label: 'Voor jou',
                    content: (
                      <div className="sub-menu-grid">
                        <ul className="sub-menu-list">
                          {audiencePages.map((item) => (
                            <li key={item.id}>
                              <Link href={item.href}>{item.title}</Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ),
                  },
                  {
                    label: 'Teams',
                    content: (
                      <div className="sub-menu-grid">
                        <div className="sub-menu-col-group">
                          <p className="sub-menu-col-title">Senioren</p>
                          <div className="sub-menu-col-group-cols">
                            {chunk(seniorTeams, 6).map((col, i) => (
                              <ul key={i} className="sub-menu-list">
                                {col.map((team) => (
                                  <li key={team.id}>
                                    <Link href={`/teams/${team.slug}`}>{team.name}</Link>
                                  </li>
                                ))}
                              </ul>
                            ))}
                          </div>
                        </div>
                        <div className="sub-menu-col-group">
                          <p className="sub-menu-col-title">Jeugd</p>
                          <div className="sub-menu-col-group-cols">
                            {chunk(youthTeams, 6).map((col, i) => (
                              <ul key={i} className="sub-menu-list">
                                {col.map((team) => (
                                  <li key={team.id}>
                                    <Link href={`/teams/${team.slug}`}>{team.name}</Link>
                                  </li>
                                ))}
                              </ul>
                            ))}
                          </div>
                        </div>
                      </div>
                    ),
                  },
                  {
                    label: 'Vereniging',
                    content: (
                      <div className="sub-menu-grid">
                        {chunk(verenigingPages, 4).map((col, i) => (
                          <ul key={i} className="sub-menu-list">
                            {col.map((page) => (
                              <li key={page.id}>
                                <Link href={`/${page.section}/${page.slug}`}>{page.title}</Link>
                              </li>
                            ))}
                          </ul>
                        ))}
                      </div>
                    ),
                  },
                  {
                    label: 'Commissies',
                    content: (
                      <div className="sub-menu-grid">
                        {chunk(commissiesPages, 4).map((col, i) => (
                          <ul key={i} className="sub-menu-list">
                            {col.map((page) => (
                              <li key={page.id}>
                                <Link href={`/${page.section}/${page.slug}`}>{page.title}</Link>
                              </li>
                            ))}
                          </ul>
                        ))}
                      </div>
                    ),
                  },
                ] as const
              ).map(({ label, content }) => (
                <li
                  key={label}
                  className={`menu-item-has-children${openSubmenu === label ? ' is-open' : ''}`}
                  onMouseEnter={() => setOpenSubmenu(label)}
                  onMouseLeave={() => setOpenSubmenu(null)}
                >
                  <a href="#" onClick={(e) => e.preventDefault()}>
                    {label} <NavArrow />
                  </a>
                  <div className="sub-menu-panel sub-menu-panel--wide">{content}</div>
                </li>
              ))}

              <li>
                <Link href="/contact">Contact</Link>
              </li>
              <li>
                <a
                  href="https://clubs.deventrade.com/nl/svv-04/clubcollectie"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Webshop
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Mobile nav overlay */}
        <div
          className={`mobile-nav${mobileOpen ? ' is-open' : ''}`}
          id="mobile-nav"
          aria-hidden={!mobileOpen}
        >
          <ul className="mobile-nav-list">
            <li>
              <button type="button" className="mobile-nav-search" onClick={openFinder}>
                {assistant.enabled ? 'Stel je vraag' : 'Zoeken'}
              </button>
            </li>
            <li>
              <Link href="/nieuws">Nieuws</Link>
            </li>
            <li>
              <Link href="/agenda">Agenda</Link>
            </li>
            <li>
              <Link href="/programma">Programma</Link>
            </li>
            {(
              [{ label: 'Voor jou', items: audiencePages }] as const
            ).map(({ label, items }) => (
              <li
                key={label}
                className={`mobile-nav-has-children${openSubmenu === label ? ' is-open' : ''}`}
              >
                <button
                  className="mobile-nav-toggle"
                  aria-expanded={openSubmenu === label}
                  onClick={() => toggleSubmenu(label)}
                >
                  {label} <MobileNavArrow />
                </button>
                <ul className="mobile-nav-sub">
                  {items.map((item) => (
                    <li key={item.id}>
                      <Link href={item.href}>{item.title}</Link>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
            <li>
              <Link href="/teams">Teams</Link>
            </li>
            {(
              [
                {
                  label: 'Vereniging',
                  items: verenigingPages.map((p) => ({
                    id: p.id,
                    title: p.title,
                    href: `/${p.section}/${p.slug}`,
                  })),
                },
                {
                  label: 'Commissies',
                  items: commissiesPages.map((p) => ({
                    id: p.id,
                    title: p.title,
                    href: `/${p.section}/${p.slug}`,
                  })),
                },
              ] as const
            ).map(({ label, items }) => (
              <li
                key={label}
                className={`mobile-nav-has-children${openSubmenu === label ? ' is-open' : ''}`}
              >
                <button
                  className="mobile-nav-toggle"
                  aria-expanded={openSubmenu === label}
                  onClick={() => toggleSubmenu(label)}
                >
                  {label} <MobileNavArrow />
                </button>
                <ul className="mobile-nav-sub">
                  {items.map((item) => (
                    <li key={item.id}>
                      <Link href={item.href}>{item.title}</Link>
                    </li>
                  ))}
                </ul>
              </li>
            ))}

            <li>
              <Link href="/contact">Contact</Link>
            </li>
            {actiePages.length > 0 && (
              <>
                <li className="mobile-nav-divider" />
                {actiePages.map((page) => (
                  <li key={page.id}>
                    <Link href={`/${page.section}/${page.slug}`}>{page.title}</Link>
                  </li>
                ))}
              </>
            )}
            <li>
              <a
                href="https://clubs.deventrade.com/nl/svv-04/clubcollectie"
                className="mobile-nav-cta"
                target="_blank"
                rel="noopener noreferrer"
              >
                Webshop
              </a>
            </li>
          </ul>
        </div>
      </nav>
      {!assistant.enabled && (
        <SearchModal
          open={searchOpen}
          onClose={() => setSearchOpen(false)}
          actiePages={actiePages}
        />
      )}
      <BreadcrumbBar />
    </header>
  )
}
