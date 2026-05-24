import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_galleries_layout" AS ENUM('grid', 'masonry', 'carousel', 'slideshow');
  CREATE TABLE "galleries_images" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer NOT NULL,
  	"category_id" integer
  );
  
  CREATE TABLE "galleries_images_locales" (
  	"caption" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "galleries" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"tenant_id" integer,
  	"slug" varchar NOT NULL,
  	"cover_image_id" integer NOT NULL,
  	"layout" "enum_galleries_layout" DEFAULT 'grid' NOT NULL,
  	"active" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "galleries_locales" (
  	"title" varchar NOT NULL,
  	"description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "gallery_categories" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"tenant_id" integer,
  	"slug" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "gallery_categories_locales" (
  	"name" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "galleries_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "gallery_categories_id" integer;
  ALTER TABLE "galleries_images" ADD CONSTRAINT "galleries_images_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "galleries_images" ADD CONSTRAINT "galleries_images_category_id_gallery_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."gallery_categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "galleries_images" ADD CONSTRAINT "galleries_images_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."galleries"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "galleries_images_locales" ADD CONSTRAINT "galleries_images_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."galleries_images"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "galleries" ADD CONSTRAINT "galleries_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "galleries" ADD CONSTRAINT "galleries_cover_image_id_media_id_fk" FOREIGN KEY ("cover_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "galleries_locales" ADD CONSTRAINT "galleries_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."galleries"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "gallery_categories" ADD CONSTRAINT "gallery_categories_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "gallery_categories_locales" ADD CONSTRAINT "gallery_categories_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."gallery_categories"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "galleries_images_order_idx" ON "galleries_images" USING btree ("_order");
  CREATE INDEX "galleries_images_parent_id_idx" ON "galleries_images" USING btree ("_parent_id");
  CREATE INDEX "galleries_images_image_idx" ON "galleries_images" USING btree ("image_id");
  CREATE INDEX "galleries_images_category_idx" ON "galleries_images" USING btree ("category_id");
  CREATE UNIQUE INDEX "galleries_images_locales_locale_parent_id_unique" ON "galleries_images_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "galleries_tenant_idx" ON "galleries" USING btree ("tenant_id");
  CREATE INDEX "galleries_slug_idx" ON "galleries" USING btree ("slug");
  CREATE INDEX "galleries_cover_image_idx" ON "galleries" USING btree ("cover_image_id");
  CREATE INDEX "galleries_updated_at_idx" ON "galleries" USING btree ("updated_at");
  CREATE INDEX "galleries_created_at_idx" ON "galleries" USING btree ("created_at");
  CREATE UNIQUE INDEX "galleries_locales_locale_parent_id_unique" ON "galleries_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "gallery_categories_tenant_idx" ON "gallery_categories" USING btree ("tenant_id");
  CREATE INDEX "gallery_categories_slug_idx" ON "gallery_categories" USING btree ("slug");
  CREATE INDEX "gallery_categories_updated_at_idx" ON "gallery_categories" USING btree ("updated_at");
  CREATE INDEX "gallery_categories_created_at_idx" ON "gallery_categories" USING btree ("created_at");
  CREATE UNIQUE INDEX "gallery_categories_locales_locale_parent_id_unique" ON "gallery_categories_locales" USING btree ("_locale","_parent_id");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_galleries_fk" FOREIGN KEY ("galleries_id") REFERENCES "public"."galleries"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_gallery_categories_fk" FOREIGN KEY ("gallery_categories_id") REFERENCES "public"."gallery_categories"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_galleries_id_idx" ON "payload_locked_documents_rels" USING btree ("galleries_id");
  CREATE INDEX "payload_locked_documents_rels_gallery_categories_id_idx" ON "payload_locked_documents_rels" USING btree ("gallery_categories_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "galleries_images" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "galleries_images_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "galleries" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "galleries_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "gallery_categories" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "gallery_categories_locales" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "galleries_images" CASCADE;
  DROP TABLE "galleries_images_locales" CASCADE;
  DROP TABLE "galleries" CASCADE;
  DROP TABLE "galleries_locales" CASCADE;
  DROP TABLE "gallery_categories" CASCADE;
  DROP TABLE "gallery_categories_locales" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_galleries_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_gallery_categories_fk";
  
  DROP INDEX "payload_locked_documents_rels_galleries_id_idx";
  DROP INDEX "payload_locked_documents_rels_gallery_categories_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "galleries_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "gallery_categories_id";
  DROP TYPE "public"."enum_galleries_layout";`)
}
