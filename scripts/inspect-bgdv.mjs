import fs from 'fs';

const pages = JSON.parse(fs.readFileSync('./src/lib/content/data/pages-content.json', 'utf8'));
const bgdv = pages['bang-gia-dich-vu'];
console.log('Title:', bgdv?.title);
console.log('Content snippet (first 1000 chars):');
console.log(bgdv?.contentHtml?.slice(0, 1000));
