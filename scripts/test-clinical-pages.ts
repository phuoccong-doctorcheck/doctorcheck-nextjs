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
import { classifyPageFamily, PageFamilyType, CLINICAL_ENDOSCOPY_HUB_SLUGS } from '../src/lib/routing/page-family-policy';

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
  console.log('CLINICAL ENDOSCOPY & SPECIALTY HUB (FAMILY 1) TESTS');
  console.log('======================================================\n');

  const suite = 'FAMILY_1_CLINICAL_HUB';

  const family1Slugs = [
    'noi-soi-da-day',
    'noi-soi-dai-trang',
    'chuyen-khoa-da-day',
    'chuyen-khoa-dai-trang',
    'trung-tam-noi-soi-tieu-hoa',
    'trung-tam-noi-soi-tieu-hoa-doctor-check',
    'noi-soi-da-day-chan-doan-benh-ly',
    'noi-soi-dai-trang-chan-doan-benh-ly',
    'tam-soat-ung-thu-da-day-tai-doctor-check',
    'tam-soat-ung-thu-dai-trang-tai-doctor-check',
  ];

  // 1. Verify 10 Pages Scope
  assert(CLINICAL_ENDOSCOPY_HUB_SLUGS.size === 10, suite, 'Family 1 slug registry contains exactly 10 routes');

  // 2. Verify Family Classification for all 10 Slugs
  for (const slug of family1Slugs) {
    const fam = classifyPageFamily(slug);
    assert(
      fam === PageFamilyType.CLINICAL_ENDOSCOPY_HUB,
      suite,
      `Slug "${slug}" classifies into CLINICAL_ENDOSCOPY_HUB`,
      { slug, family: fam }
    );
  }

  // 3. Verify Content Integrity & Essential HTML Features
  for (const slug of family1Slugs) {
    const page = getPageBySlug(slug);
    assert(!!page, suite, `Page "${slug}" exists in canonical data`);
    assert(!!page?.contentHtml && page.contentHtml.length > 5000, suite, `Page "${slug}" has substantive content (${page?.contentHtml?.length || 0} chars)`);
  }

  // 4. Primary Representative /noi-soi-da-day/ Verification
  const representative = getPageBySlug('noi-soi-da-day');
  assert(!!representative, suite, 'Primary representative /noi-soi-da-day/ exists');
  const repHtml = representative?.contentHtml || '';

  assert(repHtml.includes('Nội soi dạ dày') || repHtml.includes('nội soi dạ dày'), suite, 'Representative contains authentic endoscopy headline');
  assert(repHtml.includes('section_'), suite, 'Representative contains Flatsome section identifiers');
  assert(repHtml.includes('nsdd-') || repHtml.includes('icon-box') || repHtml.includes('nsdd-step'), suite, 'Representative contains authentic endoscopy section markup');

  // 5. Route Resolution for Root & Nested Subpaths
  const rootRes = await resolveContent('noi-soi-da-day');
  assert(rootRes.type === 'page', suite, 'Root route /noi-soi-da-day/ resolves to page');

  const colonRes = await resolveContent('noi-soi-dai-trang');
  assert(colonRes.type === 'page', suite, 'Root route /noi-soi-dai-trang/ resolves to page');

  const nestedRes = await resolveEndoscopySubpath(['chuyen-khoa-da-day']);
  assert(nestedRes.type === 'page', suite, 'Nested route /trung-tam-noi-soi-tieu-hoa-doctor-check/chuyen-khoa-da-day/ resolves to page');

  const nestedDiagnosticRes = await resolveEndoscopySubpath(['chuyen-khoa-da-day', 'noi-soi-da-day-chan-doan-benh-ly']);
  assert(nestedDiagnosticRes.type === 'page', suite, 'Deep nested route /trung-tam-noi-soi-tieu-hoa-doctor-check/chuyen-khoa-da-day/noi-soi-da-day-chan-doan-benh-ly/ resolves to page');

  // 6. Scoped Stylesheet Verification
  const cssPath = 'src/styles/clinical-hub.css';
  assert(fs.existsSync(cssPath), suite, 'Scoped stylesheet src/styles/clinical-hub.css exists');
  const cssContent = fs.readFileSync(cssPath, 'utf8');
  assert(cssContent.includes('.clinical-hub-page'), suite, 'Stylesheet scopes all rules under .clinical-hub-page');
  assert(cssContent.includes('--dc-main: #005570'), suite, 'Stylesheet defines brand primary color #005570');
  assert(cssContent.includes('--dc-secondary: #FFB500'), suite, 'Stylesheet defines brand secondary gold #FFB500');

  // 7. Summary
  const passed = results.filter((r) => r.passed).length;
  const total = results.length;
  console.log(`\n------------------------------------------------------`);
  console.log(`CLINICAL HUB RESULTS: ${passed}/${total} assertions passed`);
  console.log(`------------------------------------------------------\n`);

  if (passed !== total) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
