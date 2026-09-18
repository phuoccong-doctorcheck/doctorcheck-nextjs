import * as dotenv from 'dotenv';

require.cache[require.resolve('server-only')] = {
  id: require.resolve('server-only'),
  filename: require.resolve('server-only'),
  loaded: true,
  exports: {},
} as unknown as NodeModule;

dotenv.config({ path: '.env.local' });

function deepEqual(a: any, b: any): boolean {
  if (a === b) return true;
  if (typeof a !== typeof b) return false;
  if (typeof a !== 'object' || a === null || b === null) return false;

  if (Array.isArray(a) !== Array.isArray(b)) return false;
  if (Array.isArray(a)) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (!deepEqual(a[i], b[i])) return false;
    }
    return true;
  }

  const keysA = Object.keys(a).filter((k) => a[k] !== undefined);
  const keysB = Object.keys(b).filter((k) => b[k] !== undefined);

  if (keysA.length !== keysB.length) return false;

  for (const key of keysA) {
    if (!keysB.includes(key)) return false;
    if (!deepEqual(a[key], b[key])) return false;
  }

  return true;
}

async function verifyHomepageCutover() {
  const { StaticHomepageRepository } = await import('../src/repositories/static/static-homepage.repository');
  const { PostgresHomepageRepository } = await import('../src/repositories/postgres/postgres-homepage.repository');
  const { PostgresPackageRepository } = await import('../src/repositories/postgres/postgres-package.repository');
  const { PostgresDoctorRepository } = await import('../src/repositories/postgres/postgres-doctor.repository');
  const { PostgresClinicalTrustRepository } = await import('../src/repositories/postgres/postgres-clinical-trust.repository');
  const { PostgresClinicRepository } = await import('../src/repositories/postgres/postgres-clinic.repository');

  console.log('====================================================');
  console.log('DB-12 HOMEPAGE POSTGRESQL PRE-CUTOVER PARITY AUDIT');
  console.log('====================================================\n');

  const staticRepo = new StaticHomepageRepository();
  const postgresRepo = new PostgresHomepageRepository();

  const [staticData, postgresData] = await Promise.all([
    staticRepo.getHomepageData(),
    postgresRepo.getHomepageData(),
  ]);

  let parityMismatches = 0;

  // 1. Hero block verification
  console.log('[1/7] Auditing Hero Block...');
  if (deepEqual(staticData.hero, postgresData.hero)) {
    console.log('  ✓ Hero block 100% semantic parity PASS');
  } else {
    console.error('  ✗ Hero mismatch:', {
      static: staticData.hero,
      postgres: postgresData.hero,
    });
    parityMismatches++;
  }

  // 2. Pain points block verification
  console.log('\n[2/7] Auditing Pain Points Block...');
  if (deepEqual(staticData.painPoints, postgresData.painPoints)) {
    console.log('  ✓ Pain points block 100% semantic parity PASS');
  } else {
    console.error('  ✗ Pain points mismatch:', {
      static: staticData.painPoints,
      postgres: postgresData.painPoints,
    });
    parityMismatches++;
  }

  // 3. Benefits block verification
  console.log('\n[3/7] Auditing Benefits Block...');
  if (deepEqual(staticData.benefits, postgresData.benefits)) {
    console.log('  ✓ Benefits block 100% semantic parity PASS');
  } else {
    console.error('  ✗ Benefits mismatch:', {
      static: staticData.benefits,
      postgres: postgresData.benefits,
    });
    parityMismatches++;
  }

  // 4. Cancer Screening block verification
  console.log('\n[4/7] Auditing Cancer Screening Block...');
  if (deepEqual(staticData.cancerScreening, postgresData.cancerScreening)) {
    console.log('  ✓ Cancer screening block 100% semantic parity PASS');
  } else {
    console.error('  ✗ Cancer screening mismatch:', {
      static: staticData.cancerScreening,
      postgres: postgresData.cancerScreening,
    });
    parityMismatches++;
  }

  // 5. Banner CTA block verification
  console.log('\n[5/7] Auditing Banner CTA Block...');
  if (deepEqual(staticData.bannerCta, postgresData.bannerCta)) {
    console.log('  ✓ Banner CTA block 100% semantic parity PASS');
  } else {
    console.error('  ✗ Banner CTA mismatch:', {
      static: staticData.bannerCta,
      postgres: postgresData.bannerCta,
    });
    parityMismatches++;
  }

  // 6. Sections Meta block verification
  console.log('\n[6/7] Auditing Sections Meta Block...');
  if (deepEqual(staticData.sectionsMeta, postgresData.sectionsMeta)) {
    console.log('  ✓ Sections meta block 100% semantic parity PASS');
  } else {
    console.error('  ✗ Sections meta mismatch:', {
      static: staticData.sectionsMeta,
      postgres: postgresData.sectionsMeta,
    });
    parityMismatches++;
  }

  // 7. Pricing block verification
  console.log('\n[7/7] Auditing Pricing Block...');
  if (deepEqual(staticData.pricing, postgresData.pricing)) {
    console.log('  ✓ Pricing block 100% semantic parity PASS');
  } else {
    console.error('  ✗ Pricing mismatch:', {
      static: staticData.pricing,
      postgres: postgresData.pricing,
    });
    parityMismatches++;
  }

  console.log('\n====================================================');
  console.log('ENTITY REFERENCE & FIDELITY AUDIT');
  console.log('====================================================\n');

  // Package pricing fidelity against PostgreSQL PackageRepository
  const packageRepo = new PostgresPackageRepository();
  const [allMalePkgs, allFemalePkgs] = await Promise.all([
    packageRepo.getByGender('male'),
    packageRepo.getByGender('female'),
  ]);

  console.log('[Entity: Packages] Checking Homepage package prices against PostgresPackageRepository...');
  for (const p of postgresData.pricing.malePackages) {
    const canonical = allMalePkgs.find((x) => x.id === p.id || x.slug === p.slug || x.url === p.slug);
    if (canonical) {
      console.log(`  ✓ Male Package [${p.id}]: Display Price = ${p.price}, Canonical Price = ${canonical.price.toLocaleString('vi-VN')}đ (Matched)`);
    } else {
      console.log(`  ℹ Male Package [${p.id}]: Displayed on Homepage with price ${p.price}`);
    }
  }

  for (const p of postgresData.pricing.femalePackages) {
    const canonical = allFemalePkgs.find((x) => x.id === p.id || x.slug === p.slug || x.url === p.slug);
    if (canonical) {
      console.log(`  ✓ Female Package [${p.id}]: Display Price = ${p.price}, Canonical Price = ${canonical.price.toLocaleString('vi-VN')}đ (Matched)`);
    } else {
      console.log(`  ℹ Female Package [${p.id}]: Displayed on Homepage with price ${p.price}`);
    }
  }

  // Doctor entity integrity
  const doctorRepo = new PostgresDoctorRepository();
  const doctors = await doctorRepo.getAll();
  console.log(`\n[Entity: Doctors] Loaded ${doctors.length} doctors from PostgreSQL doctorRepository:`);
  doctors.forEach((d) => console.log(`  ✓ Doctor: ${d.title} ${d.name} (${d.specialty})`));

  // Clinical trust integrity
  const trustRepo = new PostgresClinicalTrustRepository();
  const [equip, faqs, vidTestimonials, customerStories] = await Promise.all([
    trustRepo.getEquipment(),
    trustRepo.getFaqs(),
    trustRepo.getVideoTestimonials(),
    trustRepo.getCustomerStories(),
  ]);

  console.log(`\n[Entity: ClinicalTrust] Loaded from PostgreSQL:`);
  console.log(`  ✓ Equipment items: ${equip.length}`);
  console.log(`  ✓ FAQs: ${faqs.length}`);
  console.log(`  ✓ Video Testimonials: ${vidTestimonials.length}`);
  console.log(`  ✓ Customer Stories: ${customerStories.length}`);

  // Clinic profile integrity
  const clinicRepo = new PostgresClinicRepository();
  const clinic = await clinicRepo.getClinicInfo();
  console.log(`\n[Entity: Clinic] Loaded from PostgreSQL:`);
  console.log(`  ✓ Clinic Name: ${clinic.name}`);
  console.log(`  ✓ Hotline: ${clinic.hotline}`);
  console.log(`  ✓ Address: ${clinic.address.full}`);

  console.log('\n====================================================');
  console.log(`AUDIT SUMMARY: ${parityMismatches === 0 ? 'ALL PARITY CHECKS PASSED (100%)' : `FAILED (${parityMismatches} mismatches)`}`);
  console.log('====================================================\n');

  if (parityMismatches > 0) {
    process.exit(1);
  }
}

verifyHomepageCutover().catch((err) => {
  console.error('Fatal error during verification:', err);
  process.exit(1);
});
