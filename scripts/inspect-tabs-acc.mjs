import fs from 'fs';

const pages = JSON.parse(fs.readFileSync('./src/lib/content/data/pages-content.json', 'utf8'));

['bang-gia-2026', 'bang-gia-dich-vu-tam-soat-benh-tai-doctor-check', 'so-sanh-3-goi-kham-nam', 'so-sanh-3-goi-kham-nu'].forEach(slug => {
  const p = pages[slug];
  if (!p) return;
  console.log(`\n=================== ${slug} ===================`);
  const tabMatches = [...p.contentHtml.matchAll(/class=["'][^"']*tab\s*([^"']*)["'][^>]*>([\s\S]*?)<\/(?:li|div)>/gi)];
  console.log(`Tab elements count: ${tabMatches.length}`);
  
  const accMatches = [...p.contentHtml.matchAll(/class=["'][^"']*accordion-item[^"']*["']/gi)];
  console.log(`Accordion items count: ${accMatches.length}`);
});
