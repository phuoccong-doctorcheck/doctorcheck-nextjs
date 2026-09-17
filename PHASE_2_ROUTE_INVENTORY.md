# Phase 2 Route Inventory: DoctorCheck Rebuild

**Target Project:** DoctorCheck.vn Next.js App Router  
**Document Code:** `PHASE_2_ROUTE_INVENTORY.md`  
**Scope:** Complete inventory of all routes established in `src/app/`, their matching target URLs, template bindings, and routing classifications.

---

## 1. Route Classification Breakdown

| Classification | Count | Path Patterns | Primary Function |
| :--- | :---: | :--- | :--- |
| **Static Core Routes** | **3** | `/`, `/robots.txt`, `/sitemap.xml` | Homepage, SEO crawler instructions, and canonical XML sitemap |
| **Root Dynamic Route** | **1 (Multi-type)** | `/[slug]/` | Deterministic root resolver for Articles (108), Categories (30), Packages (9), and Root Pages (32) |
| **Dedicated Doctor Route** | **1** | `/doctor/[slug]/` | Preserves WordPress 1:1 doctor profile URLs for 7 licensed physicians |
| **Nested Endoscopy Hub Route** | **1** | `/trung-tam-noi-soi-tieu-hoa-doctor-check/[...subpath]/` | Resolves all 18 multi-segment clinical endoscopy subpages |
| **API Route** | **1** | `/api/booking/` | Secure patient appointment submission endpoint |
| **Legacy 301 Redirect Table** | **10** | Configured in `next.config.ts` & `redirects.ts` | Permanent redirects for deprecated, duplicate, or staging URLs |
| **TOTAL ROUTING SURFACE** | **205 Public URLs + 10 Redirects + 1 API + 2 SEO Endpoints** | Complete coverage |

---

## 2. Comprehensive Route Inventory Table

| Current Route Pattern | Intended Old URL | Content Type | Template | Action |
| :--- | :--- | :--- | :--- | :--- |
| `src/app/page.tsx` (`/`) | `https://www.doctorcheck.vn/` | Homepage | `HomePage` (`page.tsx`) | Preserved (Static P0) |
| `src/app/sitemap.ts` (`/sitemap.xml`) | `https://www.doctorcheck.vn/sitemap.xml` | SEO XML Sitemap | Next.js Metadata Route | Serves 197 canonical URLs |
| `src/app/robots.ts` (`/robots.txt`) | `https://www.doctorcheck.vn/robots.txt` | SEO Robots Directive | Next.js Metadata Route | Allows crawl, blocks /api/ |
| `src/app/api/booking/route.ts` (`/api/booking`) | Internal CRM API | API Endpoint | JSON Route Handler | Patient appointment handler |
| `src/app/doctor/[slug]/page.tsx` | `https://www.doctorcheck.vn/doctor/[slug]/` | Doctor Profiles (7) | `DoctorTemplate` | Preserved 1:1 (7 physicians) |
| `src/app/trung-tam-noi-soi-tieu-hoa-doctor-check/[...subpath]/page.tsx` | `https://www.doctorcheck.vn/trung-tam-noi-soi-tieu-hoa-doctor-check/*` | Clinical Pages (18) | `PageTemplate` | Preserved (18 nested pages) |
| `src/app/[slug]/page.tsx` (Articles) | `https://www.doctorcheck.vn/[slug]/` | Medical Articles (108) | `ArticleTemplate` | Deterministic Dynamic ISR |
| `src/app/[slug]/page.tsx` (Categories) | `https://www.doctorcheck.vn/[slug]/` | Taxonomy Categories (30) | `CategoryTemplate` | Deterministic Dynamic ISR |
| `src/app/[slug]/page.tsx` (Packages) | `https://www.doctorcheck.vn/[slug]/` | Examination Packages (8 active) | `PackageTemplate` | Deterministic Dynamic ISR |
| `src/app/[slug]/page.tsx` (Root Pages) | `https://www.doctorcheck.vn/[slug]/` | Static Pages (32 distinct) | `PageTemplate` | Deterministic Dynamic ISR |
| `next.config.ts` (`/ve-chung-toi/`) | `https://www.doctorcheck.vn/ve-chung-toi/` | WordPress Page (ID 827) | N/A (301 Redirect) | Redirects to `/ve-doctor-check/` |
| `next.config.ts` (`/bang-gia-dich-vu/`) | `https://www.doctorcheck.vn/bang-gia-dich-vu/` | WordPress Page (ID 5717) | N/A (301 Redirect) | Redirects to `/bang-gia-dich-vu-tam-soat-benh-tai-doctor-check/` |
| `next.config.ts` (`/bang-gia-kham-suc-khoe-tong-quat/`) | `https://www.doctorcheck.vn/bang-gia-kham-suc-khoe-tong-quat/` | WordPress Page (ID 1561) | N/A (301 Redirect) | Redirects to `/bang-gia-dich-vu-tam-soat-benh-tai-doctor-check/` |
| `next.config.ts` (`/trung-tam-noi-soi-tieu-hoa/`) | `https://www.doctorcheck.vn/trung-tam-noi-soi-tieu-hoa/` | WordPress Page (Alias 2781) | N/A (301 Redirect) | Redirects to `/trung-tam-noi-soi-tieu-hoa-doctor-check/` |
| `next.config.ts` (`/goi-ung-thu-da-day/`) | `https://www.doctorcheck.vn/goi-ung-thu-da-day/` | WooCommerce Product | N/A (301 Redirect) | Redirects to `/tam-soat-ung-thu-da-day/` |
| `next.config.ts` (`/goi-kham-danh-cho-nam/`) | `https://www.doctorcheck.vn/goi-kham-danh-cho-nam/` | Legacy Campaign Alias | N/A (301 Redirect) | Redirects to `/goi-tam-soat-nam/` |
| `next.config.ts` (`/goi-kham-danh-cho-nu/`) | `https://www.doctorcheck.vn/goi-kham-danh-cho-nu/` | Legacy Campaign Alias | N/A (301 Redirect) | Redirects to `/goi-tam-soat-nu/` |
| `next.config.ts` (`/bang-gia-kham-tong-quat/`) | `https://www.doctorcheck.vn/bang-gia-kham-tong-quat/` | Unindexed WP Draft | N/A (301 Redirect) | Redirects to `/bang-gia-dich-vu-tam-soat-benh-tai-doctor-check/` |
| `next.config.ts` (`/bang-gia-kham-tong-quat-new/`) | `https://www.doctorcheck.vn/bang-gia-kham-tong-quat-new/` | Unindexed WP Draft | N/A (301 Redirect) | Redirects to `/bang-gia-dich-vu-tam-soat-benh-tai-doctor-check/` |
| `next.config.ts` (`/trung-tam-noi-soi-tieu-hoa/bang-gia-noi-soi-da-day/`) | `https://www.doctorcheck.vn/trung-tam-noi-soi-tieu-hoa/bang-gia-noi-soi-da-day/` | Unindexed Child Draft | N/A (301 Redirect) | Redirects to `/bang-gia-dich-vu-tam-soat-benh-tai-doctor-check/` |

---

## 3. Route Collision Inventory & Deterministic Strategy

| Colliding Slug | Entity 1 (Old WP) | Entity 2 (Old WP) | Next.js Resolution Rule | Final Served Entity |
| :--- | :--- | :--- | :--- | :--- |
| `dau-thuong-vi` | Draft Page (ID 3212) | Published Post (ID 3622) | Article priority override | **Medical Article (Post 3622)** |
| `tieu-chay` | Draft Page (ID 3162) | Published Post (ID 3773) | Article priority override | **Medical Article (Post 3773)** |
| `di-ngoai-ra-mau` | Draft Page (ID 3125) | Published Post (ID 3750) | Article priority override | **Medical Article (Post 3750)** |
| `tao-bon` | Draft Page (ID 3110) | Published Post (ID 3797) | Article priority override | **Medical Article (Post 3797)** |
| `kien-thuc-ung-thu-da-day` | Root Category (ID 47) | Nested Page (ID 4868) | Path-depth differentiation | **Root `/[slug]` -> Category (47); Nested -> Page (4868)** |
| `kien-thuc-ung-thu-dai-trang` | Root Category (ID 48) | Nested Page (ID 4860) | Path-depth differentiation | **Root `/[slug]` -> Category (48); Nested -> Page (4860)** |

---

## 4. Artificial URL Structure Prevention

The following artificial structures were actively avoided and rejected:
- `/blog/[slug]`: **REJECTED.** All 108 articles live directly at `/[slug]/`.
- `/services/[slug]`: **REJECTED.** All packages live at `/[slug]/`.
- `/doctors/[slug]`: **REJECTED.** Doctor profiles live at `/doctor/[slug]/` (preserving WP singular convention).
