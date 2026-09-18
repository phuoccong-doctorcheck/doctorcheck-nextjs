import * as dotenv from 'dotenv';

// Stub 'server-only' for Node standalone execution
require.cache[require.resolve('server-only')] = {
  id: require.resolve('server-only'),
  filename: require.resolve('server-only'),
  loaded: true,
  exports: {},
} as unknown as NodeModule;

dotenv.config({ path: '.env.local' });

async function applyMigration() {
  console.log('Applying Migration 0003: Content Workflow & Revisions Schema...');
  const { db } = await import('../src/db');
  const { sql } = await import('drizzle-orm');
  const fs = await import('fs');
  const path = await import('path');

  const migrationPath = path.join(process.cwd(), 'src/db/migrations/0003_content_workflow_revisions.sql');
  const sqlContent = fs.readFileSync(migrationPath, 'utf-8');
  
  const statements = sqlContent
    .split('--> statement-breakpoint')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  for (const statement of statements) {
    await db.execute(sql.raw(statement));
  }

  console.log('✅ Migration 0003 applied successfully!');
  process.exit(0);
}

applyMigration().catch((err) => {
  console.error('❌ Failed to apply migration 0003:', err);
  process.exit(1);
});
