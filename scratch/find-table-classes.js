const fs = require('fs');

const html = fs.readFileSync('scratch/female-comparison-table.html', 'utf8');
const classRegex = /class=["']([^"']*)["']/g;
const classes = new Set();
let m;
while ((m = classRegex.exec(html)) !== null) {
  m[1].split(/\s+/).forEach(c => c && classes.add(c));
}

console.log('Unique classes in female comparison table:');
console.log(Array.from(classes).sort());
