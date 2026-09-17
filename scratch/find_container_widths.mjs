import fs from 'fs';
import path from 'path';

const rootDir = 'src/components/sites/doctorcheck-vn/root';
const files = fs.readdirSync(rootDir).filter(f => f.endsWith('.tsx'));

console.log('--- SCANNING FOR ARBITRARY MAX-W WIDTHS IN ROOT COMPONENTS ---');

files.forEach(file => {
  const content = fs.readFileSync(path.join(rootDir, file), 'utf8');
  const maxWMatches = [...content.matchAll(/max-w-[a-zA-Z0-9\[\]_-]+/g)].map(m => m[0]);
  if (maxWMatches.length > 0) {
    console.log(`\nFile: ${file}`);
    const unique = [...new Set(maxWMatches)];
    console.log('  Max-w classes found:', unique.join(', '));
  }
});
