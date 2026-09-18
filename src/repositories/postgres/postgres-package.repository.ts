import 'server-only';
import { eq, asc, desc, sql, and, or, ilike } from 'drizzle-orm';
import { db } from '@/db';
import * as schema from '@/db/schema';
import type {
  IPackageRepository,
  PackageListAdminParams,
  PackageListAdminResult,
  PackageAdminItem,
  PackageAdminDetail,
} from '../contracts/package.repository';
import type { PackageTier } from '@/types/doctorcheck';
import { mapPackageRowToDomain } from '../mappers/package.mapper';

export class PostgresPackageRepository implements IPackageRepository {
  async getAll(): Promise<PackageTier[]> {
    const rows = await db
      .select()
      .from(schema.packages)
      .where(eq(schema.packages.isActive, true))
      .orderBy(asc(schema.packages.sortOrder));
    return rows.map(mapPackageRowToDomain);
  }

  async getBySlug(slug: string): Promise<PackageTier | null> {
    const normalized = slug.replace(/^\/+|\/+$/g, '');
    const rows = await db
      .select()
      .from(schema.packages)
      .where(or(eq(schema.packages.slug, normalized), eq(schema.packages.id, normalized)))
      .limit(1);
    if (!rows.length || !rows[0]) return null;
    return mapPackageRowToDomain(rows[0]);
  }

  async getByGender(gender: 'male' | 'female' | 'both'): Promise<PackageTier[]> {
    const rows = await db
      .select()
      .from(schema.packages)
      .where(eq(schema.packages.gender, gender))
      .orderBy(asc(schema.packages.sortOrder));
    return rows.map(mapPackageRowToDomain);
  }

  async getPopular(): Promise<PackageTier[]> {
    const rows = await db
      .select()
      .from(schema.packages)
      .where(eq(schema.packages.isPopular, true))
      .orderBy(asc(schema.packages.sortOrder));
    return rows.map(mapPackageRowToDomain);
  }

  async getAllSlugs(): Promise<string[]> {
    const rows = await db
      .select({ slug: schema.packages.slug })
      .from(schema.packages)
      .where(eq(schema.packages.isActive, true));
    return rows.map((r) => r.slug);
  }

  async listAdmin(params: PackageListAdminParams = {}): Promise<PackageListAdminResult> {
    const page = Math.max(1, params.page || 1);
    const pageSize = Math.min(100, Math.max(1, params.pageSize || 15));
    const offset = (page - 1) * pageSize;

    const conditions = [];

    if (params.search && params.search.trim().length > 0) {
      const q = `%${params.search.trim()}%`;
      conditions.push(
        or(
          ilike(schema.packages.name, q),
          ilike(schema.packages.slug, q),
          ilike(schema.packages.tagline, q),
          ilike(schema.packages.recommendedFor, q)
        )
      );
    }

    if (params.gender && params.gender.trim().length > 0 && params.gender !== 'all') {
      conditions.push(eq(schema.packages.gender, params.gender.trim()));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Count query
    const [countResult] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(schema.packages)
      .where(whereClause);

    const total = countResult?.count || 0;
    const totalPages = Math.ceil(total / pageSize);

    // List query
    const rows = await db
      .select({
        id: schema.packages.id,
        slug: schema.packages.slug,
        name: schema.packages.name,
        gender: schema.packages.gender,
        priceVnd: schema.packages.priceVnd,
        priceFormatted: schema.packages.priceFormatted,
        tagline: schema.packages.tagline,
        diseasesCovered: schema.packages.diseasesCovered,
        cancersCovered: schema.packages.cancersCovered,
        duration: schema.packages.duration,
        isPopular: schema.packages.isPopular,
        isActive: schema.packages.isActive,
        sortOrder: schema.packages.sortOrder,
        updatedAt: schema.packages.updatedAt,
      })
      .from(schema.packages)
      .where(whereClause)
      .orderBy(asc(schema.packages.sortOrder), desc(schema.packages.updatedAt))
      .limit(pageSize)
      .offset(offset);

    const items: PackageAdminItem[] = rows.map((r) => ({
      id: r.id,
      slug: r.slug,
      name: r.name,
      gender: r.gender as 'male' | 'female' | 'both',
      priceVnd: Number(r.priceVnd),
      priceFormatted: r.priceFormatted,
      tagline: r.tagline,
      diseasesCovered: r.diseasesCovered,
      cancersCovered: r.cancersCovered,
      duration: r.duration,
      isPopular: r.isPopular,
      isActive: r.isActive,
      sortOrder: r.sortOrder,
      status: 'published',
      updatedAt: r.updatedAt,
    }));

    return {
      items,
      total,
      page,
      pageSize,
      totalPages,
    };
  }

  async getAdminById(id: string): Promise<PackageAdminDetail | null> {
    const rows = await db
      .select()
      .from(schema.packages)
      .where(or(eq(schema.packages.id, id), eq(schema.packages.slug, id)))
      .limit(1);

    if (!rows.length || !rows[0]) return null;
    const pkg = rows[0];

    return {
      id: pkg.id,
      slug: pkg.slug,
      name: pkg.name,
      gender: pkg.gender as 'male' | 'female' | 'both',
      priceVnd: Number(pkg.priceVnd),
      priceFormatted: pkg.priceFormatted,
      tagline: pkg.tagline,
      diseasesCovered: pkg.diseasesCovered,
      cancersCovered: pkg.cancersCovered,
      duration: pkg.duration,
      isPopular: pkg.isPopular,
      recommendedFor: pkg.recommendedFor,
      features: (pkg.features as unknown as string[]) || [],
      imageUrl: pkg.imageUrl,
      isActive: pkg.isActive,
      sortOrder: pkg.sortOrder,
      status: 'published',
      seoTitle: pkg.seoTitle,
      seoDescription: pkg.seoDescription,
      updatedAt: pkg.updatedAt,
    };
  }
}

