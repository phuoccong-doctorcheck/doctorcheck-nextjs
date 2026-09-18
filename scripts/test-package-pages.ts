import * as dotenv from 'dotenv';
import fs from 'fs';

// Stub 'server-only' for Node standalone execution
require.cache[require.resolve('server-only')] = {
  id: require.resolve('server-only'),
  filename: require.resolve('server-only'),
  loaded: true,
  exports: {},
} as unknown as NodeModule;

dotenv.config({ path: '.env.local' });
dotenv.config();

import { getPageBySlug } from '../src/lib/content/pages-data';
import { packagesData } from '../src/lib/data/packages';
import { resolveContent, resolveEndoscopySubpath } from '../src/lib/routing/resolve-content';
import { classifyPageFamily, PageFamilyType, PACKAGE_COMPARISON_SLUGS } from '../src/lib/routing/page-family-policy';

interface TestResult {
  suite: string;
  name: string;
  passed: boolean;
  error?: string;
  details?: Record<string, unknown>;
}

const results: TestResult[] = [];

function assert(condition: boolean, suite: string, name: string, details?: Record<string, unknown>) {
  if (condition) {
    results.push({ suite, name, passed: true, details });
    console.log(`  ✅ [PASS] ${suite} > ${name}`);
  } else {
    results.push({ suite, name, passed: false, error: 'Assertion failed', details });
    console.error(`  ❌ [FAIL] ${suite} > ${name}`, details);
  }
}

async function runTests() {
  console.log('\n======================================================');
  console.log('HEALTH CHECKUP & PACKAGE COMPARISON (FAMILY 3) TESTS');
  console.log('======================================================\n');

  const suite = 'FAMILY_3_PACKAGE_COMPARISON';

  const family3Slugs = [
    'goi-tam-soat-nam',
    'goi-tam-soat-nu',
    'so-sanh-3-goi-kham-nam',
    'so-sanh-3-goi-kham-nu',
    'so-sanh-goi-kham-tong-quat-danh-cho-nam',
    'so-sanh-goi-kham-tong-quat-danh-cho-nu',
    'bang-gia-kham-tong-quat',
    'bang-gia-kham-tong-quat-new',
    'bang-gia-kham-suc-khoe-tong-quat',
    'bang-gia-noi-soi-da-day',
    'kham-tong-quat',
    'kham-suc-khoe-doanh-nghiep',
    'loi-ich-goi-song-tho',
    'loi-ich-khi-kham-tong-quat-tai-doctor-check',
    'cac-yeu-to-cua-mot-dia-chi-tam-soat-benh-trong-mo',
  ];

  // 1. Verify 15 Pages Scope
  assert(PACKAGE_COMPARISON_SLUGS.size === 15, suite, 'Family 3 slug registry contains exactly 15 routes');

  // 2. Verify Family Classification for all 15 Slugs
  for (const slug of family3Slugs) {
    const fam = classifyPageFamily(slug);
    assert(
      fam === PageFamilyType.PACKAGE_COMPARISON,
      suite,
      `Slug "${slug}" classifies into PACKAGE_COMPARISON`,
      { slug, family: fam }
    );
  }

  // 3. Verify Content Integrity & Essential HTML Features
  for (const slug of family3Slugs) {
    const page = getPageBySlug(slug);
    assert(!!page, suite, `Page "${slug}" exists in canonical data`);
    assert(
      !!page?.contentHtml && page.contentHtml.length > 10000,
      suite,
      `Page "${slug}" has substantive content (${page?.contentHtml?.length || 0} chars)`
    );
  }

  // 4. Primary Representative /goi-tam-soat-nam/ Verification
  const representative = getPageBySlug('goi-tam-soat-nam');
  assert(!!representative, suite, 'Primary representative /goi-tam-soat-nam/ exists');
  const repHtml = representative?.contentHtml || '';

  assert(
    repHtml.includes('Tầm soát bệnh nam') || repHtml.includes('tam-soat-benh-nam') || (representative?.title.includes('Gói tầm soát nam') ?? false),
    suite,
    'Representative contains authentic male checkup headline'
  );
  assert(repHtml.includes('section_'), suite, 'Representative contains Flatsome section identifiers');
  assert(repHtml.includes('tabbed-content') || repHtml.includes('tab-panels'), suite, 'Representative contains tabbed package structure');
  assert(repHtml.includes('timeline') || repHtml.includes('age-badge'), suite, 'Representative contains risk age timeline');

  // 5. Canonical Package Data Authority (Zero Price Drift)
  assert(packagesData.male.length === 3, suite, 'Male packages have 3 canonical tiers');
  assert(packagesData.female.length === 3, suite, 'Female packages have 3 canonical tiers');

  const malePrices = packagesData.male.map((p) => p.priceFormatted);
  assert(malePrices.includes('2.990.000đ') || malePrices.includes('3.000.000đ'), suite, 'Male Khuyen Cao price verified');
  assert(malePrices.includes('5.000.000đ'), suite, 'Male Chuyen Sau price verified');
  assert(malePrices.includes('11.500.000đ'), suite, 'Male Song Tho price verified');

  // 6. Route Resolution for Root & Nested Subpaths
  const rootRes = await resolveContent('goi-tam-soat-nam');
  assert(rootRes.type === 'page', suite, 'Root route /goi-tam-soat-nam/ resolves to page');

  const femaleRes = await resolveContent('goi-tam-soat-nu');
  assert(femaleRes.type === 'page', suite, 'Root route /goi-tam-soat-nu/ resolves to page');

  const compareMaleRes = await resolveContent('so-sanh-3-goi-kham-nam');
  assert(compareMaleRes.type === 'page', suite, 'Root route /so-sanh-3-goi-kham-nam/ resolves to page');

  const nestedRes = await resolveEndoscopySubpath(['bang-gia-noi-soi-da-day']);
  assert(nestedRes.type === 'page', suite, 'Nested route /trung-tam-noi-soi-tieu-hoa/bang-gia-noi-soi-da-day/ resolves to page');

  // 7. Scoped Stylesheet Verification
  const cssPath = 'src/styles/package-comparison.css';
  assert(fs.existsSync(cssPath), suite, 'Scoped stylesheet src/styles/package-comparison.css exists');
  const cssContent = fs.readFileSync(cssPath, 'utf8');
  assert(cssContent.includes('.package-family-page'), suite, 'Stylesheet scopes all rules under .package-family-page');
  assert(cssContent.includes('--dc-main: #005570'), suite, 'Stylesheet defines brand primary color #005570');
  assert(cssContent.includes('--dc-price: #CD0000'), suite, 'Stylesheet defines price color #CD0000');
  assert(cssContent.includes('overflow-x: auto'), suite, 'Stylesheet defines bounded horizontal overflow for tables');

  // 8. Zero Slug-Hack Audit
  const templatePath = 'src/components/templates/PackageComparisonTemplate.tsx';
  const templateCode = fs.readFileSync(templatePath, 'utf8');
  const hasSlugHack = templateCode.includes('slug ===') || templateCode.includes('slug.includes') || templateCode.includes('switch (');
  assert(!hasSlugHack, suite, 'Zero presentation slug hacks in PackageComparisonTemplate');

  // 9. Summary
  const passed = results.filter((r) => r.passed).length;
  const total = results.length;
  console.log(`\n------------------------------------------------------`);
  console.log(`PACKAGE COMPARISON RESULTS: ${passed}/${total} assertions passed`);
  console.log(`------------------------------------------------------\n`);

  if (passed !== total) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
