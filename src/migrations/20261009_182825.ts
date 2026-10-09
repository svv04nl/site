import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "audiences_hero_actions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"href" varchar NOT NULL
  );
  
  CREATE TABLE "audiences_themes_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"description" varchar,
  	"href" varchar NOT NULL
  );
  
  CREATE TABLE "audiences_themes" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"intro" varchar
  );
  
  CREATE TABLE "audiences_faq_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"href" varchar NOT NULL
  );
  
  CREATE TABLE "audiences_faq" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"category" varchar NOT NULL,
  	"question" varchar NOT NULL,
  	"answer" varchar NOT NULL
  );
  
  CREATE TABLE "audiences_faq_help_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"href" varchar NOT NULL
  );
  
  ALTER TABLE "audiences_links" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "audiences_links" CASCADE;
  ALTER TABLE "contacts" ADD COLUMN "photo_id" integer;
  ALTER TABLE "audiences" ADD COLUMN "hero_image_id" integer;
  ALTER TABLE "audiences" ADD COLUMN "faq_help_title" varchar;
  ALTER TABLE "audiences" ADD COLUMN "faq_help_text" varchar;
  ALTER TABLE "audiences" ADD COLUMN "contact_label" varchar;
  ALTER TABLE "audiences" ADD COLUMN "contact_person_id" integer;
  ALTER TABLE "audiences_hero_actions" ADD CONSTRAINT "audiences_hero_actions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."audiences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "audiences_themes_links" ADD CONSTRAINT "audiences_themes_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."audiences_themes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "audiences_themes" ADD CONSTRAINT "audiences_themes_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."audiences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "audiences_faq_links" ADD CONSTRAINT "audiences_faq_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."audiences_faq"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "audiences_faq" ADD CONSTRAINT "audiences_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."audiences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "audiences_faq_help_links" ADD CONSTRAINT "audiences_faq_help_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."audiences"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "audiences_hero_actions_order_idx" ON "audiences_hero_actions" USING btree ("_order");
  CREATE INDEX "audiences_hero_actions_parent_id_idx" ON "audiences_hero_actions" USING btree ("_parent_id");
  CREATE INDEX "audiences_themes_links_order_idx" ON "audiences_themes_links" USING btree ("_order");
  CREATE INDEX "audiences_themes_links_parent_id_idx" ON "audiences_themes_links" USING btree ("_parent_id");
  CREATE INDEX "audiences_themes_order_idx" ON "audiences_themes" USING btree ("_order");
  CREATE INDEX "audiences_themes_parent_id_idx" ON "audiences_themes" USING btree ("_parent_id");
  CREATE INDEX "audiences_faq_links_order_idx" ON "audiences_faq_links" USING btree ("_order");
  CREATE INDEX "audiences_faq_links_parent_id_idx" ON "audiences_faq_links" USING btree ("_parent_id");
  CREATE INDEX "audiences_faq_order_idx" ON "audiences_faq" USING btree ("_order");
  CREATE INDEX "audiences_faq_parent_id_idx" ON "audiences_faq" USING btree ("_parent_id");
  CREATE INDEX "audiences_faq_help_links_order_idx" ON "audiences_faq_help_links" USING btree ("_order");
  CREATE INDEX "audiences_faq_help_links_parent_id_idx" ON "audiences_faq_help_links" USING btree ("_parent_id");
  ALTER TABLE "contacts" ADD CONSTRAINT "contacts_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "audiences" ADD CONSTRAINT "audiences_hero_image_id_media_id_fk" FOREIGN KEY ("hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "audiences" ADD CONSTRAINT "audiences_contact_person_id_contacts_id_fk" FOREIGN KEY ("contact_person_id") REFERENCES "public"."contacts"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "contacts_photo_idx" ON "contacts" USING btree ("photo_id");
  CREATE INDEX "audiences_hero_image_idx" ON "audiences" USING btree ("hero_image_id");
  CREATE INDEX "audiences_contact_contact_person_idx" ON "audiences" USING btree ("contact_person_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "audiences_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"description" varchar,
  	"href" varchar NOT NULL
  );
  
  ALTER TABLE "audiences_hero_actions" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "audiences_themes_links" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "audiences_themes" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "audiences_faq_links" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "audiences_faq" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "audiences_faq_help_links" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "audiences_hero_actions" CASCADE;
  DROP TABLE "audiences_themes_links" CASCADE;
  DROP TABLE "audiences_themes" CASCADE;
  DROP TABLE "audiences_faq_links" CASCADE;
  DROP TABLE "audiences_faq" CASCADE;
  DROP TABLE "audiences_faq_help_links" CASCADE;
  ALTER TABLE "contacts" DROP CONSTRAINT "contacts_photo_id_media_id_fk";
  
  ALTER TABLE "audiences" DROP CONSTRAINT "audiences_hero_image_id_media_id_fk";
  
  ALTER TABLE "audiences" DROP CONSTRAINT "audiences_contact_person_id_contacts_id_fk";
  
  DROP INDEX "contacts_photo_idx";
  DROP INDEX "audiences_hero_image_idx";
  DROP INDEX "audiences_contact_contact_person_idx";
  ALTER TABLE "audiences_links" ADD CONSTRAINT "audiences_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."audiences"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "audiences_links_order_idx" ON "audiences_links" USING btree ("_order");
  CREATE INDEX "audiences_links_parent_id_idx" ON "audiences_links" USING btree ("_parent_id");
  ALTER TABLE "contacts" DROP COLUMN "photo_id";
  ALTER TABLE "audiences" DROP COLUMN "hero_image_id";
  ALTER TABLE "audiences" DROP COLUMN "faq_help_title";
  ALTER TABLE "audiences" DROP COLUMN "faq_help_text";
  ALTER TABLE "audiences" DROP COLUMN "contact_label";
  ALTER TABLE "audiences" DROP COLUMN "contact_person_id";`)
}
