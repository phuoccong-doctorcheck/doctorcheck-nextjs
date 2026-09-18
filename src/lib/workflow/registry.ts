import { z } from 'zod';
import { Permission, PermissionKey } from '@/lib/auth/rbac';
import {
  ContentType,
  ContentTypeId,
  WorkflowStatus,
  WorkflowStatusType,
  WorkflowAction,
  WorkflowActionType,
  RevalidationPlan,
  DomainValidationResult,
} from './types';

export interface WorkflowActionPermissions {
  createDraft: PermissionKey | string;
  updateDraft: PermissionKey | string;
  submitReview: PermissionKey | string;
  returnToDraft: PermissionKey | string;
  approve: PermissionKey | string;
  publish: PermissionKey | string;
  archive: PermissionKey | string;
  restore: PermissionKey | string;
}

export interface DomainWorkflowDefinition {
  type: ContentTypeId;
  name: string;
  requiresMedicalReview: boolean;
  permissions: WorkflowActionPermissions;
  schema: z.ZodType<unknown>;
  getRevalidationPlan: (entityId: string, payload: Record<string, unknown>) => RevalidationPlan;
}

/**
 * Valid state transition matrix
 */
export const VALID_WORKFLOW_TRANSITIONS: Array<{
  from: WorkflowStatusType;
  to: WorkflowStatusType;
  action: WorkflowActionType;
}> = [
  // Draft lifecycle
  { from: WorkflowStatus.DRAFT, to: WorkflowStatus.DRAFT, action: WorkflowAction.UPDATE_DRAFT },
  { from: WorkflowStatus.DRAFT, to: WorkflowStatus.IN_REVIEW, action: WorkflowAction.SUBMIT_REVIEW },
  { from: WorkflowStatus.DRAFT, to: WorkflowStatus.PUBLISHED, action: WorkflowAction.PUBLISH }, // Direct publish for authorized publishers

  // Review lifecycle
  { from: WorkflowStatus.IN_REVIEW, to: WorkflowStatus.DRAFT, action: WorkflowAction.RETURN_TO_DRAFT },
  { from: WorkflowStatus.IN_REVIEW, to: WorkflowStatus.APPROVED, action: WorkflowAction.APPROVE },
  { from: WorkflowStatus.IN_REVIEW, to: WorkflowStatus.PUBLISHED, action: WorkflowAction.PUBLISH },

  // Approved lifecycle
  { from: WorkflowStatus.APPROVED, to: WorkflowStatus.PUBLISHED, action: WorkflowAction.PUBLISH },
  { from: WorkflowStatus.APPROVED, to: WorkflowStatus.DRAFT, action: WorkflowAction.RETURN_TO_DRAFT },

  // Published lifecycle (creating draft revision doesn't change published state)
  { from: WorkflowStatus.PUBLISHED, to: WorkflowStatus.ARCHIVED, action: WorkflowAction.ARCHIVE },

  // Archived lifecycle
  { from: WorkflowStatus.ARCHIVED, to: WorkflowStatus.DRAFT, action: WorkflowAction.RESTORE },
];

/**
 * Checks whether a given status transition is structurally valid.
 */
export function isValidTransition(
  from: WorkflowStatusType,
  to: WorkflowStatusType,
  action: WorkflowActionType
): boolean {
  return VALID_WORKFLOW_TRANSITIONS.some(
    (rule) => rule.from === from && rule.to === to && rule.action === action
  );
}

// -----------------------------------------------------------------------------
// Domain Schemas for Payload Snapshot Validation
// -----------------------------------------------------------------------------

export const ArticleSnapshotSchema = z.object({
  title: z.string().min(3).max(512),
  slug: z.string().min(2).max(255).regex(/^[a-z0-9-]+$/, 'Slug phải viết thường và chỉ chứa ký tự chữ, số và dấu gạch ngang'),
  excerpt: z.string().optional().nullable(),
  contentHtml: z.string().min(10, 'Nội dung bài viết phải có ít nhất 10 ký tự'),
  featuredImageId: z.string().uuid().optional().nullable(),
  featuredImageUrl: z.string().optional().nullable(),
  authorName: z.string().min(2).max(255).default('Đội ngũ Bác sĩ DoctorCheck'),
  authorTitle: z.string().min(2).max(255).default('Bác sĩ Chuyên khoa Tiêu hóa'),
  categoryIds: z.array(z.string()).default([]),
  toc: z.array(z.object({ id: z.string(), text: z.string(), level: z.number() })).default([]),
  seoTitle: z.string().max(255).optional().nullable(),
  seoDescription: z.string().optional().nullable(),
  canonicalUrl: z.string().optional().nullable(),
});

export const PageSnapshotSchema = z.object({
  title: z.string().min(2).max(512),
  slug: z.string().min(2).max(128).regex(/^[a-z0-9-]+$/),
  path: z.string().max(255).optional().nullable(),
  routeType: z.enum(['ROOT', 'ENDOSCOPY_CHILD', 'INTERNAL']).optional().nullable(),
  subpath: z.string().max(128).optional().nullable(),
  excerpt: z.string().optional().nullable(),
  contentHtml: z.string().default(''),
  featuredImageUrl: z.string().optional().nullable(),
  isRoot: z.boolean().default(true),
  isUxBuilder: z.boolean().default(false),
  status: z.string().default('published'),
  seoTitle: z.string().max(255).optional().nullable(),
  seoDescription: z.string().optional().nullable(),
});

export const DoctorSnapshotSchema = z.object({
  name: z.string().min(2).max(255),
  slug: z.string().min(2).max(128).regex(/^[a-z0-9-]+$/),
  title: z.string().min(2).max(255),
  cchn: z.string().min(2).max(64),
  specialtySummary: z.string().min(2).max(255),
  clinicalScope: z.string().min(5),
  hospital: z.string().min(2).max(255),
  experienceYears: z.number().int().min(0).max(70).default(10),
  imageUrl: z.string().min(1),
  description: z.string().min(5),
  detailedBioHtml: z.string().optional().nullable(),
  schedule: z.string().max(255).default('Thứ 2 - Thứ 7 (Theo lịch hẹn)'),
  isFeatured: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
  specialtyIds: z.array(z.string()).default([]),
  seoTitle: z.string().max(255).optional().nullable(),
  seoDescription: z.string().optional().nullable(),
});

export const PackageSnapshotSchema = z.object({
  name: z.string().min(3).max(255),
  slug: z.string().min(2).max(128).regex(/^[a-z0-9-]+$/),
  gender: z.enum(['male', 'female', 'both']).default('both'),
  priceVnd: z.union([z.number(), z.string()]).transform((val) => Number(val)).refine((v) => !isNaN(v) && v >= 0, 'Giá tiền không hợp lệ'),
  priceFormatted: z.string().max(64).optional().nullable(),
  tagline: z.string().max(255).optional().nullable(),
  diseasesCovered: z.number().int().min(0).default(0),
  cancersCovered: z.number().int().min(0).default(0),
  duration: z.string().max(64).default('120 - 180 phút'),
  isPopular: z.boolean().default(false),
  recommendedFor: z.string().min(3),
  features: z.array(z.string()).default([]),
  imageUrl: z.string().optional().nullable(),
  sortOrder: z.number().int().default(0),
  isActive: z.boolean().default(true),
  seoTitle: z.string().max(255).optional().nullable(),
  seoDescription: z.string().optional().nullable(),
});

export const ClinicSnapshotSchema = z.object({
  name: z.string().min(2).max(255),
  legalName: z.string().min(2).max(255),
  licenseNumber: z.string().min(2).max(128),
  taxCode: z.string().min(2).max(64),
  hotline: z.string().min(2).max(32),
  emergencyPhone: z.string().max(32).optional().nullable(),
  zaloUrl: z.string().min(2),
  email: z.string().email(),
  addressStreet: z.string().min(2).max(255),
  addressWard: z.string().min(2).max(128),
  addressDistrict: z.string().min(2).max(128),
  addressCity: z.string().min(2).max(128),
  addressFull: z.string().min(2).max(512),
  latitude: z.union([z.number(), z.string()]).transform((v) => String(v)),
  longitude: z.union([z.number(), z.string()]).transform((v) => String(v)),
  workingHours: z.object({
    full: z.string().optional(),
    short: z.string().optional(),
  }).default({
    full: 'Thứ 2 - Thứ 7: 07:30 - 17:00',
    short: 'T2 - T7: 07:30 - 17:00',
  }),
});

export const EquipmentSnapshotSchema = z.object({
  name: z.string().min(2).max(255),
  origin: z.string().min(2).max(128),
  manufacturer: z.string().min(2).max(128),
  imageUrl: z.string().min(1),
  description: z.string().min(5),
  features: z.array(z.string()).default([]),
  sortOrder: z.number().int().default(0),
  isActive: z.boolean().default(true),
});

export const FaqSnapshotSchema = z.object({
  question: z.string().min(5),
  answer: z.string().min(5),
  category: z.string().max(128).default('general'),
  sortOrder: z.number().int().default(0),
  isPublished: z.boolean().default(true),
});

function normalizeYouTubeId(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const str = raw.trim();
  if (!str) return null;

  // Reject unsafe protocols or markup
  if (
    str.includes('<') ||
    str.includes('>') ||
    str.toLowerCase().startsWith('javascript:') ||
    str.toLowerCase().startsWith('data:')
  ) {
    return null;
  }

  // Pure 11-char ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(str)) {
    return str;
  }

  // youtu.be/<id>
  const shortMatch = str.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
  if (shortMatch) return shortMatch[1];

  // youtube.com/watch?v=<id> or youtube.com/embed/<id>
  const longMatch = str.match(/(?:youtube\.com\/(?:watch\?.*v=|embed\/))([a-zA-Z0-9_-]{11})/);
  if (longMatch) return longMatch[1];

  return null;
}

export const TestimonialSnapshotSchema = z.object({
  type: z.enum(['video', 'customer_story']),
  title: z.string().min(3).max(512),
  patientName: z.string().min(2).max(255),
  patientAge: z.union([z.number(), z.string()]).optional().nullable().transform((v) => (v === undefined || v === null || v === '' ? null : Number(v))),
  videoId: z
    .string()
    .optional()
    .nullable()
    .transform((val) => normalizeYouTubeId(val)),
  imageUrl: z.string().optional().nullable(),
  quote: z.string().optional().nullable(),
  fullStory: z.string().optional().nullable(),
  tag: z.string().max(128).optional().nullable(),
  sortOrder: z.number().int().default(0),
  isPublished: z.boolean().default(true),
}).superRefine((data, ctx) => {
  if (data.type === 'video' && !data.videoId) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Video cảm nhận bắt buộc phải có YouTube Video ID hoặc URL hợp lệ.',
      path: ['videoId'],
    });
  }
});

export const GenericSnapshotSchema = z.record(z.string(), z.unknown());

export function isValidCtaTarget(url: string): boolean {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  if (trimmed.length === 0) return false;

  const lower = trimmed.toLowerCase();
  if (
    lower.startsWith('javascript:') ||
    lower.startsWith('data:') ||
    lower.startsWith('vbscript:') ||
    lower.startsWith('file:') ||
    lower.includes('<') ||
    lower.includes('>') ||
    lower.startsWith('//')
  ) {
    return false;
  }

  if (trimmed.startsWith('/') || trimmed.startsWith('#')) {
    return true;
  }

  if (trimmed.startsWith('https://') || trimmed.startsWith('http://')) {
    return true;
  }

  if (trimmed.startsWith('tel:') || trimmed.startsWith('mailto:')) {
    return true;
  }

  return false;
}

export const CtaTargetSchema = z
  .string()
  .min(1, 'Đường dẫn liên kết không được để trống')
  .max(512, 'Đường dẫn liên kết quá dài')
  .refine(
    (val) => isValidCtaTarget(val),
    'Đường dẫn liên kết không hợp lệ hoặc chứa giao thức không an toàn (chấp nhận đường dẫn nội bộ /, thẻ neo #, hoặc liên kết https://, http://, tel:, mailto:).'
  );

export const HeroBlockConfigSchema = z.object({
  title: z.string().min(2, 'Tiêu đề Hero tối thiểu 2 ký tự').max(255),
  subtitle: z.string().min(2, 'Mô tả phụ Hero tối thiểu 2 ký tự').max(500),
  desktopBanner: z.string().min(1, 'Ảnh banner desktop bắt buộc'),
  mobileBanner: z.string().min(1, 'Ảnh banner mobile bắt buộc'),
  ctaTarget: CtaTargetSchema,
});

export const PainPointItemSchema = z.object({
  num: z.number().int().min(1).max(20),
  title: z.string().min(2).max(255),
});

export const PainPointsBlockConfigSchema = z.object({
  title: z.string().min(2).max(255),
  subtitle: z.string().min(2).max(500),
  items: z.array(PainPointItemSchema).min(1).max(10),
});

export const BenefitItemConfigSchema = z.object({
  num: z.number().int().min(1).max(20),
  title: z.string().min(2).max(255),
  desc: z.string().min(5).max(1000),
});

export const BenefitsBlockConfigSchema = z.object({
  title: z.string().min(2).max(255),
  moreUrl: CtaTargetSchema,
  moreLabel: z.string().min(2).max(100),
  bannerImage: z.string().min(1),
  bannerVideoId: z.string().min(1).transform((val) => normalizeYouTubeId(val) || val),
  items: z.array(BenefitItemConfigSchema).min(1).max(10),
});

export const CancerScreeningCardConfigSchema = z.object({
  id: z.string().min(1).max(64),
  title: z.string().min(2).max(255),
  price: z.string().min(1).max(64),
  slug: CtaTargetSchema,
});

export const CancerScreeningBlockConfigSchema = z.object({
  title: z.string().min(2).max(255),
  description: z.string().min(5).max(1000),
  ctaUrl: CtaTargetSchema,
  ctaLabel: z.string().min(2).max(100),
  featuredCards: z.array(CancerScreeningCardConfigSchema).min(1).max(10),
});

export const BannerCtaBlockConfigSchema = z.object({
  brand: z.string().min(1).max(100),
  title: z.string().min(2).max(255),
  workingHoursTitle: z.string().min(2).max(100),
  workingHoursWeekday: z.string().min(2).max(100),
  workingHoursSunday: z.string().min(2).max(100),
  buttonText: z.string().min(2).max(100),
  buttonTarget: CtaTargetSchema,
  desktopImage: z.string().min(1),
  mobileImage: z.string().min(1),
});

export const SectionsMetaConfigSchema = z.object({
  doctorsHeader: z.object({
    title: z.string().min(2).max(255),
    subtitle: z.string().min(2).max(500),
    ctaUrl: CtaTargetSchema,
    ctaLabel: z.string().min(2).max(100),
  }),
  equipmentHeader: z.object({
    title: z.string().min(2).max(255),
    description: z.string().min(5).max(1000),
  }),
  pricingHeader: z.object({
    title: z.string().min(2).max(255),
    maleMoreUrl: CtaTargetSchema,
    femaleMoreUrl: CtaTargetSchema,
  }),
  customerStoriesHeader: z.object({
    title: z.string().min(2).max(255),
    subtitle: z.string().min(2).max(500),
    viewAllUrl: CtaTargetSchema,
  }),
  videoTestimonialsHeader: z.object({
    titleDesktop: z.string().min(2).max(255),
    titleMobile: z.string().min(2).max(255),
  }),
  faqHeader: z.object({
    title: z.string().min(2).max(255),
  }),
  bookingHeader: z.object({
    title: z.string().min(2).max(255),
    formTitle: z.string().min(2).max(500),
  }),
});

export const HomepagePackageCardSchema = z.object({
  id: z.string().min(1).max(64),
  slug: CtaTargetSchema,
  name: z.string().min(2).max(255),
  price: z.string().min(1).max(64),
  sub: z.string().min(2).max(255),
  image: z.string().min(1),
});

export const PricingBlockConfigSchema = z.object({
  malePackages: z.array(HomepagePackageCardSchema).min(1).max(10),
  femalePackages: z.array(HomepagePackageCardSchema).min(1).max(10),
});

export const HomepageSnapshotSchema = z
  .object({
    hero: HeroBlockConfigSchema,
    painPoints: PainPointsBlockConfigSchema,
    benefits: BenefitsBlockConfigSchema,
    cancerScreening: CancerScreeningBlockConfigSchema,
    bannerCta: BannerCtaBlockConfigSchema,
    sectionsMeta: SectionsMetaConfigSchema,
    pricing: PricingBlockConfigSchema,
  })
  .strict();

// -----------------------------------------------------------------------------
// Central Domain Registry Map
// -----------------------------------------------------------------------------

export const DOMAIN_WORKFLOW_REGISTRY: Record<ContentTypeId, DomainWorkflowDefinition> = {
  [ContentType.ARTICLE]: {
    type: ContentType.ARTICLE,
    name: 'Bài Viết Y Khoa',
    requiresMedicalReview: true,
    permissions: {
      createDraft: Permission.ARTICLE_CREATE,
      updateDraft: Permission.ARTICLE_EDIT_DRAFT,
      submitReview: Permission.ARTICLE_EDIT_DRAFT,
      returnToDraft: Permission.ARTICLE_REVIEW,
      approve: Permission.ARTICLE_REVIEW,
      publish: Permission.ARTICLE_PUBLISH,
      archive: Permission.ARTICLE_DELETE,
      restore: Permission.ARTICLE_CREATE,
    },
    schema: ArticleSnapshotSchema,
    getRevalidationPlan: (_id, payload) => {
      const slug = (payload.slug as string) || '';
      return {
        paths: ['/', `/${slug}`, '/chuyen-muc/kien-thuc-ung-thu-da-day', '/chuyen-muc/kien-thuc-ung-thu-dai-trang', '/sitemap.xml'],
        tags: ['articles', `article-${slug}`],
      };
    },
  },

  [ContentType.PAGE]: {
    type: ContentType.PAGE,
    name: 'Trang Tĩnh & Nội Soi',
    requiresMedicalReview: false,
    permissions: {
      createDraft: Permission.PAGE_EDIT,
      updateDraft: Permission.PAGE_EDIT,
      submitReview: Permission.PAGE_EDIT,
      returnToDraft: Permission.PAGE_EDIT,
      approve: Permission.PAGE_PUBLISH,
      publish: Permission.PAGE_PUBLISH,
      archive: Permission.PAGE_EDIT,
      restore: Permission.PAGE_EDIT,
    },
    schema: PageSnapshotSchema,
    getRevalidationPlan: (_id, payload) => {
      const path = (payload.path as string) || '/';
      return {
        paths: ['/', path, '/sitemap.xml'],
        tags: ['pages', `page-${_id}`],
      };
    },
  },

  [ContentType.DOCTOR]: {
    type: ContentType.DOCTOR,
    name: 'Đội Ngũ Bác Sĩ',
    requiresMedicalReview: true,
    permissions: {
      createDraft: Permission.DOCTOR_EDIT_BIO,
      updateDraft: Permission.DOCTOR_EDIT_BIO,
      submitReview: Permission.DOCTOR_EDIT_BIO,
      returnToDraft: Permission.DOCTOR_EDIT_CCHN,
      approve: Permission.DOCTOR_EDIT_CCHN,
      publish: Permission.DOCTOR_EDIT_CCHN,
      archive: Permission.DOCTOR_EDIT_CCHN,
      restore: Permission.DOCTOR_EDIT_BIO,
    },
    schema: DoctorSnapshotSchema,
    getRevalidationPlan: (_id, payload) => {
      const slug = (payload.slug as string) || '';
      return {
        paths: ['/', `/doctor/${slug}`, '/doi-ngu-bac-si', '/sitemap.xml'],
        tags: ['doctors', `doctor-${slug}`],
      };
    },
  },

  [ContentType.PACKAGE]: {
    type: ContentType.PACKAGE,
    name: 'Gói Khám & Dịch Vụ',
    requiresMedicalReview: false,
    permissions: {
      createDraft: Permission.PACKAGE_EDIT_CONTENT,
      updateDraft: Permission.PACKAGE_EDIT_CONTENT,
      submitReview: Permission.PACKAGE_EDIT_CONTENT,
      returnToDraft: Permission.PACKAGE_EDIT_PRICE,
      approve: Permission.PACKAGE_EDIT_PRICE,
      publish: Permission.PACKAGE_PUBLISH,
      archive: Permission.PACKAGE_PUBLISH,
      restore: Permission.PACKAGE_EDIT_CONTENT,
    },
    schema: PackageSnapshotSchema,
    getRevalidationPlan: (_id, payload) => {
      const slug = (payload.slug as string) || '';
      return {
        paths: ['/', `/${slug}`, '/bang-gia-dich-vu', '/sitemap.xml'],
        tags: ['packages', `package-${slug}`],
      };
    },
  },

  [ContentType.CLINIC]: {
    type: ContentType.CLINIC,
    name: 'Hồ Sơ & Danh Tính Phòng Khám',
    requiresMedicalReview: false,
    permissions: {
      createDraft: Permission.CLINIC_EDIT,
      updateDraft: Permission.CLINIC_EDIT,
      submitReview: Permission.CLINIC_EDIT,
      returnToDraft: Permission.CLINIC_PUBLISH,
      approve: Permission.CLINIC_PUBLISH,
      publish: Permission.CLINIC_PUBLISH,
      archive: Permission.CLINIC_PUBLISH,
      restore: Permission.CLINIC_EDIT,
    },
    schema: ClinicSnapshotSchema,
    getRevalidationPlan: () => ({
      paths: ['/', '/ve-chung-toi'],
      tags: ['clinic'],
    }),
  },

  [ContentType.EQUIPMENT]: {
    type: ContentType.EQUIPMENT,
    name: 'Trang Thiết Bị Y Khoa',
    requiresMedicalReview: false,
    permissions: {
      createDraft: Permission.CLINICAL_TRUST_EDIT,
      updateDraft: Permission.CLINICAL_TRUST_EDIT,
      submitReview: Permission.CLINICAL_TRUST_EDIT,
      returnToDraft: Permission.CLINICAL_TRUST_PUBLISH,
      approve: Permission.CLINICAL_TRUST_PUBLISH,
      publish: Permission.CLINICAL_TRUST_PUBLISH,
      archive: Permission.CLINICAL_TRUST_PUBLISH,
      restore: Permission.CLINICAL_TRUST_EDIT,
    },
    schema: EquipmentSnapshotSchema,
    getRevalidationPlan: () => ({
      paths: ['/'],
      tags: ['equipment'],
    }),
  },

  [ContentType.FAQ]: {
    type: ContentType.FAQ,
    name: 'Câu Hỏi Thường Gặp (FAQ)',
    requiresMedicalReview: false,
    permissions: {
      createDraft: Permission.CLINICAL_TRUST_EDIT,
      updateDraft: Permission.CLINICAL_TRUST_EDIT,
      submitReview: Permission.CLINICAL_TRUST_EDIT,
      returnToDraft: Permission.CLINICAL_TRUST_PUBLISH,
      approve: Permission.CLINICAL_TRUST_PUBLISH,
      publish: Permission.CLINICAL_TRUST_PUBLISH,
      archive: Permission.CLINICAL_TRUST_PUBLISH,
      restore: Permission.CLINICAL_TRUST_EDIT,
    },
    schema: FaqSnapshotSchema,
    getRevalidationPlan: () => ({
      paths: ['/'],
      tags: ['faqs'],
    }),
  },

  [ContentType.TESTIMONIAL]: {
    type: ContentType.TESTIMONIAL,
    name: 'Cảm Nhận & Câu Chuyện Khách Hàng',
    requiresMedicalReview: false,
    permissions: {
      createDraft: Permission.CLINICAL_TRUST_EDIT,
      updateDraft: Permission.CLINICAL_TRUST_EDIT,
      submitReview: Permission.CLINICAL_TRUST_EDIT,
      returnToDraft: Permission.CLINICAL_TRUST_PUBLISH,
      approve: Permission.CLINICAL_TRUST_PUBLISH,
      publish: Permission.CLINICAL_TRUST_PUBLISH,
      archive: Permission.CLINICAL_TRUST_PUBLISH,
      restore: Permission.CLINICAL_TRUST_EDIT,
    },
    schema: TestimonialSnapshotSchema,
    getRevalidationPlan: () => ({
      paths: ['/'],
      tags: ['testimonials'],
    }),
  },

  [ContentType.HOMEPAGE]: {
    type: ContentType.HOMEPAGE,
    name: 'Cấu Hình Trang Chủ',
    requiresMedicalReview: false,
    permissions: {
      createDraft: Permission.HOMEPAGE_EDIT,
      updateDraft: Permission.HOMEPAGE_EDIT,
      submitReview: Permission.HOMEPAGE_EDIT,
      returnToDraft: Permission.HOMEPAGE_PUBLISH,
      approve: Permission.HOMEPAGE_PUBLISH,
      publish: Permission.HOMEPAGE_PUBLISH,
      archive: Permission.HOMEPAGE_PUBLISH,
      restore: Permission.HOMEPAGE_EDIT,
    },
    schema: HomepageSnapshotSchema,
    getRevalidationPlan: () => ({
      paths: ['/'],
      tags: ['homepage'],
    }),
  },
};

import { sanitizeHtml } from '@/lib/security/html-sanitizer';

/**
 * Validates a payload snapshot against domain schema.
 */
export function validateDomainSnapshot(
  contentType: ContentTypeId,
  payload: Record<string, unknown>
): DomainValidationResult {
  const definition = DOMAIN_WORKFLOW_REGISTRY[contentType];
  if (!definition) {
    return { valid: false, errors: { _general: [`Loại nội dung không hợp lệ: ${contentType}`] } };
  }

  // Pre-sanitize HTML if rich content is present in payload
  const candidatePayload = { ...payload };
  if (typeof candidatePayload.contentHtml === 'string') {
    candidatePayload.contentHtml = sanitizeHtml(candidatePayload.contentHtml);
  }
  if (typeof candidatePayload.detailedBioHtml === 'string') {
    candidatePayload.detailedBioHtml = sanitizeHtml(candidatePayload.detailedBioHtml);
  }
  if (typeof candidatePayload.description === 'string') {
    candidatePayload.description = sanitizeHtml(candidatePayload.description);
  }
  if (typeof candidatePayload.answer === 'string') {
    candidatePayload.answer = sanitizeHtml(candidatePayload.answer);
  }
  if (typeof candidatePayload.fullStory === 'string') {
    candidatePayload.fullStory = sanitizeHtml(candidatePayload.fullStory);
  }
  if (typeof candidatePayload.quote === 'string') {
    candidatePayload.quote = sanitizeHtml(candidatePayload.quote);
  }

  const result = definition.schema.safeParse(candidatePayload);
  if (!result.success) {
    const errorMap: Record<string, string[]> = {};
    for (const issue of result.error.issues) {
      const field = issue.path.join('.') || '_root';
      if (!errorMap[field]) errorMap[field] = [];
      errorMap[field].push(issue.message);
    }
    return { valid: false, errors: errorMap };
  }

  return { valid: true, sanitizedPayload: result.data as Record<string, unknown> };
}
