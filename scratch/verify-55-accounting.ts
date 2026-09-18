import fs from 'fs';
import {
  classifyPageFamily,
  PageFamilyType,
  PRICING_SLUGS,
  CLINICAL_ENDOSCOPY_HUB_SLUGS,
  CLINICAL_SYMPTOM_GUIDE_SLUGS,
  PACKAGE_COMPARISON_SLUGS,
  CLINICAL_QUALITY_PROTOCOLS_SLUGS,
  UTILITY_LEGAL_SLUGS
} from '../src/lib/routing/page-family-policy';

const pages = JSON.parse(fs.readFileSync('./src/lib/content/data/pages-content.json', 'utf8'));
const slugs = Object.keys(pages);

console.log('Total pages in pages-content.json:', slugs.length);

const KNOWLEDGE_HUB_SLUGS = new Set([
  'kien-thuc-ung-thu-da-day',
  'kien-thuc-ung-thu-dai-trang',
]);

const counts: Record<string, string[]> = {
  ABOUT: [],
  PRICING: [],
  CLINICAL_ENDOSCOPY_HUB: [],
  CLINICAL_SYMPTOM_GUIDE: [],
  PACKAGE_COMPARISON: [],
  CLINICAL_QUALITY_PROTOCOLS: [],
  UTILITY_LEGAL: [],
  KNOWLEDGE_HUB: [],
  GENERIC: [],
  COLLISION_ARTICLES: [],
  HOMEPAGE: [],
};

slugs.forEach(slug => {
  if (slug === 'trang-chu') {
    counts.HOMEPAGE.push(slug);
  } else if (['dau-thuong-vi', 'tieu-chay', 'di-ngoai-ra-mau', 'tao-bon'].includes(slug)) {
    counts.COLLISION_ARTICLES.push(slug);
  } else if (KNOWLEDGE_HUB_SLUGS.has(slug)) {
    counts.KNOWLEDGE_HUB.push(slug);
  } else {
    const family = classifyPageFamily(slug);
    if (counts[family]) {
      counts[family].push(slug);
    } else {
      counts.GENERIC.push(slug);
    }
  }
});

let total = 0;
for (const [key, list] of Object.entries(counts)) {
  console.log(`${key} (${list.length}):`, list);
  total += list.length;
}

console.log('TOTAL ACCOUNTED:', total);
