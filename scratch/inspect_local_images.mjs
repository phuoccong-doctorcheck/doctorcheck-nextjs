import fs from 'fs';
import path from 'path';

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

const localFiles = scanDir('public/sites/doctorcheck-vn').map(f => f.replace(/\\/g, '/'));
console.log('--- LOCAL ASSETS IN public/sites/doctorcheck-vn ---');
localFiles.forEach(f => console.log(f.replace('public/sites/doctorcheck-vn/', '')));

// Scan all tsx files in src/components/sites/doctorcheck-vn/root to see which assets are used
const rootComponents = scanDir('src/components/sites/doctorcheck-vn/root').filter(f => f.endsWith('.tsx'));
const assetUsages = {};

localFiles.forEach(f => {
  const rel = '/' + f.replace(/^public\//, '');
  const base = path.basename(f);
  assetUsages[rel] = [];
  
  rootComponents.forEach(c => {
    const code = fs.readFileSync(c, 'utf8');
    if (code.includes(rel) || code.includes(base)) {
      assetUsages[rel].push(path.basename(c));
    }
  });
});

console.log('\n--- ASSET USAGE IN ROOT COMPONENTS ---');
for (const [asset, comps] of Object.entries(assetUsages)) {
  console.log(`${asset} -> [${comps.join(', ') || 'UNUSED'}]`);
}
