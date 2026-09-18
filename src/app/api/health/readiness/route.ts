import { NextResponse } from 'next/server';
import { db } from '@/db';
import { sql } from 'drizzle-orm';
import { validateEnvironment } from '@/lib/config/env';

export const dynamic = 'force-dynamic';

/**
 * Readiness Health Check Endpoint
 * GET /api/health/readiness
 *
 * Verifies critical dependency availability (PostgreSQL connection and storage configuration).
 * Never discloses credentials, database hostnames, or internal connection strings.
 */
export async function GET() {
  const checks: Record<string, 'healthy' | 'unhealthy' | 'warning'> = {};
  let isReady = true;

  // 1. Database Connection Check
  try {
    await db.execute(sql`SELECT 1`);
    checks.database = 'healthy';
  } catch {
    checks.database = 'unhealthy';
    isReady = false;
  }

  // 2. Storage & Environment Configuration Check
  const envValidation = validateEnvironment();
  if (envValidation.valid) {
    checks.storage = 'healthy';
  } else {
    checks.storage = 'unhealthy';
    isReady = false;
  }

  const statusCode = isReady ? 200 : 503;

  return NextResponse.json(
    {
      status: isReady ? 'ready' : 'not_ready',
      timestamp: new Date().toISOString(),
      checks,
    },
    {
      status: statusCode,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'X-Robots-Tag': 'noindex, nofollow, noarchive',
      },
    }
  );
}
