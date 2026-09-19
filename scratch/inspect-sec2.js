const fs = require('fs');

const pages = JSON.parse(fs.readFileSync('src/lib/content/data/pages-content.json', 'utf8'));
const item = pages['so-sanh-3-goi-kham-nu'];

const sRegex = /<section\b[^>]*class=["']section section-service["'][^>]*>([\s\S]*?)<\/section>/i;
const match = item.contentHtml.match(sRegex);
if (match) {
  console.log('Section 2 HTML:\n', match[0]);
} else {
  console.log('No section-service found');
}
