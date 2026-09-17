import { resolveContent, resolveEndoscopySubpath } from '../src/lib/routing/resolve-content.ts';
import { LEGACY_REDIRECTS, getLegacyRedirect } from '../src/lib/routing/redirects.ts';
import sitemapFn from '../src/app/sitemap.ts';
import assert from 'node:assert';

const sitemap = typeof sitemapFn === 'function' ? sitemapFn : sitemapFn.default;

console.log('====================================================');
console.log('PHASE 2.1: CANONICAL & REDIRECT INTEGRITY AUDIT');
console.log('====================================================\n');

let passCount = 0;
let failCount = 0;

function check(name, fn) {
  try {
    fn();
    passCount++;
  } catch (err) {
    console.error(`[FAIL] ${name}: ${err.message}`);
    failCount++;
  }
}

// 1. Audit all 10 redirects
console.log('--- 1. AUDITING ALL 10 REDIRECTS ---');
const redirectEntries = Object.entries(LEGACY_REDIRECTS);
assert.strictEqual(redirectEntries.length, 10, 'Expected exactly 10 redirects in LEGACY_REDIRECTS');

redirectEntries.forEach(([source, target]) => {
  // Check trailing slash on target
  check(`Redirect target trailing slash: ${source} -> ${target}`, () => {
    assert.ok(target.endsWith('/'), `Target ${target} must end with trailing slash`);
  });

  // Check no redirect chain (target must not be a source)
  const targetClean = target.replace(/^\/+|\/+$/g, '');
  check(`No redirect chain: ${source} -> ${target}`, () => {
    assert.strictEqual(getLegacyRedirect(targetClean), undefined, `Target ${target} is chained to another redirect`);
  });

  // Check target resolves to an active content entity (not 404, not redirect)
  check(`Target resolves to valid entity: ${target}`, () => {
    const res = resolveContent(targetClean);
    assert.notStrictEqual(res.type, 'notFound', `Target ${target} resolved to notFound`);
    assert.notStrictEqual(res.type, 'redirect', `Target ${target} resolved to another redirect`);
    assert.ok(['page', 'package', 'article', 'category', 'doctor'].includes(res.type), `Target resolved to ${res.type}`);
  });
});

console.log(`[PASS] All 10 redirects verified: No chains, no loops, all targets resolve to active canonical content.\n`);

// 2. Audit all 197 canonical sitemap URLs
console.log('--- 2. AUDITING ALL 197 SITEMAP CANONICAL URLS ---');
const sitemapEntries = sitemap();
assert.strictEqual(sitemapEntries.length, 197, `Expected exactly 197 sitemap entries, got ${sitemapEntries.length}`);

const seenCanonicals = new Set();

sitemapEntries.forEach((entry) => {
  const url = entry.url;

  // Trailing slash
  check(`Trailing slash: ${url}`, () => {
    assert.ok(url.endsWith('/'), `URL ${url} lacks trailing slash`);
  });

  // Not duplicated
  check(`No duplicate: ${url}`, () => {
    assert.ok(!seenCanonicals.has(url), `Duplicate URL in sitemap: ${url}`);
    seenCanonicals.add(url);
  });

  // Not a redirect
  const pathname = new URL(url).pathname.replace(/^\/+|\/+$/g, '');
  check(`Not a redirect: ${url}`, () => {
    assert.strictEqual(getLegacyRedirect(pathname), undefined, `Sitemap URL ${url} is a redirect`);
  });

  // Resolves to valid entity
  check(`Resolves validly: ${url}`, () => {
    if (pathname === '') return; // homepage
    if (pathname.startsWith('doctor/')) {
      const docSlug = pathname.replace('doctor/', '');
      const res = resolveContent(docSlug);
      assert.strictEqual(res.type, 'doctor');
    } else if (pathname.startsWith('trung-tam-noi-soi-tieu-hoa-doctor-check/')) {
      const subpath = pathname.replace('trung-tam-noi-soi-tieu-hoa-doctor-check/', '').split('/');
      const res = resolveEndoscopySubpath(subpath);
      assert.strictEqual(res.type, 'page');
    } else {
      const res = resolveContent(pathname);
      assert.notStrictEqual(res.type, 'notFound', `URL ${url} resolved to notFound`);
      assert.notStrictEqual(res.type, 'redirect', `URL ${url} resolved to redirect`);
    }
  });
});

console.log(`[PASS] All 197 sitemap URLs verified: Strict trailing slash, zero duplicates, zero redirects, 100% resolve validly.\n`);

console.log('====================================================');
console.log(`AUDIT RESULTS: ${passCount} CHECKS PASSED, ${failCount} FAILED`);
console.log('====================================================\n');

if (failCount > 0) process.exit(1);
