-- Migration 0002: Additive Media schema enhancements for CMS-3
ALTER TABLE "media" ADD COLUMN IF NOT EXISTS "original_filename" varchar(255);
--> statement-breakpoint
ALTER TABLE "media" ADD COLUMN IF NOT EXISTS "storage_provider" varchar(50) DEFAULT 'legacy_public' NOT NULL;
--> statement-breakpoint
ALTER TABLE "media" ADD COLUMN IF NOT EXISTS "storage_key" varchar(512);
--> statement-breakpoint
ALTER TABLE "media" ADD COLUMN IF NOT EXISTS "thumbnail_url" text;
--> statement-breakpoint
ALTER TABLE "media" ADD COLUMN IF NOT EXISTS "checksum" varchar(64);
--> statement-breakpoint
ALTER TABLE "media" ADD COLUMN IF NOT EXISTS "status" varchar(32) DEFAULT 'active' NOT NULL;
--> statement-breakpoint
ALTER TABLE "media" ADD COLUMN IF NOT EXISTS "metadata" jsonb DEFAULT '{}'::jsonb NOT NULL;
--> statement-breakpoint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'media_created_by_users_id_fk' AND table_name = 'media'
  ) THEN
    ALTER TABLE "media" ADD COLUMN IF NOT EXISTS "created_by" uuid;
    ALTER TABLE "media" ADD CONSTRAINT "media_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL;
  END IF;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_media_checksum" ON "media" ("checksum");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_media_status" ON "media" ("status");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_media_mime_type" ON "media" ("mime_type");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_media_created_at" ON "media" ("created_at");
