import fs from 'fs';

const pages = JSON.parse(fs.readFileSync('./src/lib/content/data/pages-content.json', 'utf8'));
const keys = Object.keys(pages);
console.log('Total keys in pages-content.json:', keys.length);
console.log('Sample keys:', keys.slice(0, 10));

// Check if keys are slugs or IDs or paths
console.log("pages['doi-ngu-bac-si-doctorcheck']:", pages['doi-ngu-bac-si-doctorcheck']?.title);
console.log("pages['/doi-ngu-bac-si-doctorcheck/']:", pages['/doi-ngu-bac-si-doctorcheck/']?.title);
console.log("pages['5726']:", pages['5726']?.title);

// Let's find entries in pages-content
const matchingEntry = Object.entries(pages).find(([k, v]) => v.title && v.title.includes('Bác Sĩ'));
console.log('Matching entry key & value title:', matchingEntry ? [matchingEntry[0], matchingEntry[1].title, matchingEntry[1].slug, matchingEntry[1].id] : 'None');
