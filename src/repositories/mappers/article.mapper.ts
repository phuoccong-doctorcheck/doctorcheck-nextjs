import type { MedicalArticle, TableOfContentsItem } from '@/types/doctorcheck';
import type { articles } from '@/db/schema';

type ArticleRow = typeof articles.$inferSelect;

function formatVietnamIso(d: Date | null): string {
  if (!d) return '';
  // Convert UTC Date to UTC+7 Vietnam local time ISO representation (YYYY-MM-DDTHH:mm:ss)
  const vnTime = new Date(d.getTime() + 7 * 60 * 60 * 1000);
  return vnTime.toISOString().replace(/\.\d{3}Z$/, '');
}

export function mapArticleRowToDomain(row: ArticleRow, categoryIds: number[] = []): MedicalArticle {
  return {
    id: Number(row.id) || 0,
    slug: row.slug,
    title: row.title,
    date: formatVietnamIso(row.publishedAt),
    modified: formatVietnamIso(row.modifiedAt),
    categories: categoryIds,
    link: row.canonicalUrl || `https://www.doctorcheck.vn/${row.slug}/`,
    status: 'AUTHENTIC_METADATA_VERIFIED',
    contentImportStatus: 'CONTENT_MIGRATED_VERIFIED',
    dataClassification: 'VERIFIED_PRODUCTION',
    contentHtml: row.contentHtml,
    excerpt: row.excerpt || undefined,
    featuredImageUrl: row.featuredImageUrl || undefined,
    authorName: row.authorName,
    authorTitle: row.authorTitle,
    tableOfContents: (row.toc as unknown as TableOfContentsItem[]) || [],
    seoTitle: row.seoTitle || undefined,
    metaDescription: row.seoDescription || undefined,
  };
}
