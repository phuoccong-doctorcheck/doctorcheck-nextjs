import * as dotenv from 'dotenv';

// Stub server-only for standalone CLI script execution outside Next.js webpack/turbopack bundler
require.cache[require.resolve('server-only')] = {
  id: require.resolve('server-only'),
  filename: require.resolve('server-only'),
  loaded: true,
  exports: {},
} as unknown as NodeModule;

dotenv.config({ path: '.env.local' });

async function testPageRuntimeCutover() {
  console.log('========================================================================');
  console.log('📑 DB-10: PAGE RUNTIME CUTOVER VERIFICATION & REGRESSION AUDIT');
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
  const { StaticClinicRepository } = await import('../src/repositories/static/static-clinic.repository');
  const { StaticClinicalTrustRepository } = await import('../src/repositories/static/static-clinical-trust.repository');

  // 1. Verify Provider Class Types
  console.log('--- 1. PROVIDER CLASS INSTANCE VERIFICATION ---');
  const isDoctorPg = doctorRepository instanceof PostgresDoctorRepository;
  const isPackagePg = packageRepository instanceof PostgresPackageRepository;
  const isCategoryPg = categoryRepository instanceof PostgresCategoryRepository;
  const isArticlePg = articleRepository instanceof PostgresArticleRepository;
  const isPagePg = pageRepository instanceof PostgresPageRepository;
  const isClinicStatic = clinicRepository instanceof StaticClinicRepository;
  const isTrustStatic = clinicalTrustRepository instanceof StaticClinicalTrustRepository;

  console.log(`DoctorRepository:        ${isDoctorPg ? '✅ PostgresDoctorRepository (POSTGRESQL)' : '❌ NOT POSTGRES'}`);
  console.log(`PackageRepository:       ${isPackagePg ? '✅ PostgresPackageRepository (POSTGRESQL)' : '❌ NOT POSTGRES'}`);
  console.log(`CategoryRepository:      ${isCategoryPg ? '✅ PostgresCategoryRepository (POSTGRESQL)' : '❌ NOT POSTGRES'}`);
  console.log(`ArticleRepository:       ${isArticlePg ? '✅ PostgresArticleRepository (POSTGRESQL)' : '❌ NOT POSTGRES'}`);
  console.log(`PageRepository:          ${isPagePg ? '✅ PostgresPageRepository (POSTGRESQL)' : '❌ NOT POSTGRES'}`);
  console.log(`ClinicRepository:        ${isClinicStatic ? '✅ StaticClinicRepository (STATIC)' : '❌ NOT STATIC'}`);
  console.log(`ClinicalTrustRepository: ${isTrustStatic ? '✅ StaticClinicalTrustRepository (STATIC)' : '❌ NOT STATIC'}`);

  if (
    !isDoctorPg ||
    !isPackagePg ||
    !isCategoryPg ||
    !isArticlePg ||
    !isPagePg ||
    !isClinicStatic ||
    !isTrustStatic
  ) {
    console.error('❌ Provider configuration failed! Doctor, Package, Category, Article & Page must be Postgres, Clinic & ClinicalTrust Static.');
    process.exit(1);
  }

  // 2. Test Page Live PostgreSQL Queries
  console.log('\n--- 2. PAGE REPOSITORY LIVE POSTGRESQL QUERIES ---');
  const allPages = await pageRepository.getAll();
  console.log(`Fetched ${allPages.length} pages from PostgreSQL.`);

  if (allPages.length !== 55) {
    console.error(`❌ Expected 55 pages, got ${allPages.length}`);
    process.exit(1);
  }

  const sampleSlugs = [
    've-doctor-check',
    'thuoc-va-vat-tu-y-te',
    'doi-ngu-bac-si-doctorcheck',
    'noi-soi-da-day',
    'noi-soi-dai-trang',
    'kham-suc-khoe-doanh-nghiep',
    'bao-chi-dua-tin',
    'benh-ly-da-day',
    'benh-ly-dai-trang',
  ];

  for (const slug of sampleSlugs) {
    const page = await pageRepository.getBySlug(slug);
    if (!page) {
      console.error(`❌ Failed to retrieve page by slug "${slug}" from PostgreSQL!`);
      process.exit(1);
    }
    console.log(`  ✓ [ID ${page.id}] ${page.title.slice(0, 45)}... | HTML length: ${page.contentHtml.length} bytes`);
  }

  // Test Non-Existent Page Query
  const nonExistent = await pageRepository.getBySlug('non-existent-page-slug-xyz');
  if (nonExistent !== null) {
    console.error('❌ Non-existent page query did not return null');
    process.exit(1);
  }
  console.log('  ✓ getBySlug("non-existent-page-slug-xyz") returned null correctly.');

  // 3. PostgreSQL Regression Audit (Doctors, Packages, Categories, Articles)
  console.log('\n--- 3. POSTGRESQL REGRESSION AUDIT (DOCTORS, PACKAGES, CATEGORIES, ARTICLES) ---');
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

  const allCategories = await categoryRepository.getAll();
  console.log(`  ✓ CategoryRepository.getAll(): ${allCategories.length} categories from PostgreSQL`);
  const cat = await categoryRepository.getBySlug('kien-thuc-ung-thu-da-day');
  if (!cat || cat.id !== 47) {
    console.error('❌ Category regression check failed!');
    process.exit(1);
  }
  console.log(`  ✓ Category sample: [ID ${cat.id}] ${cat.name}`);

  const allArticles = await articleRepository.getAll();
  console.log(`  ✓ ArticleRepository.getAll(): ${allArticles.length} articles from PostgreSQL`);
  const art = await articleRepository.getBySlug('dau-thuong-vi');
  if (!art || art.id !== 3622) {
    console.error('❌ Article regression check failed!');
    process.exit(1);
  }
  console.log(`  ✓ Article sample: [ID ${art.id}] ${art.title.slice(0, 35)}...`);

  // 4. Static Domains Regression
  console.log('\n--- 4. STATIC DOMAINS REGRESSION AUDIT ---');
  const clinic = await clinicRepository.getClinicInfo();
  console.log(`  ✓ ClinicRepository.getClinicInfo(): "${clinic.name}", Hotline: ${clinic.hotline} (Static)`);

  const equipment = await clinicalTrustRepository.getEquipment();
  const faqs = await clinicalTrustRepository.getFaqs();
  console.log(`  ✓ ClinicalTrustRepository: ${equipment.length} equipment items, ${faqs.length} FAQs (Static)`);

  console.log('\n========================================================================');
  console.log('🎉 DB-10 PAGE RUNTIME CUTOVER VERIFICATION COMPLETED SUCCESSFULLY!');
  console.log('========================================================================\n');
  process.exit(0);
}

testPageRuntimeCutover().catch((err) => {
  console.error('❌ Error during page runtime cutover testing:', err);
  process.exit(1);
});
