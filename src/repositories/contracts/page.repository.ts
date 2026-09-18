import type { PageContent } from '@/types/doctorcheck';
import type { PageRouteType } from '@/lib/routing/page-route-policy';

export interface PageAdminItem {
  id: string;
  slug: string;
  path: string;
  subpath?: string | null;
  title: string;
  routeType: PageRouteType;
  isRoot: boolean;
  isUxBuilder: boolean;
  featuredImageUrl?: string | null;
  status: string;
  workflowStatus?: string;
  updatedAt: Date;
}

export interface PageAdminDetail {
  id: string;
  slug: string;
  path: string;
  subpath?: string | null;
  title: string;
  excerpt?: string | null;
  contentHtml: string;
  featuredImageUrl?: string | null;
  routeType: PageRouteType;
  isRoot: boolean;
  isUxBuilder: boolean;
  seoTitle?: string | null;
  seoDescription?: string | null;
  status: string;
  workflowStatus?: string;
  updatedAt: Date;
}

export interface PageListAdminParams {
  page?: number;
  pageSize?: number;
  search?: string;
  routeType?: PageRouteType | 'all';
  status?: string;
}

export interface PageListAdminResult {
  items: PageAdminItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface IPageRepository {
  getAll(): Promise<PageContent[]>;
  getBySlug(slug: string): Promise<PageContent | null>;
  getAllSlugs(): Promise<string[]>;
  listAdmin(params?: PageListAdminParams): Promise<PageListAdminResult>;
  getAdminById(id: string): Promise<PageAdminDetail | null>;
}
