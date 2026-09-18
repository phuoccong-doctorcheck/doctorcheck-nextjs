import fs from 'fs';

const raw = JSON.parse(fs.readFileSync('./src/lib/content/data/pages-content.json', 'utf8'));

['kien-thuc-ung-thu-da-day', 'kien-thuc-ung-thu-dai-trang'].forEach(slug => {
  const p = raw[slug];
  const html = p?.contentHtml || '';
  console.log(`\n================== ${slug} ==================`);
  
  // split by <section
  const parts = html.split('<section ');
  parts.slice(1).forEach((part, idx) => {
    const sectionTag = part.split('>')[0];
    console.log(`\n--- Section ${idx + 1}: <section ${sectionTag}> ---`);
    console.log(part.slice(0, 500));
  });
});
