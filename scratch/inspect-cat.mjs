import fs from 'fs';
import path from 'path';

console.log('=== INSPECTING CATEGORY HTML FILE ===\n');

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

  const titleMatch = content.match(/<title>(.*?)<\/title>/);
  console.log('Title:', titleMatch ? titleMatch[1] : '[MISSING]');

  const descMatch = content.match(/<meta name="description" content="(.*?)"\/>/);
  console.log('Meta Description:', descMatch ? descMatch[1] : '[MISSING]');

  const canonicalMatch = content.match(/<link rel="canonical" href="(.*?)"\/>/);
  console.log('Canonical Link:', canonicalMatch ? canonicalMatch[1] : '[MISSING]');

  const ogTitle = content.match(/<meta property="og:title" content="(.*?)"\/>/);
  const ogUrl = content.match(/<meta property="og:url" content="(.*?)"\/>/);
  const ogImage = content.match(/<meta property="og:image" content="(.*?)"\/>/);
  console.log('og:title:', ogTitle ? ogTitle[1] : '[MISSING]');
  console.log('og:url:', ogUrl ? ogUrl[1] : '[MISSING]');
  console.log('og:image:', ogImage ? ogImage[1] : '[MISSING]');

  const jsonLdMatches = [...content.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)];
  console.log(`JSON-LD Scripts Count: ${jsonLdMatches.length}`);
};

checkHtmlFile('12-loai-ung-thu-thuong-gap.html', 'Category (/12-loai-ung-thu-thuong-gap/)');
checkHtmlFile('22-nhom-tam-soat-can-biet.html', 'Category (/22-nhom-tam-soat-can-biet/)');
