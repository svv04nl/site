/**
 * Seed script: creates vereniging + commissies pages in Payload CMS.
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
      "SVV'04 Schoonebeek is een amateurvoetbalvereniging uit Schoonebeek, opgericht in 1904. De club heeft een rijke geschiedenis en is een begrip in de regio Emmen.",
      'Met ruim 400 leden, verdeeld over senioren- en jeugdteams, is SVV\'04 een van de grotere voetbalclubs in Drenthe. De club speelt haar thuiswedstrijden op Sportpark De Kampen.',
      'Wij staan voor goed voetbal, maar ook voor gezelligheid, respect en een veilige sportomgeving voor iedereen.',
    ]),
  },
  {
    section: 'vereniging',
    slug: 'bestuur',
    title: 'Bestuur',
    content: richText([
      'Het bestuur van SVV\'04 bestaat uit een groep vrijwilligers die zich dagelijks inzet voor de vereniging. Zij zijn verantwoordelijk voor de algemene leiding en het beleid van de club.',
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
      'Sportpark De Kampen ligt aan De Kampen 18 te Schoonebeek en is de thuisbasis van SVV\'04. Het park beschikt over drie natuurgrasvelden en één kunstgrasveld.',
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
      'Naast het wedstrijdtenue zijn er ook trainingsshirts, jassen, sjaals en andere clubartikelen beschikbaar. Zo kun je altijd trots de kleuren van SVV\'04 dragen.',
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
      'Bent u geïnteresseerd in het sponsoren van SVV\'04? Er zijn diverse sponsormogelijkheden, van shirtreclame tot bordsponsor en activiteitensponsoring. Neem contact op via sponsor@svv04.nl voor meer informatie.',
      'Een overzicht van onze huidige sponsors is te vinden op de homepage van onze website.',
    ]),
  },

  // ── Commissies ───────────────────────────────────────────────────────────────
  {
    section: 'commissies',
    slug: 'activiteitencommissie',
    title: 'Activiteitencommissie',
    content: richText([
      'De activiteitencommissie organiseert diverse evenementen voor de leden en de gemeenschap rondom SVV\'04. Denk aan het jaarlijkse zomertoernooi, de feestavond, de sinterklaasviering voor de jeugd en andere sociale activiteiten.',
      'De commissie bestaat uit een enthousiast team van vrijwilligers dat altijd op zoek is naar leuke ideeën en nieuwe leden. Heb je interesse? Stuur een mail naar activiteiten@svv04.nl.',
    ]),
  },
  {
    section: 'commissies',
    slug: 'kantinecommissie',
    title: 'Kantinecommissie',
    content: richText([
      'De kantinecommissie beheert de kantine van SVV\'04 en zorgt ervoor dat bezoekers en leden worden voorzien van drank en etenswaren tijdens thuiswedstrijden en trainingsavonden.',
      'De kantine is de sociale spil van de vereniging. De commissie werkt met een rooster van vrijwilligers en regelt de inkoop, het beheer en de schoonmaak. Voor vragen of om je aan te melden als vrijwilliger: kantine@svv04.nl.',
    ]),
  },
  {
    section: 'commissies',
    slug: 'toernooicommissie',
    title: 'Toernooicommissie',
    content: richText([
      "De toernooicommissie organiseert jaarlijks het bekende SVV'04-zomertoernooi, een van de grootste voetbalevenementen in de regio. Tientallen teams van binnen en buiten de gemeente nemen hieraan deel.",
      'Naast het zomertoernooi organiseert de commissie ook indoor toernooien en andere wedstrijdgerelateerde evenementen. Wil je meehelpen? Neem contact op via toernooi@svv04.nl.',
    ]),
  },
  {
    section: 'commissies',
    slug: 'commerciele-commissie',
    title: 'Commerciële commissie',
    content: richText([
      'De commerciële commissie is verantwoordelijk voor het werven en onderhouden van sponsorrelaties. Zij zorgen ervoor dat SVV\'04 financieel gezond blijft en voldoende middelen heeft voor accommodatie, materialen en activiteiten.',
      'Voor sponsorvoorstellen en samenwerkingen kun je terecht bij de commerciële commissie via sponsor@svv04.nl.',
    ]),
  },
  {
    section: 'commissies',
    slug: 'scheidsrechterscommissie',
    title: 'Scheidsrechterscommissie',
    content: richText([
      'De scheidsrechterscommissie van SVV\'04 is verantwoordelijk voor de opleiding, planning en begeleiding van onze clubscheidsrechters. Zij leiden wedstrijden op alle niveaus, van de jongste jeugd tot aan de senioren.',
      'Heb je interesse in het leiden van wedstrijden? De KNVB biedt regelmatig opleidingen aan. Neem contact op via scheidsrechters@svv04.nl voor meer informatie.',
    ]),
  },
  {
    section: 'commissies',
    slug: 'vertrouwenspersoon',
    title: 'Vertrouwenspersoon',
    content: richText([
      "SVV'04 vindt een veilige sportomgeving voor iedereen belangrijk. Onze vertrouwenspersoon is het eerste aanspreekpunt bij ongewenst gedrag, pesten, discriminatie of andere problemen binnen de vereniging.",
      'Je kunt in vertrouwen contact opnemen via vertrouwenspersoon@svv04.nl. Alle gesprekken zijn strikt vertrouwelijk. De vertrouwenspersoon is ook bereikbaar via het secretariaat.',
    ]),
  },
  {
    section: 'commissies',
    slug: 'technische-commissie',
    title: 'Technische Commissie',
    content: richText([
      'De Technische Commissie (TC) is verantwoordelijk voor het voetbaltechnische beleid van SVV\'04. De TC stelt trainers aan, begeleidt teams en werkt aan de doorontwikkeling van spelers van jeugd tot senioren.',
      'De commissie vergadert regelmatig met trainers en stafleden en legt verantwoording af aan het bestuur. Voor vragen over technisch beleid of trainersposities: tc@svv04.nl.',
    ]),
  },
  {
    section: 'commissies',
    slug: 'communicatie-commissie',
    title: 'Communicatie commissie',
    content: richText([
      'De communicatiecommissie beheert de website, sociale media en het clubblad van SVV\'04. Zij zorgen voor actuele en aantrekkelijke communicatie richting leden, supporters en de bredere gemeenschap.',
      'Heb je nieuws, een wedstrijdverslag of foto\'s voor ons? Stuur ze naar communicatie@svv04.nl. We zijn ook op zoek naar vrijwilligers die willen helpen met teksten, foto\'s of social media.',
    ]),
  },
  {
    section: 'commissies',
    slug: 'kleding-en-materiaal',
    title: 'Kleding & materiaal',
    content: richText([
      'De commissie Kleding & Materiaal beheert de clubkleding, ballen, trainingsmateriaal en andere benodigdheden voor alle teams van SVV\'04.',
      'Bij vragen over het bestellen van clubkleding, het uitwisselen van tenues of het aanvragen van materialen kun je terecht bij deze commissie via kleding@svv04.nl.',
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
        section: page.section as 'vereniging' | 'commissies',
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
