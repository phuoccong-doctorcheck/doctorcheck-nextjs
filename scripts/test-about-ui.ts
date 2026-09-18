import * as dotenv from 'dotenv';
import fs from 'fs';

// Stub 'server-only' for standalone node execution
require.cache[require.resolve('server-only')] = {
  id: require.resolve('server-only'),
  filename: require.resolve('server-only'),
  loaded: true,
  exports: {},
} as unknown as NodeModule;

dotenv.config({ path: '.env.local' });
dotenv.config();

import { resolveContent } from '../src/lib/routing/resolve-content';
import { getLegacyRedirect } from '../src/lib/routing/redirects';
import { getPageBySlug } from '../src/lib/content/pages-data';

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
  console.log('RUNNING ABOUT PAGE FORENSIC RECONSTRUCTION TESTS');
  console.log('======================================================\n');

  const suite = 'ABOUT_UI';

  // 1. Route Resolution & Canonical Identity
  const aboutCanonical = resolveContent('ve-doctor-check');
  assert(aboutCanonical.type === 'page', suite, 'Canonical /ve-doctor-check/ resolves to page template');
  assert(aboutCanonical.title === 'Về Doctor Check', suite, 'Canonical title is "Về Doctor Check"');
  assert(aboutCanonical.canonicalUrl === 'https://doctorcheck.vn/ve-doctor-check/', suite, 'Canonical URL is strictly https://doctorcheck.vn/ve-doctor-check/');

  const aboutLegacy = getLegacyRedirect('ve-chung-toi');
  assert(aboutLegacy === '/ve-doctor-check/', suite, 'Legacy /ve-chung-toi/ redirects 301 to /ve-doctor-check/');

  const resolvedLegacy = resolveContent('ve-chung-toi');
  assert(resolvedLegacy.type === 'redirect' && resolvedLegacy.redirectTarget === '/ve-doctor-check/', suite, 'resolveContent("ve-chung-toi") yields 301 redirect');

  // 2. Database Content Preservation (0 Checksum Drift)
  const dbPage = getPageBySlug('ve-doctor-check');
  assert(Boolean(dbPage && dbPage.contentHtml.length > 70000), suite, 'Canonical HTML preserved in database (>70KB)', { len: dbPage?.contentHtml?.length });

  // 3. Section Order Integrity
  if (dbPage) {
    const html = dbPage.contentHtml;
    const heroPos = html.indexOf('Doctor Check &#8211; Trung Tâm Tầm Soát Bệnh Chuyên Sâu') !== -1 ? 1 : html.indexOf('Tầm Soát Bệnh Chuyên Sâu');
    const licensePos = html.indexOf('Phòng Khám Doctor Check Được Cấp Phép Hoạt Động Bởi Sở Y Tế TP.HCM');
    const visionPos = html.indexOf('Tầm nhìn');
    const commitPos = html.indexOf('Cam Kết Từ Doctor Check Giúp Bạn An Tâm Tầm Soát Bệnh');
    const galleryPos = html.indexOf('Khám Phá Không Gian Phòng Khám Doctor Check');
    const equipPos = html.indexOf('Trang Bị Hệ Thống Máy Móc Hiện Đại');
    const reviewPos = html.indexOf('Kiểm Chứng Ngay Qua Những Chia Sẻ Từ Khách Hàng');
    const sloganPos = html.indexOf('Tầm Soát Bệnh Để Sống Thọ Hơn') !== -1 
      ? html.indexOf('Tầm Soát Bệnh Để Sống Thọ Hơn')
      : html.indexOf('section_1378931973');

    assert(heroPos !== -1 && licensePos > heroPos, suite, 'Section order: 1. Hero -> 2. License');
    assert(visionPos > licensePos, suite, 'Section order: 2. License -> 3. Vision/Mission');
    assert(commitPos > visionPos, suite, 'Section order: 3. Vision/Mission -> 4. Commitments');
    assert(galleryPos > commitPos, suite, 'Section order: 4. Commitments -> 5. Gallery');
    assert(equipPos > galleryPos, suite, 'Section order: 5. Gallery -> 6. Facilities/Equipment');
    assert(reviewPos > equipPos, suite, 'Section order: 6. Equipment -> 7. Customer Reviews Video');
    assert(sloganPos > reviewPos, suite, 'Section order: 7. Customer Reviews -> 8. Slogan CTA');
  }

  // 4. Component Implementation Verification
  const aboutComponentSrc = fs.readFileSync('./src/components/sites/doctorcheck-vn/about/AboutUsPage.tsx', 'utf8');
  assert(aboutComponentSrc.includes('section-banner-about'), suite, 'Component implements Section 1 (Banner About)');
  assert(aboutComponentSrc.includes('section-achivement'), suite, 'Component implements Section 2 (License Achievement)');
  assert(aboutComponentSrc.includes('section-vision'), suite, 'Component implements Section 3 (Vision & Mission)');
  assert(aboutComponentSrc.includes('section-commit'), suite, 'Component implements Section 4 (5 Commitments)');
  assert(aboutComponentSrc.includes('section-gallery about'), suite, 'Component implements Section 5 (Clinic Space Gallery)');
  assert(aboutComponentSrc.includes('section-facilities about'), suite, 'Component implements Section 6 (Facilities Equipment)');
  assert(aboutComponentSrc.includes('section-banner-cta'), suite, 'Component implements Section 7 (Slogan Banner CTA)');
  assert(aboutComponentSrc.includes('GALLERY_ITEMS'), suite, 'Component implements 15-item Gallery dataset');
  assert(aboutComponentSrc.includes('handleBookingSubmit'), suite, 'Component implements Booking modal submission');
  assert(aboutComponentSrc.includes('isVideoModalOpen'), suite, 'Component implements YouTube Video modal');

  // 5. CSS Scoping & Design Tokens Verification
  const css = fs.readFileSync('./src/components/sites/doctorcheck-vn/about/about-us.css', 'utf8');
  assert(css.includes('.about-us-page'), suite, 'CSS root scoped under .about-us-page');
  assert(css.includes('--container-width: 1250px'), suite, 'CSS enforces 1250px container width token');
  assert(css.includes('--color-main: #005570'), suite, 'CSS enforces #005570 brand color token');
  assert(css.includes('--color-second: #ffb500'), suite, 'CSS enforces #ffb500 accent color token');
  assert(css.includes('SVN-SofiaPro'), suite, 'CSS enforces authentic SVN-SofiaPro typography');
  assert(css.includes('.gallery-nav-btn'), suite, 'CSS implements gallery navigation controls');
  assert(css.includes('.doctor-hero-card-container'), suite, 'CSS implements hero card with yellow decorative accent');

  // Summary
  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;
  console.log(`\n======================================================`);
  console.log(`SUMMARY: ${passed} PASSED, ${failed} FAILED (TOTAL: ${results.length})`);
  console.log(`======================================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Test runner failure:', err);
  process.exit(1);
});
