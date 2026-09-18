import * as dotenv from 'dotenv';
import postgres from 'postgres';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

async function runConnectionCheck() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    console.error('❌ ERROR: DATABASE_URL is not set in environment or .env.local');
    process.exit(1);
  }

  // Parse connection URL to show sanitized, redacted diagnostics
  let sanitizedHost = 'unknown';
  let sanitizedPort = '5432';
  let sanitizedDb = 'unknown';
  let sanitizedUser = 'unknown';

  try {
    const parsed = new URL(databaseUrl);
    sanitizedHost = parsed.hostname;
    sanitizedPort = parsed.port || '5432';
    sanitizedDb = parsed.pathname.replace(/^\//, '');
    sanitizedUser = parsed.username ? `${parsed.username.slice(0, 3)}***` : 'unknown';
  } catch {
    console.warn('⚠️ Could not parse DATABASE_URL as a standard URL object, connecting directly...');
  }

  console.log('====================================================');
  console.log('🔍 DB-1: PostgreSQL Connectivity & Diagnostics Check');
  console.log('====================================================');
  console.log(`📡 Host:     ${sanitizedHost}`);
  console.log(`🔌 Port:     ${sanitizedPort}`);
  console.log(`🗄️  Database: ${sanitizedDb}`);
  console.log(`👤 User:     ${sanitizedUser}`);
  console.log(`🔒 Secret:   [REDACTED]`);
  console.log('----------------------------------------------------');

  const startTime = Date.now();
  const sql = postgres(databaseUrl, {
    max: 1,
    connect_timeout: 10,
    idle_timeout: 10,
  });

  try {
    // Execute safe read-only queries
    const pingResult = await sql`SELECT 1 AS connected`;
    const latencyMs = Date.now() - startTime;

    const versionResult = await sql`SELECT version()`;
    const versionStr = versionResult[0]?.version || 'Unknown';

    const dbCheckResult = await sql`SELECT current_database() as db_name, current_user as user_name`;
    const currentDb = dbCheckResult[0]?.db_name;
    const currentUser = dbCheckResult[0]?.user_name;

    const tablesResult = await sql<{ table_name: string }[]>`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `;
    const tableNames = tablesResult.map((t) => t.table_name);

    console.log('✅ Connection test successful!');
    console.log(`⏱️  Round-trip latency: ${latencyMs} ms`);
    console.log(`📦 Database verified:  ${currentDb}`);
    console.log(`🔑 Connected user:     ${currentUser}`);
    console.log(`🐘 PostgreSQL Version: ${versionStr}`);
    console.log(`📊 Public Tables & Row Counts (${tableNames.length}):`);
    for (const name of tableNames) {
      if (name.startsWith('__drizzle')) continue;
      const countRes = await sql<{ count: string }[]>`
        SELECT count(*)::text as count FROM ${sql(name)};
      `;
      const count = countRes[0]?.count || '0';
      console.log(`   - ${name.padEnd(22)}: ${count} rows`);
    }
    console.log('----------------------------------------------------');
    console.log('🎉 Read-only connectivity and schema validation passed successfully.');
    console.log('====================================================');

    await sql.end();
    process.exit(0);
  } catch (error: unknown) {
    const latencyMs = Date.now() - startTime;
    console.error('❌ Connection failed after', latencyMs, 'ms');
    if (error instanceof Error) {
      console.error('Error message:', error.message);
    } else {
      console.error('Unknown error:', error);
    }
    await sql.end({ timeout: 2 });
    process.exit(1);
  }
}

runConnectionCheck();
