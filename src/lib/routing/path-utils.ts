/**
 * Centralized Route Path Normalization & Security Validation
 * 
 * Complies with DoctorCheck Next.js trailingSlash: true configuration,
 * prevents open redirects, path traversals, protocol smuggling, and
 * reserved route takeover.
 */

export const RESERVED_APPLICATION_PATHS = new Set([
  '/',
  '/admin',
  '/admin/',
  '/api',
  '/api/',
  '/robots.txt',
  '/sitemap.xml',
  '/favicon.ico',
]);

export const RESERVED_PATH_PREFIXES = [
  '/admin/',
  '/api/',
  '/_next/',
  '/_vercel/',
  '/preview/',
];

/**
 * Normalizes any internal route path into canonical form:
 * 1. Strips leading and trailing whitespaces.
 * 2. Strips query parameters (?...) and hash fragments (#...).
 * 3. Collapses consecutive slashes (// -> /).
 * 4. Ensures leading slash (/).
 * 5. Ensures trailing slash (/) (Next.js trailingSlash: true).
 * 6. Converts ASCII characters to lowercase.
 */
export function normalizeRoutePath(rawPath: string): string {
  if (!rawPath || typeof rawPath !== 'string') {
    return '/';
  }

  let cleaned = rawPath.trim();

  // Strip protocol if erroneously passed
  cleaned = cleaned.replace(/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\/[^/]+/, '');

  // Strip query and hash
  const hashIdx = cleaned.indexOf('#');
  if (hashIdx !== -1) cleaned = cleaned.substring(0, hashIdx);
  const queryIdx = cleaned.indexOf('?');
  if (queryIdx !== -1) cleaned = cleaned.substring(0, queryIdx);

  // Collapse consecutive slashes
  cleaned = cleaned.replace(/\/+/g, '/');

  // Lowercase
  cleaned = cleaned.toLowerCase();

  // Ensure leading slash
  if (!cleaned.startsWith('/')) {
    cleaned = '/' + cleaned;
  }

  // Ensure trailing slash (except empty/root '/')
  if (!cleaned.endsWith('/')) {
    cleaned = cleaned + '/';
  }

  return cleaned;
}

/**
 * Validates whether a route path is safe to be registered or targeted by redirects.
 */
export function validateSafeRoutePath(rawPath: string): { valid: boolean; error?: string } {
  if (!rawPath || typeof rawPath !== 'string') {
    return { valid: false, error: 'Đường dẫn không được để trống.' };
  }

  const trimmed = rawPath.trim();

  // 1. Malicious schemes rejection
  const lower = trimmed.toLowerCase();
  if (
    lower.startsWith('javascript:') ||
    lower.startsWith('data:') ||
    lower.startsWith('vbscript:') ||
    lower.startsWith('file:')
  ) {
    return { valid: false, error: 'Đường dẫn chứa giao thức không an toàn (javascript/data/vbscript).' };
  }

  // 2. Open redirect / external hosts rejection
  if (lower.startsWith('//') || lower.startsWith('http://') || lower.startsWith('https://')) {
    return { valid: false, error: 'Chỉ chấp nhận đường dẫn nội bộ website (không hỗ trợ external redirect).' };
  }

  // 3. Backslash confusion & control characters
  if (trimmed.includes('\\') || /[\x00-\x1F\x7F]/.test(trimmed)) {
    return { valid: false, error: 'Đường dẫn chứa ký tự điều khiển hoặc ký tự gạch chéo ngược (\\) không hợp lệ.' };
  }

  // 4. Directory traversal rejection
  if (trimmed.includes('/..') || trimmed.includes('../') || trimmed === '..') {
    return { valid: false, error: 'Phát hiện ký tự duyệt thư mục (path traversal) không hợp lệ.' };
  }

  const normalized = normalizeRoutePath(trimmed);

  // 5. Reserved routes protection
  if (RESERVED_APPLICATION_PATHS.has(normalized)) {
    return {
      valid: false,
      error: `Đường dẫn '${normalized}' thuộc vùng định tuyến hệ thống được bảo vệ và không thể thay thế.`,
    };
  }

  for (const prefix of RESERVED_PATH_PREFIXES) {
    if (normalized.startsWith(prefix)) {
      return {
        valid: false,
        error: `Đường dẫn '${normalized}' thuộc tiền tố bảo vệ '${prefix}' của hệ thống.`,
      };
    }
  }

  // 6. Character set validation: must be URL-safe (letters, numbers, dashes, underscores, slashes, percent-encoding)
  const pathWithoutSlashes = normalized.replace(/^\/+|\/+$/g, '');
  if (pathWithoutSlashes.length > 0) {
    const segments = pathWithoutSlashes.split('/');
    for (const segment of segments) {
      if (!segment) continue;
      // Allow lowercase alphanumerics, hyphens, underscores, percent encodings
      if (!/^[a-z0-9\-_%]+$/.test(segment)) {
        return {
          valid: false,
          error: `Đoạn đường dẫn '${segment}' chứa ký tự không hợp lệ. Chỉ chấp nhận chữ cái, số, dấu gạch ngang (-) và gạch dưới (_).`,
        };
      }
    }
  }

  return { valid: true };
}

/**
 * Checks if a normalized path matches any reserved system route.
 */
export function isReservedPath(normalizedPath: string): boolean {
  if (RESERVED_APPLICATION_PATHS.has(normalizedPath)) return true;
  return RESERVED_PATH_PREFIXES.some((prefix) => normalizedPath.startsWith(prefix));
}
