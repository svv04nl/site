import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_audiences_blocks_content_background" AS ENUM('white', 'light', 'dark');
  CREATE TABLE "audiences_blocks_content" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"background" "enum_audiences_blocks_content_background" DEFAULT 'white',
  	"content" jsonb,
  	"block_name" varchar
  );
  
  CREATE TABLE "audiences_blocks_themes" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"block_name" varchar
  );
  
  CREATE TABLE "audiences_blocks_contact" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"block_name" varchar
  );
  
  CREATE TABLE "audiences_blocks_assistant" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"block_name" varchar
  );
  
  ALTER TABLE "audiences_blocks_content" ADD CONSTRAINT "audiences_blocks_content_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."audiences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "audiences_blocks_themes" ADD CONSTRAINT "audiences_blocks_themes_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."audiences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "audiences_blocks_contact" ADD CONSTRAINT "audiences_blocks_contact_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."audiences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "audiences_blocks_assistant" ADD CONSTRAINT "audiences_blocks_assistant_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."audiences"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "audiences_blocks_content_order_idx" ON "audiences_blocks_content" USING btree ("_order");
  CREATE INDEX "audiences_blocks_content_parent_id_idx" ON "audiences_blocks_content" USING btree ("_parent_id");
  CREATE INDEX "audiences_blocks_content_path_idx" ON "audiences_blocks_content" USING btree ("_path");
  CREATE INDEX "audiences_blocks_themes_order_idx" ON "audiences_blocks_themes" USING btree ("_order");
  CREATE INDEX "audiences_blocks_themes_parent_id_idx" ON "audiences_blocks_themes" USING btree ("_parent_id");
  CREATE INDEX "audiences_blocks_themes_path_idx" ON "audiences_blocks_themes" USING btree ("_path");
  CREATE INDEX "audiences_blocks_contact_order_idx" ON "audiences_blocks_contact" USING btree ("_order");
  CREATE INDEX "audiences_blocks_contact_parent_id_idx" ON "audiences_blocks_contact" USING btree ("_parent_id");
  CREATE INDEX "audiences_blocks_contact_path_idx" ON "audiences_blocks_contact" USING btree ("_path");
  CREATE INDEX "audiences_blocks_assistant_order_idx" ON "audiences_blocks_assistant" USING btree ("_order");
  CREATE INDEX "audiences_blocks_assistant_parent_id_idx" ON "audiences_blocks_assistant" USING btree ("_parent_id");
  CREATE INDEX "audiences_blocks_assistant_path_idx" ON "audiences_blocks_assistant" USING btree ("_path");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "audiences_blocks_content" CASCADE;
  DROP TABLE "audiences_blocks_themes" CASCADE;
  DROP TABLE "audiences_blocks_contact" CASCADE;
  DROP TABLE "audiences_blocks_assistant" CASCADE;
  DROP TYPE "public"."enum_audiences_blocks_content_background";`)
}
