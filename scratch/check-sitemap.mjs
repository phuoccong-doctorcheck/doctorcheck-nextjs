import sitemapModule from '../src/app/sitemap.ts';
import { LEGACY_REDIRECTS, getLegacyRedirect } from '../src/lib/routing/redirects.ts';

const sitemapFn = sitemapModule.default || sitemapModule;
const entries = sitemapFn();
console.log('Total entries:', entries.length);

// Check if any redirect is in sitemap
let foundRedirect = 0;
for (const entry of entries) {
  const slug = entry.url.replace('https://doctorcheck.vn/', '').replace(/\/$/, '');
  if (getLegacyRedirect(slug) || LEGACY_REDIRECTS[slug]) {
    console.log('Redirect in sitemap:', slug, '->', getLegacyRedirect(slug) || LEGACY_REDIRECTS[slug]);
    foundRedirect++;
  }
}
console.log('Found redirects in sitemap:', foundRedirect);
