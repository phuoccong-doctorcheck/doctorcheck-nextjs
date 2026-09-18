import type {
  IPageRepository,
  PageListAdminParams,
  PageListAdminResult,
  PageAdminDetail,
} from '../contracts/page.repository';
import type { PageContent } from '@/types/doctorcheck';
import { pagesContentMap } from '@/lib/content/pages-data';
import { staticPagesData } from '@/lib/routing/pages-data';
import { classifyPageRoute } from '@/lib/routing/page-route-policy';

export class StaticPageRepository implements IPageRepository {
  async getAll(): Promise<PageContent[]> {
    return Object.values(pagesContentMap);
  }

  async getBySlug(slug: string): Promise<PageContent | null> {
    const normalized = slug.replace(/^\/+|\/+$/g, '');
    return pagesContentMap[normalized] || null;
  }

  async getAllSlugs(): Promise<string[]> {
    return Object.keys(pagesContentMap);
  }

  async listAdmin(params: PageListAdminParams = {}): Promise<PageListAdminResult> {
    const all = staticPagesData.map((p) => {
      const full = pagesContentMap[p.slug];
      const routeType = classifyPageRoute(p.isRoot, p.subpath);
      return {
        id: `page-${p.id}`,
        slug: p.slug,
        path: p.path,
        subpath: p.subpath || null,
        title: full?.title || p.title,
        routeType,
        isRoot: p.isRoot,
        isUxBuilder: true,
        featuredImageUrl: full?.featuredImageUrl || null,
        status: 'published',
        workflowStatus: 'published',
        updatedAt: new Date(),
      };
    });

    const page = params.page || 1;
    const pageSize = params.pageSize || 15;
    const total = all.length;
    const items = all.slice((page - 1) * pageSize, page * pageSize);

    return {
      items,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async getAdminById(id: string): Promise<PageAdminDetail | null> {
    const numId = Number(id.replace(/^page-/, ''));
    const item = staticPagesData.find((p) => p.id === numId || p.slug === id);
    if (!item) return null;

    const full = pagesContentMap[item.slug];
    const routeType = classifyPageRoute(item.isRoot, item.subpath);

    return {
      id: `page-${item.id}`,
      slug: item.slug,
      path: item.path,
      subpath: item.subpath || null,
      title: full?.title || item.title,
      excerpt: full?.excerpt || null,
      contentHtml: full?.contentHtml || '',
      featuredImageUrl: full?.featuredImageUrl || null,
      routeType,
      isRoot: item.isRoot,
      isUxBuilder: true,
      seoTitle: full?.seoTitle || null,
      seoDescription: full?.metaDescription || null,
      status: 'published',
      workflowStatus: 'published',
      updatedAt: new Date(),
    };
  }
}
