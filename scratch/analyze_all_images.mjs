import fs from 'fs';
import path from 'path';

const html = fs.readFileSync('doctorcheck-source/html/homepage.html', 'utf8');

// List all files in public
function scanDir(dir) {
  let files = [];
  if (!fs.existsSync(dir)) return files;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files = files.concat(scanDir(full));
    } else {
      files.push(full);
    }
  }
  return files;
}

const allPublicFiles = scanDir('public').map(f => f.replace(/\\/g, '/'));
console.log('Total files in public/:', allPublicFiles.length);

// Extract all <img> and CSS url() images from homepage.html
const imgTags = [...html.matchAll(/<img\b([^>]*?)>/gi)];
const bgUrls = [...html.matchAll(/url\(['"]?([^'"\)\s]+)['"]?\)/gi)];

const htmlImages = [];

imgTags.forEach((tag, i) => {
  const attrs = tag[1];
  const src = (attrs.match(/src=["']([^"']+)["']/i) || [])[1];
  const dataSrc = (attrs.match(/data-src=["']([^"']+)["']/i) || [])[1];
  const alt = (attrs.match(/alt=["']([^"']+)["']/i) || [])[1] || '';
  const width = (attrs.match(/width=["']([^"']+)["']/i) || [])[1] || '';
  const height = (attrs.match(/height=["']([^"']+)["']/i) || [])[1] || '';
  const cls = (attrs.match(/class=["']([^"']+)["']/i) || [])[1] || '';
  
  const finalSrc = dataSrc || src;
  if (finalSrc && !finalSrc.startsWith('data:')) {
    htmlImages.push({
      type: 'img',
      src: finalSrc,
      alt,
      width,
      height,
      cls,
      index: tag.index
    });
  }
});

bgUrls.forEach(bg => {
  const url = bg[1];
  if (url.match(/\.(png|jpe?g|webp|gif|svg)/i)) {
    htmlImages.push({
      type: 'bg',
      src: url,
      alt: 'background-image',
      index: bg.index
    });
  }
});

// Identify which section each image belongs to
htmlImages.forEach(img => {
  const preHtml = html.substring(0, img.index);
  const lastSection = [...preHtml.matchAll(/<(section|header|footer)\b([^>]*)>/gi)].pop();
  if (lastSection) {
    const tag = lastSection[1];
    const attrs = lastSection[2];
    const id = (attrs.match(/id=["']([^"']+)["']/i) || [])[1] || '';
    const cls = (attrs.match(/class=["']([^"']+)["']/i) || [])[1] || '';
    img.sectionTag = tag;
    img.sectionId = id;
    img.sectionClass = cls;
  } else {
    img.sectionTag = 'unknown';
  }
});

console.log(`Found ${htmlImages.length} images in homepage.html`);

// Now match with public/
const report = [];
htmlImages.forEach(img => {
  const orig = img.src;
  const filename = path.basename(orig.split('?')[0]);
  const nameNoExt = filename.replace(/\.[^.]+$/, '');
  
  // Try to find matching file in public/
  let matched = allPublicFiles.find(f => path.basename(f) === filename);
  let confidence = 'exact';
  
  if (!matched) {
    // Try matching webp variant or similar name
    matched = allPublicFiles.find(f => {
      const base = path.basename(f);
      return base.startsWith(nameNoExt) || nameNoExt.startsWith(base.replace(/\.[^.]+$/, ''));
    });
    if (matched) confidence = 'high';
  }
  
  if (!matched) {
    confidence = 'unresolved';
  }

  report.push({
    originalReference: orig,
    section: `${img.sectionTag}#${img.sectionId || ''}.${(img.sectionClass || '').split(' ')[0]}`,
    type: img.type,
    alt: img.alt,
    existingAsset: matched ? matched.replace(/^public/, '') : 'UNRESOLVED',
    confidence,
    filename
  });
});

// Group by section
const bySection = {};
report.forEach(r => {
  if (!bySection[r.section]) bySection[r.section] = [];
  bySection[r.section].push(r);
});

console.log('\n--- IMAGES BY SECTION ---');
for (const [sec, items] of Object.entries(bySection)) {
  console.log(`Section [${sec}]: ${items.length} images`);
  items.forEach(it => {
    console.log(`  - [${it.confidence}] ${it.filename} -> ${it.existingAsset}`);
  });
}

fs.writeFileSync('scratch/full_image_report.json', JSON.stringify({
  total: report.length,
  exact: report.filter(r => r.confidence === 'exact').length,
  high: report.filter(r => r.confidence === 'high').length,
  unresolved: report.filter(r => r.confidence === 'unresolved').length,
  bySection,
  report
}, null, 2));
