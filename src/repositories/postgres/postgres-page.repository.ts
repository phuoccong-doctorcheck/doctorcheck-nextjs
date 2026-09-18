import 'server-only';
import { eq, asc, desc, sql, and, or, ilike } from 'drizzle-orm';
import { db } from '@/db';
import * as schema from '@/db/schema';
import type {
  IPageRepository,
  PageListAdminParams,
  PageListAdminResult,
  PageAdminItem,
  PageAdminDetail,
} from '../contracts/page.repository';
import type { PageContent } from '@/types/doctorcheck';
import { mapPageRowToDomain } from '../mappers/page.mapper';
import { classifyPageRoute } from '@/lib/routing/page-route-policy';

export class PostgresPageRepository implements IPageRepository {
  async getAll(): Promise<PageContent[]> {
    const rows = await db.select().from(schema.pages).where(eq(schema.pages.status, 'published'));
    return rows.map(mapPageRowToDomain);
  }

  async getBySlug(slug: string): Promise<PageContent | null> {
    const normalized = slug.replace(/^\/+|\/+$/g, '');
    const rows = await db
      .select()
      .from(schema.pages)
      .where(eq(schema.pages.slug, normalized))
      .limit(1);
    if (!rows.length || !rows[0]) return null;
    return mapPageRowToDomain(rows[0]);
  }

  async getAllSlugs(): Promise<string[]> {
    const rows = await db
      .select({ slug: schema.pages.slug })
      .from(schema.pages)
      .where(eq(schema.pages.status, 'published'));
    return rows.map((r) => r.slug);
  }

  async listAdmin(params: PageListAdminParams = {}): Promise<PageListAdminResult> {
    const page = Math.max(1, params.page || 1);
    const pageSize = Math.min(100, Math.max(1, params.pageSize || 15));
    const offset = (page - 1) * pageSize;

    const conditions = [];

    if (params.search && params.search.trim().length > 0) {
      const q = `%${params.search.trim()}%`;
      conditions.push(
        or(
          ilike(schema.pages.title, q),
          ilike(schema.pages.slug, q),
          ilike(schema.pages.path, q)
        )
      );
    }

    if (params.routeType && params.routeType !== 'all') {
      if (params.routeType === 'ROOT') {
        conditions.push(and(eq(schema.pages.isRoot, true), sql`${schema.pages.status} != 'internal'`));
      } else if (params.routeType === 'ENDOSCOPY_CHILD') {
        conditions.push(
          or(
            eq(schema.pages.isRoot, false),
            and(sql`${schema.pages.subpath} IS NOT NULL`, sql`${schema.pages.subpath} != ''`)
          )
        );
      } else if (params.routeType === 'INTERNAL') {
        conditions.push(eq(schema.pages.status, 'internal'));
      }
    }

    if (params.status && params.status !== 'all') {
      conditions.push(eq(schema.pages.status, params.status));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Count query
    const [countRow] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(schema.pages)
      .where(whereClause);
    const total = countRow?.count ?? 0;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));

    // Data query (select only list metadata, omitting heavy contentHtml for performance)
    const rows = await db
      .select({
        id: schema.pages.id,
        slug: schema.pages.slug,
        path: schema.pages.path,
        subpath: schema.pages.subpath,
        title: schema.pages.title,
        isRoot: schema.pages.isRoot,
        isUxBuilder: schema.pages.isUxBuilder,
        featuredImageUrl: schema.pages.featuredImageUrl,
        status: schema.pages.status,
        updatedAt: schema.pages.updatedAt,
      })
      .from(schema.pages)
      .where(whereClause)
      .orderBy(asc(schema.pages.title))
      .limit(pageSize)
      .offset(offset);

    // Fetch active workflow status for page list
    const pageIds = rows.map((r) => r.id);
    const revMap = new Map<string, string>();
    if (pageIds.length > 0) {
      const activeRevs = await db
        .select({
          entityId: schema.contentRevisions.entityId,
          status: schema.contentRevisions.status,
        })
        .from(schema.contentRevisions)
        .where(
          and(
            eq(schema.contentRevisions.entityType, 'page'),
            sql`${schema.contentRevisions.entityId} IN ${pageIds}`,
            sql`${schema.contentRevisions.status} IN ('draft', 'in_review', 'approved')`
          )
        );
      for (const rev of activeRevs) {
        revMap.set(rev.entityId, rev.status);
      }
    }

    const items: PageAdminItem[] = rows.map((r) => {
      const routeType = classifyPageRoute(r.isRoot, r.subpath, r.status, r.slug);
      return {
        id: r.id,
        slug: r.slug,
        path: r.path,
        subpath: r.subpath,
        title: r.title,
        routeType,
        isRoot: r.isRoot,
        isUxBuilder: r.isUxBuilder,
        featuredImageUrl: r.featuredImageUrl,
        status: r.status,
        workflowStatus: revMap.get(r.id) || (r.status === 'published' ? 'published' : 'draft'),
        updatedAt: r.updatedAt,
      };
    });

    return {
      items,
      total,
      page,
      pageSize,
      totalPages,
    };
  }

  async getAdminById(id: string): Promise<PageAdminDetail | null> {
    const [page] = await db
      .select()
      .from(schema.pages)
      .where(or(eq(schema.pages.id, id), eq(schema.pages.slug, id)))
      .limit(1);

    if (!page) return null;

    const [activeRev] = await db
      .select({ status: schema.contentRevisions.status })
      .from(schema.contentRevisions)
      .where(
        and(
          eq(schema.contentRevisions.entityType, 'page'),
          eq(schema.contentRevisions.entityId, page.id),
          sql`${schema.contentRevisions.status} IN ('draft', 'in_review', 'approved')`
        )
      )
      .orderBy(desc(schema.contentRevisions.revisionNumber))
      .limit(1);

    const routeType = classifyPageRoute(page.isRoot, page.subpath, page.status, page.slug);

    return {
      id: page.id,
      slug: page.slug,
      path: page.path,
      subpath: page.subpath,
      title: page.title,
      excerpt: page.excerpt,
      contentHtml: page.contentHtml,
      featuredImageUrl: page.featuredImageUrl,
      routeType,
      isRoot: page.isRoot,
      isUxBuilder: page.isUxBuilder,
      seoTitle: page.seoTitle,
      seoDescription: page.seoDescription,
      status: page.status,
      workflowStatus: activeRev?.status || (page.status === 'published' ? 'published' : 'draft'),
      updatedAt: page.updatedAt,
    };
  }
}
