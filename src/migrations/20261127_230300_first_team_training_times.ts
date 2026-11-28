import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * Data only: SVV'04 1 and 2 train on Tuesday and Thursday 20:00 to 22:00 (from the club directly, no field known yet).
 * A team that already has trainings in the CMS is skipped, so times entered by hand stay.
 */
const TEAMS = ['svv04-1', 'svv04-2']
const ROWS = [
  ['di', '20:00', '22:00'],
  ['do', '20:00', '22:00'],
] as const

export async function up({ db }: MigrateUpArgs): Promise<void> {
  for (const slug of TEAMS) {
    const { rows: teams } = await db.execute(sql`
      SELECT t."id" FROM "teams" t
      WHERE t."slug" = ${slug} AND NOT EXISTS (SELECT 1 FROM "teams_trainings" x WHERE x."_parent_id" = t."id");`)
    const teamId = teams[0]?.id
    if (teamId == null) continue
    for (const [order, [day, start, end]] of ROWS.entries()) {
      // Array row ids are 24-char hex strings, like the ones Payload generates.
      await db.execute(sql`
        INSERT INTO "teams_trainings" ("_order", "_parent_id", "id", "day", "start_time", "end_time")
        VALUES (${order + 1}, ${teamId}, substr(md5(random()::text), 1, 24), ${day}, ${start}, ${end});`)
    }
  }
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  for (const slug of TEAMS) {
    for (const [day, start, end] of ROWS) {
      await db.execute(sql`
        DELETE FROM "teams_trainings" WHERE "_parent_id" = (SELECT "id" FROM "teams" WHERE "slug" = ${slug})
          AND "day" = ${day} AND "start_time" = ${start} AND "end_time" = ${end};`)
    }
  }
}
