import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."_locales" AS ENUM('es', 'en');
  CREATE TYPE "public"."enum_users_roles" AS ENUM('super-admin', 'user');
  CREATE TYPE "public"."enum_users_tenants_roles" AS ENUM('tenant-admin', 'tenant-viewer');
  CREATE TYPE "public"."enum_tenants_enabled_modules" AS ENUM('ecommerce', 'blog', 'restaurant', 'gallery');
  CREATE TYPE "public"."enum_orders_status_history_status" AS ENUM('pending', 'paid', 'shipped', 'cancelled');
  CREATE TYPE "public"."enum_orders_status" AS ENUM('pending', 'paid', 'shipped', 'cancelled');
  CREATE TYPE "public"."enum_discounts_type" AS ENUM('percentage', 'fixed');
  CREATE TYPE "public"."enum_authors_social_links_platform" AS ENUM('instagram', 'twitter', 'linkedin', 'facebook', 'youtube');
  CREATE TYPE "public"."enum_menu_items_allergens" AS ENUM('gluten', 'lactose', 'nuts', 'seafood');
  CREATE TYPE "public"."enum_menu_items_dietary" AS ENUM('vegan', 'vegetarian', 'celiac');
  CREATE TYPE "public"."enum_menu_items_status" AS ENUM('available', 'out_of_stock', 'draft');
  CREATE TYPE "public"."enum_combos_status" AS ENUM('available', 'out_of_stock', 'draft');
  CREATE TABLE "pages" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"tenant_id" integer,
  	"title" varchar NOT NULL,
  	"slug" varchar DEFAULT 'home',
  	"logo_id" integer,
  	"favicon_id" integer,
  	"contact_info_phone" varchar,
  	"contact_info_email" varchar,
  	"contact_info_address" varchar,
  	"social_links_whatsapp" varchar,
  	"social_links_instagram" varchar,
  	"social_links_facebook" varchar,
  	"social_links_twitter" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "users_roles" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_users_roles",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "users_tenants_roles" (
  	"order" integer NOT NULL,
  	"parent_id" varchar NOT NULL,
  	"value" "enum_users_tenants_roles",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "users_tenants" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"tenant_id" integer NOT NULL
  );
  
  CREATE TABLE "users_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "users" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"password" varchar,
  	"username" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE "tenants_enabled_modules" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_tenants_enabled_modules",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "tenants" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"domain" varchar,
  	"slug" varchar NOT NULL,
  	"allow_public_read" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "products_images" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer NOT NULL
  );
  
  CREATE TABLE "products_variants" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"variant_name" varchar,
  	"sku" varchar,
  	"price" numeric,
  	"compare_at_price" numeric,
  	"stock" numeric DEFAULT 0
  );
  
  CREATE TABLE "products" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"tenant_id" integer,
  	"slug" varchar NOT NULL,
  	"price" numeric NOT NULL,
  	"compare_at_price" numeric,
  	"stock" numeric DEFAULT 0 NOT NULL,
  	"brand_id" integer,
  	"has_variants" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "products_locales" (
  	"title" varchar NOT NULL,
  	"description" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "products_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"categories_id" integer
  );
  
  CREATE TABLE "media" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"tenant_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric
  );
  
  CREATE TABLE "orders_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"product_id" integer,
  	"variant_id" varchar,
  	"title" varchar NOT NULL,
  	"price" numeric NOT NULL,
  	"quantity" numeric NOT NULL
  );
  
  CREATE TABLE "orders_status_history" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"status" "enum_orders_status_history_status" NOT NULL,
  	"changed_at" timestamp(3) with time zone NOT NULL,
  	"changed_by_id" integer,
  	"notes" varchar
  );
  
  CREATE TABLE "orders" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"tenant_id" integer,
  	"order_code" varchar NOT NULL,
  	"external_id" varchar NOT NULL,
  	"customer_ref_id" integer,
  	"customer_name" varchar NOT NULL,
  	"customer_email" varchar NOT NULL,
  	"customer_phone" varchar,
  	"customer_shipping_address" varchar,
  	"subtotal" numeric NOT NULL,
  	"shipping_cost" numeric DEFAULT 0,
  	"discount_amount" numeric DEFAULT 0,
  	"total" numeric NOT NULL,
  	"status" "enum_orders_status" DEFAULT 'pending' NOT NULL,
  	"discount_code_id" integer,
  	"was_stock_discounted" boolean DEFAULT false,
  	"was_coupon_counted" boolean DEFAULT false,
  	"shipping_courier" varchar,
  	"tracking_number" varchar,
  	"internal_notes" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "categories" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"tenant_id" integer,
  	"slug" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "categories_locales" (
  	"title" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "store_settings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"tenant_id" integer,
  	"name" varchar DEFAULT 'Configuración de Tienda' NOT NULL,
  	"shipping_flat_rate" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "store_settings_locales" (
  	"shipping_description" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "customers" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"tenant_id" integer,
  	"name" varchar NOT NULL,
  	"email" varchar NOT NULL,
  	"phone" varchar,
  	"address" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "discounts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"tenant_id" integer,
  	"code" varchar NOT NULL,
  	"type" "enum_discounts_type" DEFAULT 'percentage' NOT NULL,
  	"value" numeric NOT NULL,
  	"min_purchase_amount" numeric,
  	"usage_limit" numeric,
  	"usage_count" numeric DEFAULT 0,
  	"valid_from" timestamp(3) with time zone,
  	"valid_until" timestamp(3) with time zone,
  	"active" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "discounts_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"products_id" integer,
  	"categories_id" integer
  );
  
  CREATE TABLE "brands" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"tenant_id" integer,
  	"name" varchar NOT NULL,
  	"logo_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "brands_locales" (
  	"description" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "product_reviews" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"tenant_id" integer,
  	"product_id" integer NOT NULL,
  	"customer_id" integer,
  	"reviewer_name" varchar NOT NULL,
  	"rating" numeric NOT NULL,
  	"comment" varchar NOT NULL,
  	"approved" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "authors_social_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"platform" "enum_authors_social_links_platform" NOT NULL,
  	"url" varchar NOT NULL
  );
  
  CREATE TABLE "authors" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"tenant_id" integer,
  	"name" varchar NOT NULL,
  	"avatar_id" integer NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "authors_locales" (
  	"bio" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "blog_categories" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"tenant_id" integer,
  	"slug" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "blog_categories_locales" (
  	"name" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "posts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"tenant_id" integer,
  	"slug" varchar NOT NULL,
  	"cover_image_id" integer NOT NULL,
  	"author_id" integer,
  	"published_at" timestamp(3) with time zone NOT NULL,
  	"reading_time" numeric,
  	"seo_meta_title" varchar,
  	"seo_meta_description" varchar,
  	"seo_meta_image_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "posts_locales" (
  	"title" varchar NOT NULL,
  	"excerpt" varchar,
  	"content" jsonb NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "posts_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"blog_categories_id" integer
  );
  
  CREATE TABLE "modifier_groups_options" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"additional_price" numeric DEFAULT 0
  );
  
  CREATE TABLE "modifier_groups_options_locales" (
  	"name" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "modifier_groups" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"tenant_id" integer,
  	"required" boolean DEFAULT false,
  	"min_selections" numeric DEFAULT 0 NOT NULL,
  	"max_selections" numeric DEFAULT 1 NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "modifier_groups_locales" (
  	"name" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "menu_sections" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"tenant_id" integer,
  	"order" numeric DEFAULT 0 NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "menu_sections_locales" (
  	"name" varchar NOT NULL,
  	"description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "menu_items_allergens" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_menu_items_allergens",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "menu_items_dietary" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_menu_items_dietary",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "menu_items" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"tenant_id" integer,
  	"price" numeric NOT NULL,
  	"image_id" integer,
  	"section_id" integer NOT NULL,
  	"status" "enum_menu_items_status" DEFAULT 'available' NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "menu_items_locales" (
  	"name" varchar NOT NULL,
  	"description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "menu_items_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"modifier_groups_id" integer
  );
  
  CREATE TABLE "combos_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"is_required" boolean DEFAULT true
  );
  
  CREATE TABLE "combos_steps_locales" (
  	"step_name" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "combos" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"tenant_id" integer,
  	"price" numeric NOT NULL,
  	"image_id" integer,
  	"status" "enum_combos_status" DEFAULT 'available' NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "combos_locales" (
  	"name" varchar NOT NULL,
  	"description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "combos_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"menu_items_id" integer
  );
  
  CREATE TABLE "menus" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"tenant_id" integer,
  	"slug" varchar NOT NULL,
  	"active" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "menus_locales" (
  	"title" varchar NOT NULL,
  	"description" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "menus_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"menu_sections_id" integer
  );
  
  CREATE TABLE "payload_kv" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"data" jsonb NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"pages_id" integer,
  	"users_id" integer,
  	"tenants_id" integer,
  	"products_id" integer,
  	"media_id" integer,
  	"orders_id" integer,
  	"categories_id" integer,
  	"store_settings_id" integer,
  	"customers_id" integer,
  	"discounts_id" integer,
  	"brands_id" integer,
  	"product_reviews_id" integer,
  	"authors_id" integer,
  	"blog_categories_id" integer,
  	"posts_id" integer,
  	"modifier_groups_id" integer,
  	"menu_sections_id" integer,
  	"menu_items_id" integer,
  	"combos_id" integer,
  	"menus_id" integer
  );
  
  CREATE TABLE "payload_preferences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  CREATE TABLE "payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "pages" ADD CONSTRAINT "pages_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages" ADD CONSTRAINT "pages_logo_id_media_id_fk" FOREIGN KEY ("logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages" ADD CONSTRAINT "pages_favicon_id_media_id_fk" FOREIGN KEY ("favicon_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "users_roles" ADD CONSTRAINT "users_roles_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "users_tenants_roles" ADD CONSTRAINT "users_tenants_roles_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."users_tenants"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "users_tenants" ADD CONSTRAINT "users_tenants_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "users_tenants" ADD CONSTRAINT "users_tenants_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "users_sessions" ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "tenants_enabled_modules" ADD CONSTRAINT "tenants_enabled_modules_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_images" ADD CONSTRAINT "products_images_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "products_images" ADD CONSTRAINT "products_images_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_variants" ADD CONSTRAINT "products_variants_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products" ADD CONSTRAINT "products_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "products" ADD CONSTRAINT "products_brand_id_brands_id_fk" FOREIGN KEY ("brand_id") REFERENCES "public"."brands"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "products_locales" ADD CONSTRAINT "products_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_rels" ADD CONSTRAINT "products_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_rels" ADD CONSTRAINT "products_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "media" ADD CONSTRAINT "media_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "orders_items" ADD CONSTRAINT "orders_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "orders_items" ADD CONSTRAINT "orders_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "orders_status_history" ADD CONSTRAINT "orders_status_history_changed_by_id_users_id_fk" FOREIGN KEY ("changed_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "orders_status_history" ADD CONSTRAINT "orders_status_history_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "orders" ADD CONSTRAINT "orders_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "orders" ADD CONSTRAINT "orders_customer_ref_id_customers_id_fk" FOREIGN KEY ("customer_ref_id") REFERENCES "public"."customers"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "orders" ADD CONSTRAINT "orders_discount_code_id_discounts_id_fk" FOREIGN KEY ("discount_code_id") REFERENCES "public"."discounts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "categories" ADD CONSTRAINT "categories_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "categories_locales" ADD CONSTRAINT "categories_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "store_settings" ADD CONSTRAINT "store_settings_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "store_settings_locales" ADD CONSTRAINT "store_settings_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."store_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "customers" ADD CONSTRAINT "customers_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "discounts" ADD CONSTRAINT "discounts_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "discounts_rels" ADD CONSTRAINT "discounts_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."discounts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "discounts_rels" ADD CONSTRAINT "discounts_rels_products_fk" FOREIGN KEY ("products_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "discounts_rels" ADD CONSTRAINT "discounts_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "brands" ADD CONSTRAINT "brands_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "brands" ADD CONSTRAINT "brands_logo_id_media_id_fk" FOREIGN KEY ("logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "brands_locales" ADD CONSTRAINT "brands_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."brands"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "product_reviews" ADD CONSTRAINT "product_reviews_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "product_reviews" ADD CONSTRAINT "product_reviews_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "product_reviews" ADD CONSTRAINT "product_reviews_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "authors_social_links" ADD CONSTRAINT "authors_social_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."authors"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "authors" ADD CONSTRAINT "authors_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "authors" ADD CONSTRAINT "authors_avatar_id_media_id_fk" FOREIGN KEY ("avatar_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "authors_locales" ADD CONSTRAINT "authors_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."authors"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "blog_categories" ADD CONSTRAINT "blog_categories_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "blog_categories_locales" ADD CONSTRAINT "blog_categories_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."blog_categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts" ADD CONSTRAINT "posts_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts" ADD CONSTRAINT "posts_cover_image_id_media_id_fk" FOREIGN KEY ("cover_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts" ADD CONSTRAINT "posts_author_id_authors_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."authors"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts" ADD CONSTRAINT "posts_seo_meta_image_id_media_id_fk" FOREIGN KEY ("seo_meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts_locales" ADD CONSTRAINT "posts_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_rels" ADD CONSTRAINT "posts_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_rels" ADD CONSTRAINT "posts_rels_blog_categories_fk" FOREIGN KEY ("blog_categories_id") REFERENCES "public"."blog_categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "modifier_groups_options" ADD CONSTRAINT "modifier_groups_options_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."modifier_groups"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "modifier_groups_options_locales" ADD CONSTRAINT "modifier_groups_options_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."modifier_groups_options"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "modifier_groups" ADD CONSTRAINT "modifier_groups_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "modifier_groups_locales" ADD CONSTRAINT "modifier_groups_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."modifier_groups"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "menu_sections" ADD CONSTRAINT "menu_sections_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "menu_sections_locales" ADD CONSTRAINT "menu_sections_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."menu_sections"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "menu_items_allergens" ADD CONSTRAINT "menu_items_allergens_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."menu_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "menu_items_dietary" ADD CONSTRAINT "menu_items_dietary_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."menu_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "menu_items" ADD CONSTRAINT "menu_items_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "menu_items" ADD CONSTRAINT "menu_items_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "menu_items" ADD CONSTRAINT "menu_items_section_id_menu_sections_id_fk" FOREIGN KEY ("section_id") REFERENCES "public"."menu_sections"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "menu_items_locales" ADD CONSTRAINT "menu_items_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."menu_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "menu_items_rels" ADD CONSTRAINT "menu_items_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."menu_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "menu_items_rels" ADD CONSTRAINT "menu_items_rels_modifier_groups_fk" FOREIGN KEY ("modifier_groups_id") REFERENCES "public"."modifier_groups"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "combos_steps" ADD CONSTRAINT "combos_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."combos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "combos_steps_locales" ADD CONSTRAINT "combos_steps_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."combos_steps"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "combos" ADD CONSTRAINT "combos_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "combos" ADD CONSTRAINT "combos_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "combos_locales" ADD CONSTRAINT "combos_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."combos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "combos_rels" ADD CONSTRAINT "combos_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."combos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "combos_rels" ADD CONSTRAINT "combos_rels_menu_items_fk" FOREIGN KEY ("menu_items_id") REFERENCES "public"."menu_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "menus" ADD CONSTRAINT "menus_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "menus_locales" ADD CONSTRAINT "menus_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."menus"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "menus_rels" ADD CONSTRAINT "menus_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."menus"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "menus_rels" ADD CONSTRAINT "menus_rels_menu_sections_fk" FOREIGN KEY ("menu_sections_id") REFERENCES "public"."menu_sections"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_tenants_fk" FOREIGN KEY ("tenants_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_products_fk" FOREIGN KEY ("products_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_orders_fk" FOREIGN KEY ("orders_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_store_settings_fk" FOREIGN KEY ("store_settings_id") REFERENCES "public"."store_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_customers_fk" FOREIGN KEY ("customers_id") REFERENCES "public"."customers"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_discounts_fk" FOREIGN KEY ("discounts_id") REFERENCES "public"."discounts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_brands_fk" FOREIGN KEY ("brands_id") REFERENCES "public"."brands"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_product_reviews_fk" FOREIGN KEY ("product_reviews_id") REFERENCES "public"."product_reviews"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_authors_fk" FOREIGN KEY ("authors_id") REFERENCES "public"."authors"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_blog_categories_fk" FOREIGN KEY ("blog_categories_id") REFERENCES "public"."blog_categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_modifier_groups_fk" FOREIGN KEY ("modifier_groups_id") REFERENCES "public"."modifier_groups"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_menu_sections_fk" FOREIGN KEY ("menu_sections_id") REFERENCES "public"."menu_sections"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_menu_items_fk" FOREIGN KEY ("menu_items_id") REFERENCES "public"."menu_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_combos_fk" FOREIGN KEY ("combos_id") REFERENCES "public"."combos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_menus_fk" FOREIGN KEY ("menus_id") REFERENCES "public"."menus"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_tenant_idx" ON "pages" USING btree ("tenant_id");
  CREATE INDEX "pages_slug_idx" ON "pages" USING btree ("slug");
  CREATE INDEX "pages_logo_idx" ON "pages" USING btree ("logo_id");
  CREATE INDEX "pages_favicon_idx" ON "pages" USING btree ("favicon_id");
  CREATE INDEX "pages_updated_at_idx" ON "pages" USING btree ("updated_at");
  CREATE INDEX "pages_created_at_idx" ON "pages" USING btree ("created_at");
  CREATE INDEX "users_roles_order_idx" ON "users_roles" USING btree ("order");
  CREATE INDEX "users_roles_parent_idx" ON "users_roles" USING btree ("parent_id");
  CREATE INDEX "users_tenants_roles_order_idx" ON "users_tenants_roles" USING btree ("order");
  CREATE INDEX "users_tenants_roles_parent_idx" ON "users_tenants_roles" USING btree ("parent_id");
  CREATE INDEX "users_tenants_order_idx" ON "users_tenants" USING btree ("_order");
  CREATE INDEX "users_tenants_parent_id_idx" ON "users_tenants" USING btree ("_parent_id");
  CREATE INDEX "users_tenants_tenant_idx" ON "users_tenants" USING btree ("tenant_id");
  CREATE INDEX "users_sessions_order_idx" ON "users_sessions" USING btree ("_order");
  CREATE INDEX "users_sessions_parent_id_idx" ON "users_sessions" USING btree ("_parent_id");
  CREATE INDEX "users_username_idx" ON "users" USING btree ("username");
  CREATE INDEX "users_updated_at_idx" ON "users" USING btree ("updated_at");
  CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");
  CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");
  CREATE INDEX "tenants_enabled_modules_order_idx" ON "tenants_enabled_modules" USING btree ("order");
  CREATE INDEX "tenants_enabled_modules_parent_idx" ON "tenants_enabled_modules" USING btree ("parent_id");
  CREATE INDEX "tenants_slug_idx" ON "tenants" USING btree ("slug");
  CREATE INDEX "tenants_allow_public_read_idx" ON "tenants" USING btree ("allow_public_read");
  CREATE INDEX "tenants_updated_at_idx" ON "tenants" USING btree ("updated_at");
  CREATE INDEX "tenants_created_at_idx" ON "tenants" USING btree ("created_at");
  CREATE INDEX "products_images_order_idx" ON "products_images" USING btree ("_order");
  CREATE INDEX "products_images_parent_id_idx" ON "products_images" USING btree ("_parent_id");
  CREATE INDEX "products_images_image_idx" ON "products_images" USING btree ("image_id");
  CREATE INDEX "products_variants_order_idx" ON "products_variants" USING btree ("_order");
  CREATE INDEX "products_variants_parent_id_idx" ON "products_variants" USING btree ("_parent_id");
  CREATE INDEX "products_tenant_idx" ON "products" USING btree ("tenant_id");
  CREATE INDEX "products_slug_idx" ON "products" USING btree ("slug");
  CREATE INDEX "products_brand_idx" ON "products" USING btree ("brand_id");
  CREATE INDEX "products_updated_at_idx" ON "products" USING btree ("updated_at");
  CREATE INDEX "products_created_at_idx" ON "products" USING btree ("created_at");
  CREATE UNIQUE INDEX "products_locales_locale_parent_id_unique" ON "products_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "products_rels_order_idx" ON "products_rels" USING btree ("order");
  CREATE INDEX "products_rels_parent_idx" ON "products_rels" USING btree ("parent_id");
  CREATE INDEX "products_rels_path_idx" ON "products_rels" USING btree ("path");
  CREATE INDEX "products_rels_categories_id_idx" ON "products_rels" USING btree ("categories_id");
  CREATE INDEX "media_tenant_idx" ON "media" USING btree ("tenant_id");
  CREATE INDEX "media_updated_at_idx" ON "media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "media" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "media" USING btree ("filename");
  CREATE INDEX "orders_items_order_idx" ON "orders_items" USING btree ("_order");
  CREATE INDEX "orders_items_parent_id_idx" ON "orders_items" USING btree ("_parent_id");
  CREATE INDEX "orders_items_product_idx" ON "orders_items" USING btree ("product_id");
  CREATE INDEX "orders_status_history_order_idx" ON "orders_status_history" USING btree ("_order");
  CREATE INDEX "orders_status_history_parent_id_idx" ON "orders_status_history" USING btree ("_parent_id");
  CREATE INDEX "orders_status_history_changed_by_idx" ON "orders_status_history" USING btree ("changed_by_id");
  CREATE INDEX "orders_tenant_idx" ON "orders" USING btree ("tenant_id");
  CREATE INDEX "orders_order_code_idx" ON "orders" USING btree ("order_code");
  CREATE UNIQUE INDEX "orders_external_id_idx" ON "orders" USING btree ("external_id");
  CREATE INDEX "orders_customer_ref_idx" ON "orders" USING btree ("customer_ref_id");
  CREATE INDEX "orders_discount_code_idx" ON "orders" USING btree ("discount_code_id");
  CREATE INDEX "orders_updated_at_idx" ON "orders" USING btree ("updated_at");
  CREATE INDEX "orders_created_at_idx" ON "orders" USING btree ("created_at");
  CREATE INDEX "categories_tenant_idx" ON "categories" USING btree ("tenant_id");
  CREATE INDEX "categories_slug_idx" ON "categories" USING btree ("slug");
  CREATE INDEX "categories_updated_at_idx" ON "categories" USING btree ("updated_at");
  CREATE INDEX "categories_created_at_idx" ON "categories" USING btree ("created_at");
  CREATE UNIQUE INDEX "categories_locales_locale_parent_id_unique" ON "categories_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "store_settings_tenant_idx" ON "store_settings" USING btree ("tenant_id");
  CREATE INDEX "store_settings_updated_at_idx" ON "store_settings" USING btree ("updated_at");
  CREATE INDEX "store_settings_created_at_idx" ON "store_settings" USING btree ("created_at");
  CREATE UNIQUE INDEX "store_settings_locales_locale_parent_id_unique" ON "store_settings_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "customers_tenant_idx" ON "customers" USING btree ("tenant_id");
  CREATE INDEX "customers_email_idx" ON "customers" USING btree ("email");
  CREATE INDEX "customers_updated_at_idx" ON "customers" USING btree ("updated_at");
  CREATE INDEX "customers_created_at_idx" ON "customers" USING btree ("created_at");
  CREATE INDEX "discounts_tenant_idx" ON "discounts" USING btree ("tenant_id");
  CREATE INDEX "discounts_code_idx" ON "discounts" USING btree ("code");
  CREATE INDEX "discounts_updated_at_idx" ON "discounts" USING btree ("updated_at");
  CREATE INDEX "discounts_created_at_idx" ON "discounts" USING btree ("created_at");
  CREATE INDEX "discounts_rels_order_idx" ON "discounts_rels" USING btree ("order");
  CREATE INDEX "discounts_rels_parent_idx" ON "discounts_rels" USING btree ("parent_id");
  CREATE INDEX "discounts_rels_path_idx" ON "discounts_rels" USING btree ("path");
  CREATE INDEX "discounts_rels_products_id_idx" ON "discounts_rels" USING btree ("products_id");
  CREATE INDEX "discounts_rels_categories_id_idx" ON "discounts_rels" USING btree ("categories_id");
  CREATE INDEX "brands_tenant_idx" ON "brands" USING btree ("tenant_id");
  CREATE INDEX "brands_logo_idx" ON "brands" USING btree ("logo_id");
  CREATE INDEX "brands_updated_at_idx" ON "brands" USING btree ("updated_at");
  CREATE INDEX "brands_created_at_idx" ON "brands" USING btree ("created_at");
  CREATE UNIQUE INDEX "brands_locales_locale_parent_id_unique" ON "brands_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "product_reviews_tenant_idx" ON "product_reviews" USING btree ("tenant_id");
  CREATE INDEX "product_reviews_product_idx" ON "product_reviews" USING btree ("product_id");
  CREATE INDEX "product_reviews_customer_idx" ON "product_reviews" USING btree ("customer_id");
  CREATE INDEX "product_reviews_updated_at_idx" ON "product_reviews" USING btree ("updated_at");
  CREATE INDEX "product_reviews_created_at_idx" ON "product_reviews" USING btree ("created_at");
  CREATE INDEX "authors_social_links_order_idx" ON "authors_social_links" USING btree ("_order");
  CREATE INDEX "authors_social_links_parent_id_idx" ON "authors_social_links" USING btree ("_parent_id");
  CREATE INDEX "authors_tenant_idx" ON "authors" USING btree ("tenant_id");
  CREATE INDEX "authors_avatar_idx" ON "authors" USING btree ("avatar_id");
  CREATE INDEX "authors_updated_at_idx" ON "authors" USING btree ("updated_at");
  CREATE INDEX "authors_created_at_idx" ON "authors" USING btree ("created_at");
  CREATE UNIQUE INDEX "authors_locales_locale_parent_id_unique" ON "authors_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "blog_categories_tenant_idx" ON "blog_categories" USING btree ("tenant_id");
  CREATE INDEX "blog_categories_slug_idx" ON "blog_categories" USING btree ("slug");
  CREATE INDEX "blog_categories_updated_at_idx" ON "blog_categories" USING btree ("updated_at");
  CREATE INDEX "blog_categories_created_at_idx" ON "blog_categories" USING btree ("created_at");
  CREATE UNIQUE INDEX "blog_categories_locales_locale_parent_id_unique" ON "blog_categories_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "posts_tenant_idx" ON "posts" USING btree ("tenant_id");
  CREATE INDEX "posts_slug_idx" ON "posts" USING btree ("slug");
  CREATE INDEX "posts_cover_image_idx" ON "posts" USING btree ("cover_image_id");
  CREATE INDEX "posts_author_idx" ON "posts" USING btree ("author_id");
  CREATE INDEX "posts_seo_seo_meta_image_idx" ON "posts" USING btree ("seo_meta_image_id");
  CREATE INDEX "posts_updated_at_idx" ON "posts" USING btree ("updated_at");
  CREATE INDEX "posts_created_at_idx" ON "posts" USING btree ("created_at");
  CREATE UNIQUE INDEX "posts_locales_locale_parent_id_unique" ON "posts_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "posts_rels_order_idx" ON "posts_rels" USING btree ("order");
  CREATE INDEX "posts_rels_parent_idx" ON "posts_rels" USING btree ("parent_id");
  CREATE INDEX "posts_rels_path_idx" ON "posts_rels" USING btree ("path");
  CREATE INDEX "posts_rels_blog_categories_id_idx" ON "posts_rels" USING btree ("blog_categories_id");
  CREATE INDEX "modifier_groups_options_order_idx" ON "modifier_groups_options" USING btree ("_order");
  CREATE INDEX "modifier_groups_options_parent_id_idx" ON "modifier_groups_options" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "modifier_groups_options_locales_locale_parent_id_unique" ON "modifier_groups_options_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "modifier_groups_tenant_idx" ON "modifier_groups" USING btree ("tenant_id");
  CREATE INDEX "modifier_groups_updated_at_idx" ON "modifier_groups" USING btree ("updated_at");
  CREATE INDEX "modifier_groups_created_at_idx" ON "modifier_groups" USING btree ("created_at");
  CREATE UNIQUE INDEX "modifier_groups_locales_locale_parent_id_unique" ON "modifier_groups_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "menu_sections_tenant_idx" ON "menu_sections" USING btree ("tenant_id");
  CREATE INDEX "menu_sections_updated_at_idx" ON "menu_sections" USING btree ("updated_at");
  CREATE INDEX "menu_sections_created_at_idx" ON "menu_sections" USING btree ("created_at");
  CREATE UNIQUE INDEX "menu_sections_locales_locale_parent_id_unique" ON "menu_sections_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "menu_items_allergens_order_idx" ON "menu_items_allergens" USING btree ("order");
  CREATE INDEX "menu_items_allergens_parent_idx" ON "menu_items_allergens" USING btree ("parent_id");
  CREATE INDEX "menu_items_dietary_order_idx" ON "menu_items_dietary" USING btree ("order");
  CREATE INDEX "menu_items_dietary_parent_idx" ON "menu_items_dietary" USING btree ("parent_id");
  CREATE INDEX "menu_items_tenant_idx" ON "menu_items" USING btree ("tenant_id");
  CREATE INDEX "menu_items_image_idx" ON "menu_items" USING btree ("image_id");
  CREATE INDEX "menu_items_section_idx" ON "menu_items" USING btree ("section_id");
  CREATE INDEX "menu_items_updated_at_idx" ON "menu_items" USING btree ("updated_at");
  CREATE INDEX "menu_items_created_at_idx" ON "menu_items" USING btree ("created_at");
  CREATE UNIQUE INDEX "menu_items_locales_locale_parent_id_unique" ON "menu_items_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "menu_items_rels_order_idx" ON "menu_items_rels" USING btree ("order");
  CREATE INDEX "menu_items_rels_parent_idx" ON "menu_items_rels" USING btree ("parent_id");
  CREATE INDEX "menu_items_rels_path_idx" ON "menu_items_rels" USING btree ("path");
  CREATE INDEX "menu_items_rels_modifier_groups_id_idx" ON "menu_items_rels" USING btree ("modifier_groups_id");
  CREATE INDEX "combos_steps_order_idx" ON "combos_steps" USING btree ("_order");
  CREATE INDEX "combos_steps_parent_id_idx" ON "combos_steps" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "combos_steps_locales_locale_parent_id_unique" ON "combos_steps_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "combos_tenant_idx" ON "combos" USING btree ("tenant_id");
  CREATE INDEX "combos_image_idx" ON "combos" USING btree ("image_id");
  CREATE INDEX "combos_updated_at_idx" ON "combos" USING btree ("updated_at");
  CREATE INDEX "combos_created_at_idx" ON "combos" USING btree ("created_at");
  CREATE UNIQUE INDEX "combos_locales_locale_parent_id_unique" ON "combos_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "combos_rels_order_idx" ON "combos_rels" USING btree ("order");
  CREATE INDEX "combos_rels_parent_idx" ON "combos_rels" USING btree ("parent_id");
  CREATE INDEX "combos_rels_path_idx" ON "combos_rels" USING btree ("path");
  CREATE INDEX "combos_rels_menu_items_id_idx" ON "combos_rels" USING btree ("menu_items_id");
  CREATE INDEX "menus_tenant_idx" ON "menus" USING btree ("tenant_id");
  CREATE INDEX "menus_slug_idx" ON "menus" USING btree ("slug");
  CREATE INDEX "menus_updated_at_idx" ON "menus" USING btree ("updated_at");
  CREATE INDEX "menus_created_at_idx" ON "menus" USING btree ("created_at");
  CREATE UNIQUE INDEX "menus_locales_locale_parent_id_unique" ON "menus_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "menus_rels_order_idx" ON "menus_rels" USING btree ("order");
  CREATE INDEX "menus_rels_parent_idx" ON "menus_rels" USING btree ("parent_id");
  CREATE INDEX "menus_rels_path_idx" ON "menus_rels" USING btree ("path");
  CREATE INDEX "menus_rels_menu_sections_id_idx" ON "menus_rels" USING btree ("menu_sections_id");
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "payload_kv" USING btree ("key");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_pages_id_idx" ON "payload_locked_documents_rels" USING btree ("pages_id");
  CREATE INDEX "payload_locked_documents_rels_users_id_idx" ON "payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX "payload_locked_documents_rels_tenants_id_idx" ON "payload_locked_documents_rels" USING btree ("tenants_id");
  CREATE INDEX "payload_locked_documents_rels_products_id_idx" ON "payload_locked_documents_rels" USING btree ("products_id");
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX "payload_locked_documents_rels_orders_id_idx" ON "payload_locked_documents_rels" USING btree ("orders_id");
  CREATE INDEX "payload_locked_documents_rels_categories_id_idx" ON "payload_locked_documents_rels" USING btree ("categories_id");
  CREATE INDEX "payload_locked_documents_rels_store_settings_id_idx" ON "payload_locked_documents_rels" USING btree ("store_settings_id");
  CREATE INDEX "payload_locked_documents_rels_customers_id_idx" ON "payload_locked_documents_rels" USING btree ("customers_id");
  CREATE INDEX "payload_locked_documents_rels_discounts_id_idx" ON "payload_locked_documents_rels" USING btree ("discounts_id");
  CREATE INDEX "payload_locked_documents_rels_brands_id_idx" ON "payload_locked_documents_rels" USING btree ("brands_id");
  CREATE INDEX "payload_locked_documents_rels_product_reviews_id_idx" ON "payload_locked_documents_rels" USING btree ("product_reviews_id");
  CREATE INDEX "payload_locked_documents_rels_authors_id_idx" ON "payload_locked_documents_rels" USING btree ("authors_id");
  CREATE INDEX "payload_locked_documents_rels_blog_categories_id_idx" ON "payload_locked_documents_rels" USING btree ("blog_categories_id");
  CREATE INDEX "payload_locked_documents_rels_posts_id_idx" ON "payload_locked_documents_rels" USING btree ("posts_id");
  CREATE INDEX "payload_locked_documents_rels_modifier_groups_id_idx" ON "payload_locked_documents_rels" USING btree ("modifier_groups_id");
  CREATE INDEX "payload_locked_documents_rels_menu_sections_id_idx" ON "payload_locked_documents_rels" USING btree ("menu_sections_id");
  CREATE INDEX "payload_locked_documents_rels_menu_items_id_idx" ON "payload_locked_documents_rels" USING btree ("menu_items_id");
  CREATE INDEX "payload_locked_documents_rels_combos_id_idx" ON "payload_locked_documents_rels" USING btree ("combos_id");
  CREATE INDEX "payload_locked_documents_rels_menus_id_idx" ON "payload_locked_documents_rels" USING btree ("menus_id");
  CREATE INDEX "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_users_id_idx" ON "payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "pages" CASCADE;
  DROP TABLE "users_roles" CASCADE;
  DROP TABLE "users_tenants_roles" CASCADE;
  DROP TABLE "users_tenants" CASCADE;
  DROP TABLE "users_sessions" CASCADE;
  DROP TABLE "users" CASCADE;
  DROP TABLE "tenants_enabled_modules" CASCADE;
  DROP TABLE "tenants" CASCADE;
  DROP TABLE "products_images" CASCADE;
  DROP TABLE "products_variants" CASCADE;
  DROP TABLE "products" CASCADE;
  DROP TABLE "products_locales" CASCADE;
  DROP TABLE "products_rels" CASCADE;
  DROP TABLE "media" CASCADE;
  DROP TABLE "orders_items" CASCADE;
  DROP TABLE "orders_status_history" CASCADE;
  DROP TABLE "orders" CASCADE;
  DROP TABLE "categories" CASCADE;
  DROP TABLE "categories_locales" CASCADE;
  DROP TABLE "store_settings" CASCADE;
  DROP TABLE "store_settings_locales" CASCADE;
  DROP TABLE "customers" CASCADE;
  DROP TABLE "discounts" CASCADE;
  DROP TABLE "discounts_rels" CASCADE;
  DROP TABLE "brands" CASCADE;
  DROP TABLE "brands_locales" CASCADE;
  DROP TABLE "product_reviews" CASCADE;
  DROP TABLE "authors_social_links" CASCADE;
  DROP TABLE "authors" CASCADE;
  DROP TABLE "authors_locales" CASCADE;
  DROP TABLE "blog_categories" CASCADE;
  DROP TABLE "blog_categories_locales" CASCADE;
  DROP TABLE "posts" CASCADE;
  DROP TABLE "posts_locales" CASCADE;
  DROP TABLE "posts_rels" CASCADE;
  DROP TABLE "modifier_groups_options" CASCADE;
  DROP TABLE "modifier_groups_options_locales" CASCADE;
  DROP TABLE "modifier_groups" CASCADE;
  DROP TABLE "modifier_groups_locales" CASCADE;
  DROP TABLE "menu_sections" CASCADE;
  DROP TABLE "menu_sections_locales" CASCADE;
  DROP TABLE "menu_items_allergens" CASCADE;
  DROP TABLE "menu_items_dietary" CASCADE;
  DROP TABLE "menu_items" CASCADE;
  DROP TABLE "menu_items_locales" CASCADE;
  DROP TABLE "menu_items_rels" CASCADE;
  DROP TABLE "combos_steps" CASCADE;
  DROP TABLE "combos_steps_locales" CASCADE;
  DROP TABLE "combos" CASCADE;
  DROP TABLE "combos_locales" CASCADE;
  DROP TABLE "combos_rels" CASCADE;
  DROP TABLE "menus" CASCADE;
  DROP TABLE "menus_locales" CASCADE;
  DROP TABLE "menus_rels" CASCADE;
  DROP TABLE "payload_kv" CASCADE;
  DROP TABLE "payload_locked_documents" CASCADE;
  DROP TABLE "payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload_preferences" CASCADE;
  DROP TABLE "payload_preferences_rels" CASCADE;
  DROP TABLE "payload_migrations" CASCADE;
  DROP TYPE "public"."_locales";
  DROP TYPE "public"."enum_users_roles";
  DROP TYPE "public"."enum_users_tenants_roles";
  DROP TYPE "public"."enum_tenants_enabled_modules";
  DROP TYPE "public"."enum_orders_status_history_status";
  DROP TYPE "public"."enum_orders_status";
  DROP TYPE "public"."enum_discounts_type";
  DROP TYPE "public"."enum_authors_social_links_platform";
  DROP TYPE "public"."enum_menu_items_allergens";
  DROP TYPE "public"."enum_menu_items_dietary";
  DROP TYPE "public"."enum_menu_items_status";
  DROP TYPE "public"."enum_combos_status";`)
}
