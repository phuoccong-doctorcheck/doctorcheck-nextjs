import 'server-only';
import { eq, asc, count } from 'drizzle-orm';
import { db } from '@/db';
import * as schema from '@/db/schema';
import type {
  ICategoryRepository,
  CreateCategoryInput,
  UpdateCategoryInput,
} from '../contracts/category.repository';
import type { CategoryItem } from '@/types/doctorcheck';
import { mapCategoryRowToDomain } from '../mappers/category.mapper';

export class PostgresCategoryRepository implements ICategoryRepository {
  async getAll(): Promise<CategoryItem[]> {
    const rows = await db.select().from(schema.categories).orderBy(asc(schema.categories.sortOrder));
    
    // Count articles per category in a single batched query
    const countRows = await db
      .select({
        categoryId: schema.articleCategories.categoryId,
        count: count(schema.articleCategories.articleId),
      })
      .from(schema.articleCategories)
      .groupBy(schema.articleCategories.categoryId);

    const countMap = new Map<string, number>();
    countRows.forEach((cr) => countMap.set(cr.categoryId, Number(cr.count)));

    return rows.map((r) => mapCategoryRowToDomain(r, countMap.get(r.id) || 0));
  }

  async getBySlug(slug: string): Promise<CategoryItem | null> {
    const normalized = slug.replace(/^\/+|\/+$/g, '');
    const rows = await db
      .select()
      .from(schema.categories)
      .where(eq(schema.categories.slug, normalized))
      .limit(1);
    if (!rows.length || !rows[0]) return null;

    const row = rows[0];
    const countRes = await db
      .select({ count: count(schema.articleCategories.articleId) })
      .from(schema.articleCategories)
      .where(eq(schema.articleCategories.categoryId, row.id));

    const totalArticles = Number(countRes[0]?.count) || 0;
    return mapCategoryRowToDomain(row, totalArticles);
  }

  async getById(id: number | string): Promise<CategoryItem | null> {
    const idStr = String(id);
    const rows = await db
      .select()
      .from(schema.categories)
      .where(eq(schema.categories.id, idStr))
      .limit(1);
    if (!rows.length || !rows[0]) return null;

    const row = rows[0];
    const countRes = await db
      .select({ count: count(schema.articleCategories.articleId) })
      .from(schema.articleCategories)
      .where(eq(schema.articleCategories.categoryId, row.id));

    return mapCategoryRowToDomain(row, Number(countRes[0]?.count) || 0);
  }

  async getAllSlugs(): Promise<string[]> {
    const rows = await db.select({ slug: schema.categories.slug }).from(schema.categories);
    return rows.map((r) => r.slug);
  }

  async getUsageCount(id: string): Promise<number> {
    const countRes = await db
      .select({ count: count(schema.articleCategories.articleId) })
      .from(schema.articleCategories)
      .where(eq(schema.articleCategories.categoryId, id));

    return Number(countRes[0]?.count) || 0;
  }

  async create(input: CreateCategoryInput): Promise<CategoryItem> {
    const id = input.id || input.slug.trim().toLowerCase();
    const [row] = await db
      .insert(schema.categories)
      .values({
        id,
        name: input.name.trim(),
        slug: input.slug.trim().toLowerCase(),
        description: input.description || null,
        seoTitle: input.seoTitle || null,
        seoDescription: input.seoDescription || null,
        sortOrder: input.sortOrder ?? 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    return mapCategoryRowToDomain(row, 0);
  }

  async update(id: string, input: UpdateCategoryInput): Promise<CategoryItem | null> {
    const updateValues: Record<string, unknown> = {
      updatedAt: new Date(),
    };
    if (input.name !== undefined) updateValues.name = input.name.trim();
    if (input.slug !== undefined) updateValues.slug = input.slug.trim().toLowerCase();
    if (input.description !== undefined) updateValues.description = input.description || null;
    if (input.seoTitle !== undefined) updateValues.seoTitle = input.seoTitle || null;
    if (input.seoDescription !== undefined) updateValues.seoDescription = input.seoDescription || null;
    if (input.sortOrder !== undefined) updateValues.sortOrder = input.sortOrder;

    const [row] = await db
      .update(schema.categories)
      .set(updateValues)
      .where(eq(schema.categories.id, id))
      .returning();

    if (!row) return null;

    const usageCount = await this.getUsageCount(id);
    return mapCategoryRowToDomain(row, usageCount);
  }

  async delete(id: string): Promise<boolean> {
    const usage = await this.getUsageCount(id);
    if (usage > 0) {
      throw new Error(`Không thể xóa chuyên mục vì đang có ${usage} bài viết liên kết.`);
    }

    const result = await db
      .delete(schema.categories)
      .where(eq(schema.categories.id, id))
      .returning({ id: schema.categories.id });

    return result.length > 0;
  }
}

