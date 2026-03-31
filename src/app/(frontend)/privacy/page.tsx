import React from 'react'
import Link from 'next/link'

export const metadata = { title: "Privacyverklaring — SVV'04 Schoonebeek" }

export default function PrivacyPage() {
  return (
    <main className="static-page">

      <nav className="team-breadcrumb" aria-label="Kruimelpad">
        <div className="team-page-inner">
          <Link href="/">Home</Link>
          <span aria-hidden="true">›</span>
          <span>Privacyverklaring</span>
        </div>
      </nav>

      <div className="static-page-inner">
        <h1 className="programma-title">Privacyverklaring</h1>

        <div className="static-page-body">
          <p>
            SVV&rsquo;04, gevestigd aan De Kampen 18, 7761 CK Schoonebeek, is verantwoordelijk voor de verwerking van persoonsgegevens zoals weergegeven in deze privacyverklaring. Vragen kunnen worden gericht aan <a href="mailto:secretaris@svv04.nl">secretaris@svv04.nl</a>.
          </p>

          <h2>Verwerking van persoonsgegevens</h2>
          <p>SVV&rsquo;04 verwerkt persoonsgegevens voor de volgende doeleinden:</p>

          <h3>Ledenadministratie</h3>
          <ul>
            <li><strong>Gegevens:</strong> Naam, adres, geboortedatum, telefoonnummer, e-mailadres</li>
            <li><strong>Grondslag:</strong> Uitvoering van de overeenkomst (lidmaatschap)</li>
            <li><strong>Bewaartermijn:</strong> Duur van het lidmaatschap plus 2 jaar; financiële gegevens 7 jaar</li>
            <li><strong>Ontvangers:</strong> Administratief medewerkers, penningmeester, secretaris</li>
          </ul>

          <h3>Digitale communicatie</h3>
          <ul>
            <li><strong>Gegevens:</strong> Naam, e-mailadres</li>
            <li><strong>Grondslag:</strong> Uitvoering van de overeenkomst</li>
            <li><strong>Bewaartermijn:</strong> Zolang als men aangemeld is</li>
            <li><strong>Ontvangers:</strong> Administratie, wedstrijdsecretariaat, jeugdafdeling en materiaalbeheer</li>
          </ul>

          <h2>Cookies en technologie</h2>
          <p>
            De website maakt gebruik van cookies om de gebruikerservaring te verbeteren, waaronder het onthouden van voorkeuren en het bijhouden van gebruiksstatistieken. Sommige cookies vereisen expliciete toestemming; functionele en analytische cookies niet op grond van geldende regelgeving. Gebruikers kunnen cookie-instellingen aanpassen via de browserinstellingen.
          </p>

          <h2>Delen van gegevens met derden</h2>
          <p>
            Persoonsgegevens worden alleen gedeeld met derden wanneer dit noodzakelijk is voor de uitvoering van de overeenkomst of wanneer wij daartoe wettelijk verplicht zijn.
          </p>

          <h2>Uw rechten</h2>
          <p>
            U heeft het recht om uw persoonsgegevens in te zien, te corrigeren of te verwijderen. SVV&rsquo;04 zal verwijderverzoeken doorsturen naar alle partijen die de betreffende gegevens hebben ontvangen. U kunt uw verzoek richten aan <a href="mailto:secretaris@svv04.nl">secretaris@svv04.nl</a>.
          </p>

          <h2>Beveiliging</h2>
          <p>
            SVV&rsquo;04 neemt passende technische en organisatorische maatregelen om uw persoonsgegevens te beschermen, waaronder beperkte toegang, beveiligde systemen en regelmatige beveiligingscontroles.
          </p>

          <h2>Foto&rsquo;s en sociale media</h2>
          <p>
            Op sociale kanalen worden foto&rsquo;s geplaatst met gepaste inhoud. Leden of ouders/verzorgers van minderjarigen kunnen een uitzondering aanvragen door contact op te nemen met de secretaris.
          </p>

          <h2>Minderjarigen</h2>
          <p>
            Voor de inschrijving van minderjarigen is expliciete toestemming van een ouder of wettelijk voogd vereist.
          </p>

          <h2>Wijzigingen</h2>
          <p>
            Deze privacyverklaring kan periodiek worden bijgewerkt. De meest actuele versie is altijd te vinden op deze pagina.
          </p>

          <h2>Contact en klachten</h2>
          <p>
            Voor vragen over deze privacyverklaring kunt u terecht bij onze <Link href="/contact">contactpagina</Link> of via <a href="mailto:secretaris@svv04.nl">secretaris@svv04.nl</a>, telefoon 06-12976201.
          </p>
          <p>
            Bent u van mening dat SVV&rsquo;04 uw persoonsgegevens niet op de juiste manier verwerkt? Dan heeft u het recht om een klacht in te dienen bij de <a href="https://www.autoriteitpersoonsgegevens.nl" target="_blank" rel="noopener noreferrer">Autoriteit Persoonsgegevens</a>.
          </p>
        </div>
      </div>
    </main>
  )
}
