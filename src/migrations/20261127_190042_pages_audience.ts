import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TYPE "public"."enum_pages_section" ADD VALUE 'doelgroep';
  ALTER TYPE "public"."enum_pages_section" ADD VALUE 'info';
  ALTER TABLE "pages" ADD COLUMN "audience_id" integer;
  ALTER TABLE "pages" ADD CONSTRAINT "pages_audience_id_audiences_id_fk" FOREIGN KEY ("audience_id") REFERENCES "public"."audiences"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "pages_audience_idx" ON "pages" USING btree ("audience_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages" DROP CONSTRAINT "pages_audience_id_audiences_id_fk";
  
  ALTER TABLE "pages" ALTER COLUMN "section" SET DATA TYPE text;
  ALTER TABLE "pages" ALTER COLUMN "section" SET DEFAULT 'vereniging'::text;
  DROP TYPE "public"."enum_pages_section";
  CREATE TYPE "public"."enum_pages_section" AS ENUM('vereniging', 'commissies', 'meedoen');
  ALTER TABLE "pages" ALTER COLUMN "section" SET DEFAULT 'vereniging'::"public"."enum_pages_section";
  ALTER TABLE "pages" ALTER COLUMN "section" SET DATA TYPE "public"."enum_pages_section" USING "section"::"public"."enum_pages_section";
  DROP INDEX "pages_audience_idx";
  ALTER TABLE "pages" DROP COLUMN "audience_id";`)
}
