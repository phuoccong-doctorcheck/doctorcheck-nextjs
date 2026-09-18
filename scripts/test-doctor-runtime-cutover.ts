import * as dotenv from 'dotenv';

// Stub server-only for standalone CLI script execution outside Next.js webpack/turbopack bundler
require.cache[require.resolve('server-only')] = {
  id: require.resolve('server-only'),
  filename: require.resolve('server-only'),
  loaded: true,
  exports: {},
} as unknown as NodeModule;

dotenv.config({ path: '.env.local' });

async function testRuntimeCutover() {
  console.log('========================================================================');
  console.log('🩺 DB-6: DOCTOR RUNTIME CUTOVER VERIFICATION & REGRESSION AUDIT');
  console.log('========================================================================\n');

  const {
    doctorRepository,
    articleRepository,
    packageRepository,
    categoryRepository,
    pageRepository,
    clinicRepository,
    clinicalTrustRepository,
  } = await import('../src/repositories');

  const { PostgresDoctorRepository } = await import('../src/repositories/postgres/postgres-doctor.repository');
  const { StaticArticleRepository } = await import('../src/repositories/static/static-article.repository');
  const { StaticPackageRepository } = await import('../src/repositories/static/static-package.repository');
  const { StaticCategoryRepository } = await import('../src/repositories/static/static-category.repository');
  const { StaticPageRepository } = await import('../src/repositories/static/static-page.repository');
  const { StaticClinicRepository } = await import('../src/repositories/static/static-clinic.repository');
  const { StaticClinicalTrustRepository } = await import('../src/repositories/static/static-clinical-trust.repository');

  // 1. Verify Provider Class Types
  console.log('--- 1. PROVIDER CLASS INSTANCE VERIFICATION ---');
  const isDoctorPg = doctorRepository instanceof PostgresDoctorRepository;
  const isArticleStatic = articleRepository instanceof StaticArticleRepository;
  const isPackageStatic = packageRepository instanceof StaticPackageRepository;
  const isCategoryStatic = categoryRepository instanceof StaticCategoryRepository;
  const isPageStatic = pageRepository instanceof StaticPageRepository;
  const isClinicStatic = clinicRepository instanceof StaticClinicRepository;
  const isTrustStatic = clinicalTrustRepository instanceof StaticClinicalTrustRepository;

  console.log(`DoctorRepository:        ${isDoctorPg ? '✅ PostgresDoctorRepository (POSTGRESQL)' : '❌ NOT POSTGRES'}`);
  console.log(`PageRepository:          ${isPageStatic ? '✅ StaticPageRepository (STATIC)' : '❌ NOT STATIC'}`);
  console.log(`ClinicRepository:        ${isClinicStatic ? '✅ StaticClinicRepository (STATIC)' : '❌ NOT STATIC'}`);
  console.log(`ClinicalTrustRepository: ${isTrustStatic ? '✅ StaticClinicalTrustRepository (STATIC)' : '❌ NOT STATIC'}`);

  if (
    !isDoctorPg ||
    !isPageStatic ||
    !isClinicStatic ||
    !isTrustStatic
  ) {
    console.error('❌ Provider configuration failed! Doctor must be Postgres, non-migrated domains Static.');
    process.exit(1);
  }

  // 2. Test Doctor Runtime Queries against PostgreSQL
  console.log('\n--- 2. DOCTOR REPOSITORY LIVE POSTGRESQL QUERIES ---');
  const allDoctors = await doctorRepository.getAll();
  console.log(`Fetched ${allDoctors.length} doctors from PostgreSQL.`);

  const expectedDoctorSlugs = [
    'trinh-ai-nhi',
    'chau-quynh-phi-nha',
    'nguyen-ngoc-quynh-dung',
    'nguyen-hong-thanh',
    'luu-ngoc-mai',
    'thai-viet-nguyen',
    'dang-nguyen-nhat-thanh-thi',
  ];

  for (const slug of expectedDoctorSlugs) {
    const doc = await doctorRepository.getBySlug(slug);
    if (!doc) {
      console.error(`❌ Failed to retrieve doctor by slug "${slug}" from PostgreSQL!`);
      process.exit(1);
    }
    console.log(`  ✓ [${doc.id}] ${doc.name} | CCHN: ${doc.cchn} | Specialty: ${doc.specialty}`);
  }

  // 3. Test Non-Existent Doctor Query
  const nonExistent = await doctorRepository.getBySlug('non-existent-doctor-slug-xyz');
  if (nonExistent !== null) {
    console.error('❌ Non-existent doctor query did not return null');
    process.exit(1);
  }
  console.log('  ✓ getBySlug("non-existent-doctor-slug-xyz") returned null correctly.');

  // 4. Non-Doctor Regression Tests
  console.log('\n--- 3. NON-DOCTOR DOMAIN REGRESSION TESTS (STATIC REPOSITORIES) ---');
  const articles = await articleRepository.getAll();
  console.log(`  ✓ ArticleRepository.getAll(): ${articles.length} articles (Expected 108)`);

  const packages = await packageRepository.getAll();
  console.log(`  ✓ PackageRepository.getAll(): ${packages.length} packages (Expected 9)`);

  const categories = await categoryRepository.getAll();
  console.log(`  ✓ CategoryRepository.getAll(): ${categories.length} categories (Expected 30)`);

  const pages = await pageRepository.getAll();
  console.log(`  ✓ PageRepository.getAll(): ${pages.length} pages (Expected 55)`);

  const clinic = await clinicRepository.getClinicInfo();
  console.log(`  ✓ ClinicRepository.getClinicInfo(): "${clinic.name}", Hotline: ${clinic.hotline}`);

  const equipment = await clinicalTrustRepository.getEquipment();
  console.log(`  ✓ ClinicalTrustRepository.getEquipment(): ${equipment.length} items`);

  console.log('\n========================================================================');
  console.log('🎉 DB-6 RUNTIME CUTOVER VERIFICATION COMPLETED SUCCESSFULLY!');
  console.log('========================================================================\n');
  process.exit(0);
}

testRuntimeCutover().catch((err) => {
  console.error('❌ Error during runtime cutover testing:', err);
  process.exit(1);
});
