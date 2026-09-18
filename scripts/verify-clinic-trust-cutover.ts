import * as dotenv from 'dotenv';
import * as crypto from 'crypto';

// Stub server-only for standalone CLI script execution outside Next.js webpack/turbopack bundler
require.cache[require.resolve('server-only')] = {
  id: require.resolve('server-only'),
  filename: require.resolve('server-only'),
  loaded: true,
  exports: {},
} as unknown as NodeModule;

dotenv.config({ path: '.env.local' });

function computeHash(content: string): string {
  return crypto.createHash('sha256').update(content.trim(), 'utf8').digest('hex');
}

async function verifyClinicTrustParity() {
  const { StaticClinicRepository } = await import('../src/repositories/static/static-clinic.repository');
  const { StaticClinicalTrustRepository } = await import('../src/repositories/static/static-clinical-trust.repository');
  const { PostgresClinicRepository } = await import('../src/repositories/postgres/postgres-clinic.repository');
  const { PostgresClinicalTrustRepository } = await import('../src/repositories/postgres/postgres-clinical-trust.repository');

  console.log('========================================================================');
  console.log('🏥 DB-11: CLINIC & CLINICAL TRUST FIDELITY & PARITY AUDIT');
  console.log('========================================================================\n');

  const staticClinicRepo = new StaticClinicRepository();
  const staticTrustRepo = new StaticClinicalTrustRepository();
  const pgClinicRepo = new PostgresClinicRepository();
  const pgTrustRepo = new PostgresClinicalTrustRepository();

  // 1. Clinic Profile Parity
  console.log('--- 1. CLINIC PROFILE FIDELITY AUDIT ---');
  const staticClinic = await staticClinicRepo.getClinicInfo();
  const pgClinic = await pgClinicRepo.getClinicInfo();

  const clinicMatches =
    staticClinic.name === pgClinic.name &&
    staticClinic.legalName === pgClinic.legalName &&
    staticClinic.license === pgClinic.license &&
    staticClinic.licenseIssuer === pgClinic.licenseIssuer &&
    staticClinic.address.full === pgClinic.address.full &&
    staticClinic.address.short === pgClinic.address.short &&
    staticClinic.address.street === pgClinic.address.street &&
    staticClinic.address.ward === pgClinic.address.ward &&
    staticClinic.address.district === pgClinic.address.district &&
    staticClinic.address.city === pgClinic.address.city &&
    staticClinic.hotline === pgClinic.hotline &&
    staticClinic.zaloUrl === pgClinic.zaloUrl &&
    staticClinic.email === pgClinic.email &&
    staticClinic.websiteUrl === pgClinic.websiteUrl &&
    staticClinic.workingHours === pgClinic.workingHours &&
    staticClinic.workingHoursShort === pgClinic.workingHoursShort &&
    staticClinic.coordinates.latitude === pgClinic.coordinates.latitude &&
    staticClinic.coordinates.longitude === pgClinic.coordinates.longitude;

  console.log(`  Name:           "${pgClinic.name}" [${staticClinic.name === pgClinic.name ? 'PASS' : 'FAIL'}]`);
  console.log(`  Legal Name:     "${pgClinic.legalName}" [${staticClinic.legalName === pgClinic.legalName ? 'PASS' : 'FAIL'}]`);
  console.log(`  License:        "${pgClinic.license}" [${staticClinic.license === pgClinic.license ? 'PASS' : 'FAIL'}]`);
  console.log(`  Address Full:   "${pgClinic.address.full}" [${staticClinic.address.full === pgClinic.address.full ? 'PASS' : 'FAIL'}]`);
  console.log(`  Address Short:  "${pgClinic.address.short}" [${staticClinic.address.short === pgClinic.address.short ? 'PASS' : 'FAIL'}]`);
  console.log(`  Hotline:        "${pgClinic.hotline}" [${staticClinic.hotline === pgClinic.hotline ? 'PASS' : 'FAIL'}]`);
  console.log(`  Working Hours:  "${pgClinic.workingHours}" [${staticClinic.workingHours === pgClinic.workingHours ? 'PASS' : 'FAIL'}]`);
  console.log(`  Coordinates:    (${pgClinic.coordinates.latitude}, ${pgClinic.coordinates.longitude}) [${clinicMatches ? 'PASS' : 'FAIL'}]`);
  console.log(`Clinic Profile Parity: ${clinicMatches ? 'PASS (100%)' : 'FAIL'}`);

  // 2. Medical Equipment Parity
  console.log('\n--- 2. MEDICAL EQUIPMENT FIDELITY AUDIT ---');
  const staticEq = await staticTrustRepo.getEquipment();
  const pgEq = await pgTrustRepo.getEquipment();
  console.log(`Static Equipment Count:     ${staticEq.length}`);
  console.log(`PostgreSQL Equipment Count: ${pgEq.length}`);

  let eqMatchCount = 0;
  for (const s of staticEq) {
    const p = pgEq.find((e) => e.id === s.id);
    if (
      p &&
      p.name === s.name &&
      p.origin === s.origin &&
      p.manufacturer === s.manufacturer &&
      p.image === s.image &&
      p.description === s.description &&
      JSON.stringify(p.features) === JSON.stringify(s.features)
    ) {
      eqMatchCount++;
      console.log(`  ✓ [ID ${p.id}] ${p.name} (${p.origin} / ${p.manufacturer})`);
    } else {
      console.error(`  ❌ Equipment mismatch for [${s.id}]`);
    }
  }
  console.log(`Equipment Parity: ${eqMatchCount === staticEq.length ? 'PASS (6/6)' : 'FAIL'}`);

  // 3. FAQ Parity
  console.log('\n--- 3. FAQ FIDELITY AUDIT ---');
  const staticFaqs = await staticTrustRepo.getFaqs();
  const pgFaqs = await pgTrustRepo.getFaqs();
  console.log(`Static FAQ Count:     ${staticFaqs.length}`);
  console.log(`PostgreSQL FAQ Count: ${pgFaqs.length}`);

  let faqMatchCount = 0;
  for (const s of staticFaqs) {
    const p = pgFaqs.find((f) => f.id === s.id);
    if (
      p &&
      p.question === s.question &&
      p.answer === s.answer &&
      p.category === s.category
    ) {
      faqMatchCount++;
      console.log(`  ✓ [ID ${p.id}] Q: "${p.question.slice(0, 45)}..."`);
    } else {
      console.error(`  ❌ FAQ mismatch for [${s.id}]`);
      console.log('  Static FAQ: ', JSON.stringify(s));
      console.log('  PG FAQ:     ', JSON.stringify(p));
    }
  }
  console.log(`FAQ Parity: ${faqMatchCount === staticFaqs.length ? 'PASS (5/5)' : 'FAIL'}`);

  // 4. Video Testimonials Parity
  console.log('\n--- 4. VIDEO TESTIMONIALS FIDELITY AUDIT ---');
  const staticVideos = await staticTrustRepo.getVideoTestimonials();
  const pgVideos = await pgTrustRepo.getVideoTestimonials();
  console.log(`Static Video Count:     ${staticVideos.length}`);
  console.log(`PostgreSQL Video Count: ${pgVideos.length}`);

  let videoMatchCount = 0;
  for (const s of staticVideos) {
    const p = pgVideos.find((v) => v.id === s.id);
    if (
      p &&
      p.title === s.title &&
      p.patientName === s.patientName &&
      p.videoId === s.videoId &&
      p.thumbnail === s.thumbnail &&
      p.quote === s.quote
    ) {
      videoMatchCount++;
      console.log(`  ✓ [ID ${p.id}] ${p.patientName} | VideoId: ${p.videoId}`);
    } else {
      console.error(`  ❌ Video mismatch for [${s.id}]`);
    }
  }
  console.log(`Video Testimonials Parity: ${videoMatchCount === staticVideos.length ? 'PASS (3/3)' : 'FAIL'}`);

  // 5. Customer Stories Parity
  console.log('\n--- 5. CUSTOMER STORIES FIDELITY AUDIT ---');
  const staticStories = await staticTrustRepo.getCustomerStories();
  const pgStories = await pgTrustRepo.getCustomerStories();
  console.log(`Static Stories Count:     ${staticStories.length}`);
  console.log(`PostgreSQL Stories Count: ${pgStories.length}`);

  let storyMatchCount = 0;
  for (const s of staticStories) {
    const p = pgStories.find((st) => st.id === s.id);
    if (
      p &&
      p.title === s.title &&
      p.patientName === s.patientName &&
      p.summary === s.summary &&
      p.fullStory === s.fullStory &&
      p.image === s.image &&
      p.tag === s.tag
    ) {
      storyMatchCount++;
      console.log(`  ✓ [ID ${p.id}] ${p.patientName} | "${p.title.slice(0, 40)}..."`);
    } else {
      console.error(`  ❌ Story mismatch for [${s.id}]`);
    }
  }
  console.log(`Customer Stories Parity: ${storyMatchCount === staticStories.length ? 'PASS (3/3)' : 'FAIL'}`);

  // 6. MedicalClinic JSON-LD Schema Simulation
  console.log('\n--- 6. MEDICALCLINIC STRUCTURED DATA FIDELITY ---');
  const staticClinicSchema = {
    '@context': 'https://schema.org',
    '@type': 'MedicalClinic',
    name: staticClinic.name,
    legalName: staticClinic.legalName,
    url: staticClinic.websiteUrl,
    telephone: staticClinic.hotline,
    address: {
      '@type': 'PostalAddress',
      streetAddress: staticClinic.address.street,
      addressLocality: staticClinic.address.district,
      addressRegion: staticClinic.address.city,
      addressCountry: 'VN',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: staticClinic.coordinates.latitude,
      longitude: staticClinic.coordinates.longitude,
    },
  };

  const pgClinicSchema = {
    '@context': 'https://schema.org',
    '@type': 'MedicalClinic',
    name: pgClinic.name,
    legalName: pgClinic.legalName,
    url: pgClinic.websiteUrl,
    telephone: pgClinic.hotline,
    address: {
      '@type': 'PostalAddress',
      streetAddress: pgClinic.address.street,
      addressLocality: pgClinic.address.district,
      addressRegion: pgClinic.address.city,
      addressCountry: 'VN',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: pgClinic.coordinates.latitude,
      longitude: pgClinic.coordinates.longitude,
    },
  };

  const schemaMatch = JSON.stringify(staticClinicSchema) === JSON.stringify(pgClinicSchema);
  console.log(`MedicalClinic Schema Parity: ${schemaMatch ? 'PASS (100%)' : 'FAIL'}`);

  // 7. Regression Audit on All Previously Cut Over Domains
  console.log('\n--- 7. REGRESSION AUDIT (DOCTORS, PACKAGES, CATEGORIES, ARTICLES, PAGES) ---');
  const { doctorRepository, packageRepository, categoryRepository, articleRepository, pageRepository } = await import('../src/repositories');
  const docs = await doctorRepository.getAll();
  const pkgs = await packageRepository.getAll();
  const cats = await categoryRepository.getAll();
  const arts = await articleRepository.getAll();
  const pages = await pageRepository.getAll();
  console.log(`  ✓ Doctors (PostgreSQL):    ${docs.length}/7`);
  console.log(`  ✓ Packages (PostgreSQL):   ${pkgs.length}/9`);
  console.log(`  ✓ Categories (PostgreSQL): ${cats.length}/30`);
  console.log(`  ✓ Articles (PostgreSQL):   ${arts.length}/108`);
  console.log(`  ✓ Pages (PostgreSQL):      ${pages.length}/55`);

  const allPassed =
    clinicMatches &&
    eqMatchCount === staticEq.length &&
    faqMatchCount === staticFaqs.length &&
    videoMatchCount === staticVideos.length &&
    storyMatchCount === staticStories.length &&
    schemaMatch &&
    docs.length === 7 &&
    pkgs.length === 9 &&
    cats.length === 30 &&
    arts.length === 108 &&
    pages.length === 55;

  console.log('\n========================================================================');
  if (allPassed) {
    console.log('🎉 CLINIC & CLINICAL TRUST AUDIT PASSED WITH 100% PARITY!');
    console.log('========================================================================\n');
    process.exit(0);
  } else {
    console.error('❌ CLINIC & CLINICAL TRUST AUDIT FAILED!');
    console.log('========================================================================\n');
    process.exit(1);
  }
}

verifyClinicTrustParity().catch((err) => {
  console.error('❌ Audit execution error:', err);
  process.exit(1);
});
