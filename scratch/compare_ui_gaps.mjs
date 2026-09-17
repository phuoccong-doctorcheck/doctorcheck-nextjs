import fs from 'fs';
import path from 'path';

const html = fs.readFileSync('doctorcheck-source/html/homepage.html', 'utf8');

// List of sections and their corresponding Next.js components
const mapping = [
  {
    name: 'Header',
    origSelector: '#header',
    compFile: 'src/components/sites/doctorcheck-vn/root/Header.tsx',
    screenshot: 'desktop-homepage-01-header.png'
  },
  {
    name: 'Hero Banner',
    origSelector: '#section_380136169',
    compFile: 'src/components/sites/doctorcheck-vn/root/HeroSection.tsx',
    screenshot: 'desktop-homepage-02-hero.png'
  },
  {
    name: 'Four Concerns (Confuse 1)',
    origSelector: '#section_294013533',
    compFile: 'src/components/sites/doctorcheck-vn/root/PainPointsSection.tsx',
    screenshot: 'desktop-homepage-03-confuse.png'
  },
  {
    name: 'Customer Video Testimonials (Confuse 2)',
    origSelector: '#section_294013533',
    compFile: 'src/components/sites/doctorcheck-vn/root/VideoTestimonialsSection.tsx',
    screenshot: 'desktop-homepage-04-video.png'
  },
  {
    name: '5 Benefits (Advanced)',
    origSelector: '#section_1967412634',
    compFile: 'src/components/sites/doctorcheck-vn/root/BenefitsSection.tsx',
    screenshot: 'desktop-homepage-05-advanced.png'
  },
  {
    name: 'Doctors Carousel',
    origSelector: '#section_1563108974',
    compFile: 'src/components/sites/doctorcheck-vn/root/DoctorsSection.tsx',
    screenshot: 'desktop-homepage-06-doctor.png'
  },
  {
    name: 'Facilities & Equipment',
    origSelector: '#section_818310656',
    compFile: 'src/components/sites/doctorcheck-vn/root/EquipmentSection.tsx',
    screenshot: 'desktop-homepage-07-facilities.png'
  },
  {
    name: 'Services & Pricing',
    origSelector: '#section_1936328654',
    compFile: 'src/components/sites/doctorcheck-vn/root/PricingSection.tsx',
    screenshot: 'desktop-homepage-08-service.png'
  },
  {
    name: 'Cancer Screening Suggestion',
    origSelector: '#section_991765975',
    compFile: 'src/components/sites/doctorcheck-vn/root/CancerScreeningSection.tsx',
    screenshot: 'desktop-homepage-09-suggest.png'
  },
  {
    name: 'Customer Stories',
    origSelector: '#section_1899109699',
    compFile: 'src/components/sites/doctorcheck-vn/root/CustomerStoriesSection.tsx',
    screenshot: 'desktop-homepage-10-customer.png'
  },
  {
    name: 'CTA & Consultation Form',
    origSelector: '#section_1178718493',
    compFile: 'src/components/sites/doctorcheck-vn/root/BookingSection.tsx',
    screenshot: 'desktop-homepage-11-cta.png'
  },
  {
    name: 'FAQ',
    origSelector: '#section_1915240304',
    compFile: 'src/components/sites/doctorcheck-vn/root/FaqSection.tsx',
    screenshot: 'desktop-homepage-12-faq.png'
  },
  {
    name: 'Banner CTA',
    origSelector: '#section_514095607',
    compFile: 'src/components/sites/doctorcheck-vn/root/BannerCtaSection.tsx',
    screenshot: null
  },
  {
    name: 'Footer',
    origSelector: '#footer',
    compFile: 'src/components/sites/doctorcheck-vn/root/Footer.tsx',
    screenshot: 'desktop-homepage-13-footer.png'
  }
];

const results = [];

mapping.forEach(m => {
  const compExists = fs.existsSync(m.compFile);
  const compCode = compExists ? fs.readFileSync(m.compFile, 'utf8') : '';
  
  // Extract original HTML fragment
  let origHtml = '';
  if (m.origSelector === '#header') {
    const hMatch = html.match(/<header id="header"[\s\S]*?<\/header>/i);
    origHtml = hMatch ? hMatch[0] : '';
  } else if (m.origSelector === '#footer') {
    const fMatch = html.match(/<footer id="footer"[\s\S]*?<\/footer>/i);
    origHtml = fMatch ? fMatch[0] : '';
  } else {
    const id = m.origSelector.replace('#', '');
    const sRegex = new RegExp(`<section[^>]*id=["']${id}["'][\\s\\S]*?<\\/section>`, 'i');
    const sMatch = html.match(sRegex);
    origHtml = sMatch ? sMatch[0] : '';
  }

  results.push({
    name: m.name,
    selector: m.origSelector,
    origLength: origHtml.length,
    compFile: m.compFile,
    compLength: compCode.length,
    hasScreenshot: !!m.screenshot
  });
});

console.log('--- COMPONENT TO SOURCE MAPPING ---');
console.table(results);
