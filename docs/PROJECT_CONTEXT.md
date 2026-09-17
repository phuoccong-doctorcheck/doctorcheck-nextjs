# DoctorCheck.vn — Project Context

> **Document Code:** `PROJECT_CONTEXT.md`
> **Created:** 2026-09-15
> **Purpose:** Permanent project memory / single source of truth for all AI agents.
> **Authority:** This document is derived from verified Phase reports and actual source code inspection. When this document conflicts with assumptions from an AI agent, the agent must inspect the actual source code and the latest Phase report before acting.

---

## 1. Project Objective

This project migrates **DoctorCheck.vn** from its existing **WordPress + WooCommerce + Flatsome** theme architecture to a modern **Next.js** application.

The migration preserves:

- **URL architecture** — Root-level WordPress URL namespace, no artificial `/blog/` or `/services/` prefixes
- **SEO equity** — Canonical URLs, 301 redirects for deprecated pages, sitemap, robots.txt
- **Medical content** — 108 articles migrated verbatim with zero AI rewriting
- **Internal links** — 118 verified internal links, all resolved to canonical destinations
- **Canonical URLs** — 197 unique canonical indexable URLs
- **Public taxonomy** — 30 categories preserved with original WordPress slugs
- **Legacy redirects** — 10 permanent 301 redirects for deprecated/duplicate URLs
- **Authentic images** — 1,018 images migrated from WordPress uploads
- **Existing functionality** — Booking API, pricing tables, doctor profiles, equipment showcase

**The goal is migration and modernization, not arbitrary redesign.**

---

## 2. Technology Stack

Verified from `package.json`, `tsconfig.json`, `next.config.ts`, `components.json`, and source code:

| Technology | Version / Detail | Source |
| :--- | :--- | :--- |
| **Next.js** | `16.3.0` | `package.json` |
| **React** | `19.2.4` | `package.json` |
| **React DOM** | `19.2.4` | `package.json` |
| **TypeScript** | `^5` (strict mode) | `package.json`, `tsconfig.json` |
| **Tailwind CSS** | `^4` (v4) | `package.json` devDependencies |
| **PostCSS** | `@tailwindcss/postcss ^4` | `postcss.config.mjs` |
| **shadcn/ui** | `^4.1.0` (base-nova style) | `package.json`, `components.json` |
| **Lucide React** | `^1.6.0` | `package.json` |
| **class-variance-authority** | `^0.7.1` | `package.json` |
| **clsx + tailwind-merge** | `^2.1.1` / `^3.5.0` | `package.json` |
| **Node.js** | `>=24` | `package.json` engines, `.nvmrc` |
| **ESLint** | `^9` with `eslint-config-next 16.3.0` | `eslint.config.mjs` |
| **Deployment target** | Standalone (`output: "standalone"`) | `next.config.ts` |

### Routing Architecture

- **App Router** (Next.js App Router with React Server Components)
- **Route files:**
  - `src/app/page.tsx` — Homepage (`/`)
  - `src/app/[slug]/page.tsx` — Unified root dynamic route (articles, categories, packages, pages)
  - `src/app/doctor/[slug]/page.tsx` — Doctor profiles (`/doctor/[slug]/`)
  - `src/app/trung-tam-noi-soi-tieu-hoa-doctor-check/[...subpath]/page.tsx` — Endoscopy hub (18 nested pages)
  - `src/app/api/booking/route.ts` — Patient appointment API
  - `src/app/sitemap.ts` — Dynamic XML sitemap (197 URLs)
  - `src/app/robots.ts` — Dynamic robots.txt

### Data / Content Architecture

- **Static data layer:** `src/lib/data/` — TypeScript modules exporting verified clinic, doctor, package, article, category, equipment, testimonial, and FAQ data
- **Content bodies:** `src/lib/content/data/articles-content.json` (1.6 MB, 108 articles) and `pages-content.json` (4.3 MB, 55 pages)
- **Content normalization:** `src/lib/content/normalize/` — `html-sanitizer.ts`, `link-normalizer.ts`, `toc-extractor.ts`
- **Route resolution:** `src/lib/routing/` — `resolve-content.ts`, `route-types.ts`, `redirects.ts`, `pages-data.ts`

### Image Architecture

- **Remote images** served from `https://www.doctorcheck.vn/wp-content/uploads/` via Next.js `images.remotePatterns` in `next.config.ts`
- Also allows: `imagedelivery.net`, `doctorcheck.vn`, `img.youtube.com`
- 1,018 images total: 627 WebP, 142 SVG, 121 JPG, 109 PNG, 7 JPEG, 12 other

### SEO Implementation

- **Structured data:** `src/lib/seo/structured-data.ts` — `MedicalWebPage`, `Product`/`MedicalProcedure`, `Physician` JSON-LD
- **Root layout JSON-LD:** `MedicalClinic` + `MedicalOrganization` + `LocalBusiness` graph with 7 `Physician` entries and `OfferCatalog`
- **Per-page metadata:** `generateMetadata()` in `src/app/[slug]/page.tsx` with canonical URLs, Open Graph, Twitter Cards
- **`metadataBase`:** `https://doctorcheck.vn`

### Testing / Build Tooling

- `npm run lint` — ESLint
- `npm run typecheck` — `tsc --noEmit`
- `npm run build` — Production build (Turbopack)
- `npm run check` — Lint + typecheck + build
- Docker support: `Dockerfile` (production), `Dockerfile.dev`, `docker-compose.yml`

---

## 3. Authoritative Migration Numbers

**Source:** `PHASE_2.1_RECONCILIATION.md` — Verified independently against WordPress REST API and source code.

### URL Scope

| Metric | Count |
| :--- | :--- |
| **Public URLs** | **205** |
| **Canonical URLs** | **197** |
| **In-scope redirects** | **8** |
| **Out-of-scope redirects** | **2** |
| **Total redirects** | **10** |

### Content Scope

| Content Type | Count |
| :--- | :--- |
| **Articles (Posts)** | **108** |
| **Pages** | **51** |
| **Packages (WooCommerce)** | **9** |
| **Doctors** | **7** |
| **Categories** | **30** |

### Fidelity Metrics

| Metric | Count |
| :--- | :--- |
| **Images migrated** | **1,018** |
| **Internal links verified** | **118** |
| **Missing URLs** | **0** |
| **Unknown URLs** | **0** |
| **Slug collisions** | **6** |

### Mathematical Verification

```
PRESERVED (197) + REDIRECTED (8) = PUBLIC SCOPE (205)  ✓
SITEMAP URLs (197) = CANONICAL URLs (197)              ✓
```

> **These numbers are authoritative unless a future audit proves otherwise.**

---

## 4. Current Phase Status

| Phase | Description | Status |
| :--- | :--- | :--- |
| **Phase 1** | Elimination of fake data & mock architecture | **PASS** |
| **Phase 2** | URL & routing migration | **PASS** |
| **Phase 2.1** | Routing consistency & redirect reconciliation | **PASS** |
| **Phase 3** | Content body migration & fidelity verification | **PASS** |
| **Phase 4** | SEO + structured data audit | **NOT STARTED** |

---

## 5. Routing Architecture

### Important Routing Decisions

1. **Preserve root-level WordPress URL namespace.** All 108 articles, 30 categories, 9 packages, and 32 root pages live directly at `/{slug}/`.
2. **Do NOT introduce artificial `/blog/` routes.** REJECTED.
3. **Do NOT introduce artificial `/services/` routes.** REJECTED.
4. **Do NOT introduce `/doctors/` routes.** REJECTED.
5. **Doctors use `/doctor/[slug]/`** — preserving WordPress singular convention.
6. **Endoscopy content uses `/trung-tam-noi-soi-tieu-hoa-doctor-check/[...subpath]/`** — existing nested architecture preserved.
7. **Root slug collisions have explicit deterministic resolution** — documented in `resolve-content.ts`.
8. **Legacy redirects use permanent 301 semantics** — configured in both `next.config.ts` and `src/lib/routing/redirects.ts`.
9. **`trailingSlash: true`** — enforced in `next.config.ts`.
10. **Canonical domain is `doctorcheck.vn`** — no `www.` prefix in canonical URLs.

### Deterministic Resolver Priority

From `src/lib/routing/resolve-content.ts`, the `resolveContent()` function uses this exact priority:

1. **Exact Legacy 301 Redirects** — Checked first via `getLegacyRedirect(slug)`. If matched, returns permanent redirect target.
2. **Explicit Collision Overrides:**
   - `POST_COLLISION_SLUGS` (`dau-thuong-vi`, `tieu-chay`, `di-ngoai-ra-mau`, `tao-bon`) → resolve to **Article (Post)**
   - `ROOT_CATEGORY_COLLISION_SLUGS` (`kien-thuc-ung-thu-da-day`, `kien-thuc-ung-thu-dai-trang`) → resolve to **Category** at root level
3. **Clinical Examination Packages** — 9 WooCommerce products → `PackageTemplate`
4. **Doctor Profiles** — 7 physicians → redirects to canonical `/doctor/[slug]/`
5. **Medical Knowledge Articles** — 108 published posts → `ArticleTemplate`
6. **Category Taxonomies** — 30 category archives → `CategoryTemplate`
7. **Static / Clinical Pages** — 32 distinct root pages → `PageTemplate`
8. **404 Fallback** — Returns `notFound()` with HTTP 404

### Collision Resolution

| Slug | Entity 1 | Entity 2 | Resolution |
| :--- | :--- | :--- | :--- |
| `dau-thuong-vi` | Draft Page (ID 3212) | Published Post (ID 3622) | **Article** |
| `tieu-chay` | Draft Page (ID 3162) | Published Post (ID 3773) | **Article** |
| `di-ngoai-ra-mau` | Draft Page (ID 3125) | Published Post (ID 3750) | **Article** |
| `tao-bon` | Draft Page (ID 3110) | Published Post (ID 3797) | **Article** |
| `kien-thuc-ung-thu-da-day` | Root Category (ID 47) | Nested Page (ID 4868) | **Category** at root; **Page** under endoscopy subpath |
| `kien-thuc-ung-thu-dai-trang` | Root Category (ID 48) | Nested Page (ID 4860) | **Category** at root; **Page** under endoscopy subpath |

---

## 6. Content Architecture

### Data Layer: `src/lib/data/`

| File | Content | Record Count |
| :--- | :--- | :--- |
| `clinic.ts` | Verified `ClinicInfo` singleton (address, hotline, license, coordinates, hours) | 1 |
| `doctors.ts` | 7 licensed physicians with CCHN credentials | 7 |
| `packages.ts` | 9 examination packages (female/male/specialized) with authentic pricing | 9 |
| `articles.ts` | Article catalog with metadata (slug, title, dates, categories, featured image) | 108 |
| `categories.ts` | WordPress taxonomy categories with slug/name/description mapping | 30 |
| `equipment.ts` | Verified diagnostic equipment specifications | — |
| `testimonials.ts` | Patient video testimonials and navigation structure | — |
| `faqs.ts` | Clinical FAQs | — |
| `index.ts` | Barrel export | — |

### Content Bodies: `src/lib/content/data/`

| File | Size | Content |
| :--- | :--- | :--- |
| `articles-content.json` | 1.6 MB | Full HTML bodies for all 108 medical articles |
| `pages-content.json` | 4.3 MB | Full HTML bodies for all 55 discovered pages |

### Content Processing Pipeline: `src/lib/content/normalize/`

| File | Purpose |
| :--- | :--- |
| `html-sanitizer.ts` | Strips WordPress comment tags, Flatsome TOC placeholders; adds responsive table containers |
| `link-normalizer.ts` | Converts absolute `doctorcheck.vn` links to relative canonicals; maps subdomain marketing links; resolves legacy 2025 tariff links to 2026 equivalents; preserves `/wp-content/uploads/` image paths |
| `toc-extractor.ts` | Extracts `<h2>` and `<h3>` headings for deterministic Table of Contents generation |

### Content Loaders: `src/lib/content/`

| File | Purpose |
| :--- | :--- |
| `articles-data.ts` | `getArticleBySlug()` — loads and enriches article content from JSON |
| `pages-data.ts` | `getPageBySlug()` — loads and enriches page content from JSON |

### Rendering Templates: `src/components/templates/`

| Template | Used For |
| :--- | :--- |
| `ArticleTemplate.tsx` | Medical articles with TOC, reviewer credentials, related articles |
| `CategoryTemplate.tsx` | Category archive pages listing articles in that category |
| `PackageTemplate.tsx` | Examination package detail pages with pricing |
| `DoctorTemplate.tsx` | Individual doctor profile pages |
| `PageTemplate.tsx` | Static/clinical pages rendered from migrated HTML |

### Content Sub-Components: `src/components/content/`

`ArticleBreadcrumb.tsx`, `ArticleContent.tsx`, `ArticleMetadata.tsx`, `ArticleTOC.tsx`, `ContentCallout.tsx`, `RelatedArticles.tsx`, `RichText.tsx`

### Site UI Components: `src/components/sites/doctorcheck-vn/root/`

Homepage and site-wide layout components: `TopBar.tsx`, `Header.tsx`, `Footer.tsx`, `FloatingWidgets.tsx`, `BookingSection.tsx`, `DoctorModal.tsx`, `DoctorsSection.tsx`, `PricingSection.tsx`, `EquipmentSection.tsx`, `VideoTestimonialsSection.tsx`, `FaqSection.tsx`

### UI Primitives: `src/components/ui/`

`button.tsx` (shadcn/ui Button component)

---

## 7. Content Fidelity Rules

The migration preserves the WordPress source content with absolute fidelity.

### STRICT RULES — NEVER:

- Rewrite medical facts
- Summarize medical articles
- Fabricate missing medical information
- Alter clinical recommendations
- Alter drug information
- Alter doctor credentials
- Replace authentic medical images with AI-generated images

### Policy

Any medical content issue must be **reported** in the appropriate Phase issues document, **not silently changed**.

Zero AI content was generated, summarized, or rewritten during any phase of this migration.

---

## 8. Phase 3 Results

**Source:** `PHASE_3_CONTENT_MIGRATION_REPORT.md` and `PHASE_3_CONTENT_FIDELITY_REPORT.md`

| Metric | Expected | Actual | Status |
| :--- | :---: | :---: | :---: |
| Articles migrated | 108 | 108 | **PASS** |
| Pages accounted for | 51 | 51 | **PASS** |
| Packages accounted for | 9 | 9 | **PASS** |
| Doctors accounted for | 7 | 7 | **PASS** |
| Categories accounted for | 30 | 30 | **PASS** |
| Images migrated | 1,018 | 1,018 | **PASS** |
| Internal links valid | 118 | 118 | **PASS** |
| Broken links | — | 0 | **PASS** |
| Missing images | — | 0 | **PASS** |
| Metadata mismatches | — | 0 | **PASS** |
| Silently rewritten medical facts | — | 0 | **PASS** |

---

## 9. Known Source Issues

Six source-level issues were identified during Phase 3 content migration. All are documented in `PHASE_3_CONTENT_ISSUES.md`.

### ISS-01 — Deactivated WP Table Builder Shortcode

- **Issue:** Raw `[wptb id=20590]` shortcode printed literally because the WP Table Builder plugin was deactivated.
- **Affected:** `ung-thu-dai-truc-trang`, `ung-thu-truc-trang`
- **Resolution:** Preserved authentically in Next.js. Flagged for clinic editorial team to provide an updated HTML comparison table.
- **Reference:** `PHASE_3_CONTENT_ISSUES.md` §1

### ISS-02 — Empty `/ve-doctor-check/` Source Container

- **Issue:** WordPress Page ID 5702 (`/ve-doctor-check/`) has 0 body content. The actual 80KB "About" content is stored under Page ID 81 (`/ve-chung-toi/`).
- **Resolution:** Next.js content layer hydrates `/ve-doctor-check/` with the authentic content from Page 81. `/ve-chung-toi/` 301-redirects to `/ve-doctor-check/`.
- **Reference:** `PHASE_3_CONTENT_ISSUES.md` §2

### ISS-03 — Hardcoded Flatsome Pricing Templates

- **Issue:** Three pricing/comparison pages returned 0 characters via WP REST API because they were rendered by hardcoded PHP templates (`page-pricing.php`).
- **Affected:** Page 1258 (`bang-gia-dich-vu-tam-soat-benh-tai-doctor-check`), Page 1597 (`so-sanh-goi-kham-tong-quat-danh-cho-nu`), Page 1595 (`so-sanh-goi-kham-tong-quat-danh-cho-nam`)
- **Resolution:** Authentic live-rendered `<main>` HTML (108–202 KB) was extracted from the production site and ingested into `pages-content.json`.
- **Reference:** `PHASE_3_CONTENT_ISSUES.md` §3

### ISS-04 — Legacy 2025 Tariff Links

- **Issue:** Multiple articles contained hardcoded links to outdated 2025 tariff pages (`/bang-gia-2025/`, `/bang-gia-noi-soi-da-day-2025-new/`).
- **Affected:** `ung-thu-da-day`, `trao-nguoc-da-day-thuc-quan`, `an-nhanh-no`, `kho-tieu`, `buon-non-non-keo-dai`, `dau-thuong-vi`
- **Resolution:** `link-normalizer.ts` deterministically maps these to 2026 canonical tariff URLs.
- **Reference:** `PHASE_3_CONTENT_ISSUES.md` §4

### ISS-05 — Subdomain Marketing Link

- **Issue:** Article `buon-non-non` linked to external subdomain `https://www.noisoidaday.doctorcheck.vn/day-bung/`.
- **Resolution:** `link-normalizer.ts` maps this to canonical article `/chuong-bung-day-hoi/`.
- **Reference:** `PHASE_3_CONTENT_ISSUES.md` §5

### ISS-06 — Image Attachment / Lightbox Wrappers

- **Issue:** Clinical images wrapped in `<a>` tags pointing to `/wp-content/uploads/` file URLs (Flatsome lightbox pattern).
- **Affected:** `10-tieu-chuan-vang`, `goi-tam-soat-nu`, `goi-tam-soat-nam`
- **Resolution:** Link normalizer preserves `/wp-content/uploads/` paths without treating them as page routes. Lightbox enhancement deferred to future phase.
- **Reference:** `PHASE_3_CONTENT_ISSUES.md` §6

---

## 10. SEO Decisions Already Made

The following SEO implementations have been verified in the source code:

### Implemented & Verified

| Feature | Implementation | Source File |
| :--- | :--- | :--- |
| **Canonical URLs** | `alternates.canonical` in `generateMetadata()`, pointing to `https://doctorcheck.vn/{slug}/` | `src/app/[slug]/page.tsx` |
| **Trailing slash** | `trailingSlash: true` | `next.config.ts` |
| **Sitemap** | Dynamic `sitemap.ts` generating 197 canonical URLs | `src/app/sitemap.ts` |
| **Robots** | Dynamic `robots.ts` — allows `/`, disallows `/api/`, `/_next/`, `/admin/` | `src/app/robots.ts` |
| **Open Graph** | Per-page OG tags with title, description, image, locale `vi_VN` | `src/app/[slug]/page.tsx`, `src/app/layout.tsx` |
| **Twitter Cards** | `summary_large_image` cards with title, description, image | `src/app/[slug]/page.tsx`, `src/app/layout.tsx` |
| **Structured Data (Root)** | `MedicalClinic` + `MedicalOrganization` + `LocalBusiness` JSON-LD graph with 7 `Physician` entries and `OfferCatalog` | `src/app/layout.tsx` |
| **Structured Data (Articles)** | `MedicalWebPage` JSON-LD per article | `src/lib/seo/structured-data.ts` |
| **Structured Data (Packages)** | `Product` JSON-LD per package | `src/lib/seo/structured-data.ts` |
| **Structured Data (Doctors)** | `Physician` JSON-LD per doctor | `src/lib/seo/structured-data.ts` |
| **metadataBase** | `https://doctorcheck.vn` | `src/app/layout.tsx` |
| **Language** | `<html lang="vi">` | `src/app/layout.tsx` |

### ⚠️ PHASE 4 SEO AUDIT HAS NOT YET BEEN COMPLETED

Do NOT claim that SEO is fully optimized. A comprehensive Phase 4 audit of structured data completeness, schema validation, meta tag quality, and cross-page SEO consistency has not been performed.

---

## 11. Completed Phase Protection

Future AI agents **MUST NOT** redo completed phases (1, 2, 2.1, 3) unless an actual defect is discovered.

Before changing any artifact or behavior established by a completed phase:

1. **Identify** the suspected defect with specificity
2. **Reproduce / verify** the defect against the actual source code or live behavior
3. **Explain** the impact — what breaks if this is not fixed
4. **Make the smallest required change** — do not refactor surrounding code
5. **Rerun** the relevant phase tests to confirm the fix does not introduce regressions

Wholesale re-auditing, re-migration, or architectural refactoring of completed phases without a documented defect is **prohibited**.

---

## 12. Next Phase

The next planned phase is:

### **PHASE 4 — SEO + STRUCTURED DATA AUDIT**

Phase 4 must begin with an **AUDIT**, not with immediate code changes.

**Do not immediately rewrite SEO code.** The audit must:

1. Validate all existing structured data against Schema.org and Google Rich Results requirements
2. Check all `generateMetadata()` outputs for completeness and accuracy
3. Verify sitemap correctness against live build output
4. Identify any missing or incorrect SEO implementations
5. Produce a Phase 4 audit report before any changes are made

---

## Source of Truth Rule

When this document conflicts with assumptions from an AI agent:

1. **Inspect actual source code** — the code is always ground truth
2. **Inspect the latest Phase report** — `PHASE_1_AUDIT.md`, `PHASE_2_ROUTE_INVENTORY.md`, `PHASE_2_ROUTING_AUDIT.md`, `PHASE_2.1_RECONCILIATION.md`, `PHASE_3_CONTENT_MIGRATION_REPORT.md`, `PHASE_3_CONTENT_FIDELITY_REPORT.md`, `PHASE_3_CONTENT_ISSUES.md`
3. **Do not guess** — verify every claim before acting
4. **Update `PROJECT_CONTEXT.md` only after verification** — with a clear changelog entry

**This document is project memory, not permission to invent facts.**
