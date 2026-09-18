import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config();

// Stub 'server-only'
require.cache[require.resolve('server-only')] = {
  id: require.resolve('server-only'),
  filename: require.resolve('server-only'),
  loaded: true,
  exports: {},
} as unknown as NodeModule;

async function run() {
  const { db, client } = await import('../src/db');
  const { homepageBlocks } = await import('../src/db/schema');

  const rows = await db.select().from(homepageBlocks);
  console.log('Total homepage_blocks in DB:', rows.length);
  for (const r of rows) {
    console.log(`\n================ Block: [${r.blockKey}] ================`);
    console.log('Title:', r.title);
    console.log('Subtitle:', r.subtitle);
    console.log('isActive:', r.isActive);
    console.log('Content Keys:', Object.keys(r.content as object));
    console.log('Content JSON:', JSON.stringify(r.content, null, 2));
  }

  await client.end();
}

run().catch(console.error);
