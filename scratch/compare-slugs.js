const fs = require('fs');

const pages = JSON.parse(fs.readFileSync('src/lib/content/data/pages-content.json', 'utf8'));
const fullNu = pages['so-sanh-goi-kham-tong-quat-danh-cho-nu'];
const shortNu = pages['so-sanh-3-goi-kham-nu'];

const fullWithoutTable = fullNu.contentHtml.replace(/<div class="comparison-table">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*<\/div>/, '<div class="comparison-table"></div>');

console.log('fullNu without table length:', fullWithoutTable.length);
console.log('shortNu length:', shortNu.contentHtml.length);
