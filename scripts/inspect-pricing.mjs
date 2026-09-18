import fs from 'fs';

const pages = JSON.parse(fs.readFileSync('./src/lib/content/data/pages-content.json', 'utf8'));

function analyzePage(key) {
  const p = pages[key];
  if (!p) return;
  console.log(`\n======================================================`);
  console.log(`ANALYSIS OF: ${key} (${p.title})`);
  console.log(`======================================================`);
  
  const html = p.contentHtml;
  
  // Find major sections / divs
  const matches = [...html.matchAll(/<(section|div|table|h1|h2|h3)[^>]*class=["']([^"']+)["'][^>]*>/g)];
  console.log('Main elements with classes:');
  const seen = new Set();
  matches.forEach(m => {
    const tag = m[1];
    const cls = m[2];
    const key = `${tag}.${cls.split(' ')[0]}`;
    if (!seen.has(key)) {
      seen.add(key);
      console.log(`  <${tag} class="${cls.slice(0, 80)}">`);
    }
  });

  // Check prices
  const priceMatches = html.match(/(\d{1,3}(?:\.\d{3})+)\s*(?:đ|VNĐ|vnđ)/g) || [];
  console.log('Prices found in content:', Array.from(new Set(priceMatches)));

  // Check table details if any
  const tableMatches = [...html.matchAll(/<table[^>]*>([\s\S]*?)<\/table>/g)];
  console.log(`Table count: ${tableMatches.length}`);
  tableMatches.forEach((t, i) => {
    const ths = [...t[1].matchAll(/<th[^>]*>([\s\S]*?)<\/th>/g)].map(m => m[1].replace(/<[^>]+>/g, '').trim());
    console.log(`  Table #${i + 1} headers:`, ths);
  });
}

analyzePage('bang-gia-2026');
analyzePage('bang-gia-dich-vu-tam-soat-benh-tai-doctor-check');
analyzePage('bang-gia-dich-vu');
