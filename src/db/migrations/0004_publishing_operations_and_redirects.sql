-- Migration 0004: Publishing Operations & Redirect Management Schema
-- 1. Extend redirects table with additive audit, entity provenance, and chain-flattening fields
ALTER TABLE "redirects" ADD COLUMN IF NOT EXISTS "entity_type" varchar(50);
--> statement-breakpoint
ALTER TABLE "redirects" ADD COLUMN IF NOT EXISTS "entity_id" varchar(255);
--> statement-breakpoint
ALTER TABLE "redirects" ADD COLUMN IF NOT EXISTS "created_from_revision_id" uuid;
--> statement-breakpoint
ALTER TABLE "redirects" ADD COLUMN IF NOT EXISTS "created_by" uuid;
--> statement-breakpoint
ALTER TABLE "redirects" ADD COLUMN IF NOT EXISTS "superseded_by_id" uuid;
--> statement-breakpoint
ALTER TABLE "redirects" ADD COLUMN IF NOT EXISTS "updated_at" timestamp with time zone DEFAULT now() NOT NULL;
--> statement-breakpoint
ALTER TABLE "redirects" ADD COLUMN IF NOT EXISTS "disabled_at" timestamp with time zone;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_redirects_entity" ON "redirects" ("entity_type", "entity_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_redirects_created_at" ON "redirects" ("created_at");
--> statement-breakpoint

-- 2. Create revalidation_operations table for persistent retry & observability
CREATE TABLE IF NOT EXISTS "revalidation_operations" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "entity_type" varchar(50) NOT NULL,
  "entity_id" varchar(255) NOT NULL,
  "revision_id" uuid,
  "paths" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "tags" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "status" varchar(20) DEFAULT 'pending' NOT NULL,
  "attempts" integer DEFAULT 1 NOT NULL,
  "last_error" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "last_attempt_at" timestamp with time zone DEFAULT now() NOT NULL,
  "resolved_at" timestamp with time zone
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_reval_ops_status" ON "revalidation_operations" ("status");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_reval_ops_entity" ON "revalidation_operations" ("entity_type", "entity_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_reval_ops_created_at" ON "revalidation_operations" ("created_at");
