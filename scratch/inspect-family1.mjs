import fs from 'fs';

const pagesContent = JSON.parse(fs.readFileSync('src/lib/content/data/pages-content.json', 'utf8'));

const family1Slugs = [
  'noi-soi-da-day',
  'noi-soi-dai-trang',
  'chuyen-khoa-da-day',
  'chuyen-khoa-dai-trang',
  'trung-tam-noi-soi-tieu-hoa',
  'trung-tam-noi-soi-tieu-hoa-doctor-check',
  'noi-soi-da-day-chan-doan-benh-ly',
  'noi-soi-dai-trang-chan-doan-benh-ly',
  'tam-soat-ung-thu-da-day-tai-doctor-check',
  'tam-soat-ung-thu-dai-trang-tai-doctor-check'
];

console.log('=== FAMILY 1 PAGES ANALYSIS ===');
family1Slugs.forEach((slug, i) => {
  const content = pagesContent[slug] || '';
  const html = typeof content === 'string' ? content : (content.contentHtml || content.content || '');
  
  // Section IDs
  const sectionIds = (html.match(/id="section_[^"]+"/g) || []).map(s => s.replace('id="', '').replace('"', ''));
  const hasAccordion = html.includes('accordion');
  const hasSlider = html.includes('slider') || html.includes('carousel') || html.includes('flickity');
  const hasDoctor = html.includes('bac-si') || html.includes('doctor') || html.includes('bác sĩ');
  const hasPricing = html.includes('bảng giá') || html.includes('banggia') || html.includes('goi-kham') || html.includes('price');

  console.log(`[${i+1}] ${slug.padEnd(42)} | Length: ${html.length.toString().padStart(6)} | Sections: ${sectionIds.length.toString().padStart(2)} | Accordion: ${hasAccordion} | Slider: ${hasSlider} | Doc: ${hasDoctor} | Price: ${hasPricing}`);
});
