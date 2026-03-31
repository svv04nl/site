/**
 * Updates lid-worden content and creates voetbal-nl-app page.
 * Run with: npx tsx src/scripts/update-pages.ts
 */

import { getPayload } from 'payload'
import config from '@payload-config'

function p(text: string) {
  return {
    type: 'paragraph',
    format: '' as const,
    indent: 0,
    version: 1,
    direction: 'ltr' as const,
    children: [{ type: 'text', detail: 0, format: 0, mode: 'normal' as const, style: '', text, version: 1 }],
  }
}

function h2(text: string) {
  return {
    type: 'heading',
    tag: 'h2',
    format: '' as const,
    indent: 0,
    version: 1,
    direction: 'ltr' as const,
    children: [{ type: 'text', detail: 0, format: 0, mode: 'normal' as const, style: '', text, version: 1 }],
  }
}

function richText(nodes: ReturnType<typeof p | typeof h2>[]) {
  return { root: { type: 'root', format: '' as const, indent: 0, version: 1, direction: 'ltr' as const, children: nodes } }
}

async function main() {
  const payload = await getPayload({ config })

  // Update lid-worden
  const { docs: lidWorden } = await payload.find({
    collection: 'pages',
    where: { section: { equals: 'meedoen' }, slug: { equals: 'lid-worden' } },
    limit: 1,
  })

  if (lidWorden[0]) {
    await payload.update({
      collection: 'pages',
      id: lidWorden[0].id,
      data: {
        ctaBlock: {
          enabled: true,
          buttonLabel: 'Inschrijven',
          buttonUrl: 'https://www.knvb.nl/ontdek-voetbal/inschrijven/GKWH14N',
        },
        content: richText([
          p("Wil je deel uitmaken van een gepassioneerde sportgemeenschap en je voetbaltalent verder ontwikkelen? Sluit je aan bij SVV'04, waar teamgeest en sportiviteit hoog in het vaandel staan. Samen bouwen we aan een sterke en gezellige voetbalclub."),
          h2('Digitaal aanmelden'),
          p("Digitaal inschrijven bij SVV'04 kan via de KNVB-website. Klik op onderstaande link om het digitale aanmeldingsformulier te openen."),
          p('→ Aanmelden via KNVB (mijn.knvb.nl)'),
          h2('Contributie'),
          p('De contributie wordt per seizoen vastgesteld en verschilt per categorie (senioren, jeugd, recreanten). Voor de actuele tarieven kun je contact opnemen met de ledenadministratie.'),
          h2('Contact ledenadministratie'),
          p("Heb je vragen over het lidmaatschap of de aanmelding? Neem dan contact op met onze ledenadministratie via ledenadmin@svv04.nl."),
        ]),
      },
    })
    console.log('Updated: actie/lid-worden')
  }

  // Create voetbal-nl-app (skip if exists)
  const { docs: existing } = await payload.find({
    collection: 'pages',
    where: { section: { equals: 'vereniging' }, slug: { equals: 'voetbal-nl-app' } },
    limit: 1,
  })

  if (existing.length === 0) {
    await payload.create({
      collection: 'pages',
      data: {
        title: 'Voetbal.nl app',
        section: 'vereniging',
        slug: 'voetbal-nl-app',
        content: richText([
          p("Met de officiële Voetbal.nl app van de KNVB blijf je altijd op de hoogte van de wedstrijden, standen en uitslagen van SVV'04 en alle andere clubs in Nederland."),
          h2('Wat is de Voetbal.nl app?'),
          p("Voetbal.nl is het officiële platform van de KNVB voor het Nederlandse amateurvoetbal. Via de app heb je direct toegang tot het programma, de stand en de uitslagen van alle teams van SVV'04."),
          h2('Downloaden'),
          p("De app is gratis te downloaden in de App Store (iPhone) en Google Play Store (Android). Zoek op 'Voetbal.nl' of scan de QR-code op de KNVB-website."),
          h2("SVV'04 instellen als favoriete club"),
          p('1. Open de Voetbal.nl app na het downloaden.'),
          p("2. Ga naar het tabblad 'Zoeken' of 'Clubs'."),
          p("3. Zoek op 'SVV04' of 'Schoonebeek'."),
          p("4. Klik op het ster-icoontje om SVV'04 als favoriet in te stellen."),
          p('5. Je ontvangt nu automatisch meldingen bij nieuwe uitslagen en wijzigingen in het programma.'),
          h2('Functies'),
          p('Via de Voetbal.nl app kun je:'),
          p('• Wedstrijduitslagen live volgen'),
          p('• De competitiestand bekijken'),
          p('• Het speelprogramma inzien'),
          p('• Afwezigheid doorgeven voor trainingen en wedstrijden'),
          p('• Clubnieuws en berichten van de trainer ontvangen'),
        ]),
      },
    })
    console.log('Created: vereniging/voetbal-nl-app')
  } else {
    console.log('Skip: vereniging/voetbal-nl-app (already exists)')
  }

  console.log('Done.')
  process.exit(0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
