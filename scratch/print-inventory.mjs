import fs from 'fs';

const analysis = JSON.parse(fs.readFileSync('scratch/deep-page-analysis.json', 'utf8'));
const pagesContent = JSON.parse(fs.readFileSync('src/lib/content/data/pages-content.json', 'utf8'));

console.log(`=== FULL INVENTORY OF ALL 55 CANONICAL PAGES ===`);
analysis.forEach((p) => {
  const content = pagesContent[p.slug] || '';
  const html = typeof content === 'string' ? content : (content.contentHtml || content.content || '');
  console.log(`[${p.index.toString().padStart(2, '0')}] ID:${p.id} | Slug: ${p.slug} | Path: ${p.path} | HTML Len: ${html.length} | Sections: ${p.sectionCount} | Cat: ${p.initialCategory}`);
});
