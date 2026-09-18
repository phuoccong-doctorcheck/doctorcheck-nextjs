import 'server-only';
import { eq, desc } from 'drizzle-orm';
import { db } from '@/db';
import * as schema from '@/db/schema';
import type {
  IArticleRepository,
  AdminArticleListItem,
  AdminArticleListOptions,
  AdminArticleListResult,
  AdminArticleDetail,
} from '../contracts/article.repository';
import type { MedicalArticle } from '@/types/doctorcheck';
import { mapArticleRowToDomain } from '../mappers/article.mapper';

export class PostgresArticleRepository implements IArticleRepository {
  async getAll(): Promise<MedicalArticle[]> {
    const rows = await db.select().from(schema.articles).orderBy(desc(schema.articles.publishedAt));
    const allRelations = await db.select().from(schema.articleCategories);
    const catMap = new Map<string, number[]>();
    allRelations.forEach((r) => {
      const arr = catMap.get(r.articleId) || [];
      arr.push(Number(r.categoryId));
      catMap.set(r.articleId, arr);
    });

    return rows.map((r) => mapArticleRowToDomain(r, catMap.get(r.id) || []));
  }

  async getBySlug(slug: string): Promise<MedicalArticle | null> {
    const normalized = slug.replace(/^\/+|\/+$/g, '');
    const rows = await db.select().from(schema.articles).where(eq(schema.articles.slug, normalized)).limit(1);
    if (!rows.length || !rows[0]) return null;

    const row = rows[0];
    const catRows = await db
      .select({ categoryId: schema.articleCategories.categoryId })
      .from(schema.articleCategories)
      .where(eq(schema.articleCategories.articleId, row.id));

    const categoryIds = catRows.map((c) => Number(c.categoryId));
    return mapArticleRowToDomain(row, categoryIds);
  }

  async getById(id: string | number): Promise<MedicalArticle | null> {
    const idStr = String(id);
    const rows = await db.select().from(schema.articles).where(eq(schema.articles.id, idStr)).limit(1);
    if (!rows.length || !rows[0]) return null;

    const row = rows[0];
    const catRows = await db
      .select({ categoryId: schema.articleCategories.categoryId })
      .from(schema.articleCategories)
      .where(eq(schema.articleCategories.articleId, row.id));

    return mapArticleRowToDomain(row, catRows.map((c) => Number(c.categoryId)));
  }

  async getByCategory(categoryIdOrSlug: number | string): Promise<MedicalArticle[]> {
    const catIdStr = String(categoryIdOrSlug);
    const relations = await db
      .select({ articleId: schema.articleCategories.articleId })
      .from(schema.articleCategories)
      .where(eq(schema.articleCategories.categoryId, catIdStr));

    if (!relations.length) return [];

    const articleIds = new Set(relations.map((r) => r.articleId));
    const all = await this.getAll();
    return all.filter((a) => articleIds.has(String(a.id)));
  }

  async getRecent(limit = 4): Promise<MedicalArticle[]> {
    const rows = await db
      .select()
      .from(schema.articles)
      .where(eq(schema.articles.status, 'published'))
      .orderBy(desc(schema.articles.publishedAt))
      .limit(limit);

    return rows.map((r) => mapArticleRowToDomain(r, []));
  }

  async getAllSlugs(): Promise<string[]> {
    const rows = await db
      .select({ slug: schema.articles.slug })
      .from(schema.articles)
      .where(eq(schema.articles.status, 'published'));
    return rows.map((r) => r.slug);
  }

  async listAdmin(options: AdminArticleListOptions = {}): Promise<AdminArticleListResult> {
    const { eq, and, or, ilike, inArray, count, desc, asc } = await import('drizzle-orm');
    const page = Math.max(1, options.page || 1);
    const limit = Math.min(100, Math.max(1, options.limit || 20));
    const offset = (page - 1) * limit;

    const conditions = [];

    if (options.search?.trim()) {
      const term = `%${options.search.trim()}%`;
      conditions.push(or(ilike(schema.articles.title, term), ilike(schema.articles.slug, term)));
    }

    if (options.status?.trim()) {
      conditions.push(eq(schema.articles.status, options.status.trim()));
    }

    if (options.categoryId?.trim()) {
      const artIdsWithCat = db
        .select({ articleId: schema.articleCategories.articleId })
        .from(schema.articleCategories)
        .where(eq(schema.articleCategories.categoryId, options.categoryId.trim()));
      conditions.push(inArray(schema.articles.id, artIdsWithCat));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // 1. Total count query
    const [countResult] = await db
      .select({ total: count() })
      .from(schema.articles)
      .where(whereClause);

    const total = Number(countResult?.total || 0);

    // 2. Paginated list query (excluding contentHtml for high performance)
    let orderExpr = desc(schema.articles.publishedAt);
    if (options.sort === 'updatedAt') {
      orderExpr = options.order === 'asc' ? asc(schema.articles.updatedAt) : desc(schema.articles.updatedAt);
    } else if (options.sort === 'title') {
      orderExpr = options.order === 'asc' ? asc(schema.articles.title) : desc(schema.articles.title);
    } else if (options.sort === 'viewsCount') {
      orderExpr = options.order === 'asc' ? asc(schema.articles.viewsCount) : desc(schema.articles.viewsCount);
    } else if (options.sort === 'publishedAt' && options.order === 'asc') {
      orderExpr = asc(schema.articles.publishedAt);
    }

    const rows = await db
      .select({
        id: schema.articles.id,
        slug: schema.articles.slug,
        title: schema.articles.title,
        excerpt: schema.articles.excerpt,
        featuredImageUrl: schema.articles.featuredImageUrl,
        authorName: schema.articles.authorName,
        authorTitle: schema.articles.authorTitle,
        status: schema.articles.status,
        publishedAt: schema.articles.publishedAt,
        updatedAt: schema.articles.updatedAt,
        viewsCount: schema.articles.viewsCount,
        readingTimeMinutes: schema.articles.readingTimeMinutes,
      })
      .from(schema.articles)
      .where(whereClause)
      .orderBy(orderExpr)
      .limit(limit)
      .offset(offset);

    if (rows.length === 0) {
      return {
        items: [],
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      };
    }

    const articleIds = rows.map((r) => r.id);

    // 3. Batch-fetch categories for matching article IDs
    const catRelations = await db
      .select({
        articleId: schema.articleCategories.articleId,
        categoryId: schema.categories.id,
        name: schema.categories.name,
        slug: schema.categories.slug,
        isPrimary: schema.articleCategories.isPrimary,
      })
      .from(schema.articleCategories)
      .innerJoin(schema.categories, eq(schema.articleCategories.categoryId, schema.categories.id))
      .where(inArray(schema.articleCategories.articleId, articleIds));

    const catMap = new Map<string, Array<{ id: string; name: string; slug: string; isPrimary: boolean }>>();
    catRelations.forEach((cr) => {
      const arr = catMap.get(cr.articleId) || [];
      arr.push({
        id: cr.categoryId,
        name: cr.name,
        slug: cr.slug,
        isPrimary: cr.isPrimary,
      });
      catMap.set(cr.articleId, arr);
    });

    // 4. Batch-fetch latest revision status for matching article IDs
    const revRows = await db
      .select({
        id: schema.contentRevisions.id,
        entityId: schema.contentRevisions.entityId,
        revisionNumber: schema.contentRevisions.revisionNumber,
        status: schema.contentRevisions.status,
        version: schema.contentRevisions.version,
        updatedAt: schema.contentRevisions.updatedAt,
      })
      .from(schema.contentRevisions)
      .where(
        and(
          eq(schema.contentRevisions.entityType, 'article'),
          inArray(schema.contentRevisions.entityId, articleIds)
        )
      )
      .orderBy(desc(schema.contentRevisions.revisionNumber));

    const revMap = new Map<string, { id: string; revisionNumber: number; status: string; version: number; updatedAt: Date }>();
    revRows.forEach((rev) => {
      if (!revMap.has(rev.entityId)) {
        revMap.set(rev.entityId, {
          id: rev.id,
          revisionNumber: rev.revisionNumber,
          status: rev.status,
          version: rev.version,
          updatedAt: rev.updatedAt,
        });
      }
    });

    const items: AdminArticleListItem[] = rows.map((r) => ({
      id: r.id,
      slug: r.slug,
      title: r.title,
      excerpt: r.excerpt,
      featuredImageUrl: r.featuredImageUrl,
      authorName: r.authorName,
      authorTitle: r.authorTitle,
      status: r.status,
      publishedAt: r.publishedAt,
      updatedAt: r.updatedAt,
      viewsCount: r.viewsCount,
      readingTimeMinutes: r.readingTimeMinutes,
      categories: catMap.get(r.id) || [],
      latestRevision: revMap.get(r.id) || null,
    }));

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  async getAdminById(id: string): Promise<AdminArticleDetail | null> {
    const { eq } = await import('drizzle-orm');
    const [row] = await db
      .select()
      .from(schema.articles)
      .where(eq(schema.articles.id, id))
      .limit(1);

    if (!row) return null;

    const catRelations = await db
      .select({
        categoryId: schema.categories.id,
        name: schema.categories.name,
        slug: schema.categories.slug,
        isPrimary: schema.articleCategories.isPrimary,
      })
      .from(schema.articleCategories)
      .innerJoin(schema.categories, eq(schema.articleCategories.categoryId, schema.categories.id))
      .where(eq(schema.articleCategories.articleId, row.id));

    return {
      id: row.id,
      slug: row.slug,
      title: row.title,
      excerpt: row.excerpt,
      contentHtml: row.contentHtml,
      featuredImageId: row.featuredImageId,
      featuredImageUrl: row.featuredImageUrl,
      authorName: row.authorName,
      authorTitle: row.authorTitle,
      status: row.status,
      viewsCount: row.viewsCount,
      readingTimeMinutes: row.readingTimeMinutes,
      toc: (row.toc as Array<{ id: string; text: string; level: number }>) || [],
      seoTitle: row.seoTitle,
      seoDescription: row.seoDescription,
      canonicalUrl: row.canonicalUrl,
      publishedAt: row.publishedAt,
      modifiedAt: row.modifiedAt,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      categories: catRelations.map((cr) => ({
        id: cr.categoryId,
        name: cr.name,
        slug: cr.slug,
        isPrimary: cr.isPrimary,
      })),
    };
  }
}

