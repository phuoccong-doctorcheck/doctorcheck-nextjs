const fs = require('fs');

const pages = JSON.parse(fs.readFileSync('src/lib/content/data/pages-content.json', 'utf8'));
const tableHtml = fs.readFileSync('scratch/female-comparison-table.html', 'utf8');

const item = pages['so-sanh-3-goi-kham-nu'];
if (item && item.contentHtml) {
  if (item.contentHtml.includes('<div class="comparison-table"></div>')) {
    item.contentHtml = item.contentHtml.replace('<div class="comparison-table"></div>', tableHtml);
    console.log('Successfully replaced empty comparison-table with full table HTML');
  } else {
    console.log('comparison-table was not an empty div. Searching for existing table...');
  }
  
  // Make sure image URLs in content are clean
  fs.writeFileSync('src/lib/content/data/pages-content.json', JSON.stringify(pages, null, 2), 'utf8');
  console.log('Updated pages-content.json for so-sanh-3-goi-kham-nu. New length:', item.contentHtml.length);
} else {
  console.error('Item not found in pages-content.json');
}
