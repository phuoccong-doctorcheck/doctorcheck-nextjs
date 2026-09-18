export interface Doctor {
  id: string;
  name: string;
  title: string;
  specialty: string;
  cchn?: string; // Chứng chỉ hành nghề (Official Medical Practice License)
  clinicalScope?: string; // Phạm vi hoạt động chuyên môn
  hospital: string;
  image: string;
  description: string;
  schedule?: string;
  experienceYears?: number;
  featured?: boolean;
  dataClassification: 'VERIFIED_PRODUCTION';
}

export interface PackageTier {
  id: string;
  slug: string;
  name: string;
  gender: 'male' | 'female' | 'both';
  price: number;
  priceFormatted: string;
  tagline: string;
  diseasesCovered: number;
  cancersCovered: number;
  duration: string;
  popular?: boolean;
  features: string[];
  recommendedFor: string;
  url?: string;
  image?: string;
  dataClassification: 'VERIFIED_PRODUCTION';
}

export interface ClinicInfo {
  name: string;
  brandName: string;
  legalName: string;
  license: string;
  licenseIssuer: string;
  address: {
    full: string;
    short: string;
    street: string;
    ward: string;
    district: string;
    city: string;
  };
  hotline: string;
  hotlineFormatted: string;
  hotlineTel: string;
  zaloUrl: string;
  email: string;
  websiteUrl: string;
  workingHours: string;
  workingHoursShort: string;
  coordinates: {
    latitude: number;
    longitude: number;
    status: string;
  };
  dataClassification: 'VERIFIED_PRODUCTION';
}

export interface TableOfContentsItem {
  id: string;
  text: string;
  level: 2 | 3;
}

export interface MedicalArticleSummary {
  id: number;
  slug: string;
  title: string;
  date: string;
  modified: string;
  categories: number[];
  featuredMediaId?: number;
  link: string;
  status: 'AUTHENTIC_METADATA_VERIFIED' | 'AUTHENTIC_CONTENT_MIGRATED';
  contentImportStatus: 'BLOCKED_PENDING_CMS_IMPORT' | 'CONTENT_MIGRATED_VERIFIED';
  dataClassification: 'VERIFIED_PRODUCTION';
}

export interface MedicalArticle extends MedicalArticleSummary {
  contentHtml: string;
  excerpt?: string;
  featuredImageUrl?: string;
  featuredImageAlt?: string;
  featuredImageWidth?: number;
  featuredImageHeight?: number;
  authorName?: string;
  authorTitle?: string;
  tableOfContents: TableOfContentsItem[];
  seoTitle?: string;
  metaDescription?: string;
}

export interface PageContent {
  id: number;
  slug: string;
  title: string;
  contentHtml: string;
  excerpt?: string;
  featuredImageUrl?: string;
  date?: string;
  modified?: string;
  seoTitle?: string;
  metaDescription?: string;
  dataClassification: 'VERIFIED_PRODUCTION';
}

export interface CategoryItem {
  id: number | string;
  name: string;
  slug: string;
  count: number;
  totalArticles?: number;
  description?: string;
  seoTitle?: string;
  seoDescription?: string;
  sortOrder?: number;
  dataClassification: 'VERIFIED_PRODUCTION';
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category?: string;
  dataClassification?: 'VERIFIED_PRODUCTION';
}

export interface TestimonialVideo {
  id: string;
  title: string;
  patientName: string;
  patientAge?: number;
  videoId: string;
  thumbnail: string;
  quote: string;
  dataClassification?: 'VERIFIED_PRODUCTION';
}

export interface MedicalEquipment {
  id: string;
  name: string;
  origin: string;
  manufacturer: string;
  image: string;
  description: string;
  features: string[];
  dataClassification?: 'VERIFIED_PRODUCTION';
}

export interface CustomerStory {
  id: string;
  title: string;
  patientName: string;
  summary: string;
  fullStory: string;
  image: string;
  tag: string;
  dataClassification?: 'VERIFIED_PRODUCTION';
}

export interface NavDropdownItem {
  title: string;
  href: string;
  description?: string;
}

export interface NavItem {
  title: string;
  href: string;
  children?: NavDropdownItem[];
}

export interface BookingFormData {
  customer_name: string;
  customer_phone: string;
  customer_year?: string;
  services_list: string;
  date_booking: string;
  notes?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  gclid?: string;
  current_url?: string;
}
