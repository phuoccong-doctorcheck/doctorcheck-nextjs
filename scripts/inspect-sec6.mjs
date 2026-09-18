import fs from 'fs';

const pages = JSON.parse(fs.readFileSync('./src/lib/content/data/pages-content.json', 'utf8'));
const bg2026 = pages['bang-gia-2026'];
const sec6 = bg2026.contentHtml.match(/<section[^>]*id=["']section_876236633["'][^>]*>([\s\S]*?)<\/section>/i);
if (sec6) {
  console.log('=== Section 6 in bang-gia-2026 ===');
  console.log(sec6[0].slice(0, 3000));
}
