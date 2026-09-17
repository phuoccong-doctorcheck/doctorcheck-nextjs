/**
 * CONFIRMED 301 PERMANENT REDIRECTS MAPPING
 *
 * Preserves search equity and prevents 404s for deprecated/duplicate WordPress URLs.
 */
export const LEGACY_REDIRECTS: Record<string, string> = {
  'bang-gia-dich-vu': '/bang-gia-dich-vu-tam-soat-benh-tai-doctor-check/',
  'bang-gia-kham-suc-khoe-tong-quat': '/bang-gia-dich-vu-tam-soat-benh-tai-doctor-check/',
  'trung-tam-noi-soi-tieu-hoa': '/trung-tam-noi-soi-tieu-hoa-doctor-check/',
  'goi-ung-thu-da-day': '/tam-soat-ung-thu-da-day/',
  'goi-kham-danh-cho-nam': '/goi-tam-soat-nam/',
  'goi-kham-danh-cho-nu': '/goi-tam-soat-nu/',
  'bang-gia-kham-tong-quat': '/bang-gia-dich-vu-tam-soat-benh-tai-doctor-check/',
  'bang-gia-kham-tong-quat-new': '/bang-gia-dich-vu-tam-soat-benh-tai-doctor-check/',
  'trung-tam-noi-soi-tieu-hoa/bang-gia-noi-soi-da-day': '/bang-gia-dich-vu-tam-soat-benh-tai-doctor-check/',
  've-chung-toi': '/ve-doctor-check/',
};

export function getLegacyRedirect(slug: string): string | undefined {
  const normalized = slug.replace(/^\/+|\/+$/g, '');
  return LEGACY_REDIRECTS[normalized];
}
