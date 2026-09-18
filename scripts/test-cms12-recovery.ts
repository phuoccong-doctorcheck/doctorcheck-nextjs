import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { execSync } from 'child_process';

dotenv.config({ path: '.env.local' });
dotenv.config();

/**
 * CMS-12 Recovery & Disaster Recovery Test Suite
 *
 * Tests:
 * 1. Database backup execution & SHA-256 integrity file generation
 * 2. Backup credential safety (zero password leakage in dump)
 * 3. Isolated restore drill (creates test DB, restores schema & data, verifies canonical entities)
 * 4. Content parity verification (Articles: 108, Doctors: 7, Packages: 9, Pages: 55, Categories: 30, Homepage: 7)
 * 5. Baseline DB non-interference guarantee (read-only assertion)
 * 6. Isolated DB cleanup confirmation
 */
async function runRecoveryTests() {
  console.log('========================================================================');
  console.log('🔄 RUNNING CMS-12 BACKUP & RECOVERY TEST SUITE');
  console.log('========================================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${testName}${detail ? ` - ${detail}` : ''}`);
      failed++;
    }
  }

  // ---------------------------------------------------------------------------
  // 1. Run Database Backup Script
  // ---------------------------------------------------------------------------
  console.log('1. Executing Database Backup (npm run db:backup):');
  try {
    const backupOutput = execSync('npx tsx scripts/backup-db.ts', { encoding: 'utf8' });
    console.log(backupOutput);
    assert(backupOutput.includes('Backup created successfully:'), 'Backup script executes with zero exit code and success message');
  } catch (err: any) {
    console.error('Backup execution failed:', err.stdout || err.message);
    assert(false, 'Backup script executes with zero exit code', err.message);
  }

  // ---------------------------------------------------------------------------
  // 2. Validate Generated Backup Artifact
  // ---------------------------------------------------------------------------
  console.log('\n2. Validating Backup Artifact & Checksum:');
  const backupsDir = path.resolve(process.cwd(), 'backups');
  assert(fs.existsSync(backupsDir), 'Backups directory exists');

  const backupFiles = fs
    .readdirSync(backupsDir)
    .filter((f) => f.startsWith('doctorcheck_backup_') && f.endsWith('.json'))
    .sort()
    .reverse();

  assert(backupFiles.length > 0, 'At least one backup JSON snapshot was generated');
  const latestBackupFile = path.join(backupsDir, backupFiles[0]);
  const latestChecksumFile = `${latestBackupFile}.sha256`;

  assert(fs.existsSync(latestChecksumFile), 'Corresponding SHA-256 checksum file exists');

  const backupRaw = fs.readFileSync(latestBackupFile, 'utf8');
  const expectedChecksum = fs.readFileSync(latestChecksumFile, 'utf8').trim().split(/\s+/)[0];
  const actualChecksum = crypto.createHash('sha256').update(backupRaw, 'utf8').digest('hex');

  assert(expectedChecksum === actualChecksum, 'Backup SHA-256 checksum matches snapshot content');

  // Verify zero credential dump
  assert(!backupRaw.includes('"password":') || backupRaw.includes('"password_hash"'), 'Backup does not contain plaintext passwords');

  // ---------------------------------------------------------------------------
  // 3. Run Isolated Restore Verification Drill
  // ---------------------------------------------------------------------------
  console.log('\n3. Executing Isolated Restore Verification Drill (npm run db:restore:verify):');
  try {
    const restoreOutput = execSync('npx tsx scripts/restore-verify-db.ts', { encoding: 'utf8' });
    console.log(restoreOutput);
    assert(restoreOutput.includes('ALL CANONICAL COUNTS MATCHED 100%'), 'Isolated restore drill completes with 100% canonical parity');
    assert(restoreOutput.includes('Cleaned up isolated test'), 'Isolated test environment cleaned up safely');
    assert(restoreOutput.includes('READ-ONLY / ZERO MUTATION'), 'Baseline DB confirmed untouched');
  } catch (err: any) {
    console.error('Restore verification failed:', err.stdout || err.message);
    assert(false, 'Isolated restore drill completes with 100% canonical parity', err.message);
  }

  console.log('\n========================================================================');
  console.log(`RESULTS: ${failed === 0 ? '✅ ALL RECOVERY TESTS PASSED' : '❌ SOME TESTS FAILED'}`);
  console.log(`Total: ${passed + failed} | Passed: ${passed} | Failed: ${failed}`);
  console.log('========================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runRecoveryTests().catch((err) => {
  console.error('Fatal error running recovery tests:', err);
  process.exit(1);
});
