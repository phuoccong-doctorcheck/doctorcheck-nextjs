import * as dotenv from 'dotenv';

// Stub 'server-only' for Node standalone execution
require.cache[require.resolve('server-only')] = {
  id: require.resolve('server-only'),
  filename: require.resolve('server-only'),
  loaded: true,
  exports: {},
} as unknown as NodeModule;

dotenv.config({ path: '.env.local' });

import * as crypto from 'crypto';

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

async function runCms4WorkflowTestSuite() {
  console.log('========================================================================');
  console.log('🧪 CMS-4 CONTENT WORKFLOW, REVISION HISTORY & PUBLISHING TEST SUITE');
  console.log('========================================================================\n');

  const { db } = await import('../src/db');
  const { contentRevisions } = await import('../src/db/schema/workflow');
  const { articles } = await import('../src/db/schema/articles');
  const { auditLogs } = await import('../src/db/schema/audit');
  const { media } = await import('../src/db/schema/media');
  const { users } = await import('../src/db/schema/auth');
  const { eq, and, sql } = await import('drizzle-orm');
  const { revisionRepository } = await import(
    '../src/repositories/postgres/postgres-revision.repository'
  );
  const { workflowService } = await import('../src/services/workflow.service');
  const { revalidationService } = await import('../src/services/revalidation.service');
  const {
    ContentType,
    WorkflowStatus,
    WorkflowAction,
  } = await import('../src/lib/workflow/types');
  const { DOMAIN_WORKFLOW_REGISTRY, isValidTransition } = await import('../src/lib/workflow/registry');
  const { AuditAction } = await import('../src/lib/auth/audit');
  const { Role, Permission, resolvePermissionsForRoles } = await import(
    '../src/lib/auth/rbac'
  );
  const { articleRepository, pageRepository, doctorRepository, packageRepository } = await import(
    '../src/repositories'
  );
  const { resolveContent } = await import('../src/lib/routing/resolve-content');

  // Provision or fetch test users in DB to satisfy foreign keys
  const [superAdminDb] = await db
    .insert(users)
    .values({
      email: 'admin-workflow-test@doctorcheck.vn',
      passwordHash: 'dummy-hash',
      fullName: 'Super Admin Workflow Test',
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
      email: 'editor-workflow-test@doctorcheck.vn',
      passwordHash: 'dummy-hash',
      fullName: 'Editor Workflow Test',
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
      email: 'reviewer-workflow-test@doctorcheck.vn',
      passwordHash: 'dummy-hash',
      fullName: 'Medical Reviewer Workflow Test',
      isActive: true,
    })
    .onConflictDoUpdate({
      target: users.email,
      set: { isActive: true },
    })
    .returning();

  // Test User Contexts
  const superAdminUser = {
    userId: superAdminDb.id,
    userEmail: superAdminDb.email,
    roles: [Role.SUPER_ADMIN],
    permissions: resolvePermissionsForRoles([Role.SUPER_ADMIN]),
  };

  const editorUser = {
    userId: editorDb.id,
    userEmail: editorDb.email,
    roles: [Role.EDITOR],
    permissions: resolvePermissionsForRoles([Role.EDITOR]),
  };

  const medicalReviewerUser = {
    userId: reviewerDb.id,
    userEmail: reviewerDb.email,
    roles: [Role.MEDICAL_REVIEWER],
    permissions: resolvePermissionsForRoles([Role.MEDICAL_REVIEWER]),
  };

  try {
    // Clean up any test artifacts from prior runs before asserting baseline counts
    await db.delete(articles).where(sql`${articles.id} LIKE 'art-workflow-test-%'`);
    await db.delete(articles).where(sql`${articles.id} LIKE 'art-colliding-%'`);
    await db.delete(articles).where(sql`${articles.id} LIKE 'art-fake-media-%'`);
    await db.delete(contentRevisions).where(sql`${contentRevisions.entityId} LIKE 'art-%'`);

    // -------------------------------------------------------------------------
    // TEST SUITE 1: Database Schema & Baseline Content Preservation
    // -------------------------------------------------------------------------
    console.log('📦 1. Database Schema & Baseline Content Preservation:');

    const [tableCheck] = await db.select({ count: sql<number>`count(*)::int` }).from(contentRevisions);
    assert(tableCheck !== undefined, 'PostgreSQL table `content_revisions` is active and accessible');

    // Verify existing baseline content is unchanged and 100% published
    const dbArticles = await db.select().from(articles);
    assert(dbArticles.length === 108, `All 108 medical articles intact in PostgreSQL (Actual: ${dbArticles.length})`);
    assert(
      dbArticles.every((a) => a.status === 'published'),
      'All 108 articles maintain status: published in PostgreSQL'
    );

    const allPages = await pageRepository.getAll();
    assert(allPages.length === 55, `All 55 pages intact (Actual: ${allPages.length})`);

    const allDoctors = await doctorRepository.getAll();
    assert(allDoctors.length === 7, `All 7 doctors intact (Actual: ${allDoctors.length})`);

    const allPackages = await packageRepository.getAll();
    assert(allPackages.length === 9, `All 9 packages intact (Actual: ${allPackages.length})`);

    // -------------------------------------------------------------------------
    // TEST SUITE 2: Workflow State Machine & Transition Rules
    // -------------------------------------------------------------------------
    console.log('\n📦 2. Workflow State Machine & Transition Rules:');

    // Valid transitions
    assert(
      isValidTransition(WorkflowStatus.DRAFT, WorkflowStatus.IN_REVIEW, WorkflowAction.SUBMIT_REVIEW),
      'Valid transition: DRAFT -> IN_REVIEW (submit_review)'
    );
    assert(
      isValidTransition(WorkflowStatus.IN_REVIEW, WorkflowStatus.APPROVED, WorkflowAction.APPROVE),
      'Valid transition: IN_REVIEW -> APPROVED (approve)'
    );
    assert(
      isValidTransition(WorkflowStatus.APPROVED, WorkflowStatus.PUBLISHED, WorkflowAction.PUBLISH),
      'Valid transition: APPROVED -> PUBLISHED (publish)'
    );
    assert(
      isValidTransition(WorkflowStatus.IN_REVIEW, WorkflowStatus.DRAFT, WorkflowAction.RETURN_TO_DRAFT),
      'Valid transition: IN_REVIEW -> DRAFT (return_to_draft)'
    );
    assert(
      isValidTransition(WorkflowStatus.PUBLISHED, WorkflowStatus.ARCHIVED, WorkflowAction.ARCHIVE),
      'Valid transition: PUBLISHED -> ARCHIVED (archive)'
    );
    assert(
      isValidTransition(WorkflowStatus.ARCHIVED, WorkflowStatus.DRAFT, WorkflowAction.RESTORE),
      'Valid transition: ARCHIVED -> DRAFT (restore)'
    );

    // Invalid transitions
    assert(
      !isValidTransition(WorkflowStatus.DRAFT, WorkflowStatus.APPROVED, WorkflowAction.APPROVE),
      'Invalid transition rejected: DRAFT -> APPROVED'
    );
    assert(
      !isValidTransition(WorkflowStatus.IN_REVIEW, WorkflowStatus.ARCHIVED, WorkflowAction.ARCHIVE),
      'Invalid transition rejected: IN_REVIEW -> ARCHIVED'
    );

    // -------------------------------------------------------------------------
    // TEST SUITE 3: Draft Creation & Optimistic Concurrency Control
    // -------------------------------------------------------------------------
    console.log('\n📦 3. Draft Creation & Optimistic Concurrency Control:');

    const testEntityId = `art-workflow-test-${Date.now()}`;
    const initialPayload = {
      title: 'Bản Nháp Thử Nghiệm Workflow Tiêu Hóa',
      slug: `thu-nghiem-workflow-${Date.now()}`,
      excerpt: 'Tóm tắt bài viết thử nghiệm hệ thống CMS-4',
      contentHtml: '<p>Nội dung chuyên khoa về nội soi đại tràng và dạ dày.</p>',
      authorName: 'Bác sĩ CKII Nguyễn Văn A',
      authorTitle: 'Chuyên gia Tiêu hóa',
      categoryIds: ['noi-soi-da-day'],
      toc: [{ id: 'sec-1', text: 'Giới thiệu', level: 2 }],
    };

    // 3.1 Editor creates draft
    const createResult = await workflowService.createDraftRevision(
      ContentType.ARTICLE,
      testEntityId,
      initialPayload,
      editorUser,
      { changeSummary: 'Khởi tạo bài viết' }
    );

    assert(createResult.success && Boolean(createResult.data?.id), 'Editor successfully created draft revision 1');
    const rev1 = createResult.data!;
    assert(rev1.revisionNumber === 1, 'Revision number is 1');
    assert(rev1.version === 1, 'Initial concurrency version is 1');
    assert(rev1.status === WorkflowStatus.DRAFT, 'Revision status is DRAFT');

    // 3.2 Editor updates draft (version 1 -> 2)
    const updateResult1 = await workflowService.updateDraftRevision(
      rev1.id,
      1, // expectedVersion = 1
      {
        ...initialPayload,
        title: 'Bản Nháp Cập Nhật Lần 1',
      },
      editorUser,
      { changeSummary: 'Cập nhật tiêu đề' }
    );

    assert(updateResult1.success && Boolean(updateResult1.data), 'Update with valid version 1 succeeded');
    assert(updateResult1.data?.version === 2, 'Version incremented to 2');

    // 3.3 Stale update attempt (expecting version 1 instead of 2) -> CONFLICT
    const staleUpdateResult = await workflowService.updateDraftRevision(
      rev1.id,
      1, // Stale version!
      {
        ...initialPayload,
        title: 'Cập nhật bị đè từ phiên bản cũ',
      },
      editorUser
    );

    assert(
      !staleUpdateResult.success && Boolean(staleUpdateResult.conflict),
      'Stale update with version 1 returned 409 Concurrency Conflict'
    );
    assert(
      staleUpdateResult.conflict?.currentVersion === 2,
      `Conflict reports actual current version: ${staleUpdateResult.conflict?.currentVersion}`
    );

    // 3.4 Fresh update with version 2 -> SUCCEEDS (version 2 -> 3)
    const updateResult2 = await workflowService.updateDraftRevision(
      rev1.id,
      2, // Fresh version = 2
      {
        ...initialPayload,
        title: 'Bản Nháp Hoàn Chỉnh Trước Khi Duyệt',
      },
      editorUser
    );

    assert(updateResult2.success && updateResult2.data?.version === 3, 'Fresh update with version 2 succeeded (now version 3)');

    // -------------------------------------------------------------------------
    // TEST SUITE 4: Role-Based Workflow & Medical Review Policy
    // -------------------------------------------------------------------------
    console.log('\n📦 4. Role-Based Workflow & Medical Review Policy:');

    // 4.1 Editor submits for review
    const submitResult = await workflowService.submitForReview(rev1.id, editorUser);
    assert(submitResult.success && submitResult.data?.status === WorkflowStatus.IN_REVIEW, 'Editor submitted draft for review (IN_REVIEW)');

    // 4.2 Editor attempts to directly publish medical content -> DENIED
    const editorPublishAttempt = await workflowService.publishRevision(rev1.id, editorUser);
    assert(
      !editorPublishAttempt.success && Boolean(editorPublishAttempt.error?.includes('quyền')),
      'Editor directly publishing medical content is strictly DENIED'
    );

    // 4.3 Medical Reviewer approves content
    const approveResult = await workflowService.approveRevision(rev1.id, medicalReviewerUser, {
      medicalReviewNotes: 'Đã thẩm định thông tin y khoa chính xác theo phác đồ Bộ Y Tế.',
    });
    assert(
      approveResult.success && approveResult.data?.status === WorkflowStatus.APPROVED,
      'Medical Reviewer successfully approved revision (APPROVED)'
    );
    assert(
      Boolean(approveResult.data?.reviewedBy && approveResult.data?.medicalReviewNotes),
      'Medical review metadata (reviewedBy, reviewedAt, notes) recorded'
    );

    // -------------------------------------------------------------------------
    // TEST SUITE 5: Atomic Publishing & Canonical Isolation
    // -------------------------------------------------------------------------
    console.log('\n📦 5. Atomic Publishing & Canonical Isolation:');

    // Verify canonical table does not contain testEntityId before publish
    const preCheckArt = await db.select().from(articles).where(eq(articles.id, testEntityId));
    assert(preCheckArt.length === 0, 'Canonical articles table is untouched prior to publish (Zero draft leak)');

    // Super Admin publishes approved revision
    const publishResult = await workflowService.publishRevision(rev1.id, superAdminUser);
    assert(publishResult.success, 'Publish transaction executed successfully');
    assert(publishResult.publishStatus === 'PUBLISH_SUCCEEDED', 'Publish status reported: PUBLISH_SUCCEEDED');
    assert(
      publishResult.data?.status === WorkflowStatus.PUBLISHED,
      'Revision marked as PUBLISHED'
    );

    // Verify canonical articles table was mutated atomically
    const [publishedArt] = await db.select().from(articles).where(eq(articles.id, testEntityId));
    assert(Boolean(publishedArt), 'Canonical articles table now contains published article row');
    assert(
      publishedArt?.title === 'Bản Nháp Hoàn Chỉnh Trước Khi Duyệt',
      'Canonical article row contains exact validated snapshot data'
    );

    // Verify audit log participated in the transaction
    const [publishAudit] = await db
      .select()
      .from(auditLogs)
      .where(and(eq(auditLogs.entityId, testEntityId), eq(auditLogs.action, AuditAction.CONTENT_PUBLISHED)));
    assert(Boolean(publishAudit), 'Audit log entry CONTENT_PUBLISHED persisted');

    // -------------------------------------------------------------------------
    // TEST SUITE 6: Editing Published Content (Creates Draft Revision N+1)
    // -------------------------------------------------------------------------
    console.log('\n📦 6. Editing Published Content (Revision N+1 Invariant):');

    // Editor creates revision 2 (draft edit of published article)
    const rev2Result = await workflowService.createDraftRevision(
      ContentType.ARTICLE,
      testEntityId,
      {
        ...initialPayload,
        title: 'Tiêu Đề Bản Nháp Mới (Revision 2)',
      },
      editorUser,
      { changeSummary: 'Bổ sung thông tin nội soi' }
    );

    assert(rev2Result.success && Boolean(rev2Result.data), 'Creating draft edit of published content succeeded');
    const rev2 = rev2Result.data!;
    assert(rev2.revisionNumber === 2, 'Revision number is 2');
    assert(rev2.status === WorkflowStatus.DRAFT, 'Revision 2 status is DRAFT');

    // CRITICAL: Verify canonical published table STILL has Revision 1 title
    const [liveCanonical] = await db.select().from(articles).where(eq(articles.id, testEntityId));
    assert(
      liveCanonical?.title === 'Bản Nháp Hoàn Chỉnh Trước Khi Duyệt',
      'Canonical live published article is UNCHANGED while Revision 2 is in draft'
    );

    // -------------------------------------------------------------------------
    // TEST SUITE 7: Restore Semantics (History Preservation)
    // -------------------------------------------------------------------------
    console.log('\n📦 7. Restore Semantics & History Preservation:');

    // Restore Revision 1 -> Should create NEW Revision 3 based on Revision 1
    const restoreResult = await workflowService.restoreRevision(rev1.id, editorUser);
    assert(restoreResult.success && Boolean(restoreResult.data), 'Restore operation succeeded');
    const rev3 = restoreResult.data!;
    assert(rev3.revisionNumber === 3, 'Restored content assigned new Revision Number 3');
    assert(
      Boolean(rev3.changeSummary?.includes('Khôi phục từ Phiên bản 1')),
      'Change summary documents historical origin'
    );

    // Verify Revision 1 and Revision 2 records remain intact
    const allRevs = await revisionRepository.listByEntity(ContentType.ARTICLE, testEntityId);
    assert(allRevs.length === 3, `All 3 revisions preserved in history (Actual: ${allRevs.length})`);

    // -------------------------------------------------------------------------
    // TEST SUITE 8: Pre-Publish Validations (Collisions & Media)
    // -------------------------------------------------------------------------
    console.log('\n📦 8. Pre-Publish Validations (Collisions & Media):');

    // 8.1 Colliding with an existing doctor slug
    const collidingPayload = {
      ...initialPayload,
      slug: 'trinh-ai-nhi', // Existing doctor slug
    };

    const collisionDraft = await workflowService.createDraftRevision(
      ContentType.ARTICLE,
      `art-colliding-${Date.now()}`,
      collidingPayload,
      editorUser
    );

    if (collisionDraft.data) {
      // Direct publish by super admin should fail due to pre-publish collision check
      const pubCollision = await workflowService.publishRevision(collisionDraft.data.id, superAdminUser);
      assert(
        !pubCollision.success && Boolean(pubCollision.error?.includes('Bác sĩ')),
        'Publishing slug colliding with Doctor is strictly BLOCKED'
      );
    }

    // 8.2 Referencing non-existent media ID (valid UUIDv4 format, but not in media DB)
    const fakeMediaPayload = {
      ...initialPayload,
      slug: `fake-media-test-${Date.now()}`,
      featuredImageId: crypto.randomUUID(),
    };

    const fakeMediaDraft = await workflowService.createDraftRevision(
      ContentType.ARTICLE,
      `art-fake-media-${Date.now()}`,
      fakeMediaPayload,
      editorUser
    );

    if (fakeMediaDraft.data) {
      const pubFakeMedia = await workflowService.publishRevision(fakeMediaDraft.data.id, superAdminUser);
      assert(
        !pubFakeMedia.success && Boolean(pubFakeMedia.error?.includes('Thư viện Media')),
        'Publishing with invalid Media ID is BLOCKED',
        pubFakeMedia.error || JSON.stringify(pubFakeMedia)
      );
    } else {
      assert(false, 'Publishing with invalid Media ID is BLOCKED', 'fakeMediaDraft.data was null: ' + JSON.stringify(fakeMediaDraft));
    }

    // -------------------------------------------------------------------------
    // TEST SUITE 9: Targeted Revalidation Architecture
    // -------------------------------------------------------------------------
    console.log('\n📦 9. Targeted Revalidation Architecture:');

    const revalPlan = DOMAIN_WORKFLOW_REGISTRY[ContentType.ARTICLE].getRevalidationPlan(
      'art-001',
      { slug: 'tam-soat-ung-thu-da-day' }
    );

    assert(
      revalPlan.paths.includes('/tam-soat-ung-thu-da-day'),
      'Revalidation plan contains article path'
    );
    assert(revalPlan.paths.includes('/'), 'Revalidation plan contains homepage path');
    assert(revalPlan.paths.includes('/sitemap.xml'), 'Revalidation plan contains sitemap path');

    // Clean up test article row and revisions
    await db.delete(articles).where(eq(articles.id, testEntityId));
    await db.delete(contentRevisions).where(eq(contentRevisions.entityId, testEntityId));
    await db.delete(contentRevisions).where(sql`${contentRevisions.entityId} LIKE 'art-colliding-%'`);
    await db.delete(contentRevisions).where(sql`${contentRevisions.entityId} LIKE 'art-fake-media-%'`);

    console.log('\n========================================================================');
    console.log(`🎉 CMS-4 WORKFLOW TEST SUITE RESULTS: ${passCount} PASSED, ${failCount} FAILED`);
    console.log('========================================================================\n');

    if (failCount > 0) {
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Unhandled Exception in CMS-4 Test Suite:', error);
    process.exit(1);
  }
}

runCms4WorkflowTestSuite();
