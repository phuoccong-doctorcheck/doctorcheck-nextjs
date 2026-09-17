/**
 * Content Link Normalizer for DoctorCheck Next.js Migration
 *
 * Normalizes all WordPress links to adhere to Next.js canonical routes:
 * 1. Converts absolute DoctorCheck URLs to relative paths.
 * 2. Rewrites legacy and updated slugs directly to canonical destinations.
 * 3. Enforces trailing slashes on all internal page routes.
 * 4. Preserves external links, phone links, and image attachments untouched.
 */

const KNOWN_SLUG_REWRITES: Record<string, string> = {
  '/bang-gia-dich-vu/': '/bang-gia-dich-vu-tam-soat-benh-tai-doctor-check/',
  '/bang-gia-dich-vu': '/bang-gia-dich-vu-tam-soat-benh-tai-doctor-check/',
  '/bang-gia-kham-suc-khoe-tong-quat/': '/bang-gia-dich-vu-tam-soat-benh-tai-doctor-check/',
  '/bang-gia-kham-suc-khoe-tong-quat': '/bang-gia-dich-vu-tam-soat-benh-tai-doctor-check/',
  '/trung-tam-noi-soi-tieu-hoa/': '/trung-tam-noi-soi-tieu-hoa-doctor-check/',
  '/trung-tam-noi-soi-tieu-hoa': '/trung-tam-noi-soi-tieu-hoa-doctor-check/',
  '/goi-ung-thu-da-day/': '/tam-soat-ung-thu-da-day/',
  '/goi-ung-thu-da-day': '/tam-soat-ung-thu-da-day/',
  '/goi-kham-danh-cho-nam/': '/goi-tam-soat-nam/',
  '/goi-kham-danh-cho-nam': '/goi-tam-soat-nam/',
  '/goi-kham-danh-cho-nu/': '/goi-tam-soat-nu/',
  '/goi-kham-danh-cho-nu': '/goi-tam-soat-nu/',
  '/bang-gia-kham-tong-quat/': '/bang-gia-dich-vu-tam-soat-benh-tai-doctor-check/',
  '/bang-gia-kham-tong-quat': '/bang-gia-dich-vu-tam-soat-benh-tai-doctor-check/',
  '/bang-gia-kham-tong-quat-new/': '/bang-gia-dich-vu-tam-soat-benh-tai-doctor-check/',
  '/bang-gia-kham-tong-quat-new': '/bang-gia-dich-vu-tam-soat-benh-tai-doctor-check/',
  '/trung-tam-noi-soi-tieu-hoa/bang-gia-noi-soi-da-day/': '/bang-gia-dich-vu-tam-soat-benh-tai-doctor-check/',
  '/trung-tam-noi-soi-tieu-hoa/bang-gia-noi-soi-da-day': '/bang-gia-dich-vu-tam-soat-benh-tai-doctor-check/',
  // In-content legacy links
  '/trung-tam-noi-soi-tieu-hoa-doctor-check/bang-gia-2025/': '/trung-tam-noi-soi-tieu-hoa-doctor-check/bang-gia-2026/',
  '/trung-tam-noi-soi-tieu-hoa-doctor-check/bang-gia-2025': '/trung-tam-noi-soi-tieu-hoa-doctor-check/bang-gia-2026/',
  '/bang-gia-noi-soi-da-day-2025-new/': '/bang-gia-dich-vu-tam-soat-benh-tai-doctor-check/',
  '/bang-gia-noi-soi-da-day-2025-new': '/bang-gia-dich-vu-tam-soat-benh-tai-doctor-check/',
  '/goi-chuyen-sau-danh-cho-nu/': '/goi-tam-soat-chuyen-sau-danh-cho-nu/',
  '/goi-chuyen-sau-danh-cho-nu': '/goi-tam-soat-chuyen-sau-danh-cho-nu/',
  '/goi-song-tho-danh-cho-nu/': '/goi-tam-soat-song-tho-danh-cho-nu/',
  '/goi-song-tho-danh-cho-nu': '/goi-tam-soat-song-tho-danh-cho-nu/',
  '/doi-ngu-bac-si/': '/doi-ngu-bac-si-doctorcheck/',
  '/doi-ngu-bac-si': '/doi-ngu-bac-si-doctorcheck/',
  '/tam-soat-ung-thu/': '/tam-soat-ung-thu-da-day/',
  '/tam-soat-ung-thu': '/tam-soat-ung-thu-da-day/',
  '/day-bung/': '/chuong-bung-day-hoi/',
  '/day-bung': '/chuong-bung-day-hoi/'
};

export function normalizeLinkHref(rawHref: string): string {
  if (!rawHref) return rawHref;
  const href = rawHref.trim();

  // Anchors, tel, mailto, javascript
  if (
    href.startsWith('#') ||
    href.startsWith('tel:') ||
    href.startsWith('mailto:') ||
    href.startsWith('javascript:')
  ) {
    return href;
  }

  // Preserve image and file uploads directly
  if (href.includes('/wp-content/uploads/')) {
    return href;
  }

  let pathname = '';
  let isDoctorCheckInternal = false;

  if (
    href.startsWith('https://www.doctorcheck.vn') ||
    href.startsWith('http://www.doctorcheck.vn') ||
    href.startsWith('https://doctorcheck.vn') ||
    href.startsWith('http://doctorcheck.vn')
  ) {
    isDoctorCheckInternal = true;
    try {
      const url = new URL(href);
      pathname = url.pathname;
    } catch {
      pathname = href.replace(/^https?:\/\/(www\.)?doctorcheck\.vn/, '');
    }
  } else if (
    href.includes('noisoidaday.doctorcheck.vn') ||
    href.includes('noisoidaitrang.doctorcheck.vn')
  ) {
    isDoctorCheckInternal = true;
    try {
      const url = new URL(href);
      pathname = url.pathname;
    } catch {
      pathname = href.replace(/^https?:\/\/[a-z0-9\.\-]+\.doctorcheck\.vn/, '');
    }
  } else if (href.startsWith('/')) {
    isDoctorCheckInternal = true;
    pathname = href;
  }

  if (isDoctorCheckInternal) {
    // Check known rewrites
    if (KNOWN_SLUG_REWRITES[pathname]) {
      return KNOWN_SLUG_REWRITES[pathname];
    }

    // Ensure trailing slash for internal paths
    if (!pathname.endsWith('/')) {
      pathname += '/';
    }

    if (KNOWN_SLUG_REWRITES[pathname]) {
      return KNOWN_SLUG_REWRITES[pathname];
    }

    return pathname;
  }

  // External link unchanged
  return href;
}

export function normalizeHtmlLinks(html: string): string {
  if (!html) return '';

  return html.replace(/<a\s+([^>]*?)href=["']([^"']*)["']([^>]*?)>/gi, (match, before, href, after) => {
    const normalizedHref = normalizeLinkHref(href);
    const isInternal = normalizedHref.startsWith('/');

    // If external, add rel="noopener noreferrer" and target="_blank"
    if (!isInternal && !normalizedHref.startsWith('#') && !normalizedHref.startsWith('tel:') && !normalizedHref.startsWith('mailto:')) {
      const hasTarget = /target=/i.test(match);
      const hasRel = /rel=/i.test(match);
      const targetAttr = hasTarget ? '' : ' target="_blank"';
      const relAttr = hasRel ? '' : ' rel="noopener noreferrer"';
      return `<a ${before}href="${normalizedHref}"${after}${targetAttr}${relAttr}>`;
    }

    return `<a ${before}href="${normalizedHref}"${after}>`;
  });
}
