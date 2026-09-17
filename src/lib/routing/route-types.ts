import type {
  MedicalArticle,
  MedicalArticleSummary,
  CategoryItem,
  PackageTier,
  Doctor,
  PageContent as FullPageContent,
} from '@/types/doctorcheck';

export type RouteType =
  | 'article'
  | 'category'
  | 'package'
  | 'doctor'
  | 'page'
  | 'redirect'
  | 'notFound';

export interface PageRouteMetadata {
  id: number;
  slug: string;
  path: string;
  isRoot: boolean;
  subpath: string;
  title: string;
  description?: string;
  contentHtml?: string;
}

export interface ResolvedContent {
  type: RouteType;
  slug: string;
  canonicalUrl: string;
  title: string;
  redirectTarget?: string;
  data?: {
    article?: MedicalArticle | MedicalArticleSummary;
    category?: CategoryItem;
    package?: PackageTier;
    doctor?: Doctor;
    page?: PageRouteMetadata;
    pageContent?: FullPageContent;
  };
}
