import fs from 'fs';

const pages = JSON.parse(fs.readFileSync('./src/lib/content/data/pages-content.json', 'utf8'));
const html = pages['bang-gia-dich-vu-tam-soat-benh-tai-doctor-check'].contentHtml;

// Let's inspect the pricing rows
const rowMatches = [...html.matchAll(/<div class=["']pricing-row["']>([\s\S]*?)<\/div>\s*<\/div>/g)];
console.log('Total pricing-row matched:', rowMatches.length);

const cells = [...html.matchAll(/<div class=["']pricing-cell["']>([\s\S]*?)<\/div>/g)];
console.log('Total pricing-cell matched:', cells.length);
console.log('Sample cell contents:', cells.slice(0, 10).map(c => c[1].replace(/<[^>]+>/g, '').trim()));
