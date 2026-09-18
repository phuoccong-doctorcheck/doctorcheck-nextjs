/**
 * Validates and sanitizes a returnTo URL to prevent Open Redirect vulnerabilities.
 * Only relative internal admin paths are permitted (e.g. /admin/articles).
 */
export function sanitizeReturnTo(returnTo?: string | null): string {
  if (!returnTo || typeof returnTo !== 'string') {
    return '/admin/';
  }

  const trimmed = returnTo.trim();

  // Rejection rules:
  // 1. Must start with /admin
  // 2. Must not start with // or contain protocol schemes
  // 3. Must not contain backslashes
  if (
    !trimmed.startsWith('/admin') ||
    trimmed.startsWith('//') ||
    trimmed.includes('\\') ||
    /^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(trimmed)
  ) {
    return '/admin/';
  }

  return trimmed;
}
