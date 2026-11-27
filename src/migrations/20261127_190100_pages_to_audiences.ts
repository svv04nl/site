import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * Data only: moves the pages that are not about the club itself out of the Vereniging menu, to their audience or to /info.
 * A separate migration from 20261127_190042_pages_audience, because Postgres cannot use a new enum value in the transaction that adds it.
 * Only pages still under Vereniging are touched, so a page moved by hand in the CMS keeps its place; the old addresses
 * redirect (308) to the new ones. AED, Organisatie and Disclaimer are deleted: nothing links to them.
 */
const TO_AUDIENCE: [slug: string, audience: string][] = [
  ['jongste-jeugd', 'ouders'],
  ['wat-verwachten-wij-van-spelers', 'spelers'],
  ['verzorger', 'spelers'],
  ['maatschappelijke-stage', 'trainers-leiders'],
  ['vrijwilligerswerk', 'vrijwilligers'],
  // Vrijwilligerstaken, a subpage of Vrijwilligerswerk: a subpage takes its address from its own section.
  ['taken', 'vrijwilligers'],
  ['dinsdagmorgenploeg', 'vrijwilligers'],
]
const TO_INFO = ['whatsapp-community', 'voetbal-nl-app']
const DELETE = ['aed', 'organisatie', 'disclaimer']

export async function up({ db }: MigrateUpArgs): Promise<void> {
  for (const [slug, audience] of TO_AUDIENCE) {
    await db.execute(sql`
      UPDATE "pages" SET "section" = 'doelgroep', "audience_id" = (SELECT "id" FROM "audiences" WHERE "slug" = ${audience})
      WHERE "slug" = ${slug} AND "section" = 'vereniging' AND EXISTS (SELECT 1 FROM "audiences" WHERE "slug" = ${audience});`)
  }
  for (const slug of TO_INFO) {
    await db.execute(sql`UPDATE "pages" SET "section" = 'info' WHERE "slug" = ${slug} AND "section" = 'vereniging';`)
  }
  for (const slug of DELETE) {
    await db.execute(sql`DELETE FROM "pages" WHERE "slug" = ${slug} AND "section" = 'vereniging' AND "parent_id" IS NULL;`)
  }
}

// The deleted pages do not come back: their text is gone with them.
export async function down({ db }: MigrateDownArgs): Promise<void> {
  for (const slug of [...TO_AUDIENCE.map(([s]) => s), ...TO_INFO]) {
    await db.execute(sql`
      UPDATE "pages" SET "section" = 'vereniging', "audience_id" = NULL
      WHERE "slug" = ${slug} AND "section" IN ('doelgroep', 'info');`)
  }
}
