import { pgTable, uuid, varchar, text, integer, timestamp, jsonb, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './auth';

export const media = pgTable(
  'media',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    filename: varchar('filename', { length: 255 }).notNull(),
    originalFilename: varchar('original_filename', { length: 255 }),
    storageProvider: varchar('storage_provider', { length: 50 }).notNull().default('legacy_public'), // 'legacy_public' | 'local' | 's3'
    storagePath: varchar('storage_path', { length: 512 }).notNull().unique(), // e.g. '/sites/doctorcheck-vn/root/images/doctors/chau-quynh-phi-nha.webp' or '/uploads/media/2026/09/x.webp'
    storageKey: varchar('storage_key', { length: 512 }),
    publicUrl: text('public_url').notNull(),
    thumbnailUrl: text('thumbnail_url'),
    altText: varchar('alt_text', { length: 255 }).notNull().default(''),
    caption: text('caption'),
    mimeType: varchar('mime_type', { length: 100 }).notNull(), // 'image/webp', 'image/png', 'image/jpeg', etc.
    fileSizeBytes: integer('file_size_bytes').notNull().default(0),
    width: integer('width'),
    height: integer('height'),
    checksum: varchar('checksum', { length: 64 }), // SHA-256 hex string
    status: varchar('status', { length: 32 }).notNull().default('active'), // 'active' | 'archived'
    metadata: jsonb('metadata').notNull().default({}), // additional technical info (format, density, etc.)
    createdBy: uuid('created_by').references(() => users.id, { onDelete: 'set null' }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('idx_media_storage_path').on(table.storagePath),
    index('idx_media_checksum').on(table.checksum),
    index('idx_media_status').on(table.status),
    index('idx_media_mime_type').on(table.mimeType),
    index('idx_media_created_at').on(table.createdAt),
  ]
);

export const mediaRelations = relations(media, ({ one }) => ({
  creator: one(users, {
    fields: [media.createdBy],
    references: [users.id],
  }),
}));

export type Media = typeof media.$inferSelect;
export type NewMedia = typeof media.$inferInsert;
