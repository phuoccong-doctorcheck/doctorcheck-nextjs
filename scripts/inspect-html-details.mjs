import fs from 'fs';

const pages = JSON.parse(fs.readFileSync('./src/lib/content/data/pages-content.json', 'utf8'));

function inspectHtmlDetails(slug) {
  const p = pages[slug];
  if (!p) return;
  console.log(`\n=================== INSPECTION: ${slug} ===================`);
  const html = p.contentHtml;
  
  // Extract images
  const imgs = [...html.matchAll(/<img[^>]*src=["']([^"']*)["'][^>]*>/gi)].map(m => m[1]);
  console.log(`Total images: ${imgs.length}`);
  console.log(`Sample images:`, imgs.slice(0, 5));

  // Extract buttons/links
  const links = [...html.matchAll(/<a[^>]*href=["']([^"']*)["'][^>]*>([\s\S]*?)<\/a>/gi)].map(m => ({
    href: m[1],
    text: m[2].replace(/<[^>]+>/g, '').trim()
  }));
  console.log(`Total links: ${links.length}`);
  console.log(`Sample links:`, links.slice(0, 5));
}

inspectHtmlDetails('bang-gia-2026');
inspectHtmlDetails('bang-gia-dich-vu-tam-soat-benh-tai-doctor-check');
inspectHtmlDetails('bang-gia-dich-vu');
