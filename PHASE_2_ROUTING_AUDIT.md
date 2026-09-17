# Phase 2 Routing & URL Migration Comprehensive Audit

**Target Website:** [DoctorCheck.vn](https://doctorcheck.vn/)  
**Document Code:** `PHASE_2_ROUTING_AUDIT.md`  
**Date:** 2026-09-15  
**Phase:** PHASE 2 — DOCTORCHECK URL & ROUTING MIGRATION  
**Audit Status:** **PASS**

---

## 1. Route Architecture

The migration strictly honors the flat/root-level URL namespace utilized by the original WordPress installation. Artificial routing segments such as `/blog/[slug]`, `/services/[slug]`, or `/doctors/[slug]` have been **completely prevented**.

### Architecture Overview:
- `src/app/page.tsx`: High-converting Homepage (`/`).
- `src/app/[slug]/page.tsx`: Unified dynamic root route powered by the deterministic resolution layer.
- `src/app/doctor/[slug]/page.tsx`: Preserves authentic WordPress singular `/doctor/[slug]/` URL structure for physician credentials.
- `src/app/trung-tam-noi-soi-tieu-hoa-doctor-check/[...subpath]/page.tsx`: Handles the 18 multi-segment clinical endoscopy hub subpages.
- `src/app/api/booking/route.ts`: Patient appointment submission API.
- `src/app/sitemap.ts` & `src/app/robots.ts`: Dynamic metadata routes.

---

## 2. Root Slug Resolver

Centralized resolution layer implemented in:
- `src/lib/routing/route-types.ts`
- `src/lib/routing/redirects.ts`
- `src/lib/routing/pages-data.ts`
- `src/lib/routing/resolve-content.ts`

### Deterministic Priority Strategy:
1. **Exact Legacy 301 Redirects:** Checked first. If matched, returns permanent redirect target.
2. **Explicit Collision Overrides:**
   - Slugs `dau-thuong-vi`, `tieu-chay`, `di-ngoai-ra-mau`, `tao-bon` resolve to **Article (Post)**.
   - Slugs `kien-thuc-ung-thu-da-day`, `kien-thuc-ung-thu-dai-trang` resolve to **Category** at root level.
3. **WooCommerce Products (Packages):** 9 authentic packages mapped to `PackageTemplate`.
4. **Doctor Single Profiles:** 7 physician profiles mapped to `DoctorTemplate` (with root fallback redirecting to `/doctor/[slug]/`).
5. **Medical Knowledge Articles:** 108 authentic articles mapped to `ArticleTemplate`.
6. **Category Taxonomies:** 30 authentic category archives mapped to `CategoryTemplate`.
7. **Static / Clinical Pages:** 32 distinct root pages mapped to `PageTemplate`.
8. **404 Fallback:** Triggers Next.js native `notFound()` returning HTTP 404 status.

---

## 3. URL Inventory

Discovered vs Public User-Facing URL reconciliation:
- **Total Discovered URLs:** 226
- **Flatsome Internal UX Blocks (Excluded):** 21
- **Public User-Facing URLs:** **205**

### Reconciled Public Breakdown:
- **WordPress Pages (Distinct):** 51
- **WordPress Posts (Articles):** 108
- **WooCommerce Products (Packages):** 9
- **Doctor Profiles:** 7
- **Category Taxonomies:** 30
- **Total:** **205 URLs** (100% accounted for in `URL_MIGRATION_MATRIX.md`).

---

## 4. Redirects

Implemented in `next.config.ts` using permanent HTTP 301 semantics:
1. `/ve-chung-toi/` -> `/ve-doctor-check/` (301)
2. `/bang-gia-dich-vu/` -> `/bang-gia-dich-vu-tam-soat-benh-tai-doctor-check/` (301)
3. `/bang-gia-kham-suc-khoe-tong-quat/` -> `/bang-gia-dich-vu-tam-soat-benh-tai-doctor-check/` (301)
4. `/trung-tam-noi-soi-tieu-hoa/` -> `/trung-tam-noi-soi-tieu-hoa-doctor-check/` (301)
5. `/goi-ung-thu-da-day/` -> `/tam-soat-ung-thu-da-day/` (301)
6. `/goi-kham-danh-cho-nam/` -> `/goi-tam-soat-nam/` (301)
7. `/goi-kham-danh-cho-nu/` -> `/goi-tam-soat-nu/` (301)
8. `/bang-gia-kham-tong-quat/` -> `/bang-gia-dich-vu-tam-soat-benh-tai-doctor-check/` (301)
9. `/bang-gia-kham-tong-quat-new/` -> `/bang-gia-dich-vu-tam-soat-benh-tai-doctor-check/` (301)
10. `/trung-tam-noi-soi-tieu-hoa/bang-gia-noi-soi-da-day/` -> `/bang-gia-dich-vu-tam-soat-benh-tai-doctor-check/` (301)

Redirect loops and chains were verified to be **zero**. Every redirect points directly to its final destination.

---

## 5. Canonical URLs

Every public page serves exactly one canonical URL via `generateMetadata`:
- Protocol: `https://`
- Domain: `doctorcheck.vn`
- Trailing slash: Enforced on all canonical tags.
- Pointing exclusively to final destinations, never to 301 redirects, 404s, or staging URLs.

---

## 6. Trailing Slash

- Enforced in `next.config.ts` via `trailingSlash: true`.
- All Next.js routes automatically serve with trailing slashes, matching WordPress URLs exactly without duplicate indexable variants.

---

## 7. Sitemap

- Implemented via `src/app/sitemap.ts`.
- Serves strictly **197 canonical indexable public URLs** (205 public URLs minus the 8 consolidated 301 redirects).
- Excludes API routes, admin paths, draft content, redirects, 404s, and internal UX blocks.

---

## 8. Robots

- Implemented via `src/app/robots.ts`.
- Allows crawling of all public routes: `allow: '/'`.
- Restricts internal endpoints: `disallow: ['/api/', '/_next/', '/admin/']`.
- Directs search engines to authoritative sitemap: `https://doctorcheck.vn/sitemap.xml`.

---

## 9. Collision Tests

Automated tests in `scratch/test_routes.mjs` executed via `tsx`:
- `dau-thuong-vi`: **PASS** (Resolved to Article ID 3622)
- `tieu-chay`: **PASS** (Resolved to Article ID 3773)
- `di-ngoai-ra-mau`: **PASS** (Resolved to Article ID 3750)
- `tao-bon`: **PASS** (Resolved to Article ID 3797)
- `kien-thuc-ung-thu-da-day`: **PASS** (Root resolved to Category ID 47; Nested resolved to Page ID 4868)
- `kien-thuc-ung-thu-dai-trang`: **PASS** (Root resolved to Category ID 48; Nested resolved to Page ID 4860)

Total Collision Tests: **6/6 PASSED (100%)**.

---

## 10. 404 Tests

- Unknown slugs (e.g. `/non-existent-random-url-xyz/`) resolve to `notFound` and trigger Next.js `notFound()`, returning HTTP 404.
- Automated test result: **PASS**.

---

## 11. Build Results

Command sequence executed:
1. `npx tsc --noEmit`: **0 errors** (Clean).
2. `npm run lint`: **0 errors, 0 warnings** (Clean).
3. `npm run build`: **Successfully generated all 206 static pages** in 3.0s via Turbopack.

---

## 12. Remaining Blockers

- **Zero routing blockers.**
- Note for Phase 3 (Content Body Migration): Article body HTML content remains cataloged at the metadata level, ready for full CMS rich-text import in Phase 3.
