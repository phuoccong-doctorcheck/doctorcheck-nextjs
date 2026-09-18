import type { Doctor } from '@/types/doctorcheck';
import type { doctors } from '@/db/schema';

type DoctorRow = typeof doctors.$inferSelect;

export function mapDoctorRowToDomain(row: DoctorRow): Doctor {
  return {
    id: row.id,
    name: row.name,
    title: row.title,
    specialty: row.specialtySummary,
    cchn: row.cchn,
    clinicalScope: row.clinicalScope,
    hospital: row.hospital,
    image: row.imageUrl,
    description: row.description,
    schedule: row.schedule || undefined,
    experienceYears: row.experienceYears || undefined,
    featured: row.isFeatured,
    dataClassification: 'VERIFIED_PRODUCTION',
  };
}
