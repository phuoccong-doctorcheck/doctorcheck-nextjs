import fs from 'fs';

const pagesContent = JSON.parse(fs.readFileSync('src/lib/content/data/pages-content.json', 'utf8'));
const staticPagesMatch = fs.readFileSync('src/lib/routing/pages-data.ts', 'utf8').match(/export const staticPagesData: PageItem\[\] = (\[[\s\S]*?\]);/);
const staticPages = JSON.parse(staticPagesMatch[1]);

// Distinct 55 pages
const slugs = Object.keys(pagesContent);

const categorized = slugs.map(slug => {
  const content = pagesContent[slug] || {};
  const html = typeof content === 'string' ? content : (content.contentHtml || content.content || '');
  const staticItem = staticPages.find(p => p.slug === slug);
  const path = staticItem?.path || `/${slug}/`;
  const isNested = !staticItem?.isRoot && (staticItem?.subpath || path.startsWith('/trung-tam-noi-soi-tieu-hoa'));

  // 1. Locked status check
  let status = 'REMAINING';
  let family = '';

  if (slug === 've-doctor-check' || slug === 've-chung-toi') {
    status = 'LOCKED — ABOUT';
    family = 'About Us (Locked)';
  } else if (slug === 'bang-gia-2026' || slug === 'bang-gia-dich-vu-tam-soat-benh-tai-doctor-check' || slug === 'bang-gia-dich-vu') {
    status = 'LOCKED — PRICING';
    family = 'Pricing Matrix / Table (Locked)';
  } else if (['dau-thuong-vi', 'tieu-chay', 'di-ngoai-ra-mau', 'tao-bon'].includes(slug)) {
    status = 'LOCKED — COLLISION ARTICLE';
    family = 'Article Collision (Protected)';
  } else if (slug === 'trang-chu') {
    status = 'LOCKED — HOMEPAGE';
    family = 'Homepage (Locked)';
  }

  if (!family) {
    // Determine remaining families:
    // Family A: Clinical Endoscopy & Organ Specialty (Digestive endoscopy landing pages with Hero, Technology, Doctor, Pricing, FAQ)
    // Examples: noi-soi-da-day, noi-soi-dai-trang, chuyen-khoa-da-day, chuyen-khoa-dai-trang, trung-tam-noi-soi-tieu-hoa, trung-tam-noi-soi-tieu-hoa-doctor-check, noi-soi-da-day-chan-doan-benh-ly, noi-soi-dai-trang-chan-doan-benh-ly
    if (
      slug.startsWith('noi-soi-') ||
      slug.startsWith('chuyen-khoa-') ||
      slug.startsWith('trung-tam-noi-soi-') ||
      slug.includes('chan-doan-benh-ly') ||
      slug.includes('tam-soat-ung-thu-da-day-tai-doctor-check') ||
      slug.includes('tam-soat-ung-thu-dai-trang-tai-doctor-check')
    ) {
      family = 'Clinical Endoscopy & Specialty Hub';
    }
    // Family B: Clinical Symptom & Disease Guide Landing Pages (Symptom cards, causes, warning signs, booking CTA)
    // Examples: trieu-chung-da-day, trieu-chung-dai-trang, benh-ly-da-day, benh-ly-dai-trang, buon-non-non-keo-dai, dieu-tri-tao-bon-di-cau-ra-mau
    else if (
      slug.startsWith('trieu-chung-') ||
      slug.startsWith('benh-ly-') ||
      slug === 'buon-non-non-keo-dai' ||
      slug === 'dieu-tri-tao-bon-di-cau-ra-mau'
    ) {
      family = 'Clinical Symptom & Pathology Guide';
    }
    // Family C: Checkup & Cancer Screening Packages (Package comparison, itemized diagnostic tables, gender tabs)
    // Examples: kham-tong-quat, kham-suc-khoe-doanh-nghiep, goi-tam-soat-nam, goi-tam-soat-nu, so-sanh-3-goi-kham-nam, so-sanh-3-goi-kham-nu, so-sanh-goi-kham-tong-quat-danh-cho-nam, so-sanh-goi-kham-tong-quat-danh-cho-nu, bang-gia-kham-tong-quat, bang-gia-kham-tong-quat-new, bang-gia-kham-suc-khoe-tong-quat, bang-gia-noi-soi-da-day, loi-ich-goi-song-tho, loi-ich-khi-kham-tong-quat-tai-doctor-check, cac-yeu-to-cua-mot-dia-chi-tam-soat-benh-trong-mo
    else if (
      slug.startsWith('goi-tam-soat-') ||
      slug.startsWith('so-sanh-') ||
      slug.startsWith('bang-gia-') ||
      slug.startsWith('kham-') ||
      slug.startsWith('loi-ich-') ||
      slug === 'cac-yeu-to-cua-mot-dia-chi-tam-soat-benh-trong-mo'
    ) {
      family = 'Health Checkup & Package Comparison';
    }
    // Family D: Clinical Trust, Standards, Equipment & Doctors Directory
    // Examples: doi-ngu-bac-si-doctorcheck, 10-tieu-chuan-vang, thuoc-va-vat-tu-y-te, quy-trinh-noi-soi-da-day, quy-trinh-noi-soi-dai-trang, quyen-loi-bhyt-bhtn, bao-chi-dua-tin
    else if (
      slug === 'doi-ngu-bac-si-doctorcheck' ||
      slug === '10-tieu-chuan-vang' ||
      slug === 'thuoc-va-vat-tu-y-te' ||
      slug.startsWith('quy-trinh-') ||
      slug === 'quyen-loi-bhyt-bhtn' ||
      slug === 'bao-chi-dua-tin'
    ) {
      family = 'Clinical Quality, Trust & Protocols';
    }
    // Family E: Cancer Knowledge Subpath Pages (Nested educational knowledge pages)
    else if (slug.startsWith('kien-thuc-ung-thu-')) {
      family = 'Cancer Screening Knowledge Hub';
    }
    // Family F: Utility / Contact / Legal / Minimal Pages
    // Examples: lien-he, cam-on, chinh-sach-quyen-rieng-tu, blog, dich-vu
    else {
      family = 'Utility, Contact & Legal Content';
    }
  }

  return {
    slug,
    title: content.title || slug,
    path,
    isNested,
    htmlLength: html.length,
    status,
    family
  };
});

fs.writeFileSync('scratch/categorized-pages.json', JSON.stringify(categorized, null, 2));

console.log('=== FAMILY SUMMARY ===');
const famSummary = {};
categorized.forEach(c => {
  famSummary[c.family] = (famSummary[c.family] || 0) + 1;
});
console.log(JSON.stringify(famSummary, null, 2));
