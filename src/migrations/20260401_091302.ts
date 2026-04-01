import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_posts_category" AS ENUM('nieuws', 'overig');
  ALTER TABLE "media" ADD COLUMN "sizes_news_card_url" varchar;
  ALTER TABLE "media" ADD COLUMN "sizes_news_card_width" numeric;
  ALTER TABLE "media" ADD COLUMN "sizes_news_card_height" numeric;
  ALTER TABLE "media" ADD COLUMN "sizes_news_card_mime_type" varchar;
  ALTER TABLE "media" ADD COLUMN "sizes_news_card_filesize" numeric;
  ALTER TABLE "media" ADD COLUMN "sizes_news_card_filename" varchar;
  ALTER TABLE "media" ADD COLUMN "sizes_featured_post_url" varchar;
  ALTER TABLE "media" ADD COLUMN "sizes_featured_post_width" numeric;
  ALTER TABLE "media" ADD COLUMN "sizes_featured_post_height" numeric;
  ALTER TABLE "media" ADD COLUMN "sizes_featured_post_mime_type" varchar;
  ALTER TABLE "media" ADD COLUMN "sizes_featured_post_filesize" numeric;
  ALTER TABLE "media" ADD COLUMN "sizes_featured_post_filename" varchar;
  ALTER TABLE "posts" ADD COLUMN "category" "enum_posts_category" DEFAULT 'nieuws';
  CREATE INDEX "media_sizes_news_card_sizes_news_card_filename_idx" ON "media" USING btree ("sizes_news_card_filename");
  CREATE INDEX "media_sizes_featured_post_sizes_featured_post_filename_idx" ON "media" USING btree ("sizes_featured_post_filename");
  ALTER TABLE "pages" DROP COLUMN "cta_block_enabled";
  ALTER TABLE "pages" DROP COLUMN "cta_block_button_label";
  ALTER TABLE "pages" DROP COLUMN "cta_block_button_url";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP INDEX "media_sizes_news_card_sizes_news_card_filename_idx";
  DROP INDEX "media_sizes_featured_post_sizes_featured_post_filename_idx";
  ALTER TABLE "pages" ADD COLUMN "cta_block_enabled" boolean DEFAULT false;
  ALTER TABLE "pages" ADD COLUMN "cta_block_button_label" varchar;
  ALTER TABLE "pages" ADD COLUMN "cta_block_button_url" varchar;
  ALTER TABLE "media" DROP COLUMN "sizes_news_card_url";
  ALTER TABLE "media" DROP COLUMN "sizes_news_card_width";
  ALTER TABLE "media" DROP COLUMN "sizes_news_card_height";
  ALTER TABLE "media" DROP COLUMN "sizes_news_card_mime_type";
  ALTER TABLE "media" DROP COLUMN "sizes_news_card_filesize";
  ALTER TABLE "media" DROP COLUMN "sizes_news_card_filename";
  ALTER TABLE "media" DROP COLUMN "sizes_featured_post_url";
  ALTER TABLE "media" DROP COLUMN "sizes_featured_post_width";
  ALTER TABLE "media" DROP COLUMN "sizes_featured_post_height";
  ALTER TABLE "media" DROP COLUMN "sizes_featured_post_mime_type";
  ALTER TABLE "media" DROP COLUMN "sizes_featured_post_filesize";
  ALTER TABLE "media" DROP COLUMN "sizes_featured_post_filename";
  ALTER TABLE "posts" DROP COLUMN "category";
  DROP TYPE "public"."enum_posts_category";`)
}
