import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "teams" ADD COLUMN "sponsor_id" integer;
  ALTER TABLE "teams" ADD CONSTRAINT "teams_sponsor_id_sponsors_id_fk" FOREIGN KEY ("sponsor_id") REFERENCES "public"."sponsors"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "teams_sponsor_idx" ON "teams" USING btree ("sponsor_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "teams" DROP CONSTRAINT "teams_sponsor_id_sponsors_id_fk";
  
  DROP INDEX "teams_sponsor_idx";
  ALTER TABLE "teams" DROP COLUMN "sponsor_id";`)
}
