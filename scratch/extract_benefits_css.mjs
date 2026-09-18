import fs from 'fs';

const files = ['flatsome.css', 'app.css', 'appv3.css', 'responsive.css'];
let results = '';

for (const file of files) {
  const content = fs.readFileSync('doctorcheck-source/css/' + file, 'utf8');
  results += `\n/* === FILE: ${file} === */\n`;
  
  // Extract CSS selectors containing accordion, section-advanced, video-button, open-video
  const regex = /([^{}]*?(?:accordion|section-advanced|video-button|open-video|button\.primary)[^{}]*?)\{([^{}]*?)\}/gi;
  let match;
  while ((match = regex.exec(content)) !== null) {
    results += `${match[1].trim()} {\n  ${match[2].trim().replace(/;/g, ';\n  ')}\n}\n\n`;
  }
}

fs.writeFileSync('scratch/extracted-benefits-css.css', results);
console.log('Saved to scratch/extracted-benefits-css.css');
