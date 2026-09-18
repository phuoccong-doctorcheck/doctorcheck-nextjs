import fs from 'fs';

const pages = JSON.parse(fs.readFileSync('./src/lib/content/data/pages-content.json', 'utf8'));

const p = pages['bang-gia-dich-vu-tam-soat-benh-tai-doctor-check'];
if (p) {
  const html = p.contentHtml;
  console.log('=== STRUCTURE OF bang-gia-dich-vu-tam-soat-benh-tai-doctor-check ===');
  
  // Find tabs
  const tabs = [...html.matchAll(/class=["'][^"']*tab[^"']*["'][^>]*>([\s\S]*?)<\/(?:a|button|li|div)>/g)];
  console.log('Tabs:', tabs.map(t => t[1].replace(/<[^>]+>/g, '').trim()).filter(Boolean));

  // Find package headers inside comparison-table
  const pkgHeaders = [...html.matchAll(/class=["'][^"']*package-title[^"']*["'][^>]*>([\s\S]*?)<\/div>/g)];
  console.log('Package Titles in comparison table:', pkgHeaders.map(t => t[1].replace(/<[^>]+>/g, '').trim()).filter(Boolean));

  // Find package prices
  const pkgPrices = [...html.matchAll(/class=["'][^"']*package-price[^"']*["'][^>]*>([\s\S]*?)<\/div>/g)];
  console.log('Package Prices in comparison table:', pkgPrices.map(t => t[1].replace(/<[^>]+>/g, '').trim()).filter(Boolean));

  // Find sections
  const sectionHeaders = [...html.matchAll(/<h[1-4][^>]*>([\s\S]*?)<\/h[1-4]>/g)];
  console.log('Headings:', sectionHeaders.map(t => t[1].replace(/<[^>]+>/g, '').trim()).filter(Boolean));
}
