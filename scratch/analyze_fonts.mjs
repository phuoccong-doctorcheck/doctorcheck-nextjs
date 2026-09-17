import fs from 'fs';
import path from 'path';

const fontsDir = path.resolve('doctorcheck-source/fonts');
const fontFiles = fs.readdirSync(fontsDir);

console.log('--- FONTS IN doctorcheck-source/fonts ---');
const fontDetails = fontFiles.map(f => {
  const stat = fs.statSync(path.join(fontsDir, f));
  return { file: f, size: stat.size };
});
console.log(JSON.stringify(fontDetails, null, 2));

// Search for @font-face in CSS files
const cssDir = path.resolve('doctorcheck-source/css');
const cssFiles = fs.readdirSync(cssDir);

const fontFaceRules = [];
for (const f of cssFiles) {
  const content = fs.readFileSync(path.join(cssDir, f), 'utf8');
  const matches = [...content.matchAll(/@font-face\s*\{[^}]+\}/gi)];
  if (matches.length > 0) {
    fontFaceRules.push({ file: f, rules: matches.map(m => m[0]) });
  }
}

// Search in homepage.html inline styles
const html = fs.readFileSync('doctorcheck-source/html/homepage.html', 'utf8');
const htmlMatches = [...html.matchAll(/@font-face\s*\{[^}]+\}/gi)];
if (htmlMatches.length > 0) {
  fontFaceRules.push({ file: 'homepage.html', rules: htmlMatches.map(m => m[0]) });
}

console.log('\n--- @FONT-FACE RULES FOUND ---');
fontFaceRules.forEach(ff => {
  console.log(`\nFile: ${ff.file} (${ff.rules.length} rules)`);
  ff.rules.forEach(r => console.log(r.replace(/\s+/g, ' ')));
});

// Search font-family and font-weight usages across CSS files
const fontFamilyUsage = {};
for (const f of cssFiles) {
  const content = fs.readFileSync(path.join(cssDir, f), 'utf8');
  const ffMatches = [...content.matchAll(/font-family:\s*([^;]+);/gi)];
  ffMatches.forEach(m => {
    const fam = m[1].trim();
    if (!fontFamilyUsage[fam]) fontFamilyUsage[fam] = [];
    if (!fontFamilyUsage[fam].includes(f)) fontFamilyUsage[fam].push(f);
  });
}
console.log('\n--- FONT-FAMILY USAGES IN CSS ---');
console.log(JSON.stringify(fontFamilyUsage, null, 2));

fs.writeFileSync('scratch/font_analysis.json', JSON.stringify({
  fontDetails,
  fontFaceRules,
  fontFamilyUsage
}, null, 2));
