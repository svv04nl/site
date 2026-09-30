import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "media" ADD COLUMN "sizes_hero_url" varchar;
  ALTER TABLE "media" ADD COLUMN "sizes_hero_width" numeric;
  ALTER TABLE "media" ADD COLUMN "sizes_hero_height" numeric;
  ALTER TABLE "media" ADD COLUMN "sizes_hero_mime_type" varchar;
  ALTER TABLE "media" ADD COLUMN "sizes_hero_filesize" numeric;
  ALTER TABLE "media" ADD COLUMN "sizes_hero_filename" varchar;
  ALTER TABLE "posts" ADD COLUMN "hero_featured" boolean DEFAULT false;
  ALTER TABLE "posts" ADD COLUMN "hero_from" timestamp(3) with time zone;
  ALTER TABLE "posts" ADD COLUMN "hero_until" timestamp(3) with time zone;
  ALTER TABLE "posts" ADD COLUMN "hero_image_id" integer;
  ALTER TABLE "posts" ADD COLUMN "hero_image_mobile_id" integer;
  ALTER TABLE "posts" ADD CONSTRAINT "posts_hero_image_id_media_id_fk" FOREIGN KEY ("hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts" ADD CONSTRAINT "posts_hero_image_mobile_id_media_id_fk" FOREIGN KEY ("hero_image_mobile_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "media_sizes_hero_sizes_hero_filename_idx" ON "media" USING btree ("sizes_hero_filename");
  CREATE INDEX "posts_hero_image_idx" ON "posts" USING btree ("hero_image_id");
  CREATE INDEX "posts_hero_image_mobile_idx" ON "posts" USING btree ("hero_image_mobile_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "posts" DROP CONSTRAINT "posts_hero_image_id_media_id_fk";
  
  ALTER TABLE "posts" DROP CONSTRAINT "posts_hero_image_mobile_id_media_id_fk";
  
  DROP INDEX "media_sizes_hero_sizes_hero_filename_idx";
  DROP INDEX "posts_hero_image_idx";
  DROP INDEX "posts_hero_image_mobile_idx";
  ALTER TABLE "media" DROP COLUMN "sizes_hero_url";
  ALTER TABLE "media" DROP COLUMN "sizes_hero_width";
  ALTER TABLE "media" DROP COLUMN "sizes_hero_height";
  ALTER TABLE "media" DROP COLUMN "sizes_hero_mime_type";
  ALTER TABLE "media" DROP COLUMN "sizes_hero_filesize";
  ALTER TABLE "media" DROP COLUMN "sizes_hero_filename";
  ALTER TABLE "posts" DROP COLUMN "hero_featured";
  ALTER TABLE "posts" DROP COLUMN "hero_from";
  ALTER TABLE "posts" DROP COLUMN "hero_until";
  ALTER TABLE "posts" DROP COLUMN "hero_image_id";
  ALTER TABLE "posts" DROP COLUMN "hero_image_mobile_id";`)
}
