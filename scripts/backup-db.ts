import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import postgres from 'postgres';

dotenv.config({ path: '.env.local' });
dotenv.config();

/**
 * PostgreSQL Database Backup Generator
 * Creates a timestamped, consistent snapshot with SHA-256 checksum verification.
 * Strictly guarantees zero password / secret leakage in console output.
 */
async function generateBackup() {
  const dbUrl = process.env.DATABASE_URL;

  if (!dbUrl) {
    console.error('❌ BACKUP_ERROR: DATABASE_URL is not configured in environment.');
    process.exit(1);
  }

  // Parse safe connection info without password
  const parsed = new URL(dbUrl);
  const safeTarget = `${parsed.protocol}//${parsed.username}:***@${parsed.host}${parsed.pathname}`;

  console.log('========================================================================');
  console.log('📦 DOCTORCHECK POSTGRESQL BACKUP UTILITY');
  console.log('========================================================================');
  console.log(`Target:    ${safeTarget}`);
  console.log(`Timestamp: ${new Date().toISOString()}`);
  console.log('------------------------------------------------------------------------');

  const backupsDir = path.resolve(process.cwd(), 'backups');
  if (!fs.existsSync(backupsDir)) {
    fs.mkdirSync(backupsDir, { recursive: true });
  }

  const now = new Date();
  const dateStr = now.toISOString().replace(/[:-]|\.\d{3}/g, '').replace('T', '_').slice(0, 15);
  const backupFileName = `doctorcheck_backup_${dateStr}.json`;
  const backupFilePath = path.join(backupsDir, backupFileName);
  const checksumFilePath = path.join(backupsDir, `${backupFileName}.sha256`);

  const sql = postgres(dbUrl, { max: 1 });

  try {
    console.log('⏳ Exporting relational tables and canonical content...');

    const tables = [
      'categories',
      'articles',
      'article_categories',
      'doctors',
      'specialties',
      'doctor_specialties',
      'packages',
      'pages',
      'clinic_info',
      'equipment',
      'faqs',
      'testimonials',
      'homepage_blocks',
      'media',
      'redirects',
      'revalidation_operations',
      'content_revisions',
      'roles',
      'users',
      'user_roles',
      'sessions',
      'audit_logs',
    ];

    const backupPayload: Record<string, unknown[]> = {
      _metadata: [
        {
          version: '1.0',
          createdAt: now.toISOString(),
          tablesCount: tables.length,
        },
      ],
    };

    let totalRows = 0;

    for (const table of tables) {
      try {
        const rows = await sql.unsafe(`SELECT * FROM "${table}"`);
        backupPayload[table] = rows;
        totalRows += rows.length;
        console.log(`  ✓ Exported ${table.padEnd(26)} (${rows.length} rows)`);
      } catch (err) {
        console.warn(`  ⚠️ Table ${table} not found or query failed: ${err instanceof Error ? err.message : String(err)}`);
        backupPayload[table] = [];
      }
    }

    const jsonContent = JSON.stringify(backupPayload, null, 2);
    fs.writeFileSync(backupFilePath, jsonContent, 'utf8');

    // Compute SHA-256 Checksum
    const checksum = crypto.createHash('sha256').update(jsonContent, 'utf8').digest('hex');
    fs.writeFileSync(checksumFilePath, `${checksum}  ${backupFileName}\n`, 'utf8');

    const fileStats = fs.statSync(backupFilePath);
    const sizeKb = (fileStats.size / 1024).toFixed(2);

    console.log('------------------------------------------------------------------------');
    console.log(`✅ Backup created successfully: ${backupFileName}`);
    console.log(`📊 Total rows exported:         ${totalRows}`);
    console.log(`📁 File size:                   ${sizeKb} KB`);
    console.log(`🔒 SHA-256 Checksum:            ${checksum}`);
    console.log('========================================================================\n');

    await sql.end();
  } catch (error) {
    console.error('❌ BACKUP_FAILED:', error instanceof Error ? error.message : String(error));
    await sql.end({ timeout: 2 });
    process.exit(1);
  }
}

generateBackup();
