import sitemapFn from '../src/app/sitemap.ts';
import fs from 'node:fs';

const sitemap = typeof sitemapFn === 'function' ? sitemapFn : sitemapFn.default;
const entries = sitemap();
const sitemapUrls = new Set(entries.map(e => e.url));

const list197 = new Set(JSON.parse(fs.readFileSync('C:/Users/phuoccong.nguyen/.gemini/antigravity-ide/brain/cca0b980-51ca-42cb-b412-28ea44cb2fb3/scratch/canonical_sitemap_urls.json', 'utf8')));

console.log('In sitemap (198) but not in list197:');
for (const u of sitemapUrls) {
  if (!list197.has(u)) console.log(' + ', u);
}

console.log('In list197 (197) but not in sitemap:');
for (const u of list197) {
  if (!sitemapUrls.has(u)) console.log(' - ', u);
}
