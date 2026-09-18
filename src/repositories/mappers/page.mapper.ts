import type { PageContent } from '@/types/doctorcheck';
import type { pages } from '@/db/schema';

type PageRow = typeof pages.$inferSelect;

function formatVietnamIso(d: Date | null): string | undefined {
  if (!d) return undefined;
  const vnTime = new Date(d.getTime() + 7 * 60 * 60 * 1000);
  return vnTime.toISOString().replace(/\.\d{3}Z$/, '');
}

export function mapPageRowToDomain(row: PageRow): PageContent {
  const numericId = Number(row.id.replace(/^page-/, '')) || 0;
  return {
    id: numericId,
    slug: row.slug,
    title: row.title,
    contentHtml: row.contentHtml,
    excerpt: row.excerpt || undefined,
    featuredImageUrl: row.featuredImageUrl || undefined,
    date: formatVietnamIso(row.createdAt),
    modified: formatVietnamIso(row.updatedAt),
    seoTitle: row.seoTitle || undefined,
    metaDescription: row.seoDescription || undefined,
    dataClassification: 'VERIFIED_PRODUCTION',
  };
}
