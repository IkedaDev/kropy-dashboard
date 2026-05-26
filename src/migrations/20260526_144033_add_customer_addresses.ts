import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
  CREATE TABLE IF NOT EXISTS "customers_addresses" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"street" varchar NOT NULL,
  	"number" varchar NOT NULL,
  	"apartment_or_office" varchar,
  	"city" varchar NOT NULL,
  	"state" varchar NOT NULL,
  	"postal_code" varchar,
  	"country" varchar DEFAULT 'Chile',
  	"is_default" boolean DEFAULT false
  );
  
  DROP INDEX IF EXISTS "customers_email_idx";
  CREATE UNIQUE INDEX IF NOT EXISTS "customers_email_idx" ON "customers" USING btree ("email");
  
  ALTER TABLE "customers" ADD COLUMN IF NOT EXISTS "reset_password_token" varchar;
  ALTER TABLE "customers" ADD COLUMN IF NOT EXISTS "reset_password_expiration" timestamp(3) with time zone;
  ALTER TABLE "customers" ADD COLUMN IF NOT EXISTS "salt" varchar;
  ALTER TABLE "customers" ADD COLUMN IF NOT EXISTS "hash" varchar;
  ALTER TABLE "customers" ADD COLUMN IF NOT EXISTS "login_attempts" numeric DEFAULT 0;
  ALTER TABLE "customers" ADD COLUMN IF NOT EXISTS "lock_until" timestamp(3) with time zone;
  
  ALTER TABLE "payload_preferences_rels" ADD COLUMN IF NOT EXISTS "customers_id" integer;
  
  DO $$
  BEGIN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.table_constraints 
      WHERE constraint_name = 'customers_addresses_parent_id_fk'
    ) THEN
      ALTER TABLE "customers_addresses" ADD CONSTRAINT "customers_addresses_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."customers"("id") ON DELETE cascade ON UPDATE no action;
    END IF;
  END $$;

  DO $$
  BEGIN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.table_constraints 
      WHERE constraint_name = 'payload_preferences_rels_customers_fk'
    ) THEN
      ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_customers_fk" FOREIGN KEY ("customers_id") REFERENCES "public"."customers"("id") ON DELETE cascade ON UPDATE no action;
    END IF;
  END $$;

  CREATE INDEX IF NOT EXISTS "customers_addresses_order_idx" ON "customers_addresses" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "customers_addresses_parent_id_idx" ON "customers_addresses" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "payload_preferences_rels_customers_id_idx" ON "payload_preferences_rels" USING btree ("customers_id");
  `)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
  ALTER TABLE "customers_addresses" DISABLE ROW LEVEL SECURITY;
  DROP TABLE IF EXISTS "customers_addresses" CASCADE;
  
  ALTER TABLE "payload_preferences_rels" DROP CONSTRAINT IF EXISTS "payload_preferences_rels_customers_fk";
  DROP INDEX IF EXISTS "payload_preferences_rels_customers_id_idx";
  
  ALTER TABLE "customers" DROP COLUMN IF EXISTS "reset_password_token";
  ALTER TABLE "customers" DROP COLUMN IF EXISTS "reset_password_expiration";
  ALTER TABLE "customers" DROP COLUMN IF EXISTS "salt";
  ALTER TABLE "customers" DROP COLUMN IF EXISTS "hash";
  ALTER TABLE "customers" DROP COLUMN IF EXISTS "login_attempts";
  ALTER TABLE "customers" DROP COLUMN IF EXISTS "lock_until";
  ALTER TABLE "payload_preferences_rels" DROP COLUMN IF EXISTS "customers_id";
  
  DROP INDEX IF EXISTS "customers_email_idx";
  CREATE INDEX IF NOT EXISTS "customers_email_idx" ON "customers" USING btree ("email");
  `)
}
