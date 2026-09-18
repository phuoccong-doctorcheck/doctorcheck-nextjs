import type {
  IArticleRepository,
  AdminArticleListItem,
  AdminArticleListOptions,
  AdminArticleListResult,
  AdminArticleDetail,
} from '../contracts/article.repository';
import type { MedicalArticle } from '@/types/doctorcheck';
import { articlesContentMap } from '@/lib/content/articles-data';

export class StaticArticleRepository implements IArticleRepository {
  async getAll(): Promise<MedicalArticle[]> {
    return Object.values(articlesContentMap);
  }

  async getBySlug(slug: string): Promise<MedicalArticle | null> {
    const normalized = slug.replace(/^\/+|\/+$/g, '');
    return articlesContentMap[normalized] || null;
  }

  async getById(id: string | number): Promise<MedicalArticle | null> {
    const targetId = Number(id);
    const found = Object.values(articlesContentMap).find((a) => a.id === targetId);
    return found || null;
  }

  async getByCategory(categoryIdOrSlug: number | string): Promise<MedicalArticle[]> {
    const targetId = typeof categoryIdOrSlug === 'number' ? categoryIdOrSlug : Number(categoryIdOrSlug);
    return Object.values(articlesContentMap).filter((article) =>
      article.categories?.includes(targetId)
    );
  }

  async getRecent(limit = 4): Promise<MedicalArticle[]> {
    return Object.values(articlesContentMap)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, limit);
  }

  async getAllSlugs(): Promise<string[]> {
    return Object.keys(articlesContentMap);
  }

  async listAdmin(options: AdminArticleListOptions = {}): Promise<AdminArticleListResult> {
    const all = Object.values(articlesContentMap);
    const page = Math.max(1, options.page || 1);
    const limit = Math.min(100, Math.max(1, options.limit || 20));
    const offset = (page - 1) * limit;

    let filtered = all;
    if (options.search?.trim()) {
      const term = options.search.trim().toLowerCase();
      filtered = filtered.filter((a) => a.title.toLowerCase().includes(term) || a.slug.toLowerCase().includes(term));
    }

    const total = filtered.length;
    const paged = filtered.slice(offset, offset + limit);

    const items: AdminArticleListItem[] = paged.map((a) => ({
      id: String(a.id),
      slug: a.slug,
      title: a.title,
      excerpt: a.excerpt || null,
      featuredImageUrl: a.featuredImageUrl || null,
      authorName: a.authorName || 'Bác sĩ DoctorCheck',
      authorTitle: a.authorTitle || 'Chuyên khoa Tiêu hóa',
      status: 'published',
      publishedAt: a.date ? new Date(a.date) : new Date(),
      updatedAt: a.modified ? new Date(a.modified) : new Date(),
      viewsCount: 0,
      readingTimeMinutes: 5,
      categories: (a.categories || []).map((cid) => ({
        id: String(cid),
        name: `Chuyên mục ${cid}`,
        slug: `chuyen-muc-${cid}`,
        isPrimary: true,
      })),
      latestRevision: null,
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
    const art = await this.getById(id);
    if (!art) return null;

    return {
      id: String(art.id),
      slug: art.slug,
      title: art.title,
      excerpt: art.excerpt || null,
      contentHtml: art.contentHtml,
      featuredImageId: null,
      featuredImageUrl: art.featuredImageUrl || null,
      authorName: art.authorName || 'Bác sĩ DoctorCheck',
      authorTitle: art.authorTitle || 'Chuyên khoa Tiêu hóa',
      status: 'published',
      viewsCount: 0,
      readingTimeMinutes: 5,
      toc: (art.tableOfContents as Array<{ id: string; text: string; level: number }>) || [],
      seoTitle: art.seoTitle || null,
      seoDescription: art.metaDescription || null,
      canonicalUrl: art.link || null,
      publishedAt: art.date ? new Date(art.date) : new Date(),
      modifiedAt: art.modified ? new Date(art.modified) : new Date(),
      createdAt: art.date ? new Date(art.date) : new Date(),
      updatedAt: art.modified ? new Date(art.modified) : new Date(),
      categories: (art.categories || []).map((cid) => ({
        id: String(cid),
        name: `Chuyên mục ${cid}`,
        slug: `chuyen-muc-${cid}`,
        isPrimary: true,
      })),
    };
  }
}
