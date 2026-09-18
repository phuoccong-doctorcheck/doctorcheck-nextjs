import type { MetadataRoute } from 'next';
import { articlesCatalog } from '@/lib/data/articles';
import { categoriesData } from '@/lib/data/categories';
import { allPackagesList } from '@/lib/data/packages';
import { doctorsData } from '@/lib/data/doctors';
import { staticPagesData } from '@/lib/routing/pages-data';
import { getLegacyRedirect } from '@/lib/routing/redirects';
import { db } from '@/db';
import { redirects } from '@/db/schema/settings';
import { articles } from '@/db/schema/articles';
import { pages } from '@/db/schema/pages';
import { eq, or } from 'drizzle-orm';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://doctorcheck.vn';
  const now = new Date();

  // 1. Fetch active redirect sources and archived content to prevent duplicate or dead URLs
  let activeRedirectSources = new Set<string>();
  const archivedSlugs = new Set<string>();

  try {
    const activeRedirs = await db
      .select({ sourcePath: redirects.sourcePath })
      .from(redirects)
      .where(eq(redirects.isActive, true));

    activeRedirectSources = new Set(
      activeRedirs.map((r) => r.sourcePath.replace(/^\/+|\/+$/g, '').toLowerCase())
    );

    const archivedArticles = await db
      .select({ slug: articles.slug })
      .from(articles)
      .where(or(eq(articles.status, 'archived'), eq(articles.status, 'draft')));

    const archivedPages = await db
      .select({ slug: pages.slug })
      .from(pages)
      .where(or(eq(pages.status, 'archived'), eq(pages.status, 'draft')));

    archivedArticles.forEach((a) => {
      if (a.slug) archivedSlugs.add(a.slug.toLowerCase());
    });
    archivedPages.forEach((p) => {
      if (p.slug) archivedSlugs.add(p.slug.toLowerCase());
    });
  } catch (err) {
    console.warn('⚠️ SITEMAP: Failed to load dynamic database exclusions, falling back to static catalog:', err);
  }

  const entries: MetadataRoute.Sitemap = [];
  const visitedUrls = new Set<string>();

  const isExcluded = (pathOrSlug: string): boolean => {
    const clean = pathOrSlug.replace(/^\/+|\/+$/g, '').toLowerCase();
    if (getLegacyRedirect(clean)) return true;
    if (activeRedirectSources.has(clean)) return true;
    if (archivedSlugs.has(clean)) return true;
    return false;
  };

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

  // 2. Canonical Static Pages (Excluding 301 redirects, collisions, and archived pages)
  const collisionSlugs = new Set(['dau-thuong-vi', 'tieu-chay', 'di-ngoai-ra-mau', 'tao-bon']);

  staticPagesData.forEach((page) => {
    if (page.path === '/') return;

    const originalPath = page.path.replace(/^\/|\/$/g, '');
    const pathToCheck = page.isRoot
      ? page.slug
      : page.path.startsWith('/trung-tam-noi-soi-tieu-hoa-doctor-check/')
      ? `trung-tam-noi-soi-tieu-hoa-doctor-check/${page.subpath}`
      : originalPath;

    if (isExcluded(originalPath) || isExcluded(page.slug) || isExcluded(pathToCheck)) {
      return;
    }
    if (collisionSlugs.has(page.slug)) return;

    const priority = page.slug === 'doi-ngu-bac-si-doctorcheck' || page.slug.includes('bang-gia') ? 0.9 : 0.8;
    addUrl(pathToCheck, priority, 'weekly');
  });

  // 3. Clinical Examination Packages (WooCommerce Products)
  allPackagesList.forEach((pkg) => {
    if (isExcluded(pkg.slug)) return;
    addUrl(pkg.slug, 0.9, 'weekly');
  });

  // 4. Doctor Profiles (/doctor/[slug]/)
  doctorsData.forEach((doc) => {
    if (isExcluded(`doctor/${doc.id}`) || isExcluded(doc.id)) return;
    addUrl(`doctor/${doc.id}`, 0.8, 'monthly');
  });

  // 5. Medical Knowledge Articles (108 Posts)
  articlesCatalog.forEach((art) => {
    if (isExcluded(art.slug)) return;
    const artDate = art.modified ? new Date(art.modified) : art.date ? new Date(art.date) : now;
    addUrl(art.slug, 0.7, 'monthly', artDate);
  });

  // 6. Category Taxonomies (30 Categories)
  categoriesData.forEach((cat) => {
    if (isExcluded(cat.slug)) return;
    addUrl(cat.slug, 0.6, 'weekly');
  });

  return entries;
}
