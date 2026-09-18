import { pgTable, varchar, text, integer, boolean, timestamp, jsonb, index } from 'drizzle-orm/pg-core';

export const equipment = pgTable('equipment', {
  id: varchar('id', { length: 64 }).primaryKey(), // e.g. 'olympus-evis-x1'
  name: varchar('name', { length: 255 }).notNull(),
  origin: varchar('origin', { length: 128 }).notNull(), // 'Nhật Bản'
  manufacturer: varchar('manufacturer', { length: 128 }).notNull(), // 'Olympus'
  imageUrl: text('image_url').notNull(),
  description: text('description').notNull(),
  features: jsonb('features').notNull().default([]), // String array of specs
  sortOrder: integer('sort_order').notNull().default(0),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const faqs = pgTable(
  'faqs',
  {
    id: varchar('id', { length: 64 }).primaryKey(),
    question: text('question').notNull(),
    answer: text('answer').notNull(),
    category: varchar('category', { length: 128 }).notNull().default('general'),
    sortOrder: integer('sort_order').notNull().default(0),
    isPublished: boolean('is_published').notNull().default(true),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('idx_faqs_category').on(table.category),
  ]
);

export const testimonials = pgTable('testimonials', {
  id: varchar('id', { length: 64 }).primaryKey(),
  type: varchar('type', { length: 32 }).notNull(), // 'video', 'customer_story'
  patientName: varchar('patient_name', { length: 255 }).notNull(),
  patientAge: integer('patient_age'),
  title: varchar('title', { length: 512 }).notNull(),
  quote: text('quote'),
  fullStory: text('full_story'),
  videoId: varchar('video_id', { length: 64 }), // YouTube ID for video testimonials
  imageUrl: text('image_url'),
  tag: varchar('tag', { length: 128 }), // e.g. 'Tầm soát Polyp'
  sortOrder: integer('sort_order').notNull().default(0),
  isPublished: boolean('is_published').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export type Equipment = typeof equipment.$inferSelect;
export type NewEquipment = typeof equipment.$inferInsert;
export type Faq = typeof faqs.$inferSelect;
export type NewFaq = typeof faqs.$inferInsert;
export type Testimonial = typeof testimonials.$inferSelect;
export type NewTestimonial = typeof testimonials.$inferInsert;
