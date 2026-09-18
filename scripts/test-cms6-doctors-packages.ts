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

async function runCms6Tests() {
  console.log('\n================================================================');
  console.log('🩺 CMS-6: DOCTOR & PACKAGE CMS MANAGEMENT TEST SUITE');
  console.log('================================================================\n');

  const { db } = await import('../src/db');
  const schema = await import('../src/db/schema');
  const { doctors, doctorSpecialties, specialties, packages, users, contentRevisions } = schema;
  const { workflowService } = await import('../src/services/workflow.service');
  const { ContentType, WorkflowStatus } = await import('../src/lib/workflow/types');
  const { Role, Permission, resolvePermissionsForRoles } = await import('../src/lib/auth/rbac');
  const { eq, and, sql } = await import('drizzle-orm');
  const { sanitizeHtml } = await import('../src/lib/security/html-sanitizer');

  // Provision valid test users in DB
  const [superAdminDb] = await db
    .insert(users)
    .values({
      email: 'admin-cms6-test@doctorcheck.vn',
      passwordHash: 'dummy-hash',
      fullName: 'Super Admin CMS-6',
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
      email: 'editor-cms6-test@doctorcheck.vn',
      passwordHash: 'dummy-hash',
      fullName: 'Editor CMS-6',
      isActive: true,
    })
    .onConflictDoUpdate({
      target: users.email,
      set: { isActive: true },
    })
    .returning();

  const [medReviewerDb] = await db
    .insert(users)
    .values({
      email: 'reviewer-cms6-test@doctorcheck.vn',
      passwordHash: 'dummy-hash',
      fullName: 'Medical Reviewer CMS-6',
      isActive: true,
    })
    .onConflictDoUpdate({
      target: users.email,
      set: { isActive: true },
    })
    .returning();

  const [financeAdminDb] = await db
    .insert(users)
    .values({
      email: 'finance-cms6-test@doctorcheck.vn',
      passwordHash: 'dummy-hash',
      fullName: 'Finance Admin CMS-6',
      isActive: true,
    })
    .onConflictDoUpdate({
      target: users.email,
      set: { isActive: true },
    })
    .returning();

  // User Context Fixtures with genuine UUIDs
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
      Permission.DOCTOR_READ,
      Permission.DOCTOR_EDIT_BIO,
      Permission.PACKAGE_READ,
      Permission.PACKAGE_EDIT_CONTENT,
    ],
  };

  const medicalReviewerContext = {
    userId: medReviewerDb.id,
    userEmail: medReviewerDb.email,
    roles: [Role.MEDICAL_REVIEWER],
    permissions: [
      Permission.DOCTOR_READ,
      Permission.DOCTOR_EDIT_BIO,
      Permission.DOCTOR_EDIT_CCHN,
      Permission.PACKAGE_READ,
      Permission.PACKAGE_EDIT_CONTENT,
      Permission.PACKAGE_PUBLISH,
    ],
  };

  const financeAdminContext = {
    userId: financeAdminDb.id,
    userEmail: financeAdminDb.email,
    roles: [Role.ADMIN],
    permissions: [
      Permission.PACKAGE_READ,
      Permission.PACKAGE_EDIT_CONTENT,
      Permission.PACKAGE_EDIT_PRICE,
      Permission.PACKAGE_PUBLISH,
    ],
  };

  const testDoctorId = `test-doc-${Date.now()}`;
  const testDoctorSlug = `bac-si-thu-nghiem-cms6-${Date.now()}`;
  const testPackageId = `test-pkg-${Date.now()}`;
  const testPackageSlug = `goi-kham-thu-nghiem-cms6-${Date.now()}`;

  // Initial cleanup of any stale test fixtures from previous failed runs
  await db.delete(doctorSpecialties).where(sql`doctor_id LIKE 'test-doc-%' OR doctor_id LIKE 'doc-col-%'`);
  await db.delete(doctors).where(sql`id LIKE 'test-doc-%' OR id LIKE 'doc-col-%'`);
  await db.delete(packages).where(sql`id LIKE 'test-pkg-%'`);
  await db.delete(contentRevisions).where(sql`entity_id LIKE 'test-doc-%' OR entity_id LIKE 'doc-col-%' OR entity_id LIKE 'test-pkg-%'`);

  try {
    // -------------------------------------------------------------------------
    // SUITE 1: Doctors Baseline & Integrity Check
    // -------------------------------------------------------------------------
    console.log('--- SUITE 1: Doctors Baseline & Integrity Check ---');
    const dbDoctors = await db.select().from(doctors);
    if (dbDoctors.length === 7) {
      pass('DoctorBaseline > Exactly 7 verified physicians present in database');
    } else {
      fail(`DoctorBaseline > Expected 7 doctors, found ${dbDoctors.length}`);
    }

    const firstDoc = dbDoctors.find((d: any) => d.id === 'trinh-ai-nhi');
    if (firstDoc && firstDoc.cchn === '040144/HCM-CCHN' && firstDoc.name.includes('Trịnh Ái Nhi')) {
      pass('DoctorBaseline > Doctor Trịnh Ái Nhi CCHN license is verified');
    } else {
      fail('DoctorBaseline > Doctor Trịnh Ái Nhi data mismatch');
    }

    // Lookup available specialties in DB
    const dbSpecialties = await db.select().from(specialties);
    const validSpecialtyIds = dbSpecialties.slice(0, 2).map((s: any) => s.id);

    // -------------------------------------------------------------------------
    // SUITE 2: Packages Baseline & Integrity Check
    // -------------------------------------------------------------------------
    console.log('\n--- SUITE 2: Packages Baseline & Integrity Check ---');
    const dbPackages = await db.select().from(packages);
    if (dbPackages.length === 9) {
      pass('PackageBaseline > Exactly 9 verified packages present in database');
    } else {
      fail(`PackageBaseline > Expected 9 packages, found ${dbPackages.length}`);
    }

    const firstPkg = dbPackages.find((p: any) => p.slug === 'goi-khuyen-cao-danh-cho-nu');
    if (firstPkg && Number(firstPkg.priceVnd) === 3000000 && firstPkg.priceFormatted === '3.000.000đ') {
      pass('PackageBaseline > Package Khuyến Cáo Nữ price matches 3.000.000đ exactly');
    } else {
      fail('PackageBaseline > Package Khuyến Cáo Nữ price mismatch');
    }

    // -------------------------------------------------------------------------
    // SUITE 3: Doctor Draft Isolation & Zero Canonical Mutation
    // -------------------------------------------------------------------------
    console.log('\n--- SUITE 3: Doctor Draft Isolation ---');
    const doctorDraftRes = await workflowService.createDraftRevision(
      ContentType.DOCTOR,
      testDoctorId,
      {
        name: 'BSCKI Nguyễn Văn Thử Nghiệm',
        slug: testDoctorSlug,
        title: 'Bác Sĩ Chuyên Khoa I',
        cchn: '999999/HCM-CCHN',
        specialtySummary: 'Nội Soi Tiêu Hóa',
        clinicalScope: 'Khám và nội soi tiêu hóa',
        hospital: 'Bệnh viện Thử Nghiệm',
        experienceYears: 12,
        imageUrl: '/sites/doctorcheck-vn/root/images/doctors/trinh-ai-nhi.webp',
        description: 'Bác sĩ thử nghiệm cho CMS-6 test suite',
        detailedBioHtml: '<p>Tiểu sử bác sĩ thử nghiệm.</p>',
        schedule: 'Thứ 2 - Thứ 6: 7h00 - 16h00',
        isFeatured: false,
        sortOrder: 10,
        specialtyIds: validSpecialtyIds,
      },
      editorContext,
      { title: 'BSCKI Nguyễn Văn Thử Nghiệm', changeSummary: 'Khởi tạo hồ sơ bác sĩ' }
    );

    if (doctorDraftRes.success && doctorDraftRes.data) {
      pass('DoctorDraft > Created doctor draft revision in content_revisions');
    } else {
      fail('DoctorDraft > Failed to create draft revision', doctorDraftRes.error);
    }

    // Verify canonical table is untouched
    const canonicalDoctorBefore = await db.select().from(doctors).where(eq(doctors.id, testDoctorId));
    if (canonicalDoctorBefore.length === 0) {
      pass('DoctorDraft > Canonical doctors table is UNTOUCHED on Save Draft (0 leak)');
    } else {
      fail('DoctorDraft > Canonical doctors table was prematurely mutated!');
    }

    // -------------------------------------------------------------------------
    // SUITE 4: Doctor CCHN Protection & Workflow Lifecycle
    // -------------------------------------------------------------------------
    console.log('\n--- SUITE 4: Doctor CCHN & Workflow Lifecycle ---');
    const revId = doctorDraftRes.data!.id;

    // Editor submits for review
    const submitRes = await workflowService.submitForReview(revId, editorContext);
    if (submitRes.success && submitRes.data?.status === WorkflowStatus.IN_REVIEW) {
      pass('DoctorWorkflow > Editor submitted draft -> status IN_REVIEW');
    } else {
      fail('DoctorWorkflow > Submit for review failed', submitRes.error);
    }

    // Editor cannot directly publish without CCHN authority
    const editorPublishRes = await workflowService.publishRevision(revId, editorContext);
    if (!editorPublishRes.success) {
      pass('DoctorWorkflow > Editor without doctor.edit_cchn is DENIED publishing (RBAC Guard)');
    } else {
      fail('DoctorWorkflow > Editor unexpectedly published doctor without review authority!');
    }

    // Medical Reviewer approves
    const approveRes = await workflowService.approveRevision(revId, medicalReviewerContext, {
      medicalReviewNotes: 'CCHN 999999/HCM-CCHN đã được thẩm định trên Cổng thông tin SYT.',
    });
    if (approveRes.success && approveRes.data?.status === WorkflowStatus.APPROVED) {
      pass('DoctorWorkflow > Medical Reviewer approved revision -> status APPROVED');
    } else {
      fail('DoctorWorkflow > Medical Reviewer approve failed', approveRes.error);
    }

    // Publish doctor atomically
    const publishDocRes = await workflowService.publishRevision(revId, superAdminContext);
    if (publishDocRes.success && publishDocRes.data?.status === WorkflowStatus.PUBLISHED) {
      pass('DoctorWorkflow > Atomic publish succeeded -> status PUBLISHED');
    } else {
      fail('DoctorWorkflow > Publish doctor failed', publishDocRes.error);
    }

    // Verify canonical doctor and specialties join table
    const canonicalDoctorAfter = await db.select().from(doctors).where(eq(doctors.id, testDoctorId));
    const linkedSpecialties = await db
      .select()
      .from(doctorSpecialties)
      .where(eq(doctorSpecialties.doctorId, testDoctorId));

    if (canonicalDoctorAfter.length === 1 && canonicalDoctorAfter[0].cchn === '999999/HCM-CCHN') {
      pass('DoctorWorkflow > Canonical doctor record created with verified CCHN');
    } else {
      fail('DoctorWorkflow > Canonical doctor record missing or corrupt');
    }

    if (linkedSpecialties.length >= 1) {
      pass('DoctorWorkflow > Doctor specialties join records synchronized atomically');
    } else {
      fail('DoctorWorkflow > Doctor specialties join records missing');
    }

    // -------------------------------------------------------------------------
    // SUITE 5: Package Draft Isolation & Price Security
    // -------------------------------------------------------------------------
    console.log('\n--- SUITE 5: Package Draft Isolation & Price Security ---');
    const packageDraftRes = await workflowService.createDraftRevision(
      ContentType.PACKAGE,
      testPackageId,
      {
        name: 'Gói Khám Thử Nghiệm CMS-6',
        slug: testPackageSlug,
        gender: 'both',
        priceVnd: 4500000,
        priceFormatted: '4.500.000đ',
        tagline: 'Tầm soát chuyên sâu bệnh lý tiêu hóa',
        diseasesCovered: 25,
        cancersCovered: 3,
        duration: '90 - 120 phút',
        isPopular: true,
        recommendedFor: 'Người trưởng thành từ 30 tuổi',
        features: [
          'Khám và tư vấn chuyên sâu cùng Bác Sĩ CKI',
          'Nội soi dạ dày không đau bằng công nghệ AI',
          'Xét nghiệm bộ mỡ máu toàn diện',
          'Siêu âm ổ bụng màu',
        ],
        sortOrder: 5,
        isActive: true,
      },
      editorContext,
      { title: 'Gói Khám Thử Nghiệm CMS-6', changeSummary: 'Khởi tạo gói khám' }
    );

    if (packageDraftRes.success && packageDraftRes.data) {
      pass('PackageDraft > Created package draft revision in content_revisions');
    } else {
      fail('PackageDraft > Failed to create package draft', packageDraftRes.error);
    }

    // Verify canonical packages table is untouched
    const canonicalPkgBefore = await db.select().from(packages).where(eq(packages.id, testPackageId));
    if (canonicalPkgBefore.length === 0) {
      pass('PackageDraft > Canonical packages table is UNTOUCHED on Save Draft (0 leak)');
    } else {
      fail('PackageDraft > Canonical packages table was prematurely mutated!');
    }

    // -------------------------------------------------------------------------
    // SUITE 6: Package Price Authorization & Feature Ordering
    // -------------------------------------------------------------------------
    console.log('\n--- SUITE 6: Package Price & Feature Ordering ---');
    const pkgRevId = packageDraftRes.data!.id;

    // Submit for review
    await workflowService.submitForReview(pkgRevId, editorContext);
    // Approve with price authority
    const approvePkgRes = await workflowService.approveRevision(pkgRevId, financeAdminContext);
    if (approvePkgRes.success) {
      pass('PackageWorkflow > Finance Admin approved package revision');
    } else {
      fail('PackageWorkflow > Finance Admin approve failed', approvePkgRes.error);
    }

    // Publish package atomically
    const publishPkgRes = await workflowService.publishRevision(pkgRevId, superAdminContext);
    if (publishPkgRes.success && publishPkgRes.data?.status === WorkflowStatus.PUBLISHED) {
      pass('PackageWorkflow > Atomic publish succeeded -> status PUBLISHED');
    } else {
      fail('PackageWorkflow > Publish package failed', publishPkgRes.error);
    }

    // Verify canonical package and features jsonb
    const canonicalPkgAfter = await db.select().from(packages).where(eq(packages.id, testPackageId));
    if (
      canonicalPkgAfter.length === 1 &&
      Number(canonicalPkgAfter[0].priceVnd) === 4500000 &&
      canonicalPkgAfter[0].priceFormatted === '4.500.000đ'
    ) {
      pass('PackageWorkflow > Canonical package priceVnd (4500000) and priceFormatted preserved');
    } else {
      fail('PackageWorkflow > Canonical package price corrupted');
    }

    const featuresList = canonicalPkgAfter[0]?.features as string[];
    if (Array.isArray(featuresList) && featuresList.length === 4 && featuresList[1].includes('Nội soi')) {
      pass('PackageWorkflow > Ordered package features JSONB preserved exact indices');
    } else {
      fail('PackageWorkflow > Package features JSONB corrupted');
    }

    // -------------------------------------------------------------------------
    // SUITE 7: Optimistic Concurrency Control (409 Conflict)
    // -------------------------------------------------------------------------
    console.log('\n--- SUITE 7: Optimistic Concurrency Control ---');
    // Create new draft revision of published doctor
    const docDraftV2 = await workflowService.createDraftRevision(
      ContentType.DOCTOR,
      testDoctorId,
      {
        name: 'BSCKI Nguyễn Văn Thử Nghiệm (Đã Sửa)',
        slug: testDoctorSlug,
        title: 'Bác Sĩ Chuyên Khoa I',
        cchn: '999999/HCM-CCHN',
        specialtySummary: 'Nội Soi Tiêu Hóa',
        clinicalScope: 'Khám và nội soi tiêu hóa',
        hospital: 'Bệnh viện Thử Nghiệm',
        experienceYears: 15,
        imageUrl: '/sites/doctorcheck-vn/root/images/doctors/trinh-ai-nhi.webp',
        description: 'Cập nhật kinh nghiệm lên 15 năm',
      },
      editorContext,
      { title: 'BSCKI Nguyễn Văn Thử Nghiệm', changeSummary: 'Chỉnh sửa kinh nghiệm' }
    );

    const docV2RevId = docDraftV2.data!.id;
    // Stale update with wrong version
    const staleUpdateRes = await workflowService.updateDraftRevision(
      docV2RevId,
      99, // stale expected version
      {
        name: 'BSCKI Nguyễn Văn Thử Nghiệm (Stale)',
        slug: testDoctorSlug,
        title: 'Bác Sĩ Chuyên Khoa I',
        cchn: '999999/HCM-CCHN',
        specialtySummary: 'Nội Soi Tiêu Hóa',
        clinicalScope: 'Khám và nội soi tiêu hóa',
        hospital: 'Bệnh viện Thử Nghiệm',
        experienceYears: 15,
        imageUrl: '/sites/doctorcheck-vn/root/images/doctors/trinh-ai-nhi.webp',
        description: 'Cập nhật kinh nghiệm lên 15 năm',
      },
      editorContext
    );

    if (!staleUpdateRes.success && staleUpdateRes.conflict) {
      pass('Concurrency > Stale save with mismatched expectedVersion correctly rejected with 409 conflict');
    } else {
      fail('Concurrency > Stale save was not rejected!');
    }

    // -------------------------------------------------------------------------
    // SUITE 8: Stored XSS Sanitization Tests
    // -------------------------------------------------------------------------
    console.log('\n--- SUITE 8: Stored XSS Sanitization ---');
    const maliciousPayload = '<script>alert("xss")</script><p>Tiểu sử <a href="javascript:steal()">nhấn vào đây</a><img src="x" onerror="alert(1)"></p>';
    const sanitizedBio = sanitizeHtml(maliciousPayload);

    if (!sanitizedBio.includes('<script>') && !sanitizedBio.includes('javascript:') && !sanitizedBio.includes('onerror')) {
      pass('XSS > Malicious script, javascript: link, and onerror handler stripped from doctor rich fields');
    } else {
      fail('XSS > Sanitizer allowed executable payload to pass!', sanitizedBio);
    }

    // -------------------------------------------------------------------------
    // SUITE 9: Route Collision Prevention
    // -------------------------------------------------------------------------
    console.log('\n--- SUITE 9: Route Collision Prevention ---');
    // Attempt to publish doctor with slug colliding with protected root route
    const collisionDraft = await workflowService.createDraftRevision(
      ContentType.DOCTOR,
      `doc-col-${Date.now()}`,
      {
        name: 'BS Bị Trùng Slug',
        slug: 'kien-thuc-ung-thu-da-day', // Protected category collision
        title: 'Bác Sĩ',
        cchn: '111111/HCM-CCHN',
        specialtySummary: 'Nội Soi',
        clinicalScope: 'Nội soi',
        hospital: 'BV',
        imageUrl: '/img.webp',
        description: 'Test collision',
      },
      superAdminContext
    );

    const publishCollisionRes = await workflowService.publishRevision(collisionDraft.data!.id, superAdminContext);
    if (!publishCollisionRes.success && publishCollisionRes.error?.includes('được bảo vệ')) {
      pass('Collision > Blocked publishing doctor with protected collision slug kien-thuc-ung-thu-da-day');
    } else {
      fail('Collision > Allowed collision with protected root slug!');
    }

    // Clean up collision draft revision
    await db.delete(contentRevisions).where(eq(contentRevisions.id, collisionDraft.data!.id));

    // -------------------------------------------------------------------------
    // SUITE 10: Revision History & Restore Semantics
    // -------------------------------------------------------------------------
    console.log('\n--- SUITE 10: Revision History & Restore Semantics ---');
    const revList = await db.select().from(contentRevisions).where(eq(contentRevisions.entityId, testDoctorId));

    if (revList.length >= 2) {
      pass('History > Multiple revisions recorded and queryable for test doctor');
    } else {
      fail('History > Revisions missing for test doctor');
    }

    // Restore revision 1
    const rev1 = revList.find((r: any) => r.revisionNumber === 1);
    if (rev1) {
      const restoreRes = await workflowService.restoreRevision(rev1.id, editorContext);
      if (restoreRes.success && restoreRes.data?.status === WorkflowStatus.DRAFT) {
        pass('Restore > Restored historical revision into new draft without mutating canonical state');
      } else {
        fail('Restore > Restore historical revision failed', restoreRes.error);
      }
    }

    // -------------------------------------------------------------------------
    // SUITE 11: Cleanup & Zero Passive Drift Check
    // -------------------------------------------------------------------------
    console.log('\n--- SUITE 11: Cleanup & Zero Passive Drift Check ---');
    // Clean up test doctor
    await db.delete(doctorSpecialties).where(eq(doctorSpecialties.doctorId, testDoctorId));
    await db.delete(doctors).where(eq(doctors.id, testDoctorId));
    await db.delete(contentRevisions).where(eq(contentRevisions.entityId, testDoctorId));

    // Clean up test package
    await db.delete(packages).where(eq(packages.id, testPackageId));
    await db.delete(contentRevisions).where(eq(contentRevisions.entityId, testPackageId));

    // Final corpus fidelity verification
    const finalDoctors = await db.select().from(doctors);
    const finalPackages = await db.select().from(packages);

    if (finalDoctors.length === 7) {
      pass('Fidelity > Final doctor count matches baseline exactly (7/7)');
    } else {
      fail(`Fidelity > Expected 7 doctors, found ${finalDoctors.length}`);
    }

    if (finalPackages.length === 9) {
      pass('Fidelity > Final package count matches baseline exactly (9/9)');
    } else {
      fail(`Fidelity > Expected 9 packages, found ${finalPackages.length}`);
    }

    // Verify all 7 doctors have intact CCHN and non-empty clinical scope
    const allDoctorsValid = finalDoctors.every((d: any) => d.cchn && d.clinicalScope && d.specialtySummary);
    if (allDoctorsValid) {
      pass('Fidelity > All 7 production doctors have 100% CCHN and clinicalScope integrity');
    } else {
      fail('Fidelity > Doctor clinical credentials missing or corrupted');
    }

    // Verify all 9 packages have intact prices (including zero-price consultation packages)
    const invalidPackages = finalPackages.filter((p: any) => !(Number(p.priceVnd) >= 0 && Boolean(p.priceFormatted)));
    if (invalidPackages.length === 0) {
      pass('Fidelity > All 9 production packages have 100% priceVnd and priceFormatted integrity (with zero semantics)');
    } else {
      console.log('  [DIAGNOSTIC] Invalid packages found:', invalidPackages.map((p: any) => ({ id: p.id, priceVnd: p.priceVnd, priceFormatted: p.priceFormatted })));
      fail('Fidelity > Package price integrity corrupted');
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

runCms6Tests().catch((e) => {
  console.error(e);
  process.exit(1);
});
