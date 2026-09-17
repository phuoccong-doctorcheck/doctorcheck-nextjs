import type { PageContent } from '@/types/doctorcheck';
import rawPagesMap from './data/pages-content.json';

export const pagesContentMap: Record<string, PageContent> = rawPagesMap as unknown as Record<string, PageContent>;

/**
 * Returns all migrated WordPress pages with full HTML bodies.
 */
export function getAllPages(): PageContent[] {
  return Object.values(pagesContentMap);
}

/**
 * Retrieves a single page by its URL slug.
 */
export function getPageBySlug(slug: string): PageContent | undefined {
  return pagesContentMap[slug];
}
