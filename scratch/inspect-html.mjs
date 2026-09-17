import fs from 'fs';
import path from 'path';

console.log('=== INSPECTING GENERATED BUILD HTML FILES ===\n');

const checkHtmlFile = (relPath, name) => {
  const fullPath = path.join('.next/server/app', relPath);
  if (!fs.existsSync(fullPath)) {
    console.log(`[FILE NOT FOUND] ${fullPath} (${name})`);
    return;
  }
  const content = fs.readFileSync(fullPath, 'utf8');
  console.log(`\n========================================`);
  console.log(`PAGE: ${name} (${relPath})`);
  console.log(`========================================`);

  // Extract <title>
  const titleMatch = content.match(/<title>(.*?)<\/title>/);
  console.log('Title:', titleMatch ? titleMatch[1] : '[MISSING]');

  // Extract <meta name="description">
  const descMatch = content.match(/<meta name="description" content="(.*?)"\/>/);
  console.log('Meta Description:', descMatch ? descMatch[1] : '[MISSING]');

  // Extract <link rel="canonical">
  const canonicalMatch = content.match(/<link rel="canonical" href="(.*?)"\/>/);
  console.log('Canonical Link:', canonicalMatch ? canonicalMatch[1] : '[MISSING]');

  // Extract Open Graph
  const ogTitle = content.match(/<meta property="og:title" content="(.*?)"\/>/);
  const ogUrl = content.match(/<meta property="og:url" content="(.*?)"\/>/);
  const ogImage = content.match(/<meta property="og:image" content="(.*?)"\/>/);
  console.log('og:title:', ogTitle ? ogTitle[1] : '[MISSING]');
  console.log('og:url:', ogUrl ? ogUrl[1] : '[MISSING]');
  console.log('og:image:', ogImage ? ogImage[1] : '[MISSING]');

  // Extract JSON-LD scripts
  const jsonLdMatches = [...content.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)];
  console.log(`JSON-LD Scripts Count: ${jsonLdMatches.length}`);
  jsonLdMatches.forEach((m, idx) => {
    try {
      const parsed = JSON.parse(m[1]);
      const type = parsed['@type'] || (parsed['@graph'] ? '@graph (' + parsed['@graph'].length + ' nodes)' : 'unknown');
      console.log(`  JSON-LD #${idx + 1} type:`, type);
      console.log(`  JSON-LD content summary:`, JSON.stringify(parsed).slice(0, 150) + '...');
    } catch (e) {
      console.log(`  JSON-LD #${idx + 1} parse error:`, e.message);
    }
  });
};

// 1. Homepage
checkHtmlFile('index.html', 'Homepage (/)');

// 2. Doctor Profile
checkHtmlFile('doctor/trinh-ai-nhi.html', 'Doctor Profile (/doctor/trinh-ai-nhi/)');

// 3. Package
checkHtmlFile('goi-khuyen-cao-danh-cho-nu.html', 'Package (/goi-khuyen-cao-danh-cho-nu/)');

// 4. Article
checkHtmlFile('10-diem-khong-co-nhung-anh-trung-trai-nghiem-tam-soat-benh-chi-90-phut.html', 'Article');

// 5. Category (e.g. kien-thuc-ung-thu-da-day or benh-ly-tieu-hoa)
checkHtmlFile('benh-ly-tieu-hoa.html', 'Category (/benh-ly-tieu-hoa/)');

// 6. Standalone Page (e.g. doi-ngu-bac-si-doctorcheck, ve-doctor-check)
checkHtmlFile('doi-ngu-bac-si-doctorcheck.html', 'Page (/doi-ngu-bac-si-doctorcheck/)');
checkHtmlFile('ve-doctor-check.html', 'Page (/ve-doctor-check/)');
checkHtmlFile('bang-gia-dich-vu-tam-soat-benh-tai-doctor-check.html', 'Page (/bang-gia-dich-vu-tam-soat-benh-tai-doctor-check/)');

// 7. Endoscopy Hub subpages
const hubDir = '.next/server/app/trung-tam-noi-soi-tieu-hoa-doctor-check';
if (fs.existsSync(hubDir)) {
  const getHtmlFilesRecursive = (dir) => {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
      const p = path.join(dir, file);
      const stat = fs.statSync(p);
      if (stat && stat.isDirectory()) {
        results = results.concat(getHtmlFilesRecursive(p));
      } else if (file.endsWith('.html')) {
        results.push(p);
      }
    });
    return results;
  };
  const hubFiles = getHtmlFilesRecursive(hubDir);
  console.log(`\nFound ${hubFiles.length} hub HTML files.`);
  if (hubFiles.length > 0) {
    const sampleHub = path.relative('.next/server/app', hubFiles[0]).replace(/\\/g, '/');
    checkHtmlFile(sampleHub, `Hub Page (${sampleHub})`);
  }
}
