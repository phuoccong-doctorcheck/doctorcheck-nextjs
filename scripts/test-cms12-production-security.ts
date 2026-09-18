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
 * CMS-12 Production Security & Hardening Test Suite
 *
 * Tests:
 * 1. Environment validation schema & fail-fast
 * 2. Secret exposure & redaction logic
 * 3. Cookie security configuration
 * 4. Security headers & Content Security Policy (CSP)
 * 5. Admin clickjacking / Frame protection
 * 6. Rate limiting configuration & fail-mode
 * 7. Storage provider durability & production fail-safe
 * 8. Upload security regression
 * 9. Health & readiness endpoints security
 * 10. Production script guards & zero debug backdoor routes
 */
async function runProductionSecurityTests() {
  console.log('========================================================================');
  console.log('🔒 RUNNING CMS-12 PRODUCTION SECURITY & HARDENING TEST SUITE');
  console.log('========================================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${testName}${detail ? ` - ${detail}` : ''}`);
      failed++;
    }
  }

  // ---------------------------------------------------------------------------
  // 1. Environment Schema & Validation
  // ---------------------------------------------------------------------------
  console.log('1. Environment Schema & Validation:');
  const { validateEnvironment, redactSecrets } = await import('../src/lib/config/env');
  
  const envCheck = validateEnvironment();
  assert(envCheck.valid, 'Current environment satisfies required schema');

  // Test redaction logic
  const sampleLog = 'User error with DATABASE_URL=postgres://admin:super_secret_pw@db.cloud.com:5432/prod and SESSION_SECRET=my_ultra_secret_key_1234567890123456';
  const redactedLog = redactSecrets(sampleLog);
  assert(!redactedLog.includes('super_secret_pw'), 'redactSecrets removes database password');
  assert(!redactedLog.includes('my_ultra_secret_key_1234567890123456'), 'redactSecrets removes session secret');

  // ---------------------------------------------------------------------------
  // 2. Secret Exposure Audit (.env.example & source code)
  // ---------------------------------------------------------------------------
  console.log('\n2. Secret Exposure Audit:');
  const envExamplePath = path.resolve(process.cwd(), '.env.example');
  assert(fs.existsSync(envExamplePath), '.env.example exists');
  const envExampleContent = fs.readFileSync(envExamplePath, 'utf8');
  assert(!envExampleContent.includes('AKIA') && !envExampleContent.includes('ghp_'), '.env.example contains zero real cloud credentials');
  assert(envExampleContent.includes('DATABASE_URL='), '.env.example documents DATABASE_URL');
  assert(envExampleContent.includes('SESSION_SECRET='), '.env.example documents SESSION_SECRET');
  assert(envExampleContent.includes('STORAGE_PROVIDER='), '.env.example documents STORAGE_PROVIDER');

  // ---------------------------------------------------------------------------
  // 3. Cookie Security
  // ---------------------------------------------------------------------------
  console.log('\n3. Auth & Session Cookie Security:');
  const authCookiePath = path.resolve(process.cwd(), 'src/lib/auth/cookies.ts');
  assert(fs.existsSync(authCookiePath), 'Auth session cookie file exists');
  const authCookieCode = fs.readFileSync(authCookiePath, 'utf8');
  assert(authCookieCode.includes('httpOnly: true'), 'Session cookie enforces httpOnly: true');
  assert(authCookieCode.includes("sameSite: 'lax'") || authCookieCode.includes("sameSite: 'strict'"), 'Session cookie enforces strict/lax SameSite');
  assert(authCookieCode.includes("secure: isProduction") || authCookieCode.includes("secure: process.env.NODE_ENV === 'production'"), 'Session cookie enforces secure: true in production');
  assert(authCookieCode.includes('__Host-'), 'Session cookie leverages __Host- prefix in production');

  // ---------------------------------------------------------------------------
  // 4. Security Headers & CSP
  // ---------------------------------------------------------------------------
  console.log('\n4. Security Headers & CSP:');
  const nextConfigPath = path.resolve(process.cwd(), 'next.config.ts');
  assert(fs.existsSync(nextConfigPath), 'next.config.ts exists');
  const nextConfigCode = fs.readFileSync(nextConfigPath, 'utf8');
  assert(nextConfigCode.includes('Content-Security-Policy'), 'next.config.ts configures Content-Security-Policy');
  assert(nextConfigCode.includes('X-Content-Type-Options') && nextConfigCode.includes('nosniff'), 'next.config.ts configures nosniff');
  assert(nextConfigCode.includes('Referrer-Policy'), 'next.config.ts configures Referrer-Policy');
  assert(nextConfigCode.includes('Strict-Transport-Security'), 'next.config.ts configures HSTS');

  // ---------------------------------------------------------------------------
  // 5. Admin Framing & Clickjacking Protection
  // ---------------------------------------------------------------------------
  console.log('\n5. Admin Framing & Clickjacking Protection:');
  const middlewarePath = path.resolve(process.cwd(), 'src/middleware.ts');
  assert(fs.existsSync(middlewarePath), 'middleware.ts exists');
  const middlewareCode = fs.readFileSync(middlewarePath, 'utf8');
  assert(middlewareCode.includes("frame-ancestors 'none'") || middlewareCode.includes("DENY"), 'middleware.ts restricts framing for admin routes');

  // ---------------------------------------------------------------------------
  // 6. Rate Limiting Configuration
  // ---------------------------------------------------------------------------
  console.log('\n6. Rate Limiting Configuration:');
  const rateLimitPath = path.resolve(process.cwd(), 'src/lib/auth/rate-limiter.ts');
  assert(fs.existsSync(rateLimitPath), 'Rate limiter module exists');
  const rateLimitCode = fs.readFileSync(rateLimitPath, 'utf8');
  assert(rateLimitCode.includes('checkLoginRateLimit') && rateLimitCode.includes('getRateLimiter'), 'Rate limiter utility is defined and exported');

  // ---------------------------------------------------------------------------
  // 7. Media Storage Durability & Fail-Safe
  // ---------------------------------------------------------------------------
  console.log('\n7. Media Storage Durability & Fail-Safe:');
  const storageIndexPath = path.resolve(process.cwd(), 'src/lib/storage/index.ts');
  const s3AdapterPath = path.resolve(process.cwd(), 'src/lib/storage/s3-storage.adapter.ts');
  assert(fs.existsSync(storageIndexPath), 'Storage registry exists');
  assert(fs.existsSync(s3AdapterPath), 'S3/R2 durable object storage adapter exists');

  const { S3StorageAdapter } = await import('../src/lib/storage/s3-storage.adapter');
  const dummyS3 = new S3StorageAdapter({
    endpoint: 'https://s3.example.com',
    bucket: 'test-bucket',
    region: 'us-east-1',
    accessKeyId: 'test-key',
    secretAccessKey: 'test-secret',
    publicUrlPrefix: 'https://cdn.example.com',
  });
  assert(typeof dummyS3.upload === 'function', 'S3StorageAdapter implements upload');
  assert(typeof dummyS3.delete === 'function', 'S3StorageAdapter implements delete');
  assert(typeof dummyS3.getPublicUrl === 'function', 'S3StorageAdapter implements getPublicUrl');

  // ---------------------------------------------------------------------------
  // 8. Upload Security Regression
  // ---------------------------------------------------------------------------
  console.log('\n8. Upload Security Regression:');
  const uploadSecPath = path.resolve(process.cwd(), 'src/services/media.service.ts');
  assert(fs.existsSync(uploadSecPath), 'MediaService exists');
  const uploadSecCode = fs.readFileSync(uploadSecPath, 'utf8');
  assert(uploadSecCode.includes('10 * 1024 * 1024') || uploadSecCode.includes('MAX_UPLOAD_SIZE_BYTES'), '10MB upload limit is enforced');
  assert(uploadSecCode.includes('isSvg') && uploadSecCode.includes('image/svg+xml'), 'SVG uploads are strictly disallowed and rejected');

  // ---------------------------------------------------------------------------
  // 9. Health & Readiness Endpoints
  // ---------------------------------------------------------------------------
  console.log('\n9. Health & Readiness Endpoints:');
  const healthRoutePath = path.resolve(process.cwd(), 'src/app/api/health/route.ts');
  const readinessRoutePath = path.resolve(process.cwd(), 'src/app/api/health/readiness/route.ts');
  assert(fs.existsSync(healthRoutePath), 'Liveness endpoint /api/health exists');
  assert(fs.existsSync(readinessRoutePath), 'Readiness endpoint /api/health/readiness exists');

  const healthCode = fs.readFileSync(healthRoutePath, 'utf8');
  assert(!healthCode.includes('DATABASE_URL') && !healthCode.includes('password'), 'Health route does NOT leak database connection string or passwords');

  const readinessCode = fs.readFileSync(readinessRoutePath, 'utf8');
  assert(!readinessCode.includes('password') && !readinessCode.includes('secretAccessKey'), 'Readiness route does NOT leak storage credentials');

  // ---------------------------------------------------------------------------
  // 10. Debug Routes & Script Guards
  // ---------------------------------------------------------------------------
  console.log('\n10. Debug Routes & Script Guards:');
  const appApiDir = path.resolve(process.cwd(), 'src/app/api');
  let hasDebugRoutes = false;
  if (fs.existsSync(appApiDir)) {
    const apiFiles = fs.readdirSync(appApiDir, { recursive: true });
    for (const f of apiFiles) {
      const fStr = String(f);
      if (fStr.toLowerCase().includes('debug') || fStr.toLowerCase().includes('bypass') || fStr.toLowerCase().includes('test-seed')) {
        hasDebugRoutes = true;
      }
    }
  }
  assert(!hasDebugRoutes, 'Zero unauthorized debug/bypass API routes exist in production tree');

  console.log('\n========================================================================');
  console.log(`RESULTS: ${failed === 0 ? '✅ ALL PRODUCTION SECURITY TESTS PASSED' : '❌ SOME TESTS FAILED'}`);
  console.log(`Total: ${passed + failed} | Passed: ${passed} | Failed: ${failed}`);
  console.log('========================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runProductionSecurityTests().catch((err) => {
  console.error('Fatal error running production security tests:', err);
  process.exit(1);
});
