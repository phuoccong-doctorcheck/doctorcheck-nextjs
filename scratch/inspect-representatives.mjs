import fs from 'fs';

const pagesContent = JSON.parse(fs.readFileSync('src/lib/content/data/pages-content.json', 'utf8'));

function inspectPage(slug) {
  const item = pagesContent[slug];
  const html = typeof item === 'string' ? item : (item.contentHtml || item.content || '');
  console.log(`\n=================== SLUG: ${slug} (${html.length} chars) ===================`);
  
  // Extract all section IDs
  const sectionIds = html.match(/id="section_[^"]+"/g) || [];
  console.log('Section IDs:', sectionIds);
  
  // Extract h2 / h3 headings
  const headings = html.match(/<h[23][^>]*>([\s\S]*?)<\/h[23]>/gi) || [];
  console.log('Headings (first 6):', headings.slice(0, 6).map(h => h.replace(/<[^>]+>/g, '').trim()));
  
  // Extract key classes
  const classes = html.match(/class="([^"]+)"/g) || [];
  const uniqueKeyClasses = [...new Set(classes.flatMap(c => c.replace('class="', '').replace('"', '').split(' ')))].filter(c => c.includes('section') || c.includes('row') || c.includes('col') || c.includes('banner') || c.includes('box') || c.includes('tab') || c.includes('accordion'));
  console.log('Key UI Classes:', uniqueKeyClasses.slice(0, 10));
}

// Inspect representatives of each candidate group
console.log('--- REPRESENTATIVE ENDOSCOPY PAGES ---');
inspectPage('noi-soi-da-day');
inspectPage('chuyen-khoa-da-day');
inspectPage('trung-tam-noi-soi-tieu-hoa-doctor-check');

console.log('--- REPRESENTATIVE SYMPTOM / PATHOLOGY PAGES ---');
inspectPage('trieu-chung-da-day');
inspectPage('benh-ly-da-day');

console.log('--- REPRESENTATIVE PACKAGE / PRICING EXTENSION PAGES ---');
inspectPage('goi-tam-soat-nam');
inspectPage('so-sanh-3-goi-kham-nam');
inspectPage('kham-tong-quat');

console.log('--- REPRESENTATIVE CLINICAL TRUST PAGES ---');
inspectPage('10-tieu-chuan-vang');
inspectPage('doi-ngu-bac-si-doctorcheck');
inspectPage('thuoc-va-vat-tu-y-te');

console.log('--- REPRESENTATIVE KNOWLEDGE / SUBPATH PAGES ---');
inspectPage('kien-thuc-ung-thu-da-day');
