import fs from 'fs';

const pages = JSON.parse(fs.readFileSync('./src/lib/content/data/pages-content.json', 'utf8'));

function dumpSections(slug) {
  const p = pages[slug];
  if (!p) {
    console.log(`Page ${slug} not found`);
    return;
  }
  console.log(`\n=================== ${slug} ===================`);
  console.log(`Title: ${p.title}`);
  
  // Look for sections / major containers
  const html = p.contentHtml;
  
  // Extract all section tags or top-level containers
  const sectionRegex = /<section[^>]*>([\s\S]*?)<\/section>/gi;
  let sMatch;
  let count = 0;
  while ((sMatch = sectionRegex.exec(html)) !== null) {
    count++;
    const sFull = sMatch[0];
    const classMatch = sFull.match(/class=["']([^"']*)["']/i);
    const idMatch = sFull.match(/id=["']([^"']*)["']/i);
    const headings = [...sFull.matchAll(/<h[1-4][^>]*>([\s\S]*?)<\/h[1-4]>/gi)].map(h => h[1].replace(/<[^>]+>/g, '').trim());
    console.log(`Section #${count} [id="${idMatch ? idMatch[1] : ''}", class="${classMatch ? classMatch[1] : ''}"]`);
    console.log(`  Headings:`, headings);
  }
}

dumpSections('bang-gia-2026');
dumpSections('bang-gia-dich-vu-tam-soat-benh-tai-doctor-check');
dumpSections('bang-gia-dich-vu');
