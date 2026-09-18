import { pgTable, uuid, varchar, text, numeric, timestamp, jsonb, boolean, integer, index } from 'drizzle-orm/pg-core';

export const clinicInfo = pgTable('clinic_info', {
  id: varchar('id', { length: 32 }).primaryKey().default('default'),
  name: varchar('name', { length: 255 }).notNull(),
  legalName: varchar('legal_name', { length: 255 }).notNull(),
  licenseNumber: varchar('license_number', { length: 128 }).notNull(), // '09361/HCM-GPHĐ'
  taxCode: varchar('tax_code', { length: 64 }).notNull(), // '0315729707'
  hotline: varchar('hotline', { length: 32 }).notNull(), // '028 5555 9999'
  emergencyPhone: varchar('emergency_phone', { length: 32 }),
  zaloUrl: text('zalo_url').notNull(),
  email: varchar('email', { length: 128 }).notNull(),
  addressStreet: varchar('address_street', { length: 255 }).notNull(),
  addressWard: varchar('address_ward', { length: 128 }).notNull(),
  addressDistrict: varchar('address_district', { length: 128 }).notNull(),
  addressCity: varchar('address_city', { length: 128 }).notNull(),
  addressFull: varchar('address_full', { length: 512 }).notNull(),
  latitude: numeric('latitude', { precision: 10, scale: 7 }).notNull(), // 10.7997
  longitude: numeric('longitude', { precision: 10, scale: 7 }).notNull(), // 106.6542
  workingHours: jsonb('working_hours').notNull().default({}),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const homepageBlocks = pgTable('homepage_blocks', {
  blockKey: varchar('block_key', { length: 64 }).primaryKey(), // 'hero', 'cancer_screening_banner', etc.
  title: varchar('title', { length: 255 }),
  subtitle: text('subtitle'),
  content: jsonb('content').notNull().default({}),
  isActive: boolean('is_active').notNull().default(true),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const redirects = pgTable(
  'redirects',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    sourcePath: varchar('source_path', { length: 255 }).notNull().unique(),
    targetPath: varchar('target_path', { length: 255 }).notNull(),
    statusCode: integer('status_code').notNull().default(301),
    isActive: boolean('is_active').notNull().default(true),
    entityType: varchar('entity_type', { length: 50 }),
    entityId: varchar('entity_id', { length: 255 }),
    createdFromRevisionId: uuid('created_from_revision_id'),
    createdBy: uuid('created_by'),
    supersededById: uuid('superseded_by_id'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
    disabledAt: timestamp('disabled_at', { withTimezone: true }),
  },
  (table) => [
    index('idx_redirects_source').on(table.sourcePath),
    index('idx_redirects_entity').on(table.entityType, table.entityId),
    index('idx_redirects_created_at').on(table.createdAt),
  ]
);

export const revalidationOperations = pgTable(
  'revalidation_operations',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    entityType: varchar('entity_type', { length: 50 }).notNull(),
    entityId: varchar('entity_id', { length: 255 }).notNull(),
    revisionId: uuid('revision_id'),
    paths: jsonb('paths').notNull().default([]),
    tags: jsonb('tags').notNull().default([]),
    status: varchar('status', { length: 20 }).notNull().default('pending'), // 'pending' | 'failed' | 'completed'
    attempts: integer('attempts').notNull().default(1),
    lastError: text('last_error'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    lastAttemptAt: timestamp('last_attempt_at', { withTimezone: true }).notNull().defaultNow(),
    resolvedAt: timestamp('resolved_at', { withTimezone: true }),
  },
  (table) => [
    index('idx_reval_ops_status').on(table.status),
    index('idx_reval_ops_entity').on(table.entityType, table.entityId),
    index('idx_reval_ops_created_at').on(table.createdAt),
  ]
);

export type Redirect = typeof redirects.$inferSelect;
export type NewRedirect = typeof redirects.$inferInsert;
export type RevalidationOperation = typeof revalidationOperations.$inferSelect;
export type NewRevalidationOperation = typeof revalidationOperations.$inferInsert;

