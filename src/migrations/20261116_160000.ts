import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "pupils" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"team_id" integer,
  	"photo_id" integer,
  	"match_date" timestamp(3) with time zone NOT NULL,
  	"consent" boolean DEFAULT false,
  	"position" varchar,
  	"favorite_club" varchar,
  	"favorite_player" varchar,
  	"favorite_svv_player" varchar,
  	"happy_when" varchar,
  	"later_become" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "pupils_id" integer;
  ALTER TABLE "pupils" ADD CONSTRAINT "pupils_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pupils" ADD CONSTRAINT "pupils_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "pupils_team_idx" ON "pupils" USING btree ("team_id");
  CREATE INDEX "pupils_photo_idx" ON "pupils" USING btree ("photo_id");
  CREATE INDEX "pupils_updated_at_idx" ON "pupils" USING btree ("updated_at");
  CREATE INDEX "pupils_created_at_idx" ON "pupils" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_pupils_fk" FOREIGN KEY ("pupils_id") REFERENCES "public"."pupils"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_pupils_id_idx" ON "payload_locked_documents_rels" USING btree ("pupils_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pupils" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "pupils" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_pupils_fk";
  
  DROP INDEX "payload_locked_documents_rels_pupils_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "pupils_id";`)
}
