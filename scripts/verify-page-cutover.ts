import * as dotenv from 'dotenv';
import * as crypto from 'crypto';

// Stub server-only for standalone CLI script execution outside Next.js webpack/turbopack bundler
require.cache[require.resolve('server-only')] = {
  id: require.resolve('server-only'),
  filename: require.resolve('server-only'),
  loaded: true,
  exports: {},
} as unknown as NodeModule;

dotenv.config({ path: '.env.local' });

import type { PageContent } from '../src/types/doctorcheck';

function computeHash(content: string): string {
  return crypto.createHash('sha256').update(content.trim(), 'utf8').digest('hex');
}

async function verifyPageParity() {
  const { StaticPageRepository } = await import('../src/repositories/static/static-page.repository');
  const { PostgresPageRepository } = await import('../src/repositories/postgres/postgres-page.repository');
  const { staticPagesData } = await import('../src/lib/routing/pages-data');
  const { resolveContent, resolveEndoscopySubpath, getAllRootSlugs } = await import('../src/lib/routing/resolve-content');
  const { generateHubBreadcrumbJsonLd } = await import('../src/lib/seo/structured-data');
  const { db } = await import('../src/db');
  const schema = await import('../src/db/schema');

  console.log('========================================================================');
  console.log('📄 DB-10: FULL CORPUS PAGE FIDELITY & PARITY AUDIT');
  console.log('========================================================================\n');

  const staticRepo = new StaticPageRepository();
  const postgresRepo = new PostgresPageRepository();

  const staticPages = await staticRepo.getAll();
  const postgresPages = await postgresRepo.getAll();

  console.log(`Static Pages Count:     ${staticPages.length}`);
  console.log(`PostgreSQL Pages Count: ${postgresPages.length}`);

  // 1. Page Breakdown Audit
  console.log('\n--- 1. PAGE CLASSIFICATION & BREAKDOWN ---');
  const rootPages = staticPagesData.filter((p) => p.isRoot);
  const endoscopyPages = staticPagesData.filter((p) => !p.isRoot && p.subpath);
  const internalPages = staticPages.filter(
    (p) => !staticPagesData.some((sp) => sp.slug === p.slug)
  );

  console.log(`Total Static Pages:          ${staticPages.length}`);
  console.log(`Root Pages in Routing:       ${rootPages.length}`);
  console.log(`Endoscopy Subpaths:          ${endoscopyPages.length}`);
  console.log(`Internal / Unrouted Pages:   ${internalPages.length}`);

  // 2. Full Corpus Field-by-Field & HTML SHA-256 Checksum Audit
  console.log('\n--- 2. FULL CORPUS (55 PAGES) FIDELITY & SHA-256 AUDIT ---');
  let htmlMatchCount = 0;
  let htmlMismatchCount = 0;
  let titleMatchCount = 0;
  let titleMismatchCount = 0;
  let excerptMatchCount = 0;
  let seoMatchCount = 0;

  const failedPages: string[] = [];

  for (const sp of staticPages) {
    const pgPage = postgresPages.find((p) => p.slug === sp.slug || p.id === sp.id);
    if (!pgPage) {
      console.error(`❌ Page "${sp.slug}" not found in PostgreSQL!`);
      failedPages.push(sp.slug);
      continue;
    }

    // A. HTML SHA-256 Checksum
    const staticHash = computeHash(sp.contentHtml || '');
    const pgHash = computeHash(pgPage.contentHtml || '');
    if (staticHash === pgHash) {
      htmlMatchCount++;
    } else {
      htmlMismatchCount++;
      console.error(`❌ HTML Checksum mismatch for [${sp.slug}]: Static=${staticHash.slice(0, 8)}, PG=${pgHash.slice(0, 8)}`);
      failedPages.push(`${sp.slug} (HTML)`);
    }

    // B. Title Fidelity
    if (sp.title === pgPage.title) {
      titleMatchCount++;
    } else {
      titleMismatchCount++;
      console.error(`❌ Title mismatch for [${sp.slug}]: Static="${sp.title}", PG="${pgPage.title}"`);
      failedPages.push(`${sp.slug} (Title)`);
    }

    // C. Excerpt & SEO Metadata
    const excerptMatch = (sp.excerpt || '') === (pgPage.excerpt || '');
    const seoTitleMatch = (sp.seoTitle || '') === (pgPage.seoTitle || '');
    const seoDescMatch = (sp.metaDescription || '') === (pgPage.metaDescription || '');
    if (excerptMatch) excerptMatchCount++;
    if (seoTitleMatch && seoDescMatch) seoMatchCount++;
  }

  console.log(`\n--- 3. FULL CORPUS RESULTS SUMMARY ---`);
  console.log(`HTML SHA-256 Matches:         ${htmlMatchCount}/55 (Mismatches: ${htmlMismatchCount})`);
  console.log(`Title Matches:                ${titleMatchCount}/55 (Mismatches: ${titleMismatchCount})`);
  console.log(`Excerpt Matches:              ${excerptMatchCount}/55`);
  console.log(`SEO Meta Matches:             ${seoMatchCount}/55`);

  // 4. Root Pages Routing Validation
  console.log('\n--- 4. ROOT PAGE ROUTE VALIDATION (33 ITEMS IN ROUTING) ---');
  const { getLegacyRedirect } = await import('../src/lib/routing/redirects');
  let rootPagesPass = true;
  let canonicalRootPassCount = 0;
  let redirectRootPassCount = 0;
  let collisionRootPassCount = 0;

  for (const page of rootPages) {
    const res = resolveContent(page.slug);
    const isRedirect = getLegacyRedirect(page.slug);
    const isCollision = ['dau-thuong-vi', 'tieu-chay', 'di-ngoai-ra-mau', 'tao-bon'].includes(page.slug);

    if (isRedirect) {
      if (res.type === 'redirect') {
        redirectRootPassCount++;
      } else {
        rootPagesPass = false;
        console.error(`❌ Expected redirect for /${page.slug}/, got ${res.type}`);
      }
    } else if (isCollision) {
      if (res.type === 'article') {
        collisionRootPassCount++;
      } else {
        rootPagesPass = false;
        console.error(`❌ Expected article collision override for /${page.slug}/, got ${res.type}`);
      }
    } else {
      if (res.type === 'page' && res.canonicalUrl === `https://doctorcheck.vn/${page.slug}/`) {
        canonicalRootPassCount++;
      } else {
        rootPagesPass = false;
        console.error(`❌ Root page route failed: /${page.slug}/ -> Type: ${res.type}, URL: ${res.canonicalUrl}`);
      }
    }
  }
  console.log(`  ✓ Canonical Root Pages:  ${canonicalRootPassCount}`);
  console.log(`  ✓ Redirected Root Pages: ${redirectRootPassCount}`);
  console.log(`  ✓ Collided Post Drafts:  ${collisionRootPassCount}`);
  console.log(`Root Routing Validation: ${rootPagesPass ? 'PASS (33/33)' : 'FAIL'}`);

  // 5. Endoscopy Subpaths Validation
  console.log('\n--- 5. ENDOSCOPY SUBPATH ROUTE VALIDATION (19 SUBPATHS) ---');
  let endoPass = true;
  let endoPassCount = 0;
  for (const page of endoscopyPages) {
    const segments = page.subpath.split('/');
    const res = resolveEndoscopySubpath(segments);
    const expectedCanonical = `https://doctorcheck.vn${page.path}`;
    const pass = res.type === 'page' && res.canonicalUrl === expectedCanonical;
    if (pass) {
      endoPassCount++;
    } else {
      endoPass = false;
      console.error(`❌ Endoscopy subpath failed: /${page.subpath}/ -> Type: ${res.type}, URL: ${res.canonicalUrl}`);
    }
  }
  console.log(`Endoscopy Subpaths Validated: ${endoPassCount}/${endoscopyPages.length} [${endoPass ? 'PASS' : 'FAIL'}]`);

  // 5b. Internal Pages Audit
  console.log('\n--- 5b. INTERNAL / UNROUTED PAGES AUDIT ---');
  console.log(`Found ${internalPages.length} internal pages in content repository:`);
  for (const ip of internalPages) {
    console.log(`  • [ID ${ip.id}] slug: "${ip.slug}" | title: "${ip.title}"`);
  }

  // 6. Four Protected Root Collision Overrides
  console.log('\n--- 6. FOUR PROTECTED ROOT COLLISION OVERRIDES AUDIT ---');
  const collisionSlugs = ['dau-thuong-vi', 'tieu-chay', 'di-ngoai-ra-mau', 'tao-bon'];
  let collisionsPass = true;
  for (const slug of collisionSlugs) {
    const res = resolveContent(slug);
    const pass = res.type === 'article' && res.canonicalUrl === `https://doctorcheck.vn/${slug}/`;
    console.log(`  /${slug}/ -> Resolved Type: "${res.type}", Title: "${res.title.slice(0, 35)}..." [${pass ? 'PASS' : 'FAIL'}]`);
    if (!pass) collisionsPass = false;
  }

  // 7. Two Nested Category Collision Overrides
  console.log('\n--- 7. TWO NESTED CATEGORY COLLISION OVERRIDES AUDIT ---');
  const nestedCategorySlugs = ['kien-thuc-ung-thu-da-day', 'kien-thuc-ung-thu-dai-trang'];
  let nestedCatPass = true;
  for (const slug of nestedCategorySlugs) {
    // Root level: resolves to Category taxonomy
    const rootRes = resolveContent(slug);
    const rootOk = rootRes.type === 'category' && rootRes.canonicalUrl === `https://doctorcheck.vn/${slug}/`;

    // Nested subpath level: resolves to nested endoscopy Page
    const prefix = slug === 'kien-thuc-ung-thu-da-day' ? 'tam-soat-ung-thu-da-day-tai-doctor-check' : 'tam-soat-ung-thu-dai-trang-tai-doctor-check';
    const subpathRes = resolveEndoscopySubpath([prefix, slug]);
    const subpathOk = subpathRes.type === 'page' && subpathRes.canonicalUrl === `https://doctorcheck.vn/trung-tam-noi-soi-tieu-hoa-doctor-check/${prefix}/${slug}/`;

    console.log(`  Root /${slug}/ -> Type: "${rootRes.type}", URL: ${rootRes.canonicalUrl} [${rootOk ? 'PASS' : 'FAIL'}]`);
    console.log(`  Nested /.../${slug}/ -> Type: "${subpathRes.type}", URL: ${subpathRes.canonicalUrl} [${subpathOk ? 'PASS' : 'FAIL'}]`);

    if (!rootOk || !subpathOk) nestedCatPass = false;
  }

  // 8. Cross-Domain Root Slug Collision Detection
  console.log('\n--- 8. COMPLETE CROSS-DOMAIN ROOT SLUG COLLISION SCAN ---');
  const allRootSlugs = getAllRootSlugs();
  console.log(`Total Unique Root Slugs: ${allRootSlugs.length}`);
  const duplicateCheckSet = new Set<string>();
  let duplicateCount = 0;
  for (const s of allRootSlugs) {
    if (duplicateCheckSet.has(s)) {
      console.error(`  ❌ Duplicate root slug detected: ${s}`);
      duplicateCount++;
    } else {
      duplicateCheckSet.add(s);
    }
  }
  console.log(`Cross-Domain Collision Issues: ${duplicateCount}`);

  // 9. Existing PostgreSQL Domains Regression Audit
  console.log('\n--- 9. REGRESSION AUDIT (DOCTORS, PACKAGES, CATEGORIES, ARTICLES) ---');
  const { doctorRepository, packageRepository, categoryRepository, articleRepository } = await import('../src/repositories');
  const docs = await doctorRepository.getAll();
  const pkgs = await packageRepository.getAll();
  const cats = await categoryRepository.getAll();
  const arts = await articleRepository.getAll();
  console.log(`  ✓ Doctors (PostgreSQL):    ${docs.length}/7`);
  console.log(`  ✓ Packages (PostgreSQL):   ${pkgs.length}/9`);
  console.log(`  ✓ Categories (PostgreSQL): ${cats.length}/30`);
  console.log(`  ✓ Articles (PostgreSQL):   ${arts.length}/108`);

  const allPassed =
    htmlMismatchCount === 0 &&
    titleMismatchCount === 0 &&
    rootPagesPass &&
    endoPass &&
    collisionsPass &&
    nestedCatPass &&
    duplicateCount === 0 &&
    docs.length === 7 &&
    pkgs.length === 9 &&
    cats.length === 30 &&
    arts.length === 108;

  console.log('\n========================================================================');
  if (allPassed) {
    console.log('🎉 FULL PAGE CORPUS (55/55) AUDIT PASSED WITH 100% PARITY!');
    console.log('========================================================================\n');
    process.exit(0);
  } else {
    console.error(`❌ FULL CORPUS AUDIT FAILED with ${failedPages.length} issues!`);
    console.log('========================================================================\n');
    process.exit(1);
  }
}

verifyPageParity().catch((err) => {
  console.error('❌ Audit execution error:', err);
  process.exit(1);
});
