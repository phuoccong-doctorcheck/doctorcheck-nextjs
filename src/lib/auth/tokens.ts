import 'server-only';
import * as crypto from 'crypto';

/**
 * Generates an opaque, cryptographically secure 256-bit random session token.
 * Output: 43-character base64url-encoded string (URL-safe, cookie-safe).
 */
export function generateSessionToken(): string {
  return crypto.randomBytes(32).toString('base64url');
}

/**
 * Computes SHA-256 hash of an opaque session token.
 * This hash is the value stored in the database `sessions.token_hash` column.
 * If the database is compromised, active session tokens cannot be derived from hashes.
 */
export function hashSessionToken(token: string): string {
  return crypto.createHash('sha256').update(token, 'utf8').digest('hex');
}
