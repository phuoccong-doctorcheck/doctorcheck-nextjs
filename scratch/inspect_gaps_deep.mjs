import fs from 'fs';
import path from 'path';

const html = fs.readFileSync('doctorcheck-source/html/homepage.html', 'utf8');

// Function to get section html from homepage.html
function getSection(id) {
  const reg = new RegExp(`<section[^>]*id=["']${id}["'][\\s\\S]*?<\\/section>`, 'i');
  const m = html.match(reg);
  return m ? m[0] : '';
}

// Inspect Hero
console.log('=== HERO SECTION ===');
const heroHtml = getSection('section_380136169');
console.log('Hero HTML length:', heroHtml.length);
console.log(heroHtml.substring(0, 500));

// Inspect Hero component
const heroComp = fs.readFileSync('src/components/sites/doctorcheck-vn/root/HeroSection.tsx', 'utf8');
console.log('Hero component:');
console.log(heroComp);

// Inspect PainPoints
console.log('\n=== PAIN POINTS (CONFUSE) ===');
const confuseHtml = getSection('section_294013533');
console.log('Confuse HTML length:', confuseHtml.length);
const painComp = fs.readFileSync('src/components/sites/doctorcheck-vn/root/PainPointsSection.tsx', 'utf8');
console.log('PainPoints component length:', painComp.length);

// Inspect Benefits
console.log('\n=== BENEFITS (ADVANCED) ===');
const advHtml = getSection('section_1967412634');
console.log('Advanced HTML length:', advHtml.length);
const benComp = fs.readFileSync('src/components/sites/doctorcheck-vn/root/BenefitsSection.tsx', 'utf8');
console.log('Benefits component length:', benComp.length);

// Inspect Doctors
console.log('\n=== DOCTORS ===');
const docHtml = getSection('section_1563108974');
console.log('Doctor HTML length:', docHtml.length);
const docComp = fs.readFileSync('src/components/sites/doctorcheck-vn/root/DoctorsSection.tsx', 'utf8');
console.log('Doctors component length:', docComp.length);

// Inspect Facilities
console.log('\n=== FACILITIES ===');
const facHtml = getSection('section_818310656');
console.log('Facilities HTML length:', facHtml.length);
const facComp = fs.readFileSync('src/components/sites/doctorcheck-vn/root/EquipmentSection.tsx', 'utf8');
console.log('Equipment component length:', facComp.length);

// Inspect Pricing
console.log('\n=== PRICING ===');
const priceHtml = getSection('section_1936328654');
console.log('Pricing HTML length:', priceHtml.length);
const priceComp = fs.readFileSync('src/components/sites/doctorcheck-vn/root/PricingSection.tsx', 'utf8');
console.log('Pricing component length:', priceComp.length);

// Inspect Cancer Screening
console.log('\n=== CANCER SCREENING ===');
const canHtml = getSection('section_991765975');
console.log('Cancer HTML length:', canHtml.length);
const canComp = fs.readFileSync('src/components/sites/doctorcheck-vn/root/CancerScreeningSection.tsx', 'utf8');
console.log('Cancer component length:', canComp.length);

// Inspect Customer Stories
console.log('\n=== CUSTOMER STORIES ===');
const custHtml = getSection('section_1899109699');
console.log('Customer HTML length:', custHtml.length);
const custComp = fs.readFileSync('src/components/sites/doctorcheck-vn/root/CustomerStoriesSection.tsx', 'utf8');
console.log('Customer stories component length:', custComp.length);

// Inspect Booking / CTA
console.log('\n=== BOOKING / CTA ===');
const ctaHtml = getSection('section_1178718493');
console.log('CTA HTML length:', ctaHtml.length);
const bookComp = fs.readFileSync('src/components/sites/doctorcheck-vn/root/BookingSection.tsx', 'utf8');
console.log('Booking component length:', bookComp.length);

// Inspect FAQ
console.log('\n=== FAQ ===');
const faqHtml = getSection('section_1915240304');
console.log('FAQ HTML length:', faqHtml.length);
const faqComp = fs.readFileSync('src/components/sites/doctorcheck-vn/root/FaqSection.tsx', 'utf8');
console.log('FAQ component length:', faqComp.length);

// Inspect Banner CTA
console.log('\n=== BANNER CTA ===');
const bctaHtml = getSection('section_514095607');
console.log('Banner CTA HTML length:', bctaHtml.length);
const bctaComp = fs.readFileSync('src/components/sites/doctorcheck-vn/root/BannerCtaSection.tsx', 'utf8');
console.log('Banner CTA component length:', bctaComp.length);

// Inspect Footer
console.log('\n=== FOOTER ===');
const footMatch = html.match(/<footer id="footer"[\s\S]*?<\/footer>/i);
console.log('Footer HTML length:', footMatch ? footMatch[0].length : 0);
const footComp = fs.readFileSync('src/components/sites/doctorcheck-vn/root/Footer.tsx', 'utf8');
console.log('Footer component length:', footComp.length);
