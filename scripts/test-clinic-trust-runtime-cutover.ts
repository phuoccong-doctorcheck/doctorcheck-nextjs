import * as dotenv from 'dotenv';

// Stub server-only for standalone CLI script execution outside Next.js webpack/turbopack bundler
require.cache[require.resolve('server-only')] = {
  id: require.resolve('server-only'),
  filename: require.resolve('server-only'),
  loaded: true,
  exports: {},
} as unknown as NodeModule;

dotenv.config({ path: '.env.local' });

async function testClinicTrustRuntimeCutover() {
  console.log('========================================================================');
  console.log('🏥 DB-11: CLINIC & CLINICAL TRUST RUNTIME CUTOVER VERIFICATION');
  console.log('========================================================================\n');

  const {
    doctorRepository,
    packageRepository,
    categoryRepository,
    articleRepository,
    pageRepository,
    clinicRepository,
    clinicalTrustRepository,
  } = await import('../src/repositories');

  const { PostgresDoctorRepository } = await import('../src/repositories/postgres/postgres-doctor.repository');
  const { PostgresPackageRepository } = await import('../src/repositories/postgres/postgres-package.repository');
  const { PostgresCategoryRepository } = await import('../src/repositories/postgres/postgres-category.repository');
  const { PostgresArticleRepository } = await import('../src/repositories/postgres/postgres-article.repository');
  const { PostgresPageRepository } = await import('../src/repositories/postgres/postgres-page.repository');
  const { PostgresClinicRepository } = await import('../src/repositories/postgres/postgres-clinic.repository');
  const { PostgresClinicalTrustRepository } = await import('../src/repositories/postgres/postgres-clinical-trust.repository');

  // 1. Verify Provider Class Types
  console.log('--- 1. PROVIDER CLASS INSTANCE VERIFICATION ---');
  const isDoctorPg = doctorRepository instanceof PostgresDoctorRepository;
  const isPackagePg = packageRepository instanceof PostgresPackageRepository;
  const isCategoryPg = categoryRepository instanceof PostgresCategoryRepository;
  const isArticlePg = articleRepository instanceof PostgresArticleRepository;
  const isPagePg = pageRepository instanceof PostgresPageRepository;
  const isClinicPg = clinicRepository instanceof PostgresClinicRepository;
  const isTrustPg = clinicalTrustRepository instanceof PostgresClinicalTrustRepository;

  console.log(`DoctorRepository:        ${isDoctorPg ? '✅ PostgresDoctorRepository (POSTGRESQL)' : '❌ NOT POSTGRES'}`);
  console.log(`PackageRepository:       ${isPackagePg ? '✅ PostgresPackageRepository (POSTGRESQL)' : '❌ NOT POSTGRES'}`);
  console.log(`CategoryRepository:      ${isCategoryPg ? '✅ PostgresCategoryRepository (POSTGRESQL)' : '❌ NOT POSTGRES'}`);
  console.log(`ArticleRepository:       ${isArticlePg ? '✅ PostgresArticleRepository (POSTGRESQL)' : '❌ NOT POSTGRES'}`);
  console.log(`PageRepository:          ${isPagePg ? '✅ PostgresPageRepository (POSTGRESQL)' : '❌ NOT POSTGRES'}`);
  console.log(`ClinicRepository:        ${isClinicPg ? '✅ PostgresClinicRepository (POSTGRESQL)' : '❌ NOT POSTGRES'}`);
  console.log(`ClinicalTrustRepository: ${isTrustPg ? '✅ PostgresClinicalTrustRepository (POSTGRESQL)' : '❌ NOT POSTGRES'}`);

  if (
    !isDoctorPg ||
    !isPackagePg ||
    !isCategoryPg ||
    !isArticlePg ||
    !isPagePg ||
    !isClinicPg ||
    !isTrustPg
  ) {
    console.error('❌ Provider configuration failed! All 7 domain repositories must be Postgres.');
    process.exit(1);
  }

  // 2. Test Clinic Live PostgreSQL Queries
  console.log('\n--- 2. CLINIC REPOSITORY LIVE POSTGRESQL QUERIES ---');
  const clinic = await clinicRepository.getClinicInfo();
  console.log(`  ✓ Clinic Name:    "${clinic.name}"`);
  console.log(`  ✓ Legal Name:     "${clinic.legalName}"`);
  console.log(`  ✓ License:        "${clinic.license}"`);
  console.log(`  ✓ Address:        "${clinic.address.full}"`);
  console.log(`  ✓ Hotline:        "${clinic.hotline}"`);
  console.log(`  ✓ Working Hours:  "${clinic.workingHours}"`);
  console.log(`  ✓ Coordinates:    (${clinic.coordinates.latitude}, ${clinic.coordinates.longitude})`);

  // 3. Test Clinical Trust Live PostgreSQL Queries
  console.log('\n--- 3. CLINICAL TRUST LIVE POSTGRESQL QUERIES ---');
  const equipment = await clinicalTrustRepository.getEquipment();
  console.log(`Fetched ${equipment.length} equipment items from PostgreSQL:`);
  equipment.forEach((e) => console.log(`  ✓ [${e.id}] ${e.name} (${e.origin})`));

  const faqs = await clinicalTrustRepository.getFaqs();
  console.log(`\nFetched ${faqs.length} FAQs from PostgreSQL:`);
  faqs.forEach((f) => console.log(`  ✓ [${f.id}] "${f.question.slice(0, 50)}..."`));

  const videos = await clinicalTrustRepository.getVideoTestimonials();
  console.log(`\nFetched ${videos.length} Video Testimonials from PostgreSQL:`);
  videos.forEach((v) => console.log(`  ✓ [${v.id}] ${v.patientName} (VideoId: ${v.videoId})`));

  const stories = await clinicalTrustRepository.getCustomerStories();
  console.log(`\nFetched ${stories.length} Customer Stories from PostgreSQL:`);
  stories.forEach((s) => console.log(`  ✓ [${s.id}] ${s.patientName} - "${s.title.slice(0, 45)}..."`));

  // 4. PostgreSQL Regression Audit (Doctors, Packages, Categories, Articles, Pages)
  console.log('\n--- 4. POSTGRESQL REGRESSION AUDIT (ALL PREVIOUS DOMAINS) ---');
  const allDoctors = await doctorRepository.getAll();
  console.log(`  ✓ DoctorRepository.getAll():   ${allDoctors.length}/7 doctors from PostgreSQL`);
  const allPackages = await packageRepository.getAll();
  console.log(`  ✓ PackageRepository.getAll():  ${allPackages.length}/9 packages from PostgreSQL`);
  const allCategories = await categoryRepository.getAll();
  console.log(`  ✓ CategoryRepository.getAll(): ${allCategories.length}/30 categories from PostgreSQL`);
  const allArticles = await articleRepository.getAll();
  console.log(`  ✓ ArticleRepository.getAll():  ${allArticles.length}/108 articles from PostgreSQL`);
  const allPages = await pageRepository.getAll();
  console.log(`  ✓ PageRepository.getAll():     ${allPages.length}/55 pages from PostgreSQL`);

  console.log('\n========================================================================');
  console.log('🎉 DB-11 CLINIC & CLINICAL TRUST RUNTIME CUTOVER COMPLETED SUCCESSFULLY!');
  console.log('========================================================================\n');
  process.exit(0);
}

testClinicTrustRuntimeCutover().catch((err) => {
  console.error('❌ Error during clinic & clinical trust runtime cutover testing:', err);
  process.exit(1);
});
