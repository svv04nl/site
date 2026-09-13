import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "teams" ALTER COLUMN "category" SET DATA TYPE text;
  DROP TYPE "public"."enum_teams_category";
  UPDATE "teams" SET "category" = regexp_replace("category", '^Jeugd onder ', 'Onder ') WHERE "category" LIKE 'Jeugd onder %';
  CREATE TYPE "public"."enum_teams_category" AS ENUM('Mannen zaterdag', 'Mannen zondag', 'Futsal', 'Vrouwen 18+', 'Mannen 18+', 'Mannen 35+', 'Mannen 45+', 'Onder 21', 'Onder 19', 'Onder 17', 'Onder 15', 'Onder 14', 'Onder 13', 'Onder 12', 'Onder 11', 'Onder 10', 'Onder 9', 'Onder 8', 'Onder 7');
  ALTER TABLE "teams" ALTER COLUMN "category" SET DATA TYPE "public"."enum_teams_category" USING "category"::"public"."enum_teams_category";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "teams" ALTER COLUMN "category" SET DATA TYPE text;
  DROP TYPE "public"."enum_teams_category";
  UPDATE "teams" SET "category" = regexp_replace("category", '^Onder ', 'Jeugd onder ') WHERE "category" LIKE 'Onder %';
  CREATE TYPE "public"."enum_teams_category" AS ENUM('Mannen zaterdag', 'Mannen zondag', 'Futsal', 'Vrouwen 18+', 'Mannen 35+', 'Mannen 45+', 'Jeugd onder 21', 'Jeugd onder 19', 'Jeugd onder 17', 'Jeugd onder 15', 'Jeugd onder 13', 'Jeugd onder 12', 'Jeugd onder 11', 'Jeugd onder 10', 'Jeugd onder 9', 'Jeugd onder 8', 'Jeugd onder 7');
  ALTER TABLE "teams" ALTER COLUMN "category" SET DATA TYPE "public"."enum_teams_category" USING "category"::"public"."enum_teams_category";`)
}
