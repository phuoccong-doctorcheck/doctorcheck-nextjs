import fs from 'fs';

console.log('=== REGRESSION & PARITY TEST ===\n');

// 1. Check sitemap
const { default: sitemapFn } = await import('../src/app/sitemap.js');
const sitemap = sitemapFn();
console.log('Sitemap URL count:', sitemap.length);

// 2. Check redirects
const { LEGACY_REDIRECTS } = await import('../src/lib/routing/redirects.js');
const redirectCount = Object.keys(LEGACY_REDIRECTS).length;
console.log('Redirects count in redirects.ts:', redirectCount);

// 3. Check next.config.ts redirects
const nextConfig = (await import('../next.config.ts')).default;
const configRedirects = await nextConfig.redirects();
console.log('Redirects count in next.config.ts:', configRedirects.length);

// 4. Check articles count
const { articlesCatalog } = await import('../src/lib/data/articles.js');
console.log('Articles count:', articlesCatalog.length);

// 5. Check packages count
const { allPackagesList } = await import('../src/lib/data/packages.js');
console.log('Packages count:', allPackagesList.length);

// 6. Check doctors count
const { doctorsData } = await import('../src/lib/data/doctors.js');
console.log('Doctors count:', doctorsData.length);

// 7. Check categories count
const { categoriesData } = await import('../src/lib/data/categories.js');
console.log('Categories count:', categoriesData.length);

console.log('\n--- VERIFICATION STATUS ---');
console.log('Sitemap: ' + (sitemap.length === 197 ? 'PASS (197)' : 'FAIL'));
console.log('Redirects: ' + (redirectCount === 10 && configRedirects.length === 10 ? 'PASS (10)' : 'FAIL'));
console.log('Articles: ' + (articlesCatalog.length === 108 ? 'PASS (108)' : 'FAIL'));
console.log('Doctors: ' + (doctorsData.length === 7 ? 'PASS (7)' : 'FAIL'));
console.log('Categories: ' + (categoriesData.length === 30 ? 'PASS (30)' : 'FAIL'));
