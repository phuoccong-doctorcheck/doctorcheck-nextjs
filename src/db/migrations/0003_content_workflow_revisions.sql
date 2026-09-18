-- Migration 0003: Content Workflow & Revision History Schema
CREATE TABLE IF NOT EXISTS "content_revisions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"entity_type" varchar(64) NOT NULL,
	"entity_id" varchar(128) NOT NULL,
	"revision_number" integer NOT NULL,
	"status" varchar(32) DEFAULT 'draft' NOT NULL,
	"title" varchar(512),
	"payload" jsonb NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"change_summary" text,
	"medical_review_notes" text,
	"reviewed_by" uuid,
	"reviewed_at" timestamp with time zone,
	"published_by" uuid,
	"published_at" timestamp with time zone,
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "uq_revisions_entity_revision_num" UNIQUE("entity_type", "entity_id", "revision_number")
);
--> statement-breakpoint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'content_revisions_reviewed_by_users_id_fk' AND table_name = 'content_revisions'
  ) THEN
    ALTER TABLE "content_revisions" ADD CONSTRAINT "content_revisions_reviewed_by_users_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "users"("id") ON DELETE SET NULL;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'content_revisions_published_by_users_id_fk' AND table_name = 'content_revisions'
  ) THEN
    ALTER TABLE "content_revisions" ADD CONSTRAINT "content_revisions_published_by_users_id_fk" FOREIGN KEY ("published_by") REFERENCES "users"("id") ON DELETE SET NULL;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'content_revisions_created_by_users_id_fk' AND table_name = 'content_revisions'
  ) THEN
    ALTER TABLE "content_revisions" ADD CONSTRAINT "content_revisions_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL;
  END IF;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_revisions_entity" ON "content_revisions" ("entity_type", "entity_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_revisions_status" ON "content_revisions" ("status");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_revisions_created_at" ON "content_revisions" ("created_at");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_revisions_created_by" ON "content_revisions" ("created_by");
