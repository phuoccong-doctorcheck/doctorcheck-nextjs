import * as dotenv from 'dotenv';

require.cache[require.resolve('server-only')] = {
  id: require.resolve('server-only'),
  filename: require.resolve('server-only'),
  loaded: true,
  exports: {},
} as unknown as NodeModule;

dotenv.config({ path: '.env.local' });

async function testHomepageRuntimeCutover() {
  const {
    homepageRepository,
    doctorRepository,
    packageRepository,
    categoryRepository,
    articleRepository,
    pageRepository,
    clinicRepository,
    clinicalTrustRepository,
    getRepositories,
  } = await import('../src/repositories');

  const { PostgresHomepageRepository } = await import('../src/repositories/postgres/postgres-homepage.repository');
  const { PostgresDoctorRepository } = await import('../src/repositories/postgres/postgres-doctor.repository');
  const { PostgresPackageRepository } = await import('../src/repositories/postgres/postgres-package.repository');
  const { PostgresCategoryRepository } = await import('../src/repositories/postgres/postgres-category.repository');
  const { PostgresArticleRepository } = await import('../src/repositories/postgres/postgres-article.repository');
  const { PostgresPageRepository } = await import('../src/repositories/postgres/postgres-page.repository');
  const { PostgresClinicRepository } = await import('../src/repositories/postgres/postgres-clinic.repository');
  const { PostgresClinicalTrustRepository } = await import('../src/repositories/postgres/postgres-clinical-trust.repository');

  console.log('====================================================');
  console.log('DB-12 RUNTIME POSTGRESQL PROVIDER CUTOVER TEST');
  console.log('====================================================\n');

  console.log('[1/8] Verifying Default Provider Configuration...');
  const activeRepos = getRepositories();

  const domainStatus = [
    { name: 'Doctors', isPg: activeRepos.doctor instanceof PostgresDoctorRepository },
    { name: 'Packages', isPg: activeRepos.package instanceof PostgresPackageRepository },
    { name: 'Categories', isPg: activeRepos.category instanceof PostgresCategoryRepository },
    { name: 'Articles', isPg: activeRepos.article instanceof PostgresArticleRepository },
    { name: 'Pages', isPg: activeRepos.page instanceof PostgresPageRepository },
    { name: 'Clinic', isPg: activeRepos.clinic instanceof PostgresClinicRepository },
    { name: 'ClinicalTrust', isPg: activeRepos.clinicalTrust instanceof PostgresClinicalTrustRepository },
    { name: 'Homepage', isPg: activeRepos.homepage instanceof PostgresHomepageRepository },
  ];

  for (const d of domainStatus) {
    if (d.isPg) {
      console.log(`  ✓ Domain [${d.name}] -> POSTGRESQL (Active)`);
    } else {
      console.error(`  ✗ Domain [${d.name}] -> STATIC (Regression Error)`);
      process.exit(1);
    }
  }

  console.log('\n[2/8] Testing HomepageRepository.getHomepageData() Execution...');
  const startTime = Date.now();
  const hpData = await homepageRepository.getHomepageData();
  const queryDuration = Date.now() - startTime;

  console.log(`  ✓ Data fetched in ${queryDuration}ms`);
  console.log(`  ✓ Hero title: "${hpData.hero.title}"`);
  console.log(`  ✓ Pain points count: ${hpData.painPoints.items.length}`);
  console.log(`  ✓ Benefits count: ${hpData.benefits.items.length}`);
  console.log(`  ✓ Cancer screening cards: ${hpData.cancerScreening.featuredCards.length}`);
  console.log(`  ✓ Banner CTA brand: "${hpData.bannerCta.brand}"`);
  console.log(`  ✓ Pricing Male packages: ${hpData.pricing.malePackages.length}, Female: ${hpData.pricing.femalePackages.length}`);

  console.log('\n[3/8] Testing Individual Block Retrieval with getBlock()...');
  const hero = await homepageRepository.getBlock<any>('hero');
  const painPoints = await homepageRepository.getBlock<any>('pain_points');
  const benefits = await homepageRepository.getBlock<any>('benefits');
  const cancerScreening = await homepageRepository.getBlock<any>('cancer_screening');
  const bannerCta = await homepageRepository.getBlock<any>('banner_cta');
  const sectionsMeta = await homepageRepository.getBlock<any>('sections_meta');
  const pricing = await homepageRepository.getBlock<any>('pricing');

  if (hero?.title && painPoints?.items?.length && benefits?.items?.length && cancerScreening?.title && bannerCta?.brand && sectionsMeta?.doctorsHeader?.title && pricing?.malePackages?.length) {
    console.log('  ✓ All 7 individual block getters (getBlock) working correctly');
  } else {
    console.error('  ✗ Individual block getter error');
    process.exit(1);
  }

  console.log('\n[4/8] Testing Domain Regressions for All Other 7 Domains...');
  const [docs, pkgs, cats, arts, pgs, clinic, trustEquip] = await Promise.all([
    doctorRepository.getAll(),
    packageRepository.getAll(),
    categoryRepository.getAll(),
    articleRepository.getAll(),
    pageRepository.getAll(),
    clinicRepository.getClinicInfo(),
    clinicalTrustRepository.getEquipment(),
  ]);

  console.log(`  ✓ DoctorRepository: ${docs.length} items`);
  console.log(`  ✓ PackageRepository: ${pkgs.length} items`);
  console.log(`  ✓ CategoryRepository: ${cats.length} items`);
  console.log(`  ✓ ArticleRepository: ${arts.length} items`);
  console.log(`  ✓ PageRepository: ${pgs.length} items`);
  console.log(`  ✓ ClinicRepository: "${clinic.name}"`);
  console.log(`  ✓ ClinicalTrustRepository: ${trustEquip.length} equipment items`);

  console.log('\n====================================================');
  console.log('ALL DB-12 RUNTIME TESTS PASSED');
  console.log('====================================================\n');
}

testHomepageRuntimeCutover().catch((err) => {
  console.error('Fatal error during test:', err);
  process.exit(1);
});
