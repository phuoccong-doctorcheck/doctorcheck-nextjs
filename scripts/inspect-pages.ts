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

async function inspectPages() {
  const { db } = await import('../src/db');
  const schema = await import('../src/db/schema');

  const pages = await db.select().from(schema.pages);
  console.log('==============================================');
  console.log('TOTAL PAGES IN DB:', pages.length);
  console.log('==============================================');

  const rootPages = pages.filter((p) => p.isRoot && p.status !== 'internal');
  const nestedPages = pages.filter((p) => !p.isRoot && p.status !== 'internal');
  const internalPages = pages.filter((p) => p.status === 'internal' || p.id.includes('internal'));

  console.log(`- ROOT PAGES: ${rootPages.length}`);
  console.log(`- NESTED / ENDOSCOPY PAGES: ${nestedPages.length}`);
  console.log(`- INTERNAL PAGES: ${internalPages.length}`);

  const statusMap = new Map<string, number>();
  for (const p of pages) {
    statusMap.set(p.status, (statusMap.get(p.status) || 0) + 1);
  }
  console.log('\nStatus breakdown:');
  for (const [st, cnt] of statusMap.entries()) {
    console.log(`  ${st}: ${cnt}`);
  }

  console.log('\nDetailed Page List:');
  for (const p of pages) {
    console.log(`[${p.id}] slug="${p.slug}" path="${p.path}" isRoot=${p.isRoot} subpath="${p.subpath || ''}" status="${p.status}" isUxBuilder=${p.isUxBuilder}`);
  }
}

inspectPages().catch(console.error);
