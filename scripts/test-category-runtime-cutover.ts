import * as dotenv from 'dotenv';

// Stub server-only for standalone CLI script execution outside Next.js webpack/turbopack bundler
require.cache[require.resolve('server-only')] = {
  id: require.resolve('server-only'),
  filename: require.resolve('server-only'),
  loaded: true,
  exports: {},
} as unknown as NodeModule;

dotenv.config({ path: '.env.local' });

async function testCategoryRuntimeCutover() {
  console.log('========================================================================');
  console.log('📑 DB-8: CATEGORY RUNTIME CUTOVER VERIFICATION & REGRESSION AUDIT');
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
  const { StaticArticleRepository } = await import('../src/repositories/static/static-article.repository');
  const { StaticPageRepository } = await import('../src/repositories/static/static-page.repository');
  const { StaticClinicRepository } = await import('../src/repositories/static/static-clinic.repository');
  const { StaticClinicalTrustRepository } = await import('../src/repositories/static/static-clinical-trust.repository');

  // 1. Verify Provider Class Types
  console.log('--- 1. PROVIDER CLASS INSTANCE VERIFICATION ---');
  const isDoctorPg = doctorRepository instanceof PostgresDoctorRepository;
  const isPackagePg = packageRepository instanceof PostgresPackageRepository;
  const isCategoryPg = categoryRepository instanceof PostgresCategoryRepository;
  const isArticleStatic = articleRepository instanceof StaticArticleRepository;
  const isPageStatic = pageRepository instanceof StaticPageRepository;
  const isClinicStatic = clinicRepository instanceof StaticClinicRepository;
  const isTrustStatic = clinicalTrustRepository instanceof StaticClinicalTrustRepository;

  console.log(`DoctorRepository:        ${isDoctorPg ? '✅ PostgresDoctorRepository (POSTGRESQL)' : '❌ NOT POSTGRES'}`);
  console.log(`PackageRepository:       ${isPackagePg ? '✅ PostgresPackageRepository (POSTGRESQL)' : '❌ NOT POSTGRES'}`);
  console.log(`CategoryRepository:      ${isCategoryPg ? '✅ PostgresCategoryRepository (POSTGRESQL)' : '❌ NOT POSTGRES'}`);
  console.log(`PageRepository:          ${isPageStatic ? '✅ StaticPageRepository (STATIC)' : '❌ NOT STATIC'}`);
  console.log(`ClinicRepository:        ${isClinicStatic ? '✅ StaticClinicRepository (STATIC)' : '❌ NOT STATIC'}`);
  console.log(`ClinicalTrustRepository: ${isTrustStatic ? '✅ StaticClinicalTrustRepository (STATIC)' : '❌ NOT STATIC'}`);

  if (
    !isDoctorPg ||
    !isPackagePg ||
    !isCategoryPg ||
    !isPageStatic ||
    !isClinicStatic ||
    !isTrustStatic
  ) {
    console.error('❌ Provider configuration failed! Doctor, Package & Category must be Postgres, non-migrated domains Static.');
    process.exit(1);
  }

  // 2. Test Category Live PostgreSQL Queries
  console.log('\n--- 2. CATEGORY REPOSITORY LIVE POSTGRESQL QUERIES ---');
  const allCategories = await categoryRepository.getAll();
  console.log(`Fetched ${allCategories.length} categories from PostgreSQL.`);

  if (allCategories.length !== 30) {
    console.error(`❌ Expected 30 categories, got ${allCategories.length}`);
    process.exit(1);
  }

  const sampleCategories = [
    '12-loai-ung-thu-thuong-gap',
    '22-nhom-tam-soat-can-biet',
    '5-trieu-chung-da-day-hay-gap',
    '7-benh-ly-da-day-hay-gap',
    'bao-chi',
    'cau-chuyen-khach-hang',
    'kien-thuc-ung-thu-da-day',
    'kien-thuc-ung-thu-dai-trang',
  ];

  for (const slug of sampleCategories) {
    const cat = await categoryRepository.getBySlug(slug);
    if (!cat) {
      console.error(`❌ Failed to retrieve category by slug "${slug}" from PostgreSQL!`);
      process.exit(1);
    }
    console.log(`  ✓ [ID ${cat.id}] ${cat.name} (${cat.slug}) | Count: ${cat.count}`);
  }

  // 3. Test Non-Existent Category Query
  const nonExistent = await categoryRepository.getBySlug('non-existent-category-slug-xyz');
  if (nonExistent !== null) {
    console.error('❌ Non-existent category query did not return null');
    process.exit(1);
  }
  console.log('  ✓ getBySlug("non-existent-category-slug-xyz") returned null correctly.');

  // 4. Doctor & Package Domain Regression (PostgreSQL)
  console.log('\n--- 3. POSTGRESQL REGRESSION AUDIT (DOCTORS & PACKAGES) ---');
  const allDoctors = await doctorRepository.getAll();
  console.log(`  ✓ DoctorRepository.getAll(): ${allDoctors.length} doctors from PostgreSQL`);
  const doc = await doctorRepository.getBySlug('trinh-ai-nhi');
  if (!doc || doc.cchn !== '040144/HCM-CCHN') {
    console.error('❌ Doctor regression check failed!');
    process.exit(1);
  }
  console.log(`  ✓ Doctor sample: ${doc.name} (CCHN: ${doc.cchn})`);

  const allPackages = await packageRepository.getAll();
  console.log(`  ✓ PackageRepository.getAll(): ${allPackages.length} packages from PostgreSQL`);
  const pkg = await packageRepository.getBySlug('goi-khuyen-cao-danh-cho-nu');
  if (!pkg || pkg.price !== 3000000) {
    console.error('❌ Package regression check failed!');
    process.exit(1);
  }
  console.log(`  ✓ Package sample: ${pkg.name} (${pkg.priceFormatted})`);

  // 5. Static Domains Regression
  console.log('\n--- 4. STATIC DOMAINS REGRESSION AUDIT ---');
  const articles = await articleRepository.getAll();
  console.log(`  ✓ ArticleRepository.getAll(): ${articles.length} articles`);

  const pages = await pageRepository.getAll();
  console.log(`  ✓ PageRepository.getAll(): ${pages.length} pages (Static)`);

  const clinic = await clinicRepository.getClinicInfo();
  console.log(`  ✓ ClinicRepository.getClinicInfo(): "${clinic.name}", Hotline: ${clinic.hotline} (Static)`);

  console.log('\n========================================================================');
  console.log('🎉 DB-8 RUNTIME CUTOVER VERIFICATION COMPLETED SUCCESSFULLY!');
  console.log('========================================================================\n');
  process.exit(0);
}

testCategoryRuntimeCutover().catch((err) => {
  console.error('❌ Error during category runtime cutover testing:', err);
  process.exit(1);
});
