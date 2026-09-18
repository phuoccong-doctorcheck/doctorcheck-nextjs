import type { MedicalArticle } from '@/types/doctorcheck';

export interface AdminArticleListItem {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  featuredImageUrl: string | null;
  authorName: string;
  authorTitle: string;
  status: string;
  publishedAt: Date;
  updatedAt: Date;
  viewsCount: number;
  readingTimeMinutes: number;
  categories: Array<{ id: string; name: string; slug: string; isPrimary: boolean }>;
  latestRevision?: {
    id: string;
    revisionNumber: number;
    status: string;
    version: number;
    updatedAt: Date;
  } | null;
}

export interface AdminArticleListOptions {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
  status?: string;
  sort?: 'publishedAt' | 'updatedAt' | 'title' | 'viewsCount';
  order?: 'asc' | 'desc';
}

export interface AdminArticleListResult {
  items: AdminArticleListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AdminArticleDetail {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  contentHtml: string;
  featuredImageId: string | null;
  featuredImageUrl: string | null;
  authorName: string;
  authorTitle: string;
  status: string;
  viewsCount: number;
  readingTimeMinutes: number;
  toc: Array<{ id: string; text: string; level: number }>;
  seoTitle: string | null;
  seoDescription: string | null;
  canonicalUrl: string | null;
  publishedAt: Date;
  modifiedAt: Date;
  createdAt: Date;
  updatedAt: Date;
  categories: Array<{ id: string; name: string; slug: string; isPrimary: boolean }>;
}

export interface IArticleRepository {
  getAll(): Promise<MedicalArticle[]>;
  getBySlug(slug: string): Promise<MedicalArticle | null>;
  getById(id: string | number): Promise<MedicalArticle | null>;
  getByCategory(categoryIdOrSlug: number | string): Promise<MedicalArticle[]>;
  getRecent(limit?: number): Promise<MedicalArticle[]>;
  getAllSlugs(): Promise<string[]>;
  listAdmin(options?: AdminArticleListOptions): Promise<AdminArticleListResult>;
  getAdminById(id: string): Promise<AdminArticleDetail | null>;
}

