const fs = require('fs');

const tableHtml = fs.readFileSync('scratch/female-comparison-table.html', 'utf8');
console.log('Table size:', tableHtml.length);
console.log('Contains Khuyến cáo:', tableHtml.includes('Khuyến cáo'));
console.log('Contains Chuyên Sâu:', tableHtml.includes('Chuyên Sâu'));
console.log('Contains Sống thọ:', tableHtml.includes('Sống thọ'));

// Check how many rows
const rows = tableHtml.match(/<div class="pricing-row"/g) || [];
console.log('Total pricing-row in table:', rows.length);

// Print header prices
const headerPrices = tableHtml.match(/<div class="package-price">[\s\S]*?<\/div>/g) || [];
console.log('Header prices found:');
headerPrices.forEach(p => console.log('  ', p.replace(/\s+/g, ' ')));
