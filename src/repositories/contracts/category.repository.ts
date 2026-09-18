import type { CategoryItem } from '@/types/doctorcheck';

export interface CreateCategoryInput {
  id?: string;
  name: string;
  slug: string;
  description?: string;
  seoTitle?: string;
  seoDescription?: string;
  sortOrder?: number;
}

export interface UpdateCategoryInput {
  name?: string;
  slug?: string;
  description?: string;
  seoTitle?: string;
  seoDescription?: string;
  sortOrder?: number;
}

export interface ICategoryRepository {
  getAll(): Promise<CategoryItem[]>;
  getBySlug(slug: string): Promise<CategoryItem | null>;
  getById(id: number | string): Promise<CategoryItem | null>;
  getAllSlugs(): Promise<string[]>;
  getUsageCount(id: string): Promise<number>;
  create(input: CreateCategoryInput): Promise<CategoryItem>;
  update(id: string, input: UpdateCategoryInput): Promise<CategoryItem | null>;
  delete(id: string): Promise<boolean>;
}

