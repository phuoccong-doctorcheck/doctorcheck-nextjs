import { resolveContent, resolveEndoscopySubpath } from '../src/lib/routing/resolve-content.ts';
import assert from 'node:assert';

console.log('==============================================');
console.log('STARTING AUTOMATED ROUTE RESOLUTION TESTS');
console.log('==============================================\n');

let passCount = 0;
let failCount = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`[PASS] ${name}`);
    passCount++;
  } catch (err) {
    console.error(`[FAIL] ${name}`);
    console.error(`       Error: ${err.message}`);
    failCount++;
  }
}

// 1. Article Slug
test('Article slug resolves to article', () => {
  const res = resolveContent('tu-kiem-dinh-quoc-te-den-thuc-hanh-hang-ngay-trien-khai-aaci-trong-mo-hinh-phong-kham-tai-doctor-check');
  assert.strictEqual(res.type, 'article');
  assert.ok(res.data?.article);
  assert.strictEqual(res.canonicalUrl, 'https://doctorcheck.vn/tu-kiem-dinh-quoc-te-den-thuc-hanh-hang-ngay-trien-khai-aaci-trong-mo-hinh-phong-kham-tai-doctor-check/');
});

// 2. Package Slug
test('Package slug resolves to package', () => {
  const res = resolveContent('goi-khuyen-cao-danh-cho-nu');
  assert.strictEqual(res.type, 'package');
  assert.ok(res.data?.package);
  assert.strictEqual(res.canonicalUrl, 'https://doctorcheck.vn/goi-khuyen-cao-danh-cho-nu/');
});

// 3. Category Slug
test('Category slug resolves to category', () => {
  const res = resolveContent('12-loai-ung-thu-thuong-gap');
  assert.strictEqual(res.type, 'category');
  assert.ok(res.data?.category);
  assert.strictEqual(res.canonicalUrl, 'https://doctorcheck.vn/12-loai-ung-thu-thuong-gap/');
});

// 4. Doctor Slug
test('Doctor slug resolves to doctor', () => {
  const res = resolveContent('trinh-ai-nhi');
  assert.strictEqual(res.type, 'doctor');
  assert.ok(res.data?.doctor);
  assert.strictEqual(res.canonicalUrl, 'https://doctorcheck.vn/doctor/trinh-ai-nhi/');
});

// 5. Static Page Slug
test('Static page slug resolves to page', () => {
  const res = resolveContent('kham-tong-quat');
  assert.strictEqual(res.type, 'page');
  assert.ok(res.data?.page);
  assert.strictEqual(res.canonicalUrl, 'https://doctorcheck.vn/kham-tong-quat/');
});

test('Contact page resolves to page', () => {
  const res = resolveContent('lien-he');
  assert.strictEqual(res.type, 'page');
  assert.ok(res.data?.page);
  assert.strictEqual(res.canonicalUrl, 'https://doctorcheck.vn/lien-he/');
});

// 6. Unknown Slug (404)
test('Unknown slug resolves to notFound (404)', () => {
  const res = resolveContent('non-existent-random-url-xyz');
  assert.strictEqual(res.type, 'notFound');
});

// 7. Legacy 301 Redirects
test('ve-chung-toi 301 redirects to /ve-doctor-check/', () => {
  const res = resolveContent('ve-chung-toi');
  assert.strictEqual(res.type, 'redirect');
  assert.strictEqual(res.redirectTarget, '/ve-doctor-check/');
});

test('bang-gia-dich-vu 301 redirects to /bang-gia-dich-vu-tam-soat-benh-tai-doctor-check/', () => {
  const res = resolveContent('bang-gia-dich-vu');
  assert.strictEqual(res.type, 'redirect');
  assert.strictEqual(res.redirectTarget, '/bang-gia-dich-vu-tam-soat-benh-tai-doctor-check/');
});

test('goi-ung-thu-da-day 301 redirects to /tam-soat-ung-thu-da-day/', () => {
  const res = resolveContent('goi-ung-thu-da-day');
  assert.strictEqual(res.type, 'redirect');
  assert.strictEqual(res.redirectTarget, '/tam-soat-ung-thu-da-day/');
});

// 8. Explicit Collisions (The 4 Post vs Page Collisions)
test('Collision: dau-thuong-vi resolves to ARTICLE (not draft page)', () => {
  const res = resolveContent('dau-thuong-vi');
  assert.strictEqual(res.type, 'article');
  assert.strictEqual(res.data?.article?.id, 3622);
});

test('Collision: tieu-chay resolves to ARTICLE (not draft page)', () => {
  const res = resolveContent('tieu-chay');
  assert.strictEqual(res.type, 'article');
  assert.strictEqual(res.data?.article?.id, 3773);
});

test('Collision: di-ngoai-ra-mau resolves to ARTICLE (not draft page)', () => {
  const res = resolveContent('di-ngoai-ra-mau');
  assert.strictEqual(res.type, 'article');
  assert.strictEqual(res.data?.article?.id, 3750);
});

test('Collision: tao-bon resolves to ARTICLE (not draft page)', () => {
  const res = resolveContent('tao-bon');
  assert.strictEqual(res.type, 'article');
  assert.strictEqual(res.data?.article?.id, 3797);
});

// 9. Root Category vs Nested Page Collisions
test('Collision: root kien-thuc-ung-thu-da-day resolves to CATEGORY (ID 47)', () => {
  const res = resolveContent('kien-thuc-ung-thu-da-day');
  assert.strictEqual(res.type, 'category');
  assert.strictEqual(res.data?.category?.id, 47);
});

test('Collision: root kien-thuc-ung-thu-dai-trang resolves to CATEGORY (ID 48)', () => {
  const res = resolveContent('kien-thuc-ung-thu-dai-trang');
  assert.strictEqual(res.type, 'category');
  assert.strictEqual(res.data?.category?.id, 48);
});

test('Nested page: tam-soat-ung-thu-da-day-tai-doctor-check/kien-thuc-ung-thu-da-day resolves to PAGE (ID 4868)', () => {
  const res = resolveEndoscopySubpath(['tam-soat-ung-thu-da-day-tai-doctor-check', 'kien-thuc-ung-thu-da-day']);
  assert.strictEqual(res.type, 'page');
  assert.strictEqual(res.data?.page?.id, 4868);
});

test('Nested page: tam-soat-ung-thu-dai-trang-tai-doctor-check/kien-thuc-ung-thu-dai-trang resolves to PAGE (ID 4860)', () => {
  const res = resolveEndoscopySubpath(['tam-soat-ung-thu-dai-trang-tai-doctor-check', 'kien-thuc-ung-thu-dai-trang']);
  assert.strictEqual(res.type, 'page');
  assert.strictEqual(res.data?.page?.id, 4860);
});

console.log('\n==============================================');
console.log(`TEST RESULTS: ${passCount} PASSED, ${failCount} FAILED`);
console.log('==============================================\n');

if (failCount > 0) {
  process.exit(1);
}
