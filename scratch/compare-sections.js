const fs = require('fs');

const pages = JSON.parse(fs.readFileSync('src/lib/content/data/pages-content.json', 'utf8'));
const fullNu = pages['so-sanh-goi-kham-tong-quat-danh-cho-nu'];
const shortNu = pages['so-sanh-3-goi-kham-nu'];

console.log('--- fullNu top-level sections ---');
const s1 = fullNu.contentHtml.match(/<section\b[^>]*class=["']([^"']*)["']/g) || [];
s1.forEach(s => console.log('  ', s));

console.log('--- shortNu top-level sections ---');
const s2 = shortNu.contentHtml.match(/<section\b[^>]*class=["']([^"']*)["']/g) || [];
s2.forEach(s => console.log('  ', s));
