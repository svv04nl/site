import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * Data only: Clubkleding and Clubartikelen become one page, /vereniging/clubartikelen.
 * - The texts come from both CMS pages as they were on 28 November 2026 (lightly reordered and
 *   joined); the address card of Sluyters Sport and the contact cards are copied from those pages.
 * - The Stanno webshop becomes a featureCardBlock, the price list the productGridBlock.
 * - The Clubkleding page leaves the menu (hideFromNav); next.config.ts redirects its address.
 * - The five articles of the price list are added (only when no product with that name exists),
 *   ordered through the form, not sold in the kantine (the old page only named Ron Bunskoek).
 * - The orders go to the role "sponsorgroep" (Ron Bunskoek), as on the old page.
 */

const STANNO_URL = 'https://clubs.stanno.com/nl/svv-04/clubcollectie'

const PRODUCTS: { name: string; slug: string; price: number; summary: string | null; match: string }[] = [
  {
    name: 'Dubbelzijdige supportersjaal',
    slug: 'supportersjaal',
    price: 10,
    summary: 'Dubbelzijdig jacquard gebreid, circa 130 x 17 cm',
    match: '%supporter%sjaal%',
  },
  { name: 'Dubbelzijdige autosjaal', slug: 'autosjaal', price: 7.5, summary: null, match: '%autosjaal%' },
  { name: 'Muts met geborduurd logo', slug: 'muts', price: 10, summary: null, match: '%muts%' },
  { name: 'Pet met geborduurd logo', slug: 'pet', price: 10, summary: null, match: 'pet%' },
  { name: 'Mini kits', slug: 'mini-kits', price: 7.5, summary: null, match: '%mini%kit%' },
]

type Node = Record<string, unknown>

// Block ids are 24-char hex strings, like the ones Payload generates.
const blockId = () => crypto.randomUUID().replace(/-/g, '').slice(0, 24)

const text = (value: string): Node => ({
  type: 'text',
  text: value,
  detail: 0,
  format: 0,
  mode: 'normal',
  style: '',
  version: 1,
})

const paragraph = (value: string): Node => ({
  type: 'paragraph',
  children: [text(value)],
  direction: 'ltr',
  format: '',
  indent: 0,
  textFormat: 0,
  textStyle: '',
  version: 1,
})

const heading = (value: string): Node => ({
  type: 'heading',
  tag: 'h2',
  children: [text(value)],
  direction: 'ltr',
  format: '',
  indent: 0,
  version: 1,
})

const block = (fields: Node): Node => ({
  type: 'block',
  fields: { id: blockId(), blockName: '', ...fields },
  format: '',
  version: 2,
})

/** The first block of this type anywhere in a Lexical document, as stored. */
function findBlock(content: unknown, blockType: string): Node | null {
  const stack: unknown[] = [content]
  while (stack.length) {
    const node = stack.pop() as Node | undefined
    if (!node || typeof node !== 'object') {
      continue
    }
    const fields = node.fields as Node | undefined
    if (node.type === 'block' && fields?.blockType === blockType) {
      return node
    }
    const root = node.root as Node | undefined
    const children = (root?.children ?? node.children) as unknown[] | undefined
    if (Array.isArray(children)) {
      stack.push(...[...children].reverse())
    }
  }
  return null
}

/** A contact card for the contact with this role, when the old page had none. */
async function contactCard(db: MigrateUpArgs['db'], role: string): Promise<Node | null> {
  const { rows } = await db.execute(
    sql`SELECT "_parent_id" AS "id" FROM "contacts_roles" WHERE "slug" = ${role} LIMIT 1;`,
  )
  const id = (rows[0] as { id: number } | undefined)?.id
  return id ? block({ blockType: 'contactBlock', contacts: [id] }) : null
}

export async function up({ db }: MigrateUpArgs): Promise<void> {
  const page = async (slug: string) => {
    const { rows } = await db.execute(
      sql`SELECT "id", "content" FROM "pages" WHERE "slug" = ${slug} AND "section" = 'vereniging' LIMIT 1;`,
    )
    return rows[0] as { id: number; content: unknown } | undefined
  }
  const artikelen = await page('clubartikelen')
  const kleding = await page('clubkleding')

  const sponsorCard =
    findBlock(artikelen?.content, 'contactBlock') ?? (await contactCard(db, 'sponsorgroep'))
  const materiaalCard =
    findBlock(kleding?.content, 'contactBlock') ?? (await contactCard(db, 'materiaalbeheer'))
  const sluyters = findBlock(kleding?.content, 'addressBlock')

  const children: (Node | null)[] = [
    paragraph(
      "Clubkleding bestel je bij Stanno, het clubkledingmerk van SVV'04. Daarnaast verkoopt de club een aantal artikelen voor supporters.",
    ),
    block({
      blockType: 'featureCardBlock',
      eyebrow: 'Clubkleding',
      title: 'Bestellen via de webshop',
      text: "Stanno is het clubkledingmerk van SVV'04. We kozen voor Stanno vanwege de goede prijs-kwaliteitverhouding en de snelle, stabiele levering. Wil je je kleding laten bedrukken met een naam of logo? Dat kan, geef dit aan bij je bestelling.",
      image: null,
      buttonLabel: 'Naar de webshop',
      url: STANNO_URL,
    }),
    block({ blockType: 'productGridBlock', title: 'Te koop bij de club', showHowToOrder: true }),
    paragraph('Liever persoonlijk bestellen? Dat kan bij Ron Bunskoek van de sponsorgroep.'),
    sponsorCard,
    heading('Passen en kopen in de winkel'),
    paragraph(
      'Kleding wordt geleverd door Sluyters Sport in Coevorden. Alle kleding kan in de winkel gekocht en gepast worden. Ook is het mogelijk om de kleding te laten bedrukken.',
    ),
    sluyters,
    heading('Wedstrijdtenue en presentatiekleding'),
    paragraph(
      "De tenues voor wedstrijden worden door de club geleverd. Voor sommige teams is ook presentatiekleding beschikbaar, zoals trainingspakken, jassen of polo's.",
    ),
    heading('Zelf kleding regelen voor je team'),
    paragraph(
      'Wil je voor je team zelf extra kleding regelen? Dat initiatief juichen we toe, maar overleg dit altijd eerst met materiaalbeheer. De vereniging koopt in met korting en krijgt cashback, en we houden vaste kledinglijnen aan zodat de uitstraling van de club uniform blijft.',
    ),
    paragraph('Vragen over materialen van de club, of iets nodig? Neem contact op met materiaalbeheer.'),
    materiaalCard,
  ]

  const content = {
    root: {
      type: 'root',
      children: children.filter(Boolean),
      direction: 'ltr',
      format: '',
      indent: 0,
      version: 1,
    },
  }
  const json = JSON.stringify(content)

  if (artikelen) {
    await db.execute(sql`
      UPDATE "pages" SET "title" = 'Clubartikelen', "content" = ${json}::jsonb, "hide_from_nav" = false, "updated_at" = now()
      WHERE "id" = ${artikelen.id};`)
  } else {
    await db.execute(sql`
      INSERT INTO "pages" ("title", "section", "slug", "content", "hide_from_nav", "updated_at", "created_at")
      VALUES ('Clubartikelen', 'vereniging', 'clubartikelen', ${json}::jsonb, false, now(), now());`)
  }
  if (kleding) {
    await db.execute(sql`UPDATE "pages" SET "hide_from_nav" = true WHERE "id" = ${kleding.id};`)
  }

  for (const p of PRODUCTS) {
    const { rows } = await db.execute(
      sql`SELECT 1 FROM "products" WHERE "slug" = ${p.slug} OR "name" ILIKE ${p.match} LIMIT 1;`,
    )
    if (rows.length > 0) {
      continue
    }
    await db.execute(sql`
      INSERT INTO "products" ("name", "slug", "price", "summary", "in_kantine", "via_form", "updated_at", "created_at")
      VALUES (${p.name}, ${p.slug}, ${p.price}, ${p.summary}, false, true, now(), now());`)
  }

  const { rows: settings } = await db.execute(sql`SELECT "id" FROM "shop_settings" LIMIT 1;`)
  if (settings.length === 0) {
    await db.execute(sql`
      INSERT INTO "shop_settings" ("order_role", "updated_at", "created_at")
      VALUES ('sponsorgroep', now(), now());`)
  }
}

// The old Clubartikelen text is not kept; this only brings Clubkleding back into the menu.
export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    UPDATE "pages" SET "hide_from_nav" = false WHERE "slug" = 'clubkleding' AND "section" = 'vereniging';`)
}
