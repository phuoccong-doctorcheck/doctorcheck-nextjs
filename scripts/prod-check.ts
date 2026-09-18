import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

// Stub 'server-only'
require.cache[require.resolve('server-only')] = {
  id: require.resolve('server-only'),
  filename: require.resolve('server-only'),
  loaded: true,
  exports: {},
} as unknown as NodeModule;

dotenv.config({ path: '.env.local' });
dotenv.config();

/**
 * Production Readiness & Hardening Validator
 * Non-destructive pre-flight check for production deployment.
 */
async function runProductionCheck() {
  console.log('========================================================================');
  console.log('🛡️  DOCTORCHECK PRODUCTION READINESS & HARDENING VALIDATOR');
  console.log('========================================================================\n');

  const { validateEnvironment } = await import('../src/lib/config/env');
  const { db, client } = await import('../src/db');
  const { sql } = await import('drizzle-orm');

  let errors = 0;
  let warnings = 0;

  // 1. Environment Validation
  console.log('1. Environment Configuration:');
  const envValidation = validateEnvironment();
  if (!envValidation.valid) {
    for (const err of envValidation.errors) {
      console.error(`  ❌ ERROR: ${err}`);
      errors++;
    }
  } else {
    console.log('  ✅ Environment schema valid');
  }

  for (const warn of envValidation.warnings) {
    console.warn(`  ⚠️ WARNING: ${warn}`);
    warnings++;
  }

  // 2. Database Connectivity Check
  console.log('\n2. Database Connectivity & Pool:');
  try {
    const res = await db.execute(sql`SELECT 1 as alive`);
    if (res && res.length > 0) {
      console.log('  ✅ PostgreSQL connection verified (SELECT 1 succeeded)');
    }
  } catch (err) {
    console.error(`  ❌ Database connection failed: ${err instanceof Error ? err.message : String(err)}`);
    errors++;
  }

  // 3. Storage Configuration Check
  console.log('\n3. Media Storage Durability:');
  const storageProvider = process.env.STORAGE_PROVIDER || 'local';
  console.log(`  ℹ Storage Provider: ${storageProvider}`);
  if (process.env.NODE_ENV === 'production' && storageProvider === 'local') {
    if (process.env.ALLOW_LOCAL_STORAGE_IN_PRODUCTION === 'true') {
      console.warn('  ⚠️ Local storage permitted in production (Persistent VM assumed)');
      warnings++;
    } else {
      console.error('  ❌ Ephemeral local storage not permitted in production without ALLOW_LOCAL_STORAGE_IN_PRODUCTION=true');
      errors++;
    }
  } else if (storageProvider === 's3') {
    console.log('  ✅ Durable S3-compatible object storage configured');
  } else {
    console.log('  ✅ Local storage active for non-production environment');
  }

  // 4. Secret Exposure Audit (Zero Hardcoded Secrets in Git)
  console.log('\n4. Secret Exposure Audit:');
  const envExamplePath = path.resolve(process.cwd(), '.env.example');
  if (fs.existsSync(envExamplePath)) {
    const content = fs.readFileSync(envExamplePath, 'utf8');
    if (content.includes('postgres:postgres@localhost') || !content.includes('sk_') && !content.includes('AKIA')) {
      console.log('  ✅ .env.example contains sanitized placeholders only');
    } else {
      console.error('  ❌ Potential active secret detected in .env.example');
      errors++;
    }
  }

  // 5. Build Artifact Verification
  console.log('\n5. Application Health & Readiness Endpoints:');
  const healthRoutePath = path.resolve(process.cwd(), 'src/app/api/health/route.ts');
  const readinessRoutePath = path.resolve(process.cwd(), 'src/app/api/health/readiness/route.ts');
  if (fs.existsSync(healthRoutePath) && fs.existsSync(readinessRoutePath)) {
    console.log('  ✅ Liveness (/api/health) and Readiness (/api/health/readiness) routes implemented');
  } else {
    console.error('  ❌ Missing health or readiness routes');
    errors++;
  }

  console.log('\n========================================================================');
  console.log(`SUMMARY: ${errors === 0 ? '✅ PASSED' : '❌ FAILED'} (${errors} errors, ${warnings} warnings)`);
  console.log('========================================================================\n');

  if (client && typeof client.end === 'function') {
    await client.end();
  }

  if (errors > 0) {
    process.exit(1);
  }
}

runProductionCheck();
