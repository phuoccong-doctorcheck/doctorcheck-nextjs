import sitemapModule from '../src/app/sitemap.ts';
import { staticPagesData } from '../src/lib/routing/pages-data.ts';
import { getLegacyRedirect } from '../src/lib/routing/redirects.ts';

const sitemapFn = sitemapModule.default || sitemapModule;
const entries = sitemapFn();
console.log('Total entries:', entries.length);

const rootPages = [];
const hubPages = [];
const collisionSlugs = new Set(['dau-thuong-vi', 'tieu-chay', 'di-ngoai-ra-mau', 'tao-bon']);

staticPagesData.forEach((page) => {
  if (page.path === '/') return;

  const originalPath = page.path.replace(/^\/|\/$/g, '');
  const pathToCheck = page.isRoot
    ? page.slug
    : page.path.startsWith('/trung-tam-noi-soi-tieu-hoa-doctor-check/')
    ? `trung-tam-noi-soi-tieu-hoa-doctor-check/${page.subpath}`
    : originalPath;

  if (
    getLegacyRedirect(originalPath) ||
    getLegacyRedirect(page.slug) ||
    getLegacyRedirect(pathToCheck)
  ) {
    return;
  }
  if (collisionSlugs.has(page.slug)) return;

  if (page.isRoot) {
    rootPages.push(page.slug);
  } else if (page.path.startsWith('/trung-tam-noi-soi-tieu-hoa-doctor-check/')) {
    hubPages.push(page.subpath);
  } else {
    rootPages.push(originalPath);
  }
});

console.log('Root static pages count:', rootPages.length, '(Expected: 25)');
console.log('Hub pages count:', hubPages.length, '(Expected: 18)');
if (rootPages.length !== 25) {
  console.log('Root pages:', rootPages);
}
if (hubPages.length !== 18) {
  console.log('Hub pages:', hubPages);
}
