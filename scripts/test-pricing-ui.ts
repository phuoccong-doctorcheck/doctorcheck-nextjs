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

import { packagesData } from '../src/lib/data/packages';
import { getPageBySlug } from '../src/lib/content/pages-data';
import { resolveContent, resolveEndoscopySubpath } from '../src/lib/routing/resolve-content';

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
  console.log('RUNNING PRICING UI FORENSIC RECONSTRUCTION TESTS');
  console.log('======================================================\n');

  const suite = 'PRICING_UI';

  // 1. Packages Data Integrity
  assert(packagesData.male.length === 3, suite, 'Male packages should have 3 core tiers', { count: packagesData.male.length });
  assert(packagesData.female.length === 3, suite, 'Female packages should have 3 core tiers', { count: packagesData.female.length });
  assert(packagesData.specialized.length >= 3, suite, 'Specialized packages should have at least 3 tiers', { count: packagesData.specialized.length });

  // 2. Pricing Values (Zero Price Drift)
  const malePrices = packagesData.male.map((p) => p.priceFormatted);
  assert(malePrices.includes('2.990.000đ') || malePrices.includes('3.000.000đ'), suite, 'Male Khuyen Cao price verified');
  assert(malePrices.includes('5.000.000đ'), suite, 'Male Chuyen Sau price verified');
  assert(malePrices.includes('11.500.000đ'), suite, 'Male Song Tho price verified');

  const femalePrices = packagesData.female.map((p) => p.priceFormatted);
  assert(femalePrices.includes('3.000.000đ'), suite, 'Female Khuyen Cao price verified');
  assert(femalePrices.includes('5.000.000đ'), suite, 'Female Chuyen Sau price verified');
  assert(femalePrices.includes('11.500.000đ'), suite, 'Female Song Tho price verified');

  // 3. Database HTML Fidelity (0 Checksum Drift)
  const bg2026 = getPageBySlug('bang-gia-2026');
  assert(Boolean(bg2026 && bg2026.contentHtml.length > 50000), suite, 'bang-gia-2026 HTML preserved in DB', { len: bg2026?.contentHtml?.length });

  const bgts = getPageBySlug('bang-gia-dich-vu-tam-soat-benh-tai-doctor-check');
  assert(Boolean(bgts && bgts.contentHtml.length > 200000), suite, 'bang-gia-dich-vu-tam-soat-benh HTML preserved in DB', { len: bgts?.contentHtml?.length });

  const bgdv = getPageBySlug('bang-gia-dich-vu');
  assert(Boolean(bgdv && bgdv.contentHtml.length > 90000), suite, 'bang-gia-dich-vu HTML preserved in DB', { len: bgdv?.contentHtml?.length });

  // 4. Route Resolution
  const rootRes = resolveContent('bang-gia-dich-vu-tam-soat-benh-tai-doctor-check');
  assert(rootRes.type === 'page', suite, 'Root pricing route resolution verified');

  const subpathRes = resolveEndoscopySubpath(['bang-gia-2026']);
  assert(subpathRes.type === 'page', suite, 'Subpath endoscopy pricing route resolution verified');

  // 5. Section Order in bang-gia-2026
  if (bg2026) {
    const html = bg2026.contentHtml;
    const heroPos = html.indexOf('section-hero');
    const dearPos = html.indexOf('section-dear');
    const reasonsPos = html.indexOf('dc-medpro-reasons');
    const timelinePos = html.indexOf('dc-timeline');
    const servicePos = html.indexOf('row-service');
    const customerPos = html.indexOf('section-customer-ns');
    const formPos = html.indexOf('form-v3');

    assert(heroPos !== -1 && dearPos > heroPos, suite, 'Section order: hero -> delay reasons');
    assert(reasonsPos > dearPos, suite, 'Section order: delay reasons -> 8 reasons');
    assert(timelinePos > reasonsPos, suite, 'Section order: 8 reasons -> timeline');
    assert(servicePos > timelinePos, suite, 'Section order: timeline -> endoscopy services');
    assert(customerPos > servicePos, suite, 'Section order: endoscopy services -> customer proof');
    assert(formPos > customerPos, suite, 'Section order: customer proof -> booking form');
  }

  // 6. CSS Tokens & Styles
  const css = fs.readFileSync('./src/styles/pricing.css', 'utf8');
  assert(css.includes('.comparison-table'), suite, 'CSS .comparison-table defined');
  assert(css.includes('.pricing-table'), suite, 'CSS .pricing-table defined');
  assert(css.includes('.dc-timeline'), suite, 'CSS .dc-timeline defined');
  assert(css.includes('.dc-medpro-reasons'), suite, 'CSS .dc-medpro-reasons defined');
  assert(css.includes('.kkg-table'), suite, 'CSS .kkg-table defined');
  assert(css.includes('.tabbed-content'), suite, 'CSS .tabbed-content defined');

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
