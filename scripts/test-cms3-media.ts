import * as dotenv from 'dotenv';

// Stub 'server-only' for Node standalone execution
require.cache[require.resolve('server-only')] = {
  id: require.resolve('server-only'),
  filename: require.resolve('server-only'),
  loaded: true,
  exports: {},
} as unknown as NodeModule;

dotenv.config({ path: '.env.local' });

import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import sharp from 'sharp';

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

async function runCms3MediaTestSuite() {
  console.log('========================================================================');
  console.log('🧪 CMS-3 SECURE MEDIA MANAGEMENT SYSTEM TEST SUITE');
  console.log('========================================================================\n');

  const { db, client } = await import('../src/db');
  const { media } = await import('../src/db/schema/media');
  const { auditLogs } = await import('../src/db/schema/audit');
  const { eq, sql } = await import('drizzle-orm');
  const { mediaRepository } = await import('../src/repositories');
  const { mediaService } = await import('../src/services/media.service');
  const { getStorageAdapter, LocalStorageAdapter } = await import('../src/lib/storage');
  const { Role, Permission, hasPermission } = await import('../src/lib/auth/rbac');

  try {
    // -------------------------------------------------------------------------
    // TEST SUITE 1: Database Schema & Legacy Indexing Parity
    // -------------------------------------------------------------------------
    console.log('📦 1. Database Schema & Legacy Indexing Parity:');

    const [countResult] = await db.select({ count: sql<number>`count(*)::int` }).from(media);
    const mediaCount = countResult?.count ?? 0;
    assert(mediaCount >= 52, `PostgreSQL 'media' table contains all 52 legacy assets (Actual: ${mediaCount})`);

    // Verify sample legacy image record
    const doctorImg = await mediaRepository.getByStoragePath(
      '/sites/doctorcheck-vn/root/images/doctors/chau-quynh-phi-nha.webp'
    );
    assert(Boolean(doctorImg), 'Found legacy doctor image record by storage path');
    if (doctorImg) {
      assert(doctorImg.storageProvider === 'legacy_public', 'Legacy image marked with storageProvider: legacy_public');
      assert(doctorImg.mimeType === 'image/webp', 'MIME type correctly identified as image/webp');
      assert(Boolean(doctorImg.checksum && doctorImg.checksum.length === 64), 'SHA-256 checksum computed and stored');
      assert(Boolean(doctorImg.width && doctorImg.height), `Dimensions extracted via Sharp (${doctorImg.width}x${doctorImg.height})`);
      assert(doctorImg.status === 'active', 'Status set to active');
    }

    // -------------------------------------------------------------------------
    // TEST SUITE 2: Legacy File Integrity (0 Mutations Guarantee)
    // -------------------------------------------------------------------------
    console.log('\n📦 2. Legacy Asset File Integrity & Immutability:');

    const sampleLegacyDiskPath = path.join(
      process.cwd(),
      'public/sites/doctorcheck-vn/root/images/doctors/chau-quynh-phi-nha.webp'
    );
    assert(fs.existsSync(sampleLegacyDiskPath), 'Legacy image file exists on disk at original path');

    const sampleBuffer = fs.readFileSync(sampleLegacyDiskPath);
    const sampleChecksum = crypto.createHash('sha256').update(sampleBuffer).digest('hex');
    assert(
      doctorImg?.checksum === sampleChecksum,
      'Database checksum matches exact disk file checksum (0 bytes modified)'
    );

    // -------------------------------------------------------------------------
    // TEST SUITE 3: Storage Adapter & Path Traversal Security
    // -------------------------------------------------------------------------
    console.log('\n📦 3. Storage Adapter & Path Traversal Protection:');

    const storageAdapter = getStorageAdapter();
    assert(storageAdapter.providerName === 'local', 'Storage adapter resolves to local provider');

    // Create a valid 10x10 PNG buffer via Sharp
    const testPngBuffer = await sharp({
      create: {
        width: 10,
        height: 10,
        channels: 4,
        background: { r: 0, g: 150, b: 255, alpha: 1 },
      },
    })
      .png()
      .toBuffer();

    // Test malicious path traversal filename
    const traversalResult = await storageAdapter.upload({
      buffer: testPngBuffer,
      originalFilename: '../../../../etc/passwd.png',
      mimeType: 'image/png',
      sizeBytes: testPngBuffer.length,
    });

    assert(
      !traversalResult.storageKey.includes('..'),
      `Path traversal sanitized out of storage key: ${traversalResult.storageKey}`
    );
    assert(
      traversalResult.storagePath.startsWith('/uploads/media/'),
      `Storage path correctly nested under /uploads/media/: ${traversalResult.storagePath}`
    );
    assert(Boolean(traversalResult.thumbnailUrl), 'Thumbnail generated for test image');

    // Cleanup traversal test file
    await storageAdapter.delete(traversalResult.storageKey, traversalResult.thumbnailUrl);

    // -------------------------------------------------------------------------
    // TEST SUITE 4: Upload Validation & Security Pipeline
    // -------------------------------------------------------------------------
    console.log('\n📦 4. Upload Validation & Security Pipeline:');

    // 4.1 Reject SVG Upload
    const fakeSvgBuffer = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>');
    const svgUploadResult = await mediaService.uploadMedia(
      fakeSvgBuffer,
      'xss.svg',
      'image/svg+xml'
    );
    assert(
      !svgUploadResult.success && Boolean(svgUploadResult.error?.includes('SVG')),
      'SVG upload blocked with clear security explanation'
    );

    // 4.2 Reject Fake JPG with text content
    const fakeJpgBuffer = Buffer.from('NOT AN IMAGE FILE CONTENT');
    const fakeJpgResult = await mediaService.uploadMedia(
      fakeJpgBuffer,
      'malicious.jpg',
      'image/jpeg'
    );
    assert(
      !fakeJpgResult.success,
      'Fake JPG containing text rejected by magic byte / decoder check'
    );

    // 4.3 Reject Oversized Buffer (>10MB)
    const oversizedBuffer = Buffer.alloc(11 * 1024 * 1024); // 11MB
    const oversizedResult = await mediaService.uploadMedia(
      oversizedBuffer,
      'huge.png',
      'image/png'
    );
    assert(
      !oversizedResult.success && Boolean(oversizedResult.error?.includes('10MB')),
      'Oversized file (>10MB) rejected with size limit error'
    );

    // 4.4 Authorized Valid PNG Upload
    const validUpload = await mediaService.uploadMedia(
      testPngBuffer,
      'doctorcheck-test-icon.png',
      'image/png',
      {
        altText: 'Biểu tượng kiểm tra y khoa',
        caption: 'Ảnh thử nghiệm hệ thống CMS-3',
      }
    );

    assert(validUpload.success && Boolean(validUpload.data?.id), 'Valid PNG upload succeeded');
    const uploadedMedia = validUpload.data!;

    assert(uploadedMedia.storageProvider === 'local', 'Uploaded media marked with storageProvider: local');
    assert(uploadedMedia.width === 10 && uploadedMedia.height === 10, 'Width & height extracted accurately (10x10)');
    assert(uploadedMedia.altText === 'Biểu tượng kiểm tra y khoa', 'Alt text persisted correctly');
    assert(uploadedMedia.caption === 'Ảnh thử nghiệm hệ thống CMS-3', 'Caption persisted correctly');

    // -------------------------------------------------------------------------
    // TEST SUITE 5: Metadata Updates & Audit Logging
    // -------------------------------------------------------------------------
    console.log('\n📦 5. Metadata Updates & Audit Trail:');

    const updateResult = await mediaService.updateMediaMetadata(uploadedMedia.id, {
      altText: '<b>HTML Tag Stripped</b> Biểu tượng cập nhật',
      caption: 'Chú thích mới cập nhật',
    });

    assert(updateResult.success && Boolean(updateResult.data), 'Metadata update succeeded');
    assert(
      updateResult.data?.altText === 'HTML Tag Stripped Biểu tượng cập nhật',
      'HTML tags sanitized from alt text'
    );

    // Verify audit log
    const [auditLog] = await db
      .select()
      .from(auditLogs)
      .where(eq(auditLogs.entityId, uploadedMedia.id))
      .orderBy(sql`${auditLogs.createdAt} desc`)
      .limit(1);

    assert(Boolean(auditLog), 'Audit log entry created for media mutation');
    assert(
      auditLog?.action === 'MEDIA_METADATA_UPDATE' || auditLog?.action === 'MEDIA_UPLOAD',
      `Audit action verified: ${auditLog?.action}`
    );

    // -------------------------------------------------------------------------
    // TEST SUITE 6: Multi-Domain Reference Checking
    // -------------------------------------------------------------------------
    console.log('\n📦 6. Multi-Domain Reference Checking:');

    // Check doctor image references
    const doctorRefs = await mediaRepository.checkReferences(
      '/sites/doctorcheck-vn/root/images/doctors/chau-quynh-phi-nha.webp'
    );
    assert(doctorRefs.length > 0, `Detected references for doctor image: ${doctorRefs.length} references`);
    assert(
      doctorRefs.some((r) => r.domain === 'doctors'),
      'Reference correctly identified in doctors domain'
    );

    // Check unreferenced uploaded test image
    const testRefs = await mediaRepository.checkReferences(uploadedMedia.id);
    assert(testRefs.length === 0, 'Unreferenced newly uploaded image returns 0 references');

    // -------------------------------------------------------------------------
    // TEST SUITE 7: Safe Deletion & Archive Policies
    // -------------------------------------------------------------------------
    console.log('\n📦 7. Safe Deletion & Archive Policy Enforcement:');

    // 7.1 Legacy asset deletion attempt -> BLOCKED
    if (doctorImg) {
      const deleteLegacyResult = await mediaService.deleteMedia(doctorImg.id);
      assert(
        !deleteLegacyResult.success && Boolean(deleteLegacyResult.error?.includes('legacy')),
        'Physical deletion of legacy public asset is strictly BLOCKED'
      );
    }

    // 7.2 Archive test image -> ALLOWED
    const archiveResult = await mediaService.archiveMedia(uploadedMedia.id);
    assert(archiveResult.success && archiveResult.data?.status === 'archived', 'Archiving media item succeeds');

    // 7.3 Unreferenced uploaded media deletion -> ALLOWED
    const deleteUploadedResult = await mediaService.deleteMedia(uploadedMedia.id);
    assert(deleteUploadedResult.success, 'Deletion of unreferenced uploaded media succeeds');

    // Verify DB row gone
    const checkDeleted = await mediaRepository.getById(uploadedMedia.id);
    assert(checkDeleted === null, 'Media row removed from PostgreSQL after delete');

    // -------------------------------------------------------------------------
    // TEST SUITE 8: Search, MIME Filtering & Pagination
    // -------------------------------------------------------------------------
    console.log('\n📦 8. Search, MIME Filtering & Pagination:');

    const searchResult = await mediaRepository.list({ search: 'doctor', limit: 10 });
    assert(searchResult.items.length > 0, `Search by 'doctor' returns matching items (${searchResult.items.length})`);

    const webpResult = await mediaRepository.list({ mimeType: 'image/webp', limit: 10 });
    assert(
      webpResult.items.every((i) => i.mimeType === 'image/webp'),
      'MIME type filter strictly returns only WebP items'
    );

    const paginatedResult = await mediaRepository.list({ limit: 5, offset: 0 });
    assert(paginatedResult.items.length === 5, 'Pagination limit of 5 respected');
    assert(paginatedResult.total >= 52, `Total count reported correctly (${paginatedResult.total})`);

    // -------------------------------------------------------------------------
    // TEST SUITE 9: RBAC Permission Verification
    // -------------------------------------------------------------------------
    console.log('\n📦 9. RBAC Permission Boundaries:');

    assert(
      hasPermission([Role.SUPER_ADMIN], [], Permission.MEDIA_UPLOAD),
      'SUPER_ADMIN has media.upload permission'
    );
    assert(
      hasPermission([Role.ADMIN], [Permission.MEDIA_UPLOAD], Permission.MEDIA_UPLOAD),
      'ADMIN has media.upload permission'
    );
    assert(
      !hasPermission(['anonymous'], [], Permission.MEDIA_UPLOAD),
      'Anonymous user denied media.upload'
    );
    assert(
      hasPermission([Role.SUPER_ADMIN], [], Permission.MEDIA_DELETE),
      'SUPER_ADMIN has media.delete permission'
    );
    assert(
      !hasPermission([Role.EDITOR], [Permission.MEDIA_UPLOAD], Permission.MEDIA_DELETE),
      'EDITOR without media.delete denied media deletion'
    );

    console.log('\n========================================================================');
    console.log(`🎉 CMS-3 MEDIA TEST SUITE RESULTS: ${passCount} PASSED, ${failCount} FAILED`);
    console.log('========================================================================\n');

    if (failCount > 0) {
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Unhandled Exception in CMS-3 Test Suite:', error);
    process.exit(1);
  } finally {
    try {
      const { client } = await import('../src/db');
      await client.end();
    } catch {
      // ignore
    }
  }
}

runCms3MediaTestSuite();
