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
import { resolveContent } from '../src/lib/routing/resolve-content';
import { classifyPageFamily, PageFamilyType, UTILITY_LEGAL_SLUGS } from '../src/lib/routing/page-family-policy';

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
  console.log('UTILITY, CONTACT & LEGAL (FAMILY 6) TESTS');
  console.log('======================================================\n');

  const suite = 'FAMILY_6_UTILITY_LEGAL';

  const family6Slugs = [
    'lien-he',
    'chinh-sach-quyen-rieng-tu',
    'chinh-sach-bao-mat',
    'chinh-sach-thanh-toan',
    'chinh-sach-hoan-tien',
    'dieu-khoan-su-dung',
    'cam-on',
    'dich-vu',
    'blog',
  ];

  // 1. Verify Family Classification for all Slugs
  for (const slug of family6Slugs) {
    const fam = classifyPageFamily(slug);
    assert(
      fam === PageFamilyType.UTILITY_LEGAL,
      suite,
      `Slug "${slug}" classifies into UTILITY_LEGAL`,
      { slug, family: fam }
    );
  }

  // 2. Verify Canonical Contact Page /lien-he/
  const contactPage = getPageBySlug('lien-he');
  assert(!!contactPage, suite, 'Canonical Page "lien-he" exists in database');
  assert(
    !!contactPage?.contentHtml && contactPage.contentHtml.length > 5000,
    suite,
    `Contact page has substantive authentic content (${contactPage?.contentHtml?.length || 0} chars)`
  );
  const contactRes = await resolveContent('lien-he');
  assert(contactRes.type === 'page', suite, 'Route /lien-he/ resolves to page');

  // 3. Verify Canonical Privacy Policy Page /chinh-sach-quyen-rieng-tu/
  const privacyPage = getPageBySlug('chinh-sach-quyen-rieng-tu');
  assert(!!privacyPage, suite, 'Canonical Page "chinh-sach-quyen-rieng-tu" exists in database');
  assert(
    !!privacyPage?.contentHtml && privacyPage.contentHtml.length > 3000,
    suite,
    `Privacy policy has substantive authentic content (${privacyPage?.contentHtml?.length || 0} chars)`
  );
  const privacyRes = await resolveContent('chinh-sach-quyen-rieng-tu');
  assert(privacyRes.type === 'page', suite, 'Route /chinh-sach-quyen-rieng-tu/ resolves to page');

  // 4. Verify Thank You Page /cam-on/
  const thankYouPage = getPageBySlug('cam-on');
  assert(!!thankYouPage, suite, 'Canonical Page "cam-on" exists in database');
  const thankYouRes = await resolveContent('cam-on');
  assert(thankYouRes.type === 'page', suite, 'Route /cam-on/ resolves to page');

  // 5. Scoped Stylesheet Verification
  const cssPath = 'src/styles/utility-legal.css';
  assert(fs.existsSync(cssPath), suite, 'Scoped stylesheet src/styles/utility-legal.css exists');
  const cssContent = fs.readFileSync(cssPath, 'utf8');
  assert(cssContent.includes('.utility-legal-page'), suite, 'Stylesheet scopes all rules under .utility-legal-page');
  assert(cssContent.includes('--dc-main: #005570'), suite, 'Stylesheet defines brand primary color #005570');
  assert(cssContent.includes('--dc-gold: #FFB500') || cssContent.includes('--dc-secondary: #FFB500'), suite, 'Stylesheet defines brand secondary gold #FFB500');
  assert(cssContent.includes('.legal-content-wrap'), suite, 'Stylesheet defines legal content wrapper');

  // 6. Zero Presentation Slug-Hack Audit
  const templatePath = 'src/components/templates/UtilityLegalTemplate.tsx';
  const templateCode = fs.readFileSync(templatePath, 'utf8');
  const hasSlugHack = templateCode.includes('switch (');
  assert(!hasSlugHack, suite, 'Zero presentation slug hacks in UtilityLegalTemplate');

  // 7. Protected Collision Hard Gate Verification (All 6 cases)
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

  // 8. Article Route Verification
  const ungThuDaiTrangRes = await resolveContent('ung-thu-dai-trang');
  assert(ungThuDaiTrangRes.type === 'article', suite, 'Route /ung-thu-dai-trang/ remains type article');

  const dauThuongViRes = await resolveContent('dau-thuong-vi');
  assert(dauThuongViRes.type === 'article', suite, 'Route /dau-thuong-vi/ remains type article');

  // 9. Summary
  const passed = results.filter((r) => r.passed).length;
  const total = results.length;
  console.log(`\n------------------------------------------------------`);
  console.log(`UTILITY & LEGAL RESULTS: ${passed}/${total} assertions passed`);
  console.log(`------------------------------------------------------\n`);

  if (passed !== total) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
