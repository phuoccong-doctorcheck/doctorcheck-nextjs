import * as dotenv from 'dotenv';

// Stub server-only for standalone CLI script execution outside Next.js webpack/turbopack bundler
require.cache[require.resolve('server-only')] = {
  id: require.resolve('server-only'),
  filename: require.resolve('server-only'),
  loaded: true,
  exports: {},
} as unknown as NodeModule;

dotenv.config({ path: '.env.local' });

async function testPackageRuntimeCutover() {
  console.log('========================================================================');
  console.log('📦 DB-7: PACKAGE RUNTIME CUTOVER VERIFICATION & REGRESSION AUDIT');
  console.log('========================================================================\n');

  const {
    doctorRepository,
    packageRepository,
    articleRepository,
    categoryRepository,
    pageRepository,
    clinicRepository,
    clinicalTrustRepository,
  } = await import('../src/repositories');

  const { PostgresDoctorRepository } = await import('../src/repositories/postgres/postgres-doctor.repository');
  const { PostgresPackageRepository } = await import('../src/repositories/postgres/postgres-package.repository');
  const { StaticArticleRepository } = await import('../src/repositories/static/static-article.repository');
  const { StaticCategoryRepository } = await import('../src/repositories/static/static-category.repository');
  const { StaticPageRepository } = await import('../src/repositories/static/static-page.repository');
  const { StaticClinicRepository } = await import('../src/repositories/static/static-clinic.repository');
  const { StaticClinicalTrustRepository } = await import('../src/repositories/static/static-clinical-trust.repository');

  // 1. Verify Provider Class Types
  console.log('--- 1. PROVIDER CLASS INSTANCE VERIFICATION ---');
  const isDoctorPg = doctorRepository instanceof PostgresDoctorRepository;
  const isPackagePg = packageRepository instanceof PostgresPackageRepository;
  const isArticleStatic = articleRepository instanceof StaticArticleRepository;
  const isCategoryStatic = categoryRepository instanceof StaticCategoryRepository;
  const isPageStatic = pageRepository instanceof StaticPageRepository;
  const isClinicStatic = clinicRepository instanceof StaticClinicRepository;
  const isTrustStatic = clinicalTrustRepository instanceof StaticClinicalTrustRepository;

  console.log(`DoctorRepository:        ${isDoctorPg ? '✅ PostgresDoctorRepository (POSTGRESQL)' : '❌ NOT POSTGRES'}`);
  console.log(`PackageRepository:       ${isPackagePg ? '✅ PostgresPackageRepository (POSTGRESQL)' : '❌ NOT POSTGRES'}`);
  console.log(`PageRepository:          ${isPageStatic ? '✅ StaticPageRepository (STATIC)' : '❌ NOT STATIC'}`);
  console.log(`ClinicRepository:        ${isClinicStatic ? '✅ StaticClinicRepository (STATIC)' : '❌ NOT STATIC'}`);
  console.log(`ClinicalTrustRepository: ${isTrustStatic ? '✅ StaticClinicalTrustRepository (STATIC)' : '❌ NOT STATIC'}`);

  if (
    !isDoctorPg ||
    !isPackagePg ||
    !isPageStatic ||
    !isClinicStatic ||
    !isTrustStatic
  ) {
    console.error('❌ Provider configuration failed! Doctor & Package must be Postgres, non-migrated domains Static.');
    process.exit(1);
  }

  // 2. Test Package Live PostgreSQL Queries
  console.log('\n--- 2. PACKAGE REPOSITORY LIVE POSTGRESQL QUERIES ---');
  const allPackages = await packageRepository.getAll();
  console.log(`Fetched ${allPackages.length} packages from PostgreSQL.`);

  const expectedPackageSlugs = [
    'goi-khuyen-cao-danh-cho-nu',
    'goi-tam-soat-chuyen-sau-danh-cho-nu',
    'goi-kham-song-tho-danh-cho-nu',
    'goi-khuyen-cao-danh-cho-nam',
    'goi-chuyen-sau-danh-cho-nam',
    'goi-song-tho-danh-cho-nam',
    'goi-ung-thu-da-day',
    'tam-soat-ung-thu-da-day',
    'tam-soat-ung-thu-dai-trang',
  ];

  for (const slug of expectedPackageSlugs) {
    const pkg = await packageRepository.getBySlug(slug);
    if (!pkg) {
      console.error(`❌ Failed to retrieve package by slug "${slug}" from PostgreSQL!`);
      process.exit(1);
    }
    console.log(`  ✓ [${pkg.slug}] ${pkg.name} | Price: ${pkg.priceFormatted} | Items: ${pkg.features.length}`);
  }

  // 3. Test Non-Existent Package Query
  const nonExistent = await packageRepository.getBySlug('non-existent-package-slug-xyz');
  if (nonExistent !== null) {
    console.error('❌ Non-existent package query did not return null');
    process.exit(1);
  }
  console.log('  ✓ getBySlug("non-existent-package-slug-xyz") returned null correctly.');

  // 4. Doctor Domain Regression Verification (DB-6)
  console.log('\n--- 3. DOCTOR DOMAIN REGRESSION VERIFICATION (POSTGRESQL) ---');
  const allDoctors = await doctorRepository.getAll();
  console.log(`  ✓ DoctorRepository.getAll(): ${allDoctors.length} doctors from PostgreSQL`);
  const sampleDoc = await doctorRepository.getBySlug('trinh-ai-nhi');
  if (!sampleDoc || sampleDoc.cchn !== '040144/HCM-CCHN') {
    console.error('❌ Doctor regression check failed for trinh-ai-nhi!');
    process.exit(1);
  }
  console.log(`  ✓ Doctor sample verified: ${sampleDoc.name} | CCHN: ${sampleDoc.cchn}`);

  // 5. Non-Package Static Domains Regression
  console.log('\n--- 4. STATIC DOMAINS REGRESSION VERIFICATION ---');
  const articles = await articleRepository.getAll();
  console.log(`  ✓ ArticleRepository.getAll(): ${articles.length} articles (Static)`);

  const categories = await categoryRepository.getAll();
  console.log(`  ✓ CategoryRepository.getAll(): ${categories.length} categories (Static)`);

  const pages = await pageRepository.getAll();
  console.log(`  ✓ PageRepository.getAll(): ${pages.length} pages (Static)`);

  const clinic = await clinicRepository.getClinicInfo();
  console.log(`  ✓ ClinicRepository.getClinicInfo(): "${clinic.name}", Hotline: ${clinic.hotline} (Static)`);

  console.log('\n========================================================================');
  console.log('🎉 DB-7 RUNTIME CUTOVER VERIFICATION COMPLETED SUCCESSFULLY!');
  console.log('========================================================================\n');
  process.exit(0);
}

testPackageRuntimeCutover().catch((err) => {
  console.error('❌ Error during package runtime cutover testing:', err);
  process.exit(1);
});
