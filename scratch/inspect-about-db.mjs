import fs from 'fs';

const pages = JSON.parse(fs.readFileSync('./src/lib/content/data/pages-content.json', 'utf8'));

const veDoctorCheck = pages['ve-doctor-check'];
const veChungToi = pages['ve-chung-toi'];

console.log('ve-doctor-check title:', veDoctorCheck?.title);
console.log('ve-doctor-check html length:', veDoctorCheck?.contentHtml?.length);
console.log('ve-chung-toi title:', veChungToi?.title);
console.log('ve-chung-toi html length:', veChungToi?.contentHtml?.length);

function inspectSections(html, label) {
  console.log(`\n=================== ${label} ===================`);
  const sections = [...html.matchAll(/<(?:section|div)[^>]*(?:class|id)=["']([^"']*(?:section|kdn|about|banner|row)[^"']*)["'][^>]*>/gi)];
  console.log('Matched containers:');
  const seen = new Set();
  sections.forEach(m => {
    const cls = m[1];
    if (!seen.has(cls)) {
      seen.add(cls);
      console.log(`  ${cls}`);
    }
  });

  const headings = [...html.matchAll(/<h[1-4][^>]*>([\s\S]*?)<\/h[1-4]>/gi)].map(m => m[1].replace(/<[^>]+>/g, '').trim());
  console.log('\nHeadings:');
  headings.forEach(h => console.log('  -', h));
}

inspectSections(veDoctorCheck.contentHtml, 've-doctor-check');
