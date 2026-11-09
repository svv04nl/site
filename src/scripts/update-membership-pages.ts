/**
 * Rewrites the membership ("Lidmaatschap") page and creates its supporting
 * subpages: vrijwilligerswerk, de jongste jeugd, and contributie.
 *
 * Run with: node --no-deprecation --env-file=.env.local --import=tsx/esm src/scripts/update-membership-pages.ts
 */

import { getPayload } from 'payload'
import config from '@payload-config'
import { inspect } from 'util'
import { randomBytes } from 'crypto'

type TextNode = ReturnType<typeof textNode>
type LinkNode = ReturnType<typeof linkNode>

function textNode(text: string) {
  return {
    type: 'text',
    detail: 0,
    format: 0,
    mode: 'normal' as const,
    style: '',
    text,
    version: 1,
  }
}

function linkNode(text: string, url: string) {
  return {
    type: 'link',
    version: 3,
    format: '' as const,
    indent: 0,
    direction: 'ltr' as const,
    fields: { linkType: 'custom' as const, url, newTab: false },
    children: [textNode(text)],
  }
}

function mixed(...parts: (string | LinkNode)[]): (TextNode | LinkNode)[] {
  return parts.map((part) => (typeof part === 'string' ? textNode(part) : part))
}

function p(children: string | (TextNode | LinkNode)[]) {
  return {
    type: 'paragraph',
    format: '' as const,
    indent: 0,
    version: 1,
    direction: 'ltr' as const,
    children: typeof children === 'string' ? [textNode(children)] : children,
  }
}

function h2(text: string) {
  return {
    type: 'heading',
    tag: 'h2' as const,
    format: '' as const,
    indent: 0,
    version: 1,
    direction: 'ltr' as const,
    children: [textNode(text)],
  }
}

function ctaBlock(buttonLabel: string, buttonUrl: string) {
  return {
    type: 'block',
    format: '' as const,
    version: 2,
    fields: { blockType: 'ctaBlock' as const, buttonLabel, buttonUrl },
  }
}

function contactBlock(contactIds: (string | number)[], heading?: string) {
  return {
    type: 'block',
    format: '' as const,
    version: 2,
    fields: { blockType: 'contactBlock' as const, heading, contacts: contactIds },
  }
}

function uploadNode(mediaId: string | number) {
  return {
    type: 'upload',
    version: 3,
    format: '' as const,
    id: randomBytes(12).toString('hex'),
    relationTo: 'media' as const,
    value: mediaId,
  }
}

function pricingTableBlock(
  rows: { category: string; perKwartaal: string; perSeizoen?: string }[],
) {
  return {
    type: 'block',
    format: '' as const,
    version: 2,
    fields: { blockType: 'pricingTableBlock' as const, rows },
  }
}

function richText(nodes: { [key: string]: unknown; type: string; version: number }[]) {
  return {
    root: {
      type: 'root',
      format: '' as const,
      indent: 0,
      version: 1,
      direction: 'ltr' as const,
      children: nodes,
    },
  }
}

function buildLidmaatschapContent(jeugdContactId: string | number, ledenadminContactId: string | number) {
  return richText([
    p(
      "Lid worden van SVV'04 kan het hele jaar door, van de allerjongste jeugd tot senioren. Voordat je je aanmeldt, mag je eerst een paar keer gratis meetrainen.",
    ),
    ctaBlock('Direct aanmelden', 'https://www.knvb.nl/ontdek-voetbal/inschrijven/GKWH14N'),
    h2('Jeugd en ouders'),
    p(
      mixed(
        'Kinderen kunnen al vanaf 4 jaar meetrainen bij de jongste jeugd. Op de pagina over ',
        linkNode('de jongste jeugd', '/vereniging/jongste-jeugd'),
        ' lees je hoe de eerste trainingen eruitzien.',
      ),
    ),
    p(
      'Bij een jeugdlid vraagt een ouder of verzorger het lidmaatschap aan en is ook verantwoordelijk voor de contributie.',
    ),
    p('Vragen over de jeugdafdeling? Of wil je een keertje komen proeftrainen?'),
    p('Neem contact op met:'),
    contactBlock([jeugdContactId]),
    h2('Vrijwilligerswerk'),
    p(
      "SVV'04 draait op vrijwilligers. Als lid mag je meedoen aan trainingen en wedstrijden, en we verwachten dat je daar iets voor terugdoet, bijvoorbeeld met kantinedienst, scheidsrechter zijn of een taak binnen een commissie. Bij het aanmelden vragen we welke taken je op je wilt nemen, en ook daarna nemen we jaarlijks contact op om te vragen wat je wilt bijdragen.",
    ),
    p(
      mixed(
        'Meer weten over de mogelijkheden? Bekijk de pagina over ',
        linkNode('vrijwilligerswerk', '/meedoen/vrijwilligerswerk'),
        '.',
      ),
    ),
    h2('Contributie'),
    p(
      mixed(
        'De contributie wordt per kwartaal geïnd en hangt af van leeftijd en speelcategorie. De volledige tarieven voor dit seizoen staan op de ',
        linkNode('contributiepagina', '/vereniging/contributie'),
        '.',
      ),
    ),
    p('Vragen over je factuur of betaling?'),
    contactBlock([ledenadminContactId]),
    h2('Opzeggen'),
    p(
      'Opzeggen kan alleen aan het einde van het seizoen, tenzij je verhuist of langdurig geblesseerd of ziek bent. Geef je opzegging schriftelijk door vóór 1 juni, met daarbij je naam en teamnaam.',
    ),
    contactBlock([ledenadminContactId]),
  ])
}

const vrijwilligerWordenContent = richText([
  p(
    "SVV'04 bestaat dankzij vrijwilligers: trainers, kantinemedewerkers, scheidsrechters, terreinknechten en nog veel meer. Zonder hen is er geen club.",
  ),
  h2('Waarom het verplicht is'),
  p(
    'Je mag lid worden van SVV\'04 en hebt dan het recht om wedstrijden te spelen. Daar staat tegenover dat je de plicht hebt om iets terug te doen voor de vereniging. Dat geldt voor spelende leden en, waar mogelijk, hun ouders.',
  ),
  h2('Welke taken er zijn'),
  p(
    'Er is ook zonder voetbalachtergrond werk te doen: kantinedienst, scheidsrechter bij de jeugd, klein onderhoud aan het sportpark of een rol binnen een commissie.',
  ),
  h2('Hoe de indeling werkt'),
  p(
    'Bij het aanmelden als lid geef je al aan welke taken je op je wilt nemen. Ook daarna nemen we jaarlijks contact met je op om te vragen wat je wilt bijdragen. De vrijwilligerscommissie kijkt naar de behoefte binnen de club en naar de wensen van leden, en maakt daarna de indeling.',
  ),
  ctaBlock('Aanmelden als vrijwilliger', 'mailto:vrijwilligers@svv04.nl'),
  h2('Vragen'),
  p('Heb je vragen over het vrijwilligersbeleid? Mail naar vrijwilligers@svv04.nl.'),
])

function buildJongsteJeugdContent(jeugdContactId: string | number, photoMediaId: string | number) {
  return richText([
    uploadNode(photoMediaId),
    p(
      "Bij SVV'04 kun je al voetballen vanaf je vierde jaar. Bij de KNVB heet deze groep JO-6 (jeugd onder de 6 jaar); bij ons ook wel de puppy's.",
    ),
    h2('De trainingen'),
    p(
      'De training is om de week op zaterdagochtend van 9 tot 10 uur, onder begeleiding van een of meerdere trainers. Het draait vooral om wennen aan de bal en plezier: met eenvoudige oefeningen bouwen de kinderen balgevoel en schiettechniek op, spelen ze spelletjes met de bal en doen ze kleine partijvormen.',
    ),
    h2('Twee keer gratis meedoen'),
    p(
      'Je mag twee keer vrijblijvend meetrainen. Daarna vragen we je te beslissen: stoppen, of lid worden van SVV\'04. Ook na aanmelding blijf je gewoon meedoen met het puppyvoetbal, en contributie betaal je pas vanaf de dag dat je kind 6 jaar wordt of wordt ingedeeld bij de JO-7.',
    ),
    p(
      'Lid worden kan met het online aanmeldformulier. Lever het op zaterdag in bij de trainer(s).',
    ),
    h2('Wat heb je nodig?'),
    p(
      'Sportieve kleding is prima om te beginnen. Voetbalschoenen en scheenbeschermers raden we aan, net als een bidon water.',
    ),
    p(
      'Ouders van de jongste pupillen zitten in een WhatsApp-groep. Daar meld je je kind aan voor de eerstvolgende training, en daar staat het ook als een training wordt afgelast vanwege slecht weer.',
    ),
    h2('Normen en waarden'),
    p(
      'We verwachten dat spelers, ouders en begeleiding zich op en rond de trainingen netjes gedragen. Voetbal is op deze leeftijd vooral een spelletje, en het speelplezier van de kinderen staat voorop.',
    ),
    h2('Assistenten gezocht'),
    p(
      "Wil je iets voor SVV'04 betekenen en toch je kind zien spelen? Help dan mee bij de begeleiding van de jongste pupillen, of draai een orde- of kantinedienst. Geef dit aan op het aanmeldformulier.",
    ),
    p('Wil je voetbaltraining geven, eventueel ook aan oudere teams? Mail naar voetbalzaken@svv04.nl.'),
    h2('Vragen?'),
    p('Voor andere vragen kun je terecht bij de jeugdcoördinator:'),
    contactBlock([jeugdContactId]),
    p(
      "Iedereen is welkom, ook als je kind nog nooit heeft gevoetbald. Neem gerust een vriendje of vriendinnetje mee. We wensen je veel voetbalplezier bij SVV'04.",
    ),
  ])
}

function buildContributieContent(ledenadminContactId: string | number) {
  return richText([
    p(
      'Het bestuur stelt de contributie elk seizoen opnieuw vast. Betalen gebeurt per kwartaal, in juli, oktober, januari en april. Hieronder staan de tarieven voor seizoen 2024-2025.',
    ),
    h2('Tarieven seizoen 2024-2025'),
    pricingTableBlock([
      { category: 'Senioren veld/zaal', perKwartaal: '€48,30', perSeizoen: '€193,20' },
      { category: 'Senioren veld+zaal', perKwartaal: '€60,00', perSeizoen: '€240,00' },
      { category: 'JO13 t/m JO19', perKwartaal: '€37,45', perSeizoen: '€149,80' },
      { category: 'JO8 t/m JO12', perKwartaal: '€28,25', perSeizoen: '€113,00' },
      { category: 'Niet-spelend lid', perKwartaal: '€18,25', perSeizoen: '€73,00' },
      { category: 'Donateur (per jaar)', perKwartaal: '€30,00', perSeizoen: 'Echtpaar: €37,50' },
    ]),
    h2('Betalen'),
    p(
      'De contributie wordt per kwartaal automatisch geïncasseerd. Lukt de incasso niet, neem dan contact op met de ledenadministratie.',
    ),
    h2('Vragen'),
    p('Voor vragen over je factuur, een betalingsregeling of de tarieven kun je terecht bij:'),
    contactBlock([ledenadminContactId]),
  ])
}

async function main() {
  const payload = await getPayload({ config })

  const jeugdContactId = await findContactId(payload, 'jeugd@svv04.nl')
  const ledenadminContactId = await findContactId(payload, 'ledenadmin@svv04.nl')
  const jongsteJeugdPhotoId = await findMediaId(payload, 'jongste-jeugd-team.webp')
  const lidmaatschapContent = buildLidmaatschapContent(jeugdContactId, ledenadminContactId)
  const contributieContent = buildContributieContent(ledenadminContactId)

  // 1. Rewrite meedoen/lid-worden -> meedoen/lidmaatschap
  const { docs: lidWorden } = await payload.find({
    collection: 'pages',
    where: { section: { equals: 'meedoen' }, slug: { equals: 'lid-worden' } },
    limit: 1,
  })

  if (lidWorden[0]) {
    await payload.update({
      collection: 'pages',
      id: lidWorden[0].id,
      data: { title: 'Lidmaatschap', slug: 'lidmaatschap', content: lidmaatschapContent },
    })
    console.log('Updated: meedoen/lid-worden -> meedoen/lidmaatschap')
  } else {
    const { docs: existing } = await payload.find({
      collection: 'pages',
      where: { section: { equals: 'meedoen' }, slug: { equals: 'lidmaatschap' } },
      limit: 1,
    })
    if (existing[0]) {
      await payload.update({
        collection: 'pages',
        id: existing[0].id,
        data: { content: lidmaatschapContent },
      })
      console.log('Updated: meedoen/lidmaatschap (content refreshed)')
    } else {
      await payload.create({
        collection: 'pages',
        data: {
          title: 'Lidmaatschap',
          section: 'meedoen',
          slug: 'lidmaatschap',
          content: lidmaatschapContent,
        },
      })
      console.log('Created: meedoen/lidmaatschap')
    }
  }

  // 2. Create or update meedoen/vrijwilligerswerk
  await upsertContent(payload, 'meedoen', 'vrijwilligerswerk', 'Vrijwilligerswerk', vrijwilligerWordenContent)

  // 3. Create vereniging/jongste-jeugd
  await upsertContent(
    payload,
    'vereniging',
    'jongste-jeugd',
    'De jongste jeugd',
    buildJongsteJeugdContent(jeugdContactId, jongsteJeugdPhotoId),
  )

  // 4. Create or update vereniging/contributie
  await upsertContent(payload, 'vereniging', 'contributie', 'Contributie', contributieContent)

  // 5. Delete the old vereniging/lidmaatschap stub
  const { docs: oldStub } = await payload.find({
    collection: 'pages',
    where: { section: { equals: 'vereniging' }, slug: { equals: 'lidmaatschap' } },
    limit: 1,
  })
  if (oldStub[0]) {
    await payload.delete({ collection: 'pages', id: oldStub[0].id })
    console.log('Deleted: vereniging/lidmaatschap (old stub)')
  } else {
    console.log('Skip delete: vereniging/lidmaatschap (not found)')
  }

  // 6. Point the spelers/ouders audience CTAs at the renamed page
  for (const slug of ['spelers', 'ouders']) {
    const { docs } = await payload.find({
      collection: 'audiences',
      where: { slug: { equals: slug } },
      limit: 1,
    })
    const audience = docs[0]
    if (audience?.cta?.buttonUrl === '/meedoen/lid-worden') {
      await payload.update({
        collection: 'audiences',
        id: audience.id,
        data: { cta: { ...audience.cta, buttonUrl: '/meedoen/lidmaatschap' } },
      })
      console.log(`Updated: audiences/${slug} cta.buttonUrl -> /meedoen/lidmaatschap`)
    } else {
      console.log(`Skip: audiences/${slug} (no CTA update needed)`)
    }
  }

  console.log('Done.')
  process.exit(0)
}

async function findContactId(
  payload: Awaited<ReturnType<typeof getPayload>>,
  email: string,
): Promise<string | number> {
  const { docs } = await payload.find({
    collection: 'contacts',
    where: { email: { equals: email } },
    limit: 1,
  })
  if (!docs[0]) {
    throw new Error(`Contact not found for ${email}. Run seed-membership-contacts.ts first.`)
  }
  return docs[0].id
}

async function findMediaId(
  payload: Awaited<ReturnType<typeof getPayload>>,
  filename: string,
): Promise<string | number> {
  const { docs } = await payload.find({
    collection: 'media',
    where: { filename: { equals: filename } },
    limit: 1,
  })
  if (!docs[0]) {
    throw new Error(`Media not found for ${filename}. Run seed-jongste-jeugd-photo.ts first.`)
  }
  return docs[0].id
}

async function upsertContent(
  payload: Awaited<ReturnType<typeof getPayload>>,
  section: 'vereniging' | 'commissies' | 'meedoen',
  slug: string,
  title: string,
  content: ReturnType<typeof richText>,
) {
  const { docs } = await payload.find({
    collection: 'pages',
    where: { section: { equals: section }, slug: { equals: slug } },
    limit: 1,
  })

  if (docs[0]) {
    await payload.update({
      collection: 'pages',
      id: docs[0].id,
      data: { title, content },
    })
    console.log(`  updated ${section}/${slug}`)
    return
  }

  await payload.create({
    collection: 'pages',
    data: { title, section, slug, content },
  })
  console.log(`  created ${section}/${slug}`)
}

main().catch((err) => {
  console.error(inspect(err.data ?? err, { depth: null }))
  process.exit(1)
})
