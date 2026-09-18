import { pgTable, varchar, text, integer, timestamp, jsonb, boolean, uuid, primaryKey, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { media } from './media';

export const categories = pgTable(
  'categories',
  {
    id: varchar('id', { length: 128 }).primaryKey(), // e.g. 'noi-soi-da-day'
    slug: varchar('slug', { length: 128 }).notNull().unique(),
    name: varchar('name', { length: 255 }).notNull(),
    description: text('description'),
    seoTitle: varchar('seo_title', { length: 255 }),
    seoDescription: text('seo_description'),
    sortOrder: integer('sort_order').notNull().default(0),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('idx_categories_slug').on(table.slug),
  ]
);

export const articles = pgTable(
  'articles',
  {
    id: varchar('id', { length: 128 }).primaryKey(), // e.g. 'art-001' or legacy ID '108'
    slug: varchar('slug', { length: 255 }).notNull().unique(),
    title: varchar('title', { length: 512 }).notNull(),
    excerpt: text('excerpt'),
    contentHtml: text('content_html').notNull(),
    featuredImageId: uuid('featured_image_id').references(() => media.id, { onDelete: 'set null' }),
    featuredImageUrl: text('featured_image_url'),
    authorName: varchar('author_name', { length: 255 }).notNull().default('Đội ngũ Bác sĩ DoctorCheck'),
    authorTitle: varchar('author_title', { length: 255 }).notNull().default('Bác sĩ Chuyên khoa Tiêu hóa'),
    status: varchar('status', { length: 32 }).notNull().default('published'), // 'draft', 'published', 'archived'
    viewsCount: integer('views_count').notNull().default(0),
    readingTimeMinutes: integer('reading_time_minutes').notNull().default(5),
    toc: jsonb('toc').notNull().default([]), // Array of {id, text, level}
    seoTitle: varchar('seo_title', { length: 255 }),
    seoDescription: text('seo_description'),
    canonicalUrl: text('canonical_url'),
    publishedAt: timestamp('published_at', { withTimezone: true }).notNull().defaultNow(),
    modifiedAt: timestamp('modified_at', { withTimezone: true }).notNull().defaultNow(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('idx_articles_slug').on(table.slug),
    index('idx_articles_status_published_at').on(table.status, table.publishedAt),
  ]
);

export const articleCategories = pgTable(
  'article_categories',
  {
    articleId: varchar('article_id', { length: 128 })
      .notNull()
      .references(() => articles.id, { onDelete: 'cascade' }),
    categoryId: varchar('category_id', { length: 128 })
      .notNull()
      .references(() => categories.id, { onDelete: 'cascade' }),
    isPrimary: boolean('is_primary').notNull().default(false),
  },
  (table) => [
    primaryKey({ columns: [table.articleId, table.categoryId] }),
    index('idx_article_categories_cat').on(table.categoryId),
  ]
);

export const categoriesRelations = relations(categories, ({ many }) => ({
  articleCategories: many(articleCategories),
}));

export const articlesRelations = relations(articles, ({ one, many }) => ({
  featuredImage: one(media, {
    fields: [articles.featuredImageId],
    references: [media.id],
  }),
  articleCategories: many(articleCategories),
}));

export const articleCategoriesRelations = relations(articleCategories, ({ one }) => ({
  article: one(articles, {
    fields: [articleCategories.articleId],
    references: [articles.id],
  }),
  category: one(categories, {
    fields: [articleCategories.categoryId],
    references: [categories.id],
  }),
}));
