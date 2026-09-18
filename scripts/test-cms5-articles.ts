import * as dotenv from 'dotenv';

// Stub 'server-only' for Node standalone execution
require.cache[require.resolve('server-only')] = {
  id: require.resolve('server-only'),
  filename: require.resolve('server-only'),
  loaded: true,
  exports: {},
} as unknown as NodeModule;

dotenv.config({ path: '.env.local' });
dotenv.config();

interface TestResult {
  suite: string;
  name: string;
  passed: boolean;
  error?: string;
  details?: Record<string, unknown>;
}

const results: TestResult[] = [];

function assert(condition: boolean, suite: string, name: string, details?: Record<string, unknown>) {
  if (condition) {
    results.push({ suite, name, passed: true, details });
    console.log(`  ✅ [PASS] ${suite} > ${name}`);
  } else {
    results.push({ suite, name, passed: false, error: 'Assertion failed', details });
    console.error(`  ❌ [FAIL] ${suite} > ${name}`, details);
  }
}

async function runCms5Tests() {
  console.log('================================================================');
  console.log('       CMS-5 AUTOMATED VERIFICATION: ARTICLES & CATEGORIES      ');
  console.log('================================================================\n');

  const { db } = await import('../src/db');
  const schema = await import('../src/db/schema');
  const { eq, and, ilike } = await import('drizzle-orm');
  const { PostgresArticleRepository } = await import('../src/repositories/postgres/postgres-article.repository');
  const { PostgresCategoryRepository } = await import('../src/repositories/postgres/postgres-category.repository');
  const { PostgresRevisionRepository } = await import('../src/repositories/postgres/postgres-revision.repository');
  const { workflowService } = await import('../src/services/workflow.service');
  const { ContentType, WorkflowStatus } = await import('../src/lib/workflow/types');
  const { sanitizeHtml } = await import('../src/lib/security/html-sanitizer');
  const { extractTableOfContents } = await import('../src/lib/content/toc-generator');
  const { Role, resolvePermissionsForRoles } = await import('../src/lib/auth/rbac');

  const articleRepo = new PostgresArticleRepository();
  const categoryRepo = new PostgresCategoryRepository();
  const revisionRepo = new PostgresRevisionRepository();

  // Clean up any test fixtures from previous failed runs
  await db.delete(schema.categories).where(ilike(schema.categories.slug, 'test-cat-cms5-%'));

  // Provision / fetch test users with valid UUIDs
  const [editorDb] = await db
    .insert(schema.users)
    .values({
      email: 'editor-cms5-test@doctorcheck.vn',
      passwordHash: 'dummy-hash',
      fullName: 'Editor CMS-5 Test',
      isActive: true,
    })
    .onConflictDoUpdate({
      target: schema.users.email,
      set: { isActive: true },
    })
    .returning();

  const [reviewerDb] = await db
    .insert(schema.users)
    .values({
      email: 'reviewer-cms5-test@doctorcheck.vn',
      passwordHash: 'dummy-hash',
      fullName: 'Reviewer CMS-5 Test',
      isActive: true,
    })
    .onConflictDoUpdate({
      target: schema.users.email,
      set: { isActive: true },
    })
    .returning();

  const [publisherDb] = await db
    .insert(schema.users)
    .values({
      email: 'publisher-cms5-test@doctorcheck.vn',
      passwordHash: 'dummy-hash',
      fullName: 'Publisher CMS-5 Test',
      isActive: true,
    })
    .onConflictDoUpdate({
      target: schema.users.email,
      set: { isActive: true },
    })
    .returning();

  const mockEditorContext = {
    userId: editorDb.id,
    userEmail: editorDb.email,
    roles: [Role.EDITOR],
    permissions: resolvePermissionsForRoles([Role.EDITOR]),
  };

  const mockReviewerContext = {
    userId: reviewerDb.id,
    userEmail: reviewerDb.email,
    roles: [Role.MEDICAL_REVIEWER],
    permissions: resolvePermissionsForRoles([Role.MEDICAL_REVIEWER]),
  };

  const mockPublisherContext = {
    userId: publisherDb.id,
    userEmail: publisherDb.email,
    roles: [Role.ADMIN],
    permissions: resolvePermissionsForRoles([Role.ADMIN]),
  };

  const initialArticleCount = (await articleRepo.getAll()).length;
  const initialCategoryCount = (await categoryRepo.getAll()).length;

  console.log(`Initial Baseline: ${initialArticleCount} articles, ${initialCategoryCount} categories.\n`);

  // =========================================================================
  // SUITE 1: HTML Sanitization & Stored XSS Prevention
  // =========================================================================
  console.log('--- SUITE 1: HTML Sanitization & XSS Prevention ---');
  {
    const xssScriptPayload = '<p>Bệnh lý dạ dày <script>alert("XSS")</script> thường gặp</p>';
    const sanitizedScript = sanitizeHtml(xssScriptPayload);
    assert(
      !sanitizedScript.includes('<script>') && !sanitizedScript.includes('alert("XSS")') && sanitizedScript.includes('Bệnh lý dạ dày'),
      'Sanitizer',
      'Strips active <script> tags and enclosed script content safely'
    );

    const xssEventPayload = '<img src="/test.png" onerror="stealCookies()" alt="Ảnh minh họa" />';
    const sanitizedEvent = sanitizeHtml(xssEventPayload);
    assert(
      !sanitizedEvent.includes('onerror') && !sanitizedEvent.includes('stealCookies') && sanitizedEvent.includes('src="/test.png"'),
      'Sanitizer',
      'Strips inline event handler attributes (onerror)'
    );

    const xssJsLinkPayload = '<a href="javascript:alert(document.domain)">Xem thêm</a>';
    const sanitizedJsLink = sanitizeHtml(xssJsLinkPayload);
    assert(
      !sanitizedJsLink.includes('javascript:') && sanitizedJsLink.includes('Xem thêm'),
      'Sanitizer',
      'Strips javascript: pseudo-protocols in links'
    );

    const safeSemanticHtml = '<h2>Triệu chứng chính</h2><p>Đau bụng thượng vị và <strong>buồn nôn</strong>.</p><table class="table"><thead><tr><th>Cột 1</th></tr></thead><tbody><tr><td>Dữ liệu</td></tr></tbody></table>';
    const sanitizedSemantic = sanitizeHtml(safeSemanticHtml);
    assert(
      sanitizedSemantic.includes('<h2>Triệu chứng chính</h2>') &&
      sanitizedSemantic.includes('<table class="table">') &&
      sanitizedSemantic.includes('<thead>') &&
      sanitizedSemantic.includes('<strong>buồn nôn</strong>'),
      'Sanitizer',
      'Preserves safe semantic HTML tags, formatting, and tables'
    );
  }

  // =========================================================================
  // SUITE 2: TOC Auto-Extraction
  // =========================================================================
  console.log('\n--- SUITE 2: TOC Auto-Extraction ---');
  {
    const htmlWithHeadings = '<h2>1. Tổng quan về nội soi dạ dày</h2><p>Nội dung 1</p><h3>1.1 Quy trình thực hiện</h3><p>Nội dung 2</p><h2>2. Chi phí nội soi</h2><p>Nội dung 3</p>';
    const toc = extractTableOfContents(htmlWithHeadings);
    assert(
      toc.length === 3 && toc[0].text === '1. Tổng quan về nội soi dạ dày' && toc[1].level === 3,
      'TOC',
      'Correctly extracts H2 and H3 headings into Table of Contents structure'
    );
  }

  // =========================================================================
  // SUITE 3: Article Admin List & Query Optimization (No N+1)
  // =========================================================================
  console.log('\n--- SUITE 3: Article Admin List & Bounded Queries ---');
  {
    const page1 = await articleRepo.listAdmin({ page: 1, limit: 10 });
    assert(
      page1.items.length === 10 && page1.total === initialArticleCount && page1.totalPages >= 11,
      'ArticleList',
      'Bounded pagination returns exact page size and correct total'
    );

    // Verify projection does not include full contentHtml
    const firstItem = page1.items[0] as unknown as Record<string, unknown>;
    assert(
      firstItem.contentHtml === undefined && typeof firstItem.title === 'string' && Array.isArray(firstItem.categories),
      'ArticleList',
      'List projection excludes heavy contentHtml payload for high performance'
    );

    // Search query
    const searchRes = await articleRepo.listAdmin({ search: 'dạ dày', limit: 10 });
    assert(
      searchRes.items.length > 0 && searchRes.items.every((i) => i.title.toLowerCase().includes('dạ dày') || i.slug.includes('da-day')),
      'ArticleList',
      'Search query accurately matches title or slug'
    );
  }

  // =========================================================================
  // SUITE 4: Article Draft Isolation (Save Draft does not mutate canonical)
  // =========================================================================
  console.log('\n--- SUITE 4: Article Draft Isolation ---');
  const testEntityId = `art-test-fixture-${Date.now()}`;
  let draftRevisionId = '';

  {
    const draftPayload = {
      title: 'Bài Viết Thử Nghiệm CMS-5 Độc Lập',
      slug: `bai-viet-thu-nghiem-cms5-${Date.now()}`,
      excerpt: 'Tóm tắt bài viết thử nghiệm cách ly bản nháp.',
      contentHtml: '<h2>Mục Tiêu Thử Nghiệm</h2><p>Nội dung nháp chưa được duyệt.</p>',
      authorName: 'BS. Test Doctor',
      authorTitle: 'Bác sĩ Thử nghiệm',
      categoryIds: ['1'],
    };

    const draftRes = await workflowService.createDraftRevision(
      ContentType.ARTICLE,
      testEntityId,
      draftPayload,
      mockEditorContext,
      { title: draftPayload.title, changeSummary: 'Khởi tạo bản nháp thử nghiệm' }
    );

    assert(draftRes.success && Boolean(draftRes.data), 'DraftIsolation', 'Draft revision created successfully in content_revisions');
    if (draftRes.data) draftRevisionId = draftRes.data.id;

    // Verify canonical table is untouched!
    const canonicalCheck = await articleRepo.getById(testEntityId);
    assert(canonicalCheck === null, 'DraftIsolation', 'Canonical articles table is NOT mutated on Save Draft (Remains null)');

    const publicSlugCheck = await articleRepo.getBySlug(draftPayload.slug);
    assert(publicSlugCheck === null, 'DraftIsolation', 'Draft slug is NOT resolvable in public queries');
  }

  // =========================================================================
  // SUITE 5: Optimistic Concurrency Control (Version Conflict Detection)
  // =========================================================================
  console.log('\n--- SUITE 5: Optimistic Concurrency Control ---');
  {
    const updatePayload = {
      title: 'Bài Viết Thử Nghiệm CMS-5 (Đã Cập Nhật Lần 1)',
      slug: `bai-viet-thu-nghiem-cms5-${Date.now()}`,
      contentHtml: '<h2>Nội dung cập nhật</h2><p>Đoạn văn mới.</p>',
      authorName: 'BS. Test Doctor',
      authorTitle: 'Bác sĩ Thử nghiệm',
      categoryIds: ['1'],
    };

    // Stale version update (Expected version 99 vs actual version 1)
    const staleRes = await workflowService.updateDraftRevision(
      draftRevisionId,
      99, // Intentional mismatch
      updatePayload,
      mockEditorContext
    );
    assert(
      !staleRes.success && Boolean(staleRes.conflict),
      'Concurrency',
      'Rejects stale save with 409 conflict when version mismatches'
    );

    // Correct version update (Expected version 1)
    const validRes = await workflowService.updateDraftRevision(
      draftRevisionId,
      1,
      updatePayload,
      mockEditorContext
    );
    assert(
      validRes.success && validRes.data?.version === 2,
      'Concurrency',
      'Succeeds with matching version and atomically increments version to 2'
    );
  }

  // =========================================================================
  // SUITE 6: Workflow Lifecycle: Submit -> Review -> Approve -> Publish
  // =========================================================================
  console.log('\n--- SUITE 6: Workflow Lifecycle & RBAC Enforcement ---');
  {
    // 1. Submit for review (by editor)
    const submitRes = await workflowService.submitForReview(draftRevisionId, mockEditorContext);
    assert(submitRes.success && submitRes.data?.status === WorkflowStatus.IN_REVIEW, 'Workflow', 'Editor submits draft for review -> status IN_REVIEW');

    // 2. Editor tries to publish directly -> DENY
    const unauthorizedPublish = await workflowService.publishRevision(draftRevisionId, mockEditorContext);
    assert(!unauthorizedPublish.success, 'Workflow', 'Unauthorized editor cannot publish directly (RBAC Deny)');

    // 3. Medical Reviewer approves
    const approveRes = await workflowService.approveRevision(draftRevisionId, mockReviewerContext, {
      medicalReviewNotes: 'Đã kiểm duyệt chuyên môn y tế đạt chuẩn',
    });
    assert(approveRes.success && approveRes.data?.status === WorkflowStatus.APPROVED, 'Workflow', 'Medical reviewer approves revision -> status APPROVED');

    // 4. Publisher publishes revision to canonical PostgreSQL tables
    const publishRes = await workflowService.publishRevision(draftRevisionId, mockPublisherContext);
    assert(publishRes.success && publishRes.data?.status === WorkflowStatus.PUBLISHED, 'Workflow', 'Publisher atomically publishes revision -> status PUBLISHED');

    // 5. Verify canonical record now exists in PostgreSQL articles table
    const publishedCanonical = await articleRepo.getAdminById(testEntityId);
    assert(
      publishedCanonical !== null && publishedCanonical.status === 'published' && publishedCanonical.title.includes('Lần 1'),
      'Workflow',
      'Canonical articles record is created and populated with published revision snapshot'
    );
  }

  // =========================================================================
  // SUITE 7: Revision History & History-Preserving Restore
  // =========================================================================
  console.log('\n--- SUITE 7: Revision History & Restore ---');
  {
    const history = await revisionRepo.listByEntity(ContentType.ARTICLE, testEntityId);
    assert(history.length >= 1, 'History', 'Revisions are tracked and queryable by entity');

    // Restore revision -> should create a new draft revision, NOT mutate the published canonical record
    const restoreRes = await workflowService.restoreRevision(draftRevisionId, mockEditorContext);
    assert(
      restoreRes.success && restoreRes.data?.status === WorkflowStatus.DRAFT && restoreRes.data.revisionNumber > 1,
      'History',
      'Restore creates a new draft revision without overwriting published historical records'
    );
  }

  // =========================================================================
  // SUITE 8: Category Management & Safety Constraints
  // =========================================================================
  console.log('\n--- SUITE 8: Category Management & Reference Safety ---');
  const testCatSlug = `test-cat-cms5-${Date.now()}`;
  let testCatId = '';

  {
    // Create Category
    const createdCat = await categoryRepo.create({
      name: 'Chuyên Mục Thử Nghiệm CMS-5',
      slug: testCatSlug,
      description: 'Mô tả chuyên mục thử nghiệm',
      seoTitle: 'SEO Chuyên mục thử nghiệm',
      sortOrder: 99,
    });
    testCatId = String(createdCat.id);
    assert(createdCat.slug === testCatSlug, 'Category', 'Creates new category successfully');

    // Update Category
    const updatedCat = await categoryRepo.update(testCatId, {
      name: 'Chuyên Mục Thử Nghiệm CMS-5 (Đã Sửa)',
    });
    assert(updatedCat?.name.includes('Đã Sửa') === true, 'Category', 'Updates category successfully');

    // Protected slug check: attempting to delete or mutate protected collision category
    const protectedCat = await categoryRepo.getBySlug('kien-thuc-ung-thu-da-day');
    assert(protectedCat !== null, 'Category', 'Protected collision slug kien-thuc-ung-thu-da-day is present in database');

    // Block delete when category has articles
    const catWithArticles = await categoryRepo.getById('1');
    if (catWithArticles && (catWithArticles.totalArticles || 0) > 0) {
      let blockedError = false;
      try {
        await categoryRepo.delete(String(catWithArticles.id));
      } catch (err: unknown) {
        blockedError = true;
      }
      assert(blockedError, 'Category', 'Blocks destructive deletion when articles are linked to category');
    }

    // Delete zero-usage test category -> succeeds
    const deleteSuccess = await categoryRepo.delete(testCatId);
    assert(deleteSuccess, 'Category', 'Deletes isolated zero-usage test category cleanly');
  }

  // =========================================================================
  // SUITE 9: Clean Up Test Fixtures & Verify Zero Passive Drift
  // =========================================================================
  console.log('\n--- SUITE 9: Cleanup & Zero Passive Drift Check ---');
  {
    // Clean up test fixture article & revisions
    await db.delete(schema.articleCategories).where(eq(schema.articleCategories.articleId, testEntityId));
    await db.delete(schema.articles).where(eq(schema.articles.id, testEntityId));
    await db.delete(schema.contentRevisions).where(
      and(eq(schema.contentRevisions.entityType, 'article'), eq(schema.contentRevisions.entityId, testEntityId))
    );
    await db.delete(schema.categories).where(ilike(schema.categories.slug, 'test-cat-cms5-%'));

    const finalArticles = await articleRepo.getAll();
    const finalCategories = await categoryRepo.getAll();

    assert(
      finalArticles.length === initialArticleCount,
      'Fidelity',
      `Article count matches baseline exactly (${finalArticles.length}/${initialArticleCount})`
    );

    assert(
      finalCategories.length === initialCategoryCount,
      'Fidelity',
      `Category count matches baseline exactly (${finalCategories.length}/${initialCategoryCount})`
    );

    // Verify all 108 articles have non-empty valid contentHtml and slug
    const invalidArticles = finalArticles.filter((a) => !a.slug || !a.title || !a.contentHtml);
    assert(
      invalidArticles.length === 0,
      'Fidelity',
      'All 108 production articles have 100% valid slug, title, and contentHtml integrity'
    );
  }

  // =========================================================================
  // SUMMARY
  // =========================================================================
  const total = results.length;
  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;

  console.log('\n================================================================');
  console.log(`TOTAL TESTS: ${total} | PASSED: ${passed} | FAILED: ${failed}`);
  console.log('================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runCms5Tests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
