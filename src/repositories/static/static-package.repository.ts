import type { IPackageRepository } from '../contracts/package.repository';
import type { PackageTier } from '@/types/doctorcheck';
import { allPackagesList, packagesData } from '@/lib/data/packages';

export class StaticPackageRepository implements IPackageRepository {
  async getAll(): Promise<PackageTier[]> {
    return allPackagesList;
  }

  async getBySlug(slug: string): Promise<PackageTier | null> {
    const normalized = slug.replace(/^\/+|\/+$/g, '');
    const found = allPackagesList.find((p) => p.slug === normalized || p.id === normalized);
    return found || null;
  }

  async getByGender(gender: 'male' | 'female' | 'both'): Promise<PackageTier[]> {
    if (gender === 'female') return packagesData.female;
    if (gender === 'male') return packagesData.male;
    return packagesData.specialized;
  }

  async getPopular(): Promise<PackageTier[]> {
    return allPackagesList.filter((p) => p.popular === true);
  }

  async getAllSlugs(): Promise<string[]> {
    return allPackagesList.map((p) => p.slug);
  }

  async listAdmin(params?: import('../contracts/package.repository').PackageListAdminParams): Promise<import('../contracts/package.repository').PackageListAdminResult> {
    const page = params?.page || 1;
    const pageSize = params?.pageSize || 15;
    const items = allPackagesList.map((p) => ({
      id: p.id,
      slug: p.slug,
      name: p.name,
      gender: p.gender,
      priceVnd: p.price,
      priceFormatted: p.priceFormatted,
      tagline: p.tagline,
      diseasesCovered: p.diseasesCovered,
      cancersCovered: p.cancersCovered,
      duration: p.duration,
      isPopular: p.popular ?? false,
      isActive: true,
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

  async getAdminById(id: string): Promise<import('../contracts/package.repository').PackageAdminDetail | null> {
    const found = allPackagesList.find((p) => p.id === id || p.slug === id);
    if (!found) return null;
    return {
      id: found.id,
      slug: found.slug,
      name: found.name,
      gender: found.gender,
      priceVnd: found.price,
      priceFormatted: found.priceFormatted,
      tagline: found.tagline,
      diseasesCovered: found.diseasesCovered,
      cancersCovered: found.cancersCovered,
      duration: found.duration,
      isPopular: found.popular ?? false,
      recommendedFor: found.recommendedFor,
      features: found.features,
      imageUrl: found.image,
      isActive: true,
      sortOrder: 0,
      status: 'published',
      updatedAt: new Date(),
    };
  }
}

