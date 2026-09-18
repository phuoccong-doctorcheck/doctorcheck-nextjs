import * as dotenv from 'dotenv';

require.cache[require.resolve('server-only')] = {
  id: require.resolve('server-only'),
  filename: require.resolve('server-only'),
  loaded: true,
  exports: {},
} as unknown as NodeModule;

dotenv.config({ path: '.env.local' });

import type { Doctor } from '../src/types/doctorcheck';

async function verifyDoctorParity() {
  const { StaticDoctorRepository } = await import('../src/repositories/static/static-doctor.repository');
  const { PostgresDoctorRepository } = await import('../src/repositories/postgres/postgres-doctor.repository');
  const { generateDoctorJsonLd } = await import('../src/lib/seo/structured-data');
  const { resolveContent } = await import('../src/lib/routing/resolve-content');

  console.log('========================================================================');
  console.log('🩺 DB-6: PRE-CUTOVER & POST-CUTOVER DOCTORS DOMAIN FIDELITY AUDIT');
  console.log('========================================================================\n');

  const staticRepo = new StaticDoctorRepository();
  const postgresRepo = new PostgresDoctorRepository();

  const staticDoctors = await staticRepo.getAll();
  const postgresDoctors = await postgresRepo.getAll();

  console.log(`Static Doctors Count:     ${staticDoctors.length}`);
  console.log(`PostgreSQL Doctors Count: ${postgresDoctors.length}`);

  if (staticDoctors.length !== 7 || postgresDoctors.length !== 7) {
    console.error(`❌ Unexpected doctor count: static=${staticDoctors.length}, postgres=${postgresDoctors.length}`);
    process.exit(1);
  }

  const fieldsToCheck: (keyof Doctor)[] = [
    'id',
    'name',
    'title',
    'specialty',
    'cchn',
    'clinicalScope',
    'hospital',
    'image',
    'description',
    'schedule',
    'experienceYears',
    'featured',
    'dataClassification',
  ];

  console.log('\n--- 1. FIELD-BY-FIELD PARITY CHECK FOR ALL 7 DOCTORS ---');
  let allFieldsMatch = true;

  for (const staticDoc of staticDoctors) {
    const pgDoc = postgresDoctors.find((d) => d.id === staticDoc.id);
    if (!pgDoc) {
      console.error(`❌ Doctor ${staticDoc.id} not found in PostgreSQL!`);
      allFieldsMatch = false;
      continue;
    }

    console.log(`\nDoctor: [${staticDoc.id}] ${staticDoc.name}`);
    console.log(`  CCHN: ${staticDoc.cchn}`);
    console.log(`  Specialty: ${staticDoc.specialty}`);
    console.log(`  Experience: ${staticDoc.experienceYears} years`);
    console.log(`  Image: ${staticDoc.image}`);

    for (const field of fieldsToCheck) {
      const staticVal = staticDoc[field];
      const pgVal = pgDoc[field];
      if (staticVal !== pgVal) {
        console.error(`  ❌ Mismatch on field "${field}":`);
        console.error(`     Static:     ${JSON.stringify(staticVal)}`);
        console.error(`     PostgreSQL: ${JSON.stringify(pgVal)}`);
        allFieldsMatch = false;
      }
    }

    // Test getBySlug
    const bySlugStatic = await staticRepo.getBySlug(staticDoc.id);
    const bySlugPg = await postgresRepo.getBySlug(staticDoc.id);
    if (!bySlugStatic || !bySlugPg || bySlugStatic.name !== bySlugPg.name) {
      console.error(`  ❌ getBySlug(${staticDoc.id}) mismatch`);
      allFieldsMatch = false;
    }

    // Test Physician JSON-LD Parity
    const jsonLdStatic = JSON.stringify(generateDoctorJsonLd(staticDoc));
    const jsonLdPg = JSON.stringify(generateDoctorJsonLd(pgDoc));
    if (jsonLdStatic !== jsonLdPg) {
      console.error(`  ❌ Physician JSON-LD mismatch for ${staticDoc.id}`);
      allFieldsMatch = false;
    } else {
      console.log(`  ✓ Physician JSON-LD: 100% Match`);
    }

    // Test Root Slug Resolution & Redirect for Doctor
    const rootResolved = resolveContent(staticDoc.id);
    if (
      rootResolved.type !== 'doctor' ||
      rootResolved.data?.doctor?.id !== staticDoc.id ||
      rootResolved.canonicalUrl !== `https://doctorcheck.vn/doctor/${staticDoc.id}/`
    ) {
      console.error(`  ❌ Root slug resolution mismatch for ${staticDoc.id}: type=${rootResolved.type}`);
      allFieldsMatch = false;
    } else {
      console.log(`  ✓ Root Redirect /${staticDoc.id}/ -> /doctor/${staticDoc.id}/ : Verified`);
    }
  }

  // Check getFeatured() parity
  console.log('\n--- 2. FEATURED DOCTORS PARITY ---');
  const featStatic = await staticRepo.getFeatured();
  const featPg = await postgresRepo.getFeatured();
  console.log(`Featured Static:     ${featStatic.length} doctors`);
  console.log(`Featured PostgreSQL: ${featPg.length} doctors`);
  if (featStatic.length !== featPg.length) {
    console.error('❌ Featured doctors count mismatch');
    allFieldsMatch = false;
  }

  // Check getAllSlugs() parity
  console.log('\n--- 3. SLUGS LIST PARITY ---');
  const slugsStatic = await staticRepo.getAllSlugs();
  const slugsPg = await postgresRepo.getAllSlugs();
  const slugsMatch = JSON.stringify(slugsStatic.sort()) === JSON.stringify(slugsPg.sort());
  console.log(`Slugs Match: ${slugsMatch ? 'YES (100%)' : 'NO'}`);
  if (!slugsMatch) allFieldsMatch = false;

  console.log('\n========================================================================');
  if (allFieldsMatch) {
    console.log('🎉 PRE-CUTOVER PARITY AUDIT PASSED: 100% IDENTICAL ACROSS ALL 7 DOCTORS');
    console.log('========================================================================\n');
    process.exit(0);
  } else {
    console.error('❌ PRE-CUTOVER PARITY AUDIT FAILED! DO NOT PROCEED WITH CUTOVER.');
    console.log('========================================================================\n');
    process.exit(1);
  }
}

verifyDoctorParity().catch((err) => {
  console.error('❌ Audit execution error:', err);
  process.exit(1);
});
