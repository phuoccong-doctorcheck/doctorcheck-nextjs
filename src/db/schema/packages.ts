import { pgTable, varchar, text, integer, boolean, numeric, timestamp, jsonb, index } from 'drizzle-orm/pg-core';

export const packages = pgTable(
  'packages',
  {
    id: varchar('id', { length: 64 }).primaryKey(), // e.g. 'tam-soat-ung-thu-tieu-hoa-tieu-chuan'
    slug: varchar('slug', { length: 128 }).notNull().unique(),
    name: varchar('name', { length: 255 }).notNull(),
    gender: varchar('gender', { length: 32 }).notNull().default('both'), // 'male', 'female', 'both'
    priceVnd: numeric('price_vnd', { precision: 12, scale: 0 }).notNull(), // e.g. 4200000
    priceFormatted: varchar('price_formatted', { length: 64 }).notNull(), // '4.200.000đ'
    tagline: varchar('tagline', { length: 255 }),
    diseasesCovered: integer('diseases_covered').notNull().default(0),
    cancersCovered: integer('cancers_covered').notNull().default(0),
    duration: varchar('duration', { length: 64 }).notNull().default('120 - 180 phút'),
    isPopular: boolean('is_popular').notNull().default(false),
    recommendedFor: text('recommended_for').notNull(),
    features: jsonb('features').notNull().default([]), // Array of string item inclusions
    imageUrl: text('image_url'),
    sortOrder: integer('sort_order').notNull().default(0),
    isActive: boolean('is_active').notNull().default(true),
    seoTitle: varchar('seo_title', { length: 255 }),
    seoDescription: text('seo_description'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('idx_packages_slug').on(table.slug),
  ]
);
