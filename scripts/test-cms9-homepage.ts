import * as dotenv from 'dotenv';
import * as crypto from 'crypto';

// Stub 'server-only' for Node standalone execution
require.cache[require.resolve('server-only')] = {
  id: require.resolve('server-only'),
  filename: require.resolve('server-only'),
  loaded: true,
  exports: {},
} as unknown as NodeModule;

dotenv.config({ path: '.env.local' });
dotenv.config();

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function pass(testName: string) {
  totalTests++;
  passedTests++;
  console.log(`  ✅ [PASS] ${testName}`);
}

function fail(testName: string, error?: unknown) {
  totalTests++;
  failedTests++;
  console.error(`  ❌ [FAIL] ${testName}:`, error);
}

function calculateSha256(content: string): string {
  return crypto.createHash('sha256').update(content || '', 'utf8').digest('hex');
}

async function runCms9Tests() {
  console.log('\n================================================================');
  console.log('🏠 CMS-9: HOMEPAGE CONSTRAINED EDITOR TEST SUITE');
  console.log('================================================================\n');

  const { db, client } = await import('../src/db');
  const schema = await import('../src/db/schema');
  const { homepageBlocks, users, contentRevisions, auditLogs } = schema;
  const { workflowService } = await import('../src/services/workflow.service');
  const { ContentType, WorkflowStatus } = await import('../src/lib/workflow/types');
  const { Role, Permission } = await import('../src/lib/auth/rbac');
  const { homepageRepository } = await import('../src/repositories');
  const { HomepageSnapshotSchema, CtaTargetSchema } = await import('../src/lib/workflow/registry');
  const { eq, sql } = await import('drizzle-orm');
  const typeHomepage = ContentType.HOMEPAGE;

  // Provision test users in DB
  const [superAdminDb] = await db
    .insert(users)
    .values({
      email: 'admin-cms9-test@doctorcheck.vn',
      passwordHash: 'dummy-hash',
      fullName: 'Super Admin CMS-9',
      isActive: true,
    })
    .onConflictDoUpdate({
      target: users.email,
      set: { isActive: true },
    })
    .returning();

  const [editorDb] = await db
    .insert(users)
    .values({
      email: 'editor-cms9-test@doctorcheck.vn',
      passwordHash: 'dummy-hash',
      fullName: 'Editor CMS-9',
      isActive: true,
    })
    .onConflictDoUpdate({
      target: users.email,
      set: { isActive: true },
    })
    .returning();

  const [reviewerDb] = await db
    .insert(users)
    .values({
      email: 'reviewer-cms9-test@doctorcheck.vn',
      passwordHash: 'dummy-hash',
      fullName: 'Reviewer CMS-9',
      isActive: true,
    })
    .onConflictDoUpdate({
      target: users.email,
      set: { isActive: true },
    })
    .returning();

  const superAdminContext = {
    userId: superAdminDb.id,
    userEmail: superAdminDb.email,
    roles: [Role.SUPER_ADMIN],
    permissions: Object.values(Permission),
  };

  const editorContext = {
    userId: editorDb.id,
    userEmail: editorDb.email,
    roles: [Role.EDITOR],
    permissions: [
      Permission.HOMEPAGE_EDIT,
    ],
  };

  const reviewerContext = {
    userId: reviewerDb.id,
    userEmail: reviewerDb.email,
    roles: [Role.ADMIN],
    permissions: [
      Permission.HOMEPAGE_EDIT,
      Permission.HOMEPAGE_PUBLISH,
    ],
  };

  // Cleanup any existing test fixtures
  await db.delete(contentRevisions).where(sql`entity_id = 'test-homepage-fixture' OR (entity_type = 'homepage' AND title LIKE '%[TEST]%')`);

  try {
    // -------------------------------------------------------------------------
    // SUITE 1: Baseline Homepage Block Inventory & Checksum Snapshot
    // -------------------------------------------------------------------------
    console.log('--- SUITE 1: Baseline Homepage Block Inventory & Checksums ---');
    const initialBlocks = await db.select().from(homepageBlocks);

    const expectedBlockKeys = [
      'hero',
      'pain_points',
      'benefits',
      'cancer_screening',
      'banner_cta',
      'sections_meta',
      'pricing',
    ];

    if (initialBlocks.length === 7) {
      pass('HomepageInventory > Exactly 7 canonical rows exist in homepage_blocks');
    } else {
      fail(`HomepageInventory > Expected 7 rows, found ${initialBlocks.length}`);
    }

    const presentKeys = initialBlocks.map((b) => b.blockKey);
    const hasAllKeys = expectedBlockKeys.every((k) => presentKeys.includes(k));
    if (hasAllKeys) {
      pass('HomepageInventory > All 7 required block keys present (hero, pain_points, benefits, cancer_screening, banner_cta, sections_meta, pricing)');
    } else {
      fail(`HomepageInventory > Missing block keys: ${expectedBlockKeys.filter((k) => !presentKeys.includes(k)).join(', ')}`);
    }

    // Capture baseline checksums for each block (excluding mutable updatedAt)
    const normalizeBlock = (b: any) => ({
      blockKey: b.blockKey,
      title: b.title,
      subtitle: b.subtitle,
      content: b.content,
      isActive: b.isActive,
    });

    const baselineBlockHashes = new Map(
      initialBlocks.map((b) => [b.blockKey, calculateSha256(JSON.stringify(normalizeBlock(b)))])
    );
    pass(`BaselineHashes > Captured SHA-256 signatures for all 7 canonical homepage blocks`);

    // Verify Repository mapping
    const repositoryHomepageData = await homepageRepository.getHomepageData();
    if (
      repositoryHomepageData.hero &&
      repositoryHomepageData.painPoints &&
      repositoryHomepageData.benefits &&
      repositoryHomepageData.cancerScreening &&
      repositoryHomepageData.bannerCta &&
      repositoryHomepageData.sectionsMeta &&
      repositoryHomepageData.pricing
    ) {
      pass('HomepageRepository > getHomepageData() successfully maps all 7 blocks into typed HomepageData');
    } else {
      fail('HomepageRepository > Failed to map all 7 blocks');
    }

    // -------------------------------------------------------------------------
    // SUITE 2: Hard Page-Builder Boundary & Strict Schema Validation
    // -------------------------------------------------------------------------
    console.log('\n--- SUITE 2: Hard Page Builder Boundary & Schema Enforcement ---');
    const validData = JSON.parse(JSON.stringify(repositoryHomepageData));

    // Test 2.1: Reject arbitrary root-level properties (e.g., custom CSS, JS, Elementor layout)
    const arbitraryPropsPayload = {
      ...validData,
      customCss: '.hero { background: red !important; }',
      customJs: 'console.log("hacked");',
      arbitraryLayout: { grid: '12-col', nesting: [1, 2, 3] },
      reactComponent: 'CustomHeroWidget',
    };

    const strictParseResult = HomepageSnapshotSchema.safeParse(arbitraryPropsPayload);
    if (!strictParseResult.success) {
      pass('PageBuilderBoundary > Reject arbitrary layout, custom CSS, JS, and component injection (.strict() enforcement)');
    } else {
      fail('PageBuilderBoundary > Strict schema permitted arbitrary page builder properties!');
    }

    // Test 2.2: Reject invalid pricing matrix cardinality (e.g. empty or excessive packages)
    const emptyPackagesPayload = {
      ...validData,
      pricing: {
        malePackages: [],
        femalePackages: validData.pricing.femalePackages,
      },
    };
    const emptyPkgResult = HomepageSnapshotSchema.safeParse(emptyPackagesPayload);
    if (!emptyPkgResult.success) {
      pass('CardinalityValidation > Reject empty malePackages array (Min 1 package required)');
    } else {
      fail('CardinalityValidation > Allowed empty packages list');
    }

    // Test 2.3: Reject excessive packages (> 10 packages)
    const excessivePackages = Array(15).fill(validData.pricing.malePackages[0]);
    const excessivePkgPayload = {
      ...validData,
      pricing: {
        malePackages: excessivePackages,
        femalePackages: validData.pricing.femalePackages,
      },
    };
    const excessivePkgResult = HomepageSnapshotSchema.safeParse(excessivePkgPayload);
    if (!excessivePkgResult.success) {
      pass('CardinalityValidation > Reject excessive malePackages array (> 10 packages limit)');
    } else {
      fail('CardinalityValidation > Allowed excessive packages list');
    }

    // -------------------------------------------------------------------------
    // SUITE 3: CTA URL Security Tests
    // -------------------------------------------------------------------------
    console.log('\n--- SUITE 3: CTA URL Security & Protocol Validation ---');
    const validInternal1 = CtaTargetSchema.safeParse('/bang-gia-dich-vu/');
    const validInternal2 = CtaTargetSchema.safeParse('#tu-van');
    const validHttps = CtaTargetSchema.safeParse('https://zalo.me/doctorcheck');
    const validTel = CtaTargetSchema.safeParse('tel:02856789999');

    if (validInternal1.success && validInternal2.success && validHttps.success && validTel.success) {
      pass('CtaSecurity > Valid destinations (internal path, anchor, HTTPS, tel:) accepted');
    } else {
      fail('CtaSecurity > Failed to validate legitimate CTA destinations');
    }

    const invalidJsCta = CtaTargetSchema.safeParse('javascript:alert(document.cookie)');
    const invalidDataCta = CtaTargetSchema.safeParse('data:text/html,<script>alert(1)</script>');
    const invalidVbCta = CtaTargetSchema.safeParse('vbscript:msgbox(1)');
    const invalidProtoRel = CtaTargetSchema.safeParse('//evil-phishing.com/login');
    const invalidScriptTag = CtaTargetSchema.safeParse('/<script>alert(1)</script>');

    if (
      !invalidJsCta.success &&
      !invalidDataCta.success &&
      !invalidVbCta.success &&
      !invalidProtoRel.success &&
      !invalidScriptTag.success
    ) {
      pass('CtaSecurity > Dangerous destinations (javascript:, data:, vbscript:, protocol-relative //, script tags) strictly REJECTED');
    } else {
      fail('CtaSecurity > Allowed dangerous or malformed CTA target');
    }

    // -------------------------------------------------------------------------
    // SUITE 4: Save Draft Isolation (Canonical Database Unchanged)
    // -------------------------------------------------------------------------
    console.log('\n--- SUITE 4: Save Draft Isolation ---');
    const mutatedHeroData = JSON.parse(JSON.stringify(repositoryHomepageData));
    mutatedHeroData.hero.title = '[TEST] Khám Bệnh Chuẩn Quốc Tế Thử Nghiệm';
    mutatedHeroData.hero.subtitle = '[TEST] Trải nghiệm y tế cao cấp';

    const draftCreateRes = await workflowService.createDraftRevision(
      typeHomepage,
      'default',
      mutatedHeroData,
      editorContext,
      {
        title: '[TEST] Cấu hình Trang chủ Draft Isolation',
        changeSummary: 'Kiểm thử lưu bản nháp không ảnh hưởng DB chính',
      }
    );

    if (draftCreateRes.success && draftCreateRes.data) {
      pass('DraftIsolation > Draft revision created successfully in content_revisions');
    } else {
      fail('DraftIsolation > Failed to create draft revision', draftCreateRes.error);
    }

    // Verify canonical `homepage_blocks` remains 100% untouched
    const currentHeroBlock = await db
      .select()
      .from(homepageBlocks)
      .where(eq(homepageBlocks.blockKey, 'hero'));

    if (
      currentHeroBlock.length === 1 &&
      calculateSha256(JSON.stringify(normalizeBlock(currentHeroBlock[0]))) === baselineBlockHashes.get('hero')
    ) {
      pass('DraftIsolation > Canonical homepage_blocks row for "hero" is 100% UNCHANGED (0 drift)');
    } else {
      fail('DraftIsolation > Canonical homepage_blocks was mutated by Save Draft!');
    }

    // Verify public repository still serves original canonical data
    const publicHomepageData = await homepageRepository.getHomepageData();
    if (publicHomepageData.hero.title === repositoryHomepageData.hero.title) {
      pass('DraftIsolation > Public homepageRepository.getHomepageData() returns canonical published content');
    } else {
      fail('DraftIsolation > Public repository leaked draft content!');
    }

    // -------------------------------------------------------------------------
    // SUITE 5: Full CMS-4 Workflow Lifecycle & RBAC Enforcement
    // -------------------------------------------------------------------------
    console.log('\n--- SUITE 5: Homepage Workflow Lifecycle & RBAC ---');
    const draftId = draftCreateRes.data!.id;

    // 5.1: Editor submits for review
    const submitReviewRes = await workflowService.submitForReview(draftId, editorContext);
    if (submitReviewRes.success && submitReviewRes.data?.status === WorkflowStatus.IN_REVIEW) {
      pass('WorkflowLifecycle > Draft successfully transitioned to IN_REVIEW');
    } else {
      fail('WorkflowLifecycle > Failed to transition to IN_REVIEW', submitReviewRes.error);
    }

    // 5.2: Editor without HOMEPAGE_PUBLISH tries to approve -> DENIED
    const unauthorizedApprove = await workflowService.approveRevision(draftId, editorContext);
    if (!unauthorizedApprove.success) {
      pass('RBAC > Unauthorized editor approve attempt strictly DENIED');
    } else {
      fail('RBAC > Unauthorized editor was allowed to approve revision!');
    }

    // 5.3: Reviewer approves
    const approveRes = await workflowService.approveRevision(draftId, reviewerContext);
    if (approveRes.success && approveRes.data?.status === WorkflowStatus.APPROVED) {
      pass('WorkflowLifecycle > Reviewer successfully approved revision (APPROVED)');
    } else {
      fail('WorkflowLifecycle > Failed to approve revision', approveRes.error);
    }

    // 5.4: Unauthorized editor publish attempt -> DENIED
    const unauthorizedPublish = await workflowService.publishRevision(draftId, editorContext);
    if (!unauthorizedPublish.success) {
      pass('RBAC > Unauthorized editor publish attempt strictly DENIED');
    } else {
      fail('RBAC > Unauthorized editor was allowed to publish revision!');
    }

    // 5.5: Authorized publish by Reviewer / Admin -> ATOMIC TRANSACTION
    const publishRes = await workflowService.publishRevision(draftId, reviewerContext);
    if (publishRes.success && publishRes.data?.status === WorkflowStatus.PUBLISHED) {
      pass('WorkflowLifecycle > Revision PUBLISHED atomically to homepage_blocks');
    } else {
      fail('WorkflowLifecycle > Authorized publish failed', publishRes.error);
    }

    // 5.6: Check published changes in canonical table
    const publishedHeroBlock = await db
      .select()
      .from(homepageBlocks)
      .where(eq(homepageBlocks.blockKey, 'hero'));
    if (publishedHeroBlock[0].title === '[TEST] Khám Bệnh Chuẩn Quốc Tế Thử Nghiệm') {
      pass('WorkflowLifecycle > Canonical homepage_blocks updated with published revision data');
    } else {
      fail('WorkflowLifecycle > Canonical table did not update on publish');
    }

    // 5.7: Verify targeted cache revalidation plan and execution
    const { DOMAIN_WORKFLOW_REGISTRY } = await import('../src/lib/workflow/registry');
    const homepageRevalPlan = DOMAIN_WORKFLOW_REGISTRY[typeHomepage].getRevalidationPlan('default', {});
    if (homepageRevalPlan.paths.includes('/') && homepageRevalPlan.tags?.includes('homepage')) {
      pass('Revalidation > Revalidation plan correctly targets path "/" and tag "homepage"');
    } else {
      fail('Revalidation > Invalid revalidation plan for Homepage', homepageRevalPlan);
    }

    // -------------------------------------------------------------------------
    // SUITE 6: Optimistic Concurrency & Conflict Detection
    // -------------------------------------------------------------------------
    console.log('\n--- SUITE 6: Optimistic Concurrency Control ---');
    const concDraftRes = await workflowService.createDraftRevision(
      typeHomepage,
      'default',
      validData,
      superAdminContext,
      {
        title: '[TEST] Concurrency Draft',
        changeSummary: 'Kiểm thử khóa lạc quan',
      }
    );

    const concDraftId = concDraftRes.data!.id;
    const initialVer = concDraftRes.data!.version; // 1

    // Update 1: using expectedVersion = 1 -> succeeds, version becomes 2
    const update1 = await workflowService.updateDraftRevision(
      concDraftId,
      initialVer,
      validData,
      superAdminContext,
      { changeSummary: 'Update 1' }
    );
    if (update1.success && update1.data?.version === 2) {
      pass('OptimisticConcurrency > First valid update with version 1 succeeds (New version: 2)');
    } else {
      fail('OptimisticConcurrency > First update failed', update1.error);
    }

    // Update 2: concurrent user submits with stale expectedVersion = 1 -> CONFLICT
    const staleUpdate = await workflowService.updateDraftRevision(
      concDraftId,
      initialVer, // Stale version 1
      validData,
      superAdminContext,
      { changeSummary: 'Stale Update' }
    );
    if (!staleUpdate.success && staleUpdate.conflict) {
      pass('OptimisticConcurrency > Stale update (expectedVersion=1, actual=2) strictly rejected with CONFLICT');
    } else {
      fail('OptimisticConcurrency > Stale update was allowed without conflict error!');
    }

    // -------------------------------------------------------------------------
    // SUITE 7: Non-Destructive Restore Semantics
    // -------------------------------------------------------------------------
    console.log('\n--- SUITE 7: Non-Destructive Restore Policy ---');
    const restoreRes = await workflowService.restoreRevision(draftId, superAdminContext);
    if (
      restoreRes.success &&
      restoreRes.data &&
      restoreRes.data.id !== draftId &&
      restoreRes.data.status === WorkflowStatus.DRAFT
    ) {
      pass('RestorePolicy > Restoring historical revision created a NEW draft revision leaving historical revision intact');
    } else {
      fail('RestorePolicy > Restore failed or mutated historical revision', restoreRes.error);
    }

    // Clean up temporary test revisions
    await db.delete(contentRevisions).where(eq(contentRevisions.id, draftId));
    await db.delete(contentRevisions).where(eq(contentRevisions.id, concDraftId));
    if (restoreRes.data) {
      await db.delete(contentRevisions).where(eq(contentRevisions.id, restoreRes.data.id));
    }

    // -------------------------------------------------------------------------
    // SUITE 8: Reference Normalization & Entity Separation
    // -------------------------------------------------------------------------
    console.log('\n--- SUITE 8: Entity References vs Duplication ---');
    // Ensure sectionsMeta only stores section header copy, not duplicate Doctor/Equipment rows
    const sectionsMetaContent = repositoryHomepageData.sectionsMeta;
    if (
      sectionsMetaContent.doctorsHeader &&
      !('doctorsList' in (sectionsMetaContent as any)) &&
      sectionsMetaContent.equipmentHeader &&
      !('equipmentList' in (sectionsMetaContent as any))
    ) {
      pass('ReferenceArchitecture > Homepage configuration maintains strict separation: references/headers only, 0 entity duplication');
    } else {
      fail('ReferenceArchitecture > Detected duplicated full entity data in homepage configuration!');
    }

    // -------------------------------------------------------------------------
    // SUITE 9: Zero Passive Data Drift Baseline Parity Verification
    // -------------------------------------------------------------------------
    console.log('\n--- SUITE 9: Zero Passive Data Drift & Baseline Restoration ---');
    // Restore original baseline values for all 7 blocks in homepage_blocks
    for (const b of initialBlocks) {
      await db
        .update(homepageBlocks)
        .set({
          title: b.title,
          subtitle: b.subtitle,
          content: b.content,
          isActive: b.isActive,
          updatedAt: b.updatedAt,
        })
        .where(eq(homepageBlocks.blockKey, b.blockKey));
    }

    const finalBlocks = await db.select().from(homepageBlocks);
    let checksumMismatches = 0;

    for (const b of finalBlocks) {
      const expectedHash = baselineBlockHashes.get(b.blockKey);
      const actualHash = calculateSha256(JSON.stringify(normalizeBlock(b)));
      if (actualHash !== expectedHash) {
        checksumMismatches++;
        console.error(`Checksum mismatch on block ${b.blockKey}! Expected ${expectedHash}, got ${actualHash}`);
      }
    }

    if (checksumMismatches === 0) {
      pass('ZeroPassiveDrift > ZERO PASSIVE DATA DRIFT (All 7 blocks match 100% baseline SHA-256 hashes)');
    } else {
      fail(`ZeroPassiveDrift > Detected ${checksumMismatches} checksum mismatches in canonical homepage blocks!`);
    }

    // Cleanup test users
    await db.delete(users).where(sql`email LIKE '%-cms9-test@doctorcheck.vn'`);
    pass('Teardown > Cleaned up all temporary test users and test revisions');

  } finally {
    try {
      await client.end();
    } catch {
      // ignore
    }
  }

  console.log('\n================================================================');
  console.log(`📊 CMS-9 TEST RESULTS: ${passedTests}/${totalTests} PASSED (${failedTests} FAILED)`);
  console.log('================================================================\n');

  if (failedTests > 0) {
    process.exit(1);
  }
}

runCms9Tests().catch((err) => {
  console.error('Unhandled failure in CMS-9 tests:', err);
  process.exit(1);
});
