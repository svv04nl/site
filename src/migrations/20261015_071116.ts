import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

// Maakt het fundraiser-datamodel generiek: een optionele "eenheid" (naam, meervoud, prijs) in
// plaats van een stoeltjesprijs, en een instelbare tekst voor de toestemming om de naam
// fysiek te plaatsen. Handmatig geschreven met echte hernoemingen, zodat bestaande donaties
// behouden blijven (de gegenereerde variant verwisselde kolommen).
export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "fundraisers" RENAME COLUMN "seat_price" TO "unit_price";
  ALTER TABLE "fundraisers" ALTER COLUMN "unit_price" DROP NOT NULL;
  ALTER TABLE "fundraisers" ADD COLUMN "unit_name" varchar DEFAULT 'stoeltje';
  ALTER TABLE "fundraisers" ADD COLUMN "unit_name_plural" varchar DEFAULT 'stoeltjes';
  ALTER TABLE "fundraisers" ADD COLUMN "name_on_object_label" varchar DEFAULT 'Mijn naam mag op de tribune zelf geplaatst worden.';
  ALTER TABLE "donations" RENAME COLUMN "seats" TO "units";
  ALTER TABLE "donations" RENAME COLUMN "name_on_tribune" TO "name_on_object";
  ALTER INDEX "donations_name_on_tribune_idx" RENAME TO "donations_name_on_object_idx";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER INDEX "donations_name_on_object_idx" RENAME TO "donations_name_on_tribune_idx";
  ALTER TABLE "donations" RENAME COLUMN "name_on_object" TO "name_on_tribune";
  ALTER TABLE "donations" RENAME COLUMN "units" TO "seats";
  ALTER TABLE "fundraisers" DROP COLUMN "name_on_object_label";
  ALTER TABLE "fundraisers" DROP COLUMN "unit_name_plural";
  ALTER TABLE "fundraisers" DROP COLUMN "unit_name";
  UPDATE "fundraisers" SET "unit_price" = 30 WHERE "unit_price" IS NULL;
  ALTER TABLE "fundraisers" ALTER COLUMN "unit_price" SET NOT NULL;
  ALTER TABLE "fundraisers" RENAME COLUMN "unit_price" TO "seat_price";`)
}
