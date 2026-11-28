import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * Data only: a "Trainingstijden" link to /teams/trainingstijden on the Ouders, Spelers and Trainers/leiders pages.
 * A link that already points to the old path /trainingstijden (which does not exist) is corrected instead.
 * A new link goes right after the link to /teams in the same theme, or at the end of the first theme.
 */
const HREF = '/teams/trainingstijden'
const LINKS: [audience: string, description: string][] = [
  ['ouders', 'Wanneer en op welk veld je kind traint'],
  ['spelers', 'Wanneer en op welk veld je traint'],
  ['trainers-leiders', 'Wanneer en op welk veld de teams trainen'],
]

const linksOf = (audience: string) => sql`
  SELECT l."id" FROM "audiences_themes_links" l
  JOIN "audiences_themes" th ON th."id" = l."_parent_id"
  JOIN "audiences" a ON a."id" = th."_parent_id"
  WHERE a."slug" = ${audience}`

export async function up({ db }: MigrateUpArgs): Promise<void> {
  for (const [audience, description] of LINKS) {
    await db.execute(sql`
      UPDATE "audiences_themes_links" SET "href" = ${HREF}
      WHERE "href" = '/trainingstijden' AND "id" IN (${linksOf(audience)});`)
    const { rows: existing } = await db.execute(
      sql`SELECT 1 FROM "audiences_themes_links" WHERE "href" = ${HREF} AND "id" IN (${linksOf(audience)});`,
    )
    if (existing.length > 0) continue

    // The theme with the /teams link, otherwise the first theme; position right after /teams, otherwise last.
    const { rows } = await db.execute(sql`
      SELECT th."id" AS "theme",
        COALESCE(
          (SELECT l."_order" + 1 FROM "audiences_themes_links" l WHERE l."_parent_id" = th."id" AND l."href" = '/teams' LIMIT 1),
          (SELECT COALESCE(MAX(l."_order"), 0) + 1 FROM "audiences_themes_links" l WHERE l."_parent_id" = th."id")
        ) AS "position"
      FROM "audiences_themes" th JOIN "audiences" a ON a."id" = th."_parent_id"
      WHERE a."slug" = ${audience}
      ORDER BY EXISTS (SELECT 1 FROM "audiences_themes_links" l WHERE l."_parent_id" = th."id" AND l."href" = '/teams') DESC,
        th."_order"
      LIMIT 1;`)
    const target = rows[0] as { theme: string; position: number } | undefined
    if (!target) continue

    await db.execute(sql`
      UPDATE "audiences_themes_links" SET "_order" = "_order" + 1
      WHERE "_parent_id" = ${target.theme} AND "_order" >= ${target.position};`)
    // Array row ids are 24-char hex strings, like the ones Payload generates.
    await db.execute(sql`
      INSERT INTO "audiences_themes_links" ("_order", "_parent_id", "id", "title", "description", "href")
      VALUES (${target.position}, ${target.theme}, substr(md5(random()::text), 1, 24), 'Trainingstijden', ${description}, ${HREF});`)
  }
}

// Removes the links to the overview on these three pages, also the ones that only got their path corrected.
export async function down({ db }: MigrateDownArgs): Promise<void> {
  for (const [audience] of LINKS) {
    await db.execute(sql`
      DELETE FROM "audiences_themes_links" WHERE "href" = ${HREF} AND "id" IN (${linksOf(audience)});`)
  }
}
