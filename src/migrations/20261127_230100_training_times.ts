import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * Data only: the youth training times from the club's overview ("Trainingsdagen overzicht.xlsx", November 2026).
 * The field is the cell colour in that sheet (yellow 1, blue 2, orange 3, green 4). "O14/15" is O14-1.
 * A team that already has trainings in the CMS is skipped, so times entered by hand stay.
 */
type Row = [day: 'ma' | 'di' | 'wo' | 'do' | 'vr', start: string, end: string, field: string]

const mondayWednesday = (start: string, end: string, field: string): Row[] => [
  ['ma', start, end, field],
  ['wo', start, end, field],
]
const tuesdayThursday = (start: string, end: string, field: string): Row[] => [
  ['di', start, end, field],
  ['do', start, end, field],
]

const TRAININGS: [slug: string, rows: Row[]][] = [
  ['svv04-o7-1jm', [['ma', '18:15', '19:15', 'Trainingsveld 4']]],
  ['svv04-o8-1jm', [['ma', '18:15', '19:15', 'Trainingsveld 4']]],
  ['svv04-o8-2', [['ma', '18:15', '19:15', 'Trainingsveld 4']]],
  ['svv04-o9-1', mondayWednesday('18:00', '19:00', 'Trainingsveld 2')],
  ['svv04-o10-1', mondayWednesday('18:00', '19:00', 'Trainingsveld 2')],
  ['svv04-o10-2jm', mondayWednesday('18:00', '19:00', 'Trainingsveld 2')],
  ['svv04-o10-3jm', mondayWednesday('18:00', '19:00', 'Trainingsveld 2')],
  ['svv04-o11-1jm', mondayWednesday('18:15', '19:15', 'Trainingsveld 1')],
  ['svv04-o12-1jm', tuesdayThursday('18:30', '19:30', 'Trainingsveld 4')],
  ['svv04-o13-1', tuesdayThursday('18:15', '19:30', 'Trainingsveld 2')],
  ['svv04-o14-1', tuesdayThursday('18:15', '19:30', 'Trainingsveld 1')],
  ['svv04-o17-1', tuesdayThursday('18:15', '19:30', 'Trainingsveld 3')],
  ['svv04-o19-1', tuesdayThursday('20:00', '21:30', 'Trainingsveld 3')],
]

export async function up({ db }: MigrateUpArgs): Promise<void> {
  for (const [slug, rows] of TRAININGS) {
    const { rows: teams } = await db.execute(sql`
      SELECT t."id" FROM "teams" t
      WHERE t."slug" = ${slug} AND NOT EXISTS (SELECT 1 FROM "teams_trainings" x WHERE x."_parent_id" = t."id");`)
    const teamId = teams[0]?.id
    if (teamId == null) continue
    for (const [order, [day, start, end, field]] of rows.entries()) {
      // Array row ids are 24-char hex strings, like the ones Payload generates.
      await db.execute(sql`
        INSERT INTO "teams_trainings" ("_order", "_parent_id", "id", "day", "start_time", "end_time", "field")
        VALUES (${order + 1}, ${teamId}, substr(md5(random()::text), 1, 24), ${day}, ${start}, ${end}, ${field});`)
    }
  }
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  // The table goes with 20261127_230000; here only the rows this migration added.
  for (const [slug, rows] of TRAININGS) {
    for (const [day, start, end, field] of rows) {
      await db.execute(sql`
        DELETE FROM "teams_trainings" WHERE "_parent_id" = (SELECT "id" FROM "teams" WHERE "slug" = ${slug})
          AND "day" = ${day} AND "start_time" = ${start} AND "end_time" = ${end} AND "field" = ${field};`)
    }
  }
}
