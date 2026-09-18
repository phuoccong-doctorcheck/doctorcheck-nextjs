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
import { resolveContent, resolveEndoscopySubpath } from '../src/lib/routing/resolve-content';
import { classifyPageFamily, PageFamilyType, CLINICAL_QUALITY_PROTOCOLS_SLUGS } from '../src/lib/routing/page-family-policy';

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
  console.log('CLINICAL QUALITY, TRUST & PROTOCOLS (FAMILY 4) TESTS');
  console.log('======================================================\n');

  const suite = 'FAMILY_4_CLINICAL_PROTOCOLS';

  const family4Slugs = [
    '10-tieu-chuan-vang',
    'quy-trinh-noi-soi-da-day',
    'quy-trinh-noi-soi-dai-trang',
    'thuoc-va-vat-tu-y-te',
    'doi-ngu-bac-si-doctorcheck',
    'bao-chi-dua-tin',
    'quyen-loi-bhyt-bhtn',
  ];

  // 1. Verify 7 Pages Scope
  assert(CLINICAL_QUALITY_PROTOCOLS_SLUGS.size === 7, suite, 'Family 4 slug registry contains exactly 7 routes');

  // 2. Verify Family Classification for all 7 Slugs
  for (const slug of family4Slugs) {
    const fam = classifyPageFamily(slug);
    assert(
      fam === PageFamilyType.CLINICAL_QUALITY_PROTOCOLS,
      suite,
      `Slug "${slug}" classifies into CLINICAL_QUALITY_PROTOCOLS`,
      { slug, family: fam }
    );
  }

  // 3. Verify Content Integrity & Essential HTML Features
  for (const slug of family4Slugs) {
    const page = getPageBySlug(slug);
    assert(!!page, suite, `Page "${slug}" exists in canonical data`);
    assert(
      !!page?.contentHtml && page.contentHtml.length > 4000,
      suite,
      `Page "${slug}" has substantive content (${page?.contentHtml?.length || 0} chars)`
    );
  }

  // 4. Primary Representative /10-tieu-chuan-vang/ Verification
  const representative = getPageBySlug('10-tieu-chuan-vang');
  assert(!!representative, suite, 'Primary representative /10-tieu-chuan-vang/ exists');
  const repHtml = representative?.contentHtml || '';

  assert(
    repHtml.includes('10 tiêu chuẩn vàng') || repHtml.includes('tiêu chuẩn vàng') || (representative?.title.includes('10 tiêu chuẩn vàng') ?? false),
    suite,
    'Representative contains authentic 10 Gold Standards headline'
  );
  assert(repHtml.includes('section'), suite, 'Representative contains Flatsome section identifiers');
  assert(repHtml.includes('icon-box'), suite, 'Representative contains clinical standard icon boxes');

  // 5. Route Resolution for Root & Nested Subpaths
  const medSupplyRes = await resolveContent('thuoc-va-vat-tu-y-te');
  assert(medSupplyRes.type === 'page', suite, 'Root route /thuoc-va-vat-tu-y-te/ resolves to page');

  const doctorsRes = await resolveContent('doi-ngu-bac-si-doctorcheck');
  assert(doctorsRes.type === 'page', suite, 'Root route /doi-ngu-bac-si-doctorcheck/ resolves to page');

  const nestedStandardsRes = await resolveEndoscopySubpath(['10-tieu-chuan-vang']);
  assert(nestedStandardsRes.type === 'page', suite, 'Nested route /trung-tam-noi-soi-tieu-hoa-doctor-check/10-tieu-chuan-vang/ resolves to page');

  const nestedStomachProcRes = await resolveEndoscopySubpath([
    'tam-soat-ung-thu-da-day-tai-doctor-check',
    'quy-trinh-noi-soi-da-day',
  ]);
  assert(nestedStomachProcRes.type === 'page', suite, 'Nested route .../quy-trinh-noi-soi-da-day/ resolves to page');

  const nestedColonProcRes = await resolveEndoscopySubpath([
    'tam-soat-ung-thu-dai-trang-tai-doctor-check',
    'quy-trinh-noi-soi-dai-trang',
  ]);
  assert(nestedColonProcRes.type === 'page', suite, 'Nested route .../quy-trinh-noi-soi-dai-trang/ resolves to page');

  const nestedPressRes = await resolveEndoscopySubpath(['bao-chi-dua-tin']);
  assert(nestedPressRes.type === 'page', suite, 'Nested route /trung-tam-noi-soi-tieu-hoa-doctor-check/bao-chi-dua-tin/ resolves to page');

  const nestedInsuranceRes = await resolveEndoscopySubpath(['quyen-loi-bhyt-bhtn']);
  assert(nestedInsuranceRes.type === 'page', suite, 'Nested route /trung-tam-noi-soi-tieu-hoa-doctor-check/quyen-loi-bhyt-bhtn/ resolves to page');

  // 6. Scoped Stylesheet Verification
  const cssPath = 'src/styles/clinical-protocols.css';
  assert(fs.existsSync(cssPath), suite, 'Scoped stylesheet src/styles/clinical-protocols.css exists');
  const cssContent = fs.readFileSync(cssPath, 'utf8');
  assert(cssContent.includes('.clinical-protocols-page'), suite, 'Stylesheet scopes all rules under .clinical-protocols-page');
  assert(cssContent.includes('--dc-main: #005570'), suite, 'Stylesheet defines brand primary color #005570');
  assert(cssContent.includes('--dc-gold: #FFB500') || cssContent.includes('--dc-secondary: #FFB500'), suite, 'Stylesheet defines brand secondary gold #FFB500');

  // 7. Zero Slug-Hack Audit
  const templatePath = 'src/components/templates/ClinicalProtocolsTemplate.tsx';
  const templateCode = fs.readFileSync(templatePath, 'utf8');
  const hasSlugHack = templateCode.includes('slug.includes') || templateCode.includes('switch (');
  assert(!hasSlugHack, suite, 'Zero presentation slug hacks in ClinicalProtocolsTemplate');

  // 8. Summary
  const passed = results.filter((r) => r.passed).length;
  const total = results.length;
  console.log(`\n------------------------------------------------------`);
  console.log(`CLINICAL PROTOCOLS RESULTS: ${passed}/${total} assertions passed`);
  console.log(`------------------------------------------------------\n`);

  if (passed !== total) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
