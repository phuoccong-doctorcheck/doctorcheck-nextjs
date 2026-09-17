import type { MetadataRoute } from 'next';
import { articlesCatalog } from '@/lib/data/articles';
import { categoriesData } from '@/lib/data/categories';
import { allPackagesList } from '@/lib/data/packages';
import { doctorsData } from '@/lib/data/doctors';
import { staticPagesData } from '@/lib/routing/pages-data';
import { getLegacyRedirect } from '@/lib/routing/redirects';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://doctorcheck.vn';
  const now = new Date();

  const entries: MetadataRoute.Sitemap = [];
  const visitedUrls = new Set<string>();

  const addUrl = (
    path: string,
    priority: number = 0.7,
    changeFrequency: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never' = 'weekly',
    lastModified: Date = now
  ) => {
    // Ensure trailing slash and clean path
    const cleanPath = path.replace(/^\/+|\/+$/g, '');
    const url = cleanPath ? `${baseUrl}/${cleanPath}/` : `${baseUrl}/`;

    if (!visitedUrls.has(url)) {
      visitedUrls.add(url);
      entries.push({
        url,
        lastModified,
        changeFrequency,
        priority,
      });
    }
  };

  // 1. Homepage (P0)
  addUrl('', 1.0, 'daily');

  // 2. Canonical Static Pages (Excluding 301 redirects & collided post drafts)
  const collisionSlugs = new Set(['dau-thuong-vi', 'tieu-chay', 'di-ngoai-ra-mau', 'tao-bon']);

  staticPagesData.forEach((page) => {
    if (page.path === '/') return;

    const originalPath = page.path.replace(/^\/|\/$/g, '');
    const pathToCheck = page.isRoot
      ? page.slug
      : page.path.startsWith('/trung-tam-noi-soi-tieu-hoa-doctor-check/')
      ? `trung-tam-noi-soi-tieu-hoa-doctor-check/${page.subpath}`
      : originalPath;

    // Skip redirects and collisions (which are handled as posts)
    if (
      getLegacyRedirect(originalPath) ||
      getLegacyRedirect(page.slug) ||
      getLegacyRedirect(pathToCheck)
    ) {
      return;
    }
    if (collisionSlugs.has(page.slug)) return;

    const priority = page.slug === 'doi-ngu-bac-si-doctorcheck' || page.slug.includes('bang-gia') ? 0.9 : 0.8;
    addUrl(pathToCheck, priority, 'weekly');
  });

  // 3. Clinical Examination Packages (WooCommerce Products)
  allPackagesList.forEach((pkg) => {
    // Skip if redirected
    if (getLegacyRedirect(pkg.slug)) return;
    addUrl(pkg.slug, 0.9, 'weekly');
  });

  // 4. Doctor Profiles (/doctor/[slug]/)
  doctorsData.forEach((doc) => {
    addUrl(`doctor/${doc.id}`, 0.8, 'monthly');
  });

  // 5. Medical Knowledge Articles (108 Posts)
  articlesCatalog.forEach((art) => {
    const artDate = art.modified ? new Date(art.modified) : art.date ? new Date(art.date) : now;
    addUrl(art.slug, 0.7, 'monthly', artDate);
  });

  // 6. Category Taxonomies (30 Categories)
  categoriesData.forEach((cat) => {
    addUrl(cat.slug, 0.6, 'weekly');
  });

  return entries;
}
