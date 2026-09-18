import fs from 'fs';

const pagesMap = JSON.parse(fs.readFileSync('./src/lib/content/data/pages-content.json', 'utf8'));

const lienHeHtml = pagesMap['lien-he']?.contentHtml || '';
const privacyHtml = pagesMap['chinh-sach-quyen-rieng-tu']?.contentHtml || '';

console.log('=== LIEN HE CLASSES ===');
const lienHeClasses = new Set();
(lienHeHtml.match(/class="([^"]+)"/g) || []).forEach(m => {
  const cls = m.replace(/class="|"$/g, '').split(/\s+/);
  cls.forEach(c => lienHeClasses.add(c));
});
console.log(Array.from(lienHeClasses).sort().join(', '));

console.log('\n=== PRIVACY POLICY CLASSES ===');
const privacyClasses = new Set();
(privacyHtml.match(/class="([^"]+)"/g) || []).forEach(m => {
  const cls = m.replace(/class="|"$/g, '').split(/\s+/);
  cls.forEach(c => privacyClasses.add(c));
});
console.log(Array.from(privacyClasses).sort().join(', '));
