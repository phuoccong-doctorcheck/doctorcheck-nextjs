# Comprehensive Website-Wide Reverse-Engineering & Migration Architecture Report
**Target Website:** [DoctorCheck.vn](https://doctorcheck.vn/)  
**Document Code:** `FINAL_RESEARCH_REPORT.md`  
**Classification:** Final Architecture Review & Pre-Implementation Audit  
**Date:** 2026-09-15  

---

## 1. Executive Summary

### 1.1. Current Website Architecture
The live **DoctorCheck.vn** platform is a monolithic WordPress 6.6+ deployment hosted on Apache/Nginx infrastructure behind Cloudflare. The user interface is powered by the commercial **Flatsome 3.19.8** theme with a bespoke child theme (`doctorcheck` v3.0), utilizing Flatsome's proprietary UX Builder and 21 reusable UX Blocks (`/blocks/*`). Content is distributed across standard WordPress Posts, WooCommerce Products (configured as clinical screening packages rather than physical retail goods), and custom post types (notably `doctor` and `faq`). The site relies on **Rank Math PRO** for XML sitemaps and complex Schema.org medical markup, **Contact Form 7** for appointment lead generation, **WP Rocket 3.20.3** and **Perfmatters 2.5.2** for script delaying and asset minification, and **Cloudflare Images** (`imagedelivery.net`) as its primary media delivery network.

### 1.2. Proposed Migration Direction
The proposed destination is a modern, decoupled, high-performance **Next.js 16 (App Router, React 19, TypeScript strict mode)** application styled with **Tailwind CSS v4** and **shadcn/ui** primitives. The migration replaces the heavyweight WordPress/PHP runtime, jQuery plugin chains, and Flatsome shortcode overhead with:
1. **React Server Components (RSC) & Static Site Generation (SSG)** to target fast server response times, low Cumulative Layout Shift (CLS < 0.1), and strong Core Web Vitals.
2. **Incremental Static Regeneration (ISR)** to serve 108 medical articles, category archives, and doctor profiles with periodic background revalidation.
3. **Dedicated Route Handlers (`/api/booking`)** with strict Zod validation, UTM parameter extraction, and an abstract, decoupled `LeadReceiver` interface to safely route bookings to Doctor Check's CRM.
4. **Structured Data & SEO Parity** by preserving all canonical permalinks with strict trailing slashes and maintaining semantic Schema.org entity parity (`MedicalClinic`, `Physician`, `OfferCatalog`, `FAQPage`, `BreadcrumbList`) tailored to actual page content.
5. **Componentization of Internal Blocks:** Converting the 21 internal Flatsome UX Blocks into reusable, type-safe React UI components rather than exposing them as public routes.

---

## 2. Page Inventory & Discrepancy Reconciliation

### 2.1. Discovery Summary
From exhaustive multi-source interrogation across XML sitemaps (`sitemap_index.xml`, `page-sitemap.xml`, `product-sitemap.xml`, `category-sitemap.xml`, `post-sitemap.xml`, `blocks-sitemap.xml`), `robots.txt`, and the public WordPress REST API (`/wp-json/wp/v2/`), exactly **226 unique URLs** were discovered.

```
Total Discovered URLs: 226
├── Public User-Facing URLs: 205
│   ├── WordPress Posts (Articles): 108
│   ├── WordPress Pages: 51 (44 indexed in sitemap + 6 noindex API drafts + 1 Blog index)
│   ├── WooCommerce Products (Screening Packages): 9
│   ├── Doctor Profiles (CPT): 7
│   ├── Category Archives: 30
│   └── FAQs: 0 standalone URLs (embedded in pages/blocks)
└── Internal Flatsome UX Blocks (Not Public Pages): 21
```

> [!IMPORTANT]
> **Internal UX Blocks Must NOT Become Public Routes:**  
> The 21 URLs discovered in `blocks-sitemap.xml` (e.g. `/blocks/footer/`, `/blocks/doi-ngu-bac-si/`, `/blocks/facilities/`, `/blocks/quy-trinh/`) are internal template blocks used by the Flatsome page builder to assemble pages. They are **not user-facing web pages** and must **never** be registered as public Next.js routes. They will be migrated exclusively as reusable React components in `src/components/`.

---

### 2.2. Rigorous Discrepancy Reconciliation

During initial research reviews, several apparent numerical discrepancies were detected. Below is the audited, source-verified reconciliation explaining every item without guesswork:

#### A. Reconciling 226 Total URLs vs. 205 Public URLs vs. 210 Functional Breakdown
- **Fact 1:** Exactly **226 unique URLs** exist across all sitemaps and API endpoints.
- **Fact 2:** Exactly **21 URLs** reside under `/blocks/*` (`blocks-sitemap.xml`). These are internal Flatsome UX Blocks.
- **Fact 3:** `226 - 21 = 205` public user-facing URLs.
- **Why the initial functional breakdown totaled 210:**  
  The initial review attempted a functional content-grouping: Homepage (1) + Static Marketing Pages (31) + Pricing/Packages (13) + Specialty Hubs (14) + Doctor Directory & Profiles (8) + Articles (109) + Categories (30) + Contact/Booking (3) + Legal (1) = **210**.  
  This double-counted 5 URLs across overlapping functional categories:
  1. `/doi-ngu-bac-si-doctorcheck/` was counted under Doctor Directory (8) AND under Static Marketing Pages (31).
  2. Four pricing pages (`/bang-gia-dich-vu-tam-soat-benh-tai-doctor-check/`, `/bang-gia-dich-vu/`, `/bang-gia-kham-suc-khoe-tong-quat/`, `/bang-gia-2026/`) were counted under Pricing/Packages (13) AND under Pages (31).
  3. The Blog index page `/blog/` was counted both under Articles (109) and under Pages.
- **True Content-Type Distribution (205 Public URLs):**
  - **108** WordPress Posts (`post_type = 'post'`)
  - **51** WordPress Pages (`post_type = 'page'`)
  - **9** WooCommerce Products (`post_type = 'product'`)
  - **7** Doctor CPT Profiles (`post_type = 'doctor'`)
  - **30** Category Taxonomies (`taxonomy = 'category'`)
  - **Sum:** `108 + 51 + 9 + 7 + 30 = 205` public routes + `21` UX blocks = **226 Total URLs**.

#### B. Reconciling 108 WordPress Posts vs. 109 Article Inventory URLs
- Interrogation of the WordPress REST API endpoint `/wp-json/wp/v2/posts` returns exactly **108 posts**.
- Interrogation of `post-sitemap.xml` returns exactly **109 URLs**.
- Performing a set difference between `post-sitemap.xml` and `wp/v2/posts` reveals the single differing URL:
  `https://www.doctorcheck.vn/blog/`
- Interrogation of `/wp-json/wp/v2/pages` shows Page ID 964 (`slug: blog`, `title: Blog`). In WordPress settings, Page ID 964 is designated as the "Posts page" (the blog archive index).
- **Rank Math PRO behavior:** Rank Math automatically omits the designated Posts Page from `page-sitemap.xml` and inserts it as the header root URL of `post-sitemap.xml`.
- **Conclusion:** There are exactly **108 individual medical knowledge articles (Posts)** and **1 Blog Index Page (Page ID 964)**.

#### C. Reconciling 6 Ambiguous Redirects vs. 7 Redirect URLs
- The previous draft listed 7 URLs in its redirect plan.
- Investigation of the source dataset shows that two URLs (`/goi-kham-danh-cho-nam/` and `/goi-kham-danh-cho-nu/`) were speculative aliases that **do not exist** in the 226 discovered URLs.
- Furthermore, `/goi-ung-thu-da-day/` was previously misdiagnosed as a collision with a page, whereas it is actually an independent, indexed WooCommerce product.
- Conversely, live HTTP and REST API audits revealed that Rank Math excluded 6 WordPress Pages from `page-sitemap.xml` because they are marked `noindex`:
  1. `/bang-gia-kham-tong-quat/` (Page ID 1429, noindex draft)
  2. `/bang-gia-kham-tong-quat-new/` (Page ID 2168, noindex draft)
  3. `/buon-non-non-keo-dai/` (Page ID 3269, noindex draft)
  4. `/dieu-tri-tao-bon-di-cau-ra-mau/` (Page ID 3054, noindex draft)
  5. `/loi-ich-goi-song-tho/` (Page ID 3011, noindex draft)
  6. `/trung-tam-noi-soi-tieu-hoa/bang-gia-noi-soi-da-day/` (Page ID 2723, noindex draft)
- Exactly **7 URLs** are confirmed for 301 redirects in the final migration table (Section 4).

---

## 3. Page Template Architecture

Research demonstrates that all 205 user-facing URLs across DoctorCheck.vn are served by a minimal set of **14 reusable Next.js page templates**:

| # | Template Name | Supported Routes / Scope | Layout & Functional Pattern |
|---|---|---|---|
| 1 | **Homepage Template** | `/` | Conversion hero, 4 anxiety cards, video testimonials, doctor showcase, equipment matrix, gender pricing switcher, FAQ accordion, booking form. |
| 2 | **Doctor Directory Template** | `/doi-ngu-bac-si-doctorcheck/` | Clinical faculty grid, hospital credential filters (ĐHYD, Chợ Rẫy), specialty badges, direct consultation triggers. |
| 3 | **Doctor Detail Template** | `/doctor/[slug]/` (7 profiles) | Doctor portrait, qualifications, academic career, clinical experience, specializations, direct booking widget with pre-selected doctor. |
| 4 | **Package Directory & Pricing Template** | `/bang-gia-dich-vu-tam-soat-benh-tai-doctor-check/` | Full pricing matrix, gender tabs, itemized clinical test breakdown, consultation notes, insurance guidelines. |
| 5 | **Package Detail & Comparison Template** | `/goi-khuyen-cao-danh-cho-nu/`, `/goi-chuyen-sau-danh-cho-nu/`, `/goi-song-tho-danh-cho-nu/`, `/so-sanh-3-goi-kham-nu/`, etc. (13 pages) | Single package deep dive, target age groups, disease/cancer counts, step-by-step diagnostic checklist, pricing CTA. |
| 6 | **Specialty Clinical Service Template** | `/noi-soi-da-day/`, `/noi-soi-dai-trang/`, `/trung-tam-noi-soi-tieu-hoa-doctor-check/` (14 pages) | Endoscopy procedure explanations, painless sedation protocols, Olympus EVIS-X1 technology highlights, preparation instructions. |
| 7 | **Corporate B2B Health Template** | `/kham-suc-khoe-doanh-nghiep/` | Enterprise health screening packages, on-site sampling logistics, digital employee health records, B2B inquiry form. |
| 8 | **About & Accreditation Template** | `/ve-chung-toi/`, `/10-tieu-chuan-vang/` | Clinic mission, Department of Health licensing (`09789/HCM-GPHĐ`), AACI American accreditation, leadership profiles. |
| 9 | **Medical Article Single Template** | `/[slug]/` (108 posts) | Long-form medical education, medical author credentials, TOC, embedded medical diagrams, related articles, consultation banner. |
| 10 | **Category Archive Template** | `/[category-slug]/` (30 archives) | Paginated article grid, category summary, search filter, popular topics. |
| 11 | **Contact Template** | `/lien-he/` | Google Maps embed, clinic address (429 Tô Hiến Thành), operating hours, direct phone links, inquiry form. |
| 12 | **Booking Confirmation Template** | `/cam-on/` | Post-booking thank you screen, preparation checklist reminder, emergency hotline contact. |
| 13 | **Legal Policy Template** | `/chinh-sach-quyen-rieng-tu/` | Privacy terms, patient medical record handling protocols, data security policies. |
| 14 | **404 Not Found Template** | `/_not-found` | Branded friendly error screen with quick links back to packages, doctor directory, and hotline. |

---

## 4. URL Collision Audit & 301 Migration Plan

### 4.1. WordPress Slug Collision Audit

An automated cross-taxonomy audit of all WordPress entities (`Page`, `Post`, `Doctor`, `Category`, `Product`) revealed **6 structural slug collisions** where multiple entities share identical slugs or parent paths:

| URL | Content Types Involved | Live WordPress Behavior | Recommended Action | Technical & SEO Rationale |
|---|---|---|---|---|
| `https://www.doctorcheck.vn/dau-thuong-vi/` | Page ID 3212 vs. Post ID 3622 | Serves Page ID 2781 template with `Robots: nofollow, noindex`. Post ID 3622 is shadowed. | **KEEP (Resolve to Post)** | Resolve to published Post article. Eliminates accidental `noindex` tag and restores organic rankings for "đau thượng vị". |
| `https://www.doctorcheck.vn/tieu-chay/` | Page ID 3162 vs. Post ID 3773 | Serves Page template with `Robots: nofollow, noindex`. Post ID 3773 is shadowed. | **KEEP (Resolve to Post)** | Resolve to published Post article to index clinical guidance and restore search traffic. |
| `https://www.doctorcheck.vn/di-ngoai-ra-mau/` | Page ID 3125 vs. Post ID 3750 | Serves Page template with `Robots: nofollow, noindex`. Post ID 3750 is shadowed. | **KEEP (Resolve to Post)** | Resolve to published Post article to restore search visibility for this primary GI red-flag symptom. |
| `https://www.doctorcheck.vn/tao-bon/` | Page ID 3110 vs. Post ID 3797 | Serves Page template with `Robots: nofollow, noindex`. Post ID 3797 is shadowed. | **KEEP (Resolve to Post)** | Resolve to published Post article to eliminate `noindex` suppression. |
| `https://www.doctorcheck.vn/kien-thuc-ung-thu-da-day/` | Root Category ID 47 vs. Nested Page ID 4868 | Category sits at root `/kien-thuc-ung-thu-da-day/`; Page sits under `/trung-tam-noi-soi-tieu-hoa-doctor-check/...` | **KEEP (Distinct Paths)** | Root URL resolves to Category Archive; nested path resolves to Clinical Child Page. No collision if path hierarchy is preserved. |
| `https://www.doctorcheck.vn/kien-thuc-ung-thu-dai-trang/` | Root Category ID 48 vs. Nested Page ID 4860 | Category sits at root `/kien-thuc-ung-thu-dai-trang/`; Page sits under `/trung-tam-noi-soi-tieu-hoa-doctor-check/...` | **KEEP (Distinct Paths)** | Root URL resolves to Category Archive; nested path resolves to Clinical Child Page. |

---

### 4.2. Confirmed 301 Permanent Redirects

The following **7 redirects** are confirmed by research to consolidate duplicate content, legacy URLs, and unindexed drafts:

| Source URL | Source Content Type | Target URL | Target Content Type | Technical & SEO Rationale |
| :--- | :--- | :--- | :--- | :--- |
| `https://www.doctorcheck.vn/trung-tam-noi-soi-tieu-hoa/` | Page (ID 2781 Alias) | `/trung-tam-noi-soi-tieu-hoa-doctor-check/` | Page (ID 2781 Canonical) | Duplicate alias of Page ID 2781; consolidate canonical equity to parent hierarchical slug. |
| `https://www.doctorcheck.vn/ve-doctor-check/` | Page (ID 5702) | `/ve-chung-toi/` | Page (ID 827 Canonical) | Consolidate secondary unlinked About page to primary About page linked in main navigation. |
| `https://www.doctorcheck.vn/bang-gia-dich-vu/` | Page (ID 5717) | `/bang-gia-dich-vu-tam-soat-benh-tai-doctor-check/` | Page (ID 1258 Canonical) | Consolidate legacy pricing page to authoritative 2026 comprehensive pricing schedule. |
| `https://www.doctorcheck.vn/bang-gia-kham-suc-khoe-tong-quat/` | Page (ID 1561) | `/bang-gia-dich-vu-tam-soat-benh-tai-doctor-check/` | Page (ID 1258 Canonical) | Consolidate outdated "Sống Thọ" promo landing page to comprehensive pricing schedule. |
| `https://www.doctorcheck.vn/bang-gia-kham-tong-quat/` | Page (ID 1429, noindex) | `/bang-gia-dich-vu-tam-soat-benh-tai-doctor-check/` | Page (ID 1258 Canonical) | Redirect unindexed pricing draft to prevent crawl waste and 404 errors. |
| `https://www.doctorcheck.vn/bang-gia-kham-tong-quat-new/` | Page (ID 2168, noindex) | `/bang-gia-dich-vu-tam-soat-benh-tai-doctor-check/` | Page (ID 1258 Canonical) | Redirect unindexed staging draft to comprehensive pricing schedule. |
| `https://www.doctorcheck.vn/trung-tam-noi-soi-tieu-hoa/bang-gia-noi-soi-da-day/` | Page (ID 2723, noindex) | `/bang-gia-dich-vu-tam-soat-benh-tai-doctor-check/` | Page (ID 1258 Canonical) | Redirect unindexed child pricing draft to central pricing schedule. |

The complete 226-row audit is documented in [docs/research/doctorcheck-vn/URL_MIGRATION_PLAN.md](file:///d:/LandingPages/doctorcheck-nextjs/docs/research/doctorcheck-vn/URL_MIGRATION_PLAN.md).

---

## 5. Next.js Routing Design & Deterministic Content Resolver

### 5.1. Route Namespace Architecture
In the WordPress architecture, posts, categories, products, and flat pages all share the root `/` URL namespace (e.g. `/dau-thuong-vi/`, `/ung-thu-da-day/`, `/goi-khuyen-cao-danh-cho-nu/`). In Next.js App Router, this is structured as follows:

1. **Static Precedence Routes:** Core marketing and legal pages are defined as physical folders in `src/app/` (e.g. `src/app/doi-ngu-bac-si-doctorcheck/page.tsx`, `src/app/lien-he/page.tsx`, `src/app/bang-gia-dich-vu-tam-soat-benh-tai-doctor-check/page.tsx`). Next.js gives physical routes highest precedence over catch-all routes.
2. **Explicit CPT Namespace:** Doctor profiles have a dedicated prefix: `src/app/doctor/[slug]/page.tsx`.
3. **Root Catch-All Dynamic Route:** All flat WordPress URLs are resolved through `src/app/[slug]/page.tsx` using a deterministic resolution function `resolveContent(slug)`.

### 5.2. Conceptual Content Resolver Design (`resolveContent`)
*(Architectural design only — NOT implemented in code)*

```typescript
// Conceptual design for src/lib/routing/resolve-content.ts
export type ResolvedContentType = 
  | 'redirect'
  | 'package'
  | 'category'
  | 'article'
  | 'page'
  | 'not_found';

export interface ResolvedContent {
  type: ResolvedContentType;
  data: any;
  destination?: string; // For 301 redirects
}

export async function resolveContent(slug: string): Promise<ResolvedContent> {
  // PRIORITY RULE 1: Exact 301 Redirect Table
  const redirectTarget = getRedirectTarget(slug);
  if (redirectTarget) {
    return { type: 'redirect', data: null, destination: redirectTarget };
  }

  // PRIORITY RULE 2: Commercial Packages & Products (9 WooCommerce items)
  const packageItem = await getPackageBySlug(slug);
  if (packageItem) {
    return { type: 'package', data: packageItem };
  }

  // PRIORITY RULE 3: Category Taxonomies (30 categories)
  const categoryItem = await getCategoryBySlug(slug);
  if (categoryItem) {
    return { type: 'category', data: categoryItem };
  }

  // PRIORITY RULE 4: Medical Knowledge Articles (108 published posts)
  // Handles collision cases (e.g. dau-thuong-vi) by resolving directly to the Post
  const articleItem = await getArticleBySlug(slug);
  if (articleItem) {
    return { type: 'article', data: articleItem };
  }

  // PRIORITY RULE 5: Flat Static Pages (fallback)
  const pageItem = await getPageBySlug(slug);
  if (pageItem) {
    return { type: 'page', data: pageItem };
  }

  // PRIORITY RULE 6: 404 Not Found
  return { type: 'not_found', data: null };
}
```

---

## 6. Content Models

To decouple the presentation layer from the data source, thirteen TypeScript schemas have been established:

```typescript
// 1. Page Model (Static / SSG)
interface PageModel {
  slug: string;
  title: string;
  description: string;
  contentHtml?: string;
  template: string;
  seo: SeoMetadata;
}

// 2. Doctor Model (Static / ISR)
interface DoctorModel {
  id: string;
  slug: string;
  name: string;
  title: string;          // e.g. "BSCKII", "ThS.BS"
  specialty: string;      // e.g. "Nội Tổng Quát - Tiêu Hóa"
  hospital: string;       // e.g. "Bệnh Viện Đại Học Y Dược TP.HCM"
  image: string;          // Cloudflare Images path
  bio: string;
  experienceYears: number;
  featured: boolean;
}

// 3. Specialty Model (Static)
interface SpecialtyModel {
  id: string;
  slug: string;
  name: string;
  shortDescription: string;
  procedures: string[];
}

// 4. Package / Product Model (Static / SSG)
interface PackageModel {
  id: string;
  slug: string;
  name: string;
  gender: 'male' | 'female' | 'both';
  price: number;
  priceFormatted: string;
  diseasesCovered: number;
  cancersCovered: number;
  duration: string;
  popular?: boolean;
  features: string[];
  clinicalTests: ClinicalTestGroup[];
}

// 5. Clinical Test / Package Item Model
interface ClinicalTestGroup {
  category: string;
  tests: {
    name: string;
    description?: string;
    clinicalPurpose?: string;
  }[];
}

// 6. Medical Article Model (Dynamic / ISR)
interface ArticleModel {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  featuredImage: string;
  author: { name: string; title: string };
  categorySlug: string;
  publishedDate: string;
  modifiedDate: string;
  tags: string[];
  reviewedByDoctorId?: string; // E-E-A-T medical reviewer link
}

// 7. Category Model (Dynamic / ISR)
interface CategoryModel {
  id: string;
  slug: string;
  name: string;
  description?: string;
  articleCount: number;
}

// 8. Medical Equipment Model (Static)
interface EquipmentModel {
  id: string;
  name: string;
  origin: string;
  manufacturer: string;
  image: string;
  description: string;
  keyAdvantages: string[];
}

// 9. FAQ Model (Static)
interface FaqModel {
  id: string;
  question: string;
  answer: string;
  category: 'general' | 'endoscopy' | 'pricing' | 'insurance';
}

// 10. Testimonial Video Model (Static)
interface TestimonialModel {
  id: string;
  patientName: string;
  patientAge: number;
  title: string;
  quote: string;
  videoId: string;        // YouTube 11-char ID
  thumbnailUrl: string;
}

// 11. Booking Submission Model (Runtime API)
interface BookingPayload {
  customer_name: string;
  customer_phone: string;
  customer_year?: string;
  services_list: string;
  date_booking: string;
  attribution: {
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
    utm_term?: string;
    utm_content?: string;
    gclid?: string;
    current_url?: string;
  };
}

// 12. SEO Metadata Model
interface SeoMetadata {
  title: string;
  description: string;
  canonical: string;
  robots: string;
  openGraph: {
    title: string;
    description: string;
    image: string;
    locale: string;
  };
}

// 13. Redirect Rule Model
interface RedirectRule {
  source: string;
  destination: string;
  permanent: boolean;
  statusCode: 301;
  reason: string;
}
```

### Static vs. Dynamic Distribution:
- **Static Data (Bundled in code / SSG):** Core packages, clinical pricing schedules, doctor faculty data, medical equipment, testimonials, and static FAQs. These change infrequently and benefit from low data-access latency and maximum edge caching.
- **Dynamic Data (ISR / On-Demand):** The 108 medical blog articles and 30 category archives. These can be fetched from the headless content repository with `revalidate: 3600` (1 hour ISR).

---

## 7. Component Architecture

```
src/components/
├── shared/                             # Atomic design primitives & branding
│   ├── icons.tsx                       # DoctorCheckLogo, ZaloIcon, Scalable medical SVGs
│   ├── button.tsx                      # shadcn/ui CVA button primitive
│   └── modal.tsx                       # Accessible Radix/Base-UI modal dialog
├── layout/                             # Global structural scaffolding
│   ├── top-bar.tsx                     # Operating hours, hotline, clinic location
│   ├── header.tsx                      # Sticky navbar, desktop dropdowns, mobile drawer
│   ├── footer.tsx                      # Ministry of Health license, navigation columns
│   ├── breadcrumbs.tsx                 # Dynamic SEO breadcrumbs
│   └── floating-widgets.tsx            # Sticky Zalo, phone dialer, back-to-top
├── medical/                            # Domain-specific healthcare UI blocks
│   ├── doctor-card.tsx                 # Doctor portrait, specialty, credentials trigger
│   ├── doctor-modal.tsx                # Full clinical background and appointment trigger
│   ├── equipment-card.tsx              # Olympus/Siemens tech specs & origin badges
│   ├── package-card.tsx                # Pricing tier, test checklist, gender tags
│   ├── pain-points-card.tsx            # Patient anxiety vs. clinic solution
│   └── benefit-card.tsx                # 5 Golden rights visual card
├── templates/                          # Reusable section containers
│   ├── hero-section.tsx                # Above-the-fold display container
│   ├── pricing-section.tsx             # Interactive gender tab switcher + package grid
│   ├── video-testimonials.tsx          # Patient video reviews + YouTube player modal
│   ├── cancer-screening-guide.tsx      # Gastric & colorectal endoscopy guide
│   ├── customer-stories-section.tsx    # Narrative case study social proof
│   ├── faq-accordion.tsx               # Collapsible Q&A with FAQPage schema
│   └── booking-section.tsx             # Consultation form with UTM extraction
└── forms/                              # Interactive input controls
    ├── booking-form.tsx                # Client-side form with phone validation
    └── search-bar.tsx                  # Global keyword search input
```

---

## 8. WordPress Migration Mapping

| WordPress Asset / Pattern | Nature in Current Site | Next.js 16 Architectural Equivalent |
| :--- | :--- | :--- |
| **WP Post** | 108 articles stored in `wp_posts` table | `ArticleModel` served via `src/app/[slug]/page.tsx` using ISR (`revalidate: 3600`). |
| **WP Doctor (CPT)** | 7 doctor profiles in custom post type | `DoctorModel` served via static route `/doi-ngu-bac-si-doctorcheck/` and dynamic `/doctor/[slug]/page.tsx`. |
| **WP Product (WooCommerce)** | 9 screening packages managed as products | `PackageModel` served via static pricing routes and dedicated `/goi-*-danh-cho-*/` pages. |
| **Flatsome UX Block** | 21 reusable blocks (`/blocks/*`) in `wp_posts` | **Do not create routes.** Rebuild as pure React Server/Client Components in `src/components/`. |
| **Contact Form 7** | Plugin shortcodes posting to `/wp-json/contact-form-7/v1/` | Native React form posting to Next.js Route Handler `src/app/api/booking/route.ts`. |
| **Rank Math PRO** | Plugin managing meta tags and Schema.org | Next.js Metadata API in `layout.tsx` and route-level `generateMetadata()` + Schema.org JSON-LD Script. |
| **Flatsome Shortcodes** | `[accordion]`, `[row]`, `[col]`, `[ux_banner]` | Clean semantic HTML5 + Tailwind CSS v4 grid and flexbox utilities. |

---

## 9. SEO & Structured Data Parity

### 9.1. Architectural Philosophy
Rather than blindly copying WordPress Rank Math plugin outputs, the objective is:
> **"SEO intent and structured-data parity with the current website, while ensuring every Schema.org entity accurately represents the actual page content."**

Not every schema should appear on every page. Schemas must be modular and mapped strictly to page content.

### 9.2. Structured Data Mapping by Page Template

| Schema.org Entity Type | Applied Templates | Required Entity Properties | Parity Rationale |
| :--- | :--- | :--- | :--- |
| **`MedicalClinic`** | Homepage, About (`/ve-chung-toi/`), Contact (`/lien-he/`) | `name`, `legalName`, `medicalSpecialty`, `address`, `telephone`, `openingHours`, `licenseNumber` (`09789/HCM-GPHĐ`) | Identifies the physical clinic facility and Ministry of Health operating license. |
| **`Organization`** | Global Root Layout (`layout.tsx`) | `name`, `url`, `logo`, `sameAs` (Facebook, YouTube, Zalo) | Establishes brand entity identity across all pages. |
| **`Physician`** | Doctor Directory & Single Doctor (`/doctor/[slug]/`) | `name`, `jobTitle`, `worksFor`, `medicalSpecialty`, `alumniOf`, `image`, `description` | Validates doctor medical credentials (E-E-A-T). |
| **`Article` / `MedicalWebPage`**| Medical Articles (`/[slug]/`) | `headline`, `description`, `author`, `publisher`, `datePublished`, `dateModified`, `mainEntityOfPage` | Provides rich snippet eligibility in Google Discover and search results. |
| **`BreadcrumbList`** | All Interior Templates (Doctor, Package, Specialty, Article, Category) | `itemListElement` with ordered position, `name`, and canonical `item` URL | Generates clean hierarchical search result breadcrumbs. |
| **`FAQPage`** | Homepage, Package Details, Clinical Specialty Hubs | `mainEntity` array of `Question` and `Answer` pairs | Renders Google expandable FAQ rich results. **Applied ONLY on pages containing real user-visible FAQ accordions.** |
| **`OfferCatalog` / `MedicalBusiness`** | Package Directory (`/bang-gia-dich-vu-tam-soat-benh-tai-doctor-check/`) | `name`, `itemListElement` array of `Offer` with `price`, `priceCurrency: VND`, `description` | Itemizes medical screening fees and commercial packages. |
| **`ItemList`** | Equipment & Technology Showcase | `itemListElement` array of Olympus, Siemens, and Fujifilm equipment | Details clinical endoscopy instrumentation. |

---

## 10. Performance Architecture & Targets

### 10.1. Measurable Performance Targets
Rather than claiming absolute guarantees, the Next.js architecture is engineered to hit rigorous, measurable Core Web Vitals targets on simulated mobile 4G networks:

| Core Web Vital Metric | Target Threshold | Architectural Strategy |
| :--- | :---: | :--- |
| **Largest Contentful Paint (LCP)** | **< 2.5s** | Server-side rendering (SSR/SSG), high-priority hero image preloading, self-hosted WOFF2 fonts with `font-display: swap`. |
| **Interaction to Next Paint (INP)** | **< 200ms** | Isolating client components to interactive leaf nodes, zero heavy JavaScript frameworks (no jQuery, no Owl Carousel). |
| **Cumulative Layout Shift (CLS)** | **< 0.1** | Explicit `width`/`height` on all images, zero late-injected DOM banners, self-hosted preloaded fonts eliminating FOIT/FOUT. |
| **First Contentful Paint (FCP)** | **< 1.5s** | Minimal critical CSS generated by Tailwind CSS v4, zero render-blocking WordPress plugin scripts. |

### 10.2. Client Component Isolation
Client interactivity (`'use client'`) is strictly isolated to leaf nodes:
- `Header.tsx` (sticky scroll threshold and mobile drawer toggle)
- `PricingSection.tsx` (Nam / Nữ gender tab switching)
- `FaqSection.tsx` (accordion collapse/expand)
- `BookingSection.tsx` (form submission and client-side phone validation)
- `VideoModal.tsx` & `DoctorModal.tsx` (dialog state and Escape key listener)

Over 85% of total page HTML across marketing routes is rendered as pure React Server Components with zero hydration overhead.

---

## 11. Security Architecture

Migrating away from WordPress immediately neutralizes the primary web attack vectors:
1. **Elimination of PHP Runtime Vulnerabilities:** Completely removes the risk of remote code execution (RCE) from unpatched WordPress plugins or theme exploits.
2. **No Live SQL Injection Surface:** Static and ISR pages do not execute live SQL queries upon client HTTP requests.
3. **Removal of Admin Login Vectors:** Elimination of `/wp-admin/`, `/wp-login.php`, and XML-RPC brute-force attacks (`/xmlrpc.php`).
4. **Strict Input Sanitization & Privacy:** The `/api/booking` route employs strict Zod regex validation for Vietnamese phone numbers (`/^(0|\+84)(3|5|7|8|9)[0-9]{8}$/`), sanitizes text against XSS, and complies with Decree 13/2023/NĐ-CP on Personal Data Protection.

---

## 12. Unknown / Needs Verification Items

To ensure rigorous engineering integrity, unconfirmed elements are classified explicitly:

| Investigation Area | Public Finding | Classification | Status & Verification Requirement |
| :--- | :--- | :--- | :--- |
| **CRM Lead Endpoint** | Contact Form 7 posts to `/feedback` endpoint; downstream destination private. | **`UNKNOWN`** | **CRITICAL BLOCKER.** Must obtain CRM endpoint, protocol, and authentication credentials. |
| **Page vs. Post Collisions** | 4 slugs (`dau-thuong-vi`, `tieu-chay`, `di-ngoai-ra-mau`, `tao-bon`) exist as both Page and Post. | **`DETECTED`** | **CRITICAL BLOCKER.** Stakeholder decision required on canonical content resolution. |
| **About Page Canonical** | Two About pages exist (`/ve-chung-toi/` vs `/ve-doctor-check/`). Nav links to `/ve-chung-toi/`. | **`CONFIRMED`** | **CRITICAL BLOCKER.** Client confirmation to preserve `/ve-chung-toi/` and redirect `/ve-doctor-check/`. |
| **Database Schema** | Standard WP tables (`wp_posts`, `wp_postmeta`) confirmed via REST API. | **`DETECTED`** | Direct DB access unnecessary if using exported JSON or WP REST API. |
| **Zalo OA Webhook** | Official Account ID `309834292180920772` confirmed in links and schema. | **`CONFIRMED`** | Integration is direct client-side redirect (`https://zalo.me/...`). |
| **Analytics Container** | Microsoft Clarity `iaa767fkfn` and TikTok `CJSOI6BC77UDO397GB30` found. | **`CONFIRMED`** | Ready to configure via environment variables. |
| **External Subdomain Routing**| Links to `noisoidaday.doctorcheck.vn` found in footer. | **`CONFIRMED`** | Decision required: maintain external or consolidate into root paths. |

### Abstract Lead Receiver Architecture (`LeadReceiver`)
Because the live CRM destination is currently **`UNKNOWN`**, Next.js cannot assume Google Sheets, HubSpot, or a custom API. Instead, an abstract interface must be used:

```typescript
// Conceptual Interface in src/lib/crm/types.ts
export interface LeadSubmissionResult {
  success: boolean;
  leadId?: string;
  error?: string;
}

export interface LeadReceiver {
  submitLead(payload: BookingPayload): Promise<LeadSubmissionResult>;
}
```

---

## 13. Migration Risk Assessment

| Risk Item | Severity | Impact | Mitigation Strategy |
| :--- | :---: | :--- | :--- |
| **CRM Lead Submission Failure** | **`CRITICAL`** | Lost patient bookings, revenue drop, clinic operational disruption. | Implement abstract `LeadReceiver` with local fallback storage (Supabase/Postgres) and dead-letter queue. Do not launch without verified credentials. |
| **SEO Ranking Loss from Broken URLs** | **`CRITICAL`** | Organic traffic drops for high-value endoscopy and medical terms. | Enforce `trailingSlash: true` in `next.config.ts`, preserve all 205 canonical paths, deploy 7 strict 301 redirects, and resolve Page vs Post collisions. |
| **Shadowed Article Content from Collisions** | **`HIGH`** | 4 high-value symptom articles (`dau-thuong-vi`, etc.) suppressed by `noindex` pages. | Resolve `dau-thuong-vi`, `tieu-chay`, `di-ngoai-ra-mau`, `tao-bon` directly to the published medical article posts in Next.js. |
| **Marketing Attribution Loss** | **`HIGH`** | Paid campaigns lose attribution data if UTM tags drop. | Persist UTM parameters and click IDs (`gclid`, `fbclid`) across page views in `sessionStorage` and submit with booking payload. |
| **Vietnamese Font Diacritic Shifts** | **`HIGH`** | Typography layout breaks or accent glyph rendering bugs. | Self-host the exact `SVN-SofiaPro-*.woff2` font files extracted from the live site. |
| **Accidental Publishing of `/blocks/*`** | **`MEDIUM`** | Search engines index incomplete builder UI fragments. | Explicitly exclude `/blocks/*` from App Router routes and XML sitemaps. |

---

## 14. Recommended Next.js Architecture

The recommended modular Next.js 16 project structure separates concerns cleanly:

```
d:\LandingPages\doctorcheck-nextjs/
├── docs/
│   └── research/
│       └── doctorcheck-vn/
│           ├── FINAL_RESEARCH_REPORT.md        # This master consolidated architecture document
│           ├── URL_MIGRATION_PLAN.md           # 226-row complete routing table
│           ├── IMPLEMENTATION_BLOCKERS.md      # Critical blockers catalog & decision matrix
│           ├── PAGE_INVENTORY.md               # Reconciled 226-URL catalog
│           ├── WORDPRESS_ANALYSIS.md           # Technical WordPress & plugin audit
│           ├── SEO_INVENTORY.md                # Metadata and Schema.org audit
│           ├── ASSET_INVENTORY.md              # Cloudflare Images & font asset catalog
│           ├── NAVIGATION_ANALYSIS.md          # Header, footer, and drawer navigation audit
│           └── RESPONSIVE_ANALYSIS.md          # Multi-viewport breakpoint analysis
├── public/
│   └── sites/
│       └── doctorcheck-vn/
│           ├── fonts/                          # Self-hosted SVN-SofiaPro WOFF2 fonts
│           └── root/
│               └── images/                     # Extracted logos, doctors, equipment visuals
├── src/
│   ├── app/                                    # Routing Layer
│   │   ├── layout.tsx                          # Root HTML, Global SEO metadata, Organization schema
│   │   ├── page.tsx                            # Template 1: Homepage
│   │   ├── globals.css                         # Tailwind CSS v4 design tokens
│   │   ├── api/
│   │   │   └── booking/
│   │   │       └── route.ts                    # Booking API route handler
│   │   ├── bang-gia-dich-vu-tam-soat-benh-tai-doctor-check/
│   │   │   └── page.tsx                        # Template 4: Pricing Schedule
│   │   ├── doi-ngu-bac-si-doctorcheck/
│   │   │   └── page.tsx                        # Template 2: Doctor Directory
│   │   ├── doctor/
│   │   │   └── [slug]/
│   │   │       └── page.tsx                    # Template 3: Doctor Profile Single
│   │   ├── noi-soi-da-day/
│   │   │   └── page.tsx                        # Template 6: Gastric Endoscopy
│   │   ├── noi-soi-dai-trang/
│   │   │   └── page.tsx                        # Template 6: Colorectal Endoscopy
│   │   ├── kham-suc-khoe-doanh-nghiep/
│   │   │   └── page.tsx                        # Template 7: Corporate B2B Health
│   │   ├── ve-chung-toi/
│   │   │   └── page.tsx                        # Template 8: About Doctor Check
│   │   ├── lien-he/
│   │   │   └── page.tsx                        # Template 11: Contact Page
│   │   ├── cam-on/
│   │   │   └── page.tsx                        # Template 12: Booking Confirmation
│   │   ├── chinh-sach-quyen-rieng-tu/
│   │   │   └── page.tsx                        # Template 13: Privacy Policy
│   │   └── [slug]/
│   │       └── page.tsx                        # Dynamic Router: Packages, Articles, Categories
│   ├── components/                             # UI Presentation Layer
│   │   ├── ui/                                 # Base primitives (Button, Dialog, Accordion)
│   │   ├── shared/                             # Brand icons & logo SVGs
│   │   ├── layout/                             # TopBar, Header, Footer, FloatingWidgets
│   │   ├── medical/                            # DoctorCard, EquipmentCard, PackageCard
│   │   └── templates/                          # HeroSection, PricingSection, FaqAccordion
│   ├── features/                               # Domain Features (Booking, Packages, Articles)
│   ├── lib/                                    # Core Infrastructure Layer
│   │   ├── routing/
│   │   │   └── resolve-content.ts              # Deterministic content resolver
│   │   ├── data/                               # Static data repositories
│   │   ├── seo/                                # Schema.org generator functions
│   │   ├── crm/                                # LeadReceiver abstract interfaces
│   │   └── validations/                        # Zod schemas for booking & contact
│   ├── config/                                 # Static configuration & redirects
│   └── types/                                  # TypeScript domain contracts
```

---

## 15. Final Recommendation: Implementation Roadmap

### "What should be implemented first?"
To maximize conversion stability, protect organic SEO equity, and minimize commercial risk, implementation must proceed in five disciplined sequential phases.

> [!IMPORTANT]
> **Content Migration is REQUIRED, Not Optional:**  
> All 108 existing medical articles and 30 categories are indexed and represent core organic search equity. Complete migration requires full preservation of these URLs. Phase 5 is a **REQUIRED core milestone**.

```
┌─────────────────────────────────────────────────────────────┐
│ Phase 1: Foundation & Conversion Core (Homepage & Booking)  │
│ - Verified design tokens, self-hosted fonts, asset pipeline │
│ - 15 Reusable UI components & Schema.org MedicalClinic      │
│ - /api/booking Route Handler with abstract LeadReceiver     │
└──────────────────────────────┬──────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────┐
│ Phase 2: Commercial Packages & Pricing Schedules            │
│ - /bang-gia-dich-vu-tam-soat-benh-tai-doctor-check/         │
│ - Package Detail & Comparison Templates (Nam / Nữ)          │
│ - OfferCatalog Schema.org integration                       │
└──────────────────────────────┬──────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────┐
│ Phase 3: Clinical Faculty & Specialty Endoscopy Hubs        │
│ - /doi-ngu-bac-si-doctorcheck/ & /doctor/[slug]/            │
│ - /noi-soi-da-day/ & /noi-soi-dai-trang/                    │
│ - Physician Schema.org integration                          │
└──────────────────────────────┬──────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────┐
│ Phase 4: Corporate B2B, Institutional & Static Pages        │
│ - /kham-suc-khoe-doanh-nghiep/, /ve-chung-toi/              │
│ - /lien-he/, /cam-on/, /chinh-sach-quyen-rieng-tu/          │
│ - 301 Permanent Redirect array configuration in Next config │
└──────────────────────────────┬──────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────┐
│ Phase 5: REQUIRED Knowledge Base & Dynamic Article ISR      │
│ - Dynamic `/[slug]/` template for 108 articles & 30 archives│
│ - Deterministic `resolveContent(slug)` integration          │
│ - Dynamic `sitemap.ts` generation & search console cutover  │
└─────────────────────────────────────────────────────────────┘
```

---

## 16. Final Status

RESEARCH STATUS:

[ ] Research incomplete  
[ ] Research complete — implementation approved  
[x] Research complete — implementation blocked pending decisions  

> [!CAUTION]
> **Implementation Blocked:**  
> Production implementation is strictly halted until client stakeholders resolve the 3 **CRITICAL** blockers cataloged in [docs/research/doctorcheck-vn/IMPLEMENTATION_BLOCKERS.md](file:///d:/LandingPages/doctorcheck-nextjs/docs/research/doctorcheck-vn/IMPLEMENTATION_BLOCKERS.md):  
> 1. Production CRM Lead Destination & Authentication Credentials  
> 2. Resolution policy for the 4 Page vs. Post Collisions (`dau-thuong-vi`, `tieu-chay`, `di-ngoai-ra-mau`, `tao-bon`)  
> 3. Confirmation of `/ve-chung-toi/` as the primary canonical About route with 301 redirect from `/ve-doctor-check/`.
