import fs from 'fs';

const pagesContent = JSON.parse(fs.readFileSync('src/lib/content/data/pages-content.json', 'utf8'));
const staticPages = JSON.parse(fs.readFileSync('src/lib/routing/pages-data.ts', 'utf8').match(/export const staticPagesData: PageItem\[\] = (\[[\s\S]*?\]);/)[1]);

const analysis = staticPages.map((p, idx) => {
  const content = pagesContent[p.slug] || '';
  const html = typeof content === 'string' ? content : (content.contentHtml || content.content || '');
  
  // Section IDs & Classes
  const sectionMatches = html.match(/id="section_[^"]+"/g) || [];
  const uxSections = html.match(/<section[^>]*class="[^"]*section[^"]*"[^>]*>/g) || [];
  const rows = html.match(/class="[^"]*\brow\b[^"]*"/g) || [];
  const banners = html.match(/class="[^"]*\bbanner\b[^"]*"/g) || [];
  const accordions = html.match(/class="[^"]*accordion[^"]*"/g) || [];
  const tables = html.match(/<table/g) || [];
  const forms = html.match(/class="[^"]*wpforms|ninja-forms|<form/g) || [];
  const doctors = html.match(/bác sĩ|bs\.|thạc sĩ|tiến sĩ/gi) || [];
  const images = html.match(/<img[^>]+src="([^">]+)"/g) || [];

  // Determine potential visual/structural category
  let category = 'UNKNOWN';
  if (p.slug === 've-doctor-check' || p.slug === 've-chung-toi') {
    category = 'LOCKED_ABOUT';
  } else if (p.slug.startsWith('bang-gia') || p.slug.startsWith('so-sanh-')) {
    category = 'LOCKED_OR_PRICING';
  } else if (p.slug === 'lien-he' || p.slug === 'cam-on' || p.slug === 'chinh-sach-quyen-rieng-tu' || p.slug === 'thuoc-va-vat-tu-y-te') {
    category = 'INFO_OR_POLICY_OR_LEGAL';
  } else if (p.slug.includes('noi-soi') || p.slug.includes('chuyen-khoa-') || p.slug.includes('trieu-chung-') || p.slug.includes('benh-ly-')) {
    category = 'ENDOSCOPY_CLINICAL_SPECIALTY';
  } else if (p.slug.includes('tam-soat-ung-thu') || p.slug.includes('kien-thuc-ung-thu')) {
    category = 'CANCER_SCREENING_KNOWLEDGE';
  } else if (p.slug.includes('kham-tong-quat') || p.slug.includes('kham-suc-khoe') || p.slug.includes('goi-tam-soat')) {
    category = 'GENERAL_CHECKUP_PACKAGE';
  } else if (p.slug === 'trung-tam-noi-soi-tieu-hoa' || p.slug === 'trung-tam-noi-soi-tieu-hoa-doctor-check' || p.slug === '10-tieu-chuan-vang' || p.slug === 'doi-ngu-bac-si-doctorcheck') {
    category = 'CLINICAL_TRUST_CENTER';
  }

  return {
    index: idx + 1,
    id: p.id,
    slug: p.slug,
    path: p.path,
    isRoot: p.isRoot,
    subpath: p.subpath,
    title: p.title,
    htmlLength: html.length,
    sectionCount: sectionMatches.length || uxSections.length,
    rowCount: rows.length,
    bannerCount: banners.length,
    accordionCount: accordions.length,
    tableCount: tables.length,
    formCount: forms.length,
    imageCount: images.length,
    initialCategory: category
  };
});

fs.writeFileSync('scratch/deep-page-analysis.json', JSON.stringify(analysis, null, 2));
console.log('Analysis complete. Summary counts:');
const catCounts = {};
analysis.forEach(a => {
  catCounts[a.initialCategory] = (catCounts[a.initialCategory] || 0) + 1;
});
console.log(JSON.stringify(catCounts, null, 2));
