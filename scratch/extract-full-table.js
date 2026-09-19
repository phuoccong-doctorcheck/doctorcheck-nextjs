const fs = require('fs');

const pages = JSON.parse(fs.readFileSync('src/lib/content/data/pages-content.json', 'utf8'));
const fullNu = pages['so-sanh-goi-kham-tong-quat-danh-cho-nu'];
const shortNu = pages['so-sanh-3-goi-kham-nu'];

console.log('fullNu length:', fullNu.contentHtml.length);
console.log('shortNu length:', shortNu.contentHtml.length);

// Let's inspect the exact comparison-table HTML in fullNu
const tableMatch = fullNu.contentHtml.match(/<div class="comparison-table">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*<\/div>/);
// Let's find closing tags for comparison-table in fullNu
const start = fullNu.contentHtml.indexOf('<div class="comparison-table">');
let depth = 0;
let end = -1;
for (let i = start; i < fullNu.contentHtml.length; i++) {
  if (fullNu.contentHtml.startsWith('<div', i)) {
    depth++;
  } else if (fullNu.contentHtml.startsWith('</div', i)) {
    depth--;
    if (depth === 0) {
      end = i + 6;
      break;
    }
  }
}

console.log('Found full comparison-table from start:', start, 'to end:', end, 'length:', end - start);
const extractedTable = fullNu.contentHtml.substring(start, end);
fs.writeFileSync('scratch/female-comparison-table.html', extractedTable);
console.log('Saved to scratch/female-comparison-table.html');
