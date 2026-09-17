import fs from 'fs';
import path from 'path';

const cssDir = path.resolve('doctorcheck-source/css');
const files = fs.readdirSync(cssDir);

const cssAnalysis = [];

for (const file of files) {
  const filePath = path.join(cssDir, file);
  const content = fs.readFileSync(filePath, 'utf8');
  const size = content.length;
  
  // Find media queries
  const mediaQueries = [...content.matchAll(/@media[^{]+\{/gi)].map(m => m[0].trim());
  const breakpoints = new Set();
  for (const mq of mediaQueries) {
    const bpMatches = mq.match(/(min-width|max-width):\s*([0-9]+(px|em|rem))/gi);
    if (bpMatches) {
      bpMatches.forEach(bp => breakpoints.add(bp));
    }
  }

  // Find selectors of interest
  const selectors = [];
  // sample some classes and IDs
  const classMatches = content.match(/\.[a-zA-Z0-9_-]+/g) || [];
  const idMatches = content.match(/#[a-zA-Z0-9_-]+/g) || [];

  // Key purpose determination
  let purpose = '';
  let priority = 'P2';
  let relevantUI = '';

  if (file === 'flatsome.css') {
    purpose = 'Flatsome core theme layout, grid, containers, buttons, forms, base typography';
    priority = 'P0';
    relevantUI = 'Global layout, .container, .row, .col, .button, typography';
  } else if (file === 'app.css') {
    purpose = 'DoctorCheck custom homepage styles, section overrides, hero, doctor slider, badges';
    priority = 'P0';
    relevantUI = 'Homepage sections, banner, doctor cards, pricing, badges';
  } else if (file === 'appv3.css') {
    purpose = 'DoctorCheck v3 enhancements, mobile optimizations, circle blur, customer section';
    priority = 'P0';
    relevantUI = 'Circle-blur backgrounds, customer stories, facilities, mobile styling';
  } else if (file === 'responsive.css') {
    purpose = 'DoctorCheck responsive rules and breakpoints';
    priority = 'P0';
    relevantUI = 'Mobile & tablet responsive rules for header, hero, sections';
  } else if (file === 'dc-icons.min.css') {
    purpose = 'DoctorCheck custom icon font definitions and utility classes';
    priority = 'P1';
    relevantUI = 'Icons across header, features, buttons';
  } else if (file === 'header-ldp.css') {
    purpose = 'Landing page header specific rules and sticky behavior';
    priority = 'P1';
    relevantUI = 'Header layout, sticky header, logo, navigation';
  } else if (file === 'doctor-boxes.css') {
    purpose = 'Doctor cards, profile boxes and modal/badge styling';
    priority = 'P1';
    relevantUI = 'Section doctor, doctor box list and modals';
  } else if (file === 'styles.css' || file === 'style.css') {
    purpose = 'Child theme base styles and metadata';
    priority = 'P2';
    relevantUI = 'Child theme basic styling';
  } else if (file.includes('owl')) {
    purpose = 'Owl carousel base and theme styles';
    priority = 'P1';
    relevantUI = 'Carousels in confuse/video/customer/doctor sections';
  } else if (file.includes('swiper')) {
    purpose = 'Swiper slider bundle styles';
    priority = 'P2';
    relevantUI = 'Alternative slider component';
  } else if (file.includes('splide')) {
    purpose = 'Splide slider styles';
    priority = 'P2';
    relevantUI = 'Alternative slider component';
  } else if (file.includes('flatpickr')) {
    purpose = 'Flatpickr datepicker styles';
    priority = 'P2';
    relevantUI = 'Booking form datepicker';
  } else if (file.includes('flatsome-shop')) {
    purpose = 'WooCommerce Flatsome shop and product styling';
    priority = 'P2';
    relevantUI = 'Pricing tables, service packages, product buttons';
  } else if (file === 'public-main.css') {
    purpose = 'Plugin public main assets/styles';
    priority = 'P2';
    relevantUI = 'Plugin UI elements';
  } else if (file === 'ldp-nsdd.css') {
    purpose = 'Landing page noi soi da day styles';
    priority = 'P2';
    relevantUI = 'Endoscopy landing page specific styling';
  } else if (file === 'kdn.css') {
    purpose = 'Kham doanh nghiep enterprise checkup styles';
    priority = 'P2';
    relevantUI = 'Enterprise checkup section/modal styling';
  }

  cssAnalysis.push({
    file,
    size,
    purpose,
    priority,
    relevantUI,
    breakpoints: Array.from(breakpoints).join(', ') || 'None',
    totalMediaQueries: mediaQueries.length,
    sampleClasses: Array.from(new Set(classMatches)).slice(0, 15),
    sampleIds: Array.from(new Set(idMatches)).slice(0, 10)
  });
}

console.log('Analyzed', cssAnalysis.length, 'CSS files.');
fs.writeFileSync('scratch/css_analysis.json', JSON.stringify(cssAnalysis, null, 2));
