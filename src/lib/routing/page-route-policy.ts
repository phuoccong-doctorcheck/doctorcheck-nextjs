/**
 * Page Route Policy & Centralized Canonical Path Calculator
 *
 * Enforces route construction rules for all Page entities:
 * 1. ROOT: Canonical path is '/[slug]/'
 * 2. ENDOSCOPY_CHILD: Canonical path is '/trung-tam-noi-soi-tieu-hoa-doctor-check/[subpath]/'
 * 3. INTERNAL: Canonical path is '/[slug]/' (marked with internal status/noindex)
 */

import { staticPagesData } from './pages-data';

export const PageRouteType = {
  ROOT: 'ROOT',
  ENDOSCOPY_CHILD: 'ENDOSCOPY_CHILD',
  INTERNAL: 'INTERNAL',
} as const;

export type PageRouteType = (typeof PageRouteType)[keyof typeof PageRouteType];

export const ENDOSCOPY_HUB_PREFIX = '/trung-tam-noi-soi-tieu-hoa-doctor-check';

export const INTERNAL_COLLISION_SLUGS = new Set([
  'dau-thuong-vi',
  'tieu-chay',
  'di-ngoai-ra-mau',
  'tao-bon',
]);

/**
 * Computes canonical public path for a page based on its route class, slug, and subpath.
 * Supports both object params and positional arguments.
 */
export function computePagePath(
  arg1: PageRouteType | { routeType: PageRouteType; slug: string; subpath?: string | null },
  arg2?: string,
  arg3?: string | null
): string {
  let routeType: PageRouteType;
  let slug: string;
  let subpath: string | null | undefined;

  if (typeof arg1 === 'object' && arg1 !== null) {
    routeType = arg1.routeType;
    slug = arg1.slug || '';
    subpath = arg1.subpath;
  } else {
    routeType = arg1;
    slug = arg2 || '';
    subpath = arg3;
  }

  const cleanSlug = slug.trim().toLowerCase().replace(/^\/+|\/+$/g, '');

  if (routeType === PageRouteType.ENDOSCOPY_CHILD) {
    let cleanSubpath = (subpath || cleanSlug)
      .trim()
      .toLowerCase()
      .replace(/^\/+|\/+$/g, '');
    if (cleanSubpath.startsWith('trung-tam-noi-soi-tieu-hoa-doctor-check/')) {
      cleanSubpath = cleanSubpath.replace(/^trung-tam-noi-soi-tieu-hoa-doctor-check\//, '');
    } else if (cleanSubpath === 'trung-tam-noi-soi-tieu-hoa-doctor-check') {
      cleanSubpath = cleanSlug;
    }
    return `${ENDOSCOPY_HUB_PREFIX}/${cleanSubpath}/`;
  }

  if (cleanSlug === 'trang-chu' || cleanSlug === '') {
    return '/';
  }

  return `/${cleanSlug}/`;
}

/**
 * Determines route class from database row fields, static routing registry, and internal collision registry.
 */
export function classifyPageRoute(
  isRoot?: boolean,
  subpath?: string | null,
  status?: string,
  slug?: string
): PageRouteType {
  if (status === 'internal') {
    return PageRouteType.INTERNAL;
  }
  if (slug) {
    const cleanSlug = slug.trim().toLowerCase();
    if (INTERNAL_COLLISION_SLUGS.has(cleanSlug)) {
      return PageRouteType.INTERNAL;
    }
    const match = staticPagesData.find((p) => p.slug === cleanSlug);
    if (match) {
      if (!match.isRoot || (match.subpath && match.subpath.trim().length > 0)) {
        return PageRouteType.ENDOSCOPY_CHILD;
      }
      return PageRouteType.ROOT;
    }
  }
  if (isRoot === false || (subpath && subpath.trim().length > 0)) {
    return PageRouteType.ENDOSCOPY_CHILD;
  }
  return PageRouteType.ROOT;
}

/**
 * Validates whether a requested route class and slug follow supported namespace policy.
 * Supports both object params and positional arguments.
 */
export function validatePageRoutePolicy(
  arg1: PageRouteType | { routeType: PageRouteType; slug: string; subpath?: string | null },
  arg2?: string,
  arg3?: string | null
): { valid: boolean; isValid: boolean; error?: string } {
  let routeType: PageRouteType;
  let slug: string;
  let subpath: string | null | undefined;

  if (typeof arg1 === 'object' && arg1 !== null) {
    routeType = arg1.routeType;
    slug = arg1.slug;
    subpath = arg1.subpath;
  } else {
    routeType = arg1;
    slug = arg2 || '';
    subpath = arg3;
  }

  if (routeType !== PageRouteType.ROOT && routeType !== PageRouteType.ENDOSCOPY_CHILD && routeType !== PageRouteType.INTERNAL) {
    return {
      valid: false,
      isValid: false,
      error: `Loại trang không hợp lệ: ${routeType}. Chỉ chấp nhận ROOT, ENDOSCOPY_CHILD, hoặc INTERNAL.`,
    };
  }

  const cleanSlug = (slug || '').trim().toLowerCase();

  if (!cleanSlug || cleanSlug.length < 2) {
    return { valid: false, isValid: false, error: 'Đường dẫn (slug) phải có ít nhất 2 ký tự.' };
  }

  if (!/^[a-z0-9-]+$/.test(cleanSlug)) {
    return {
      valid: false,
      isValid: false,
      error: 'Đường dẫn (slug) chỉ được chứa chữ cái thường, số và dấu gạch ngang (-).',
    };
  }

  if (routeType === PageRouteType.ENDOSCOPY_CHILD) {
    const cleanSub = (subpath || '').trim();
    if (!cleanSub) {
      return {
        valid: false,
        isValid: false,
        error: 'Trang con Chuyên khoa Nội Soi bắt buộc phải có cấu hình subpath.',
      };
    }
    if (!/^[a-z0-9\/-]+$/.test(cleanSub)) {
      return {
        valid: false,
        isValid: false,
        error: 'Subpath chỉ được chứa ký tự chữ cái thường, số, dấu gạch ngang (-) và dấu gạch chéo (/).',
      };
    }
  }

  return { valid: true, isValid: true };
}
