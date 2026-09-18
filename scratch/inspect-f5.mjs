import fs from 'fs';

const raw = JSON.parse(fs.readFileSync('./src/lib/content/data/pages-content.json', 'utf8'));

['kien-thuc-ung-thu-da-day', 'kien-thuc-ung-thu-dai-trang'].forEach(slug => {
  const p = raw[slug];
  const html = p?.contentHtml || '';
  console.log(`=== ${slug} ===`);
  console.log('Title:', p?.title);
  console.log('Length:', html.length);
  const sections = html.match(/<section[^>]*class="([^"]*)"/g) || [];
  console.log('Sections count:', sections.length, sections);
  const headings = html.match(/<h[1-6][^>]*>.*?<\/h[1-6]>/g) || [];
  console.log('Headings count:', headings.length);
  headings.forEach(h => console.log('  ', h));
});
