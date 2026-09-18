/**
 * Centralized Page Family Policy & Classification Matrix
 * Enforces structured template dispatch across the 55 canonical pages
 * Discovered during P5 Inner Page Family Discovery
 */

export const PageFamilyType = {
  ABOUT: 'ABOUT',
  PRICING: 'PRICING',
  CLINICAL_ENDOSCOPY_HUB: 'CLINICAL_ENDOSCOPY_HUB',
  CLINICAL_SYMPTOM_GUIDE: 'CLINICAL_SYMPTOM_GUIDE',
  PACKAGE_COMPARISON: 'PACKAGE_COMPARISON',
  CLINICAL_QUALITY_PROTOCOLS: 'CLINICAL_QUALITY_PROTOCOLS',
  KNOWLEDGE_HUB: 'KNOWLEDGE_HUB',
  UTILITY_LEGAL: 'UTILITY_LEGAL',
  GENERIC: 'GENERIC',
} as const;

export type PageFamilyType = (typeof PageFamilyType)[keyof typeof PageFamilyType];

/**
 * 3 Canonical Pages classified into Locked Phase 3: Pricing System
 */
export const PRICING_SLUGS = new Set([
  'bang-gia-2026',
  'bang-gia-dich-vu-tam-soat-benh-tai-doctor-check',
  'bang-gia-dich-vu',
]);

/**
 * 10 Canonical Pages classified into Family 1: Clinical Endoscopy & Specialty Hub
 */
export const CLINICAL_ENDOSCOPY_HUB_SLUGS = new Set([
  'noi-soi-da-day',
  'noi-soi-dai-trang',
  'chuyen-khoa-da-day',
  'chuyen-khoa-dai-trang',
  'trung-tam-noi-soi-tieu-hoa',
  'trung-tam-noi-soi-tieu-hoa-doctor-check',
  'noi-soi-da-day-chan-doan-benh-ly',
  'noi-soi-dai-trang-chan-doan-benh-ly',
  'tam-soat-ung-thu-da-day-tai-doctor-check',
  'tam-soat-ung-thu-dai-trang-tai-doctor-check',
]);

/**
 * 15 Canonical Pages classified into Family 3: Health Checkup & Package Comparison
 */
export const PACKAGE_COMPARISON_SLUGS = new Set([
  'goi-tam-soat-nam',
  'goi-tam-soat-nu',
  'so-sanh-3-goi-kham-nam',
  'so-sanh-3-goi-kham-nu',
  'so-sanh-goi-kham-tong-quat-danh-cho-nam',
  'so-sanh-goi-kham-tong-quat-danh-cho-nu',
  'bang-gia-kham-tong-quat',
  'bang-gia-kham-tong-quat-new',
  'bang-gia-kham-suc-khoe-tong-quat',
  'bang-gia-noi-soi-da-day',
  'kham-tong-quat',
  'kham-suc-khoe-doanh-nghiep',
  'loi-ich-goi-song-tho',
  'loi-ich-khi-kham-tong-quat-tai-doctor-check',
  'cac-yeu-to-cua-mot-dia-chi-tam-soat-benh-trong-mo',
]);

/**
 * 6 Canonical Pages classified into Family 2: Clinical Symptom & Pathology Guide
 */
export const CLINICAL_SYMPTOM_GUIDE_SLUGS = new Set([
  'trieu-chung-da-day',
  'benh-ly-da-day',
  'trieu-chung-dai-trang',
  'benh-ly-dai-trang',
  'buon-non-non-keo-dai',
  'dieu-tri-tao-bon-di-cau-ra-mau',
]);

/**
 * 7 Canonical Pages classified into Family 4: Clinical Quality, Trust & Protocols
 */
export const CLINICAL_QUALITY_PROTOCOLS_SLUGS = new Set([
  '10-tieu-chuan-vang',
  'quy-trinh-noi-soi-da-day',
  'quy-trinh-noi-soi-dai-trang',
  'thuoc-va-vat-tu-y-te',
  'doi-ngu-bac-si-doctorcheck',
  'bao-chi-dua-tin',
  'quyen-loi-bhyt-bhtn',
]);

/**
 * Canonical Pages classified into Family 6: Utility, Contact & Legal Content
 */
export const UTILITY_LEGAL_SLUGS = new Set([
  'lien-he',
  'chinh-sach-quyen-rieng-tu',
  'chinh-sach-bao-mat',
  'chinh-sach-thanh-toan',
  'chinh-sach-hoan-tien',
  'dieu-khoan-su-dung',
  'cam-on',
  'dich-vu',
  'blog',
]);

/**
 * Canonical Pages classified into Family 5: Cancer Screening Knowledge Hub
 */
export const KNOWLEDGE_HUB_SLUGS = new Set([
  'kien-thuc-ung-thu-da-day',
  'kien-thuc-ung-thu-dai-trang',
]);

/**
 * Classifies any canonical page slug into its respective presentation family.
 */
export function classifyPageFamily(slug: string): PageFamilyType {
  const clean = slug.trim().toLowerCase().replace(/^\/+|\/+$/g, '');

  if (clean === 've-doctor-check' || clean === 've-chung-toi') {
    return PageFamilyType.ABOUT;
  }

  if (PRICING_SLUGS.has(clean)) {
    return PageFamilyType.PRICING;
  }

  if (CLINICAL_ENDOSCOPY_HUB_SLUGS.has(clean)) {
    return PageFamilyType.CLINICAL_ENDOSCOPY_HUB;
  }

  if (CLINICAL_SYMPTOM_GUIDE_SLUGS.has(clean)) {
    return PageFamilyType.CLINICAL_SYMPTOM_GUIDE;
  }

  if (PACKAGE_COMPARISON_SLUGS.has(clean)) {
    return PageFamilyType.PACKAGE_COMPARISON;
  }

  if (CLINICAL_QUALITY_PROTOCOLS_SLUGS.has(clean)) {
    return PageFamilyType.CLINICAL_QUALITY_PROTOCOLS;
  }

  if (KNOWLEDGE_HUB_SLUGS.has(clean)) {
    return PageFamilyType.KNOWLEDGE_HUB;
  }

  if (UTILITY_LEGAL_SLUGS.has(clean)) {
    return PageFamilyType.UTILITY_LEGAL;
  }

  return PageFamilyType.GENERIC;
}


