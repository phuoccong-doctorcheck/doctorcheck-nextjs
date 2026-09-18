import * as dotenv from 'dotenv';

// Stub server-only for standalone CLI script execution
require.cache[require.resolve('server-only')] = {
  id: require.resolve('server-only'),
  filename: require.resolve('server-only'),
  loaded: true,
  exports: {},
} as unknown as NodeModule;

dotenv.config({ path: '.env.local' });

async function inspectClinicTrust() {
  const { db } = await import('../src/db');
  const schema = await import('../src/db/schema');

  console.log('=== 1. CLINIC INFO ===');
  const clinics = await db.select().from(schema.clinicInfo);
  console.log(`Clinic records: ${clinics.length}`);
  console.log(JSON.stringify(clinics[0], null, 2));

  console.log('\n=== 2. EQUIPMENT ===');
  const eq = await db.select().from(schema.equipment);
  console.log(`Equipment records: ${eq.length}`);
  eq.forEach((e) => console.log(` - [${e.id}] ${e.name} (Sort: ${e.sortOrder}, Active: ${e.isActive})`));

  console.log('\n=== 3. FAQS ===');
  const faqs = await db.select().from(schema.faqs);
  console.log(`FAQ records: ${faqs.length}`);
  faqs.forEach((f) => console.log(` - [${f.id}] ${f.question.slice(0, 50)}... (Sort: ${f.sortOrder}, Published: ${f.isPublished})`));

  console.log('\n=== 4. TESTIMONIALS (VIDEOS & STORIES) ===');
  const tests = await db.select().from(schema.testimonials);
  console.log(`Total Testimonial records: ${tests.length}`);
  tests.forEach((t) => console.log(` - [${t.id}] Type: ${t.type}, Name: ${t.patientName}, Video: ${t.videoId || 'N/A'}, Sort: ${t.sortOrder}, Published: ${t.isPublished}`));

  console.log('\n=== 5. HOMEPAGE BLOCKS ===');
  const hp = await db.select().from(schema.homepageBlocks);
  console.log(`Homepage blocks: ${hp.length}`);
  hp.forEach((h) => console.log(` - [${h.blockKey}] ${h.title}`));

  process.exit(0);
}

inspectClinicTrust().catch((err) => {
  console.error(err);
  process.exit(1);
});
