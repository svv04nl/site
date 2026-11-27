import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * Data only: moves the pages that are not about the club itself out of the Vereniging menu, to their audience or to /info.
 * A separate migration from 20261114_081755, because Postgres cannot use a new enum value in the transaction that adds it.
 * Only pages still under Vereniging are touched, so a page moved by hand in the CMS keeps its place; the old addresses
 * redirect (308) to the new ones. The AED page is deleted: nothing links to it.
 */
const TO_AUDIENCE: [slug: string, audience: string][] = [
  ['jongste-jeugd', 'ouders'],
  ['wat-verwachten-wij-van-spelers', 'spelers'],
  ['verzorger', 'spelers'],
  ['maatschappelijke-stage', 'trainers-leiders'],
  ['vrijwilligerswerk', 'vrijwilligers'],
  // Vrijwilligerstaken, a subpage of Vrijwilligerswerk: a subpage takes its address from its own section.
  ['taken', 'vrijwilligers'],
]
const TO_INFO = ['whatsapp-community', 'voetbal-nl-app']

export async function up({ db }: MigrateUpArgs): Promise<void> {
  for (const [slug, audience] of TO_AUDIENCE) {
    await db.execute(sql`
      UPDATE "pages" SET "section" = 'doelgroep', "audience_id" = (SELECT "id" FROM "audiences" WHERE "slug" = ${audience})
      WHERE "slug" = ${slug} AND "section" = 'vereniging' AND EXISTS (SELECT 1 FROM "audiences" WHERE "slug" = ${audience});`)
  }
  for (const slug of TO_INFO) {
    await db.execute(sql`UPDATE "pages" SET "section" = 'info' WHERE "slug" = ${slug} AND "section" = 'vereniging';`)
  }
  await db.execute(sql`DELETE FROM "pages" WHERE "slug" = 'aed' AND "section" = 'vereniging' AND "parent_id" IS NULL;`)
}

// The AED page does not come back: its text is gone with it.
export async function down({ db }: MigrateDownArgs): Promise<void> {
  for (const slug of [...TO_AUDIENCE.map(([s]) => s), ...TO_INFO]) {
    await db.execute(sql`
      UPDATE "pages" SET "section" = 'vereniging', "audience_id" = NULL
      WHERE "slug" = ${slug} AND "section" IN ('doelgroep', 'info');`)
  }
}
