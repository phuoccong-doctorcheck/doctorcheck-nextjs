import fs from 'fs';

const pagesContent = JSON.parse(fs.readFileSync('src/lib/content/data/pages-content.json', 'utf8'));
const contentSlugs = Object.keys(pagesContent);

console.log('Total Slugs in pagesContent:', contentSlugs.length);

const staticPagesMatch = fs.readFileSync('src/lib/routing/pages-data.ts', 'utf8').match(/export const staticPagesData: PageItem\[\] = (\[[\s\S]*?\]);/);
const staticPages = JSON.parse(staticPagesMatch[1]);
console.log('Total items in staticPagesData:', staticPages.length);

const staticSlugs = staticPages.map(p => p.slug);

// Find missing or unique
const inContentNotStatic = contentSlugs.filter(s => !staticSlugs.includes(s));
const inStaticNotContent = staticSlugs.filter(s => !contentSlugs.includes(s));

console.log('In Content not in Static:', inContentNotStatic);
console.log('In Static not in Content:', inStaticNotContent);

// Check all 55 content slugs
contentSlugs.forEach((slug, i) => {
  const staticItem = staticPages.find(p => p.slug === slug);
  const content = pagesContent[slug];
  const html = typeof content === 'string' ? content : (content.contentHtml || content.content || '');
  console.log(`${(i+1).toString().padStart(2, '0')}. Slug: ${slug.padEnd(45)} | Path: ${staticItem?.path || ('/' + slug + '/')} | HTML Length: ${html.length.toString().padStart(6)}`);
});
