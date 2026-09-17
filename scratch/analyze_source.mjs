import fs from 'fs';
import path from 'path';

const htmlPath = path.resolve('doctorcheck-source/html/homepage.html');
const html = fs.readFileSync(htmlPath, 'utf8');

console.log('--- HOMEPAGE HTML INSPECTION ---');
console.log('Total length:', html.length);

// Header inspection
const headerMatch = html.match(/<header\b[\s\S]*?<\/header>/i);
console.log('Header length:', headerMatch ? headerMatch[0].length : 'NOT FOUND');

// Main content sections
const sectionRegex = /<section\b([^>]*)>/gi;
let match;
let sections = [];
while ((match = sectionRegex.exec(html)) !== null) {
  const attrs = match[1];
  const id = (attrs.match(/id=["']([^"']+)["']/i) || [])[1] || 'no-id';
  const cls = (attrs.match(/class=["']([^"']+)["']/i) || [])[1] || 'no-class';
  sections.push({ id, cls, fullAttrs: attrs });
}

console.log(`Found ${sections.length} sections:`);
sections.forEach((s, idx) => {
  console.log(`[${idx + 1}] id="${s.id}" class="${s.cls}"`);
});

// Footer inspection
const footerMatch = html.match(/<footer\b[\s\S]*?<\/footer>/i);
console.log('Footer length:', footerMatch ? footerMatch[0].length : 'NOT FOUND');
