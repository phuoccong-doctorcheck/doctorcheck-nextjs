import fs from 'fs';

const html = fs.readFileSync('doctorcheck-source/html/homepage.html', 'utf8');
const startTag = '<section class="section section-advanced" id="section_1967412634">';
const startIndex = html.indexOf(startTag);
const nextSectionIndex = html.indexOf('<section', startIndex + startTag.length);
const sectionHtml = html.substring(startIndex, nextSectionIndex);
console.log('Section HTML Length:', sectionHtml.length);
fs.writeFileSync('scratch/section-advanced.html', sectionHtml);
console.log('Saved to scratch/section-advanced.html');
