import fs from 'fs';

const pagesContent = JSON.parse(fs.readFileSync('src/lib/content/data/pages-content.json', 'utf8'));
const slugs = Object.keys(pagesContent);

const familyDiscovery = slugs.map(slug => {
  const content = pagesContent[slug];
  const html = typeof content === 'string' ? content : (content.contentHtml || content.content || '');
  
  // Analyze specific Flatsome / WordPress blocks
  const sections = html.match(/id="section_[^"]+"/g) || [];
  const uxSections = html.match(/<section[^>]*class="[^"]*section[^"]*"[^>]*>/g) || [];
  const totalSections = Math.max(sections.length, uxSections.length);
  
  // Hero pattern
  const hasHero = html.includes('banner') || html.includes('section_hero') || html.includes('bg-image') || html.includes('banner-bg');
  // Doctor Carousel / Block
  const hasDoctorGrid = html.includes('bac-si') || html.includes('doctor') || html.includes('đội ngũ bác sĩ');
  // Package Cards / Pricing Table
  const hasPricingTable = html.includes('bảng giá') || html.includes('banggia') || html.includes('goi-kham') || html.includes('price-table') || html.includes('pricing');
  // FAQ Accordion
  const hasAccordion = html.includes('accordion') || html.includes('toggle');
  // Equipment / Machinery
  const hasEquipment = html.includes('thiết bị') || html.includes('olympus') || html.includes('fujifilm') || html.includes('máy nội soi');
  // Process / Steps (Quy trình)
  const hasProcessSteps = html.includes('quy trình') || html.includes('bước') || html.includes('step') || slug.includes('quy-trinh');
  // Form / Consultation
  const hasConsultation = html.includes('tư vấn') || html.includes('đặt hẹn') || html.includes('contact-form') || html.includes('tu-van');
  // Press / News list
  const hasPressList = slug === 'bao-chi-dua-tin' || html.includes('báo chí');
  // Policy / Text doc
  const isTextPolicy = html.length < 15000 && !hasHero && (slug.includes('chinh-sach') || slug.includes('quy-dinh') || slug.includes('dieu-khoan') || slug === 'cam-on' || slug === 'blog' || slug === 'dich-vu');

  return {
    slug,
    length: html.length,
    totalSections,
    hasHero,
    hasDoctorGrid,
    hasPricingTable,
    hasAccordion,
    hasEquipment,
    hasProcessSteps,
    hasConsultation,
    hasPressList,
    isTextPolicy
  };
});

fs.writeFileSync('scratch/family-discovery.json', JSON.stringify(familyDiscovery, null, 2));
console.log('Saved scratch/family-discovery.json');
