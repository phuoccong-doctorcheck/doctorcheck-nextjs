import type { MedicalArticle } from '@/types/doctorcheck';
import rawArticlesMap from './data/articles-content.json';

export const articlesContentMap: Record<string, MedicalArticle> = rawArticlesMap as unknown as Record<string, MedicalArticle>;

/**
 * Returns all 108 migrated medical articles with full HTML bodies.
 */
export function getAllArticles(): MedicalArticle[] {
  return Object.values(articlesContentMap);
}

/**
 * Retrieves a single medical article by its URL slug.
 */
export function getArticleBySlug(slug: string): MedicalArticle | undefined {
  return articlesContentMap[slug];
}

/**
 * Retrieves medical articles belonging to a specific taxonomy category.
 */
export function getArticlesByCategory(categoryId: number): MedicalArticle[] {
  return Object.values(articlesContentMap).filter((article) =>
    article.categories?.includes(categoryId)
  );
}

/**
 * Retrieves the most recently published medical articles.
 */
export function getRecentArticles(limit = 4): MedicalArticle[] {
  return Object.values(articlesContentMap)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, limit);
}
