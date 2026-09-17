import { articlesCatalog } from '@/lib/data/articles';
import { categoriesData } from '@/lib/data/categories';
import { allPackagesList } from '@/lib/data/packages';
import { doctorsData } from '@/lib/data/doctors';
import { staticPagesData } from '@/lib/routing/pages-data';
import { getLegacyRedirect } from '@/lib/routing/redirects';
import type { ResolvedContent } from '@/lib/routing/route-types';
import { getArticleBySlug } from '@/lib/content/articles-data';
import { getPageBySlug } from '@/lib/content/pages-data';

/**
 * EXPLICIT POST VS PAGE SLUG COLLISIONS
 *
 * In DoctorCheck WordPress, 4 slugs existed as unpublished or noindex drafts under Pages,
 * but were published as authoritative Medical Articles under Posts with organic rankings.
 * Per the migration priority rule, these collisions deterministically resolve to 'article'.
 */
const POST_COLLISION_SLUGS = new Set([
  'dau-thuong-vi',
  'tieu-chay',
  'di-ngoai-ra-mau',
  'tao-bon',
]);

/**
 * EXPLICIT ROOT CATEGORY VS NESTED PAGE SLUG COLLISIONS
 *
 * Slugs 'kien-thuc-ung-thu-da-day' and 'kien-thuc-ung-thu-dai-trang' exist as:
 * - Root-level Category Taxonomies (/kien-thuc-ung-thu-da-day/, /kien-thuc-ung-thu-dai-trang/)
 * - Deeply nested Pages under (/trung-tam-noi-soi-tieu-hoa-doctor-check/.../)
 *
 * At the root [slug] level, these deterministically resolve to 'category'.
 */
const ROOT_CATEGORY_COLLISION_SLUGS = new Set([
  'kien-thuc-ung-thu-da-day',
  'kien-thuc-ung-thu-dai-trang',
]);

// Pre-indexed lookup maps for O(1) resolution speed
const articleBySlug = new Map(articlesCatalog.map((a) => [a.slug, a]));
const categoryBySlug = new Map(categoriesData.map((c) => [c.slug, c]));
const packageBySlug = new Map(allPackagesList.map((p) => [p.slug, p]));
const doctorBySlug = new Map(doctorsData.map((d) => [d.id, d]));
const rootPageBySlug = new Map(
  staticPagesData.filter((p) => p.isRoot).map((p) => [p.slug, p])
);
const nestedPageBySubpath = new Map(
  staticPagesData.filter((p) => !p.isRoot).map((p) => [p.subpath, p])
);

function cleanTitle(title: string): string {
  return title
    .replace(/&#038;|&amp;/g, '&')
    .replace(/&#8211;|&#8212;/g, '–')
    .replace(/&#8217;/g, "'")
    .replace(/&#8220;|&#8221;/g, '"')
    .replace(/&quot;/g, '"')
    .trim();
}

/**
 * DETERMINISTIC ROOT SLUG RESOLVER
 *
 * Resolves any root-level slug using a strict priority hierarchy:
 * 1. Exact Legacy 301 Redirects
 * 2. Explicit Collision Overrides (Post wins over Page; Category wins at root)
 * 3. Clinical Examination Packages (WooCommerce products)
 * 4. Doctor Profiles (maps to doctor entity with canonical /doctor/[slug]/)
 * 5. Medical Knowledge Articles (108 published posts)
 * 6. Category Taxonomies (30 article archives)
 * 7. Static / Clinical Pages (32 distinct root pages)
 * 8. Fallback: notFound (404)
 */
export function resolveContent(slug: string): ResolvedContent {
  const normalizedSlug = slug.replace(/^\/+|\/+$/g, '');

  // 1. Check Exact Legacy 301 Redirects
  const redirectTarget = getLegacyRedirect(normalizedSlug);
  if (redirectTarget) {
    return {
      type: 'redirect',
      slug: normalizedSlug,
      canonicalUrl: `https://doctorcheck.vn${redirectTarget}`,
      title: 'Redirecting...',
      redirectTarget,
    };
  }

  // 2. Explicit Collision Overrides
  if (POST_COLLISION_SLUGS.has(normalizedSlug)) {
    const fullArticle = getArticleBySlug(normalizedSlug);
    const article = fullArticle || articleBySlug.get(normalizedSlug);
    if (article) {
      return {
        type: 'article',
        slug: normalizedSlug,
        canonicalUrl: `https://doctorcheck.vn/${normalizedSlug}/`,
        title: article.title,
        data: { article },
      };
    }
  }

  if (ROOT_CATEGORY_COLLISION_SLUGS.has(normalizedSlug)) {
    const category = categoryBySlug.get(normalizedSlug);
    if (category) {
      return {
        type: 'category',
        slug: normalizedSlug,
        canonicalUrl: `https://doctorcheck.vn/${normalizedSlug}/`,
        title: category.name,
        data: { category },
      };
    }
  }

  // 3. Clinical Examination Packages
  const pkg = packageBySlug.get(normalizedSlug);
  if (pkg) {
    return {
      type: 'package',
      slug: normalizedSlug,
      canonicalUrl: `https://doctorcheck.vn/${normalizedSlug}/`,
      title: pkg.name,
      data: { package: pkg },
    };
  }

  // 4. Doctor Profiles (When accessed at root [slug], resolves doctor entity)
  const doctor = doctorBySlug.get(normalizedSlug);
  if (doctor) {
    return {
      type: 'doctor',
      slug: normalizedSlug,
      canonicalUrl: `https://doctorcheck.vn/doctor/${doctor.id}/`,
      title: `${doctor.name} – ${doctor.title}`,
      data: { doctor },
    };
  }

  // 5. Medical Knowledge Articles
  const fullArticle = getArticleBySlug(normalizedSlug);
  const article = fullArticle || articleBySlug.get(normalizedSlug);
  if (article) {
    return {
      type: 'article',
      slug: normalizedSlug,
      canonicalUrl: `https://doctorcheck.vn/${normalizedSlug}/`,
      title: article.title,
      data: { article },
    };
  }

  // 6. Category Taxonomies
  const category = categoryBySlug.get(normalizedSlug);
  if (category) {
    return {
      type: 'category',
      slug: normalizedSlug,
      canonicalUrl: `https://doctorcheck.vn/${normalizedSlug}/`,
      title: category.name,
      data: { category },
    };
  }

  // 7. Static / Clinical Pages
  const page = rootPageBySlug.get(normalizedSlug);
  if (page) {
    const fullPage = getPageBySlug(normalizedSlug);
    const resolvedTitle = fullPage?.title ? cleanTitle(fullPage.title) : page.title;
    return {
      type: 'page',
      slug: normalizedSlug,
      canonicalUrl: `https://doctorcheck.vn/${normalizedSlug}/`,
      title: resolvedTitle,
      data: { page, pageContent: fullPage },
    };
  }

  // 8. 404 Fallback
  return {
    type: 'notFound',
    slug: normalizedSlug,
    canonicalUrl: `https://doctorcheck.vn/${normalizedSlug}/`,
    title: '404 - Không Tìm Thấy Trang',
  };
}

/**
 * RESOLVE MULTI-SEGMENT SUBPATHS UNDER ENDOSCOPY HUB
 */
export function resolveEndoscopySubpath(segments: string[]): ResolvedContent {
  const subpath = segments.join('/');
  const page = nestedPageBySubpath.get(subpath);

  if (page) {
    const fullPage = getPageBySlug(page.slug);
    const resolvedTitle = fullPage?.title ? cleanTitle(fullPage.title) : page.title;
    return {
      type: 'page',
      slug: page.slug,
      canonicalUrl: `https://doctorcheck.vn${page.path}`,
      title: resolvedTitle,
      data: { page, pageContent: fullPage },
    };
  }

  return {
    type: 'notFound',
    slug: subpath,
    canonicalUrl: `https://doctorcheck.vn/trung-tam-noi-soi-tieu-hoa-doctor-check/${subpath}/`,
    title: '404 - Không Tìm Thấy Trang',
  };
}

/**
 * GET ALL CANONICAL STATIC SLUGS FOR PRE-RENDERING
 */
export function getAllRootSlugs(): string[] {
  const slugs = new Set<string>();

  // Articles (108)
  articlesCatalog.forEach((a) => slugs.add(a.slug));
  // Categories (30)
  categoriesData.forEach((c) => slugs.add(c.slug));
  // Packages (9)
  allPackagesList.forEach((p) => slugs.add(p.slug));
  // Root Pages (32 distinct, excluding collided drafts which are articles)
  staticPagesData
    .filter((p) => p.isRoot && !p.slug.includes('/') && p.slug !== '')
    .forEach((p) => {
      // If not redirect and not collision post
      if (!getLegacyRedirect(p.slug) && !POST_COLLISION_SLUGS.has(p.slug)) {
        slugs.add(p.slug);
      }
    });

  return Array.from(slugs);
}
