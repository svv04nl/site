/**
 * Seed script: creates or updates the "Voor jou" audience landing pages in Payload CMS.
 *
 * Local (dev branch):  pnpm seed:audiences
 * Production:          run with --env-file=.env.production (see package.json)
 *
 * For every audience this writes the hero buttons, theme blocks, FAQ, "Andere
 * vraag?" card, contact person and CTA. An existing audience is REPLACED for
 * those fields, so edits made in the admin to them are overwritten. Fields not
 * listed here (body, metaTitle, metaDescription, showOnHome) are left alone.
 *
 * The hero image (media filename "sportpark-hoofdveld") and the contact persons
 * (looked up by role slug) are resolved per database; when one is missing the
 * field is skipped and a warning is printed.
 *
 * FAQ answers come from the content of the club's own pages (lidmaatschap,
 * vrijwilligerswerk, voetbal-nl-app, clubkleding, ...). They are concept texts
 * for the club to review.
 */

import { getPayload } from 'payload'
import config from '@payload-config'

type Link = { title: string; description: string; href: string }
type AudienceSeed = {
  name: string
  slug: string
  order: number
  cardTitle: string
  cardDescription: string
  intro: string
  heroActions: { label: string; href: string }[]
  themes: { title: string; intro: string; links: Link[] }[]
  faq: {
    category: string
    question: string
    answer: string
    links: { label: string; href: string }[]
  }[]
  assistantIntro: string
  faqHelp: { title: string }
  contact: { roleSlug: string }
  cta: { title: string; text: string; buttonLabel: string; buttonUrl: string }
}

const HERO_IMAGE_FILENAME = 'sportpark-hoofdveld'

const AUDIENCES: AudienceSeed[] = [
  {
    name: 'spelers',
    slug: 'spelers',
    order: 1,
    cardTitle: 'Speler',
    cardDescription: 'Programma, teams, Voetbal.nl app en alles wat je op het veld nodig hebt.',
    intro:
      "Alles wat je als speler van SVV'04 nodig hebt, zoals het programma, je team en de clubafspraken. Vind snel je weg.",
    heroActions: [
      { label: 'Programma', href: '/programma' },
      { label: 'Teams', href: '/teams' },
      { label: 'Voetbal.nl app', href: '/vereniging/voetbal-nl-app' },
    ],
    themes: [
      {
        title: 'Spelen en trainen',
        intro: 'Wanneer en waar je speelt.',
        links: [
          { title: 'Programma & uitslagen', description: 'Wanneer en waar je speelt', href: '/programma' },
          { title: 'Teams', description: 'Vind je team en teamgenoten', href: '/teams' },
          { title: 'Voetbal.nl app', description: 'Je eigen speelschema en afwezigheid doorgeven', href: '/vereniging/voetbal-nl-app' },
          { title: 'Agenda', description: 'Toernooien en activiteiten', href: '/agenda' },
        ],
      },
      {
        title: 'Op de hoogte blijven',
        intro: 'Nieuws en berichten van de club.',
        links: [
          { title: 'Nieuws', description: 'Het laatste clubnieuws', href: '/nieuws' },
          { title: 'WhatsApp-community', description: 'Teamgroepen en clubmededelingen', href: '/vereniging/whatsapp-community' },
          { title: 'Agenda', description: 'Wat er de komende tijd gebeurt', href: '/agenda' },
        ],
      },
      {
        title: 'Kleding en afspraken',
        intro: 'Wat je nodig hebt en wat we van je verwachten.',
        links: [
          { title: 'Clubkleding', description: 'Wedstrijdtenue, webshop en bedrukken', href: '/vereniging/clubkleding' },
          { title: 'Vrijwilligerswerk', description: 'Taken voor spelende leden', href: '/vereniging/vrijwilligerswerk' },
          { title: 'Vertrouwenspersoon', description: 'Iets vertrouwelijk bespreken', href: '/commissies/vertrouwenspersoon' },
          { title: 'Lidmaatschap', description: 'Contributie en opzeggen', href: '/vereniging/lidmaatschap' },
        ],
      },
    ],
    faq: [
      {
        category: 'Wedstrijden',
        question: 'Waar zie ik wanneer ik speel?',
        answer:
          'Het programma staat op de website en in de Voetbal.nl app. In de app zie je ook je eigen speelschema.',
        links: [
          { label: 'Programma', href: '/programma' },
          { label: 'Voetbal.nl app', href: '/vereniging/voetbal-nl-app' },
        ],
      },
      {
        category: 'Wedstrijden',
        question: 'Hoe geef ik door dat ik er niet bij ben?',
        answer:
          'Afwezigheid voor trainingen en wedstrijden geef je door in de Voetbal.nl app. Doe dit zo vroeg mogelijk.',
        links: [{ label: 'Voetbal.nl app', href: '/vereniging/voetbal-nl-app' }],
      },
      {
        category: 'Wedstrijden',
        question: 'Mijn gegevens staan niet in de Voetbal.nl app. Wat nu?',
        answer:
          'Maak je account aan met het e-mailadres dat bij de club bekend is als lid. Lukt de koppeling niet, neem dan contact op met de ledenadministratie.',
        links: [
          { label: 'Voetbal.nl app', href: '/vereniging/voetbal-nl-app' },
          { label: 'Contact', href: '/contact' },
        ],
      },
      {
        category: 'Meedoen',
        question: 'Ik wil eerst een keer meetrainen. Kan dat?',
        answer:
          'Ja. Voordat je je aanmeldt, mag je een paar keer gratis meetrainen. Daarna kun je lid worden.',
        links: [{ label: 'Lid worden', href: '/vereniging/lidmaatschap' }],
      },
      {
        category: 'Meedoen',
        question: 'Moet ik iets doen voor de club?',
        answer:
          'Ja. Vrijwilligerswerk is verplicht voor spelende leden van 19 jaar en ouder. Je neemt minimaal één taak of functie op je, bijvoorbeeld een kantinedienst.',
        links: [
          { label: 'Vrijwilligerswerk', href: '/vereniging/vrijwilligerswerk' },
          { label: 'Alle taken', href: '/vereniging/vrijwilligerswerk/taken' },
        ],
      },
      {
        category: 'Kleding',
        question: 'Welke kleding heb ik nodig?',
        answer:
          'De tenues voor wedstrijden worden door de club geleverd. Overige clubkleding bestel je in de webshop of koop je bij Sluyters Sport in Coevorden. Bedrukken kan ook.',
        links: [{ label: 'Clubkleding', href: '/vereniging/clubkleding' }],
      },
      {
        category: 'Club',
        question: 'Hoe blijf ik op de hoogte van mijn team?',
        answer:
          'Via de WhatsApp-community van de club kies je zelf de teamgroep die je wilt volgen. De beheerder van die groep moet je aanvraag nog goedkeuren.',
        links: [{ label: 'WhatsApp-community', href: '/vereniging/whatsapp-community' }],
      },
      {
        category: 'Club',
        question: 'Bij wie kan ik terecht als er iets niet goed voelt?',
        answer:
          'Bij de vertrouwenspersoon van de club. Alle gesprekken zijn strikt vertrouwelijk.',
        links: [{ label: 'Vertrouwenspersoon', href: '/commissies/vertrouwenspersoon' }],
      },
    ],
    assistantIntro: 'Over wedstrijden, meedoen, kleding en de club: je krijgt meteen antwoord.',
    faqHelp: { title: 'Neem contact op' },
    contact: { roleSlug: 'voetbaltechnische-zaken' },
    cta: {
      title: 'Nog geen lid?',
      text: 'Je mag eerst gratis meetrainen.',
      buttonLabel: "Word lid van SVV'04",
      buttonUrl: '/vereniging/lidmaatschap',
    },
  },
  {
    name: 'ouders',
    slug: 'ouders',
    order: 2,
    cardTitle: 'Ouder',
    cardDescription: "Informatie over de jeugd, rijschema's, contributie en veiligheid.",
    intro:
      "Speelt je kind bij SVV'04? Op deze pagina vind je de informatie die je als ouder nodig hebt, zoals het programma, het rijschema, de contributie en de contactpersonen.",
    heroActions: [
      { label: 'Programma', href: '/programma' },
      { label: 'Voetbal.nl app', href: '/vereniging/voetbal-nl-app' },
      { label: 'WhatsApp-community', href: '/vereniging/whatsapp-community' },
    ],
    themes: [
      {
        title: 'Aan de slag',
        intro: 'Nieuw bij de club? Hier lees je hoe je begint.',
        links: [
          { title: 'Kind aanmelden', description: 'Proeftraining en inschrijving', href: '/vereniging/lidmaatschap' },
          { title: 'De jongste jeugd', description: 'Voetbal voor de allerkleinsten', href: '/vereniging/jongste-jeugd' },
          { title: 'Jeugdafdeling', description: 'Teams, leeftijden en indeling', href: '/teams' },
          { title: 'Clubkleding', description: 'Wat je kind nodig heeft', href: '/vereniging/clubkleding' },
        ],
      },
      {
        title: 'Op de wedstrijddag',
        intro: 'Wedstrijden, rijden en wassen.',
        links: [
          { title: 'Programma & uitslagen', description: 'Wanneer en waar je kind speelt', href: '/programma' },
          { title: 'Voetbal.nl app', description: 'Afmelden en wijzigingen', href: '/vereniging/voetbal-nl-app' },
          { title: 'Agenda', description: 'Toernooien en activiteiten', href: '/agenda' },
        ],
      },
      {
        title: 'Geld & afspraken',
        intro: 'Contributie en afspraken binnen de club.',
        links: [
          { title: 'Contributie', description: 'Tarieven en betaling', href: '/vereniging/lidmaatschap' },
          { title: 'Vertrouwenspersoon', description: 'Iets vertrouwelijk bespreken', href: '/commissies/vertrouwenspersoon' },
          { title: 'Meehelpen', description: 'Vrijwilligerswerk voor ouders', href: '/vereniging/vrijwilligerswerk' },
        ],
      },
    ],
    faq: [
      {
        category: 'Wedstrijden',
        question: 'Wanneer en waar speelt mijn kind?',
        answer:
          'Het programma staat op de website en in de Voetbal.nl app. In de app zie je ook wijzigingen en afgelastingen.',
        links: [
          { label: 'Programma', href: '/programma' },
          { label: 'Voetbal.nl app', href: '/vereniging/voetbal-nl-app' },
        ],
      },
      {
        category: 'Wedstrijden',
        question: 'Moet ik rijden naar uitwedstrijden?',
        answer:
          'Ouders rijden om de beurt. In het rijschema zie je wanneer je aan de beurt bent. Kun je niet, ruil dan met een andere ouder.',
        links: [],
      },
      {
        category: 'Wedstrijden',
        question: 'Hoe meld ik mijn kind af?',
        answer:
          'Afmelden doe je via de Voetbal.nl app of bij de leider van het team. Doe dit zo vroeg mogelijk.',
        links: [{ label: 'Voetbal.nl app', href: '/vereniging/voetbal-nl-app' }],
      },
      {
        category: 'Geld',
        question: 'Wat kost het lidmaatschap?',
        answer:
          'De contributie hangt af van de leeftijd van je kind. De betaling gaat via automatische incasso.',
        links: [{ label: 'Contributie', href: '/vereniging/lidmaatschap' }],
      },
      {
        category: 'Meedoen',
        question: 'Hoe kan mijn kind beginnen?',
        answer:
          'Je kind mag eerst een paar keer gratis meetrainen. Daarna kun je je kind inschrijven.',
        links: [
          { label: 'Lid worden', href: '/vereniging/lidmaatschap' },
          { label: 'De jongste jeugd', href: '/vereniging/jongste-jeugd' },
        ],
      },
      {
        category: 'Meedoen',
        question: 'Welke kleding heeft mijn kind nodig?',
        answer:
          'Een zwart-wit gestreept shirt, een zwarte broek en zwart-witte kousen. Leden krijgen korting in de clubwebshop.',
        links: [{ label: 'Clubkleding', href: '/vereniging/clubkleding' }],
      },
      {
        category: 'Veiligheid',
        question: 'Bij wie kan ik terecht als er iets niet goed voelt?',
        answer:
          'Je kunt contact opnemen met de vertrouwenspersoon van de club. Het gesprek blijft vertrouwelijk.',
        links: [{ label: 'Vertrouwenspersoon', href: '/commissies/vertrouwenspersoon' }],
      },
      {
        category: 'Meedoen',
        question: 'Kan ik als ouder iets doen voor de club?',
        answer: 'Ja. Je kunt bijvoorbeeld een kantinedienst draaien of leider of trainer worden.',
        links: [{ label: 'Vrijwilligerswerk', href: '/vereniging/vrijwilligerswerk' }],
      },
    ],
    assistantIntro: 'Over wedstrijden, kosten, meedoen en veiligheid: je krijgt meteen antwoord.',
    faqHelp: { title: 'Neem contact op' },
    contact: { roleSlug: 'coordinator-jeugd' },
    cta: {
      title: 'Kind aanmelden?',
      text: 'Je kind mag eerst gratis meetrainen.',
      buttonLabel: "Word lid van SVV'04",
      buttonUrl: '/vereniging/lidmaatschap',
    },
  },
  {
    name: 'trainers en leiders',
    slug: 'trainers-leiders',
    order: 3,
    cardTitle: 'Trainer / Leider',
    cardDescription: 'Teams, materiaal, Voetbal.nl app en praktische ondersteuning.',
    intro:
      'Als trainer of leider maak je het verschil op en naast het veld. Hier vind je de praktische informatie en ondersteuning die je nodig hebt.',
    heroActions: [
      { label: 'Programma', href: '/programma' },
      { label: 'Teams', href: '/teams' },
      { label: 'Voetbal.nl app', href: '/vereniging/voetbal-nl-app' },
    ],
    themes: [
      {
        title: 'Training en wedstrijd',
        intro: 'Alles voor de week van je team.',
        links: [
          { title: 'Programma & uitslagen', description: 'De wedstrijden van jouw team', href: '/programma' },
          { title: 'Teams', description: 'Overzicht van alle teams', href: '/teams' },
          { title: 'Voetbal.nl app', description: 'Aanwezigheid van je spelers en berichten aan je team', href: '/vereniging/voetbal-nl-app' },
          { title: 'Agenda', description: 'Toernooien en activiteiten', href: '/agenda' },
        ],
      },
      {
        title: 'Materiaal en ondersteuning',
        intro: 'Waar je terecht kunt voor kleding, ballen en begeleiding.',
        links: [
          { title: 'Clubkleding', description: 'Tenues en presentatiekleding', href: '/vereniging/clubkleding' },
          { title: 'Kleding & materiaal', description: 'Ballen en trainingsmateriaal aanvragen', href: '/commissies/kleding-en-materiaal' },
          { title: 'Technische Commissie', description: 'Voetbaltechnisch beleid en trainers', href: '/commissies/technische-commissie' },
        ],
      },
      {
        title: 'Afspraken en hulp',
        intro: 'Als je er niet uitkomt of hulp nodig hebt.',
        links: [
          { title: 'Vertrouwenspersoon', description: 'Iets vertrouwelijk bespreken', href: '/commissies/vertrouwenspersoon' },
          { title: 'WhatsApp-community', description: 'Teamgroep en oudergroep', href: '/vereniging/whatsapp-community' },
          { title: 'Scheidsrechterscommissie', description: 'Opleiding en begeleiding van scheidsrechters', href: '/commissies/scheidsrechterscommissie' },
          { title: 'Vrijwilligerswerk', description: 'Taken en functies binnen de club', href: '/vereniging/vrijwilligerswerk' },
        ],
      },
    ],
    faq: [
      {
        category: 'Team',
        question: 'Hoe zie ik wie er naar de training komt?',
        answer:
          'Spelers geven hun aanwezigheid voor training en wedstrijd door in de Voetbal.nl app. Via dezelfde app ontvangen ze ook berichten van de trainer.',
        links: [{ label: 'Voetbal.nl app', href: '/vereniging/voetbal-nl-app' }],
      },
      {
        category: 'Team',
        question: 'Waar vind ik het programma van mijn team?',
        answer: 'Op de website en in de Voetbal.nl app.',
        links: [
          { label: 'Programma', href: '/programma' },
          { label: 'Teams', href: '/teams' },
        ],
      },
      {
        category: 'Team',
        question: 'Hoe communiceer ik met de ouders van mijn team?',
        answer:
          'Via de WhatsApp-community van de club. Elk team heeft een teamgroep en voor de jeugd is er ook een aparte oudergroep.',
        links: [{ label: 'WhatsApp-community', href: '/vereniging/whatsapp-community' }],
      },
      {
        category: 'Materiaal',
        question: 'Waar vraag ik ballen en trainingsmateriaal aan?',
        answer:
          'Bij de commissie Kleding & Materiaal. Je bereikt hen via kleding@svv04.nl.',
        links: [{ label: 'Kleding & materiaal', href: '/commissies/kleding-en-materiaal' }],
      },
      {
        category: 'Materiaal',
        question: 'Kan ik voor mijn team zelf extra kleding regelen?',
        answer:
          'Dat mag, maar overleg het altijd eerst met materiaalbeheer. De club koopt in met korting en houdt vaste kledinglijnen aan, zodat de uitstraling van de club uniform blijft.',
        links: [{ label: 'Clubkleding', href: '/vereniging/clubkleding' }],
      },
      {
        category: 'Afspraken',
        question: 'Wie stelt trainers aan en begeleidt ze?',
        answer:
          'De Technische Commissie. Zij stelt trainers aan, begeleidt teams en werkt aan de ontwikkeling van spelers. Vragen kun je mailen naar tc@svv04.nl.',
        links: [{ label: 'Technische Commissie', href: '/commissies/technische-commissie' }],
      },
      {
        category: 'Afspraken',
        question: 'Wat doe ik bij een probleem in het team, zoals pesten?',
        answer:
          'Neem contact op met de vertrouwenspersoon van de club. Alle gesprekken zijn strikt vertrouwelijk.',
        links: [{ label: 'Vertrouwenspersoon', href: '/commissies/vertrouwenspersoon' }],
      },
      {
        category: 'Afspraken',
        question: 'Ik wil wedstrijden gaan fluiten. Hoe pak ik dat aan?',
        answer:
          'De KNVB biedt regelmatig opleidingen aan. Neem contact op met de scheidsrechterscommissie via scheidsrechters@svv04.nl voor meer informatie.',
        links: [
          { label: 'Scheidsrechterscommissie', href: '/commissies/scheidsrechterscommissie' },
        ],
      },
    ],
    assistantIntro: 'Over je team, materiaal en afspraken: je krijgt meteen antwoord.',
    faqHelp: { title: 'Neem contact op' },
    contact: { roleSlug: 'voetbaltechnische-zaken' },
    cta: {
      title: 'Wil je meehelpen?',
      text: 'We kunnen altijd extra trainers en leiders gebruiken.',
      buttonLabel: 'Word vrijwilliger',
      buttonUrl: '/vereniging/vrijwilligerswerk',
    },
  },
  {
    name: 'vrijwilligers',
    slug: 'vrijwilligers',
    order: 4,
    cardTitle: 'Vrijwilliger',
    cardDescription: 'Ontdek hoe je kunt bijdragen, van kantinedienst tot commissiewerk.',
    intro:
      "SVV'04 draait op vrijwilligers. Elk uur telt. Ontdek waar jij kunt bijdragen en hoe je je aanmeldt.",
    heroActions: [
      { label: 'Taken en functies', href: '/vereniging/vrijwilligerswerk/taken' },
      { label: 'Vrijwilligersbeleid', href: '/vereniging/vrijwilligerswerk' },
    ],
    themes: [
      {
        title: 'Aan de slag',
        intro: 'Kijk wat er te doen is en hoe het werkt.',
        links: [
          { title: 'Taken en functies', description: 'Alle taken met omschrijving en tijdsbesteding', href: '/vereniging/vrijwilligerswerk/taken' },
          { title: 'Vrijwilligersbeleid', description: 'Regels, vrijstelling en verzekering', href: '/vereniging/vrijwilligerswerk' },
          { title: 'Lidmaatschap', description: 'Bij je aanmelding kies je je taken', href: '/vereniging/lidmaatschap' },
        ],
      },
      {
        title: 'Commissies',
        intro: 'Een vaste plek binnen de club.',
        links: [
          { title: 'Kantinecommissie', description: 'Kantinediensten en beheer', href: '/commissies/kantinecommissie' },
          { title: 'Activiteitencommissie', description: 'Feestavond, sinterklaasviering en meer', href: '/commissies/activiteitencommissie' },
          { title: 'Communicatiecommissie', description: 'Website, social media en clubblad', href: '/commissies/communicatie-commissie' },
        ],
      },
      {
        title: 'Meer weten',
        intro: 'Interesse in een grotere rol of een vraag vooraf?',
        links: [
          { title: 'Bestuur', description: 'Interesse om mee te besturen', href: '/vereniging/bestuur' },
          { title: 'Technische Commissie', description: 'Trainers en voetbaltechnisch werk', href: '/commissies/technische-commissie' },
          { title: 'Scheidsrechterscommissie', description: 'Wedstrijden leiden', href: '/commissies/scheidsrechterscommissie' },
          { title: 'Contact', description: 'Vragen aan de vrijwilligerscoördinator', href: '/contact?afdeling=vrijwilligerscordinator' },
        ],
      },
    ],
    faq: [
      {
        category: 'Verplichting',
        question: 'Moet ik vrijwilligerswerk doen?',
        answer:
          'Ja, als spelend lid van 19 jaar of ouder. Is je kind jeugdlid, dan doe jij als ouder of verzorger de vrijwilligerstaak.',
        links: [{ label: 'Vrijwilligersbeleid', href: '/vereniging/vrijwilligerswerk' }],
      },
      {
        category: 'Verplichting',
        question: 'Kan ik het afkopen met geld?',
        answer:
          'Nee. Het bestuur kiest bewust niet voor een afkoopsom. SVV’04 blijft alleen levensvatbaar als leden dit samen dragen, en geld hoort daar geen rol in te spelen.',
        links: [{ label: 'Vrijwilligersbeleid', href: '/vereniging/vrijwilligerswerk' }],
      },
      {
        category: 'Taken',
        question: 'Wat is het verschil tussen een taak en een functie?',
        answer:
          'Een functie is een positie binnen de club met een inspanningsverplichting, zoals bestuurslid of coördinator. Een taak rouleert via een rooster onder leden, zoals een kantinedienst. Ieder spelend lid vervult minimaal één taak of functie.',
        links: [{ label: 'Taken en functies', href: '/vereniging/vrijwilligerswerk/taken' }],
      },
      {
        category: 'Taken',
        question: 'Waar vind ik alle taken?',
        answer:
          'Op de pagina Taken en functies staat alles met een korte omschrijving en de tijdsbesteding.',
        links: [{ label: 'Taken en functies', href: '/vereniging/vrijwilligerswerk/taken' }],
      },
      {
        category: 'Taken',
        question: 'Waar staan de regels over ruilen, afzeggen en vrijstelling?',
        answer:
          'In het vrijwilligersplan. Dat kun je downloaden op de pagina over vrijwilligerswerk. Daar staan ook de regels over verzekering en opleidingen.',
        links: [{ label: 'Vrijwilligersbeleid', href: '/vereniging/vrijwilligerswerk' }],
      },
      {
        category: 'Meedoen',
        question: 'Hoe meld ik me aan voor een taak?',
        answer:
          'Bij je aanmelding als lid geef je aan welke taken je op je wilt nemen. Daarna nemen we jaarlijks contact op om te vragen wat je wilt bijdragen.',
        links: [{ label: 'Lidmaatschap', href: '/vereniging/lidmaatschap' }],
      },
      {
        category: 'Meedoen',
        question: 'Kan ik ook iets anders doen dan een kantinedienst?',
        answer:
          'Ja. Er zijn commissies voor onder meer activiteiten, communicatie en de kantine. Je kunt ook scheidsrechter worden.',
        links: [
          { label: 'Taken en functies', href: '/vereniging/vrijwilligerswerk/taken' },
          { label: 'Scheidsrechterscommissie', href: '/commissies/scheidsrechterscommissie' },
        ],
      },
      {
        category: 'Meedoen',
        question: 'Bij wie kan ik terecht met vragen over het vrijwilligersbeleid?',
        answer: 'Bij de vrijwilligerscoördinator. Je kunt het contactformulier gebruiken.',
        links: [{ label: 'Contact', href: '/contact?afdeling=vrijwilligerscordinator' }],
      },
    ],
    assistantIntro: 'Over de vrijwilligersverplichting, taken en meedoen: je krijgt meteen antwoord.',
    faqHelp: { title: 'Neem contact op' },
    contact: { roleSlug: 'vrijwilligerscordinator' },
    cta: {
      title: 'Wil je meehelpen?',
      text: 'Bekijk alle taken en kies wat bij je past.',
      buttonLabel: 'Bekijk de taken',
      buttonUrl: '/vereniging/vrijwilligerswerk/taken',
    },
  },
  {
    name: 'sponsoren',
    slug: 'sponsoring',
    order: 5,
    cardTitle: 'Sponsor',
    cardDescription: 'Sponsormogelijkheden en de voordelen van samenwerken.',
    intro:
      "Verbind jouw onderneming aan een bruisende club. Ontdek de sponsormogelijkheden van SVV'04 en wat we samen kunnen bereiken.",
    heroActions: [
      { label: 'Onze sponsoren', href: '/alle-sponsors' },
      { label: 'Contact opnemen', href: '/contact?afdeling=sponsorgroep' },
    ],
    themes: [
      {
        title: 'De club',
        intro: "Waar je aan verbonden raakt.",
        links: [
          { title: "Over SVV'04", description: 'Opgericht in 2004, thuis op Sportpark De Kampen', href: '/vereniging/algemeen' },
          { title: 'Teams', description: 'Senioren en jeugd', href: '/teams' },
          { title: 'Programma & uitslagen', description: 'Wat er elke week gespeeld wordt', href: '/programma' },
          { title: 'Nieuws', description: 'Het laatste clubnieuws', href: '/nieuws' },
        ],
      },
      {
        title: 'Rond de club',
        intro: 'Sponsoren en evenementen.',
        links: [
          { title: 'Onze sponsoren', description: "De bedrijven die SVV'04 steunen", href: '/alle-sponsors' },
          { title: 'Agenda', description: 'Activiteiten en evenementen', href: '/agenda' },
        ],
      },
      {
        title: 'Contact',
        intro: 'Direct een gesprek over sponsoring.',
        links: [
          { title: 'Contact', description: 'Direct naar de sponsorgroep', href: '/contact?afdeling=sponsorgroep' },
          { title: 'Bestuur', description: 'De mensen achter de club', href: '/vereniging/bestuur' },
        ],
      },
    ],
    faq: [
      {
        category: 'Sponsor worden',
        question: "Hoe word ik sponsor van SVV'04?",
        answer:
          'Neem contact op met de sponsorgroep. Zij bespreken met je wat bij jouw bedrijf past.',
        links: [{ label: 'Contact', href: '/contact?afdeling=sponsorgroep' }],
      },
      {
        category: 'Sponsor worden',
        question: 'Waar gaat de sponsorinkomst naartoe?',
        answer:
          "Sponsorinkomsten zorgen dat SVV'04 financieel gezond blijft en genoeg middelen heeft voor de accommodatie, materialen en activiteiten.",
        links: [{ label: 'Sponsormogelijkheden', href: '/vereniging/sponsoring' }],
      },
      {
        category: 'Sponsor worden',
        question: 'Welke sponsoren heeft de club nu?',
        answer: 'Alle sponsoren staan op de website.',
        links: [{ label: 'Onze sponsoren', href: '/alle-sponsors' }],
      },
      {
        category: 'De club',
        question: "Wat voor club is SVV'04?",
        answer:
          "SVV'04 is in 2004 opgericht door een fusie van v.v. Minjak en Sc. Oranje en is de enige voetbalvereniging in Schoonebeek. De club speelt op Sportpark De Kampen.",
        links: [{ label: 'Over SVV’04', href: '/vereniging/algemeen' }],
      },
      {
        category: 'De club',
        question: 'Welke evenementen organiseert de club?',
        answer:
          'Onder meer het jaarlijkse zomertoernooi, waar tientallen teams uit en buiten de gemeente aan meedoen. Daarnaast zijn er een feestavond en een sinterklaasviering voor de jeugd.',
        links: [{ label: 'Activiteitencommissie', href: '/commissies/activiteitencommissie' }],
      },
      {
        category: 'De club',
        question: 'Hoe blijf ik op de hoogte van de club?',
        answer:
          "De communicatiecommissie beheert de website, de sociale media en het clubblad. Nieuws van SVV'04 vind je ook op de nieuwspagina.",
        links: [{ label: 'Nieuws', href: '/nieuws' }],
      },
    ],
    assistantIntro: 'Over sponsor worden en de club: je krijgt meteen antwoord.',
    faqHelp: { title: 'Neem contact op' },
    contact: { roleSlug: 'sponsorgroep' },
    cta: {
      title: 'Interesse?',
      text: 'Ontdek wat we voor elkaar kunnen betekenen.',
      buttonLabel: 'Bekijk de mogelijkheden',
      buttonUrl: '/vereniging/sponsoring',
    },
  },
]

async function main() {
  const payload = await getPayload({ config })

  const { docs: media } = await payload.find({
    collection: 'media',
    where: { filename: { contains: HERO_IMAGE_FILENAME } },
    limit: 1,
    depth: 0,
  })
  const heroImage = media[0]?.id
  if (!heroImage) console.warn(`  warn    no media "${HERO_IMAGE_FILENAME}", hero images skipped`)

  console.log(`Seeding ${AUDIENCES.length} audiences…`)

  for (const audience of AUDIENCES) {
    const { docs: contacts } = await payload.find({
      collection: 'contacts',
      where: { 'roles.slug': { equals: audience.contact.roleSlug } },
      limit: 1,
      depth: 0,
    })
    const person = contacts[0]?.id
    if (!person) {
      console.warn(`  warn    no contact with role "${audience.contact.roleSlug}" for ${audience.slug}`)
    }

    const content = {
      intro: audience.intro,
      heroImage,
      heroActions: audience.heroActions,
      themes: audience.themes.map((t) => ({
        title: t.title,
        intro: t.intro,
        links: t.links,
      })),
      faq: audience.faq,
      assistantIntro: audience.assistantIntro,
      faqHelp: audience.faqHelp,
      contact: { person },
      cta: { enabled: true, ...audience.cta },
    }

    const { docs } = await payload.find({
      collection: 'audiences',
      where: { slug: { equals: audience.slug } },
      limit: 1,
      depth: 0,
    })

    if (docs.length > 0) {
      await payload.update({ collection: 'audiences', id: docs[0].id, data: content })
      console.log(`  updated ${audience.slug}`)
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
        ...content,
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
