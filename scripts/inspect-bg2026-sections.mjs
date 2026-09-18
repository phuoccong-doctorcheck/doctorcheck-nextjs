import fs from 'fs';

const pages = JSON.parse(fs.readFileSync('./src/lib/content/data/pages-content.json', 'utf8'));
const bg2026 = pages['bang-gia-2026'];
console.log('Title:', bg2026?.title);

// Let's print out the structure of all sections in bang-gia-2026
const sections = bg2026.contentHtml.split(/<section/i).filter(Boolean);
sections.forEach((s, idx) => {
  const full = '<section' + s;
  const classMatch = full.match(/class=["']([^"']*)["']/i);
  const idMatch = full.match(/id=["']([^"']*)["']/i);
  console.log(`\n--- Section ${idx + 1}: id="${idMatch?.[1] || ''}" class="${classMatch?.[1] || ''}" ---`);
  // Print first 300 chars of section content
  console.log(full.slice(0, 400).replace(/\s+/g, ' '));
});
