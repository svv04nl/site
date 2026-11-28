import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

// Idempotent: the preview database of this PR already ran this migration under its earlier name
// (20261116_160000), so every step skips what already exists.
export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE IF NOT EXISTS "pupils" (
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
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "pupils_id" integer;
  DO $$ BEGIN
    ALTER TABLE "pupils" ADD CONSTRAINT "pupils_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  DO $$ BEGIN
    ALTER TABLE "pupils" ADD CONSTRAINT "pupils_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  CREATE INDEX IF NOT EXISTS "pupils_team_idx" ON "pupils" USING btree ("team_id");
  CREATE INDEX IF NOT EXISTS "pupils_photo_idx" ON "pupils" USING btree ("photo_id");
  CREATE INDEX IF NOT EXISTS "pupils_updated_at_idx" ON "pupils" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "pupils_created_at_idx" ON "pupils" USING btree ("created_at");
  DO $$ BEGIN
    ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_pupils_fk" FOREIGN KEY ("pupils_id") REFERENCES "public"."pupils"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_pupils_id_idx" ON "payload_locked_documents_rels" USING btree ("pupils_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pupils" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "pupils" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_pupils_fk";
  
  DROP INDEX "payload_locked_documents_rels_pupils_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "pupils_id";`)
}
