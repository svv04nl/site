import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_teams_trainings_day" AS ENUM('ma', 'di', 'wo', 'do', 'vr', 'za', 'zo');
  CREATE TABLE "teams_trainings" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"day" "enum_teams_trainings_day" NOT NULL,
  	"start_time" varchar NOT NULL,
  	"end_time" varchar NOT NULL,
  	"field" varchar,
  	"group" varchar
  );
  
  ALTER TABLE "teams_trainings" ADD CONSTRAINT "teams_trainings_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."teams"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "teams_trainings_order_idx" ON "teams_trainings" USING btree ("_order");
  CREATE INDEX "teams_trainings_parent_id_idx" ON "teams_trainings" USING btree ("_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "teams_trainings" CASCADE;
  DROP TYPE "public"."enum_teams_trainings_day";`)
}
