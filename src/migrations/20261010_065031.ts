import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "team_staff" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"role" varchar NOT NULL,
  	"team_id" integer NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "team_staff_id" integer;
  ALTER TABLE "team_staff" ADD CONSTRAINT "team_staff_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "team_staff_name_idx" ON "team_staff" USING btree ("name");
  CREATE INDEX "team_staff_team_idx" ON "team_staff" USING btree ("team_id");
  CREATE INDEX "team_staff_updated_at_idx" ON "team_staff" USING btree ("updated_at");
  CREATE INDEX "team_staff_created_at_idx" ON "team_staff" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_team_staff_fk" FOREIGN KEY ("team_staff_id") REFERENCES "public"."team_staff"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_team_staff_id_idx" ON "payload_locked_documents_rels" USING btree ("team_staff_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "team_staff" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "team_staff" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_team_staff_fk";
  
  DROP INDEX "payload_locked_documents_rels_team_staff_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "team_staff_id";`)
}
