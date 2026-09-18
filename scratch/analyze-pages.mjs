import fs from 'fs';
import path from 'path';

const pages = JSON.parse(fs.readFileSync('src/lib/content/data/pages-content.json', 'utf8'));

console.log('Total Canonical Pages:', pages.length);

const inventory = pages.map((p, idx) => {
  const content = p.contentHtml || '';
  const hasSections = content.includes('section_') || content.includes('<section') || content.includes('wp-block-group');
  const hasUXBuilder = content.includes('ux_') || content.includes('col-inner') || content.includes('banner-grid');
  const hasTables = content.includes('<table') || content.includes('table-wrapper');
  const hasAccordion = content.includes('accordion') || content.includes('toggle');
  const hasDoctorRef = content.includes('bac-si') || content.includes('doctor') || content.includes('Đội ngũ');
  const hasPackageRef = content.includes('bang-gia') || content.includes('goi-kham') || content.includes('price');
  const hasEndoscopy = p.slug.includes('noi-soi') || p.slug.includes('tieu-hoa') || p.slug.includes('da-day') || p.slug.includes('dai-trang');
  const hasCancerScreening = p.slug.includes('tam-soat') || p.slug.includes('ung-thu');
  const hasPolicy = p.slug.includes('chinh-sach') || p.slug.includes('quy-dinh') || p.slug.includes('dieu-khoan') || p.slug.includes('bao-mat') || p.slug.includes('giai-quyet-khieu-nai') || p.slug.includes('huong-dan');
  const hasContact = p.slug.includes('lien-he') || p.slug.includes('dat-lich') || p.slug.includes('tu-van');
  
  return {
    index: idx + 1,
    id: p.id,
    slug: p.slug,
    title: p.title,
    length: content.length,
    hasSections,
    hasUXBuilder,
    hasTables,
    hasAccordion,
    hasDoctorRef,
    hasPackageRef,
    hasEndoscopy,
    hasCancerScreening,
    hasPolicy,
    hasContact
  };
});

console.log(JSON.stringify(inventory, null, 2));
