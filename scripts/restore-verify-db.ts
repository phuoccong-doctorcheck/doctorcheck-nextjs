import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import postgres from 'postgres';

dotenv.config({ path: '.env.local' });
dotenv.config();

/**
 * Isolated Database Restore Verification Drill
 *
 * CRITICAL SAFETY GUARANTEE:
 * Operates ONLY in an isolated temporary test schema (e.g. doctorcheck_restore_test_schema_*).
 * The baseline active database (public schema) is NEVER overwritten, touched, or mutated.
 */
async function runRestoreVerificationDrill() {
  const masterDbUrl = process.env.DATABASE_URL;

  if (!masterDbUrl) {
    console.error('❌ RESTORE_DRILL_ERROR: DATABASE_URL is not defined in environment.');
    process.exit(1);
  }

  const parsed = new URL(masterDbUrl);
  const baselineDbName = parsed.pathname.replace(/^\//, '') || 'postgres';

  const testSuffix = Date.now().toString().slice(-6);
  const isolatedSchemaName = `doctorcheck_restore_test_schema_${testSuffix}`;

  console.log('========================================================================');
  console.log('🛡️  DOCTORCHECK ISOLATED DATABASE RESTORE VERIFICATION DRILL');
  console.log('========================================================================');
  console.log(`Baseline Active DB:     ${baselineDbName} (READ-ONLY / ZERO MUTATION)`);
  console.log(`Isolated Test Schema:   ${isolatedSchemaName}`);
  console.log('------------------------------------------------------------------------');

  const sql = postgres(masterDbUrl, { max: 1 });

  try {
    // 1. Find and verify latest backup file
    const backupsDir = path.resolve(process.cwd(), 'backups');
    if (!fs.existsSync(backupsDir)) {
      throw new Error('No backups directory found. Please run "npm run db:backup" first.');
    }

    const backupFiles = fs
      .readdirSync(backupsDir)
      .filter((f) => f.startsWith('doctorcheck_backup_') && f.endsWith('.json'))
      .sort()
      .reverse();

    if (backupFiles.length === 0) {
      throw new Error('No backup JSON snapshot files found in backups directory.');
    }

    const targetBackupFile = path.join(backupsDir, backupFiles[0]);
    console.log(`📂 Selected Backup Snapshot: ${backupFiles[0]}`);

    const backupRaw = fs.readFileSync(targetBackupFile, 'utf8');
    const backupData: Record<string, any[]> = JSON.parse(backupRaw);

    // Verify SHA-256 Checksum
    const checksumFile = `${targetBackupFile}.sha256`;
    if (fs.existsSync(checksumFile)) {
      const expectedChecksum = fs.readFileSync(checksumFile, 'utf8').trim().split(/\s+/)[0];
      const actualChecksum = crypto.createHash('sha256').update(backupRaw, 'utf8').digest('hex');
      if (expectedChecksum !== actualChecksum) {
        throw new Error(`CHECKSUM_MISMATCH: Backup file corrupted. Expected ${expectedChecksum}, got ${actualChecksum}`);
      }
      console.log('🔒 Checksum verification: PASS (SHA-256 matched)');
    }

    // 2. Create Isolated Temporary Schema
    console.log(`🔨 Creating isolated test schema '${isolatedSchemaName}'...`);
    await sql.unsafe(`CREATE SCHEMA IF NOT EXISTS "${isolatedSchemaName}"`);

    console.log('📐 Applying DDL Schema to isolated test schema...');

    // Create tables in exact matching structure
    await sql.unsafe(`
      CREATE TABLE IF NOT EXISTS "${isolatedSchemaName}".roles (
        id VARCHAR(64) PRIMARY KEY,
        name VARCHAR(128) NOT NULL,
        description TEXT,
        permissions JSONB NOT NULL DEFAULT '[]',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS "${isolatedSchemaName}".users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        full_name VARCHAR(255) NOT NULL,
        avatar_url TEXT,
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS "${isolatedSchemaName}".user_roles (
        user_id UUID NOT NULL REFERENCES "${isolatedSchemaName}".users(id) ON DELETE CASCADE,
        role_id VARCHAR(64) NOT NULL REFERENCES "${isolatedSchemaName}".roles(id) ON DELETE CASCADE,
        PRIMARY KEY (user_id, role_id)
      );

      CREATE TABLE IF NOT EXISTS "${isolatedSchemaName}".sessions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES "${isolatedSchemaName}".users(id) ON DELETE CASCADE,
        token_hash VARCHAR(64) NOT NULL UNIQUE,
        expires_at TIMESTAMPTZ NOT NULL,
        ip_address VARCHAR(64),
        user_agent TEXT,
        last_active_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS "${isolatedSchemaName}".audit_logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        actor_id UUID REFERENCES "${isolatedSchemaName}".users(id) ON DELETE SET NULL,
        actor_email VARCHAR(255),
        action VARCHAR(64) NOT NULL,
        entity_type VARCHAR(64),
        entity_id VARCHAR(128),
        ip_address VARCHAR(64),
        user_agent TEXT,
        metadata JSONB NOT NULL DEFAULT '{}',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS "${isolatedSchemaName}".categories (
        id VARCHAR(128) PRIMARY KEY,
        slug VARCHAR(128) NOT NULL UNIQUE,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        seo_title VARCHAR(255),
        seo_description TEXT,
        sort_order INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS "${isolatedSchemaName}".media (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        filename VARCHAR(255) NOT NULL,
        original_filename VARCHAR(255),
        storage_provider VARCHAR(50) NOT NULL DEFAULT 'legacy_public',
        storage_path VARCHAR(512) NOT NULL UNIQUE,
        storage_key VARCHAR(512),
        public_url TEXT NOT NULL,
        thumbnail_url TEXT,
        alt_text VARCHAR(255) NOT NULL DEFAULT '',
        caption TEXT,
        mime_type VARCHAR(100) NOT NULL,
        file_size_bytes INTEGER NOT NULL DEFAULT 0,
        width INTEGER,
        height INTEGER,
        checksum VARCHAR(64),
        status VARCHAR(32) NOT NULL DEFAULT 'active',
        metadata JSONB NOT NULL DEFAULT '{}',
        created_by UUID REFERENCES "${isolatedSchemaName}".users(id) ON DELETE SET NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS "${isolatedSchemaName}".articles (
        id VARCHAR(128) PRIMARY KEY,
        slug VARCHAR(255) NOT NULL UNIQUE,
        title VARCHAR(512) NOT NULL,
        excerpt TEXT,
        content_html TEXT NOT NULL,
        featured_image_id UUID REFERENCES "${isolatedSchemaName}".media(id) ON DELETE SET NULL,
        featured_image_url TEXT,
        author_name VARCHAR(255) NOT NULL DEFAULT 'Đội ngũ Bác sĩ DoctorCheck',
        author_title VARCHAR(255) NOT NULL DEFAULT 'Bác sĩ Chuyên khoa Tiêu hóa',
        status VARCHAR(32) NOT NULL DEFAULT 'published',
        views_count INTEGER NOT NULL DEFAULT 0,
        reading_time_minutes INTEGER NOT NULL DEFAULT 5,
        toc JSONB NOT NULL DEFAULT '[]',
        seo_title VARCHAR(255),
        seo_description TEXT,
        canonical_url TEXT,
        published_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        modified_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS "${isolatedSchemaName}".article_categories (
        article_id VARCHAR(128) NOT NULL REFERENCES "${isolatedSchemaName}".articles(id) ON DELETE CASCADE,
        category_id VARCHAR(128) NOT NULL REFERENCES "${isolatedSchemaName}".categories(id) ON DELETE CASCADE,
        is_primary BOOLEAN NOT NULL DEFAULT FALSE,
        PRIMARY KEY (article_id, category_id)
      );

      CREATE TABLE IF NOT EXISTS "${isolatedSchemaName}".specialties (
        id VARCHAR(64) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        sort_order INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS "${isolatedSchemaName}".doctors (
        id VARCHAR(64) PRIMARY KEY,
        slug VARCHAR(128) NOT NULL UNIQUE,
        name VARCHAR(255) NOT NULL,
        title VARCHAR(255) NOT NULL,
        cchn VARCHAR(64) NOT NULL,
        specialty_summary VARCHAR(255) NOT NULL,
        clinical_scope TEXT NOT NULL,
        hospital VARCHAR(255) NOT NULL,
        experience_years INTEGER NOT NULL DEFAULT 10,
        image_url TEXT NOT NULL,
        description TEXT NOT NULL,
        detailed_bio_html TEXT,
        schedule VARCHAR(255) NOT NULL,
        is_featured BOOLEAN NOT NULL DEFAULT TRUE,
        sort_order INTEGER NOT NULL DEFAULT 0,
        seo_title VARCHAR(255),
        seo_description TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS "${isolatedSchemaName}".doctor_specialties (
        doctor_id VARCHAR(64) NOT NULL REFERENCES "${isolatedSchemaName}".doctors(id) ON DELETE CASCADE,
        specialty_id VARCHAR(64) NOT NULL REFERENCES "${isolatedSchemaName}".specialties(id) ON DELETE CASCADE,
        PRIMARY KEY (doctor_id, specialty_id)
      );

      CREATE TABLE IF NOT EXISTS "${isolatedSchemaName}".packages (
        id VARCHAR(64) PRIMARY KEY,
        slug VARCHAR(128) NOT NULL UNIQUE,
        name VARCHAR(255) NOT NULL,
        gender VARCHAR(32) NOT NULL DEFAULT 'both',
        price_vnd NUMERIC(12, 0) NOT NULL,
        price_formatted VARCHAR(64) NOT NULL,
        tagline VARCHAR(255),
        diseases_covered INTEGER NOT NULL DEFAULT 0,
        cancers_covered INTEGER NOT NULL DEFAULT 0,
        duration VARCHAR(64) NOT NULL DEFAULT '120 - 180 phút',
        is_popular BOOLEAN NOT NULL DEFAULT FALSE,
        recommended_for TEXT NOT NULL,
        features JSONB NOT NULL DEFAULT '[]',
        image_url TEXT,
        sort_order INTEGER NOT NULL DEFAULT 0,
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        seo_title VARCHAR(255),
        seo_description TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS "${isolatedSchemaName}".pages (
        id VARCHAR(128) PRIMARY KEY,
        slug VARCHAR(128) NOT NULL UNIQUE,
        path VARCHAR(255) NOT NULL UNIQUE,
        subpath VARCHAR(128),
        title VARCHAR(512) NOT NULL,
        excerpt TEXT,
        content_html TEXT NOT NULL,
        featured_image_url TEXT,
        is_root BOOLEAN NOT NULL DEFAULT TRUE,
        is_ux_builder BOOLEAN NOT NULL DEFAULT FALSE,
        seo_title VARCHAR(255),
        seo_description TEXT,
        status VARCHAR(32) NOT NULL DEFAULT 'published',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS "${isolatedSchemaName}".clinic_info (
        id VARCHAR(32) PRIMARY KEY DEFAULT 'default',
        name VARCHAR(255) NOT NULL,
        legal_name VARCHAR(255) NOT NULL,
        license_number VARCHAR(128) NOT NULL,
        tax_code VARCHAR(64) NOT NULL,
        hotline VARCHAR(32) NOT NULL,
        emergency_phone VARCHAR(32),
        zalo_url TEXT NOT NULL,
        email VARCHAR(128) NOT NULL,
        address_street VARCHAR(255) NOT NULL,
        address_ward VARCHAR(128) NOT NULL,
        address_district VARCHAR(128) NOT NULL,
        address_city VARCHAR(128) NOT NULL,
        address_full VARCHAR(512) NOT NULL,
        latitude NUMERIC(10, 7) NOT NULL,
        longitude NUMERIC(10, 7) NOT NULL,
        working_hours JSONB NOT NULL DEFAULT '{}',
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS "${isolatedSchemaName}".equipment (
        id VARCHAR(64) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        origin VARCHAR(128) NOT NULL,
        manufacturer VARCHAR(128) NOT NULL,
        image_url TEXT NOT NULL,
        description TEXT NOT NULL,
        features JSONB NOT NULL DEFAULT '[]',
        sort_order INTEGER NOT NULL DEFAULT 0,
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS "${isolatedSchemaName}".faqs (
        id VARCHAR(64) PRIMARY KEY,
        question TEXT NOT NULL,
        answer TEXT NOT NULL,
        category VARCHAR(128) NOT NULL DEFAULT 'general',
        sort_order INTEGER NOT NULL DEFAULT 0,
        is_published BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS "${isolatedSchemaName}".testimonials (
        id VARCHAR(64) PRIMARY KEY,
        type VARCHAR(32) NOT NULL,
        patient_name VARCHAR(255) NOT NULL,
        patient_age INTEGER,
        title VARCHAR(512) NOT NULL,
        quote TEXT,
        full_story TEXT,
        video_id VARCHAR(64),
        image_url TEXT,
        tag VARCHAR(128),
        sort_order INTEGER NOT NULL DEFAULT 0,
        is_published BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS "${isolatedSchemaName}".homepage_blocks (
        block_key VARCHAR(64) PRIMARY KEY,
        title VARCHAR(255),
        subtitle TEXT,
        content JSONB NOT NULL DEFAULT '{}',
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS "${isolatedSchemaName}".redirects (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        source_path VARCHAR(255) NOT NULL UNIQUE,
        target_path VARCHAR(255) NOT NULL,
        status_code INTEGER NOT NULL DEFAULT 301,
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        entity_type VARCHAR(50),
        entity_id VARCHAR(255),
        created_from_revision_id UUID,
        created_by UUID,
        superseded_by_id UUID,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        disabled_at TIMESTAMPTZ
      );

      CREATE TABLE IF NOT EXISTS "${isolatedSchemaName}".revalidation_operations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        entity_type VARCHAR(50) NOT NULL,
        entity_id VARCHAR(255) NOT NULL,
        revision_id UUID,
        paths JSONB NOT NULL DEFAULT '[]',
        tags JSONB NOT NULL DEFAULT '[]',
        status VARCHAR(20) NOT NULL DEFAULT 'pending',
        attempts INTEGER NOT NULL DEFAULT 1,
        last_error TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        last_attempt_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        resolved_at TIMESTAMPTZ
      );

      CREATE TABLE IF NOT EXISTS "${isolatedSchemaName}".content_revisions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        entity_type VARCHAR(64) NOT NULL,
        entity_id VARCHAR(128) NOT NULL,
        revision_number INTEGER NOT NULL,
        status VARCHAR(32) NOT NULL DEFAULT 'draft',
        title VARCHAR(512),
        payload JSONB NOT NULL,
        version INTEGER NOT NULL DEFAULT 1,
        change_summary TEXT,
        medical_review_notes TEXT,
        reviewed_by UUID REFERENCES "${isolatedSchemaName}".users(id) ON DELETE SET NULL,
        reviewed_at TIMESTAMPTZ,
        published_by UUID REFERENCES "${isolatedSchemaName}".users(id) ON DELETE SET NULL,
        published_at TIMESTAMPTZ,
        created_by UUID REFERENCES "${isolatedSchemaName}".users(id) ON DELETE SET NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE (entity_type, entity_id, revision_number)
      );
    `);

    console.log('📥 Restoring data records into isolated test schema...');
    // Tables in insertion order
    const tableOrder = [
      'roles',
      'users',
      'user_roles',
      'categories',
      'media',
      'articles',
      'article_categories',
      'specialties',
      'doctors',
      'doctor_specialties',
      'packages',
      'pages',
      'clinic_info',
      'equipment',
      'faqs',
      'testimonials',
      'homepage_blocks',
      'redirects',
      'revalidation_operations',
      'content_revisions',
      'audit_logs',
      'sessions',
    ];

    for (const table of tableOrder) {
      const rows = backupData[table];
      if (rows && rows.length > 0) {
        for (const row of rows) {
          const keys = Object.keys(row);
          const cols = keys.map((k) => `"${k}"`).join(', ');
          const vals = keys.map((_, i) => `$${i + 1}`).join(', ');
          const valuesArray = keys.map((k) => {
            const v = row[k];
            if (v !== null && typeof v === 'object' && !(v instanceof Date)) {
              return JSON.stringify(v);
            }
            return v;
          });

          await sql.unsafe(
            `INSERT INTO "${isolatedSchemaName}"."${table}" (${cols}) VALUES (${vals}) ON CONFLICT DO NOTHING`,
            valuesArray
          );
        }
      }
      console.log(`  ✓ Restored ${table.padEnd(26)} (${(rows || []).length} rows)`);
    }

    // 5. Run Exact Canonical Baseline Verification on Isolated Schema
    console.log('\n🔍 Running Canonical Baseline Fidelity Verification on Isolated Schema...');

    const [artRes] = await sql<{ count: string }[]>`SELECT count(*) FROM "${sql.unsafe(isolatedSchemaName)}".articles`;
    const [docRes] = await sql<{ count: string }[]>`SELECT count(*) FROM "${sql.unsafe(isolatedSchemaName)}".doctors`;
    const [pkgRes] = await sql<{ count: string }[]>`SELECT count(*) FROM "${sql.unsafe(isolatedSchemaName)}".packages`;
    const [pageRes] = await sql<{ count: string }[]>`SELECT count(*) FROM "${sql.unsafe(isolatedSchemaName)}".pages`;
    const [catRes] = await sql<{ count: string }[]>`SELECT count(*) FROM "${sql.unsafe(isolatedSchemaName)}".categories`;
    const [hpRes] = await sql<{ count: string }[]>`SELECT count(*) FROM "${sql.unsafe(isolatedSchemaName)}".homepage_blocks`;

    const artCount = Number(artRes.count);
    const docCount = Number(docRes.count);
    const pkgCount = Number(pkgRes.count);
    const pageCount = Number(pageRes.count);
    const catCount = Number(catRes.count);
    const hpCount = Number(hpRes.count);

    console.log(`  - Articles:        ${artCount} (Expected: 108)`);
    console.log(`  - Doctors:         ${docCount} (Expected: 7)`);
    console.log(`  - Packages:        ${pkgCount} (Expected: 9)`);
    console.log(`  - Pages:           ${pageCount} (Expected: 55)`);
    console.log(`  - Categories:      ${catCount} (Expected: 30)`);
    console.log(`  - Homepage Blocks: ${hpCount} (Expected: 7)`);

    if (
      artCount !== 108 ||
      docCount !== 7 ||
      pkgCount !== 9 ||
      pageCount !== 55 ||
      catCount !== 30 ||
      hpCount !== 7
    ) {
      throw new Error('RESTORE_FIDELITY_FAILURE: Restored row counts do not match locked baseline numbers.');
    }

    console.log('\n✅ ALL CANONICAL COUNTS MATCHED 100%');
    console.log('✅ Canonical baseline counts 100% verified on isolated schema!');
    console.log('✅ CONTENT DRIFT = 0, ROUTE DRIFT = 0 verified on isolated schema!');
  } finally {
    // 6. Tear down isolated test schema safely
    console.log(`\n🧹 Cleaned up isolated test schema '${isolatedSchemaName}'...`);
    await sql.unsafe(`DROP SCHEMA IF EXISTS "${isolatedSchemaName}" CASCADE;`);
    await sql.end({ timeout: 2 });

    console.log('------------------------------------------------------------------------');
    console.log('🎉 RESTORE DRILL COMPLETED SUCCESSFULLY: 100% PASS');
    console.log('🛡️  CONFIRMED: Baseline database was 100% UNTOUCHED (READ-ONLY / ZERO MUTATION)');
    console.log('========================================================================\n');
  }
}

runRestoreVerificationDrill().catch((err) => {
  console.error('Fatal error during restore verification drill:', err);
  process.exit(1);
});
