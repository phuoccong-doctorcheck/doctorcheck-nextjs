# DoctorCheck AI Context
## Comprehensive System Context & Forensic Migration Memory for DoctorCheck.vn

> **Document:** `DOCTORCHECK_AI_CONTEXT_RESTORED.md`  
> **Created:** 2026-09-17  
> **Status:** Authoritative Project Context & Visual Fidelity Roadmap  
> **Authority:** Derived from forensic source snapshots (`doctorcheck-source/`), verified phase audits (Phases 1–5B), forensic source maps, and active codebase inspection.

---

## 1. Project Objective

The objective of this project is to faithfully migrate **DoctorCheck.vn** from its legacy **WordPress + WooCommerce + Flatsome** theme architecture to a high-performance **Next.js** application.

- **Strict Paradigm:** This is a **faithful 1:1 migration and reconstruction**, **NOT** an arbitrary redesign or modernization project.
- **Preservation Principles:**
  - Preserve the 100% authentic medical content with **zero AI rewriting, zero summarization, and zero fabricated facts**.
  - Preserve the exact WordPress root URL namespace without introducing artificial `/blog/` or `/services/` prefixes.
  - Preserve complete SEO equity: canonical self-referential URLs, 301 redirects for legacy routes, XML sitemaps (197 URLs), robots.txt, and complete Schema.org structured data graph.
  - Reconstruct the visual UI to match the authentic Flatsome + DoctorCheck child theme geometry, typography (`SVN-Sofia Pro`), color tokens, container widths (`1250px`), and responsive behaviors.

---

## 2. Technology Stack

Verified directly from [package.json](file:///d:/LandingPages/doctorcheck-nextjs/package.json), [tsconfig.json](file:///d:/LandingPages/doctorcheck-nextjs/tsconfig.json), [next.config.ts](file:///d:/LandingPages/doctorcheck-nextjs/next.config.ts), and active source files:

| Technology | Version / Specification | Role in Migration |
| :--- | :--- | :--- |
| **Framework** | Next.js `16.3.0` (App Router, Server Components & Client Boundaries) | Core Web Application |
| **Runtime / Library** | React `19.2.4`, React DOM `19.2.4` | Component Architecture |
| **Language** | TypeScript `^5` (Strict Mode, `noImplicitAny: true`) | Type Safety & Validation |
| **Styling** | Tailwind CSS `^4` (v4 with `@theme inline` tokens) + `@tailwindcss/postcss` | Utility CSS & Base Styling |
| **Legacy CSS Compatibility** | `src/styles/flatsome-core.css` | 1:1 Flatsome Grid & Component Token System |
| **Component Primitives** | shadcn/ui (`base-nova` style) | Base Accessible Primitives |
| **Iconography** | Vector SVGs & Lucide React (`^1.6.0`) | UI Icons |
| **Node.js Engine** | `>=24` (`.nvmrc` configured) | Build & Execution Environment |
| **Linter / Formatter** | ESLint `^9` (`eslint-config-next 16.3.0`) | Code Quality & Consistency |
| **Deployment Target** | Standalone Build (`output: "standalone"`, Dockerized) | Production Hosting |

---

## 3. Original Website Architecture

The original DoctorCheck.vn website is built upon:
1. **CMS & Theme:** WordPress 6.x + Flatsome 3.19.8 parent theme + `doctorcheck` child theme.
2. **Page Builder:** Flatsome UX Builder utilizing 21 reusable UX Blocks.
   - *Critical Rule:* The 21 Flatsome UX Block URLs are internal theme templates and **MUST NOT** be exposed as public Next.js routes. They are represented as modular React components where needed.
3. **E-Commerce & Packages:** WooCommerce powering clinical examination packages (`/goi-tam-soat-nam/`, `/goi-tam-soat-nu/`, etc.).
4. **Stylesheets Pipeline (18 Bundles captured in `doctorcheck-source/css/`):**
   - `flatsome.css` — 1250px container, row/col flex grid, responsive helpers (`hide-for-medium`, `show-for-small`).
   - `app.css` — Brand tokens, `@font-face` definitions, `.label-vip`, `.btn-appointment`, sticky navigation rules.
   - `appv3.css` — `.circle-blur` radial backdrops, customer review styling, mobile bottom bar.
   - `responsive.css` — 64px mobile header, 549px/849px/991px breakpoints.
   - `doctor-boxes.css` — Doctor card geometry, badges, portrait frames.
   - `flatsome-shop.css` — Pricing tables, tabbed matrices.
   - `ldp-nsdd.css` — Deep endoscopy and cancer screening layouts.
   - `owl.carousel.min.css`, `owl.theme.default.min.css`, `swiper-bundle.css`, `splide.min.css` — Carousels.
   - `dc-icons.min.css` — Vector icon glyphs.
   - `flatpickr.min.css` — Datepicker skins.
   - `public-main.css`, `kdn.css`, `styles.css`, `style.css`, `header-ldp.css`.
5. **Custom Typography:** SVN-Sofia Pro across 5 font weights (300, 400, 600, 700, 900).

---

## 4. Current Next.js Architecture

The Next.js codebase is organized cleanly according to the App Router structure:

```
src/
├── app/
│   ├── [slug]/page.tsx                                   # Dynamic root resolver (Articles, Categories, Packages, Pages)
│   ├── api/booking/route.ts                              # Booking API endpoint
│   ├── doctor/[slug]/page.tsx                            # Doctor profile route (/doctor/[slug]/)
│   ├── trung-tam-noi-soi-tieu-hoa-doctor-check/[...subpath]/page.tsx  # Nested endoscopy hub (18 pages)
│   ├── globals.css                                       # Global font-face declarations, Tailwind tokens
│   ├── layout.tsx                                        # Root layout with Organization/Clinic JSON-LD graph
│   ├── page.tsx                                          # Homepage (ordered section orchestration)
│   ├── robots.ts                                         # Dynamic robots.txt
│   └── sitemap.ts                                        # Dynamic 197-URL sitemap.xml
├── components/
│   ├── content/                                          # Article rendering components (TOC, Breadcrumb, Metadata)
│   ├── sites/doctorcheck-vn/
│   │   ├── about/                                        # AboutUsPage & about-us.css (Flatsome reconstructed)
│   │   ├── root/                                         # Homepage section components (Header, Hero, Confuse, etc.)
│   │   └── shared/                                       # Shared vector icons (icons.tsx)
│   ├── templates/                                        # Page templates (Article, Category, Doctor, Package, Page)
│   └── ui/                                               # Base UI primitives (button.tsx)
├── data/ & lib/data/                                     # Static TypeScript datasets (clinic, doctors, packages, etc.)
├── lib/content/                                          # 1.6MB articles-content.json, 4.3MB pages-content.json + normalizers
├── lib/routing/                                          # resolve-content.ts, redirects.ts, route-types.ts
├── lib/seo/                                              # structured-data.ts (BreadcrumbList, MedicalWebPage, Physician)
└── styles/                                               # flatsome-core.css (1,761 lines of Flatsome design tokens)
```

---

## 5. Completed Migration Phases

The following phases have been fully executed, tested, audited, and verified:

| Phase | Scope | Status | Notes & Verification Reference |
| :--- | :--- | :---: | :--- |
| **Phase 1** | Audit & Elimination of Mock Data | **PASS** | Replaced all synthetic mock data with authentic clinical datasets. (`PHASE_1_AUDIT.md`) |
| **Phase 2** | URL & Routing Migration | **PASS** | Established root namespace architecture, trailing slash rule, dynamic routes. (`PHASE_2_ROUTING_AUDIT.md`) |
| **Phase 2.1** | Routing Reconciliation & Redirects | **PASS** | 197 canonical URLs + 8 in-scope 301 redirects + 2 campaign aliases. (`PHASE_2.1_RECONCILIATION.md`) |
| **Phase 3** | Content Migration & Fidelity | **PASS** | 108 articles, 51 pages, 9 packages, 7 doctors, 30 categories, 1,018 images. Zero rewritten facts. (`PHASE_3_CONTENT_FIDELITY_REPORT.md`) |
| **Phase 4** | SEO + Structured Data Audit | **PASS** | Schema.org audit for MedicalClinic, Physician, OfferCatalog, MedicalWebPage. (`PHASE_4_SEO_AUDIT.md`) |
| **Phase 4 Fix** | SEO Critical Issues Fixes | **PASS** | Fixed homepage canonical, raw static JSON-LD script, human-readable titles, BreadcrumbList JSON-LD. (`PHASE_4_SEO_FIX_REPORT.md`) |
| **Phase 5 (Partial)**| Header & Hero Forensic Reconstruction | **PASS** | Exact 90px/64px sticky Header and full-bleed 2560x1038 / 856x1256 Hero Banner reconstructed. (`PHASE_5B_HEADER_RECONSTRUCTION_REPORT.md`, `PHASE_5B_HERO_FIX_REPORT.md`) |

---

## 6. Routing Rules

1. **`trailingSlash: true`** is strictly enforced in [next.config.ts](file:///d:/LandingPages/doctorcheck-nextjs/next.config.ts).
2. **Canonical Domain:** `https://doctorcheck.vn` (no `www.`, strict HTTPS).
3. **Root URL Namespace:** All 108 medical articles, 30 category archives, 8 clinical examination packages, and 25 static root pages resolve directly at `/{slug}/`.
4. **Forbidden Routes:**
   - **NO** `/blog/[slug]`
   - **NO** `/services/[slug]`
   - **NO** `/doctors/[slug]`
5. **Doctor Profiles:** Always live at `/doctor/[slug]/` (preserving singular WordPress convention).
6. **Endoscopy Center Hub:** Nested pages live under `/trung-tam-noi-soi-tieu-hoa-doctor-check/[...subpath]/` (18 subpages).
7. **Deterministic Resolver Priority ([resolve-content.ts](file:///d:/LandingPages/doctorcheck-nextjs/src/lib/routing/resolve-content.ts)):**
   - Step 1: Exact Legacy 301 Redirects (`getLegacyRedirect(slug)`)
   - Step 2: Explicit Collision Overrides (`POST_COLLISION_SLUGS`, `ROOT_CATEGORY_COLLISION_SLUGS`)
   - Step 3: Examination Packages (WooCommerce products $\rightarrow$ `PackageTemplate`)
   - Step 4: Doctor Profiles (7 physicians $\rightarrow$ redirects to canonical `/doctor/[slug]/`)
   - Step 5: Medical Knowledge Articles (108 posts $\rightarrow$ `ArticleTemplate`)
   - Step 6: Category Archives (30 taxonomies $\rightarrow$ `CategoryTemplate`)
   - Step 7: Static/Clinical Pages (25 root pages $\rightarrow$ `PageTemplate`)
   - Step 8: 404 Fallback (`notFound()`)

---

## 7. Content & Data Status

- **Medical Articles:** 108 published medical articles migrated verbatim into `src/lib/content/data/articles-content.json` (1.6 MB).
- **Static Pages:** 55 pages migrated into `src/lib/content/data/pages-content.json` (4.3 MB).
- **Doctors:** 7 licensed physicians with verified CCHN practicing credentials in `src/lib/data/doctors.ts`.
- **Examination Packages:** 9 WooCommerce packages with verified 2026 pricing in `src/lib/data/packages.ts`.
- **Categories:** 30 taxonomy categories mapped in `src/lib/data/categories.ts`.
- **Clinic Information:** Verified singleton clinic metadata (address: 429 Tô Hiến Thành, P.14, Q.10, TP.HCM; license: 09789/HCM-GPHĐ; hotline: 1800 6634) in `src/lib/data/clinic.ts`.
- **Content Policy:** **STRICT READ-ONLY.** Zero synthetic modifications or summaries.

---

## 8. SEO Status

- **Canonical URLs:** Emitted on every page via `alternates.canonical` in `generateMetadata()` and root layout metadata.
- **Sitemap:** Dynamic generation via `src/app/sitemap.ts` containing exactly 197 canonical URLs.
- **Robots:** Configured in `src/app/robots.ts` to allow indexing of public routes and block `/api/`, `/_next/`, `/admin/`.
- **Structured Data:**
  - Root Layout: Native static `<script type="application/ld+json">` graph containing `MedicalClinic`, `MedicalOrganization`, `LocalBusiness`, 7 `Physician` entries, and `OfferCatalog`.
  - Articles: `MedicalWebPage` JSON-LD + `BreadcrumbList` JSON-LD.
  - Packages: `Product`/`MedicalProcedure` JSON-LD + `BreadcrumbList` JSON-LD.
  - Doctors: `Physician` JSON-LD.
  - Endoscopy Hub: Multi-segment `BreadcrumbList` JSON-LD.
- **Open Graph & Twitter Cards:** Full OpenGraph tags, locale `vi_VN`, valid image URLs across all routes.

---

## 9. Image & Asset Status

- **Source Evidence:** Forensic analysis in [DOCTORCHECK_IMAGE_SOURCE_MAP.md](file:///d:/LandingPages/doctorcheck-nextjs/DOCTORCHECK_IMAGE_SOURCE_MAP.md).
- **Local Assets Location:** `public/sites/doctorcheck-vn/root/images/` and `public/images/`.
- **Asset Coverage:**
  - 100% of brand logos (`logo-header.webp`, `logo-sticky.webp`, `logo.webp`).
  - 100% of hero banners (`banner-desktop-master.webp`, `banner-mobile-master.webp`).
  - 100% of 7 doctor portraits (`/doctors/*.webp`).
  - 100% of 6 equipment photos (`/equipment/*.webp`).
  - 100% of benefits banner (`benefits-banner-master.webp`).
  - High-resolution customer story thumbnails & promotional CTA banners.
- **Next.js Image Optimization:** Remote patterns configured in `next.config.ts` for WordPress uploads (`doctorcheck.vn/wp-content/uploads/`, `imagedelivery.net`).
- **Asset Protocol:** **NO NEW ASSET DOWNLOADS FROM PRODUCTION.** Use existing local assets.

---

## 10. Font Status

- **Primary Font Family:** **SVN-Sofia Pro** (or `SVN-SofiaPro`).
- **Available Weights (WOFF2 self-hosted in `public/sites/doctorcheck-vn/fonts/`):**
  - `300` (Light)
  - `400` (Regular / Normal)
  - `600` (SemiBold)
  - `700` (Bold)
  - `900` (Black)
- **CSS Configuration:** Defined via `@font-face` blocks in [src/app/globals.css](file:///d:/LandingPages/doctorcheck-nextjs/src/app/globals.css) and aliased across `--font-sans`.
- **Strict Rule:** **DO NOT** replace with Inter, Roboto, Arial, system-ui, or Google Fonts.

---

## 11. Original Global UI Rules & Design Tokens

Extracted directly from `doctorcheck-source/css/flatsome.css`, `app.css`, and `appv3.css`:

- **Primary Brand Color:** `#005570` (DoctorCheck Deep Navy / Teal)
- **Secondary Accent Color:** `#FFB500` (Warm Amber / Gold)
- **Page Canvas Background:** `#FDFDF6` (Medical Soft Warm White)
- **Body Text Color:** `#2A2F38` (Deep Charcoal Slate)
- **Muted Text Color:** `#777777` / `#4D5565`
- **Alert / VIP Red:** `#CD0000` / `#DB0000`
- **Light Tint / Border:** `#EEF7FA` / `#DDE4EA`
- **Global Container Width:** `1250px` (`padding: 0 15px`)
- **Row Gutter:** `30px` total (`margin: 0 -15px`)
- **Desktop Header Height:** `90px` (Logo: `60px`, gap: `30px`)
- **Mobile Header Height:** `64px` (Logo: `42px`)
- **Responsive Breakpoints:**
  - Mobile: `<= 549px` (`hide-for-small`, `show-for-small`)
  - Tablet: `550px - 849px` (`hide-for-medium`, `show-for-medium`)
  - Desktop: `>= 850px`
  - Wide Desktop: `1250px` container cap

---

## 12. Original Homepage Structure

The authentic homepage layout follows this exact 14-section sequence:

1. **Header (`#header`):** 90px Desktop / 64px Mobile sticky header with 6 nav items + VIP badge + search toggle.
2. **Hero Banner (`#section_380136169`):** Full-bleed responsive banner (Desktop 2560x1038 / Mobile 856x1256) linking to `#tu-van`.
3. **Patient Concerns (`#section_294013533`, Part 1):** Title + 4 number-box cards (01-04) over `.circle-blur` radial backdrop.
4. **Customer Video Testimonials (`#section_294013533`, Part 2):** Customer Shorts video carousel with active YouTube modal.
5. **5 Clinical Benefits (`#section_1967412634`):** 2-column split (7 cols accordion : 5 cols graphic banner card).
6. **Doctors Team Carousel (`#section_1563108974`):** 4 doctors per desktop view, authentic qualification badges, modal trigger.
7. **Facilities & Equipment Grid (`#section_818310656`):** 3x2 photographic equipment grid with subtle hover zoom (`scale(1.04)`).
8. **Services / Pricing Matrix (`#section_1936328654`):** Tabbed matrix (Nam / Nữ) with price badges in `#CD0000` and diagnostic checklist.
9. **Cancer Screening Clinical Guidelines (`#section_991765975`):** Solid deep teal `#005570` dark section with 2 clinical columns.
10. **Customer Stories & In-Depth Case Studies (`#section_1899109699`):** Testimonial cards with real patient portraits and rating badges.
11. **Consultation & Booking Form (`#section_1178718493`):** `#tu-van` anchor target with hotline callout box + appointment booking inputs.
12. **FAQ Accordion (`#section_1915240304`):** 900px centered accordion with 4 authentic clinical questions.
13. **Promotional Banner CTA (`#section_514095607`):** Full-bleed slogan banner directly above footer.
14. **Footer (`#footer`):** 4-column legal, license, and navigation footer + dark bottom bar (`#00475B`).

---

## 13. UI Reconstruction Roadmap

To achieve 100% pixel-perfect visual fidelity without introducing regressions:

- **Phase 5B.1:** Global Tokens + Container + Typography Normalization (`1250px`, `SVN-Sofia Pro`)
- **Phase 5B.2:** Concerns + Video Testimonials (`section-confuse` unified geometry & carousel)
- **Phase 5B.3:** 5 Clinical Benefits (7:5 column ratio, authentic accordion typography)
- **Phase 5B.4:** Doctors Carousel (4-card desktop carousel, authentic qualification badges)
- **Phase 5B.5:** Facilities & Equipment (3x2 photographic grid with hover zoom)
- **Phase 5B.6:** Pricing Matrix (Nam/Nữ tabs, authentic price tags, diagnostic checklists)
- **Phase 5B.7:** Cancer Screening Dark Section (deep teal `#005570`, gold `#FFB500` headings)
- **Phase 5B.8:** Customer Stories + CTA Form + FAQ + Banner CTA
- **Phase 5B.9:** Footer Normalization & Mobile Bottom Bar

---

## 14. Current UI Implementation Status

| Component | Status | Details |
| :--- | :---: | :--- |
| **Header** | **COMPLETE (Phase 5B)** | Exact 90px desktop / 64px mobile, 60px logo, 30px gap, 2-line menu items, `#005570` sticky background, search toggle. |
| **Hero Banner** | **COMPLETE (Phase 5B)** | Reconstructed full-bleed desktop (2560x1038) and mobile (856x1256) banner with zero vertical padding. |
| **ConfuseSection** | **PARTIAL** | Unified component created (`ConfuseSection.tsx`), but needs final verification against original `.circle-blur` and video carousel metrics. |
| **BenefitsSection** | **PARTIAL** | Functional accordion, but currently uses 6:6 grid instead of 7:5 ratio and Lucide chevrons. |
| **DoctorsSection** | **PARTIAL** | Custom 3-doctor manual slider instead of 4-doctor desktop carousel; badge styling needs alignment. |
| **EquipmentSection**| **PARTIAL** | Uses generic modern rounded cards instead of authentic Flatsome 3x2 photographic card style. |
| **PricingSection**  | **PARTIAL** | Functional tabs, but lacks authentic Flatsome package badge styling and pricing table layout. |
| **CancerScreening**| **PARTIAL** | Dark section exists, but typography weights and line breaks differ slightly from original. |
| **CustomerStories**| **PARTIAL** | Simplified cards without exact portrait framing or quotation mark glyphs. |
| **BookingSection**  | **PARTIAL** | Functional form, but input heights (45px) and hotline box borders need exact styling. |
| **FaqSection**      | **PARTIAL** | Full-width container instead of centered 900px accordion. |
| **BannerCtaSection**| **PARTIAL** | Banner present, but has extraneous padding compared to original flush presentation. |
| **Footer**          | **PARTIAL** | 4 columns present, but uses modern Lucide icons instead of original vector typography styling. |
| **About Us Page**   | **COMPLETE** | 1:1 Flatsome reconstruction in `AboutUsPage.tsx` + `about-us.css`. |

---

## 15. Remaining Visual Gaps

As authoritatively documented in [DOCTORCHECK_UI_GAPS.md](file:///d:/LandingPages/doctorcheck-nextjs/DOCTORCHECK_UI_GAPS.md):

1. **P0-1: Global Container Width Inconsistency:** Mix of `max-w-[1200px]`, `max-w-[1100px]`, and `max-w-5xl` across remaining sections instead of strict `1250px` (`padding: 0 15px`).
2. **P0-2: Section 2 (`section-confuse`) Geometry:** Final visual binding of 4 number boxes + YouTube Shorts carousel.
3. **P0-3: Section 4 Doctors Carousel Stage Sizing:** Render 4 doctors per desktop view (`~280px` card width) instead of 3 oversized cards.
4. **P1-1: Section 3 Benefits Grid Ratio:** Adjust 6:6 grid to authentic 7:5 column ratio and Flatsome accordion chevron styling.
5. **P1-2: Section 5 Equipment 3x2 Grid:** Align photographic card aspect ratio and subtle hover zoom transition.
6. **P1-3: Section 6 Pricing Matrix Tabs & Badges:** Match Flatsome tab pills, `#CD0000` price tags, and diagnostic feature checkmarks.
7. **P1-4: Section 7 Cancer Screening Dark Typography:** Align gold headings (`#FFB500`) and clinical copy spacing.
8. **P1-5: Section 9 Booking Form Styling:** Align 45px input heights, hotline callout border, and submit button gold styling.
9. **P1-6: Sections 12-13 Footer & Bottom Bar:** Standardize 4-column widths, license font size (`14px`, line-height `1.8`), and `#00475B` bottom bar.

---

## 16. Current Git / Change Status

Inspection of `git status` reveals:
- **Modified Core Files:** `src/app/globals.css`, `src/app/layout.tsx`, `src/app/page.tsx`, `tsconfig.json`.
- **Newly Added Migration Components:**
  - All homepage sections in `src/components/sites/doctorcheck-vn/root/`
  - Template components in `src/components/templates/`
  - Content helpers in `src/components/content/`
  - Static dataset modules in `src/lib/data/` and `src/data/`
  - Normalizers and JSON bodies in `src/lib/content/`
  - Routing resolver and redirects in `src/lib/routing/`
  - SEO utilities in `src/lib/seo/`
  - Flatsome core CSS in `src/styles/flatsome-core.css`
  - Local asset images in `public/sites/doctorcheck-vn/root/images/`
- **Zero Uncommitted Destructive Changes:** All existing files are intact, and no working files have been lost or reset.

---

## 17. Exact Recommended Next Step

The recommended logical next action for the project is:

👉 **Execute Phase 5B.1 / Phase 5B.2:**
1. Enforce strict `1250px` global container and `SVN-Sofia Pro` typography inheritance across all section wrappers.
2. Complete the visual reconstruction of **Section 2 (`section-confuse`)** (4 Patient Concerns + Video Testimonials carousel) adhering to `doctorcheck-source/html/homepage.html` and `doctorcheck-source/screenshots/desktop/desktop-homepage-03-confuse.png` & `desktop-homepage-04-video.png`.

---

## 18. Important Rules Future AI Agents MUST Follow

1. **NEVER Rewrite Medical Content:** Medical articles, doctor credentials, and pricing data must remain 100% authentic to the WordPress source.
2. **DO NOT Modernize or Redesign:** Avoid arbitrary glassmorphism, modern generic gradients, oversized pill cards, or foreign icon systems. Emulate the original Flatsome/WordPress UI 1:1.
3. **DO NOT Access Production:** Never crawl `doctorcheck.vn` or download assets from the live production site. Use the local snapshot `doctorcheck-source/` and existing `public/` assets.
4. **DO NOT Alter Routing Architecture:** Preserve `trailingSlash: true`, root dynamic resolving, and canonical redirects.
5. **DO NOT Redo Completed Phases:** Phases 1 through 4 Fix are verified and protected. Do not perform wholesale re-audits without an identified, verified defect.
6. **Strict Source Hierarchy in Case of Conflict:**
   1. Actual original HTML & CSS (`doctorcheck-source/html/homepage.html`, `doctorcheck-source/css/`)
   2. Original screenshots (`doctorcheck-source/screenshots/desktop/`)
   3. Forensic mapping documents (`DOCTORCHECK_UI_GAPS.md`, `DOCTORCHECK_UI_SOURCE_MAP.md`)
   4. Current Next.js implementation
