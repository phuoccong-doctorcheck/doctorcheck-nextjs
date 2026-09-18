import fs from 'fs';

const pages = JSON.parse(fs.readFileSync('./src/lib/content/data/pages-content.json', 'utf8'));

['bang-gia-2026', 'bang-gia-dich-vu-tam-soat-benh-tai-doctor-check', 'bang-gia-dich-vu'].forEach(slug => {
  const p = pages[slug];
  if (!p) {
    console.log(`Page not found: ${slug}`);
    return;
  }
  console.log(`\n=== ${slug} ===`);
  const imgs = [...p.contentHtml.matchAll(/<img[^>]*src=["']([^"']+)["'][^>]*>/gi)].map(m => m[1]);
  console.log(`Images (${imgs.length}):`);
  imgs.slice(0, 5).forEach(img => console.log('  -', img));

  const tables = [...p.contentHtml.matchAll(/<table[^>]*>/gi)];
  console.log(`Tables: ${tables.length}`);

  const tabContainers = [...p.contentHtml.matchAll(/class=["'][^"']*tabbed-content[^"']*["']/gi)];
  console.log(`Tabbed containers: ${tabContainers.length}`);
});
