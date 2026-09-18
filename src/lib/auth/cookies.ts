import 'server-only';
import { cookies } from 'next/headers';

export const SESSION_COOKIE_BASE_NAME = 'dc_session';

export function getSessionCookieName(): string {
  return process.env.NODE_ENV === 'production'
    ? `__Host-${SESSION_COOKIE_BASE_NAME}`
    : SESSION_COOKIE_BASE_NAME;
}

export const SESSION_MAX_AGE_SECONDS = 8 * 60 * 60; // 8 hours (absolute lifetime)
export const SESSION_IDLE_TIMEOUT_SECONDS = 2 * 60 * 60; // 2 hours (idle timeout)

/**
 * Sets the secure session cookie in the Next.js response context.
 */
export async function setSessionCookie(token: string, expiresAt: Date): Promise<void> {
  const cookieStore = await cookies();
  const isProduction = process.env.NODE_ENV === 'production';
  const cookieName = getSessionCookieName();

  cookieStore.set(cookieName, token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    path: '/',
    expires: expiresAt,
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

/**
 * Retrieves the session token from incoming request cookies.
 */
export async function getSessionCookie(): Promise<string | null> {
  const cookieStore = await cookies();
  const cookieName = getSessionCookieName();
  const cookie = cookieStore.get(cookieName);
  return cookie?.value || null;
}

/**
 * Clears the session cookie upon logout or invalidation.
 */
export async function deleteSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  const cookieName = getSessionCookieName();

  cookieStore.delete({
    name: cookieName,
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  });
}
