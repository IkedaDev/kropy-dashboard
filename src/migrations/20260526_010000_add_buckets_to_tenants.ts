import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "tenants" ADD COLUMN IF NOT EXISTS "buckets_provider" varchar;
    ALTER TABLE "tenants" ADD COLUMN IF NOT EXISTS "buckets_r2_bucket_name" varchar;
    ALTER TABLE "tenants" ADD COLUMN IF NOT EXISTS "buckets_r2_access_key_id" varchar;
    ALTER TABLE "tenants" ADD COLUMN IF NOT EXISTS "buckets_r2_secret_access_key" varchar;
    ALTER TABLE "tenants" ADD COLUMN IF NOT EXISTS "buckets_r2_account_id" varchar;
    ALTER TABLE "tenants" ADD COLUMN IF NOT EXISTS "buckets_r2_public_url" varchar;

    CREATE TABLE IF NOT EXISTS "customers_sessions" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "created_at" timestamp(3) with time zone,
      "expires_at" timestamp(3) with time zone NOT NULL
    );

    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'customers_sessions_parent_id_fk'
      ) THEN
        ALTER TABLE "customers_sessions" ADD CONSTRAINT "customers_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."customers"("id") ON DELETE cascade ON UPDATE no action;
      END IF;
    END $$;

    CREATE INDEX IF NOT EXISTS "customers_sessions_order_idx" ON "customers_sessions" USING btree ("_order");
    CREATE INDEX IF NOT EXISTS "customers_sessions_parent_id_idx" ON "customers_sessions" USING btree ("_parent_id");

    ALTER TABLE "store_settings_locales" ADD COLUMN IF NOT EXISTS "shipping_shipping_policies" jsonb;
    ALTER TABLE "store_settings_locales" DROP COLUMN IF EXISTS "shipping_description";
  `)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "tenants" DROP COLUMN IF EXISTS "buckets_provider";
    ALTER TABLE "tenants" DROP COLUMN IF EXISTS "buckets_r2_bucket_name";
    ALTER TABLE "tenants" DROP COLUMN IF EXISTS "buckets_r2_access_key_id";
    ALTER TABLE "tenants" DROP COLUMN IF EXISTS "buckets_r2_secret_access_key";
    ALTER TABLE "tenants" DROP COLUMN IF EXISTS "buckets_r2_account_id";
    ALTER TABLE "tenants" DROP COLUMN IF EXISTS "buckets_r2_public_url";

    DROP TABLE IF EXISTS "customers_sessions" CASCADE;

    ALTER TABLE "store_settings_locales" ADD COLUMN IF NOT EXISTS "shipping_description" jsonb;
    ALTER TABLE "store_settings_locales" DROP COLUMN IF EXISTS "shipping_shipping_policies";
  `)
}
