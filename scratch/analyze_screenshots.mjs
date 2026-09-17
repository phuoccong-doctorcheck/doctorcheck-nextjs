import fs from 'fs';
import path from 'path';

const shotDir = 'doctorcheck-source/screenshots/desktop';
const files = fs.readdirSync(shotDir);

console.log('--- SCREENSHOTS IN doctorcheck-source/screenshots/desktop ---');
for (const file of files) {
  const filePath = path.join(shotDir, file);
  const stat = fs.statSync(filePath);
  
  // Read PNG header for width and height (bytes 16-24 of PNG)
  const fd = fs.openSync(filePath, 'r');
  const buffer = Buffer.alloc(24);
  fs.readSync(fd, buffer, 0, 24, 0);
  fs.closeSync(fd);
  
  let width = 0;
  let height = 0;
  if (buffer.toString('ascii', 1, 4) === 'PNG') {
    width = buffer.readUInt32BE(16);
    height = buffer.readUInt32BE(20);
  }
  
  console.log(`${file}: ${width}x${height} px (${(stat.size / 1024).toFixed(1)} KB)`);
}
