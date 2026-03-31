import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  // Ensure 'meedoen' exists in the enum (safe to run on any DB state)
  await db.execute(sql`
    ALTER TYPE "public"."enum_pages_section" ADD VALUE IF NOT EXISTS 'meedoen';
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  // PostgreSQL does not support removing enum values natively.
}
