import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const startTime = Date.now();

/**
 * Liveness Health Check Endpoint
 * GET /api/health
 *
 * Verifies that the Next.js process is active and responding.
 * Strictly excludes any sensitive infrastructure diagnostics.
 */
export async function GET() {
  const uptimeSeconds = Math.floor((Date.now() - startTime) / 1000);

  return NextResponse.json(
    {
      status: 'ok',
      service: 'doctorcheck-cms',
      uptime: uptimeSeconds,
      timestamp: new Date().toISOString(),
    },
    {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'X-Robots-Tag': 'noindex, nofollow, noarchive',
      },
    }
  );
}
