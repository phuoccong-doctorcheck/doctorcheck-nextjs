import type { PackageTier } from '@/types/doctorcheck';

export interface PackageAdminItem {
  id: string;
  slug: string;
  name: string;
  gender: 'male' | 'female' | 'both';
  priceVnd: number;
  priceFormatted: string;
  tagline?: string | null;
  diseasesCovered: number;
  cancersCovered: number;
  duration: string;
  isPopular: boolean;
  isActive: boolean;
  sortOrder: number;
  status: string;
  activeRevisionNumber?: number;
  updatedAt: Date;
}

export interface PackageAdminDetail extends PackageAdminItem {
  recommendedFor: string;
  features: string[];
  imageUrl?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
}

export interface PackageListAdminParams {
  page?: number;
  pageSize?: number;
  search?: string;
  gender?: string;
  status?: string;
}

export interface PackageListAdminResult {
  items: PackageAdminItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface IPackageRepository {
  getAll(): Promise<PackageTier[]>;
  getBySlug(slug: string): Promise<PackageTier | null>;
  getByGender(gender: 'male' | 'female' | 'both'): Promise<PackageTier[]>;
  getPopular(): Promise<PackageTier[]>;
  getAllSlugs(): Promise<string[]>;
  listAdmin(params?: PackageListAdminParams): Promise<PackageListAdminResult>;
  getAdminById(id: string): Promise<PackageAdminDetail | null>;
}

