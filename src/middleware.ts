import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const SESSION_COOKIE_NAMES = ['__Host-dc_session', 'dc_session'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only apply protection to /admin namespace
  if (!pathname.startsWith('/admin')) {
    return NextResponse.next();
  }

  // Allow unrestricted access to the admin login page
  if (pathname === '/admin/login' || pathname === '/admin/login/') {
    const response = NextResponse.next();
    response.headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive');
    return response;
  }

  // Check for session cookie presence
  const hasSessionCookie = SESSION_COOKIE_NAMES.some((name) => request.cookies.has(name));

  if (!hasSessionCookie) {
    const loginUrl = new URL('/admin/login/', request.url);
    if (pathname !== '/admin' && pathname !== '/admin/') {
      loginUrl.searchParams.set('returnTo', pathname + request.nextUrl.search);
    }
    const response = NextResponse.redirect(loginUrl);
    response.headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive');
    return response;
  }

  // Forward authenticated request with strict security & anti-indexing headers
  const response = NextResponse.next();
  response.headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive, nosnippet');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Content-Security-Policy', "frame-ancestors 'none'");

  return response;
}

export const config = {
  matcher: ['/admin/:path*'],
};
