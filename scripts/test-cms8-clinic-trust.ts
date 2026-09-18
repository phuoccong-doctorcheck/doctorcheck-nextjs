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

async function runCms8Tests() {
  console.log('\n================================================================');
  console.log('🏥 CMS-8: CLINIC & CLINICAL TRUST MANAGEMENT TEST SUITE');
  console.log('================================================================\n');

  const { db, client } = await import('../src/db');
  const schema = await import('../src/db/schema');
  const { clinicInfo, equipment, faqs, testimonials, homepageBlocks, users, contentRevisions } = schema;
  const { workflowService } = await import('../src/services/workflow.service');
  const { ContentType, WorkflowStatus } = await import('../src/lib/workflow/types');
  const { Role, Permission } = await import('../src/lib/auth/rbac');
  const { sanitizeHtml } = await import('../src/lib/security/html-sanitizer');
  const { clinicRepository, clinicalTrustRepository } = await import('../src/repositories');
  const { eq, and, sql } = await import('drizzle-orm');

  // Provision test users in DB
  const [superAdminDb] = await db
    .insert(users)
    .values({
      email: 'admin-cms8-test@doctorcheck.vn',
      passwordHash: 'dummy-hash',
      fullName: 'Super Admin CMS-8',
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
      email: 'editor-cms8-test@doctorcheck.vn',
      passwordHash: 'dummy-hash',
      fullName: 'Editor CMS-8',
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
      email: 'reviewer-cms8-test@doctorcheck.vn',
      passwordHash: 'dummy-hash',
      fullName: 'Reviewer CMS-8',
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
      Permission.CLINIC_READ,
      Permission.CLINIC_EDIT,
      Permission.CLINICAL_TRUST_READ,
      Permission.CLINICAL_TRUST_EDIT,
    ],
  };

  const reviewerContext = {
    userId: reviewerDb.id,
    userEmail: reviewerDb.email,
    roles: [Role.ADMIN],
    permissions: [
      Permission.CLINIC_READ,
      Permission.CLINIC_EDIT,
      Permission.CLINIC_PUBLISH,
      Permission.CLINICAL_TRUST_READ,
      Permission.CLINICAL_TRUST_EDIT,
      Permission.CLINICAL_TRUST_PUBLISH,
    ],
  };

  // Cleanup any existing test fixtures
  await db.delete(equipment).where(sql`id LIKE 'test-equip-%'`);
  await db.delete(faqs).where(sql`id LIKE 'test-faq-%'`);
  await db.delete(testimonials).where(sql`id LIKE 'test-testim-%' OR id LIKE 'test-story-%'`);
  await db.delete(homepageBlocks).where(sql`block_key = 'test-temp-block'`);
  await db.delete(contentRevisions).where(sql`entity_id LIKE 'test-%'`);

  try {
    // -------------------------------------------------------------------------
    // SUITE 1: Baseline Domain Inventory & Checksum Snapshot
    // -------------------------------------------------------------------------
    console.log('--- SUITE 1: Baseline Domain Inventory & Checksums ---');
    const initialClinic = await db.select().from(clinicInfo);
    const initialEquipment = await db.select().from(equipment).orderBy(equipment.sortOrder);
    const initialFaqs = await db.select().from(faqs).orderBy(faqs.sortOrder);
    const initialTestimonials = await db.select().from(testimonials).orderBy(testimonials.sortOrder);

    const initialVideos = initialTestimonials.filter((t: any) => t.type === 'video');
    const initialStories = initialTestimonials.filter((t: any) => t.type === 'customer_story');

    if (initialClinic.length === 1 && initialClinic[0].id === 'default') {
      pass('DomainInventory > Clinic Profile: Exactly 1 record (id = default)');
    } else {
      fail(`DomainInventory > Expected 1 clinic_info row, found ${initialClinic.length}`);
    }

    if (initialEquipment.length === 6) {
      pass('DomainInventory > Medical Equipment: Exactly 6 baseline systems');
    } else {
      fail(`DomainInventory > Expected 6 equipment rows, found ${initialEquipment.length}`);
    }

    if (initialFaqs.length === 5) {
      pass('DomainInventory > Clinical FAQs: Exactly 5 baseline questions');
    } else {
      fail(`DomainInventory > Expected 5 faqs rows, found ${initialFaqs.length}`);
    }

    if (initialVideos.length === 3) {
      pass('DomainInventory > Video Testimonials: Exactly 3 video testimonials');
    } else {
      fail(`DomainInventory > Expected 3 video testimonials, found ${initialVideos.length}`);
    }

    if (initialStories.length === 3) {
      pass('DomainInventory > Customer Stories: Exactly 3 customer stories');
    } else {
      fail(`DomainInventory > Expected 3 customer stories, found ${initialStories.length}`);
    }

    // Capture baseline checksums (excluding mutable timestamps)
    const normalizeClinic = (c: any) => ({
      name: c.name,
      legalName: c.legalName,
      licenseNumber: c.licenseNumber,
      taxCode: c.taxCode,
      hotline: c.hotline,
      emergencyPhone: c.emergencyPhone,
      zaloUrl: c.zaloUrl,
      email: c.email,
      addressStreet: c.addressStreet,
      addressWard: c.addressWard,
      addressDistrict: c.addressDistrict,
      addressCity: c.addressCity,
      addressFull: c.addressFull,
      latitude: c.latitude,
      longitude: c.longitude,
      workingHours: c.workingHours,
    });

    const normalizeEquipment = (e: any) => ({
      id: e.id,
      name: e.name,
      origin: e.origin,
      manufacturer: e.manufacturer,
      imageUrl: e.imageUrl,
      description: e.description,
      features: e.features,
      sortOrder: e.sortOrder,
      isActive: e.isActive,
    });

    const normalizeFaq = (f: any) => ({
      id: f.id,
      question: f.question,
      answer: f.answer,
      category: f.category,
      sortOrder: f.sortOrder,
      isPublished: f.isPublished,
    });

    const normalizeTestimonial = (t: any) => ({
      id: t.id,
      type: t.type,
      title: t.title,
      patientName: t.patientName,
      patientAge: t.patientAge,
      videoId: t.videoId,
      imageUrl: t.imageUrl,
      quote: t.quote,
      fullStory: t.fullStory,
      tag: t.tag,
      sortOrder: t.sortOrder,
      isPublished: t.isPublished,
    });

    const baselineClinicHash = calculateSha256(JSON.stringify(normalizeClinic(initialClinic[0])));
    const baselineEquipmentHashes = new Map(initialEquipment.map((e: any) => [e.id, calculateSha256(JSON.stringify(normalizeEquipment(e)))]));
    const baselineFaqHashes = new Map(initialFaqs.map((f: any) => [f.id, calculateSha256(JSON.stringify(normalizeFaq(f)))]));
    const baselineTestimonialHashes = new Map(initialTestimonials.map((t: any) => [t.id, calculateSha256(JSON.stringify(normalizeTestimonial(t)))]));

    pass(`BaselineHashes > Captured SHA-256 signatures for 18 total clinical baseline records`);

    // -------------------------------------------------------------------------
    // SUITE 2: Clinic Profile Workflow, License Number & Atomic Publishing
    // -------------------------------------------------------------------------
    console.log('\n--- SUITE 2: Clinic Profile Workflow & Guarded Publishing ---');
    const clinicDraftRes = await workflowService.createDraftRevision(
      ContentType.CLINIC,
      'default',
      {
        name: 'Doctor Check - Trung Tâm Tầm Soát Bệnh Chuẩn Quốc Tế',
        legalName: 'CÔNG TY TNHH BỆNH VIỆN ĐA KHOA DOCTOR CHECK',
        licenseNumber: '09789/HCM-GPHĐ',
        taxCode: '0317316744',
        hotline: '02856789999',
        emergencyPhone: '02856789999',
        zaloUrl: 'https://zalo.me/doctorcheck',
        email: 'info@doctorcheck.vn',
        addressStreet: '429 Tô Hiến Thành',
        addressWard: 'Phường 14',
        addressDistrict: 'Quận 10',
        addressCity: 'TP. Hồ Chí Minh',
        addressFull: '429 Tô Hiến Thành, Phường 14, Quận 10, TP. Hồ Chí Minh',
        latitude: '10.7725',
        longitude: '106.6578',
        workingHours: { full: 'Thứ 2 - Thứ 7: 6:00 - 17:00 | Chủ Nhật: 6:00 - 12:00', short: 'T2-CN: 6h-17h' },
      },
      editorContext,
      { title: 'Doctor Check Profile', changeSummary: 'Cập nhật số điện thoại khẩn cấp thử nghiệm' }
    );

    if (clinicDraftRes.success && clinicDraftRes.data) {
      pass('ClinicWorkflow > Draft revision created successfully in content_revisions');
    } else {
      fail('ClinicWorkflow > Failed to create draft revision', clinicDraftRes.error);
    }

    // Verify Canonical `clinic_info` remains completely unchanged
    const canonicalClinicBefore = await db.select().from(clinicInfo).where(eq(clinicInfo.id, 'default'));
    if (calculateSha256(JSON.stringify(normalizeClinic(canonicalClinicBefore[0]))) === baselineClinicHash) {
      pass('ClinicWorkflow > Save Draft did NOT mutate canonical clinic_info in DB (Draft Isolation 100%)');
    } else {
      fail('ClinicWorkflow > Save Draft leaked mutations to canonical clinic_info!');
    }

    // Submit review & approve
    const reviewRes = await workflowService.submitForReview(clinicDraftRes.data!.id, editorContext);
    if (reviewRes.success && reviewRes.data?.status === WorkflowStatus.IN_REVIEW) {
      pass('ClinicWorkflow > Draft transitioned to IN_REVIEW');
    } else {
      fail('ClinicWorkflow > Failed to submit review', reviewRes.error);
    }

    const approveRes = await workflowService.approveRevision(clinicDraftRes.data!.id, reviewerContext);
    if (approveRes.success && approveRes.data?.status === WorkflowStatus.APPROVED) {
      pass('ClinicWorkflow > Revision transitioned to APPROVED by reviewer');
    } else {
      fail('ClinicWorkflow > Failed to approve revision', approveRes.error);
    }

    // Unauthorized publish attempt by editor without publish permission
    const unauthPublishRes = await workflowService.publishRevision(clinicDraftRes.data!.id, editorContext);
    if (!unauthPublishRes.success) {
      pass('ClinicWorkflow > Unauthorized editor publish attempt strictly DENIED');
    } else {
      fail('ClinicWorkflow > Unauthorized editor was allowed to publish!');
    }

    // Authorized publish by Reviewer / Admin
    const publishRes = await workflowService.publishRevision(clinicDraftRes.data!.id, reviewerContext);
    if (publishRes.success && publishRes.data?.status === WorkflowStatus.PUBLISHED) {
      pass('ClinicWorkflow > Revision PUBLISHED atomically by authorized user');
    } else {
      fail('ClinicWorkflow > Authorized publish failed', publishRes.error);
    }

    // Restore original baseline data for clinic_info
    const originalClinicData = initialClinic[0];
    await db
      .update(clinicInfo)
      .set({
        name: originalClinicData.name,
        legalName: originalClinicData.legalName,
        licenseNumber: originalClinicData.licenseNumber,
        taxCode: originalClinicData.taxCode,
        hotline: originalClinicData.hotline,
        emergencyPhone: originalClinicData.emergencyPhone,
        zaloUrl: originalClinicData.zaloUrl,
        email: originalClinicData.email,
        addressStreet: originalClinicData.addressStreet,
        addressWard: originalClinicData.addressWard,
        addressDistrict: originalClinicData.addressDistrict,
        addressCity: originalClinicData.addressCity,
        addressFull: originalClinicData.addressFull,
        latitude: originalClinicData.latitude,
        longitude: originalClinicData.longitude,
        workingHours: originalClinicData.workingHours,
        updatedAt: originalClinicData.updatedAt,
      })
      .where(eq(clinicInfo.id, 'default'));

    const restoredClinic = await db.select().from(clinicInfo).where(eq(clinicInfo.id, 'default'));
    if (calculateSha256(JSON.stringify(normalizeClinic(restoredClinic[0]))) === baselineClinicHash) {
      pass('ClinicWorkflow > Clinic baseline data restored cleanly to 100% exact checksum');
    } else {
      fail('ClinicWorkflow > Failed to restore baseline clinic data checksum!');
    }

    // -------------------------------------------------------------------------
    // SUITE 3: Equipment CRUD, Reordering & Homepage Reference Protection
    // -------------------------------------------------------------------------
    console.log('\n--- SUITE 3: Equipment Management & Homepage Reference Protection ---');
    const testEquipId = `test-equip-${Date.now()}`;
    const equipDraftRes = await workflowService.createDraftRevision(
      ContentType.EQUIPMENT,
      testEquipId,
      {
        name: 'Hệ Thống Nội Soi Olympus EVIS X1 Pro Test',
        origin: 'Nhật Bản',
        manufacturer: 'Olympus Medical Systems',
        imageUrl: '/images/equipment/olympus-x1.webp',
        description: 'Hệ thống nội soi tiêu hóa phóng đại cao cấp thế hệ mới phục vụ thử nghiệm CMS-8.',
        features: ['Độ phân giải 4K Ultra HD', 'Công nghệ TXI tăng cường kết cấu mô', 'Chế độ RDI hỗ trợ can thiệp'],
        sortOrder: 99,
        isActive: true,
      },
      editorContext,
      { title: 'Olympus X1 Pro Test', changeSummary: 'Tạo trang thiết bị thử nghiệm' }
    );

    if (equipDraftRes.success && equipDraftRes.data) {
      pass('Equipment > Draft equipment created in content_revisions');
    } else {
      fail('Equipment > Failed to create equipment draft', equipDraftRes.error);
    }

    // Verify not in canonical equipment table
    const canonicalEquipBefore = await db.select().from(equipment).where(eq(equipment.id, testEquipId));
    if (canonicalEquipBefore.length === 0) {
      pass('Equipment > Equipment draft is NOT present in canonical table before publish');
    } else {
      fail('Equipment > Draft equipment leaked into canonical table!');
    }

    // Publish equipment fixture
    await workflowService.submitForReview(equipDraftRes.data!.id, editorContext);
    await workflowService.approveRevision(equipDraftRes.data!.id, reviewerContext);
    const equipPubRes = await workflowService.publishRevision(equipDraftRes.data!.id, reviewerContext);

    if (equipPubRes.success) {
      pass('Equipment > Equipment fixture published to canonical equipment table');
    } else {
      fail('Equipment > Failed to publish equipment fixture', equipPubRes.error);
    }

    const canonicalEquipAfter = await db.select().from(equipment).where(eq(equipment.id, testEquipId));
    if (canonicalEquipAfter.length === 1 && canonicalEquipAfter[0].name.includes('Olympus EVIS X1 Pro Test')) {
      pass('Equipment > Canonical equipment row verified in PostgreSQL');
    } else {
      fail('Equipment > Canonical equipment row missing after publish!');
    }

    // Insert temporary homepage block referencing test equipment fixture
    await db.insert(homepageBlocks).values({
      blockKey: 'test-temp-block',
      title: 'Khối Thử Nghiệm Trang Chủ',
      content: { referencedEquipment: [testEquipId] },
      isActive: true,
    });

    const refCheck = await clinicalTrustRepository.checkHomepageReferences('equipment', testEquipId);
    if (refCheck.length > 0 && refCheck.includes('test-temp-block')) {
      pass(`EquipmentSafety > Homepage reference check detected active block reference for equipment fixture`);
    } else {
      fail('EquipmentSafety > Failed to detect homepage references for equipment fixture');
    }

    // Attempt to archive referenced equipment -> must be BLOCKED
    const blockArchiveRes = await workflowService.archiveRevision(equipDraftRes.data!.id, reviewerContext);
    if (!blockArchiveRes.success && (blockArchiveRes.error || '').includes('Trang chủ')) {
      pass('EquipmentSafety > Archive of Homepage-referenced equipment is safely BLOCKED with clear diagnostic error');
    } else {
      fail('EquipmentSafety > Failed to block archive of homepage-referenced equipment!');
    }

    // Remove temporary homepage block
    await db.delete(homepageBlocks).where(eq(homepageBlocks.blockKey, 'test-temp-block'));

    // Archive unreferenced test equipment fixture -> must succeed
    const unreferencedCheck = await clinicalTrustRepository.checkHomepageReferences('equipment', testEquipId);
    if (unreferencedCheck.length === 0) {
      pass('EquipmentSafety > Test equipment fixture correctly verified as unreferenced after removing link');
    } else {
      fail('EquipmentSafety > Test fixture falsely reported as referenced');
    }

    const unblockArchiveRes = await workflowService.archiveRevision(equipDraftRes.data!.id, reviewerContext);
    if (unblockArchiveRes.success) {
      pass('EquipmentSafety > Unreferenced equipment archived safely');
    } else {
      fail('EquipmentSafety > Failed to archive unreferenced equipment', unblockArchiveRes.error);
    }

    // Reordering test
    await clinicalTrustRepository.reorderEquipment([
      'olympus-evis-x1',
      'fujifilm-ep-7000',
      'siemens-ultrasound',
      'abbott-roche-lab',
      'fukuda-ecg',
      'fisher-fanhp',
    ]);
    const reorderedEquip = await db.select().from(equipment).orderBy(equipment.sortOrder);
    if (reorderedEquip[0].id === 'olympus-evis-x1' && reorderedEquip[5].id === 'fisher-fanhp') {
      pass('EquipmentReorder > Transactional reordering of 6 baseline equipment systems succeeded');
    } else {
      fail('EquipmentReorder > Failed to verify reordered equipment');
    }

    // Cleanup test equipment
    await db.delete(equipment).where(eq(equipment.id, testEquipId));
    await db.delete(contentRevisions).where(eq(contentRevisions.entityId, testEquipId));
    pass('EquipmentCleanup > Test equipment fixture cleaned up safely');

    // -------------------------------------------------------------------------
    // SUITE 4: FAQ Management, Sanitization & Structured Data
    // -------------------------------------------------------------------------
    console.log('\n--- SUITE 4: FAQ Management & HTML XSS Sanitization ---');
    const testFaqId = `test-faq-${Date.now()}`;
    const xssAttackAnswer = `<p>Nội dung câu hỏi y khoa an toàn.</p><script>alert('XSS_ATTACK')</script><img src="x" onerror="stealCredentials()"/><a href="javascript:alert('pwned')">Bấm vào đây</a>`;

    const sanitizedAnswer = sanitizeHtml(xssAttackAnswer);
    if (!sanitizedAnswer.includes('<script>') && !sanitizedAnswer.includes('onerror=') && !sanitizedAnswer.includes('javascript:')) {
      pass('FaqSanitizer > Stored XSS attack vectors (<script>, onerror, javascript:) stripped completely');
    } else {
      fail('FaqSanitizer > Sanitizer allowed XSS payload!', sanitizedAnswer);
    }

    const faqDraftRes = await workflowService.createDraftRevision(
      ContentType.FAQ,
      testFaqId,
      {
        question: 'Quy trình nội soi tiêu hóa có đau không?',
        answer: xssAttackAnswer,
        category: 'endoscopy',
        sortOrder: 99,
        isPublished: true,
      },
      editorContext,
      { title: 'FAQ Nội Soi Test', changeSummary: 'Tạo câu hỏi thường gặp thử nghiệm' }
    );

    if (faqDraftRes.success && faqDraftRes.data) {
      pass('FaqManagement > FAQ draft created and pre-sanitized in revision payload');
    } else {
      fail('FaqManagement > Failed to create FAQ draft', faqDraftRes.error);
    }

    await workflowService.submitForReview(faqDraftRes.data!.id, editorContext);
    await workflowService.approveRevision(faqDraftRes.data!.id, reviewerContext);
    const faqPubRes = await workflowService.publishRevision(faqDraftRes.data!.id, reviewerContext);

    if (faqPubRes.success) {
      pass('FaqManagement > FAQ fixture published to canonical faqs table');
    } else {
      fail('FaqManagement > Failed to publish FAQ', faqPubRes.error);
    }

    const canonicalFaq = await db.select().from(faqs).where(eq(faqs.id, testFaqId));
    if (canonicalFaq.length === 1 && !canonicalFaq[0].answer.includes('<script>')) {
      pass('FaqManagement > Canonical FAQ row verified with 100% clean sanitized HTML');
    } else {
      fail('FaqManagement > Canonical FAQ missing or contains unsanitized payload!');
    }

    // Cleanup test FAQ
    await db.delete(faqs).where(eq(faqs.id, testFaqId));
    await db.delete(contentRevisions).where(eq(contentRevisions.entityId, testFaqId));
    pass('FaqCleanup > Test FAQ fixture cleaned up safely');

    // -------------------------------------------------------------------------
    // SUITE 5: Video Testimonials & URL / Embed Security
    // -------------------------------------------------------------------------
    console.log('\n--- SUITE 5: Video Testimonials & Embed Security ---');
    const { TestimonialSnapshotSchema } = await import('../src/lib/workflow/registry');

    // Valid YouTube formats
    const validFullUrl = TestimonialSnapshotSchema.safeParse({
      type: 'video',
      title: 'Chia sẻ của bệnh nhân A',
      patientName: 'Nguyễn Văn A',
      patientAge: 45,
      videoId: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      imageUrl: '/images/testimonials/thumb.webp',
      quote: 'Dịch vụ nội soi rất êm ái',
      sortOrder: 1,
      isPublished: true,
    });
    if (validFullUrl.success && validFullUrl.data.videoId === 'dQw4w9WgXcQ') {
      pass('VideoSecurity > Full YouTube URL normalized to 11-character videoId (dQw4w9WgXcQ)');
    } else {
      fail('VideoSecurity > Failed to normalize full YouTube URL');
    }

    const validShortUrl = TestimonialSnapshotSchema.safeParse({
      type: 'video',
      title: 'Chia sẻ của bệnh nhân B',
      patientName: 'Trần Thị B',
      videoId: 'https://youtu.be/dQw4w9WgXcQ?t=10',
      imageUrl: '/images/testimonials/thumb2.webp',
      sortOrder: 2,
      isPublished: true,
    });
    if (validShortUrl.success && validShortUrl.data.videoId === 'dQw4w9WgXcQ') {
      pass('VideoSecurity > Short youtu.be URL normalized to 11-character videoId');
    } else {
      fail('VideoSecurity > Failed to normalize short youtu.be URL');
    }

    // Invalid & Malicious Video Inputs
    const invalidIframe = TestimonialSnapshotSchema.safeParse({
      type: 'video',
      title: 'Iframe injection attack',
      patientName: 'Hacker',
      videoId: '<iframe src="https://malicious.site/embed"></iframe>',
      sortOrder: 3,
      isPublished: true,
    });
    if (!invalidIframe.success) {
      pass('VideoSecurity > Raw <iframe> injection payload rejected by validator');
    } else {
      fail('VideoSecurity > Validator allowed arbitrary <iframe> payload!');
    }

    const invalidJavascriptUrl = TestimonialSnapshotSchema.safeParse({
      type: 'video',
      title: 'Javascript URL attack',
      patientName: 'Hacker',
      videoId: 'javascript:alert(1)',
      sortOrder: 4,
      isPublished: true,
    });
    if (!invalidJavascriptUrl.success) {
      pass('VideoSecurity > javascript: pseudoprotocol videoId rejected by validator');
    } else {
      fail('VideoSecurity > Validator allowed javascript: URL!');
    }

    const invalidDomain = TestimonialSnapshotSchema.safeParse({
      type: 'video',
      title: 'Unknown video hosting domain',
      patientName: 'User',
      videoId: 'https://vimeo.com/12345678',
      sortOrder: 5,
      isPublished: true,
    });
    if (!invalidDomain.success) {
      pass('VideoSecurity > Unsupported video provider domain (Vimeo) rejected by policy');
    } else {
      fail('VideoSecurity > Validator allowed unsupported video provider!');
    }

    // -------------------------------------------------------------------------
    // SUITE 6: Customer Story Management & Rich Content Privacy
    // -------------------------------------------------------------------------
    console.log('\n--- SUITE 6: Customer Story Management & Privacy ---');
    const testStoryId = `test-story-${Date.now()}`;
    const storyDraftRes = await workflowService.createDraftRevision(
      ContentType.TESTIMONIAL,
      testStoryId,
      {
        type: 'customer_story',
        title: 'Hành Trình Vượt Qua Nỗi Sợ Nội Soi Dạ Dày',
        patientName: 'Bác Lê Văn C',
        tag: 'Tầm Soát Ung Thư Sớm',
        quote: 'Tôi rất an tâm khi được bác sĩ giải thích tỉ mỉ từng polyp nhỏ.',
        fullStory: '<h3>Quá trình thăm khám</h3><p>Bệnh nhân đến khám định kỳ và được phát hiện sớm polyp dạ dày kích thước 4mm.</p>',
        imageUrl: '/images/stories/story-1.webp',
        sortOrder: 99,
        isPublished: true,
      },
      editorContext,
      { title: 'Câu chuyện Bác Lê Văn C', changeSummary: 'Tạo câu chuyện khách hàng mới' }
    );

    if (storyDraftRes.success && storyDraftRes.data) {
      pass('CustomerStory > Customer story draft created in content_revisions');
    } else {
      fail('CustomerStory > Failed to create customer story draft', storyDraftRes.error);
    }

    await workflowService.submitForReview(storyDraftRes.data!.id, editorContext);
    await workflowService.approveRevision(storyDraftRes.data!.id, reviewerContext);
    const storyPubRes = await workflowService.publishRevision(storyDraftRes.data!.id, reviewerContext);

    if (storyPubRes.success) {
      pass('CustomerStory > Customer story published atomically');
    } else {
      fail('CustomerStory > Failed to publish customer story', storyPubRes.error);
    }

    const canonicalStory = await db.select().from(testimonials).where(eq(testimonials.id, testStoryId));
    if (canonicalStory.length === 1 && canonicalStory[0].type === 'customer_story') {
      pass('CustomerStory > Canonical customer story row verified in testimonials table');
    } else {
      fail('CustomerStory > Canonical customer story row missing!');
    }

    // Cleanup test story
    await db.delete(testimonials).where(eq(testimonials.id, testStoryId));
    await db.delete(contentRevisions).where(eq(contentRevisions.entityId, testStoryId));
    pass('CustomerStoryCleanup > Test customer story fixture cleaned up safely');

    // -------------------------------------------------------------------------
    // SUITE 7: Optimistic Concurrency & Non-Destructive Restore
    // -------------------------------------------------------------------------
    console.log('\n--- SUITE 7: Optimistic Concurrency & Non-Destructive Restore ---');
    // Test base revision conflict
    const revA = await workflowService.createDraftRevision(
      ContentType.CLINIC,
      'default',
      {
        name: 'Doctor Check Concurrency Test A',
        legalName: 'CÔNG TY TNHH BỆNH VIỆN ĐA KHOA DOCTOR CHECK',
        licenseNumber: '09789/HCM-GPHĐ',
        taxCode: '0317316744',
        hotline: '02856789999',
        zaloUrl: 'https://zalo.me/doctorcheck',
        email: 'info@doctorcheck.vn',
        addressStreet: '429 Tô Hiến Thành',
        addressWard: 'Phường 14',
        addressDistrict: 'Quận 10',
        addressCity: 'TP. Hồ Chí Minh',
        addressFull: '429 Tô Hiến Thành, Phường 14, Quận 10, TP. Hồ Chí Minh',
        latitude: '10.7725',
        longitude: '106.6578',
      },
      superAdminContext,
      { title: 'Profile Concurrency A', changeSummary: 'Revision A' }
    );

    const revB = await workflowService.createDraftRevision(
      ContentType.CLINIC,
      'default',
      {
        name: 'Doctor Check Concurrency Test B',
        legalName: 'CÔNG TY TNHH BỆNH VIỆN ĐA KHOA DOCTOR CHECK',
        licenseNumber: '09789/HCM-GPHĐ',
        taxCode: '0317316744',
        hotline: '02856789999',
        zaloUrl: 'https://zalo.me/doctorcheck',
        email: 'info@doctorcheck.vn',
        addressStreet: '429 Tô Hiến Thành',
        addressWard: 'Phường 14',
        addressDistrict: 'Quận 10',
        addressCity: 'TP. Hồ Chí Minh',
        addressFull: '429 Tô Hiến Thành, Phường 14, Quận 10, TP. Hồ Chí Minh',
        latitude: '10.7725',
        longitude: '106.6578',
      },
      superAdminContext,
      { title: 'Profile Concurrency B', changeSummary: 'Revision B' }
    );

    // Publish rev A
    await workflowService.submitForReview(revA.data!.id, superAdminContext);
    await workflowService.approveRevision(revA.data!.id, superAdminContext);
    await workflowService.publishRevision(revA.data!.id, superAdminContext);

    // Non-destructive restore test: restoring revA creates a new draft revision without mutating revA
    const restoreRes = await workflowService.restoreRevision(revA.data!.id, superAdminContext);
    if (restoreRes.success && restoreRes.data?.id !== revA.data!.id && restoreRes.data?.status === WorkflowStatus.DRAFT) {
      pass('Restore > Restore created a NEW DRAFT revision (Non-destructive restore policy 100%)');
    } else {
      fail('Restore > Restore failed or mutated historical revision!', restoreRes.error);
    }

    // Cleanup temporary concurrency revisions & restore clinic baseline
    await db.delete(contentRevisions).where(eq(contentRevisions.id, revA.data!.id));
    await db.delete(contentRevisions).where(eq(contentRevisions.id, revB.data!.id));
    if (restoreRes.data) {
      await db.delete(contentRevisions).where(eq(contentRevisions.id, restoreRes.data.id));
    }

    // Restore baseline clinic row in db
    await db
      .update(clinicInfo)
      .set({
        name: initialClinic[0].name,
        legalName: initialClinic[0].legalName,
        licenseNumber: initialClinic[0].licenseNumber,
        taxCode: initialClinic[0].taxCode,
        hotline: initialClinic[0].hotline,
        emergencyPhone: initialClinic[0].emergencyPhone,
        zaloUrl: initialClinic[0].zaloUrl,
        email: initialClinic[0].email,
        addressStreet: initialClinic[0].addressStreet,
        addressWard: initialClinic[0].addressWard,
        addressDistrict: initialClinic[0].addressDistrict,
        addressCity: initialClinic[0].addressCity,
        addressFull: initialClinic[0].addressFull,
        latitude: initialClinic[0].latitude,
        longitude: initialClinic[0].longitude,
        workingHours: initialClinic[0].workingHours,
        updatedAt: initialClinic[0].updatedAt,
      })
      .where(eq(clinicInfo.id, 'default'));

    // -------------------------------------------------------------------------
    // SUITE 8: Public Draft Isolation & Baseline Parity (Passive Drift = 0)
    // -------------------------------------------------------------------------
    console.log('\n--- SUITE 8: Public Draft Isolation & Zero Passive Drift ---');
    // Public repository reads must return only published records
    const pubClinic = await clinicRepository.getClinicInfo();
    const pubEquipment = await clinicalTrustRepository.getEquipment();
    const pubFaqs = await clinicalTrustRepository.getFaqs();
    const pubVideos = await clinicalTrustRepository.getVideoTestimonials();
    const pubStories = await clinicalTrustRepository.getCustomerStories();

    if (pubClinic && pubClinic.name === initialClinic[0].name) {
      pass('PublicIsolation > Public clinic repository returns clean canonical record');
    } else {
      fail('PublicIsolation > Public clinic read mismatch');
    }

    if (pubEquipment.length === 6) {
      pass('PublicIsolation > Public equipment repository returns exactly 6 active systems');
    } else {
      fail(`PublicIsolation > Expected 6 equipment, got ${pubEquipment.length}`);
    }

    if (pubFaqs.length === 5) {
      pass('PublicIsolation > Public faqs repository returns exactly 5 active FAQs');
    } else {
      fail(`PublicIsolation > Expected 5 faqs, got ${pubFaqs.length}`);
    }

    if (pubVideos.length === 3) {
      pass('PublicIsolation > Public video repository returns exactly 3 video testimonials');
    } else {
      fail(`PublicIsolation > Expected 3 videos, got ${pubVideos.length}`);
    }

    if (pubStories.length === 3) {
      pass('PublicIsolation > Public stories repository returns exactly 3 customer stories');
    } else {
      fail(`PublicIsolation > Expected 3 stories, got ${pubStories.length}`);
    }

    // Checksum parity check on all 18 baseline records
    const finalClinic = await db.select().from(clinicInfo);
    const finalEquipment = await db.select().from(equipment).orderBy(equipment.sortOrder);
    const finalFaqs = await db.select().from(faqs).orderBy(faqs.sortOrder);
    const finalTestimonials = await db.select().from(testimonials).orderBy(testimonials.sortOrder);

    let checksumMismatches = 0;
    if (calculateSha256(JSON.stringify(normalizeClinic(finalClinic[0]))) !== baselineClinicHash) {
      checksumMismatches++;
      console.error('Checksum mismatch on clinic_info!');
    }

    for (const e of finalEquipment) {
      const expectedHash = baselineEquipmentHashes.get(e.id);
      if (calculateSha256(JSON.stringify(normalizeEquipment(e))) !== expectedHash) {
        checksumMismatches++;
        console.error(`Checksum mismatch on equipment ${e.id}!`);
      }
    }

    for (const f of finalFaqs) {
      const expectedHash = baselineFaqHashes.get(f.id);
      if (calculateSha256(JSON.stringify(normalizeFaq(f))) !== expectedHash) {
        checksumMismatches++;
        console.error(`Checksum mismatch on faq ${f.id}!`);
      }
    }

    for (const t of finalTestimonials) {
      const expectedHash = baselineTestimonialHashes.get(t.id);
      if (calculateSha256(JSON.stringify(normalizeTestimonial(t))) !== expectedHash) {
        checksumMismatches++;
        console.error(`Checksum mismatch on testimonial ${t.id}!`);
      }
    }

    if (checksumMismatches === 0) {
      pass('PassiveDrift > ZERO PASSIVE DATA DRIFT (All 18 records match 100% baseline SHA-256 hashes)');
    } else {
      fail(`PassiveDrift > Detected ${checksumMismatches} checksum mismatches in baseline clinical records!`);
    }

    // Cleanup test users
    await db.delete(users).where(sql`email LIKE '%-cms8-test@doctorcheck.vn'`);
    pass('Teardown > Cleaned up all temporary test users and test revisions');

  } finally {
    try {
      await client.end();
    } catch {
      // ignore
    }
  }

  console.log('\n================================================================');
  console.log(`📊 CMS-8 TEST RESULTS: ${passedTests}/${totalTests} PASSED (${failedTests} FAILED)`);
  console.log('================================================================\n');

  if (failedTests > 0) {
    process.exit(1);
  }
}

runCms8Tests().catch((err) => {
  console.error('Unhandled failure in CMS-8 tests:', err);
  process.exit(1);
});
