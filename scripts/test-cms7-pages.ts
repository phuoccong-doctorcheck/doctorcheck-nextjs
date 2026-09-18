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

async function runCms7Tests() {
  console.log('\n================================================================');
  console.log('📄 CMS-7: STATIC & DYNAMIC PAGES MANAGEMENT TEST SUITE');
  console.log('================================================================\n');

  const { db } = await import('../src/db');
  const schema = await import('../src/db/schema');
  const { pages, users, contentRevisions } = schema;
  const { workflowService } = await import('../src/services/workflow.service');
  const { ContentType, WorkflowStatus } = await import('../src/lib/workflow/types');
  const { Role, Permission } = await import('../src/lib/auth/rbac');
  const { PageRouteType, computePagePath, classifyPageRoute, validatePageRoutePolicy } = await import('../src/lib/routing/page-route-policy');
  const { sanitizeHtml } = await import('../src/lib/security/html-sanitizer');
  const { eq, and, sql } = await import('drizzle-orm');

  // Provision valid test users in DB
  const [superAdminDb] = await db
    .insert(users)
    .values({
      email: 'admin-cms7-test@doctorcheck.vn',
      passwordHash: 'dummy-hash',
      fullName: 'Super Admin CMS-7',
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
      email: 'editor-cms7-test@doctorcheck.vn',
      passwordHash: 'dummy-hash',
      fullName: 'Editor CMS-7',
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
      email: 'reviewer-cms7-test@doctorcheck.vn',
      passwordHash: 'dummy-hash',
      fullName: 'Reviewer CMS-7',
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
      Permission.PAGE_READ,
      Permission.PAGE_EDIT,
    ],
  };

  const reviewerContext = {
    userId: reviewerDb.id,
    userEmail: reviewerDb.email,
    roles: [Role.ADMIN],
    permissions: [
      Permission.PAGE_READ,
      Permission.PAGE_EDIT,
      Permission.PAGE_PUBLISH,
    ],
  };

  const testPageId = `test-page-${Date.now()}`;
  const testPageSlug = `trang-thu-nghiem-cms7-${Date.now()}`;
  const testEndoSlug = `noi-soi-thu-nghiem-cms7-${Date.now()}`;

  // Initial cleanup of any stale test fixtures
  await db.delete(pages).where(sql`id LIKE 'test-page-%' OR id LIKE 'page-col-%'`);
  await db.delete(contentRevisions).where(sql`entity_id LIKE 'test-page-%' OR entity_id LIKE 'page-col-%'`);

  try {
    // -------------------------------------------------------------------------
    // SUITE 1: Baseline Page Inventory & SHA-256 Checksum Snapshot
    // -------------------------------------------------------------------------
    console.log('--- SUITE 1: Baseline Page Inventory & Checksums ---');
    const initialPages = await db.select().from(pages);

    if (initialPages.length === 55) {
      pass('PageInventory > Exactly 55 authentic pages present in baseline database');
    } else {
      fail(`PageInventory > Expected 55 pages, found ${initialPages.length}`);
    }

    const rootPages = initialPages.filter((p: any) => classifyPageRoute(p.isRoot, p.subpath, p.status, p.slug) === PageRouteType.ROOT);
    const endoscopyPages = initialPages.filter((p: any) => classifyPageRoute(p.isRoot, p.subpath, p.status, p.slug) === PageRouteType.ENDOSCOPY_CHILD);
    const internalOrOther = initialPages.filter((p: any) => classifyPageRoute(p.isRoot, p.subpath, p.status, p.slug) === PageRouteType.INTERNAL);

    if (rootPages.length === 32) {
      pass('PageInventory > Exactly 32 root pages classified via PageRoutePolicy');
    } else {
      fail(`PageInventory > Expected 32 root pages, found ${rootPages.length}`);
    }

    if (endoscopyPages.length === 19) {
      pass('PageInventory > Exactly 19 endoscopy subpages classified via PageRoutePolicy');
    } else {
      fail(`PageInventory > Expected 19 endoscopy subpages, found ${endoscopyPages.length}`);
    }

    if (internalOrOther.length === 4) {
      pass('PageInventory > Exactly 4 internal / collision stubs classified via PageRoutePolicy');
    } else {
      fail(`PageInventory > Expected 4 internal/stubs, found ${internalOrOther.length}`);
    }

    // Capture baseline checksums of all 55 pages
    const baselineChecksums = new Map<string, string>();
    for (const p of initialPages) {
      baselineChecksums.set(p.id, calculateSha256(p.contentHtml || ''));
    }
    pass(`PageChecksums > Recorded SHA-256 content hashes for ${baselineChecksums.size} baseline pages`);

    // -------------------------------------------------------------------------
    // SUITE 2: Route Policy & Canonical Path Calculations
    // -------------------------------------------------------------------------
    console.log('\n--- SUITE 2: Route Policy & Path Calculation ---');
    const rootPath = computePagePath({
      routeType: PageRouteType.ROOT,
      slug: 've-doctor-check',
      subpath: null,
    });
    if (rootPath === '/ve-doctor-check/') {
      pass('RoutePolicy > Root route computes to /ve-doctor-check/');
    } else {
      fail(`RoutePolicy > Expected /ve-doctor-check/, got ${rootPath}`);
    }

    const endoPath = computePagePath({
      routeType: PageRouteType.ENDOSCOPY_CHILD,
      slug: 'quy-trinh-noi-soi-da-day',
      subpath: 'quy-trinh-noi-soi-da-day',
    });
    if (endoPath === '/trung-tam-noi-soi-tieu-hoa-doctor-check/quy-trinh-noi-soi-da-day/') {
      pass('RoutePolicy > Endoscopy child route computes to /trung-tam-noi-soi-tieu-hoa-doctor-check/quy-trinh-noi-soi-da-day/');
    } else {
      fail(`RoutePolicy > Expected endoscopy child path, got ${endoPath}`);
    }

    const internalPath = computePagePath({
      routeType: PageRouteType.INTERNAL,
      slug: 'chinh-sach-bao-mat',
      subpath: null,
    });
    if (internalPath === '/chinh-sach-bao-mat/') {
      pass('RoutePolicy > Internal route computes to /chinh-sach-bao-mat/');
    } else {
      fail(`RoutePolicy > Expected internal path, got ${internalPath}`);
    }

    // Validate invalid arbitrary parent / namespace rejection
    const invalidRoutePolicyRes = validatePageRoutePolicy({
      routeType: 'UNSUPPORTED_TYPE' as any,
      slug: 'hack-page',
      subpath: 'arbitrary/nested/path',
    });
    if (!invalidRoutePolicyRes.isValid) {
      pass('RoutePolicy > Arbitrary unsupported parent namespace rejected by policy validator');
    } else {
      fail('RoutePolicy > Policy validator allowed arbitrary namespace!');
    }

    // -------------------------------------------------------------------------
    // SUITE 3: Draft Isolation & Zero Canonical Mutation
    // -------------------------------------------------------------------------
    console.log('\n--- SUITE 3: Draft Isolation & Zero Canonical Mutation ---');
    const pageDraftRes = await workflowService.createDraftRevision(
      ContentType.PAGE,
      testPageId,
      {
        title: 'Trang Thử Nghiệm CMS-7',
        slug: testPageSlug,
        routeType: PageRouteType.ROOT,
        subpath: null,
        isRoot: true,
        excerpt: 'Tóm tắt trang thử nghiệm CMS-7',
        contentHtml: '<h2>Nội dung trang thử nghiệm</h2><p>Đoạn văn thử nghiệm.</p>',
        featuredImageUrl: '/sites/doctorcheck-vn/root/images/hero.webp',
        seoTitle: 'Trang Thử Nghiệm CMS-7 | DoctorCheck',
        seoDescription: 'Tóm tắt SEO trang thử nghiệm',
      },
      editorContext,
      { title: 'Trang Thử Nghiệm CMS-7', changeSummary: 'Khởi tạo trang tĩnh nháp' }
    );

    if (pageDraftRes.success && pageDraftRes.data) {
      pass('PageDraft > Created page draft revision in content_revisions');
    } else {
      fail('PageDraft > Failed to create page draft revision', pageDraftRes.error);
    }

    // Check that canonical pages table has NO new record
    const canonicalPageBefore = await db.select().from(pages).where(eq(pages.id, testPageId));
    if (canonicalPageBefore.length === 0) {
      pass('PageDraft > Canonical pages table is 100% UNTOUCHED on Save Draft (0 leak)');
    } else {
      fail('PageDraft > Canonical pages table was prematurely mutated!');
    }

    // -------------------------------------------------------------------------
    // SUITE 4: Cross-Domain Collision Protection
    // -------------------------------------------------------------------------
    console.log('\n--- SUITE 4: Cross-Domain Collision Protection ---');
    // Test 1: Collision with protected root symptom article (dau-thuong-vi)
    const collisionDauThuongViDraft = await workflowService.createDraftRevision(
      ContentType.PAGE,
      `page-col-${Date.now()}-1`,
      {
        title: 'Đau Thượng Vị Test',
        slug: 'dau-thuong-vi',
        routeType: PageRouteType.ROOT,
        subpath: null,
        isRoot: true,
        contentHtml: '<p>Collision test</p>',
      },
      superAdminContext
    );

    const publishCol1Res = await workflowService.publishRevision(collisionDauThuongViDraft.data!.id, superAdminContext);
    if (!publishCol1Res.success && publishCol1Res.error?.includes('bảo vệ')) {
      pass('Collision > Blocked publishing root page colliding with protected symptom article (dau-thuong-vi)');
    } else {
      fail('Collision > Allowed collision with dau-thuong-vi!');
    }

    // Test 2: Collision with protected nested category (kien-thuc-ung-thu-da-day)
    const collisionKienThucDraft = await workflowService.createDraftRevision(
      ContentType.PAGE,
      `page-col-${Date.now()}-2`,
      {
        title: 'Kiến Thức Ung Thư Dạ Dày Test',
        slug: 'kien-thuc-ung-thu-da-day',
        routeType: PageRouteType.ROOT,
        subpath: null,
        isRoot: true,
        contentHtml: '<p>Collision test</p>',
      },
      superAdminContext
    );

    const publishCol2Res = await workflowService.publishRevision(collisionKienThucDraft.data!.id, superAdminContext);
    if (!publishCol2Res.success && publishCol2Res.error?.includes('bảo vệ')) {
      pass('Collision > Blocked publishing root page colliding with protected category (kien-thuc-ung-thu-da-day)');
    } else {
      fail('Collision > Allowed collision with kien-thuc-ung-thu-da-day!');
    }

    // Test 3: Collision with existing doctor slug (trinh-ai-nhi)
    const collisionDoctorDraft = await workflowService.createDraftRevision(
      ContentType.PAGE,
      `page-col-${Date.now()}-3`,
      {
        title: 'BS Trịnh Ái Nhi Page',
        slug: 'trinh-ai-nhi',
        routeType: PageRouteType.ROOT,
        subpath: null,
        isRoot: true,
        contentHtml: '<p>Collision test</p>',
      },
      superAdminContext
    );

    const publishCol3Res = await workflowService.publishRevision(collisionDoctorDraft.data!.id, superAdminContext);
    if (!publishCol3Res.success && (publishCol3Res.error?.includes('bác sĩ') || publishCol3Res.error?.includes('trùng'))) {
      pass('Collision > Blocked publishing page colliding with active doctor profile (trinh-ai-nhi)');
    } else {
      fail('Collision > Allowed collision with doctor profile!');
    }

    // Clean up collision drafts
    await db.delete(contentRevisions).where(sql`entity_id LIKE 'page-col-%'`);

    // -------------------------------------------------------------------------
    // SUITE 5: Stored XSS Sanitization
    // -------------------------------------------------------------------------
    console.log('\n--- SUITE 5: Stored XSS Sanitization ---');
    const maliciousPayload = `
      <h1>Tiêu đề hợp lệ</h1>
      <script>alert("xss-page")</script>
      <p>Nội dung có <a href="javascript:alert('steal')">liên kết độc hại</a></p>
      <img src="valid.jpg" onerror="alert('image-xss')" />
      <iframe src="http://evil.com"></iframe>
    `;

    const sanitizedHtml = sanitizeHtml(maliciousPayload);
    const hasScript = sanitizedHtml.includes('<script>');
    const hasJsUrl = sanitizedHtml.includes('javascript:');
    const hasOnError = sanitizedHtml.includes('onerror');
    const hasIframe = sanitizedHtml.includes('<iframe');

    if (!hasScript && !hasJsUrl && !hasOnError && !hasIframe) {
      pass('XSS > Stripped <script>, javascript:, onerror, and <iframe> from page HTML');
    } else {
      fail('XSS > Stored XSS sanitizer failed to strip malicious tags!', sanitizedHtml);
    }

    // -------------------------------------------------------------------------
    // SUITE 6: Optimistic Concurrency Control (409 Conflict)
    // -------------------------------------------------------------------------
    console.log('\n--- SUITE 6: Optimistic Concurrency Control ---');
    const revId = pageDraftRes.data!.id;

    // Stale update with mismatched expectedVersion
    const staleUpdateRes = await workflowService.updateDraftRevision(
      revId,
      999, // Stale version
      {
        title: 'Trang Thử Nghiệm (Stale Attempt)',
        slug: testPageSlug,
        routeType: PageRouteType.ROOT,
        subpath: null,
        isRoot: true,
        contentHtml: '<p>Stale content</p>',
      },
      editorContext
    );

    if (!staleUpdateRes.success && staleUpdateRes.conflict) {
      pass('Concurrency > Stale update with mismatched expectedVersion returned 409 conflict');
    } else {
      fail('Concurrency > Stale update was unexpectedly permitted!');
    }

    // Valid update with matching expectedVersion
    const validUpdateRes = await workflowService.updateDraftRevision(
      revId,
      1, // Correct version
      {
        title: 'Trang Thử Nghiệm CMS-7 (Cập Nhật)',
        slug: testPageSlug,
        routeType: PageRouteType.ROOT,
        subpath: null,
        isRoot: true,
        excerpt: 'Đã cập nhật tóm tắt',
        contentHtml: '<h2>Nội dung cập nhật</h2><p>Đoạn văn mới an toàn.</p>',
      },
      editorContext
    );

    if (validUpdateRes.success && validUpdateRes.data?.version === 2) {
      pass('Concurrency > Valid update incremented revision version to 2');
    } else {
      fail('Concurrency > Valid update failed', validUpdateRes.error);
    }

    // -------------------------------------------------------------------------
    // SUITE 7: Full Workflow & Atomic Publishing
    // -------------------------------------------------------------------------
    console.log('\n--- SUITE 7: Full Workflow & Atomic Publishing ---');
    // Editor submits for review
    const submitRes = await workflowService.submitForReview(revId, editorContext);
    if (submitRes.success && submitRes.data?.status === WorkflowStatus.IN_REVIEW) {
      pass('PageWorkflow > Editor submitted draft -> status IN_REVIEW');
    } else {
      fail('PageWorkflow > Submit for review failed', submitRes.error);
    }

    // Editor lacks page.publish permission -> direct publish should fail
    const unauthorizedPublishRes = await workflowService.publishRevision(revId, editorContext);
    if (!unauthorizedPublishRes.success) {
      pass('PageWorkflow > Editor lacking page.publish permission is DENIED direct publish (RBAC Guard)');
    } else {
      fail('PageWorkflow > Editor unexpectedly published page without permission!');
    }

    // Reviewer approves
    const approveRes = await workflowService.approveRevision(revId, reviewerContext, {
      medicalReviewNotes: 'Nội dung trang tĩnh đã được kiểm duyệt hợp lệ.',
    });
    if (approveRes.success && approveRes.data?.status === WorkflowStatus.APPROVED) {
      pass('PageWorkflow > Reviewer approved revision -> status APPROVED');
    } else {
      fail('PageWorkflow > Reviewer approve failed', approveRes.error);
    }

    // Reviewer publishes
    const publishRes = await workflowService.publishRevision(revId, reviewerContext);
    if (publishRes.success && publishRes.data?.status === WorkflowStatus.PUBLISHED) {
      pass('PageWorkflow > Atomic publish succeeded -> status PUBLISHED');
    } else {
      fail('PageWorkflow > Publish revision failed', publishRes.error);
    }

    // Verify canonical record in `pages` table
    const canonicalPageAfter = await db.select().from(pages).where(eq(pages.id, testPageId));
    if (
      canonicalPageAfter.length === 1 &&
      canonicalPageAfter[0].title === 'Trang Thử Nghiệm CMS-7 (Cập Nhật)' &&
      canonicalPageAfter[0].slug === testPageSlug &&
      canonicalPageAfter[0].isRoot === true
    ) {
      pass('PagePublisher > Canonical page record created atomically with exact fields');
    } else {
      fail('PagePublisher > Canonical page record missing or mismatch');
    }

    // -------------------------------------------------------------------------
    // SUITE 8: Nested / Endoscopy Subpage Lifecycle
    // -------------------------------------------------------------------------
    console.log('\n--- SUITE 8: Nested Endoscopy Subpage Lifecycle ---');
    const endoPageId = `test-page-endo-${Date.now()}`;
    const endoDraftRes = await workflowService.createDraftRevision(
      ContentType.PAGE,
      endoPageId,
      {
        title: 'Quy Trình Nội Soi Thử Nghiệm',
        slug: testEndoSlug,
        routeType: PageRouteType.ENDOSCOPY_CHILD,
        subpath: 'trung-tam-noi-soi-tieu-hoa-doctor-check',
        isRoot: false,
        excerpt: 'Tóm tắt nội soi',
        contentHtml: '<h3>Nội dung nội soi tiêu hóa</h3><p>Mô tả chi tiết quy trình.</p>',
      },
      superAdminContext
    );

    const endoRevId = endoDraftRes.data!.id;
    await workflowService.submitForReview(endoRevId, superAdminContext);
    await workflowService.approveRevision(endoRevId, superAdminContext);
    const publishEndoRes = await workflowService.publishRevision(endoRevId, superAdminContext);

    if (publishEndoRes.success) {
      pass('EndoscopyPage > Successfully published nested endoscopy subpage atomically');
    } else {
      fail('EndoscopyPage > Failed to publish endoscopy subpage', publishEndoRes.error);
    }

    const canonicalEndo = await db.select().from(pages).where(eq(pages.id, endoPageId));
    if (
      canonicalEndo.length === 1 &&
      canonicalEndo[0].subpath === 'trung-tam-noi-soi-tieu-hoa-doctor-check' &&
      canonicalEndo[0].isRoot === false
    ) {
      pass('EndoscopyPage > Canonical nested page contains correct subpath and isRoot=false');
    } else {
      fail('EndoscopyPage > Nested page subpath or isRoot incorrect');
    }

    // -------------------------------------------------------------------------
    // SUITE 9: Revision History & Restore Semantics
    // -------------------------------------------------------------------------
    console.log('\n--- SUITE 9: Revision History & Restore Semantics ---');
    const revList = await db.select().from(contentRevisions).where(eq(contentRevisions.entityId, testPageId));
    if (revList.length >= 1) {
      pass(`PageHistory > Queryable revisions recorded for test page (${revList.length} revisions)`);
    } else {
      fail('PageHistory > No revisions found for test page');
    }

    const firstRevision = revList[0];
    const restoreRes = await workflowService.restoreRevision(firstRevision.id, editorContext);
    if (restoreRes.success && restoreRes.data?.status === WorkflowStatus.DRAFT) {
      pass('PageRestore > Restored historical revision into a new DRAFT without mutating canonical state');
    } else {
      fail('PageRestore > Failed to restore revision', restoreRes.error);
    }

    // -------------------------------------------------------------------------
    // SUITE 10: Cleanup & Zero Passive Drift Check
    // -------------------------------------------------------------------------
    console.log('\n--- SUITE 10: Cleanup & Zero Passive Drift Check ---');
    // Clean up test pages
    await db.delete(pages).where(eq(pages.id, testPageId));
    await db.delete(pages).where(eq(pages.id, endoPageId));
    await db.delete(contentRevisions).where(eq(contentRevisions.entityId, testPageId));
    await db.delete(contentRevisions).where(eq(contentRevisions.entityId, endoPageId));

    // Verify all baseline 55 pages are present and untouched
    const finalPages = await db.select().from(pages);
    if (finalPages.length === 55) {
      pass('Fidelity > Final page count matches baseline exactly (55/55)');
    } else {
      fail(`Fidelity > Expected 55 pages, found ${finalPages.length}`);
    }

    let checksumMismatches = 0;
    let routeMismatches = 0;

    for (const p of finalPages) {
      const initialHash = baselineChecksums.get(p.id);
      const currentHash = calculateSha256(p.contentHtml || '');
      if (!initialHash || initialHash !== currentHash) {
        checksumMismatches++;
        console.error(`  [MISMATCH] Page ${p.id} (${p.slug}) content SHA-256 drift!`);
      }
    }

    if (checksumMismatches === 0) {
      pass('Fidelity > Untouched page HTML checksum mismatches = 0 (100% SHA-256 fidelity)');
    } else {
      fail(`Fidelity > Found ${checksumMismatches} page HTML checksum mismatches!`);
    }

    // Verify root and endoscopy counts remain unchanged
    const finalRootCount = finalPages.filter((p: any) => classifyPageRoute(p.isRoot, p.subpath, p.status, p.slug) === PageRouteType.ROOT).length;
    const finalEndoCount = finalPages.filter((p: any) => classifyPageRoute(p.isRoot, p.subpath, p.status, p.slug) === PageRouteType.ENDOSCOPY_CHILD).length;
    const finalInternalCount = finalPages.filter((p: any) => classifyPageRoute(p.isRoot, p.subpath, p.status, p.slug) === PageRouteType.INTERNAL).length;

    if (finalRootCount === 32) {
      pass('Fidelity > Root pages count unchanged (32/32)');
    } else {
      fail(`Fidelity > Root pages count drift (${finalRootCount}/32)`);
    }

    if (finalEndoCount === 19) {
      pass('Fidelity > Endoscopy subpages count unchanged (19/19)');
    } else {
      fail(`Fidelity > Endoscopy subpages count drift (${finalEndoCount}/19)`);
    }

    if (finalInternalCount === 4) {
      pass('Fidelity > Internal pages count unchanged (4/4)');
    } else {
      fail(`Fidelity > Internal pages count drift (${finalInternalCount}/4)`);
    }
  } catch (err) {
    console.error('CRITICAL UNHANDLED ERROR in test suite:', err);
    failedTests++;
  }

  console.log('\n================================================================');
  console.log(`TOTAL TESTS: ${totalTests} | PASSED: ${passedTests} | FAILED: ${failedTests}`);
  console.log('================================================================\n');

  if (failedTests > 0) {
    process.exit(1);
  }
}

runCms7Tests().catch((e) => {
  console.error(e);
  process.exit(1);
});
