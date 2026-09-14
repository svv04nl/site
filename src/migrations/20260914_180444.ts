import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "teams_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"sponsors_id" integer
  );
  
  ALTER TABLE "teams" DROP CONSTRAINT "teams_sponsor_id_sponsors_id_fk";
  
  DROP INDEX "teams_sponsor_idx";
  ALTER TABLE "teams_rels" ADD CONSTRAINT "teams_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."teams"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "teams_rels" ADD CONSTRAINT "teams_rels_sponsors_fk" FOREIGN KEY ("sponsors_id") REFERENCES "public"."sponsors"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "teams_rels_order_idx" ON "teams_rels" USING btree ("order");
  CREATE INDEX "teams_rels_parent_idx" ON "teams_rels" USING btree ("parent_id");
  CREATE INDEX "teams_rels_path_idx" ON "teams_rels" USING btree ("path");
  CREATE INDEX "teams_rels_sponsors_id_idx" ON "teams_rels" USING btree ("sponsors_id");
  ALTER TABLE "teams" DROP COLUMN "sponsor_id";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "teams_rels" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "teams_rels" CASCADE;
  ALTER TABLE "teams" ADD COLUMN "sponsor_id" integer;
  ALTER TABLE "teams" ADD CONSTRAINT "teams_sponsor_id_sponsors_id_fk" FOREIGN KEY ("sponsor_id") REFERENCES "public"."sponsors"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "teams_sponsor_idx" ON "teams" USING btree ("sponsor_id");`)
}
