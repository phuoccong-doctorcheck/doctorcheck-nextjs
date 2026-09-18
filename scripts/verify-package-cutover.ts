import * as dotenv from 'dotenv';

// Stub server-only for standalone CLI script execution outside Next.js webpack/turbopack bundler
require.cache[require.resolve('server-only')] = {
  id: require.resolve('server-only'),
  filename: require.resolve('server-only'),
  loaded: true,
  exports: {},
} as unknown as NodeModule;

dotenv.config({ path: '.env.local' });

import type { PackageTier } from '../src/types/doctorcheck';

async function verifyPackageParity() {
  const { StaticPackageRepository } = await import('../src/repositories/static/static-package.repository');
  const { PostgresPackageRepository } = await import('../src/repositories/postgres/postgres-package.repository');
  const { generatePackageJsonLd, generatePackageBreadcrumbJsonLd } = await import('../src/lib/seo/structured-data');
  const { resolveContent } = await import('../src/lib/routing/resolve-content');

  console.log('========================================================================');
  console.log('📦 DB-7: PRE-CUTOVER & POST-CUTOVER PACKAGES DOMAIN FIDELITY AUDIT');
  console.log('========================================================================\n');

  const staticRepo = new StaticPackageRepository();
  const postgresRepo = new PostgresPackageRepository();

  const staticPkgs = await staticRepo.getAll();
  const postgresPkgs = await postgresRepo.getAll();

  console.log(`Static Packages Count:     ${staticPkgs.length}`);
  console.log(`PostgreSQL Packages Count: ${postgresPkgs.length}`);

  if (staticPkgs.length !== 9 || postgresPkgs.length !== 9) {
    console.error(`❌ Unexpected package count: static=${staticPkgs.length}, postgres=${postgresPkgs.length}`);
    process.exit(1);
  }

  const fieldsToCheck: (keyof PackageTier)[] = [
    'id',
    'slug',
    'name',
    'gender',
    'price',
    'priceFormatted',
    'tagline',
    'diseasesCovered',
    'cancersCovered',
    'duration',
    'popular',
    'recommendedFor',
    'image',
    'url',
    'dataClassification',
  ];

  console.log('\n--- 1. FIELD-BY-FIELD & PRICING PARITY CHECK FOR ALL 9 PACKAGES ---');
  let allFieldsMatch = true;

  const priceTable: { name: string; staticPrice: string; pgPrice: string; match: boolean }[] = [];
  const itemsTable: { name: string; staticCount: number; pgCount: number; match: boolean }[] = [];

  for (const staticPkg of staticPkgs) {
    const pgPkg = postgresPkgs.find((p) => p.slug === staticPkg.slug || p.id === staticPkg.id);
    if (!pgPkg) {
      console.error(`❌ Package ${staticPkg.slug} not found in PostgreSQL!`);
      allFieldsMatch = false;
      continue;
    }

    console.log(`\nPackage: [${staticPkg.slug}] ${staticPkg.name}`);
    console.log(`  Price: ${staticPkg.priceFormatted} (${staticPkg.price} VND)`);
    console.log(`  Gender: ${staticPkg.gender} | Duration: ${staticPkg.duration}`);
    console.log(`  Diseases: ${staticPkg.diseasesCovered} | Cancers: ${staticPkg.cancersCovered}`);
    console.log(`  Features: ${staticPkg.features.length} items`);

    // Price parity
    const priceMatch = staticPkg.price === pgPkg.price && staticPkg.priceFormatted === pgPkg.priceFormatted;
    priceTable.push({
      name: staticPkg.name,
      staticPrice: `${staticPkg.priceFormatted} (${staticPkg.price})`,
      pgPrice: `${pgPkg.priceFormatted} (${pgPkg.price})`,
      match: priceMatch,
    });
    if (!priceMatch) {
      console.error(`  ❌ Price mismatch: Static=${staticPkg.priceFormatted}, PG=${pgPkg.priceFormatted}`);
      allFieldsMatch = false;
    }

    // Item / Features parity
    const featuresMatch =
      staticPkg.features.length === pgPkg.features.length &&
      staticPkg.features.every((feat, idx) => feat === pgPkg.features[idx]);

    itemsTable.push({
      name: staticPkg.name,
      staticCount: staticPkg.features.length,
      pgCount: pgPkg.features.length,
      match: featuresMatch,
    });
    if (!featuresMatch) {
      console.error(`  ❌ Features mismatch: Static count=${staticPkg.features.length}, PG count=${pgPkg.features.length}`);
      allFieldsMatch = false;
    }

    // Scalar fields parity
    for (const field of fieldsToCheck) {
      const staticVal = staticPkg[field];
      const pgVal = pgPkg[field];
      if (staticVal !== pgVal) {
        console.error(`  ❌ Mismatch on field "${field}":`);
        console.error(`     Static:     ${JSON.stringify(staticVal)}`);
        console.error(`     PostgreSQL: ${JSON.stringify(pgVal)}`);
        allFieldsMatch = false;
      }
    }

    // Test getBySlug
    const bySlugStatic = await staticRepo.getBySlug(staticPkg.slug);
    const bySlugPg = await postgresRepo.getBySlug(staticPkg.slug);
    if (!bySlugStatic || !bySlugPg || bySlugStatic.name !== bySlugPg.name) {
      console.error(`  ❌ getBySlug(${staticPkg.slug}) mismatch`);
      allFieldsMatch = false;
    }

    // Test Schema.org Product JSON-LD Parity
    const jsonLdStatic = JSON.stringify(generatePackageJsonLd(staticPkg));
    const jsonLdPg = JSON.stringify(generatePackageJsonLd(pgPkg));
    if (jsonLdStatic !== jsonLdPg) {
      console.error(`  ❌ Product JSON-LD mismatch for ${staticPkg.slug}`);
      allFieldsMatch = false;
    } else {
      console.log(`  ✓ Product JSON-LD: 100% Match`);
    }

    // Test BreadcrumbList JSON-LD Parity
    const breadcrumbStatic = JSON.stringify(generatePackageBreadcrumbJsonLd(staticPkg));
    const breadcrumbPg = JSON.stringify(generatePackageBreadcrumbJsonLd(pgPkg));
    if (breadcrumbStatic !== breadcrumbPg) {
      console.error(`  ❌ Breadcrumb JSON-LD mismatch for ${staticPkg.slug}`);
      allFieldsMatch = false;
    } else {
      console.log(`  ✓ Breadcrumb JSON-LD: 100% Match`);
    }

    // Test Root Slug Resolution for Package
    const rootResolved = resolveContent(staticPkg.slug);
    if (staticPkg.slug === 'goi-ung-thu-da-day') {
      if (
        rootResolved.type === 'redirect' &&
        rootResolved.redirectTarget === '/tam-soat-ung-thu-da-day/'
      ) {
        console.log(`  ✓ Root 301 Redirect /goi-ung-thu-da-day/ -> /tam-soat-ung-thu-da-day/ : Verified`);
      } else {
        console.error(`  ❌ Root slug resolution mismatch for ${staticPkg.slug}: type=${rootResolved.type}`);
        allFieldsMatch = false;
      }
    } else {
      if (
        rootResolved.type !== 'package' ||
        rootResolved.canonicalUrl !== `https://doctorcheck.vn/${staticPkg.slug}/`
      ) {
        console.error(`  ❌ Root slug resolution mismatch for ${staticPkg.slug}: type=${rootResolved.type}`);
        allFieldsMatch = false;
      } else {
        console.log(`  ✓ Root Slug Resolution /${staticPkg.slug}/ : Verified`);
      }
    }
  }

  // Price Table Summary
  console.log('\n--- 2. PRICE FIDELITY SUMMARY TABLE ---');
  console.log('┌──────────────────────────────────────────────────────────────┬────────────────────────┬────────────────────────┬────────┐');
  console.log('│ PACKAGE NAME                                                 │ STATIC PRICE           │ POSTGRESQL PRICE       │ STATUS │');
  console.log('├──────────────────────────────────────────────────────────────┼────────────────────────┼────────────────────────┼────────┤');
  priceTable.forEach((p) => {
    const name = p.name.slice(0, 60).padEnd(60);
    const st = p.staticPrice.slice(0, 22).padEnd(22);
    const pg = p.pgPrice.slice(0, 22).padEnd(22);
    const stat = (p.match ? 'PASS' : 'FAIL').padEnd(6);
    console.log(`│ ${name} │ ${st} │ ${pg} │ ${stat} │`);
  });
  console.log('└──────────────────────────────────────────────────────────────┴────────────────────────┴────────────────────────┴────────┘');

  // Items Table Summary
  console.log('\n--- 3. PACKAGE ITEMS FIDELITY SUMMARY TABLE ---');
  console.log('┌──────────────────────────────────────────────────────────────┬──────────────┬──────────────────┬────────┐');
  console.log('│ PACKAGE NAME                                                 │ STATIC ITEMS │ POSTGRESQL ITEMS │ STATUS │');
  console.log('├──────────────────────────────────────────────────────────────┼──────────────┼──────────────────┼────────┤');
  itemsTable.forEach((i) => {
    const name = i.name.slice(0, 60).padEnd(60);
    const st = String(i.staticCount).padStart(12);
    const pg = String(i.pgCount).padStart(16);
    const stat = (i.match ? 'PASS' : 'FAIL').padEnd(6);
    console.log(`│ ${name} │ ${st} │ ${pg} │ ${stat} │`);
  });
  console.log('└──────────────────────────────────────────────────────────────┴──────────────┴──────────────────┴────────┘');

  // Check getByGender parity
  console.log('\n--- 4. GENDER FILTERING PARITY ---');
  for (const gender of ['female', 'male', 'both'] as const) {
    const gStatic = await staticRepo.getByGender(gender);
    const gPg = await postgresRepo.getByGender(gender);
    console.log(`Gender "${gender}": Static=${gStatic.length}, PG=${gPg.length} -> ${gStatic.length === gPg.length ? 'PASS' : 'FAIL'}`);
    if (gStatic.length !== gPg.length) allFieldsMatch = false;
  }

  // Check getPopular parity
  console.log('\n--- 5. POPULAR PACKAGES PARITY ---');
  const popStatic = await staticRepo.getPopular();
  const popPg = await postgresRepo.getPopular();
  console.log(`Popular Packages: Static=${popStatic.length}, PG=${popPg.length} -> ${popStatic.length === popPg.length ? 'PASS' : 'FAIL'}`);
  if (popStatic.length !== popPg.length) allFieldsMatch = false;

  // Check getAllSlugs parity
  console.log('\n--- 6. SLUGS LIST PARITY ---');
  const slugsStatic = await staticRepo.getAllSlugs();
  const slugsPg = await postgresRepo.getAllSlugs();
  const slugsMatch = JSON.stringify(slugsStatic.sort()) === JSON.stringify(slugsPg.sort());
  console.log(`Slugs Match: ${slugsMatch ? 'YES (100%)' : 'NO'}`);
  if (!slugsMatch) allFieldsMatch = false;

  console.log('\n========================================================================');
  if (allFieldsMatch) {
    console.log('🎉 PRE-CUTOVER PARITY AUDIT PASSED: 100% IDENTICAL ACROSS ALL 9 PACKAGES');
    console.log('========================================================================\n');
    process.exit(0);
  } else {
    console.error('❌ PRE-CUTOVER PARITY AUDIT FAILED! DO NOT PROCEED WITH CUTOVER.');
    console.log('========================================================================\n');
    process.exit(1);
  }
}

verifyPackageParity().catch((err) => {
  console.error('❌ Audit execution error:', err);
  process.exit(1);
});
