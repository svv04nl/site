import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

// KNVB dropped the gendered "J" prefix from youth age-category codes
// (JO19 -> O19, JO17 -> O17, etc). Team names still use the old "JO" prefix
// for every youth team except O21, which was already renamed by hand.
// Scoped to the specific age numbers currently in use so O21 is untouched.
export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   UPDATE "teams" SET "name" = regexp_replace("name", 'JO(19|17|15|13|12|11|10|9|8|7)', 'O\1') WHERE "name" ~ 'JO(19|17|15|13|12|11|10|9|8|7)';
  `)
  await db.execute(sql`
   UPDATE "teams" SET "slug" = regexp_replace("slug", 'jo(19|17|15|13|12|11|10|9|8|7)', 'o\1') WHERE "slug" ~ 'jo(19|17|15|13|12|11|10|9|8|7)';
  `)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   UPDATE "teams" SET "name" = regexp_replace("name", 'O(19|17|15|13|12|11|10|9|8|7)', 'JO\1') WHERE "name" ~ 'O(19|17|15|13|12|11|10|9|8|7)';
  `)
  await db.execute(sql`
   UPDATE "teams" SET "slug" = regexp_replace("slug", 'o(19|17|15|13|12|11|10|9|8|7)', 'jo\1') WHERE "slug" ~ 'o(19|17|15|13|12|11|10|9|8|7)';
  `)
}
