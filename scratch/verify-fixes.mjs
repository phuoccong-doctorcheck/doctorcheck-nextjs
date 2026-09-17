import fs from 'fs';
import path from 'path';

console.log('=====================================================');
console.log('=== PHASE 4 SEO FIX VERIFICATION SCRIPT ===');
console.log('=====================================================\n');

let passCount = 0;
let failCount = 0;

function assert(condition, message) {
  if (condition) {
    console.log(` [PASS] ${message}`);
    passCount++;
  } else {
    console.error(` [FAIL] ${message}`);
    failCount++;
  }
}

// 1. VERIFY HOMEPAGE (index.html)
console.log('\n--- 1. VERIFYING HOMEPAGE (SEO-ISS-01 & SEO-ISS-02) ---');
const homeHtml = fs.readFileSync('.next/server/app/index.html', 'utf8');

const homeCanonical = homeHtml.match(/<link rel="canonical" href="(.*?)"\/>/)?.[1];
console.log('Homepage Canonical tag:', homeCanonical);
assert(homeCanonical === 'https://doctorcheck.vn/', 'SEO-ISS-01: Homepage has exact canonical https://doctorcheck.vn/');

const homeJsonLdMatches = [...homeHtml.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)];
console.log(`Homepage JSON-LD count in raw HTML: ${homeJsonLdMatches.length}`);
assert(homeJsonLdMatches.length >= 1, 'SEO-ISS-02: Global JSON-LD is rendered in static initial HTML');

if (homeJsonLdMatches.length >= 1) {
  const parsedGraph = JSON.parse(homeJsonLdMatches[0][1]);
  const graph = parsedGraph['@graph'] || [];
  console.log(`  Graph node types:`, graph.map(g => g['@type']));
  assert(graph.some(g => Array.isArray(g['@type']) ? g['@type'].includes('MedicalClinic') : g['@type'] === 'MedicalClinic'), 'Global JSON-LD contains MedicalClinic');
  assert(graph.filter(g => g['@type'] === 'Physician').length === 7, 'Global JSON-LD contains exactly 7 Physician entries');
  assert(graph.some(g => g['@type'] === 'OfferCatalog'), 'Global JSON-LD contains OfferCatalog');
}

// 2. VERIFY STATIC PAGES & HUB SUBPATHS (SEO-ISS-03)
console.log('\n--- 2. VERIFYING STATIC PAGES & HUB SUBPATHS (SEO-ISS-03) ---');
const doctorsPageHtml = fs.readFileSync('.next/server/app/doi-ngu-bac-si-doctorcheck.html', 'utf8');
const doctorsTitle = doctorsPageHtml.match(/<title>(.*?)<\/title>/)?.[1];
console.log('/doi-ngu-bac-si-doctorcheck/ Title:', doctorsTitle);
assert(doctorsTitle === 'Đội Ngũ Bác Sĩ | Doctor Check Tầm Soát Bệnh', 'Static page /doi-ngu-bac-si-doctorcheck/ has human-readable title');

const aboutPageHtml = fs.readFileSync('.next/server/app/ve-doctor-check.html', 'utf8');
const aboutTitle = aboutPageHtml.match(/<title>(.*?)<\/title>/)?.[1];
console.log('/ve-doctor-check/ Title:', aboutTitle);
assert(aboutTitle === 'Về Doctor Check | Doctor Check Tầm Soát Bệnh', 'Static page /ve-doctor-check/ has human-readable title');

const pricingPageHtml = fs.readFileSync('.next/server/app/bang-gia-dich-vu-tam-soat-benh-tai-doctor-check.html', 'utf8');
const pricingTitle = pricingPageHtml.match(/<title>(.*?)<\/title>/)?.[1];
console.log('Pricing Page Title:', pricingTitle);
assert(pricingTitle && !pricingTitle.includes('bang-gia-dich-vu-tam-soat-benh-tai-doctor-check'), 'Pricing page title is human-readable');

// Check Hub subpath
const hubPagePath = '.next/server/app/trung-tam-noi-soi-tieu-hoa-doctor-check/10-tieu-chuan-vang.html';
if (fs.existsSync(hubPagePath)) {
  const hubHtml = fs.readFileSync(hubPagePath, 'utf8');
  const hubTitle = hubHtml.match(/<title>(.*?)<\/title>/)?.[1];
  console.log('Hub /10-tieu-chuan-vang/ Title:', hubTitle);
  assert(hubTitle === '10 tiêu chuẩn vàng | Trung Tâm Nội Soi Tiêu Hóa Doctor Check', 'Hub page has human-readable title');
}

// Check Nested Hub subpath
const nestedHubPath = '.next/server/app/trung-tam-noi-soi-tieu-hoa-doctor-check/tam-soat-ung-thu-da-day-tai-doctor-check/kien-thuc-ung-thu-da-day.html';
if (fs.existsSync(nestedHubPath)) {
  const nestedHubHtml = fs.readFileSync(nestedHubPath, 'utf8');
  const nestedHubTitle = nestedHubHtml.match(/<title>(.*?)<\/title>/)?.[1];
  console.log('Nested Hub Title:', nestedHubTitle);
  assert(nestedHubTitle === 'Kiến thức ung thư dạ dày | Trung Tâm Nội Soi Tiêu Hóa Doctor Check', 'Nested hub page has human-readable title');
}

// 3. VERIFY BREADCRUMBLIST STRUCTURED DATA (SEO-ISS-04)
console.log('\n--- 3. VERIFYING BREADCRUMBLIST STRUCTURED DATA (SEO-ISS-04) ---');

// Article Breadcrumbs
const articleFile = '10-diem-khong-co-nhung-anh-trung-trai-nghiem-tam-soat-benh-chi-90-phut.html';
const articleHtml = fs.readFileSync(path.join('.next/server/app', articleFile), 'utf8');
const articleJsonLds = [...articleHtml.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)].map(m => JSON.parse(m[1]));
const articleBreadcrumb = articleJsonLds.find(j => j['@type'] === 'BreadcrumbList');
console.log('Article JSON-LD types:', articleJsonLds.map(j => j['@type']));
assert(articleJsonLds.some(j => j['@type'] === 'MedicalWebPage'), 'Article has MedicalWebPage JSON-LD');
assert(!!articleBreadcrumb, 'Article has BreadcrumbList JSON-LD');
if (articleBreadcrumb) {
  console.log('Article Breadcrumb items:', articleBreadcrumb.itemListElement);
  assert(articleBreadcrumb.itemListElement.length >= 2, 'Article breadcrumb has >= 2 levels');
  assert(articleBreadcrumb.itemListElement[0].position === 1 && articleBreadcrumb.itemListElement[0].item === 'https://doctorcheck.vn/', 'Level 1 is Homepage');
}

// Package Breadcrumbs
const pkgFile = 'goi-khuyen-cao-danh-cho-nu.html';
const pkgHtml = fs.readFileSync(path.join('.next/server/app', pkgFile), 'utf8');
const pkgJsonLds = [...pkgHtml.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)].map(m => JSON.parse(m[1]));
const pkgBreadcrumb = pkgJsonLds.find(j => j['@type'] === 'BreadcrumbList');
console.log('Package JSON-LD types:', pkgJsonLds.map(j => j['@type']));
assert(pkgJsonLds.some(j => j['@type'] === 'Product'), 'Package has Product JSON-LD');
assert(!!pkgBreadcrumb, 'Package has BreadcrumbList JSON-LD');
if (pkgBreadcrumb) {
  console.log('Package Breadcrumb items:', pkgBreadcrumb.itemListElement);
  assert(pkgBreadcrumb.itemListElement.length === 3, 'Package breadcrumb has 3 levels (Home -> Bang Gia -> Package)');
}

// Category Breadcrumbs
const catFile = '12-loai-ung-thu-thuong-gap.html';
const catHtml = fs.readFileSync(path.join('.next/server/app', catFile), 'utf8');
const catJsonLds = [...catHtml.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)].map(m => JSON.parse(m[1]));
const catBreadcrumb = catJsonLds.find(j => j['@type'] === 'BreadcrumbList');
console.log('Category JSON-LD types:', catJsonLds.map(j => j['@type']));
assert(!!catBreadcrumb, 'Category has BreadcrumbList JSON-LD');
if (catBreadcrumb) {
  console.log('Category Breadcrumb items:', catBreadcrumb.itemListElement);
  assert(catBreadcrumb.itemListElement.length === 2, 'Category breadcrumb has 2 levels (Home -> Category)');
}

// Hub Subpath Breadcrumbs
if (fs.existsSync(nestedHubPath)) {
  const nestedHubHtml = fs.readFileSync(nestedHubPath, 'utf8');
  const hubJsonLds = [...nestedHubHtml.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)].map(m => JSON.parse(m[1]));
  const hubBreadcrumb = hubJsonLds.find(j => j['@type'] === 'BreadcrumbList');
  console.log('Hub Subpath JSON-LD types:', hubJsonLds.map(j => j['@type']));
  assert(!!hubBreadcrumb, 'Hub subpath has BreadcrumbList JSON-LD');
  if (hubBreadcrumb) {
    console.log('Hub Subpath Breadcrumb items:', hubBreadcrumb.itemListElement);
    assert(hubBreadcrumb.itemListElement.length >= 3, 'Nested Hub breadcrumb has >= 3 hierarchical levels');
  }
}

// 4. VERIFY DOCTOR PROFILE
console.log('\n--- 4. VERIFYING DOCTOR PROFILE ---');
const docHtml = fs.readFileSync('.next/server/app/doctor/trinh-ai-nhi.html', 'utf8');
const docCanonical = docHtml.match(/<link rel="canonical" href="(.*?)"\/>/)?.[1];
assert(docCanonical === 'https://doctorcheck.vn/doctor/trinh-ai-nhi/', 'Doctor canonical is preserved at /doctor/trinh-ai-nhi/');
const docJsonLds = [...docHtml.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)].map(m => JSON.parse(m[1]));
assert(docJsonLds.some(j => j['@type'] === 'Physician'), 'Doctor profile has Physician JSON-LD');

// 5. REGRESSION & PARITY CHECKS
console.log('\n--- 5. REGRESSION & PARITY CHECKS ---');
console.log(`Total Checks Passed: ${passCount}`);
console.log(`Total Checks Failed: ${failCount}`);

if (failCount === 0) {
  console.log('\n>>> ALL SEO FIX VERIFICATIONS PASSED SUCCESSFULLY! <<<');
} else {
  console.error(`\n>>> ${failCount} VERIFICATION CHECKS FAILED! <<<`);
}
