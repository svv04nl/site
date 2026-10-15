import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_donations_status" AS ENUM('open', 'betaald', 'geannuleerd', 'verlopen', 'mislukt');
  CREATE TABLE "fundraisers" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"active" boolean DEFAULT true,
  	"goal_amount" numeric,
  	"transaction_fee" numeric DEFAULT 0.29,
  	"seat_price" numeric DEFAULT 30 NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "donations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"fundraiser_id" integer NOT NULL,
  	"name" varchar NOT NULL,
  	"email" varchar NOT NULL,
  	"is_company" boolean DEFAULT false,
  	"company_name" varchar,
  	"show_on_list" boolean DEFAULT false,
  	"name_on_tribune" boolean DEFAULT false,
  	"seats" numeric NOT NULL,
  	"free_amount" numeric NOT NULL,
  	"amount" numeric NOT NULL,
  	"fee" numeric DEFAULT 0,
  	"status" "enum_donations_status" DEFAULT 'open' NOT NULL,
  	"paid_at" timestamp(3) with time zone,
  	"method" varchar,
  	"mollie_id" varchar,
  	"public_token" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "fundraisers_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "donations_id" integer;
  ALTER TABLE "donations" ADD CONSTRAINT "donations_fundraiser_id_fundraisers_id_fk" FOREIGN KEY ("fundraiser_id") REFERENCES "public"."fundraisers"("id") ON DELETE set null ON UPDATE no action;
  CREATE UNIQUE INDEX "fundraisers_slug_idx" ON "fundraisers" USING btree ("slug");
  CREATE INDEX "fundraisers_updated_at_idx" ON "fundraisers" USING btree ("updated_at");
  CREATE INDEX "fundraisers_created_at_idx" ON "fundraisers" USING btree ("created_at");
  CREATE INDEX "donations_fundraiser_idx" ON "donations" USING btree ("fundraiser_id");
  CREATE INDEX "donations_name_on_tribune_idx" ON "donations" USING btree ("name_on_tribune");
  CREATE INDEX "donations_status_idx" ON "donations" USING btree ("status");
  CREATE INDEX "donations_mollie_id_idx" ON "donations" USING btree ("mollie_id");
  CREATE UNIQUE INDEX "donations_public_token_idx" ON "donations" USING btree ("public_token");
  CREATE INDEX "donations_updated_at_idx" ON "donations" USING btree ("updated_at");
  CREATE INDEX "donations_created_at_idx" ON "donations" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_fundraisers_fk" FOREIGN KEY ("fundraisers_id") REFERENCES "public"."fundraisers"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_donations_fk" FOREIGN KEY ("donations_id") REFERENCES "public"."donations"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_fundraisers_id_idx" ON "payload_locked_documents_rels" USING btree ("fundraisers_id");
  CREATE INDEX "payload_locked_documents_rels_donations_id_idx" ON "payload_locked_documents_rels" USING btree ("donations_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "fundraisers" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "donations" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "fundraisers" CASCADE;
  DROP TABLE "donations" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_fundraisers_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_donations_fk";
  
  DROP INDEX "payload_locked_documents_rels_fundraisers_id_idx";
  DROP INDEX "payload_locked_documents_rels_donations_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "fundraisers_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "donations_id";
  DROP TYPE "public"."enum_donations_status";`)
}
