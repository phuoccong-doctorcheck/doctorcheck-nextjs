import fs from 'fs';
import path from 'path';

const htmlPath = path.resolve('doctorcheck-source/html/homepage.html');
const html = fs.readFileSync(htmlPath, 'utf8');

// 1. Analyze Head & Body
const titleMatch = html.match(/<title>([\s\S]*?)<\/title>/i);
const bodyMatch = html.match(/<body\b([^>]*)>/i);
console.log('Title:', titleMatch ? titleMatch[1].trim() : 'N/A');
console.log('Body attrs:', bodyMatch ? bodyMatch[1].trim() : 'N/A');

// Extract linked stylesheets in HTML
const linkRegex = /<link\b([^>]*rel=["']stylesheet["'][^>]*)>/gi;
let linkMatch;
const linkedStylesheets = [];
while ((linkMatch = linkRegex.exec(html)) !== null) {
  const href = (linkMatch[1].match(/href=["']([^"']+)["']/i) || [])[1];
  const id = (linkMatch[1].match(/id=["']([^"']+)["']/i) || [])[1];
  linkedStylesheets.push({ id, href });
}
console.log('Linked stylesheets count:', linkedStylesheets.length);

// Extract inline styles
const styleRegex = /<style\b([^>]*)>([\s\S]*?)<\/style>/gi;
let styleMatch;
let inlineStylesCount = 0;
let inlineStylesLength = 0;
while ((styleMatch = styleRegex.exec(html)) !== null) {
  inlineStylesCount++;
  inlineStylesLength += styleMatch[2].length;
}
console.log(`Inline styles: ${inlineStylesCount} blocks, ${inlineStylesLength} chars`);

// 2. Sections detailed breakdown
// We find all top-level elements inside <div id="wrapper"> or <main id="main">
const mainMatch = html.match(/<main\s+id=["']main["'][^>]*>([\s\S]*?)<\/main>/i);
const mainContent = mainMatch ? mainMatch[1] : '';

console.log('Main content length:', mainContent.length);

// Extract all direct children or sections of main
const sectionBlocks = [];
const sRegex = /<section\b[\s\S]*?<\/section>/gi;
let sm;
while ((sm = sRegex.exec(mainContent)) !== null) {
  const secHtml = sm[0];
  const id = (secHtml.match(/id=["']([^"']+)["']/i) || [])[1] || 'no-id';
  const cls = (secHtml.match(/class=["']([^"']+)["']/i) || [])[1] || 'no-class';
  
  // Find rows
  const rows = [];
  const rowRegex = /<div\s+class=["'][^"']*?\brow\b[^"']*?["'][^>]*>/gi;
  let rm;
  while ((rm = rowRegex.exec(secHtml)) !== null) {
    rows.push(rm[0]);
  }
  
  // Find columns
  const cols = [];
  const colRegex = /<div\s+class=["'][^"']*?\bcol\b[^"']*?["'][^>]*>/gi;
  let cm;
  while ((cm = colRegex.exec(secHtml)) !== null) {
    cols.push(cm[0]);
  }

  // Find images
  const imgs = [];
  const imgRegex = /<img\b([^>]*?)>/gi;
  let im;
  while ((im = imgRegex.exec(secHtml)) !== null) {
    const src = (im[1].match(/src=["']([^"']+)["']/i) || [])[1];
    const dataSrc = (im[1].match(/data-src=["']([^"']+)["']/i) || [])[1];
    const alt = (im[1].match(/alt=["']([^"']+)["']/i) || [])[1];
    imgs.push({ src, dataSrc, alt });
  }

  // Find sliders/carousels
  const sliders = [];
  const sliderRegex = /class=["'][^"']*?(slider|carousel|flickity|owl|swiper|splide)[^"']*?["']/gi;
  let slm;
  while ((slm = sliderRegex.exec(secHtml)) !== null) {
    sliders.push(slm[0]);
  }

  sectionBlocks.push({
    id,
    cls,
    length: secHtml.length,
    rowsCount: rows.length,
    colsCount: cols.length,
    imgsCount: imgs.length,
    imgs: imgs.slice(0, 5),
    slidersCount: sliders.length,
    sliders
  });
}

console.log('\n--- SECTIONS SUMMARY ---');
sectionBlocks.forEach((sb, idx) => {
  console.log(`Section ${idx+1}: id="${sb.id}", class="${sb.cls}", size=${sb.length}, rows=${sb.rowsCount}, cols=${sb.colsCount}, imgs=${sb.imgsCount}, sliders=${sb.slidersCount}`);
});

fs.writeFileSync('scratch/sections_detail.json', JSON.stringify({
  linkedStylesheets,
  sections: sectionBlocks
}, null, 2));
