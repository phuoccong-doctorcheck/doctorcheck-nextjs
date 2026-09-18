import type { IDoctorRepository } from '../contracts/doctor.repository';
import type { Doctor } from '@/types/doctorcheck';
import { doctorsData } from '@/lib/data/doctors';

export class StaticDoctorRepository implements IDoctorRepository {
  async getAll(): Promise<Doctor[]> {
    return doctorsData;
  }

  async getBySlug(slug: string): Promise<Doctor | null> {
    const normalized = slug.replace(/^\/+|\/+$/g, '');
    const found = doctorsData.find((d) => d.id === normalized);
    return found || null;
  }

  async getFeatured(): Promise<Doctor[]> {
    return doctorsData.filter((d) => d.featured !== false);
  }

  async getAllSlugs(): Promise<string[]> {
    return doctorsData.map((d) => d.id);
  }

  async listAdmin(params?: import('../contracts/doctor.repository').DoctorListAdminParams): Promise<import('../contracts/doctor.repository').DoctorListAdminResult> {
    const page = params?.page || 1;
    const pageSize = params?.pageSize || 15;
    const items = doctorsData.map((d) => ({
      id: d.id,
      slug: d.id,
      name: d.name,
      title: d.title,
      cchn: d.cchn || '',
      specialtySummary: d.specialty || '',
      hospital: d.hospital,
      imageUrl: d.image,
      experienceYears: d.experienceYears || 10,
      isFeatured: d.featured ?? true,
      sortOrder: 0,
      status: 'published',
      updatedAt: new Date(),
    }));
    return {
      items,
      total: items.length,
      page,
      pageSize,
      totalPages: 1,
    };
  }

  async getAdminById(id: string): Promise<import('../contracts/doctor.repository').DoctorAdminDetail | null> {
    const found = doctorsData.find((d) => d.id === id);
    if (!found) return null;
    return {
      id: found.id,
      slug: found.id,
      name: found.name,
      title: found.title,
      cchn: found.cchn || '',
      specialtySummary: found.specialty || '',
      clinicalScope: found.clinicalScope || '',
      hospital: found.hospital,
      experienceYears: found.experienceYears || 10,
      imageUrl: found.image,
      description: found.description,
      schedule: found.schedule,
      isFeatured: found.featured ?? true,
      sortOrder: 0,
      status: 'published',
      specialtyIds: [],
      updatedAt: new Date(),
    };
  }

  async getAllSpecialties(): Promise<import('../contracts/doctor.repository').SpecialtyItem[]> {
    return [];
  }
}

