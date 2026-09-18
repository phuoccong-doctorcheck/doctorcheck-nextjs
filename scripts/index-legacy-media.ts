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

interface ScannedFile {
  absolutePath: string;
  relativePath: string;
  publicUrl: string;
  filename: string;
  sizeBytes: number;
  extension: string;
  mimeType: string;
  checksum: string;
}

const SUPPORTED_EXTENSIONS: Record<string, string> = {
  '.webp': 'image/webp',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
};

function getMimeType(ext: string): string | null {
  return SUPPORTED_EXTENSIONS[ext.toLowerCase()] || null;
}

function computeFileChecksum(filePath: string): string {
  const buffer = fs.readFileSync(filePath);
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

export async function runLegacyMediaIndexer() {
  console.log('========================================================================');
  console.log('🖼️  CMS-3: LEGACY MEDIA ASSET INDEXER (IMMUTABLE IMPORT)');
  console.log('========================================================================\n');

  const { db } = await import('../src/db');
  const { media } = await import('../src/db/schema/media');
  const { eq } = await import('drizzle-orm');

  const publicDir = path.join(process.cwd(), 'public');
  const targetScanDir = path.join(publicDir, 'sites', 'doctorcheck-vn', 'root', 'images');

  if (!fs.existsSync(targetScanDir)) {
    console.error(`❌ Scan directory does not exist: ${targetScanDir}`);
    process.exit(1);
  }

  let filesScanned = 0;
  let filesEligible = 0;
  let filesInserted = 0;
  let filesUpdated = 0;
  let filesSkipped = 0;
  let duplicates = 0;
  let errors = 0;

  const preChecksums = new Map<string, string>();
  const eligibleFiles: ScannedFile[] = [];

  // 1. Recursive Scan
  function scanDirectory(currentDir: string) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);

      if (entry.isDirectory()) {
        scanDirectory(fullPath);
      } else if (entry.isFile()) {
        filesScanned++;
        const ext = path.extname(entry.name).toLowerCase();
        const mime = getMimeType(ext);

        if (!mime || entry.name.startsWith('.')) {
          filesSkipped++;
          continue;
        }

        const size = fs.statSync(fullPath).size;
        const checksum = computeFileChecksum(fullPath);
        preChecksums.set(fullPath, checksum);

        const relFromPublic = path.relative(publicDir, fullPath).replace(/\\/g, '/');
        const publicUrl = `/${relFromPublic}`;

        eligibleFiles.push({
          absolutePath: fullPath,
          relativePath: relFromPublic,
          publicUrl,
          filename: entry.name,
          sizeBytes: size,
          extension: ext,
          mimeType: mime,
          checksum,
        });

        filesEligible++;
      }
    }
  }

  console.log(`📂 Scanning directory: ${targetScanDir}...`);
  scanDirectory(targetScanDir);
  console.log(`Found ${filesEligible} eligible media files out of ${filesScanned} total files scanned.\n`);

  // 2. Index into PostgreSQL
  console.log('🔄 Indexing into PostgreSQL `media` table (Idempotent upsert)...');

  for (const file of eligibleFiles) {
    try {
      let width: number | null = null;
      let height: number | null = null;
      let metaObj: Record<string, unknown> = {};

      if (file.mimeType === 'image/svg+xml') {
        const svgContent = fs.readFileSync(file.absolutePath, 'utf-8');
        const widthMatch = svgContent.match(/width=["'](\d+)["']/i);
        const heightMatch = svgContent.match(/height=["'](\d+)["']/i);
        width = widthMatch ? parseInt(widthMatch[1], 10) : null;
        height = heightMatch ? parseInt(heightMatch[1], 10) : null;
        metaObj = { format: 'svg', isVector: true };
      } else {
        const meta = await sharp(file.absolutePath).metadata();
        width = meta.width ?? null;
        height = meta.height ?? null;
        metaObj = {
          format: meta.format,
          space: meta.space,
          channels: meta.channels,
          density: meta.density,
          isAnimated: (meta.pages ?? 1) > 1,
        };
      }

      // Check if existing record exists by storagePath
      const [existing] = await db.select().from(media).where(eq(media.storagePath, file.publicUrl));

      if (existing) {
        // Idempotent update of technical metrics without overwriting custom altText/caption
        await db
          .update(media)
          .set({
            fileSizeBytes: file.sizeBytes,
            width,
            height,
            checksum: file.checksum,
            mimeType: file.mimeType,
            metadata: metaObj,
            updatedAt: new Date(),
          })
          .where(eq(media.id, existing.id));

        filesUpdated++;
        duplicates++;
      } else {
        // Insert new record
        const friendlyAlt = file.filename
          .replace(/\.[^.]+$/, '')
          .replace(/[-_]+/g, ' ')
          .trim();

        await db.insert(media).values({
          filename: file.filename,
          originalFilename: file.filename,
          storageProvider: 'legacy_public',
          storagePath: file.publicUrl,
          storageKey: file.relativePath,
          publicUrl: file.publicUrl,
          thumbnailUrl: file.publicUrl, // For legacy assets, use existing optimized URL
          altText: friendlyAlt,
          caption: null,
          mimeType: file.mimeType,
          fileSizeBytes: file.sizeBytes,
          width,
          height,
          checksum: file.checksum,
          status: 'active',
          metadata: metaObj,
        });

        filesInserted++;
      }
    } catch (err: unknown) {
      console.error(`❌ Error indexing ${file.filename}:`, err);
      errors++;
    }
  }

  // 3. Post-Indexing Integrity Check
  console.log('\n🔒 Verifying Legacy File Integrity (Zero Mutation Guarantee)...');
  let integrityFailed = 0;
  for (const [filePath, originalChecksum] of preChecksums.entries()) {
    const currentChecksum = computeFileChecksum(filePath);
    if (originalChecksum !== currentChecksum) {
      console.error(`❌ MUTATION DETECTED in file: ${filePath}`);
      integrityFailed++;
    }
  }

  if (integrityFailed === 0) {
    console.log('✅ 100% Legacy Asset Integrity Verified: 0 bytes modified, 0 files renamed or converted.');
  }

  console.log('\n========================================================================');
  console.log('📊 LEGACY MEDIA INDEXING SUMMARY:');
  console.log(`   - FILES SCANNED:    ${filesScanned}`);
  console.log(`   - FILES ELIGIBLE:   ${filesEligible}`);
  console.log(`   - FILES INSERTED:   ${filesInserted}`);
  console.log(`   - FILES UPDATED:    ${filesUpdated}`);
  console.log(`   - FILES SKIPPED:    ${filesSkipped}`);
  console.log(`   - DUPLICATES:       ${duplicates}`);
  console.log(`   - ERRORS:           ${errors}`);
  console.log(`   - INTEGRITY CHECK:  ${integrityFailed === 0 ? 'PASS (0 mutations)' : 'FAIL'}`);
  console.log('========================================================================\n');

  return {
    filesScanned,
    filesEligible,
    filesInserted,
    filesUpdated,
    filesSkipped,
    duplicates,
    errors,
    integrityPass: integrityFailed === 0,
  };
}

if (require.main === module) {
  runLegacyMediaIndexer()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('❌ Indexing failed:', err);
      process.exit(1);
    });
}
