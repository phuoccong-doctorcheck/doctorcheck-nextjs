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
import { classifyPageFamily, PageFamilyType, CLINICAL_SYMPTOM_GUIDE_SLUGS } from '../src/lib/routing/page-family-policy';

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
  console.log('CLINICAL SYMPTOM & PATHOLOGY GUIDE (FAMILY 2) TESTS');
  console.log('======================================================\n');

  const suite = 'FAMILY_2_CLINICAL_GUIDES';

  const family2Slugs = [
    'trieu-chung-da-day',
    'benh-ly-da-day',
    'trieu-chung-dai-trang',
    'benh-ly-dai-trang',
    'buon-non-non-keo-dai',
    'dieu-tri-tao-bon-di-cau-ra-mau',
  ];

  // 1. Verify 6 Pages Scope
  assert(CLINICAL_SYMPTOM_GUIDE_SLUGS.size === 6, suite, 'Family 2 slug registry contains exactly 6 routes');

  // 2. Verify Family Classification for all 6 Slugs
  for (const slug of family2Slugs) {
    const fam = classifyPageFamily(slug);
    assert(
      fam === PageFamilyType.CLINICAL_SYMPTOM_GUIDE,
      suite,
      `Slug "${slug}" classifies into CLINICAL_SYMPTOM_GUIDE`,
      { slug, family: fam }
    );
  }

  // 3. Verify Content Integrity & Essential HTML Features
  for (const slug of family2Slugs) {
    const page = getPageBySlug(slug);
    assert(!!page, suite, `Page "${slug}" exists in canonical data`);
    assert(
      !!page?.contentHtml && page.contentHtml.length > 40000,
      suite,
      `Page "${slug}" has rich authentic content (${page?.contentHtml?.length || 0} chars)`
    );
  }

  // 4. Primary Representative /trieu-chung-da-day/ Verification
  const representative = getPageBySlug('trieu-chung-da-day');
  assert(!!representative, suite, 'Primary representative /trieu-chung-da-day/ exists');
  const repHtml = representative?.contentHtml || '';

  assert(
    repHtml.includes('section') && repHtml.includes('post-title'),
    suite,
    'Representative contains authentic symptom grid & post-title cards'
  );
  assert(repHtml.includes('section-dear'), suite, 'Representative contains section-dear intro header');
  assert(repHtml.includes('section-reason'), suite, 'Representative contains section-reason clinical block');

  // 5. Route Resolution for Root & Nested Subpaths
  const buonNonRes = await resolveContent('buon-non-non-keo-dai');
  assert(buonNonRes.type === 'page', suite, 'Root route /buon-non-non-keo-dai/ resolves to page');

  const dieuTriRes = await resolveContent('dieu-tri-tao-bon-di-cau-ra-mau');
  assert(dieuTriRes.type === 'page', suite, 'Root route /dieu-tri-tao-bon-di-cau-ra-mau/ resolves to page');

  const nestedStomachSymptoms = await resolveEndoscopySubpath([
    'chuyen-khoa-da-day',
    'trieu-chung-da-day',
  ]);
  assert(nestedStomachSymptoms.type === 'page', suite, 'Nested route .../chuyen-khoa-da-day/trieu-chung-da-day/ resolves to page');

  const nestedStomachPathologies = await resolveEndoscopySubpath([
    'chuyen-khoa-da-day',
    'benh-ly-da-day',
  ]);
  assert(nestedStomachPathologies.type === 'page', suite, 'Nested route .../chuyen-khoa-da-day/benh-ly-da-day/ resolves to page');

  const nestedColonSymptoms = await resolveEndoscopySubpath([
    'chuyen-khoa-dai-trang',
    'trieu-chung-dai-trang',
  ]);
  assert(nestedColonSymptoms.type === 'page', suite, 'Nested route .../chuyen-khoa-dai-trang/trieu-chung-dai-trang/ resolves to page');

  const nestedColonPathologies = await resolveEndoscopySubpath([
    'chuyen-khoa-dai-trang',
    'benh-ly-dai-trang',
  ]);
  assert(nestedColonPathologies.type === 'page', suite, 'Nested route .../chuyen-khoa-dai-trang/benh-ly-dai-trang/ resolves to page');

  // 6. Scoped Stylesheet Verification
  const cssPath = 'src/styles/clinical-guide.css';
  assert(fs.existsSync(cssPath), suite, 'Scoped stylesheet src/styles/clinical-guide.css exists');
  const cssContent = fs.readFileSync(cssPath, 'utf8');
  assert(cssContent.includes('.clinical-guide-page'), suite, 'Stylesheet scopes all rules under .clinical-guide-page');
  assert(cssContent.includes('--dc-main: #005570'), suite, 'Stylesheet defines brand primary color #005570');
  assert(cssContent.includes('--dc-gold: #FFB500') || cssContent.includes('--dc-secondary: #FFB500'), suite, 'Stylesheet defines brand secondary gold #FFB500');

  // 7. Zero Presentation Slug-Hack Audit
  const templatePath = 'src/components/templates/ClinicalGuideTemplate.tsx';
  const templateCode = fs.readFileSync(templatePath, 'utf8');
  const hasSlugHack = templateCode.includes('slug.includes') || templateCode.includes('switch (');
  assert(!hasSlugHack, suite, 'Zero presentation slug hacks in ClinicalGuideTemplate');

  // 8. Protected Collision Hard Gate Verification (All 6 cases)
  const collisions = [
    'dau-thuong-vi',
    'tieu-chay',
    'di-ngoai-ra-mau',
    'tao-bon',
    'kien-thuc-ung-thu-da-day',
    'kien-thuc-ung-thu-dai-trang',
  ];

  for (const slug of collisions) {
    const res = await resolveContent(slug);
    assert(
      res.type === 'article' || res.type === 'category',
      suite,
      `Protected collision slug "${slug}" resolves to ${res.type} (NOT hijacked by page)`
    );
  }

  // 9. Article Route Verification
  const ungThuDaiTrangRes = await resolveContent('ung-thu-dai-trang');
  assert(ungThuDaiTrangRes.type === 'article', suite, 'Route /ung-thu-dai-trang/ remains type article');

  const dauThuongViRes = await resolveContent('dau-thuong-vi');
  assert(dauThuongViRes.type === 'article', suite, 'Route /dau-thuong-vi/ remains type article');

  // 10. Summary
  const passed = results.filter((r) => r.passed).length;
  const total = results.length;
  console.log(`\n------------------------------------------------------`);
  console.log(`CLINICAL GUIDES RESULTS: ${passed}/${total} assertions passed`);
  console.log(`------------------------------------------------------\n`);

  if (passed !== total) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
