import { pgTable, varchar, text, boolean, timestamp, index } from 'drizzle-orm/pg-core';

export const pages = pgTable(
  'pages',
  {
    id: varchar('id', { length: 128 }).primaryKey(), // e.g. 'page-ve-chung-toi'
    slug: varchar('slug', { length: 128 }).notNull().unique(), // e.g. 've-chung-toi'
    path: varchar('path', { length: 255 }).notNull().unique(), // e.g. '/ve-chung-toi/'
    subpath: varchar('subpath', { length: 128 }),
    title: varchar('title', { length: 512 }).notNull(),
    excerpt: text('excerpt'),
    contentHtml: text('content_html').notNull(),
    featuredImageUrl: text('featured_image_url'),
    isRoot: boolean('is_root').notNull().default(true),
    isUxBuilder: boolean('is_ux_builder').notNull().default(false),
    seoTitle: varchar('seo_title', { length: 255 }),
    seoDescription: text('seo_description'),
    status: varchar('status', { length: 32 }).notNull().default('published'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('idx_pages_slug').on(table.slug),
    index('idx_pages_path').on(table.path),
  ]
);
