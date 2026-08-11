/**
 * Seed script: creates the "Voor jou" audience landing pages in Payload CMS.
 * Idempotent — skips an audience if its slug already exists.
 *
 * Local (dev branch):  pnpm seed:audiences
 * Production:          run with --env-file=.env.production (see package.json)
 *
 * Note: `body`, `metaTitle` and `metaDescription` are intentionally left empty
 * so the editors can fill in rich, unique SEO content per page later.
 */

import { getPayload } from 'payload'
import config from '@payload-config'

type AudienceSeed = {
  name: string
  slug: string
  order: number
  cardTitle: string
  cardDescription: string
  intro: string
  links: { title: string; description: string; href: string }[]
  cta: { enabled: boolean; title: string; text: string; buttonLabel: string; buttonUrl: string }
}

const AUDIENCES: AudienceSeed[] = [
  {
    name: 'spelers',
    slug: 'spelers',
    order: 1,
    cardTitle: 'Speler',
    cardDescription: 'Trainingstijden, teamindeling, programma en alles wat je op het veld nodig hebt.',
    intro:
      "Alles wat je als speler van SVV'04 nodig hebt: van je trainingstijden en teamindeling tot het wedstrijdprogramma en de clubregels. Vind snel je weg.",
    links: [
      { title: 'Programma & uitslagen', description: 'Bekijk wanneer en waar je speelt.', href: '/programma' },
      { title: 'Teams', description: 'Vind jouw team en teamgenoten.', href: '/senioren' },
      { title: 'Trainingstijden', description: "De actuele trainingsschema's per team.", href: '/vereniging/trainingstijden' },
      { title: 'Agenda', description: 'Toernooien, activiteiten en clubevenementen.', href: '/agenda' },
      { title: 'Nieuws', description: 'Blijf op de hoogte van het laatste clubnieuws.', href: '/nieuws' },
      { title: 'Contact', description: 'Vragen? Neem contact op met de club.', href: '/contact' },
    ],
    cta: {
      enabled: true,
      title: 'Nog geen lid?',
      text: "Kom voetballen bij SVV'04 — er is een plek voor iedereen.",
      buttonLabel: "Word lid van SVV'04",
      buttonUrl: '/meedoen/lid-worden',
    },
  },
  {
    name: 'ouders',
    slug: 'ouders',
    order: 2,
    cardTitle: 'Ouder',
    cardDescription: "Informatie over de jeugd, rijschema's, contributie en veiligheid.",
    intro:
      "Als ouder van een jeugdspeler wil je goed geïnformeerd zijn. Hier vind je alles over de jeugdafdeling, contributie, rijschema's en een veilig sportklimaat.",
    links: [
      { title: 'Jeugd', description: "Alles over de jeugdafdeling van SVV'04.", href: '/jeugd' },
      { title: 'Programma & uitslagen', description: 'Wanneer en waar speelt jouw kind?', href: '/programma' },
      { title: 'Contributie', description: 'Tarieven en betaling van de contributie.', href: '/vereniging/contributie' },
      { title: 'Veilig sportklimaat', description: 'Onze afspraken voor een veilige omgeving.', href: '/vereniging/veilig-sportklimaat' },
      { title: 'Agenda', description: 'Activiteiten en evenementen voor de jeugd.', href: '/agenda' },
      { title: 'Contact', description: 'Vragen? Neem contact op met de club.', href: '/contact' },
    ],
    cta: {
      enabled: true,
      title: 'Kind aanmelden?',
      text: 'Meld je zoon of dochter aan voor een gratis proeftraining.',
      buttonLabel: "Word lid van SVV'04",
      buttonUrl: '/meedoen/lid-worden',
    },
  },
  {
    name: 'trainers en leiders',
    slug: 'trainers-en-leiders',
    order: 3,
    cardTitle: 'Trainer / Leider',
    cardDescription: 'Materiaal, wedstrijdformulieren, cursussen en praktische ondersteuning.',
    intro:
      'Als trainer of leider maak je het verschil op en naast het veld. Hier vind je de praktische informatie en ondersteuning die je nodig hebt.',
    links: [
      { title: 'Programma & uitslagen', description: "Wedstrijdschema's en uitslagen doorgeven.", href: '/programma' },
      { title: 'Teams', description: 'Overzicht van alle teams en indelingen.', href: '/senioren' },
      { title: 'Trainingstijden', description: "Veldindeling en trainingsschema's.", href: '/vereniging/trainingstijden' },
      { title: 'Veilig sportklimaat', description: 'Gedragsregels en vertrouwenspersoon.', href: '/vereniging/veilig-sportklimaat' },
      { title: 'Contact', description: 'Vragen aan het bestuur of de commissie.', href: '/contact' },
    ],
    cta: {
      enabled: true,
      title: 'Wil je meehelpen?',
      text: 'We kunnen altijd extra trainers en leiders gebruiken.',
      buttonLabel: 'Word vrijwilliger',
      buttonUrl: '/meedoen/vrijwilliger-worden',
    },
  },
  {
    name: 'vrijwilligers',
    slug: 'vrijwilligers',
    order: 4,
    cardTitle: 'Vrijwilliger',
    cardDescription: 'Ontdek hoe je kunt bijdragen — van kantinedienst tot commissiewerk.',
    intro:
      "SVV'04 draait op vrijwilligers. Elk uur telt. Ontdek waar jij kunt bijdragen en hoe je je aanmeldt.",
    links: [
      { title: 'Vrijwilliger worden', description: 'Meld je aan en ontdek de mogelijkheden.', href: '/meedoen/vrijwilliger-worden' },
      { title: 'De vereniging', description: 'Leer de club en haar commissies kennen.', href: '/vereniging' },
      { title: 'Agenda', description: 'Activiteiten waar hulp welkom is.', href: '/agenda' },
      { title: 'Nieuws', description: 'Oproepen en nieuws voor vrijwilligers.', href: '/nieuws' },
      { title: 'Contact', description: 'Neem contact op met de vrijwilligerscoördinator.', href: '/contact' },
    ],
    cta: {
      enabled: true,
      title: 'Meld je aan',
      text: "Samen maken we SVV'04 nog mooier. Doe mee!",
      buttonLabel: 'Word vrijwilliger',
      buttonUrl: '/meedoen/vrijwilliger-worden',
    },
  },
  {
    name: 'sponsoren',
    slug: 'sponsoren',
    order: 5,
    cardTitle: 'Sponsor',
    cardDescription: 'Sponsormogelijkheden, pakketten en de voordelen van samenwerken.',
    intro:
      "Verbind jouw onderneming aan een bruisende club. Ontdek de sponsormogelijkheden van SVV'04 en wat we samen kunnen bereiken.",
    links: [
      { title: 'Sponsor worden', description: 'Bekijk de sponsormogelijkheden en pakketten.', href: '/meedoen/sponsor-worden' },
      { title: 'Onze sponsoren', description: "De bedrijven die SVV'04 steunen.", href: '/vereniging/sponsoren' },
      { title: 'De vereniging', description: 'Leer de club achter de sponsoring kennen.', href: '/vereniging' },
      { title: 'Contact', description: 'Neem contact op met de sponsorcommissie.', href: '/contact' },
    ],
    cta: {
      enabled: true,
      title: 'Interesse?',
      text: 'Neem contact op en ontdek wat we voor elkaar kunnen betekenen.',
      buttonLabel: 'Word sponsor',
      buttonUrl: '/meedoen/sponsor-worden',
    },
  },
]

async function main() {
  const payload = await getPayload({ config })

  console.log(`Seeding ${AUDIENCES.length} audiences…`)

  for (const audience of AUDIENCES) {
    const { docs } = await payload.find({
      collection: 'audiences',
      where: { slug: { equals: audience.slug } },
      limit: 1,
    })

    if (docs.length > 0) {
      console.log(`  skip    ${audience.slug} (already exists)`)
      continue
    }

    await payload.create({
      collection: 'audiences',
      data: {
        name: audience.name,
        slug: audience.slug,
        order: audience.order,
        showOnHome: true,
        cardTitle: audience.cardTitle,
        cardDescription: audience.cardDescription,
        intro: audience.intro,
        links: audience.links,
        cta: audience.cta,
      },
    })

    console.log(`  created ${audience.slug}`)
  }

  console.log('Done.')
  process.exit(0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
