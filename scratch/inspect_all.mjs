import fs from 'fs';
import path from 'path';

const html = fs.readFileSync('doctorcheck-source/html/homepage.html', 'utf8');

// Section 2: section-confuse inspection
const sec2Match = html.match(/<section\s+class=["'][^"']*?section-confuse[^"']*?["'][\s\S]*?<\/section>/i);
if (sec2Match) {
  const sec2 = sec2Match[0];
  console.log('--- SECTION-CONFUSE LENGTH:', sec2.length);
  // Find inner rows
  const rows = [...sec2.matchAll(/<div\s+class=["'][^"']*?\brow\b[^"']*?["'][^>]*>/gi)];
  console.log('Rows in confuse:', rows.length);
  rows.forEach((r, i) => console.log(`  Row ${i+1}: ${r[0]}`));
  
  // Find if there is video in section confuse
  const vMatches = [...sec2.matchAll(/(video|youtube|iframe|play-button|modal)/gi)];
  console.log('Video tokens in confuse:', vMatches.length);
  
  // Print structure of confuse
  // check headings or key text
  const headings = [...sec2.matchAll(/<h[1-6][^>]*>([\s\S]*?)<\/h[1-6]>/gi)].map(h => h[1].replace(/<[^>]+>/g, '').trim());
  console.log('Headings in confuse:', headings);
}

// Check all 13 sections and their exact IDs, classes, rows, and inner headings/titles
const sectionRegex = /<section\b([\s\S]*?)<\/section>/gi;
let sm;
let idx = 0;
while ((sm = sectionRegex.exec(html)) !== null) {
  idx++;
  const s = sm[0];
  const openTag = sm[1].split('>')[0];
  const id = (openTag.match(/id=["']([^"']+)["']/i) || [])[1] || 'no-id';
  const cls = (openTag.match(/class=["']([^"']+)["']/i) || [])[1] || 'no-class';
  const headings = [...s.matchAll(/<h[1-6][^>]*>([\s\S]*?)<\/h[1-6]>/gi)].map(h => h[1].replace(/<[^>]+>/g, '').trim().replace(/\s+/g, ' '));
  console.log(`\n========================================`);
  console.log(`SECTION ${idx}: id="${id}" class="${cls}"`);
  console.log(`Headings (${headings.length}):`, headings.slice(0, 5));
}
