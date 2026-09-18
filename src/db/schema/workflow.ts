import { pgTable, uuid, varchar, text, integer, timestamp, jsonb, unique, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './auth';

export const contentRevisions = pgTable(
  'content_revisions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    entityType: varchar('entity_type', { length: 64 }).notNull(), // 'article', 'page', 'doctor', 'package', 'clinic', 'equipment', 'faq', 'testimonial', 'homepage'
    entityId: varchar('entity_id', { length: 128 }).notNull(), // e.g. 'art-001', 'bac-si-trung', etc.
    revisionNumber: integer('revision_number').notNull(), // Monotonic sequence per entity (1, 2, 3...)
    status: varchar('status', { length: 32 }).notNull().default('draft'), // 'draft', 'in_review', 'approved', 'published', 'archived'
    title: varchar('title', { length: 512 }),
    payload: jsonb('payload').notNull(), // Typed domain snapshot
    version: integer('version').notNull().default(1), // Optimistic concurrency lock counter
    changeSummary: text('change_summary'), // Author's change description
    medicalReviewNotes: text('medical_review_notes'), // Reviewer's feedback / clinical validation notes
    reviewedBy: uuid('reviewed_by').references(() => users.id, { onDelete: 'set null' }),
    reviewedAt: timestamp('reviewed_at', { withTimezone: true }),
    publishedBy: uuid('published_by').references(() => users.id, { onDelete: 'set null' }),
    publishedAt: timestamp('published_at', { withTimezone: true }),
    createdBy: uuid('created_by').references(() => users.id, { onDelete: 'set null' }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    unique('uq_revisions_entity_revision_num').on(table.entityType, table.entityId, table.revisionNumber),
    index('idx_revisions_entity').on(table.entityType, table.entityId),
    index('idx_revisions_status').on(table.status),
    index('idx_revisions_created_at').on(table.createdAt),
    index('idx_revisions_created_by').on(table.createdBy),
  ]
);

export const contentRevisionsRelations = relations(contentRevisions, ({ one }) => ({
  creator: one(users, {
    fields: [contentRevisions.createdBy],
    references: [users.id],
    relationName: 'revisionCreator',
  }),
  reviewer: one(users, {
    fields: [contentRevisions.reviewedBy],
    references: [users.id],
    relationName: 'revisionReviewer',
  }),
  publisher: one(users, {
    fields: [contentRevisions.publishedBy],
    references: [users.id],
    relationName: 'revisionPublisher',
  }),
}));

export type ContentRevision = typeof contentRevisions.$inferSelect;
export type NewContentRevision = typeof contentRevisions.$inferInsert;
