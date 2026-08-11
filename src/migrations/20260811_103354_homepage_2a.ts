import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TYPE "public"."enum_sponsors_tier" ADD VALUE 'sub' BEFORE 'regular';
  ALTER TYPE "public"."enum_sponsors_tier" ADD VALUE 'youth' BEFORE 'regular';
  CREATE TABLE "contacts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"role" varchar,
  	"email" varchar,
  	"phone" varchar,
  	"group" varchar,
  	"order" numeric DEFAULT 0,
  	"show_in_contact_form" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "audiences_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"description" varchar,
  	"href" varchar NOT NULL
  );
  
  CREATE TABLE "audiences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"order" numeric DEFAULT 0,
  	"show_on_home" boolean DEFAULT true,
  	"card_title" varchar NOT NULL,
  	"card_description" varchar NOT NULL,
  	"intro" varchar,
  	"body" jsonb,
  	"meta_title" varchar,
  	"meta_description" varchar,
  	"cta_enabled" boolean DEFAULT false,
  	"cta_title" varchar,
  	"cta_text" varchar,
  	"cta_button_label" varchar,
  	"cta_button_url" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "contacts_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "audiences_id" integer;
  ALTER TABLE "audiences_links" ADD CONSTRAINT "audiences_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."audiences"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "contacts_updated_at_idx" ON "contacts" USING btree ("updated_at");
  CREATE INDEX "contacts_created_at_idx" ON "contacts" USING btree ("created_at");
  CREATE INDEX "audiences_links_order_idx" ON "audiences_links" USING btree ("_order");
  CREATE INDEX "audiences_links_parent_id_idx" ON "audiences_links" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "audiences_slug_idx" ON "audiences" USING btree ("slug");
  CREATE INDEX "audiences_updated_at_idx" ON "audiences" USING btree ("updated_at");
  CREATE INDEX "audiences_created_at_idx" ON "audiences" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_contacts_fk" FOREIGN KEY ("contacts_id") REFERENCES "public"."contacts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_audiences_fk" FOREIGN KEY ("audiences_id") REFERENCES "public"."audiences"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_contacts_id_idx" ON "payload_locked_documents_rels" USING btree ("contacts_id");
  CREATE INDEX "payload_locked_documents_rels_audiences_id_idx" ON "payload_locked_documents_rels" USING btree ("audiences_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "contacts" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "audiences_links" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "audiences" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "contacts" CASCADE;
  DROP TABLE "audiences_links" CASCADE;
  DROP TABLE "audiences" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_contacts_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_audiences_fk";
  
  ALTER TABLE "sponsors" ALTER COLUMN "tier" SET DATA TYPE text;
  ALTER TABLE "sponsors" ALTER COLUMN "tier" SET DEFAULT 'regular'::text;
  DROP TYPE "public"."enum_sponsors_tier";
  CREATE TYPE "public"."enum_sponsors_tier" AS ENUM('main', 'regular');
  ALTER TABLE "sponsors" ALTER COLUMN "tier" SET DEFAULT 'regular'::"public"."enum_sponsors_tier";
  ALTER TABLE "sponsors" ALTER COLUMN "tier" SET DATA TYPE "public"."enum_sponsors_tier" USING "tier"::"public"."enum_sponsors_tier";
  DROP INDEX "payload_locked_documents_rels_contacts_id_idx";
  DROP INDEX "payload_locked_documents_rels_audiences_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "contacts_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "audiences_id";`)
}
