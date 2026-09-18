import type { Doctor } from '@/types/doctorcheck';

export interface DoctorAdminItem {
  id: string;
  slug: string;
  name: string;
  title: string;
  cchn: string;
  specialtySummary: string;
  hospital: string;
  imageUrl: string;
  experienceYears: number;
  isFeatured: boolean;
  sortOrder: number;
  status: string;
  activeRevisionNumber?: number;
  updatedAt: Date;
}

export interface DoctorAdminDetail extends DoctorAdminItem {
  clinicalScope: string;
  description: string;
  detailedBioHtml?: string | null;
  schedule?: string | null;
  specialtyIds: string[];
  seoTitle?: string | null;
  seoDescription?: string | null;
}

export interface SpecialtyItem {
  id: string;
  name: string;
  description?: string | null;
  sortOrder: number;
}

export interface DoctorListAdminParams {
  page?: number;
  pageSize?: number;
  search?: string;
  specialtyId?: string;
  status?: string;
}

export interface DoctorListAdminResult {
  items: DoctorAdminItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface IDoctorRepository {
  getAll(): Promise<Doctor[]>;
  getBySlug(slug: string): Promise<Doctor | null>;
  getFeatured(): Promise<Doctor[]>;
  getAllSlugs(): Promise<string[]>;
  listAdmin(params?: DoctorListAdminParams): Promise<DoctorListAdminResult>;
  getAdminById(id: string): Promise<DoctorAdminDetail | null>;
  getAllSpecialties(): Promise<SpecialtyItem[]>;
}

