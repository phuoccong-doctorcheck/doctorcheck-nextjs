const fs = require('fs');

const pages = JSON.parse(fs.readFileSync('src/lib/content/data/pages-content.json', 'utf8'));
const item = pages['so-sanh-3-goi-kham-nu'];
console.log('Title:', item.title);

const sRegex = /<section\b[^>]*>([\s\S]*?)<\/section>/gi;
let match;
let count = 0;
while ((match = sRegex.exec(item.contentHtml)) !== null) {
  count++;
  const full = match[0];
  const classMatch = full.match(/class=["']([^"']*)["']/i);
  const idMatch = full.match(/id=["']([^"']*)["']/i);
  console.log(`\n--- Section ${count} [id=${idMatch ? idMatch[1] : ''}, class=${classMatch ? classMatch[1] : ''}] ---`);
  console.log('Length:', full.length);
  console.log('Snippet:', full.slice(0, 200).replace(/\s+/g, ' '));
}

// Check non-section elements (like form or row at end)
const afterSections = item.contentHtml.replace(/<section[\s\S]*?<\/section>/gi, '').trim();
console.log('\n--- Content outside <section> ---');
console.log('Length:', afterSections.length);
console.log('Snippet:', afterSections.slice(0, 300).replace(/\s+/g, ' '));
