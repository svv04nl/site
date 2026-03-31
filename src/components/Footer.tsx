import React from 'react'
import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="site-footer">

      {/* Top: logo + tagline + social */}
      <div className="site-footer-top">
        <div className="site-footer-inner">
          <div className="site-footer-brand">
            <img src="/logo.png" alt="SVV'04" className="site-footer-brand-logo" />
            <div className="site-footer-brand-text">
              <strong className="site-footer-brand-name">SVV&rsquo;04 Schoonebeek</strong>
              <p className="site-footer-beschrijving">
                Meer dan Voetbal Alleen. Voetbalvereniging SVV&rsquo;04 uit Schoonebeek &mdash; voor jong en oud, van de jongste pupillen tot de veteranen.
              </p>
            </div>
          </div>
          <div className="site-footer-social">
            <a href="https://www.instagram.com/svv04_schoonebeek" className="site-footer-social-link" aria-label="Instagram" target="_blank" rel="noopener noreferrer">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
            </a>
            <a href="https://www.facebook.com/svv04" className="site-footer-social-link" aria-label="Facebook" target="_blank" rel="noopener noreferrer">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
            </a>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="site-footer-divider">
        <div className="site-footer-inner" />
      </div>

      {/* Nav columns */}
      <div className="site-footer-nav-section">
        <div className="site-footer-inner site-footer-nav-grid">

          <div className="site-footer-col">
            <h3 className="site-footer-col-title">Navigatie</h3>
            <ul className="site-footer-nav">
              <li><Link href="/nieuws">Nieuws</Link></li>
              <li><Link href="/agenda">Agenda</Link></li>
              <li><Link href="/programma">Programma</Link></li>
              <li><Link href="/contact">Contact</Link></li>
            </ul>
          </div>

          <div className="site-footer-col">
            <h3 className="site-footer-col-title">De club</h3>
            <ul className="site-footer-nav">
              <li><Link href="#">Lid worden</Link></li>
              <li><Link href="#">Vrijwilligers</Link></li>
              <li><Link href="#">Sponsoren</Link></li>
              <li><Link href="#">Webshop</Link></li>
            </ul>
          </div>

          <div className="site-footer-col site-footer-col--wide">
            <h3 className="site-footer-col-title">Vereniging</h3>
            <div className="site-footer-nav-double">
              <ul className="site-footer-nav">
                <li><Link href="#">Algemeen</Link></li>
                <li><Link href="#">Bestuur</Link></li>
                <li><Link href="#">Clubblad</Link></li>
                <li><Link href="#">Clubkleding</Link></li>
                <li><Link href="#">Gedragsregels</Link></li>
                <li><Link href="#">Historie</Link></li>
              </ul>
              <ul className="site-footer-nav">
                <li><Link href="#">Jeugdafdeling</Link></li>
                <li><Link href="#">Lidmaatschap</Link></li>
                <li><Link href="#">Sportpark</Link></li>
                <li><Link href="#">Vrijwilligers</Link></li>
              </ul>
            </div>
          </div>

          <div className="site-footer-col site-footer-col--wide">
            <h3 className="site-footer-col-title">Commissies</h3>
            <div className="site-footer-nav-double">
              <ul className="site-footer-nav">
                <li><Link href="#">Activiteiten</Link></li>
                <li><Link href="#">Commercieel</Link></li>
                <li><Link href="#">Communicatie</Link></li>
                <li><Link href="#">Kantine</Link></li>
                <li><Link href="#">Klaverjassen</Link></li>
                <li><Link href="#">Kleding &amp; materiaal</Link></li>
              </ul>
              <ul className="site-footer-nav">
                <li><Link href="#">Oud papier</Link></li>
                <li><Link href="#">Scheidsrechters</Link></li>
                <li><Link href="#">Technisch</Link></li>
                <li><Link href="#">Toernooi</Link></li>
                <li><Link href="#">Vertrouwenspersoon</Link></li>
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
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
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
