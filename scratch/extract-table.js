const fs = require('fs');

const pages = JSON.parse(fs.readFileSync('src/lib/content/data/pages-content.json', 'utf8'));
const item = pages['so-sanh-goi-kham-tong-quat-danh-cho-nu'];

const startIdx = item.contentHtml.indexOf('<div class="comparison-table">');
if (startIdx !== -1) {
  // Find where the tab panel or section ends
  const endIdx = item.contentHtml.indexOf('</div>            </div>', startIdx);
  console.log('Found table from', startIdx, 'to', endIdx);
  const tableHtml = item.contentHtml.substring(startIdx, endIdx !== -1 ? endIdx : startIdx + 5000);
  console.log('Table HTML length:', tableHtml.length);
  console.log('Sample rows:\n', tableHtml.slice(0, 1500));
}
