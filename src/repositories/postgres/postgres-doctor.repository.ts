import 'server-only';
import { eq, asc, desc, sql, and, or, ilike, inArray } from 'drizzle-orm';
import { db } from '@/db';
import * as schema from '@/db/schema';
import type {
  IDoctorRepository,
  DoctorListAdminParams,
  DoctorListAdminResult,
  DoctorAdminItem,
  DoctorAdminDetail,
  SpecialtyItem,
} from '../contracts/doctor.repository';
import type { Doctor } from '@/types/doctorcheck';
import { mapDoctorRowToDomain } from '../mappers/doctor.mapper';

export class PostgresDoctorRepository implements IDoctorRepository {
  async getAll(): Promise<Doctor[]> {
    const rows = await db.select().from(schema.doctors).orderBy(asc(schema.doctors.sortOrder));
    return rows.map(mapDoctorRowToDomain);
  }

  async getBySlug(slug: string): Promise<Doctor | null> {
    const normalized = slug.replace(/^\/+|\/+$/g, '');
    const rows = await db
      .select()
      .from(schema.doctors)
      .where(or(eq(schema.doctors.slug, normalized), eq(schema.doctors.id, normalized)))
      .limit(1);
    if (!rows.length || !rows[0]) return null;
    return mapDoctorRowToDomain(rows[0]);
  }

  async getFeatured(): Promise<Doctor[]> {
    const rows = await db
      .select()
      .from(schema.doctors)
      .where(eq(schema.doctors.isFeatured, true))
      .orderBy(asc(schema.doctors.sortOrder));
    return rows.map(mapDoctorRowToDomain);
  }

  async getAllSlugs(): Promise<string[]> {
    const rows = await db.select({ slug: schema.doctors.slug }).from(schema.doctors);
    return rows.map((r) => r.slug);
  }

  async listAdmin(params: DoctorListAdminParams = {}): Promise<DoctorListAdminResult> {
    const page = Math.max(1, params.page || 1);
    const pageSize = Math.min(100, Math.max(1, params.pageSize || 15));
    const offset = (page - 1) * pageSize;

    const conditions = [];

    if (params.search && params.search.trim().length > 0) {
      const q = `%${params.search.trim()}%`;
      conditions.push(
        or(
          ilike(schema.doctors.name, q),
          ilike(schema.doctors.slug, q),
          ilike(schema.doctors.cchn, q),
          ilike(schema.doctors.specialtySummary, q),
          ilike(schema.doctors.title, q)
        )
      );
    }

    if (params.specialtyId && params.specialtyId.trim().length > 0) {
      const matchedDoctorIds = await db
        .select({ doctorId: schema.doctorSpecialties.doctorId })
        .from(schema.doctorSpecialties)
        .where(eq(schema.doctorSpecialties.specialtyId, params.specialtyId.trim()));

      const ids = matchedDoctorIds.map((r) => r.doctorId);
      if (ids.length > 0) {
        conditions.push(inArray(schema.doctors.id, ids));
      } else {
        conditions.push(sql`1 = 0`);
      }
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Count query
    const [countResult] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(schema.doctors)
      .where(whereClause);

    const total = countResult?.count || 0;
    const totalPages = Math.ceil(total / pageSize);

    // List query
    const rows = await db
      .select({
        id: schema.doctors.id,
        slug: schema.doctors.slug,
        name: schema.doctors.name,
        title: schema.doctors.title,
        cchn: schema.doctors.cchn,
        specialtySummary: schema.doctors.specialtySummary,
        hospital: schema.doctors.hospital,
        imageUrl: schema.doctors.imageUrl,
        experienceYears: schema.doctors.experienceYears,
        isFeatured: schema.doctors.isFeatured,
        sortOrder: schema.doctors.sortOrder,
        updatedAt: schema.doctors.updatedAt,
      })
      .from(schema.doctors)
      .where(whereClause)
      .orderBy(asc(schema.doctors.sortOrder), desc(schema.doctors.updatedAt))
      .limit(pageSize)
      .offset(offset);

    const items: DoctorAdminItem[] = rows.map((r) => ({
      id: r.id,
      slug: r.slug,
      name: r.name,
      title: r.title,
      cchn: r.cchn,
      specialtySummary: r.specialtySummary,
      hospital: r.hospital,
      imageUrl: r.imageUrl,
      experienceYears: r.experienceYears,
      isFeatured: r.isFeatured,
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

  async getAdminById(id: string): Promise<DoctorAdminDetail | null> {
    const rows = await db
      .select()
      .from(schema.doctors)
      .where(or(eq(schema.doctors.id, id), eq(schema.doctors.slug, id)))
      .limit(1);

    if (!rows.length || !rows[0]) return null;
    const doc = rows[0];

    // Load specialties
    const specRows = await db
      .select({ specialtyId: schema.doctorSpecialties.specialtyId })
      .from(schema.doctorSpecialties)
      .where(eq(schema.doctorSpecialties.doctorId, doc.id));

    return {
      id: doc.id,
      slug: doc.slug,
      name: doc.name,
      title: doc.title,
      cchn: doc.cchn,
      specialtySummary: doc.specialtySummary,
      clinicalScope: doc.clinicalScope,
      hospital: doc.hospital,
      experienceYears: doc.experienceYears,
      imageUrl: doc.imageUrl,
      description: doc.description,
      detailedBioHtml: doc.detailedBioHtml,
      schedule: doc.schedule,
      isFeatured: doc.isFeatured,
      sortOrder: doc.sortOrder,
      status: 'published',
      specialtyIds: specRows.map((s) => s.specialtyId),
      seoTitle: doc.seoTitle,
      seoDescription: doc.seoDescription,
      updatedAt: doc.updatedAt,
    };
  }

  async getAllSpecialties(): Promise<SpecialtyItem[]> {
    const rows = await db
      .select({
        id: schema.specialties.id,
        name: schema.specialties.name,
        description: schema.specialties.description,
        sortOrder: schema.specialties.sortOrder,
      })
      .from(schema.specialties)
      .orderBy(asc(schema.specialties.sortOrder));

    return rows;
  }
}

