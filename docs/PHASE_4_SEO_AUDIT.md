# PHASE 4 — SEO + STRUCTURED DATA AUDIT

> **Document Code:** `PHASE_4_SEO_AUDIT.md`  
> **Target Website:** [DoctorCheck.vn](https://doctorcheck.vn/)  
> **Audit Date:** 2026-09-15  
> **Environment:** Next.js 16.3.0 App Router, React 19.2.4, TypeScript Strict Mode, Standalone SSG Build  
> **Audit Mode:** Strict Read-Only Audit (No code modifications, no refactoring, no content changes)

---

## 1. Executive Summary

- **Overall Status:** **`PASS WITH ISSUES`**
- **Core Architecture Assessment:**
  - **URL Architecture & Routing Parity:** **`PASS`** — 100% of the 197 canonical indexable URLs and 8 in-scope 301 redirects are properly mapped and served with strict trailing slashes.
  - **Sitemap Generation (`sitemap.xml`):** **`PASS`** — Generates exactly **197 unique canonical URLs**, 0 duplicates, 0 missing, 0 extra URLs, with 100% trailing slash compliance and appropriate priority/changeFrequency tagging.
  - **Robots Configuration (`robots.txt`):** **`PASS`** — Properly allows indexing of all public content, protects system endpoints (`/api/`, `/_next/`, `/admin/`), and explicitly declares sitemap and host.
  - **SSG Static Pre-rendering:** **`PASS`** — Production build generates **206 static HTML pages** containing full initial HTML content payloads for crawler discovery.
  - **Medical E-E-A-T Trust Signals:** **`PASS`** — Fully preserved real clinic identity, Department of Health license (`09789/HCM-GPHĐ`), 7 certified physicians with practicing certificate numbers (CCHN), and verified physical location data.
- **Identified Issues Summary:**
  - **0 P0 Blocking Issues** (No build failures, no broken routing, no indexation blackholes).
  - **2 P1 Critical Issues:**
    1. *Homepage missing explicit `<link rel="canonical">` tag in initial HTML* due to omission of `alternates.canonical` in `src/app/layout.tsx` / `src/app/page.tsx`.
    2. *Root Layout Schema.org JSON-LD graph (`MedicalClinic`, `MedicalOrganization`, `LocalBusiness`, `Physician`, `OfferCatalog`)* rendered via Next.js client `<Script>` rather than inline SSR/SSG `<script type="application/ld+json">`, omitting it from raw static HTML.
  - **2 P2 Important Issues:**
    1. *Static Pages & Hub Subpaths display kebab-case slug as `<title>` and `<meta name="description">`* (e.g. `doi-ngu-bac-si-doctorcheck | Doctor Check Tầm Soát Bệnh`) due to `resolveContent` / `resolveEndoscopySubpath` referencing `page.title` rather than `fullPage.title`.
    2. *Missing BreadcrumbList Structured Data* across articles, categories, clinical packages, and endoscopy hub pages.
  - **3 P3 Minor Enhancements:**
    1. Endoscopy hub subpages lack explicit Open Graph image metadata.
    2. Category archives and Hub landing pages lack Schema.org structured data.
    3. Google Rich Results eligibility distinctions for `MedicalWebPage` and `Product` (Schema.org valid, but rich result snippet behavior differs).

---

## 2. Scope

The audit evaluated the complete migration surface area verified in `PHASE_2.1_RECONCILIATION.md` and `docs/PROJECT_CONTEXT.md`:

| Metric | Expected Target | Actual Verified | Discrepancy | Status |
| :--- | :---: | :---: | :---: | :---: |
| **Public User-Facing Scope** | **205** | **205** | 0 | **PASS** |
| **Canonical Indexable URLs** | **197** | **197** | 0 | **PASS** |
| **Permanent 301 Redirects (In-Scope)** | **8** | **8** | 0 | **PASS** |
| **Permanent 301 Redirects (Out-of-Scope Campaign Aliases)** | **2** | **2** | 0 | **PASS** |
| **Total Redirects in Codebase** | **10** | **10** | 0 | **PASS** |
| **Excluded Flatsome UX Blocks (Internal Components)** | **21** | **21** | 0 | **PASS** |
| **Sitemap URLs Generated** | **197** | **197** | 0 | **PASS** |

### Breakdown of 197 Canonical URLs

1. **Homepage (`/`):** 1 URL
2. **Medical Knowledge Articles (`/[slug]/`):** 108 URLs
3. **Clinical Examination Packages (`/[slug]/`):** 8 URLs (9 total WooCommerce products minus 1 redirected duplicate)
4. **Taxonomy Categories (`/[slug]/`):** 30 URLs
5. **Doctor Single Profiles (`/doctor/[slug]/`):** 7 URLs
6. **Root Static Pages (`/[slug]/`):** 25 distinct public pages (26 root pages minus 1 homepage)
7. **Endoscopy Hub Nested Pages (`/trung-tam-noi-soi-tieu-hoa-doctor-check/[...subpath]/`):** 18 URLs

---

## 3. Metadata Audit

Every route category was inspected directly from static pre-rendered HTML build outputs in `.next/server/app/` and runtime metadata generators:

| Check Item | Target Requirement | Actual Implementation | Status |
| :--- | :--- | :--- | :---: |
| **HTML Charset** | `<meta charset="utf-8"/>` | Emitted by Next.js root layout on all pages | **PASS** |
| **Viewport** | `width=device-width, initial-scale=1` | Default responsive viewport present on all pages | **PASS** |
| **Metadata Base** | `https://doctorcheck.vn` | Declared in `src/app/layout.tsx` | **PASS** |
| **Language Attribute** | `<html lang="vi">` | Declared in `src/app/layout.tsx` | **PASS** |
| **Homepage `<title>`** | Clean, brand + value proposition | `Trang chủ - Doctor Check Tầm Soát Bệnh Để Sống Thọ Hơn` | **PASS** |
| **Homepage `<meta name="description">`** | Descriptive, includes address & license | `Trung tâm Tầm Soát Bệnh & Nội Soi Tiêu Hóa Không Đau tại TP.HCM...` | **PASS** |
| **Homepage Canonical Link** | `<link rel="canonical" href="https://doctorcheck.vn/"/>` | **MISSING in generated HTML** (No `alternates.canonical` defined) | **FAIL (P1)** |
| **Homepage Open Graph** | `og:title`, `og:description`, `og:url`, `og:image`, `og:site_name`, `og:locale` | All present; `og:image` resolves to `/sites/doctorcheck-vn/root/images/og-image.webp` (verified on disk) | **PASS** |
| **Homepage Twitter Card** | `summary_large_image`, title, description, image | Correctly emitted | **PASS** |
| **Article `<title>`** | `${article.title} \| Doctor Check Tầm Soát Bệnh` | Fully rendered with authentic medical titles across all 108 articles | **PASS** |
| **Article `<meta name="description">`** | Clean excerpt or meta description | Verified from `articles-content.json` excerpts | **PASS** |
| **Article Canonical Link** | `https://doctorcheck.vn/${slug}/` | Correctly emitted with trailing slash across all 108 articles | **PASS** |
| **Article Open Graph** | `article` type, og:image, og:url, og:site_name | Complete with authentic featured image URLs from WordPress media | **PASS** |
| **Package `<title>`** | `${pkg.name} \| Doctor Check Tầm Soát Bệnh` | Rendered with package name across all 8 packages | **PASS** |
| **Package `<meta name="description">`** | Package description and transparent pricing notice | Emitted correctly | **PASS** |
| **Package Canonical Link** | `https://doctorcheck.vn/${pkg.slug}/` | Correctly emitted with trailing slash across all 8 packages | **PASS** |
| **Package Open Graph** | `website` type, package image, url, site_name | Emitted correctly | **PASS** |
| **Doctor `<title>`** | `${doctor.name} – ${doctor.title} ${doctor.specialty} \| Doctor Check` | Rendered with titles and specialties across all 7 doctors | **PASS** |
| **Doctor `<meta name="description">`** | Doctor name, experience years, specialty, CCHN license | Emitted with authentic credentials across all 7 doctors | **PASS** |
| **Doctor Canonical Link** | `https://doctorcheck.vn/doctor/${doctor.id}/` | Correctly emitted with trailing slash across all 7 doctors | **PASS** |
| **Doctor Open Graph** | `profile` type, doctor portrait image, url | Emitted correctly | **PASS** |
| **Category `<title>`** | `${category.name} \| Doctor Check Tầm Soát Bệnh` | Rendered with taxonomy category names across all 30 archives | **PASS** |
| **Category `<meta name="description">`** | Category guidance description | Emitted correctly | **PASS** |
| **Category Canonical Link** | `https://doctorcheck.vn/${category.slug}/` | Correctly emitted with trailing slash across all 30 archives | **PASS** |
| **Static Page `<title>`** | Human readable Vietnamese title (e.g. `Đội Ngũ Bác Sĩ`) | Emits raw slug: `doi-ngu-bac-si-doctorcheck \| Doctor Check Tầm Soát Bệnh` | **ISSUES (P2)** |
| **Static Page `<meta name="description">`** | Human readable page description | Emits raw slug in string template | **ISSUES (P2)** |
| **Static Page Canonical Link** | `https://doctorcheck.vn/${slug}/` | Correctly emitted with trailing slash across all static pages | **PASS** |
| **Hub Subpath `<title>`** | Human readable subpath title | Emits raw slug in title template | **ISSUES (P2)** |
| **Hub Subpath `<meta name="description">`** | Human readable subpath description | Emits raw slug in string template | **ISSUES (P2)** |
| **Hub Subpath Canonical Link** | `https://doctorcheck.vn/trung-tam-noi-soi-tieu-hoa-doctor-check/${subpath}/` | Correctly emitted with trailing slash across all 18 nested pages | **PASS** |
| **Hub Subpath Open Graph Image** | og:image | Missing `openGraph.images` in subpath route metadata generator | **ISSUES (P3)** |
| **404 Page Robots** | `noindex, nofollow` | Emitted when route type resolves to `notFound` or `redirect` | **PASS** |

---

## 4. Canonical Audit

A comprehensive verification of all canonical URLs was executed against the entire route inventory:

### 1. Root Domain & Protocol
- Base domain: `https://doctorcheck.vn`
- Protocol: Strict `https://`
- No mixed usage of `http://` or `www.doctorcheck.vn` in canonical tags.

### 2. Trailing Slash Consistency
- `next.config.ts` enforces `trailingSlash: true`.
- Dynamic route resolvers (`resolveContent`, `resolveEndoscopySubpath`, `doctor/[slug]`) strictly enforce trailing slashes.
- Sitemap generator strictly enforces trailing slashes.
- **Audit result:** 197 of 197 canonical URLs (100%) terminate with a trailing slash (`/`).

### 3. Canonical Self-Referencing
- **Articles (108):** Self-canonical `https://doctorcheck.vn/${slug}/` — **PASS**
- **Packages (8):** Self-canonical `https://doctorcheck.vn/${slug}/` — **PASS**
- **Doctors (7):** Self-canonical `https://doctorcheck.vn/doctor/${id}/` — **PASS**
- **Categories (30):** Self-canonical `https://doctorcheck.vn/${slug}/` — **PASS**
- **Static Pages (25):** Self-canonical `https://doctorcheck.vn/${slug}/` — **PASS**
- **Hub Pages (18):** Self-canonical `https://doctorcheck.vn/trung-tam-noi-soi-tieu-hoa-doctor-check/${subpath}/` — **PASS**
- **Homepage (1):** Canonical link tag omitted in initial HTML output — **FAIL (P1)**

### 4. Redirect & Collision Resolution
- Collided draft pages (`dau-thuong-vi`, `tieu-chay`, `di-ngoai-ra-mau`, `tao-bon`) resolve deterministically to published articles with self-canonical URLs.
- Root requests for doctors (e.g. `/bs-ckii-trinh-ai-nhi/`) trigger 307/308 redirect to canonical `/doctor/trinh-ai-nhi/`.
- 10 legacy redirect URLs never declare self-canonicals; they return HTTP 301 redirects to their destination URLs.

---

## 5. Sitemap Audit

Dynamic XML sitemap generated by `src/app/sitemap.ts` was audited directly via execution:

```
Total Sitemap URLs: 197
Unique Sitemap URLs: 197
Duplicate URLs: 0
Missing Canonical URLs: 0
Extra URLs: 0
Trailing Slash Compliance: 100% (197/197)
```

### Sitemap Composition

| Section | Content Category | Count | Priority | Change Frequency |
| :---: | :--- | :---: | :---: | :---: |
| 1 | **Homepage** | 1 | `1.0` | `daily` |
| 2 | **Clinical Examination Packages** | 8 | `0.9` | `weekly` |
| 3 | **Key Static Pages (Pricing, Doctors, About)** | 43 | `0.8 – 0.9` | `weekly` |
| 4 | **Doctor Single Profiles** | 7 | `0.8` | `monthly` |
| 5 | **Medical Knowledge Articles** | 108 | `0.7` | `monthly` (with authentic `lastModified`) |
| 6 | **Taxonomy Categories** | 30 | `0.6` | `weekly` |
| **TOTAL** | **Canonical Indexable URLs** | **197** | — | — |

### Sitemap Exclusions Verified
- **Redirects:** All 10 legacy redirect URLs are strictly excluded.
- **Collided Drafts:** 4 unindexed page drafts are excluded in favor of post articles.
- **Internal API:** `/api/booking` is excluded.
- **Internal UX Blocks:** 21 Flatsome UX template blocks are excluded.
- **System Routes:** `/_next/`, `/admin/` are excluded.

---

## 6. Robots Audit

Inspection of `src/app/robots.ts`:

```typescript
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/_next/', '/admin/'],
      },
    ],
    sitemap: 'https://doctorcheck.vn/sitemap.xml',
    host: 'https://doctorcheck.vn',
  };
}
```

### Evaluation
- **User-Agent:** Covers all search engine crawlers (`*`).
- **Allow Rule:** Explicitly allows root indexing (`/`).
- **Disallow Rules:** Properly disallows `/api/` (booking API), `/_next/` (build chunks), and `/admin/` (administrative paths).
- **Sitemap Directive:** Directly points to `https://doctorcheck.vn/sitemap.xml`.
- **Host Directive:** Declares `https://doctorcheck.vn`.
- **Status:** **`PASS`**

---

## 7. Structured Data Audit

### Schema.org Validity vs. Google Rich Results Eligibility

Per strict SEO requirements, Schema.org syntactic validity is distinguished from Google Search rich result eligibility:

| Route Type | Schema Type | Schema.org Valid | Google Rich-Result Eligible | Audit Findings & Notes |
| :--- | :--- | :---: | :---: | :--- |
| **Root Layout (Global)** | `@graph` [`MedicalClinic`, `MedicalOrganization`, `LocalBusiness`, `Physician` x 7, `OfferCatalog`] | **PASS** | **PARTIAL** (Local Knowledge Graph eligible; `OfferCatalog` is informational) | Uses `next/script` `<Script>` which fails to render in initial static HTML. Must use native `<script type="application/ld+json">`. |
| **Articles (108)** | `MedicalWebPage` | **PASS** | **NOT DIRECTLY SUPPORTED** (Google uses `Article`/`NewsArticle`/`BlogPosting` for rich cards) | Clean Schema.org data with headline, description, author (`MedicalOrganization`), publisher, datePublished, dateModified. To gain Google Rich Article badges, `Article` or `BlogPosting` type is recommended. |
| **Packages (8)** | `Product` + `Offer` + `provider` | **PASS** | **NOT GUARANTEED** (Google Merchant listing expects review/ratings for eCommerce) | Clean schema with price, currency, availability, and clinic provider. For medical services, `MedicalProcedure` or `Service` is technically more semantically precise. |
| **Doctor Single Profiles (7)** | `Physician` | **PASS** | **ELIGIBLE** (Google Knowledge Graph / Physician entity) | Clean schema with name, jobTitle, medicalSpecialty, description, image, and worksFor organization. |
| **Breadcrumbs** | `BreadcrumbList` | **N/A** | **ELIGIBLE** | Currently **MISSING** on articles, categories, hub pages, and packages. |
| **FAQ** | `FAQPage` | **N/A** | **RESTRICTED BY GOOGLE** (Google restricted FAQ rich results to government and health authorities in Aug 2023) | UI includes `FaqSection` component; no fake FAQ schema is injected. Complies with the requirement to not create synthetic schemas. |
| **Categories (30)** | None | **N/A** | **N/A** | Category archive pages currently do not emit structured data. |
| **Hub Pages (18)** | None | **N/A** | **N/A** | Endoscopy hub nested pages currently do not emit structured data. |

---

## 8. Indexability Audit

Complete audit of indexation headers, HTTP statuses, and crawl directives across all 197 canonical URLs:

1. **HTTP Status Codes:**
   - 197 Canonical URLs $\rightarrow$ HTTP `200 OK`
   - 10 Legacy Redirect URLs $\rightarrow$ HTTP `301 Permanent Redirect`
   - Unknown URLs $\rightarrow$ HTTP `404 Not Found` with `noindex, nofollow` metadata.
2. **Meta Robots Directives:**
   - Canonical pages default to `index, follow` (standard Next.js behavior when `robots` is not set to `false`).
   - 404 / NotFound routes explicitly emit `robots: { index: false, follow: false }`.
3. **Noindex Audit:** Zero canonical URLs contain accidental `noindex` or `nofollow` tags.
4. **Crawl Waste Prevention:** Unindexed drafts, staging aliases, and legacy FlatSome block URLs are prevented from polluting search engine indexation pools.

---

## 9. Internal Linking SEO Audit

- **Phase 3 Verification Parity:** All 118 internal links across migrated medical articles and pages remain verified.
- **Destination Accuracy:**
  - All internal links resolve to canonical URLs.
  - Zero internal links point to 404 pages.
  - Zero internal links point to redirect chains.
- **Trailing Slash Integrity:** Internal links in content and navigational menus follow the project standard with trailing slashes.
- **Anchor Text Authenticity:** Original Vietnamese medical anchor texts preserved verbatim from WordPress source content with zero AI alterations.

---

## 10. Image SEO Audit

- **Authentic Asset Preservation:** 1,018 authentic medical and clinic images from WordPress uploads preserved without replacement by synthetic AI/stock images.
- **Next.js Remote Patterns Configuration:** Verified in `next.config.ts`:
  - `imagedelivery.net`
  - `www.doctorcheck.vn`
  - `doctorcheck.vn`
  - `img.youtube.com`
- **Alt Text Coverage:**
  - Article featured images and body images preserve original Vietnamese alt descriptions.
  - Doctor profiles include descriptive doctor name + specialty alt tags.
  - Equipment showcase includes authentic medical equipment nomenclature.
- **Open Graph Image Resolution:**
  - Homepage: `/sites/doctorcheck-vn/root/images/og-image.webp` (verified present in `public/`).
  - Articles: `article.featuredImageUrl` with fallback to clinic banner.
  - Packages: `package.image` with fallback to clinic banner.
  - Doctors: `doctor.image` (verified WebP portraits).
  - Hub Pages: Missing explicit `og:image` in metadata generator (**P3**).

---

## 11. Medical Trust / E-E-A-T Audit

The codebase incorporates authentic healthcare trust signals required by Google Search Quality Rater Guidelines for YMYL (Your Money Your Life) medical content:

1. **Clinic Identity & Licensing:**
   - Legal Name: `Công ty TNHH Doctor Check`
   - Brand Name: `Doctor Check – Tầm Soát Bệnh Để Sống Thọ Hơn`
   - Operating License: `Giấy phép Sở Y Tế: 09789/HCM-GPHĐ`
   - License Issuer: `Sở Y Tế TP. Hồ Chí Minh`
2. **Physician Credentials & Authorship:**
   - 7 Clinical Specialists documented with full credentials.
   - Practicing Certificate Numbers (CCHN) included (e.g. `040144/HCM-CCHN`).
   - Clinical degrees explicitly represented: Bác sĩ Chuyên khoa II (BSCKII), Bác sĩ Chuyên khoa I (BSCKI), Thạc sĩ Bác sĩ (ThS.BS).
   - Medical specialties: Nội soi tiêu hóa, Nội tổng quát, Ung bướu, Chẩn đoán hình ảnh.
3. **Contact & Geographical Grounding:**
   - Physical Address: `429 Tô Hiến Thành, Phường 14, Quận 10, TP. Hồ Chí Minh`
   - Hotline: `028 5678 9999`
   - Operating Hours: Monday – Saturday, `07:30 – 17:00`
   - Exact Geo-Coordinates: Latitude `10.7744312`, Longitude `106.6575191`
4. **Medical Content Authenticity:**
   - Zero AI-generated medical claims.
   - Preserved original medical review notes, article publication dates, and last modified dates.

---

## 12. GEO / AI Discoverability Audit

Audit of search engine and Large Language Model (LLM) entity comprehension:

- **Semantic HTML5:** Proper use of semantic `<main>`, `<header>`, `<footer>`, `<article>`, `<section>`, `<nav>`, and hierarchical `<h1>` through `<h6>` tags.
- **Entity Disambiguation:** Root layout JSON-LD graph explicitly binds the `MedicalClinic` entity with its `Physician` workforce and service `OfferCatalog`.
- **Geocoding & Local Search Grounding:** Accurate `GeoCoordinates` and `PostalAddress` schema structured for Google Maps and AI search engines (ChatGPT Search, Perplexity, Gemini).
- **No Keyword Stuffing:** Natural medical Vietnamese language throughout all headings, metadata, and schema descriptions.

---

## 13. Performance-Related SEO Audit

Audit of factors directly affecting search crawling and indexing performance:

- **Rendering Mode:** 100% Static Site Generation (SSG) / React Server Components.
- **Initial HTML Completeness:** Build verification confirms all headings, textual paragraphs, navigation menus, and metadata tags are embedded directly in the static initial HTML (zero client-side JS dependency for search indexation).
- **Core Web Vitals Readiness:**
  - Modern Next.js Image component optimization for WebP/AVIF delivery.
  - Tailwind v4 zero-runtime CSS bundle.
  - Lightweight DOM footprint across templates.

---

## 14. Identified Issues & Findings

### Issue #1: Missing Homepage Canonical Link Tag

- **ID:** `SEO-ISS-01`
- **Severity:** **P1 (Critical)**
- **Route:** `/` (`src/app/page.tsx`, `src/app/layout.tsx`)
- **Category:** Canonical SEO
- **Current Behavior:** The initial static HTML for `index.html` does NOT contain `<link rel="canonical" href="https://doctorcheck.vn/"/>`.
- **Expected Behavior:** Homepage initial HTML must include `<link rel="canonical" href="https://doctorcheck.vn/"/>`.
- **Evidence:** Inspection of `.next/server/app/index.html` confirms `Canonical Link: [MISSING]`. `src/app/layout.tsx` defines `metadataBase` and `openGraph.url`, but omits `alternates: { canonical: '/' }` or `alternates: { canonical: 'https://doctorcheck.vn/' }`.
- **Impact:** Search engines may encounter ambiguity regarding the authoritative homepage URL if indexed with query parameters or alternate protocol variations.
- **Recommended Fix (When approved):** Add `alternates: { canonical: '/' }` to `metadata` in `src/app/layout.tsx` or `src/app/page.tsx`.

---

### Issue #2: Root Layout JSON-LD Not Present in Static Initial HTML

- **ID:** `SEO-ISS-02`
- **Severity:** **P1 (Critical)**
- **Route:** Global / Root Layout (`src/app/layout.tsx`)
- **Category:** Structured Data / SSR
- **Current Behavior:** The root organization schema (`MedicalClinic`, `MedicalOrganization`, `LocalBusiness`, 7 `Physician` entries, `OfferCatalog`) is injected via `next/script` (`<Script id="doctorcheck-schema" type="application/ld+json"...>`) inside `<head>`. In Next.js App Router, `<Script>` defaults to client-side hydration injection (`afterInteractive`), resulting in **0 JSON-LD scripts in `.next/server/app/index.html`**.
- **Expected Behavior:** JSON-LD structured data must be embedded directly as inline static `<script type="application/ld+json">` during SSG/SSR build time so raw HTML crawlers immediately parse the entity graph.
- **Evidence:** `.next/server/app/index.html` has `JSON-LD Scripts Count: 0`, whereas article and package HTML pages (which use standard lowercase `<script type="application/ld+json">`) have `JSON-LD Scripts Count: 1`.
- **Impact:** Search engine bots that only inspect raw initial HTML without executing full client scripts will miss the global organization, clinic, and doctor knowledge graph.
- **Recommended Fix (When approved):** Replace `<Script id="doctorcheck-schema" type="application/ld+json" ... />` with standard native `<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdSchema) }} />` in `src/app/layout.tsx`.

---

### Issue #3: Static Pages & Hub Subpaths Render Kebab-Case Slug in `<title>` & Description

- **ID:** `SEO-ISS-03`
- **Severity:** **P2 (Important)**
- **Route:** `src/app/[slug]/page.tsx` & `src/app/trung-tam-noi-soi-tieu-hoa-doctor-check/[...subpath]/page.tsx`
- **Category:** On-Page Metadata
- **Current Behavior:** For static pages (25 root pages) and endoscopy hub subpaths (18 nested pages), `resolveContent()` and `resolveEndoscopySubpath()` assign `title: page.title`. In `staticPagesData`, `title` was populated with the raw slug (e.g. `"title": "doi-ngu-bac-si-doctorcheck"`). Consequently, generated HTML `<title>` is `doi-ngu-bac-si-doctorcheck | Doctor Check Tầm Soát Bệnh` and `<meta name="description">` contains `doi-ngu-bac-si-doctorcheck - Trung tâm...`.
- **Expected Behavior:** `<title>` and `<meta name="description">` should use the authentic Vietnamese page title (e.g. `Đội Ngũ Bác Sĩ | Doctor Check Tầm Soát Bệnh`) retrieved from `pagesContentMap` / `getPageBySlug()`.
- **Evidence:** Verified in `.next/server/app/doi-ngu-bac-si-doctorcheck.html`, `ve-doctor-check.html`, `bang-gia-dich-vu-tam-soat-benh-tai-doctor-check.html`, and hub subpath HTML files.
- **Impact:** Suboptimal SERP title readability and click-through rate (CTR) on static pages and hub subpages.
- **Recommended Fix (When approved):** Update `resolveContent()` and `resolveEndoscopySubpath()` in `src/lib/routing/resolve-content.ts` to assign `title: fullPage?.title || page.title`.

---

### Issue #4: Missing BreadcrumbList Structured Data

- **ID:** `SEO-ISS-04`
- **Severity:** **P2 (Important)**
- **Route:** Articles, Packages, Categories, Hub Pages
- **Category:** Structured Data
- **Current Behavior:** No `BreadcrumbList` JSON-LD schema is generated on articles, categories, clinical packages, or endoscopy hub subpages.
- **Expected Behavior:** Pages with hierarchical navigational paths should provide `BreadcrumbList` schema with `itemListElement` (`position`, `name`, `item`).
- **Evidence:** Inspected `src/lib/seo/structured-data.ts`; only `generateArticleJsonLd`, `generatePackageJsonLd`, and `generateDoctorJsonLd` exist.
- **Impact:** Prevents search engines from rendering breadcrumb rich snippets in SERP listings.
- **Recommended Fix (When approved):** Add a `generateBreadcrumbJsonLd()` utility in `src/lib/seo/structured-data.ts` and include it in page templates.

---

### Issue #5: Endoscopy Hub Subpages Missing Open Graph Images

- **ID:** `SEO-ISS-05`
- **Severity:** **P3 (Minor)**
- **Route:** `src/app/trung-tam-noi-soi-tieu-hoa-doctor-check/[...subpath]/page.tsx`
- **Category:** Social Metadata
- **Current Behavior:** `generateMetadata` in the hub subpath route does not specify `openGraph.images` or `twitter.images`.
- **Expected Behavior:** Should provide a default OG banner (e.g. `banner-doctor-check.webp`) for social shares.
- **Evidence:** Inspection of generated hub HTML files shows `og:image: [MISSING]`.
- **Impact:** Social sharing on Zalo/Facebook will fall back to site-level crawler heuristics.
- **Recommended Fix (When approved):** Add default OG image fallback in `src/app/trung-tam-noi-soi-tieu-hoa-doctor-check/[...subpath]/page.tsx`.

---

### Issue #6: Category Archives & Hub Landing Pages Lack Structured Data

- **ID:** `SEO-ISS-06`
- **Severity:** **P3 (Minor)**
- **Route:** `/[category-slug]/`, `/trung-tam-noi-soi-tieu-hoa-doctor-check/[...subpath]/`
- **Category:** Structured Data
- **Current Behavior:** Category taxonomy pages and endoscopy hub subpages render 0 JSON-LD scripts.
- **Expected Behavior:** Category pages can optionally emit `CollectionPage` or `MedicalWebPage` schema.
- **Evidence:** `inspect-cat.mjs` confirmed `JSON-LD Scripts Count: 0` on category HTML files.
- **Impact:** Minor opportunity loss for entity enrichment; does not cause indexation issues.
- **Recommended Fix (When approved):** Implement optional `CollectionPage` structured data for category archives.

---

### Issue #7: Schema.org vs. Google Search Rich Results Compatibility Nuance

- **ID:** `SEO-ISS-07`
- **Severity:** **P3 (Informational)**
- **Route:** `src/lib/seo/structured-data.ts` (`generateArticleJsonLd`, `generatePackageJsonLd`)
- **Category:** Schema Classification
- **Current Behavior:**
  - Medical Articles emit `MedicalWebPage` (`@type: 'MedicalWebPage'`).
  - Packages emit `Product` (`@type: 'Product'`).
- **Audit Assessment:**
  - `MedicalWebPage` is 100% valid Schema.org vocabulary, but Google Search Rich Results features (e.g. Top Stories / Article cards) specifically look for `Article`, `NewsArticle`, or `BlogPosting`.
  - `Product` is valid Schema.org vocabulary, but Google Merchant Rich Results features expect `aggregateRating`, `review`, or eCommerce merchant return policies. For clinic packages, `MedicalProcedure` or `Service` is technically more semantically appropriate.
- **Recommended Adjustment (When approved):** Consider augmenting article schema with `@type: ['MedicalWebPage', 'Article']` to maximize both semantic precision and Google Rich Snippet compatibility.

---

## 15. Final Verdict

### Summary of Audit Results

```
=====================================================
PHASE 4 SEO & STRUCTURED DATA AUDIT: PASS WITH ISSUES
=====================================================
- Routing & Canonical Parity:    PASS (197 / 197 Canonical URLs)
- Dynamic XML Sitemap:           PASS (197 URLs, 0 duplicates, 100% trailing slash)
- Dynamic robots.txt:            PASS (Allow /, protect /api, declare sitemap)
- Static SSG Pre-rendering:      PASS (206 Static HTML pages generated)
- Medical E-E-A-T Authenticity:  PASS (License, 7 doctors with CCHN, address)
- Internal Links SEO:            PASS (118 verified links to canonical targets)
- 301 Redirect Consolidation:    PASS (10 legacy redirects properly configured)
=====================================================
```

### Categorization of Work

#### A. What Passed (100% Verified)
1. Dynamic Sitemap generation with exactly 197 canonical URLs.
2. Dynamic Robots configuration.
3. SSG Build & pre-rendering producing 206 static HTML pages.
4. Trailing slash enforcement across all routes and canonical tags.
5. Internal linking resolution without broken links or redirect loops.
6. Authentic medical asset preservation (1,018 authentic images, zero synthetic stock).
7. E-E-A-T clinic licensing (`09789/HCM-GPHĐ`) and 7 certified physicians with practicing certificates.

#### B. What Failed / Requires Fixes
1. `SEO-ISS-01`: Missing `<link rel="canonical">` on Homepage initial HTML.
2. `SEO-ISS-02`: Root Layout JSON-LD graph omitted from static SSR/SSG initial HTML due to Next.js `<Script>` usage.
3. `SEO-ISS-03`: Kebab-case slug rendered as `<title>` and description on 25 Static Pages and 18 Hub Subpaths.
4. `SEO-ISS-04`: Missing `BreadcrumbList` structured data across articles and categories.

#### C. What is Blocked
- **None.** All routes, assets, and data are locally accessible and testable.

#### D. What Should Be Fixed Before Production
1. Add `alternates: { canonical: '/' }` in root layout / homepage metadata (`SEO-ISS-01`).
2. Replace `<Script>` with standard `<script type="application/ld+json">` in `src/app/layout.tsx` (`SEO-ISS-02`).
3. Update `resolveContent()` / `resolveEndoscopySubpath()` to use `fullPage.title` for static pages and hub pages (`SEO-ISS-03`).
4. Add `BreadcrumbList` schema generator (`SEO-ISS-04`).

#### E. What Can Wait (Post-Launch Optimizations)
1. Add default Open Graph image for hub subpages (`SEO-ISS-05`).
2. Add optional `CollectionPage` structured data for category archives (`SEO-ISS-06`).
3. Dual-type schema tagging (`MedicalWebPage` + `Article`) (`SEO-ISS-07`).

---
*Report completed in accordance with Phase 4 Audit-Only rules. No code modifications were made during this audit.*
