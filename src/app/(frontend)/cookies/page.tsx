import React from 'react'
import Link from 'next/link'

export const metadata = { title: "Cookiebeleid — SVV'04 Schoonebeek" }

export default function CookiesPage() {
  return (
    <main className="static-page">

      <nav className="team-breadcrumb" aria-label="Kruimelpad">
        <div className="team-page-inner">
          <Link href="/">Home</Link>
          <span aria-hidden="true">›</span>
          <span>Cookiebeleid</span>
        </div>
      </nav>

      <div className="static-page-inner">
        <h1 className="programma-title">Cookiebeleid</h1>
        <p className="static-page-date">Laatst bijgewerkt: januari 2025</p>

        <div className="static-page-body">
          <p>
            SVV&rsquo;04 Schoonebeek maakt gebruik van cookies op deze website. In dit cookiebeleid leggen wij uit wat cookies zijn, welke cookies wij gebruiken en waarom.
          </p>

          <h2>Wat zijn cookies?</h2>
          <p>
            Cookies zijn kleine tekstbestanden die door een website op uw apparaat worden opgeslagen wanneer u de website bezoekt. Ze worden gebruikt om de werking van de website te verbeteren en om informatie bij te houden over uw bezoek.
          </p>

          <h2>Welke cookies gebruiken wij?</h2>

          <h3>Functionele cookies</h3>
          <p>
            Deze cookies zijn noodzakelijk voor het correct functioneren van de website. Ze onthouden bijvoorbeeld uw voorkeuren en zorgen ervoor dat u niet steeds opnieuw hoeft in te loggen. Zonder deze cookies werkt de website niet goed.
          </p>

          <h3>Analytische cookies</h3>
          <p>
            Wij kunnen analytische cookies gebruiken om bij te houden hoe bezoekers de website gebruiken. Deze informatie helpt ons de website te verbeteren. De gegevens worden anoniem verzameld en niet gedeeld met derden.
          </p>

          <h2>Cookies van derden</h2>
          <p>
            Onze website kan links bevatten naar externe diensten (zoals sociale media). Deze partijen kunnen hun eigen cookies plaatsen. Wij hebben geen invloed op het cookiebeleid van deze externe partijen. Raadpleeg hun privacybeleid voor meer informatie.
          </p>

          <h2>Cookies beheren of verwijderen</h2>
          <p>
            U kunt cookies beheren of verwijderen via de instellingen van uw browser. Houd er rekening mee dat het uitschakelen van cookies de functionaliteit van de website kan beïnvloeden.
          </p>
          <p>Meer informatie over het beheren van cookies vindt u op de website van uw browser:</p>
          <ul>
            <li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer">Google Chrome</a></li>
            <li><a href="https://support.mozilla.org/nl/kb/cookies-verwijderen-gegevens-wissen-websites-opgeslagen" target="_blank" rel="noopener noreferrer">Mozilla Firefox</a></li>
            <li><a href="https://support.apple.com/nl-nl/guide/safari/sfri11471/mac" target="_blank" rel="noopener noreferrer">Apple Safari</a></li>
          </ul>

          <h2>Contact</h2>
          <p>
            Heeft u vragen over ons cookiebeleid? Neem dan contact op via <Link href="/contact">onze contactpagina</Link> of stuur een e-mail naar <a href="mailto:secretaris@svv04.nl">secretaris@svv04.nl</a>.
          </p>
        </div>
      </div>
    </main>
  )
}
