import 'server-only';
import { db } from '@/db';
import { media, Media, NewMedia } from '@/db/schema/media';
import { articles } from '@/db/schema/articles';
import { doctors } from '@/db/schema/doctors';
import { packages } from '@/db/schema/packages';
import { pages } from '@/db/schema/pages';
import { equipment, testimonials } from '@/db/schema/clinical-trust';
import { homepageBlocks } from '@/db/schema/settings';
import {
  IMediaRepository,
  MediaListFilter,
  MediaListResult,
  MediaReference,
} from '../contracts/media.repository';
import { eq, and, or, ilike, sql, desc, asc } from 'drizzle-orm';

export class PostgresMediaRepository implements IMediaRepository {
  async list(filter: MediaListFilter = {}): Promise<MediaListResult> {
    const limit = Math.min(Math.max(filter.limit ?? 20, 1), 100);
    const offset = Math.max(filter.offset ?? 0, 0);

    const conditions = [];

    // Search condition
    if (filter.search && filter.search.trim().length > 0) {
      const term = `%${filter.search.trim()}%`;
      conditions.push(
        or(
          ilike(media.filename, term),
          ilike(media.originalFilename, term),
          ilike(media.altText, term),
          ilike(media.caption, term)
        )
      );
    }

    // MIME type filter
    if (filter.mimeType && filter.mimeType !== 'all') {
      if (filter.mimeType.endsWith('/*')) {
        const prefix = filter.mimeType.replace('/*', '');
        conditions.push(ilike(media.mimeType, `${prefix}/%`));
      } else {
        conditions.push(eq(media.mimeType, filter.mimeType));
      }
    }

    // Status filter
    if (filter.status === 'archived') {
      conditions.push(eq(media.status, 'archived'));
    } else if (filter.status === 'all') {
      // Do not filter by status
    } else {
      conditions.push(eq(media.status, 'active'));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Determine sorting
    const sortField =
      filter.sortBy === 'filename'
        ? media.filename
        : filter.sortBy === 'fileSizeBytes'
        ? media.fileSizeBytes
        : media.createdAt;

    const sortDirection = filter.sortOrder === 'asc' ? asc(sortField) : desc(sortField);

    // Total count query
    const [countResult] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(media)
      .where(whereClause);

    const total = countResult?.count ?? 0;

    // Items query
    const items = await db
      .select()
      .from(media)
      .where(whereClause)
      .orderBy(sortDirection)
      .limit(limit)
      .offset(offset);

    return {
      items,
      total,
      limit,
      offset,
    };
  }

  async getById(id: string): Promise<Media | null> {
    const [result] = await db.select().from(media).where(eq(media.id, id));
    return result ?? null;
  }

  async getByChecksum(checksum: string): Promise<Media | null> {
    const [result] = await db.select().from(media).where(eq(media.checksum, checksum));
    return result ?? null;
  }

  async getByStoragePath(storagePath: string): Promise<Media | null> {
    const [result] = await db.select().from(media).where(eq(media.storagePath, storagePath));
    return result ?? null;
  }

  async getByPublicUrl(publicUrl: string): Promise<Media | null> {
    const [result] = await db.select().from(media).where(eq(media.publicUrl, publicUrl));
    return result ?? null;
  }

  async create(data: NewMedia): Promise<Media> {
    const [created] = await db.insert(media).values(data).returning();
    return created;
  }

  async updateMetadata(
    id: string,
    data: { altText?: string; caption?: string | null }
  ): Promise<Media | null> {
    const updates: Partial<Media> = {
      updatedAt: new Date(),
    };

    if (data.altText !== undefined) {
      updates.altText = data.altText;
    }
    if (data.caption !== undefined) {
      updates.caption = data.caption;
    }

    const [updated] = await db
      .update(media)
      .set(updates)
      .where(eq(media.id, id))
      .returning();

    return updated ?? null;
  }

  async setStatus(id: string, status: 'active' | 'archived'): Promise<Media | null> {
    const [updated] = await db
      .update(media)
      .set({ status, updatedAt: new Date() })
      .where(eq(media.id, id))
      .returning();

    return updated ?? null;
  }

  async delete(id: string): Promise<boolean> {
    const [deleted] = await db.delete(media).where(eq(media.id, id)).returning({ id: media.id });
    return Boolean(deleted);
  }

  async count(filter?: Partial<MediaListFilter>): Promise<number> {
    const conditions = [];
    if (filter?.status === 'archived') {
      conditions.push(eq(media.status, 'archived'));
    } else if (filter?.status !== 'all') {
      conditions.push(eq(media.status, 'active'));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
    const [result] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(media)
      .where(whereClause);

    return result?.count ?? 0;
  }

  async checkReferences(mediaIdOrUrl: string): Promise<MediaReference[]> {
    const references: MediaReference[] = [];

    // Attempt to locate media record first
    let mediaRecord: Media | null = null;
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      mediaIdOrUrl
    );

    if (isUuid) {
      mediaRecord = await this.getById(mediaIdOrUrl);
    } else {
      mediaRecord = (await this.getByPublicUrl(mediaIdOrUrl)) || (await this.getByStoragePath(mediaIdOrUrl));
    }

    const searchUrl = mediaRecord?.publicUrl || mediaIdOrUrl;
    const searchFilename = mediaRecord?.filename;
    const searchId = mediaRecord?.id;

    // 1. Articles Check (featured_image_id, featured_image_url, content_html)
    const articleConds = [
      ilike(articles.featuredImageUrl, `%${searchUrl}%`),
      ilike(articles.contentHtml, `%${searchUrl}%`),
    ];
    if (searchFilename) {
      articleConds.push(ilike(articles.contentHtml, `%${searchFilename}%`));
    }
    if (searchId) {
      articleConds.push(eq(articles.featuredImageId, searchId));
    }

    const matchedArticles = await db
      .select({ id: articles.id, title: articles.title, featId: articles.featuredImageId, featUrl: articles.featuredImageUrl, content: articles.contentHtml })
      .from(articles)
      .where(or(...articleConds));

    for (const art of matchedArticles) {
      if (searchId && art.featId === searchId) {
        references.push({
          domain: 'articles',
          entityId: art.id,
          field: 'featured_image_id',
          label: `Bài viết: ${art.title} (Ảnh đại diện)`,
        });
      } else if (art.featUrl && art.featUrl.includes(searchUrl)) {
        references.push({
          domain: 'articles',
          entityId: art.id,
          field: 'featured_image_url',
          label: `Bài viết: ${art.title} (URL ảnh đại diện)`,
        });
      } else {
        references.push({
          domain: 'articles',
          entityId: art.id,
          field: 'content_html',
          label: `Bài viết: ${art.title} (Nội dung bài viết)`,
        });
      }
    }

    // 2. Doctors Check (image_url, detailed_bio_html)
    const doctorConds = [
      ilike(doctors.imageUrl, `%${searchUrl}%`),
      ilike(doctors.detailedBioHtml, `%${searchUrl}%`),
    ];
    if (searchFilename) {
      doctorConds.push(ilike(doctors.imageUrl, `%${searchFilename}%`));
    }
    const matchedDoctors = await db
      .select({ id: doctors.id, name: doctors.name, imageUrl: doctors.imageUrl })
      .from(doctors)
      .where(or(...doctorConds));

    for (const doc of matchedDoctors) {
      references.push({
        domain: 'doctors',
        entityId: doc.id,
        field: 'image_url',
        label: `Bác sĩ: ${doc.name} (Ảnh hồ sơ)`,
      });
    }

    // 3. Packages Check (image_url)
    const packageConds = [ilike(packages.imageUrl, `%${searchUrl}%`)];
    if (searchFilename) {
      packageConds.push(ilike(packages.imageUrl, `%${searchFilename}%`));
    }
    const matchedPackages = await db
      .select({ id: packages.id, name: packages.name })
      .from(packages)
      .where(or(...packageConds));

    for (const pkg of matchedPackages) {
      references.push({
        domain: 'packages',
        entityId: pkg.id,
        field: 'image_url',
        label: `Gói khám: ${pkg.name} (Ảnh gói khám)`,
      });
    }

    // 4. Pages Check (featured_image_url, content_html)
    const pageConds = [
      ilike(pages.featuredImageUrl, `%${searchUrl}%`),
      ilike(pages.contentHtml, `%${searchUrl}%`),
    ];
    if (searchFilename) {
      pageConds.push(ilike(pages.contentHtml, `%${searchFilename}%`));
    }
    const matchedPages = await db
      .select({ id: pages.id, title: pages.title, path: pages.path })
      .from(pages)
      .where(or(...pageConds));

    for (const pg of matchedPages) {
      references.push({
        domain: 'pages',
        entityId: pg.id,
        field: 'content_html',
        label: `Trang tĩnh: ${pg.title} (${pg.path})`,
      });
    }

    // 5. Equipment Check (image_url)
    const equipConds = [ilike(equipment.imageUrl, `%${searchUrl}%`)];
    if (searchFilename) {
      equipConds.push(ilike(equipment.imageUrl, `%${searchFilename}%`));
    }
    const matchedEquipment = await db
      .select({ id: equipment.id, name: equipment.name })
      .from(equipment)
      .where(or(...equipConds));

    for (const eqItem of matchedEquipment) {
      references.push({
        domain: 'equipment',
        entityId: eqItem.id,
        field: 'image_url',
        label: `Trang thiết bị: ${eqItem.name}`,
      });
    }

    // 6. Testimonials Check (image_url)
    const testConds = [ilike(testimonials.imageUrl, `%${searchUrl}%`)];
    if (searchFilename) {
      testConds.push(ilike(testimonials.imageUrl, `%${searchFilename}%`));
    }
    const matchedTestimonials = await db
      .select({ id: testimonials.id, patientName: testimonials.patientName, title: testimonials.title })
      .from(testimonials)
      .where(or(...testConds));

    for (const t of matchedTestimonials) {
      references.push({
        domain: 'testimonials',
        entityId: t.id,
        field: 'image_url',
        label: `Cảm nhận khách hàng: ${t.patientName} (${t.title})`,
      });
    }

    // 7. Homepage Blocks Check (content jsonb text search)
    const searchPattern = `%${searchFilename || searchUrl}%`;
    const matchedBlocks = await db
      .select({ blockKey: homepageBlocks.blockKey, title: homepageBlocks.title })
      .from(homepageBlocks)
      .where(sql`${homepageBlocks.content}::text ILIKE ${searchPattern}`);

    for (const blk of matchedBlocks) {
      references.push({
        domain: 'homepage_blocks',
        entityId: blk.blockKey,
        field: 'content',
        label: `Khối Trang chủ: ${blk.title || blk.blockKey}`,
      });
    }

    return references;
  }
}
