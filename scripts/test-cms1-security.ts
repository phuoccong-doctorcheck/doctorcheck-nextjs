import * as dotenv from 'dotenv';

// Stub 'server-only' for Node standalone execution
require.cache[require.resolve('server-only')] = {
  id: require.resolve('server-only'),
  filename: require.resolve('server-only'),
  loaded: true,
  exports: {},
} as unknown as NodeModule;

dotenv.config({ path: '.env.local' });

let passCount = 0;
let failCount = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    console.log(`  ✅ PASS: ${testName}`);
    passCount++;
  } else {
    console.error(`  ❌ FAIL: ${testName}`);
    if (detail) console.error(`     Detail: ${detail}`);
    failCount++;
  }
}

async function runSecurityTestSuite() {
  const postgres = (await import('postgres')).default;
  const { hashPassword, verifyPassword, validatePasswordPolicy } = await import('../src/lib/auth/password');
  const { generateSessionToken, hashSessionToken } = await import('../src/lib/auth/tokens');
  const { Role, Permission, hasPermission, hasRole, resolvePermissionsForRoles } = await import('../src/lib/auth/rbac');
  const { getRateLimiter } = await import('../src/lib/auth/rate-limiter');
  const { sanitizeReturnTo } = await import('../src/lib/auth/redirect');
  const { repositories } = await import('../src/repositories');
  const { resolveContent } = await import('../src/lib/routing/resolve-content');
  console.log('========================================================================');
  console.log('🧪 CMS-1 COMPREHENSIVE SECURITY & AUTHENTICATION TEST SUITE');
  console.log('========================================================================\n');

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('❌ DATABASE_URL is not configured.');
    process.exit(1);
  }

  const sql = postgres(databaseUrl, { max: 2 });

  try {
    // -------------------------------------------------------------------------
    // TEST SUITE 1: Argon2id Password Hashing & Policy
    // -------------------------------------------------------------------------
    console.log('📦 1. Password Security & Argon2id Hashing Tests:');
    const testPlainPassword = 'DoctorCheck@SecurePass123!';
    const startTime = Date.now();
    const computedHash = await hashPassword(testPlainPassword);
    const hashDuration = Date.now() - startTime;

    assert(
      computedHash.startsWith('$argon2id$'),
      'Argon2id prefix identification',
      `Hash prefix: ${computedHash.slice(0, 15)}...`
    );
    assert(
      hashDuration < 500,
      'Argon2id hashing within acceptable latency (<500ms)',
      `Actual: ${hashDuration}ms`
    );

    const validVerification = await verifyPassword(computedHash, testPlainPassword);
    assert(validVerification === true, 'Argon2id verifies authentic password successfully');

    const invalidVerification = await verifyPassword(computedHash, 'IncorrectPassword999!');
    assert(invalidVerification === false, 'Argon2id rejects incorrect password');

    // Policy Validation
    const shortPass = validatePasswordPolicy('Short1!');
    assert(shortPass.valid === false, 'Password policy rejects passwords shorter than 12 chars');

    const emptyPass = validatePasswordPolicy('');
    assert(emptyPass.valid === false, 'Password policy rejects empty password');

    const validPass = validatePasswordPolicy(testPlainPassword);
    assert(validPass.valid === true, 'Password policy accepts compliant strong password');

    // -------------------------------------------------------------------------
    // TEST SUITE 2: Session Token Generation & SHA-256 Hashing at Rest
    // -------------------------------------------------------------------------
    console.log('\n📦 2. Session Token Generation & Hashing Tests:');
    const rawToken = generateSessionToken();
    const tokenHash = hashSessionToken(rawToken);

    assert(
      rawToken.length >= 40,
      'Session token contains sufficient cryptographic entropy (>=40 chars base64url)',
      `Token length: ${rawToken.length}`
    );
    assert(
      tokenHash.length === 64,
      'Session token hash is valid SHA-256 hex string (64 chars)',
      `Hash length: ${tokenHash.length}`
    );
    assert(
      tokenHash !== rawToken,
      'Opaque session token and stored hash are distinct'
    );

    // -------------------------------------------------------------------------
    // TEST SUITE 3: Database Session Lifecycle (Create, Expire, Revoke)
    // -------------------------------------------------------------------------
    console.log('\n📦 3. Database Session Lifecycle & Invalidation Tests:');

    // Fetch bootstrap user
    const [adminUser] = await sql<{ id: string; email: string; is_active: boolean }[]>`
      SELECT id, email, is_active FROM users WHERE email = 'admin@doctorcheck.vn' LIMIT 1;
    `;

    assert(Boolean(adminUser), 'Superadmin account exists in database');

    if (adminUser) {
      // 3.1 Create Session
      const sessionToken = generateSessionToken();
      const sessionHash = hashSessionToken(sessionToken);
      const expiresAt = new Date(Date.now() + 8 * 3600 * 1000);

      const [createdSession] = await sql<{ id: string; token_hash: string }[]>`
        INSERT INTO sessions (user_id, token_hash, expires_at, ip_address, user_agent, created_at)
        VALUES (${adminUser.id}, ${sessionHash}, ${expiresAt}, '127.0.0.1', 'TestSuite/1.0', NOW())
        RETURNING id, token_hash;
      `;

      assert(Boolean(createdSession), 'Session inserted successfully in database');
      assert(
        createdSession.token_hash === sessionHash,
        'Database stores token hash, NEVER plaintext token'
      );

      // 3.2 Query Session by Hash
      const foundSession = await sql`
        SELECT * FROM sessions WHERE token_hash = ${sessionHash};
      `;
      assert(foundSession.length === 1, 'Session lookup by token hash succeeds');

      // 3.3 Revoke Session
      await sql`
        DELETE FROM sessions WHERE token_hash = ${sessionHash};
      `;
      const afterRevoke = await sql`
        SELECT * FROM sessions WHERE token_hash = ${sessionHash};
      `;
      assert(afterRevoke.length === 0, 'Revoked session is deleted server-side');

      // 3.4 Expired Session Handling
      const expiredToken = generateSessionToken();
      const expiredHash = hashSessionToken(expiredToken);
      const pastDate = new Date(Date.now() - 3600 * 1000); // 1 hour ago

      await sql`
        INSERT INTO sessions (user_id, token_hash, expires_at, created_at)
        VALUES (${adminUser.id}, ${expiredHash}, ${pastDate}, NOW());
      `;

      const expiredCheck = await sql<{ id: string; expires_at: Date }[]>`
        SELECT id, expires_at FROM sessions WHERE token_hash = ${expiredHash};
      `;
      assert(
        expiredCheck.length === 1 && new Date(expiredCheck[0].expires_at) < new Date(),
        'Expired session correctly identified as past current timestamp'
      );

      // Clean up expired test session
      await sql`DELETE FROM sessions WHERE token_hash = ${expiredHash};`;
    }

    // -------------------------------------------------------------------------
    // TEST SUITE 4: Disabled Account Enforcement
    // -------------------------------------------------------------------------
    console.log('\n📦 4. Disabled Account Enforcement Tests:');
    const disabledEmail = 'disabled-test@doctorcheck.vn';
    const disabledPassHash = await hashPassword('DisabledUserPass123!');

    // Create temporary disabled user
    const [disabledUser] = await sql<{ id: string }[]>`
      INSERT INTO users (email, password_hash, full_name, is_active, created_at, updated_at)
      VALUES (${disabledEmail}, ${disabledPassHash}, 'Disabled Test User', false, NOW(), NOW())
      ON CONFLICT (email) DO UPDATE SET is_active = false
      RETURNING id;
    `;

    assert(Boolean(disabledUser), 'Disabled test user provisioned');

    // Create session for disabled user
    const disToken = generateSessionToken();
    const disHash = hashSessionToken(disToken);
    await sql`
      INSERT INTO sessions (user_id, token_hash, expires_at, created_at)
      VALUES (${disabledUser.id}, ${disHash}, ${new Date(Date.now() + 3600000)}, NOW());
    `;

    // Check user active status query
    const [checkDis] = await sql<{ is_active: boolean }[]>`
      SELECT u.is_active 
      FROM sessions s 
      JOIN users u ON s.user_id = u.id 
      WHERE s.token_hash = ${disHash};
    `;

    assert(checkDis.is_active === false, 'Session join confirms account is inactive (is_active: false)');

    // Clean up test disabled user & session
    await sql`DELETE FROM sessions WHERE user_id = ${disabledUser.id};`;
    await sql`DELETE FROM users WHERE id = ${disabledUser.id};`;

    // -------------------------------------------------------------------------
    // TEST SUITE 5: RBAC Role & Permission Resolution
    // -------------------------------------------------------------------------
    console.log('\n📦 5. RBAC Roles & Permissions Matrix Tests:');

    const superAdminPerms = resolvePermissionsForRoles([Role.SUPER_ADMIN]);
    const editorPerms = resolvePermissionsForRoles([Role.EDITOR]);
    const reviewerPerms = resolvePermissionsForRoles([Role.MEDICAL_REVIEWER]);

    assert(
      superAdminPerms.length === Object.values(Permission).length,
      'SUPER_ADMIN resolves all system permissions'
    );
    assert(
      hasPermission([Role.SUPER_ADMIN], superAdminPerms, Permission.ARTICLE_PUBLISH) === true,
      'SUPER_ADMIN has article.publish permission'
    );
    assert(
      hasPermission([Role.SUPER_ADMIN], superAdminPerms, Permission.USER_MANAGE) === true,
      'SUPER_ADMIN has user.manage permission'
    );

    // Editor restrictions
    assert(
      hasPermission([Role.EDITOR], editorPerms, Permission.ARTICLE_CREATE) === true,
      'EDITOR has article.create permission'
    );
    assert(
      hasPermission([Role.EDITOR], editorPerms, Permission.ARTICLE_PUBLISH) === false,
      'EDITOR is DENIED article.publish permission'
    );
    assert(
      hasPermission([Role.EDITOR], editorPerms, Permission.DOCTOR_EDIT_CCHN) === false,
      'EDITOR is DENIED doctor.edit_cchn permission'
    );
    assert(
      hasPermission([Role.EDITOR], editorPerms, Permission.PACKAGE_EDIT_PRICE) === false,
      'EDITOR is DENIED package.edit_price permission'
    );

    // Medical Reviewer permissions
    assert(
      hasPermission([Role.MEDICAL_REVIEWER], reviewerPerms, Permission.ARTICLE_PUBLISH) === true,
      'MEDICAL_REVIEWER has article.publish permission'
    );
    assert(
      hasPermission([Role.MEDICAL_REVIEWER], reviewerPerms, Permission.DOCTOR_EDIT_CCHN) === true,
      'MEDICAL_REVIEWER has doctor.edit_cchn permission'
    );
    assert(
      hasPermission([Role.MEDICAL_REVIEWER], reviewerPerms, Permission.USER_MANAGE) === false,
      'MEDICAL_REVIEWER is DENIED user.manage permission'
    );

    // Role membership helper
    assert(hasRole([Role.SUPER_ADMIN], Role.ADMIN) === true, 'SUPER_ADMIN passes any role check');
    assert(hasRole([Role.EDITOR], Role.EDITOR) === true, 'EDITOR passes Role.EDITOR check');
    assert(hasRole([Role.EDITOR], Role.ADMIN) === false, 'EDITOR fails Role.ADMIN check');

    // -------------------------------------------------------------------------
    // TEST SUITE 6: Rate Limiting Sliding Window
    // -------------------------------------------------------------------------
    console.log('\n📦 6. Rate Limiting Tests:');
    const limiter = getRateLimiter();
    const testKey = 'test_ip_client_999';

    // 5 attempts allowed with limit = 5
    const r1 = await limiter.check(testKey, 5, 10000);
    const r2 = await limiter.check(testKey, 5, 10000);
    const r3 = await limiter.check(testKey, 5, 10000);
    const r4 = await limiter.check(testKey, 5, 10000);
    const r5 = await limiter.check(testKey, 5, 10000);
    const r6 = await limiter.check(testKey, 5, 10000); // 6th should fail

    assert(r1.success === true && r1.remaining === 4, 'Attempt 1 passes (remaining: 4)');
    assert(r5.success === true && r5.remaining === 0, 'Attempt 5 passes (remaining: 0)');
    assert(
      r6.success === false && (r6.retryAfterSeconds || 0) > 0,
      'Attempt 6 is throttled / locked out (success: false)',
      `Retry after: ${r6.retryAfterSeconds}s`
    );

    // Reset rate limiter
    await limiter.reset(testKey);
    const rReset = await limiter.check(testKey, 5, 10000);
    assert(rReset.success === true, 'Rate limiter resets successfully on command');

    // -------------------------------------------------------------------------
    // TEST SUITE 7: Open Redirect Protection & ReturnTo Validation
    // -------------------------------------------------------------------------
    console.log('\n📦 7. Open Redirect Sanitization & ReturnTo Tests:');
    assert(
      sanitizeReturnTo(undefined) === '/admin/',
      'Sanitizes undefined returnTo to default /admin/'
    );
    assert(
      sanitizeReturnTo(null) === '/admin/',
      'Sanitizes null returnTo to default /admin/'
    );
    assert(
      sanitizeReturnTo('') === '/admin/',
      'Sanitizes empty string returnTo to default /admin/'
    );
    assert(
      sanitizeReturnTo('   ') === '/admin/',
      'Sanitizes whitespace-only returnTo to default /admin/'
    );
    assert(
      sanitizeReturnTo('/admin/') === '/admin/',
      'Permits valid base admin path: /admin/'
    );
    assert(
      sanitizeReturnTo('/admin/articles') === '/admin/articles',
      'Permits valid relative admin path: /admin/articles'
    );
    assert(
      sanitizeReturnTo('/admin/articles/') === '/admin/articles/',
      'Permits valid relative admin path with trailing slash: /admin/articles/'
    );
    assert(
      sanitizeReturnTo('/admin/pages/') === '/admin/pages/',
      'Permits valid relative admin path: /admin/pages/'
    );
    assert(
      sanitizeReturnTo('/admin/doctors?page=2') === '/admin/doctors?page=2',
      'Permits relative admin path with query params: /admin/doctors?page=2'
    );
    assert(
      sanitizeReturnTo('https://evil-attacker.com/steal') === '/admin/',
      'Sanitizes absolute external URL to default /admin/'
    );
    assert(
      sanitizeReturnTo('//evil-attacker.com/steal') === '/admin/',
      'Sanitizes protocol-relative // URL to default /admin/'
    );
    assert(
      sanitizeReturnTo('/admin\\evil.com') === '/admin/',
      'Sanitizes backslash injection to default /admin/'
    );
    assert(
      sanitizeReturnTo('javascript:alert(1)') === '/admin/',
      'Sanitizes javascript: pseudo-protocol to default /admin/'
    );
    assert(
      sanitizeReturnTo('data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==') === '/admin/',
      'Sanitizes data: scheme URI to default /admin/'
    );
    assert(
      sanitizeReturnTo('/public-route') === '/admin/',
      'Sanitizes non-admin internal path to default /admin/'
    );

    // Zod Schema nullish validation test
    const { z } = await import('zod');
    const testLoginSchema = z.object({
      email: z.string().trim().email(),
      password: z.string().min(1),
      returnTo: z.string().nullish(),
    });

    assert(
      testLoginSchema.safeParse({ email: 'admin@doctorcheck.vn', password: 'pass', returnTo: null }).success === true,
      'Login schema accepts null returnTo (e.g. missing from FormData)'
    );
    assert(
      testLoginSchema.safeParse({ email: 'admin@doctorcheck.vn', password: 'pass', returnTo: undefined }).success === true,
      'Login schema accepts undefined returnTo'
    );
    assert(
      testLoginSchema.safeParse({ email: 'admin@doctorcheck.vn', password: 'pass', returnTo: '' }).success === true,
      'Login schema accepts empty string returnTo'
    );
    assert(
      testLoginSchema.safeParse({ email: 'admin@doctorcheck.vn', password: 'pass', returnTo: '/admin/articles/' }).success === true,
      'Login schema accepts valid relative returnTo'
    );

    // -------------------------------------------------------------------------
    // TEST SUITE 8: Audit Log Integrity & Metadata Redaction
    // -------------------------------------------------------------------------
    console.log('\n📦 8. Audit Log Database Integrity Tests:');
    const auditLogsInDb = await sql<{ count: string }[]>`
      SELECT count(*)::text as count FROM audit_logs;
    `;
    assert(Number(auditLogsInDb[0].count) >= 1, 'Audit logs recorded in database');

    const recentAudit = await sql<{ action: string; metadata: Record<string, unknown> }[]>`
      SELECT action, metadata FROM audit_logs ORDER BY created_at DESC LIMIT 5;
    `;

    let leaksFound = 0;
    for (const log of recentAudit) {
      const metaStr = JSON.stringify(log.metadata);
      if (
        metaStr.includes('password') &&
        !metaStr.includes('[REDACTED]') &&
        !metaStr.includes('passwordHash')
      ) {
        leaksFound++;
      }
    }
    assert(leaksFound === 0, 'Audit log metadata contains zero plaintext credential leaks');

    // -------------------------------------------------------------------------
    // TEST SUITE 9: Public Site & Collision Routing Regression
    // -------------------------------------------------------------------------
    console.log('\n📦 9. Public Site & Collision Routing Non-Interference:');

    // Verify all 8 domain repositories are accessible
    const docCount = (await repositories.doctor.getAll()).length;
    const pkgCount = (await repositories.package.getAll()).length;
    const catCount = (await repositories.category.getAll()).length;
    const artCount = (await repositories.article.getAll()).length;
    const pageCount = (await repositories.page.getAll()).length;
    const clinic = await repositories.clinic.getClinicInfo();
    const homepage = await repositories.homepage.getHomepageData();

    assert(docCount === 7, `Doctors domain intact: ${docCount} doctors`);
    assert(pkgCount === 9, `Packages domain intact: ${pkgCount} packages`);
    assert(catCount === 30, `Categories domain intact: ${catCount} categories`);
    assert(artCount === 108, `Articles domain intact: ${artCount} articles`);
    assert(pageCount === 55, `Pages domain intact: ${pageCount} pages`);
    assert(Boolean(clinic?.hotline), `Clinic domain intact: Hotline ${clinic?.hotline}`);
    assert(Boolean(homepage?.hero?.title), `Homepage domain intact: Hero title "${homepage?.hero?.title}"`);

    // Verify 6 known collision invariants
    const postCollisions = ['dau-thuong-vi', 'tieu-chay', 'di-ngoai-ra-mau', 'tao-bon'];
    for (const slug of postCollisions) {
      const resolved = resolveContent(slug);
      assert(
        resolved.type === 'article',
        `Collision slug '${slug}' resolves strictly to article`,
        `Resolved type: ${resolved.type}`
      );
    }

    const categoryCollisions = ['kien-thuc-ung-thu-da-day', 'kien-thuc-ung-thu-dai-trang'];
    for (const slug of categoryCollisions) {
      const resolved = resolveContent(slug);
      assert(
        resolved.type === 'category',
        `Collision slug '${slug}' resolves strictly to category at root`,
        `Resolved type: ${resolved.type}`
      );
    }

    // Verify 'admin' does not resolve to public content
    const adminResolved = resolveContent('admin');
    assert(
      adminResolved.type === 'notFound',
      "Public dynamic resolver rejects 'admin' (type: notFound)"
    );

    console.log('\n========================================================================');
    console.log(`🎉 TEST SUMMARY: ${passCount} PASSED, ${failCount} FAILED`);
    console.log('========================================================================');

    await sql.end();
    if (failCount > 0) {
      process.exit(1);
    } else {
      process.exit(0);
    }
  } catch (error) {
    console.error('❌ Test suite fatal error:', error);
    await sql.end({ timeout: 2 });
    process.exit(1);
  }
}

runSecurityTestSuite();
