import fs from 'fs';
import path from 'path';

// Let's load pages from db static/seed or pages-content.json
const pagesContent = JSON.parse(fs.readFileSync('src/lib/content/data/pages-content.json', 'utf8'));

// Also check if there is a pages metadata list or db seed
let staticPages = [];
if (fs.existsSync('src/lib/content/data/pages.json')) {
  staticPages = JSON.parse(fs.readFileSync('src/lib/content/data/pages.json', 'utf8'));
}

console.log('Keys in pagesContent:', Object.keys(pagesContent).length);
console.log('Items in pages.json (if exists):', staticPages.length);

const allSlugs = Object.keys(pagesContent);

const detailed = allSlugs.map((slug, idx) => {
  const item = pagesContent[slug];
  const html = typeof item === 'string' ? item : (item.contentHtml || item.content || '');
  const title = item.title || slug;
  
  // Analyze content structure
  const hasSections = (html.match(/<section|section_/gi) || []).length;
  const hasRows = (html.match(/class="[^"]*\brow\b/gi) || []).length;
  const hasCols = (html.match(/class="[^"]*\bcol\b/gi) || []).length;
  const hasAccordion = (html.match(/accordion|toggle/gi) || []).length > 0;
  const hasTable = (html.match(/<table/gi) || []).length > 0;
  const hasGallery = (html.match(/gallery|slider|carousel/gi) || []).length > 0;
  const hasBanner = (html.match(/banner/gi) || []).length > 0;
  const hasForm = (html.match(/<form|contact-form|wpforms|ninja-forms/gi) || []).length > 0;
  const hasDoctorRef = (html.match(/bác sĩ|bac-si|doctor/gi) || []).length;
  const hasPriceRef = (html.match(/bảng giá|bang-gia|chi phí|đơn giá/gi) || []).length;
  const hasEquipmentRef = (html.match(/thiết bị|máy soi|olympus|fujifilm|abbott/gi) || []).length;

  return {
    index: idx + 1,
    slug,
    title,
    length: html.length,
    hasSections,
    hasRows,
    hasCols,
    hasAccordion,
    hasTable,
    hasGallery,
    hasBanner,
    hasForm,
    hasDoctorRef,
    hasPriceRef,
    hasEquipmentRef
  };
});

fs.writeFileSync('scratch/pages-inventory.json', JSON.stringify(detailed, null, 2));
console.log('Wrote scratch/pages-inventory.json');
