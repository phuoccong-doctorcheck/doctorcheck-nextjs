import fs from 'fs';

const raw = JSON.parse(fs.readFileSync('./src/lib/content/data/pages-content.json', 'utf8'));

['kien-thuc-ung-thu-da-day', 'kien-thuc-ung-thu-dai-trang'].forEach(slug => {
  const p = raw[slug];
  const html = p?.contentHtml || '';
  const classMatches = html.match(/class="([^"]*)"/g) || [];
  const classes = new Set();
  classMatches.forEach(c => {
    c.replace(/class="|"/g, '').split(/\s+/).forEach(cls => {
      if (cls) classes.add(cls);
    });
  });
  console.log(`\n=== Classes in ${slug} (${classes.size}) ===`);
  console.log([...classes].sort().join(', '));
});
