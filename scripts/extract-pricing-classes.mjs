import fs from 'fs';

const pages = JSON.parse(fs.readFileSync('./src/lib/content/data/pages-content.json', 'utf8'));

['bang-gia-2026', 'bang-gia-dich-vu-tam-soat-benh-tai-doctor-check', 'bang-gia-dich-vu'].forEach(slug => {
  const p = pages[slug];
  if (!p) return;
  console.log(`\n=================== UNIQUE CLASSES IN ${slug} ===================`);
  const classMatches = p.contentHtml.match(/class=["']([^"']+)["']/gi) || [];
  const classes = new Set();
  classMatches.forEach(m => {
    const raw = m.replace(/class=["']|["']/gi, '');
    raw.split(/\s+/).forEach(c => {
      if (c) classes.add(c);
    });
  });
  console.log(Array.from(classes).sort().join(', '));
});
