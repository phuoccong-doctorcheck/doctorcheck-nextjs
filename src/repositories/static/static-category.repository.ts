import type { ICategoryRepository } from '../contracts/category.repository';
import type { CategoryItem } from '@/types/doctorcheck';
import { categoriesData } from '@/lib/data/categories';

export class StaticCategoryRepository implements ICategoryRepository {
  async getAll(): Promise<CategoryItem[]> {
    return categoriesData;
  }

  async getBySlug(slug: string): Promise<CategoryItem | null> {
    const normalized = slug.replace(/^\/+|\/+$/g, '');
    const found = categoriesData.find((c) => c.slug === normalized);
    return found || null;
  }

  async getById(id: number | string): Promise<CategoryItem | null> {
    const targetId = Number(id);
    const found = categoriesData.find((c) => c.id === targetId);
    return found || null;
  }

  async getAllSlugs(): Promise<string[]> {
    return categoriesData.map((c) => c.slug);
  }

  async getUsageCount(_id: string): Promise<number> {
    return 0;
  }

  async create(input: import('../contracts/category.repository').CreateCategoryInput): Promise<CategoryItem> {
    const newItem: CategoryItem = {
      id: Number(input.id) || Date.now(),
      name: input.name,
      slug: input.slug,
      description: input.description,
      seoTitle: input.seoTitle,
      seoDescription: input.seoDescription,
      count: 0,
      dataClassification: 'VERIFIED_PRODUCTION',
    };
    return newItem;
  }

  async update(id: string, input: import('../contracts/category.repository').UpdateCategoryInput): Promise<CategoryItem | null> {
    const target = await this.getById(id);
    if (!target) return null;
    return {
      ...target,
      name: input.name ?? target.name,
      slug: input.slug ?? target.slug,
      description: input.description ?? target.description,
      seoTitle: input.seoTitle ?? target.seoTitle,
      seoDescription: input.seoDescription ?? target.seoDescription,
    };
  }

  async delete(_id: string): Promise<boolean> {
    return true;
  }
}
