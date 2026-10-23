/**
 * Seed script: creates vereniging pages in Payload CMS.
 * Run with: pnpm seed:pages
 */

import { getPayload } from 'payload'
import config from '@payload-config'

// Build a minimal Lexical rich-text document from an array of paragraph strings.
function richText(paragraphs: string[]) {
  return {
    root: {
      type: 'root',
      format: '' as const,
      indent: 0,
      version: 1,
      direction: 'ltr' as const,
      children: paragraphs.map((text) => ({
        type: 'paragraph',
        format: '' as const,
        indent: 0,
        version: 1,
        direction: 'ltr' as const,
        children: [
          {
            type: 'text',
            detail: 0,
            format: 0,
            mode: 'normal' as const,
            style: '',
            text,
            version: 1,
          },
        ],
      })),
    },
  }
}

const PAGES = [
  // ── Vereniging ───────────────────────────────────────────────────────────────
  {
    section: 'vereniging',
    slug: 'algemeen',
    title: 'Algemeen',
    content: richText([
      "SVV'04 Schoonebeek is de voetbalvereniging van Schoonebeek, opgericht in 2004. De club is ontstaan uit een fusie van de zaterdagvereniging v.v. Minjak en de zondagvereniging Sc. Oranje. Daarvoor werkten die twee al samen in de jeugdcombinatie Oranje-Minjak, in de bekende rood-wit-blauw gestreepte shirts.",
      "SVV'04 is de enige voetbalvereniging in het dorp. De club speelt haar thuiswedstrijden op Sportpark De Kampen, een moderne accommodatie die een groot aantal vrijwilligers heeft gerealiseerd.",
      'Wij staan voor goed voetbal, maar ook voor gezelligheid, respect en een veilige sportomgeving voor iedereen.',
    ]),
  },
  {
    section: 'vereniging',
    slug: 'bestuur',
    title: 'Bestuur',
    content: richText([
      "Het bestuur van SVV'04 bestaat uit een groep vrijwilligers die zich dagelijks inzet voor de vereniging. Zij zijn verantwoordelijk voor de algemene leiding en het beleid van de club.",
      'Het bestuur vergadert maandelijks en is aanspreekbaar via secretaris@svv04.nl. Tijdens de jaarlijkse ledenvergadering legt het bestuur verantwoording af aan de leden.',
      'Wil je meer weten of heb je interesse om mee te besturen? Neem dan gerust contact met ons op.',
    ]),
  },
  {
    section: 'vereniging',
    slug: 'historie',
    title: 'Historie',
    content: richText([
      "SVV'04 werd opgericht in 1904 en is daarmee een van de oudste voetbalverenigingen in Drenthe. Door de jaren heen heeft de club veel successen geboekt en talloze spelers en trainers voortgebracht.",
      'In de beginjaren werd er gespeeld op een weiland aan de rand van het dorp. In de jaren zestig verhuisde de club naar het huidige sportpark aan De Kampen, dat sindsdien meerdere keren is uitgebreid en gerenoveerd.',
      'De club heeft diverse kampioenschappen gewonnen op regionaal niveau en heeft altijd een sterke band gehad met de gemeenschap van Schoonebeek.',
    ]),
  },
  {
    section: 'vereniging',
    slug: 'sportpark',
    title: 'Sportpark',
    content: richText([
      "Sportpark De Kampen ligt aan De Kampen 18 te Schoonebeek en is de thuisbasis van SVV'04. Het park beschikt over drie natuurgrasvelden en één kunstgrasveld.",
      'In het clubgebouw bevinden zich kleedkamers, een kantine en vergaderruimtes. De kantine is tijdens thuiswedstrijden en trainingen geopend voor leden en bezoekers.',
      'Parkeren is mogelijk op het ruime parkeerterrein naast het clubgebouw. Het sportpark is goed bereikbaar via de N376 vanuit Coevorden en Emmen.',
    ]),
  },
  {
    section: 'vereniging',
    slug: 'clubblad',
    title: 'Clubblad',
    content: richText([
      "Het clubblad van SVV'04 verschijnt meerdere keren per seizoen en staat vol met nieuws, interviews, wedstrijdverslagen en informatie over de vereniging.",
      'Het clubblad wordt verspreid onder alle leden en is ook digitaal beschikbaar via de website. Wil je een artikel aanleveren of adverteren in het clubblad? Neem dan contact op via communicatie@svv04.nl.',
      'Eerdere edities zijn terug te vinden in het archief op onze website.',
    ]),
  },
  {
    section: 'vereniging',
    slug: 'lidmaatschap',
    title: 'Lidmaatschap',
    content: richText([
      "Lid worden van SVV'04 kan het hele jaar door. De contributie wordt jaarlijks vastgesteld door het bestuur en is afhankelijk van leeftijd en speelcategorie.",
      'Aanmelden kan via het aanmeldformulier op onze website of door langs te komen bij de club. Voor vragen over lidmaatschap en contributie kun je terecht bij de ledenadministratie via secretaris@svv04.nl.',
      'Als lid profiteer je van trainingen, wedstrijden, gezelligheid en diverse clubactiviteiten gedurende het hele seizoen.',
    ]),
  },
  {
    section: 'vereniging',
    slug: 'clubkleding',
    title: 'Clubkleding',
    content: richText([
      "De officiële clubkleding van SVV'04 is verkrijgbaar via onze webshop bij Deventrade. Het tenue bestaat uit een rood-wit shirt, witte broek en rode kousen.",
      "Naast het wedstrijdtenue zijn er ook trainingsshirts, jassen, sjaals en andere clubartikelen beschikbaar. Zo kun je altijd trots de kleuren van SVV'04 dragen.",
      'Bezoek onze webshop via de knop bovenaan de pagina of neem contact op met de kledingcommissie voor meer informatie.',
    ]),
  },
  {
    section: 'vereniging',
    slug: 'vrijwilligers',
    title: 'Vrijwilligers',
    content: richText([
      "SVV'04 draait volledig op vrijwilligers. Van trainers en scheidsrechters tot kantine-medewerkers en terreinverzorgers — zonder onze vrijwilligers bestaat de club niet.",
      'Ben jij iemand die graag een bijdrage levert aan onze vereniging? We zijn altijd op zoek naar enthousiaste mensen die ons willen helpen, ook als je geen voetbalachtergrond hebt.',
      'Meld je aan via het contactformulier of spreek een van onze bestuursleden aan op het sportpark.',
    ]),
  },
  {
    section: 'vereniging',
    slug: 'jeugdafdeling',
    title: 'Jeugdafdeling',
    content: richText([
      "De jeugdafdeling van SVV'04 biedt kinderen van alle leeftijden de mogelijkheid om te voetballen in een plezierige en veilige omgeving. Van de F-pupillen tot aan de A-junioren.",
      'Onze jeugdtrainers zijn gecertificeerd en werken met leeftijdsspecifieke trainingsmethoden. Naast technische ontwikkeling staat ook plezier en teamgeest centraal.',
      'Voor aanmelding of meer informatie over de jeugdafdeling kun je contact opnemen via jeugd@svv04.nl.',
    ]),
  },
  {
    section: 'vereniging',
    slug: 'sponsoren',
    title: 'Sponsoren',
    content: richText([
      "SVV'04 is mede mogelijk gemaakt door de steun van onze trouwe sponsors. Wij zijn dankbaar voor hun bijdrage aan onze vereniging en hopen op een langdurige samenwerking.",
      "Bent u geïnteresseerd in het sponsoren van SVV'04? Er zijn diverse sponsormogelijkheden, van shirtreclame tot bordsponsor en activiteitensponsoring. Neem contact op via sponsor@svv04.nl voor meer informatie.",
      'Een overzicht van onze huidige sponsors is te vinden op de homepage van onze website.',
    ]),
  },

  {
    section: 'vereniging',
    slug: 'vertrouwenspersoon',
    title: 'Vertrouwenspersoon',
    content: richText([
      "SVV'04 vindt een veilige sportomgeving voor iedereen belangrijk. Onze vertrouwenspersoon is het eerste aanspreekpunt bij ongewenst gedrag, pesten, discriminatie of andere problemen binnen de vereniging.",
      'Je kunt in vertrouwen contact opnemen via vertrouwenspersoon@svv04.nl. Alle gesprekken zijn strikt vertrouwelijk. De vertrouwenspersoon is ook bereikbaar via het secretariaat.',
    ]),
  },
]

async function main() {
  const payload = await getPayload({ config })

  console.log(`Seeding ${PAGES.length} pages…`)

  for (const page of PAGES) {
    const { docs } = await payload.find({
      collection: 'pages',
      where: {
        section: { equals: page.section },
        slug: { equals: page.slug },
      },
      limit: 1,
    })

    if (docs.length > 0) {
      console.log(`  skip  ${page.section}/${page.slug} (already exists)`)
      continue
    }

    await payload.create({
      collection: 'pages',
      data: {
        title: page.title,
        section: page.section as 'vereniging',
        slug: page.slug,
        content: page.content,
      },
    })

    console.log(`  created ${page.section}/${page.slug}`)
  }

  console.log('Done.')
  process.exit(0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
