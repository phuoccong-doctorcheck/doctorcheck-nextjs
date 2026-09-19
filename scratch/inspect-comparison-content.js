const fs = require('fs');

const pages = JSON.parse(fs.readFileSync('src/lib/content/data/pages-content.json', 'utf8'));
const item = pages['so-sanh-goi-kham-tong-quat-danh-cho-nu'];
console.log('so-sanh-goi-kham-tong-quat-danh-cho-nu:');
console.log('Length:', item ? item.contentHtml.length : 'none');

if (item) {
  const m = item.contentHtml.match(/<div class=["']comparison-table["'][\s\S]*?<\/div>\s*<\/div>\s*<\/div>/i);
  if (m) {
    console.log('Comparison table snippet:', m[0].slice(0, 1000));
    console.log('Comparison table length:', m[0].length);
  }
}
