import fs from 'fs';
import path from 'path';

const html = fs.readFileSync('doctorcheck-source/html/homepage.html', 'utf8');

// Find all image references in homepage.html (src, data-src, srcset, background-image in inline styles)
const imgRefs = new Set();

// <img> tags
const imgRegex = /<img\b([^>]*?)>/gi;
let m;
while ((m = imgRegex.exec(html)) !== null) {
  const attrs = m[1];
  const src = (attrs.match(/src=["']([^"']+)["']/i) || [])[1];
  const dataSrc = (attrs.match(/data-src=["']([^"']+)["']/i) || [])[1];
  if (src) imgRefs.add(src);
  if (dataSrc) imgRefs.add(dataSrc);
}

// inline style background-image: url(...)
const bgRegex = /url\(['"]?([^'"\)\s]+)['"]?\)/gi;
while ((m = bgRegex.exec(html)) !== null) {
  const url = m[1];
  if (url.match(/\.(png|jpe?g|webp|gif|svg)/i)) {
    imgRefs.add(url);
  }
}

console.log('Total unique image URLs in homepage.html:', imgRefs.size);

// Scan existing local images in public/
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

const localFiles = scanDir('public/sites/doctorcheck-vn');
console.log('Total local image files in public/sites/doctorcheck-vn:', localFiles.length);

// Build map of filename to local file path
const localByBase = new Map();
localFiles.forEach(f => {
  const base = path.basename(f).toLowerCase();
  localByBase.set(base, f.replace(/\\/g, '/'));
});

// Correlate each original reference
const imageMapping = [];
for (const originalUrl of Array.from(imgRefs)) {
  // strip query params or clean
  const cleanUrl = originalUrl.split('?')[0];
  const base = path.basename(cleanUrl).toLowerCase();
  
  let existing = null;
  let confidence = 'unresolved';

  // direct base match
  if (localByBase.has(base)) {
    existing = localByBase.get(base).replace(/^public\//, '/');
    confidence = 'exact';
  } else {
    // try finding without extension or webp variant
    const nameWithoutExt = base.replace(/\.[^.]+$/, '');
    for (const [lBase, lPath] of localByBase.entries()) {
      if (lBase.startsWith(nameWithoutExt) || nameWithoutExt.startsWith(lBase.replace(/\.[^.]+$/, ''))) {
        existing = lPath.replace(/^public\//, '/');
        confidence = 'high';
        break;
      }
    }
  }

  // Determine section in homepage.html where this URL appears
  let section = 'Unknown';
  const urlIndex = html.indexOf(originalUrl);
  if (urlIndex !== -1) {
    // find preceding <section
    const precedingHtml = html.substring(0, urlIndex);
    const lastSecMatch = [...precedingHtml.matchAll(/<(section|header|footer)\b([^>]*)>/gi)].pop();
    if (lastSecMatch) {
      const tag = lastSecMatch[1];
      const attrs = lastSecMatch[2];
      const cls = (attrs.match(/class=["']([^"']+)["']/i) || [])[1] || '';
      const id = (attrs.match(/id=["']([^"']+)["']/i) || [])[1] || '';
      section = `${tag} (${id || cls || 'no-id'})`;
    }
  }

  imageMapping.push({
    originalReference: originalUrl,
    section,
    existingAsset: existing || 'UNRESOLVED',
    confidence,
    filename: base
  });
}

console.log('Mapped images count:', imageMapping.length);
const exactCount = imageMapping.filter(i => i.confidence === 'exact').length;
const highCount = imageMapping.filter(i => i.confidence === 'high').length;
const unresolvedCount = imageMapping.filter(i => i.confidence === 'unresolved').length;
console.log(`Exact: ${exactCount}, High: ${highCount}, Unresolved: ${unresolvedCount}`);

fs.writeFileSync('scratch/image_mapping.json', JSON.stringify(imageMapping, null, 2));
