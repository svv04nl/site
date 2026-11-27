import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'
import { fillPdfText } from '../lib/pdf-text'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "media" ADD COLUMN "text" varchar;`)
  // The text of the PDFs that exist now; later ones through `pnpm media:pdf-text`.
  payload.logger.info((await fillPdfText(payload, req)).join('\n'))
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "media" DROP COLUMN "text";`)
}
