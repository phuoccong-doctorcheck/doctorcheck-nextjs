import * as dotenv from 'dotenv';

require.cache[require.resolve('server-only')] = {
  id: require.resolve('server-only'),
  filename: require.resolve('server-only'),
  loaded: true,
  exports: {},
} as unknown as NodeModule;

dotenv.config({ path: '.env.local' });

async function runRepositoryFidelityTests() {
  const { getRepositories } = await import('../src/repositories');
  console.log('========================================================================');
  console.log('🔍 DB-5: REPOSITORY CONTRACT & DUAL-PROVIDER FIDELITY TESTS');
  console.log('========================================================================\n');

  const staticRepos = getRepositories('static');
  const postgresRepos = getRepositories('postgres');

  const results: { domain: string; staticCount: number; postgresCount: number; sampleMatch: boolean; details: string }[] = [];

  // 1. Article Repository
  console.log('Testing ArticleRepository...');
  const staticArticles = await staticRepos.article.getAll();
  const postgresArticles = await postgresRepos.article.getAll();
  const sampleArticleSlug = 'tu-kiem-dinh-quoc-te-den-thuc-hanh-hang-ngay-trien-khai-aaci-trong-mo-hinh-phong-kham-tai-doctor-check';
  const staticArt = await staticRepos.article.getBySlug(sampleArticleSlug);
  const postgresArt = await postgresRepos.article.getBySlug(sampleArticleSlug);
  const artMatch =
    staticArt !== null &&
    postgresArt !== null &&
    staticArt.slug === postgresArt.slug &&
    staticArt.title === postgresArt.title &&
    staticArt.contentHtml.length === postgresArt.contentHtml.length &&
    staticArt.tableOfContents.length === postgresArt.tableOfContents.length;

  results.push({
    domain: 'ArticleRepository',
    staticCount: staticArticles.length,
    postgresCount: postgresArticles.length,
    sampleMatch: artMatch,
    details: `Slug: ${sampleArticleSlug.slice(0, 30)}... | HTML bytes: ${postgresArt?.contentHtml.length}`,
  });

  // 2. Doctor Repository
  console.log('Testing DoctorRepository...');
  const staticDoctors = await staticRepos.doctor.getAll();
  const postgresDoctors = await postgresRepos.doctor.getAll();
  const sampleDocSlug = 'trinh-ai-nhi';
  const staticDoc = await staticRepos.doctor.getBySlug(sampleDocSlug);
  const postgresDoc = await postgresRepos.doctor.getBySlug(sampleDocSlug);
  const docMatch =
    staticDoc !== null &&
    postgresDoc !== null &&
    staticDoc.name === postgresDoc.name &&
    staticDoc.cchn === postgresDoc.cchn &&
    staticDoc.specialty === postgresDoc.specialty;

  results.push({
    domain: 'DoctorRepository',
    staticCount: staticDoctors.length,
    postgresCount: postgresDoctors.length,
    sampleMatch: docMatch,
    details: `Name: ${postgresDoc?.name} | CCHN: ${postgresDoc?.cchn}`,
  });

  // 3. Package Repository
  console.log('Testing PackageRepository...');
  const staticPkgs = await staticRepos.package.getAll();
  const postgresPkgs = await postgresRepos.package.getAll();
  const samplePkgSlug = 'goi-khuyen-cao-danh-cho-nu';
  const staticPkg = await staticRepos.package.getBySlug(samplePkgSlug);
  const postgresPkg = await postgresRepos.package.getBySlug(samplePkgSlug);
  const pkgMatch =
    staticPkg !== null &&
    postgresPkg !== null &&
    staticPkg.price === postgresPkg.price &&
    staticPkg.features.length === postgresPkg.features.length;

  results.push({
    domain: 'PackageRepository',
    staticCount: staticPkgs.length,
    postgresCount: postgresPkgs.length,
    sampleMatch: pkgMatch,
    details: `Name: ${postgresPkg?.name} | Price: ${postgresPkg?.priceFormatted}`,
  });

  // 4. Category Repository
  console.log('Testing CategoryRepository...');
  const staticCats = await staticRepos.category.getAll();
  const postgresCats = await postgresRepos.category.getAll();
  const sampleCatSlug = '12-loai-ung-thu-thuong-gap';
  const staticCat = await staticRepos.category.getBySlug(sampleCatSlug);
  const postgresCat = await postgresRepos.category.getBySlug(sampleCatSlug);
  const catMatch =
    staticCat !== null &&
    postgresCat !== null &&
    staticCat.slug === postgresCat.slug &&
    staticCat.name === postgresCat.name;

  results.push({
    domain: 'CategoryRepository',
    staticCount: staticCats.length,
    postgresCount: postgresCats.length,
    sampleMatch: catMatch,
    details: `Name: ${postgresCat?.name}`,
  });

  // 5. Page Repository
  console.log('Testing PageRepository...');
  const staticPages = await staticRepos.page.getAll();
  const postgresPages = await postgresRepos.page.getAll();
  const samplePageSlug = 've-chung-toi';
  const staticPage = await staticRepos.page.getBySlug(samplePageSlug);
  const postgresPage = await postgresRepos.page.getBySlug(samplePageSlug);
  const pageMatch =
    staticPage !== null &&
    postgresPage !== null &&
    staticPage.title === postgresPage.title &&
    staticPage.contentHtml.length === postgresPage.contentHtml.length;

  results.push({
    domain: 'PageRepository',
    staticCount: staticPages.length,
    postgresCount: postgresPages.length,
    sampleMatch: pageMatch,
    details: `Title: ${postgresPage?.title} | HTML length: ${postgresPage?.contentHtml.length}`,
  });

  // 6. Clinic Repository
  console.log('Testing ClinicRepository...');
  const staticClinic = await staticRepos.clinic.getClinicInfo();
  const postgresClinic = await postgresRepos.clinic.getClinicInfo();
  const clinicMatch =
    staticClinic.name === postgresClinic.name &&
    staticClinic.license === postgresClinic.license &&
    staticClinic.hotline === postgresClinic.hotline &&
    staticClinic.address.full === postgresClinic.address.full;

  results.push({
    domain: 'ClinicRepository',
    staticCount: 1,
    postgresCount: 1,
    sampleMatch: clinicMatch,
    details: `License: ${postgresClinic.license} | Hotline: ${postgresClinic.hotline}`,
  });

  // 7. Clinical Trust Repository
  console.log('Testing ClinicalTrustRepository...');
  const staticEq = await staticRepos.clinicalTrust.getEquipment();
  const postgresEq = await postgresRepos.clinicalTrust.getEquipment();
  const staticFaqs = await staticRepos.clinicalTrust.getFaqs();
  const postgresFaqs = await postgresRepos.clinicalTrust.getFaqs();
  const staticTest = await staticRepos.clinicalTrust.getVideoTestimonials();
  const postgresTest = await postgresRepos.clinicalTrust.getVideoTestimonials();
  const trustMatch =
    staticEq.length === postgresEq.length &&
    staticFaqs.length === postgresFaqs.length &&
    staticTest.length === postgresTest.length;

  results.push({
    domain: 'ClinicalTrustRepository',
    staticCount: staticEq.length + staticFaqs.length + staticTest.length,
    postgresCount: postgresEq.length + postgresFaqs.length + postgresTest.length,
    sampleMatch: trustMatch,
    details: `Eq: ${postgresEq.length} | FAQs: ${postgresFaqs.length} | Testimonials: ${postgresTest.length}`,
  });

  // 8. Homepage Repository
  console.log('Testing HomepageRepository...');
  const staticHp = await staticRepos.homepage.getHomepageData();
  const postgresHp = await postgresRepos.homepage.getHomepageData();
  const hpMatch =
    staticHp.hero.title === postgresHp.hero.title &&
    staticHp.painPoints.items.length === postgresHp.painPoints.items.length &&
    staticHp.benefits.items.length === postgresHp.benefits.items.length &&
    staticHp.cancerScreening.featuredCards.length === postgresHp.cancerScreening.featuredCards.length &&
    staticHp.bannerCta.brand === postgresHp.bannerCta.brand &&
    staticHp.pricing.malePackages.length === postgresHp.pricing.malePackages.length &&
    staticHp.pricing.femalePackages.length === postgresHp.pricing.femalePackages.length;

  results.push({
    domain: 'HomepageRepository',
    staticCount: 7,
    postgresCount: 7,
    sampleMatch: hpMatch,
    details: `Hero: ${postgresHp.hero.title.slice(0, 25)}... | Blocks: 7`,
  });

  // ---------------------------------------------------------------------------
  // Results Table
  // ---------------------------------------------------------------------------
  console.log('\n┌──────────────────────────┬────────┬──────────┬──────────────┬────────────────────────────────────────────────────────┐');
  console.log('│ DOMAIN REPOSITORY        │ STATIC │ POSTGRES │ FIDELITY     │ SAMPLE VERIFICATION DETAILS                            │');
  console.log('├──────────────────────────┼────────┼──────────┼──────────────┼────────────────────────────────────────────────────────┤');
  results.forEach((r) => {
    const dom = r.domain.padEnd(24);
    const st = String(r.staticCount).padStart(6);
    const pg = String(r.postgresCount).padStart(8);
    const fid = (r.sampleMatch ? 'PASS (100%)' : 'MISMATCH').padEnd(12);
    const det = r.details.slice(0, 54).padEnd(54);
    console.log(`│ ${dom} │ ${st} │ ${pg} │ ${fid} │ ${det} │`);
  });
  console.log('└──────────────────────────┴────────┴──────────┴──────────────┴────────────────────────────────────────────────────────┘\n');

  const allPassed = results.every((r) => r.staticCount === r.postgresCount && r.sampleMatch);
  if (allPassed) {
    console.log('🎉 ALL REPOSITORY DUAL-PROVIDER FIDELITY TESTS PASSED SUCCESSFULLY!');
    process.exit(0);
  } else {
    console.error('❌ SOME REPOSITORY TESTS FAILED OR MISMATCHED');
    process.exit(1);
  }
}

runRepositoryFidelityTests().catch((err) => {
  console.error('❌ Error executing repository tests:', err);
  process.exit(1);
});
