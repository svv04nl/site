import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "pages" ADD COLUMN IF NOT EXISTS "cta_block_enabled" boolean DEFAULT false;
    ALTER TABLE "pages" ADD COLUMN IF NOT EXISTS "cta_block_button_label" varchar;
    ALTER TABLE "pages" ADD COLUMN IF NOT EXISTS "cta_block_button_url" varchar;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "pages" DROP COLUMN IF EXISTS "cta_block_enabled";
    ALTER TABLE "pages" DROP COLUMN IF EXISTS "cta_block_button_label";
    ALTER TABLE "pages" DROP COLUMN IF EXISTS "cta_block_button_url";
  `)
}
