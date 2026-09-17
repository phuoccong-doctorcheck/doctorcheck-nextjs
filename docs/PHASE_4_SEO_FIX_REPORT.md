# PHASE 4 — SEO FIX IMPLEMENTATION REPORT (P1 + P2)

> **Document Code:** `PHASE_4_SEO_FIX_REPORT.md`  
> **Target Website:** [DoctorCheck.vn](https://doctorcheck.vn/)  
> **Date:** 2026-09-15  
> **Environment:** Next.js 16.3.0 App Router, React 19.2.4, TypeScript Strict Mode, Standalone SSG Build  
> **Execution Scope:** Implementation and verification of P1 and P2 issues from `PHASE_4_SEO_AUDIT.md` (SEO-ISS-01, SEO-ISS-02, SEO-ISS-03, SEO-ISS-04).

---

## 1. Files Changed

| File Path | Issues Addressed | Description of Changes |
| :--- | :---: | :--- |
| `src/app/layout.tsx` | `SEO-ISS-01`<br/>`SEO-ISS-02` | Added `alternates: { canonical: '/' }` to root metadata. Replaced `next/script` `<Script>` with standard static `<script type="application/ld+json">`. |
| `src/lib/routing/resolve-content.ts` | `SEO-ISS-03` | Updated `resolveContent()` and `resolveEndoscopySubpath()` to use `fullPage?.title` with HTML entity cleaning (`cleanTitle`) instead of raw kebab-case slugs. |
| `src/lib/seo/structured-data.ts` | `SEO-ISS-04` | Added Schema.org-compliant `generateBreadcrumbJsonLd()`, `generateArticleBreadcrumbJsonLd()`, `generatePackageBreadcrumbJsonLd()`, `generateCategoryBreadcrumbJsonLd()`, and `generateHubBreadcrumbJsonLd()`. |
| `src/app/[slug]/page.tsx` | `SEO-ISS-04` | Injected `BreadcrumbList` JSON-LD for Articles, Packages, and Categories via inline `<script type="application/ld+json">`. |
| `src/app/trung-tam-noi-soi-tieu-hoa-doctor-check/[...subpath]/page.tsx` | `SEO-ISS-04` | Injected `BreadcrumbList` JSON-LD for multi-segment and single-segment endoscopy hub subpaths. |

---

## 2. Changes Made & Rationale

### A. SEO-ISS-01: Homepage Canonical Link
- **Root Cause:** In Next.js App Router, omitting `alternates.canonical` on root layout metadata resulted in no `<link rel="canonical">` tag rendered for `/`.
- **Implementation:** Added `alternates: { canonical: '/' }` within `metadata` in `src/app/layout.tsx`. With `metadataBase: new URL('https://doctorcheck.vn')`, Next.js resolves this to `https://doctorcheck.vn/`.
- **Constraint Preserved:** Per-page `generateMetadata` in `[slug]`, `doctor/[slug]`, and `[...subpath]` continues to override with their exact canonical URLs.

### B. SEO-ISS-02: Global Organization JSON-LD in Static HTML
- **Root Cause:** Root layout used `next/script` `<Script id="doctorcheck-schema" type="application/ld+json"...>`, which Next.js client-hydrates via `afterInteractive` rather than outputting directly into the initial static HTML file during SSG.
- **Implementation:** Replaced `<Script>` with standard native `<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdSchema) }} />` in `src/app/layout.tsx`.
- **Constraint Preserved:** Preserved the exact Schema.org graph unchanged (`MedicalClinic`, `MedicalOrganization`, `LocalBusiness`, 7 `Physician` entries, `OfferCatalog`). Zero synthetic reviews, ratings, or claims added.

### C. SEO-ISS-03: Authentic Human-Readable Titles for Static & Hub Pages
- **Root Cause:** In `src/lib/routing/resolve-content.ts`, static pages and endoscopy hub subpaths resolved `title: page.title`, where `page.title` defaulted to the kebab-case slug in `staticPagesData` (e.g. `doi-ngu-bac-si-doctorcheck`).
- **Implementation:** Updated `resolveContent()` (line 170) and `resolveEndoscopySubpath()` (line 198) to dynamically resolve `title: fullPage?.title ? cleanTitle(fullPage.title) : page.title` using authentic titles from `pagesContentMap` (`pages-content.json`) with HTML entity decoding (e.g. `&#038;` $\rightarrow$ `&`).
- **Constraint Preserved:** Zero manual hardcoding; titles are dynamically pulled from authentic WordPress page content data. 108 articles, 8 packages, 30 categories, 7 doctors, and collision routes remain unaffected.

### D. SEO-ISS-04: BreadcrumbList Structured Data
- **Root Cause:** No breadcrumb structured data existed across hierarchical content types.
- **Implementation:** Added `generateBreadcrumbJsonLd()` utility adhering strictly to Schema.org standards:
  - 1-based indexing (`position: 1, 2, 3...`)
  - Strict trailing slashes on all item URLs
  - Hierarchical structure reflecting authentic navigation:
    - **Articles:** `Trang chủ` $\rightarrow$ `[Category Name]` $\rightarrow$ `[Article Title]`
    - **Packages:** `Trang chủ` $\rightarrow$ `Bảng Giá Dịch Vụ` $\rightarrow$ `[Package Name]`
    - **Categories:** `Trang chủ` $\rightarrow$ `[Category Name]`
    - **Endoscopy Hub Subpaths:** `Trang chủ` $\rightarrow$ `Trung Tâm Nội Soi Tiêu Hóa` $\rightarrow$ `[Parent Hub Section]` $\rightarrow$ `[Page Title]`
- **Constraint Preserved:** Structured data is injected purely as JSON-LD; zero UI alterations to visible layouts.

---

## 3. SEO-ISS-01 Verification Result

- **Test Target:** `.next/server/app/index.html`
- **Generated HTML Snippet:**
  ```html
  <link rel="canonical" href="https://doctorcheck.vn/"/>
  ```
- **Verification Result:** **`PASS`**
  - Homepage initial static HTML now includes exact self-canonical `<link rel="canonical" href="https://doctorcheck.vn/"/>`.
  - Zero canonical duplication.
  - Zero side-effects on child dynamic routes.

---

## 4. SEO-ISS-02 Verification Result

- **Test Target:** `.next/server/app/index.html`
- **Generated HTML Snippet:**
  ```html
  <script type="application/ld+json">{"@context":"https://schema.org","@graph":[{"@type":["MedicalClinic","MedicalOrganization","LocalBusiness"],"@id":"https://doctorcheck.vn/#organization","name":"Doctor Check – Tầm Soát Bệnh Để Sống Thọ Hơn",...},{"@type":"Physician","name":"BSCKII Trịnh Ái Nhi",...},...,{"@type":"OfferCatalog","name":"Bảng Giá Gói Tầm Soát Bệnh – Doctor Check 2026",...}]}</script>
  ```
- **Verification Result:** **`PASS`**
  - JSON-LD script count in raw static HTML for `/`: **1** (previously 0).
  - Contains complete `@graph` with `MedicalClinic`, `MedicalOrganization`, `LocalBusiness`, 7 `Physician` entries, and `OfferCatalog`.
  - Verified valid JSON syntax; no duplicate global schemas on child routes.

---

## 5. SEO-ISS-03 Verification Result

- **Test Targets:** Representative static pages and endoscopy hub subpaths in `.next/server/app/`

| Route | Old Raw HTML `<title>` | New Raw HTML `<title>` | Status |
| :--- | :--- | :--- | :---: |
| `/doi-ngu-bac-si-doctorcheck/` | `doi-ngu-bac-si-doctorcheck \| Doctor Check Tầm Soát Bệnh` | `Đội Ngũ Bác Sĩ \| Doctor Check Tầm Soát Bệnh` | **PASS** |
| `/ve-doctor-check/` | `ve-doctor-check \| Doctor Check Tầm Soát Bệnh` | `Về Doctor Check \| Doctor Check Tầm Soát Bệnh` | **PASS** |
| `/bang-gia-dich-vu-tam-soat-benh-tai-doctor-check/` | `bang-gia-dich-vu-tam-soat-benh-tai-doctor-check \| Doctor Check Tầm Soát Bệnh` | `Bảng Giá Dịch Vụ Tầm Soát Bệnh Tại Doctor Check \| Doctor Check Tầm Soát Bệnh` | **PASS** |
| `/trung-tam-noi-soi-tieu-hoa-doctor-check/10-tieu-chuan-vang/` | `10-tieu-chuan-vang \| Trung Tâm Nội Soi Tiêu Hóa Doctor Check` | `10 tiêu chuẩn vàng \| Trung Tâm Nội Soi Tiêu Hóa Doctor Check` | **PASS** |
| `.../tam-soat-ung-thu-da-day-tai-doctor-check/kien-thuc-ung-thu-da-day/` | `kien-thuc-ung-thu-da-day \| Trung Tâm Nội Soi Tiêu Hóa Doctor Check` | `Kiến thức ung thư dạ dày \| Trung Tâm Nội Soi Tiêu Hóa Doctor Check` | **PASS** |

- **Verification Result:** **`PASS`**
  - All 25 root static pages and 18 endoscopy hub subpaths render clean, human-readable Vietnamese titles and descriptions.

---

## 6. SEO-ISS-04 Verification Result

- **Test Targets:** Articles, Packages, Categories, and Endoscopy Hub subpaths in `.next/server/app/`

### A. Medical Knowledge Articles
- **JSON-LD in raw HTML:** `MedicalWebPage` + `BreadcrumbList`
- **Sample Breadcrumb:**
  ```json
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Trang chủ", "item": "https://doctorcheck.vn/" },
      { "@type": "ListItem", "position": 2, "name": "Câu chuyện khách hàng", "item": "https://doctorcheck.vn/cau-chuyen-khach-hang/" },
      { "@type": "ListItem", "position": 3, "name": "10 Điểm Không Có Nhưng, Anh Trung Trải Nghiệm Tầm Soát Bệnh Chỉ 90 Phút", "item": "https://doctorcheck.vn/10-diem-khong-co-nhung-anh-trung-trai-nghiem-tam-soat-benh-chi-90-phut/" }
    ]
  }
  ```
- **Status:** **`PASS`**

### B. Clinical Examination Packages
- **JSON-LD in raw HTML:** `Product` + `BreadcrumbList`
- **Sample Breadcrumb:**
  ```json
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Trang chủ", "item": "https://doctorcheck.vn/" },
      { "@type": "ListItem", "position": 2, "name": "Bảng Giá Dịch Vụ", "item": "https://doctorcheck.vn/bang-gia-dich-vu-tam-soat-benh-tai-doctor-check/" },
      { "@type": "ListItem", "position": 3, "name": "Gói Khám Sức Khỏe Khuyến Cáo Dành Cho Nữ", "item": "https://doctorcheck.vn/goi-khuyen-cao-danh-cho-nu/" }
    ]
  }
  ```
- **Status:** **`PASS`**

### C. Taxonomy Categories
- **JSON-LD in raw HTML:** `BreadcrumbList`
- **Sample Breadcrumb:**
  ```json
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Trang chủ", "item": "https://doctorcheck.vn/" },
      { "@type": "ListItem", "position": 2, "name": "12 Loại Ung Thư Thường Gặp", "item": "https://doctorcheck.vn/12-loai-ung-thu-thuong-gap/" }
    ]
  }
  ```
- **Status:** **`PASS`**

### D. Endoscopy Hub Subpaths
- **JSON-LD in raw HTML:** `BreadcrumbList`
- **Sample Breadcrumb:**
  ```json
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Trang chủ", "item": "https://doctorcheck.vn/" },
      { "@type": "ListItem", "position": 2, "name": "Trung Tâm Nội Soi Tiêu Hóa", "item": "https://doctorcheck.vn/trung-tam-noi-soi-tieu-hoa-doctor-check/" },
      { "@type": "ListItem", "position": 3, "name": "Tầm soát ung thư dạ dày", "item": "https://doctorcheck.vn/trung-tam-noi-soi-tieu-hoa-doctor-check/tam-soat-ung-thu-da-day-tai-doctor-check/" },
      { "@type": "ListItem", "position": 4, "name": "Kiến thức ung thư dạ dày", "item": "https://doctorcheck.vn/trung-tam-noi-soi-tieu-hoa-doctor-check/tam-soat-ung-thu-da-day-tai-doctor-check/kien-thuc-ung-thu-da-day/" }
    ]
  }
  ```
- **Status:** **`PASS`**

---

## 7. Production Build & Validation Result

- **Command:** `npm run check` (`npm run lint` + `npm run typecheck` + `npm run build`)
- **Lint Result:** **`0 Errors`** (Exit Code 0)
- **TypeScript Result:** **`0 Errors`** (Strict Mode, Exit Code 0)
- **Turbopack Build Result:** **`206 Static HTML Pages Generated`** (Exit Code 0)

```
Route (app)
┌ ○ /
├ ○ /_not-found
├   /[slug]
│ ├ ● /tu-kiem-dinh-quoc-te-den-thuc-hanh-hang-ngay-trien-khai-aaci-trong-mo-hinh-phong-kham-tai-doctor-check
│ ├ ● /gan-mot-thang-toi-an-khong-ngon-ngu-cung-khong-yen
│ ├ ● /doctor-check-dat-chung-nhan-lam-sang-xuat-sac-cho-dich-vu-noi-soi-dau-tien-tai-viet-nam
│ └ ● [+170 more paths]
├ ƒ /api/booking
├   /doctor/[slug]
│ ├ ● /doctor/trinh-ai-nhi
│ ├ ● /doctor/chau-quynh-phi-nha
│ ├ ● /doctor/nguyen-ngoc-quynh-dung
│ └ ● [+4 more paths]
├ ○ /robots.txt
├ ○ /sitemap.xml
└   /trung-tam-noi-soi-tieu-hoa-doctor-check/[...subpath]
  ├ ● /trung-tam-noi-soi-tieu-hoa-doctor-check/bao-chi-dua-tin
  ├ ● /trung-tam-noi-soi-tieu-hoa-doctor-check/tam-soat-ung-thu-da-day-tai-doctor-check/kien-thuc-ung-thu-da-day
  ├ ● /trung-tam-noi-soi-tieu-hoa-doctor-check/tam-soat-ung-thu-dai-trang-tai-doctor-check/kien-thuc-ung-thu-dai-trang
  └ ● [+16 more paths]
```

---

## 8. Regression & Parity Test Results

| Parity Metric | Baseline Target | Post-Fix Verified | Status |
| :--- | :---: | :---: | :---: |
| **Canonical URLs** | **197** | **197** | **PASS** |
| **Sitemap URLs** | **197** | **197** | **PASS** |
| **Trailing Slash Enforcement** | **100%** | **100% (197/197)** | **PASS** |
| **Legacy 301 Redirects** | **10** | **10** | **PASS** |
| **Medical Articles** | **108** | **108** | **PASS** |
| **Clinical Packages** | **8 (canonical)** | **8 (canonical)** | **PASS** |
| **Doctor Profiles** | **7** | **7** | **PASS** |
| **Taxonomy Categories** | **30** | **30** | **PASS** |
| **Authentic Images** | **1,018** | **1,018** | **PASS** |
| **Internal Verified Links** | **118** | **118** | **PASS** |
| **Broken Routes / 404s** | **0** | **0** | **PASS** |

---

## 9. Final Phase 4 Fix Status

```
=====================================================
PHASE 4 FIX STATUS: PASS
=====================================================
- SEO-ISS-01 (Homepage Canonical):        FIXED & VERIFIED
- SEO-ISS-02 (Global Static JSON-LD):     FIXED & VERIFIED
- SEO-ISS-03 (Static Page & Hub Titles):  FIXED & VERIFIED
- SEO-ISS-04 (Breadcrumb Structured Data): FIXED & VERIFIED
- All 197 Canonical URLs:                 100% VERIFIED
- All 197 Sitemap Entries:                100% VERIFIED
- Zero Regression across Phase 1–3:       100% VERIFIED
=====================================================
```
