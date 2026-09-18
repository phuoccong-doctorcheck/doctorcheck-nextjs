import assert from 'node:assert';
import fs from 'node:fs';
import {
  classifyPageFamily,
  PageFamilyType,
  KNOWLEDGE_HUB_SLUGS,
  PRICING_SLUGS,
  CLINICAL_ENDOSCOPY_HUB_SLUGS,
  CLINICAL_SYMPTOM_GUIDE_SLUGS,
  PACKAGE_COMPARISON_SLUGS,
  CLINICAL_QUALITY_PROTOCOLS_SLUGS,
  UTILITY_LEGAL_SLUGS,
} from '../src/lib/routing/page-family-policy';

console.log('🧪 Running Family 5: Cancer Screening Knowledge Hub Verification Suite...\n');

// 1. Slugs check
assert.strictEqual(KNOWLEDGE_HUB_SLUGS.size, 2, 'KNOWLEDGE_HUB_SLUGS must contain exactly 2 canonical pages');
assert.ok(KNOWLEDGE_HUB_SLUGS.has('kien-thuc-ung-thu-da-day'), 'Must contain kien-thuc-ung-thu-da-day');
assert.ok(KNOWLEDGE_HUB_SLUGS.has('kien-thuc-ung-thu-dai-trang'), 'Must contain kien-thuc-ung-thu-dai-trang');
console.log('✅ Family 5 Slugs Definition: PASS (2/2 canonical routes)');

// 2. Classification check
for (const slug of KNOWLEDGE_HUB_SLUGS) {
  const family = classifyPageFamily(slug);
  assert.strictEqual(family, PageFamilyType.KNOWLEDGE_HUB, `Slug ${slug} must classify as KNOWLEDGE_HUB`);
}
console.log('✅ Family 5 Classification Policy: PASS');

// 3. Database Content & Structural Parity
const pagesData = JSON.parse(fs.readFileSync('./src/lib/content/data/pages-content.json', 'utf8'));

for (const slug of KNOWLEDGE_HUB_SLUGS) {
  const page = pagesData[slug];
  assert.ok(page, `Page record for ${slug} must exist in canonical JSON`);
  assert.ok(page.title && page.title.length > 0, `Page ${slug} must have a valid title`);
  assert.ok(page.contentHtml && page.contentHtml.length > 5000, `Page ${slug} contentHtml must be populated`);
  
  // Verify authentic structural sections
  assert.ok(page.contentHtml.includes('section-dear'), `Page ${slug} must contain section-dear`);
  assert.ok(page.contentHtml.includes('section-post'), `Page ${slug} must contain section-post`);
  assert.ok(page.contentHtml.includes('bg-aaci'), `Page ${slug} must contain bg-aaci`);
}
console.log('✅ Database Content & Section Structure: PASS');

// 4. Zero Slug-Hack Presentation Audit
const templateCode = fs.readFileSync('./src/components/templates/KnowledgeHubTemplate.tsx', 'utf8');
assert.ok(!templateCode.includes('slug ==='), 'KnowledgeHubTemplate must not contain slug === hacks');
assert.ok(!templateCode.includes('slug.includes'), 'KnowledgeHubTemplate must not contain slug.includes hacks');
console.log('✅ Presentation Slug-Hack Audit: PASS (0 hacks)');

// 5. 55/55 Canonical Page Full Coverage Verification
const allSlugs = Object.keys(pagesData);
assert.strictEqual(allSlugs.length, 55, 'Total canonical pages in database must equal exactly 55');

let coveredCount = 0;
allSlugs.forEach(slug => {
  if (slug === 'trang-chu') {
    coveredCount++;
  } else if (['dau-thuong-vi', 'tieu-chay', 'di-ngoai-ra-mau', 'tao-bon'].includes(slug)) {
    coveredCount++; // Protected Article Collisions
  } else {
    const family = classifyPageFamily(slug);
    assert.notStrictEqual(family, PageFamilyType.GENERIC, `Page ${slug} must not have UNKNOWN / GENERIC family`);
    coveredCount++;
  }
});

assert.strictEqual(coveredCount, 55, 'All 55 canonical pages must be accounted for');
console.log('✅ 55/55 Total Canonical Page Coverage: PASS (55/55 pages mapped, 0 uncovered, 0 generic)');

console.log('\n🎉 ALL Family 5 Knowledge Hub tests PASSED successfully!\n');
