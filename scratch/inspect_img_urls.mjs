import fs from 'fs';

const html = fs.readFileSync('doctorcheck-source/html/homepage.html', 'utf8');
const imgRegex = /<img\b([^>]*?)>/gi;
let m;
let count = 0;
while ((m = imgRegex.exec(html)) !== null && count < 15) {
  const src = (m[1].match(/src=["']([^"']+)["']/i) || [])[1];
  const dataSrc = (m[1].match(/data-src=["']([^"']+)["']/i) || [])[1];
  console.log(`--- IMG ${++count} ---`);
  console.log('src:', src);
  console.log('dataSrc:', dataSrc);
}
