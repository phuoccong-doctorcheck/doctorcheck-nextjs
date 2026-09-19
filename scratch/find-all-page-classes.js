const fs = require('fs');

const pages = JSON.parse(fs.readFileSync('src/lib/content/data/pages-content.json', 'utf8'));
const item = pages['so-sanh-3-goi-kham-nu'];
const classRegex = /class=["']([^"']*)["']/g;
const classes = new Set();
let m;
while ((m = classRegex.exec(item.contentHtml)) !== null) {
  m[1].split(/\s+/).forEach(c => c && classes.add(c));
}

console.log('All unique classes in so-sanh-3-goi-kham-nu:');
console.log(Array.from(classes).sort());
