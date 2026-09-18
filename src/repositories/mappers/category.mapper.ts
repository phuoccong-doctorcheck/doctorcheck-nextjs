import type { CategoryItem } from '@/types/doctorcheck';
import type { categories } from '@/db/schema';

type CategoryRow = typeof categories.$inferSelect;

export function mapCategoryRowToDomain(row: CategoryRow, articleCount = 0): CategoryItem {
  const numericId = Number(row.id);
  const id = !isNaN(numericId) && String(numericId) === String(row.id).trim() ? numericId : row.id;

  return {
    id,
    name: row.name,
    slug: row.slug,
    count: articleCount,
    totalArticles: articleCount,
    description: row.description || undefined,
    seoTitle: row.seoTitle || undefined,
    seoDescription: row.seoDescription || undefined,
    sortOrder: row.sortOrder ?? 0,
    dataClassification: 'VERIFIED_PRODUCTION',
  };
}
