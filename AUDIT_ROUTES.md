# Phase 2: Routing & URL Collision Audit

**Project:** DoctorCheck Next.js Migration  
**Target Codebase:** `d:\LandingPages\DoctorCheck`  
**Date:** 2026-09-15  
**Auditor:** Antigravity AI Engineering Team  

---

## 1. Route Inventory of Current Implementation

| URL | Route File | Template Pattern | Current Status | Critical Audit Notes |
| :--- | :--- | :--- | :---: | :--- |
| `/` | `src/app/(frontend)/page.tsx` | Homepage Template | Active (200) | Homepage layout built with modular blocks. |
| `/_not-found` | `src/app/(frontend)/not-found.tsx` | 404 Error Template | Active (404) | Branded 404 screen. |
| `/about` | `src/app/(frontend)/about/page.tsx` | About Clinic Template | **FAIL (URL Mismatch)** | **Breaks live URL.** Live DoctorCheck URL is `/ve-chung-toi/`. |
| `/doctors` | `src/app/(frontend)/doctors/page.tsx` | Doctor Directory | **FAIL (URL Mismatch)** | **Breaks live URL.** Live DoctorCheck URL is `/doi-ngu-bac-si-doctorcheck/`. |
| `/doctors/[slug]` | `src/app/(frontend)/doctors/[slug]/page.tsx` | Doctor Detail Single | **FAIL (URL Mismatch)** | **Breaks live URL.** Live DoctorCheck URL prefix is `/doctor/[slug]/` (singular). |
| `/services` | `src/app/(frontend)/services/page.tsx` | Service Directory | **FAIL (URL Mismatch)** | **Breaks live URL.** Live DoctorCheck URL is `/bang-gia-dich-vu-tam-soat-benh-tai-doctor-check/`. |
| `/services/[slug]` | `src/app/(frontend)/services/[slug]/page.tsx` | Service Detail | **FAIL (URL Mismatch)** | **Breaks live URLs.** Live screening packages live at root (`/goi-*-danh-cho-*/`). |
| `/specialties` | `src/app/(frontend)/specialties/page.tsx` | Specialty Directory | **FAIL (URL Mismatch)** | Live site has no `/specialties` hub; uses `/trung-tam-noi-soi-tieu-hoa-doctor-check/`. |
| `/specialties/[slug]`| `src/app/(frontend)/specialties/[slug]/page.tsx`| Specialty Detail | **FAIL (URL Mismatch)** | Live endoscopy hubs live at root (`/noi-soi-da-day/`, `/noi-soi-dai-trang/`). |
| `/blog` | `src/app/(frontend)/blog/page.tsx` | Blog Index | Active (200) | Matches WordPress `/blog/` index. |
| `/blog/[slug]` | `src/app/(frontend)/blog/[slug]/page.tsx` | Article Single | **FAIL (URL Mismatch)** | **Catastrophic SEO failure.** All 108 live medical articles live at root `/[slug]/`. |
| `/contact` | `src/app/(frontend)/contact/page.tsx` | Contact Template | **FAIL (URL Mismatch)** | **Breaks live URL.** Live DoctorCheck URL is `/lien-he/`. |
| `/booking` | `src/app/(frontend)/booking/page.tsx` | Booking Template | Active (200) | Form page; live site uses `/cam-on/` for post-booking confirmation. |
| `/chinh-sach-quyen-rieng-tu/` | *None* | Legal Policy | **MISSING (404)** | Mandatory privacy policy page omitted entirely. |
| `/kham-suc-khoe-doanh-nghiep/` | *None* | Corporate B2B | **MISSING (404)** | High-value B2B enterprise screening page omitted entirely. |
| `/api/booking` | `src/app/api/booking/route.ts` | Lead Intake API | Active (200) | Route handler with in-memory storage (Data loss bug). |
| `/api/contact` | `src/app/api/contact/route.ts` | Contact API | Active (200) | Route handler logging to console without persistence. |
| `/admin/[[...segments]]` | `src/app/(payload)/admin/[[...segments]]/page.tsx` | Payload CMS Admin | Active (200) | Embedded CMS dashboard. |
| `/api/[...slug]` | `src/app/(payload)/api/[...slug]/route.ts` | Payload Local API | Active (200) | CMS data endpoints. |

---

## 2. Root-Level URL Namespace & Collision Audit

### 2.1. The Root-Level Namespace Conflict
In the live WordPress deployment of DoctorCheck.vn, almost all content types reside at the root `/` namespace:
- **Medical Articles:** `https://doctorcheck.vn/[article-slug]/` (e.g. `/dau-thuong-vi/`, `/vi-khuan-hp/`)
- **Categories:** `https://doctorcheck.vn/[category-slug]/` (e.g. `/ung-thu-da-day/`, `/tieu-hoa/`)
- **Commercial Packages:** `https://doctorcheck.vn/[package-slug]/` (e.g. `/goi-khuyen-cao-danh-cho-nu/`)
- **Clinical Hubs:** `https://doctorcheck.vn/[hub-slug]/` (e.g. `/noi-soi-da-day/`, `/noi-soi-dai-trang/`)
- **Doctor Profiles:** `https://doctorcheck.vn/doctor/[doctor-slug]/` (singular `/doctor/` prefix)

### 2.2. Critical Flaw in Current Implementation
The implemented codebase in `d:\LandingPages\DoctorCheck` introduces arbitrary Anglo-centric subdirectories:
- Articles moved under `/blog/[slug]`
- Packages moved under `/services/[slug]`
- Specialties moved under `/specialties/[slug]`
- Doctors moved under `/doctors/[slug]` (plural instead of singular `/doctor/[slug]`)
- Contact moved to `/contact` instead of `/lien-he`
- About moved to `/about` instead of `/ve-chung-toi`

**Consequence:**  
Because there is **no root-level dynamic route handler (`src/app/[slug]/page.tsx`)** and **zero 301 redirects** configured in `next.config.ts`, **every single one of the 205 indexed URLs on Google will return a 404 Not Found error**. This represents a 100% loss of established search engine indexing and organic traffic.

---

### 2.3. Collision Matrix Across WordPress Content Types

| Slug / URL | Colliding Types | Live WordPress Precedence | Required Next.js Resolution Rule |
| :--- | :--- | :--- | :--- |
| `/dau-thuong-vi/` | Page ID 3212 vs. Post ID 3622 | Page intercepts with `noindex`. Post is shadowed. | Must resolve to **Post** (`ArticleModel`) to restore indexation. |
| `/tieu-chay/` | Page ID 3162 vs. Post ID 3773 | Page intercepts with `noindex`. Post is shadowed. | Must resolve to **Post** (`ArticleModel`) to restore indexation. |
| `/di-ngoai-ra-mau/` | Page ID 3125 vs. Post ID 3750 | Page intercepts with `noindex`. Post is shadowed. | Must resolve to **Post** (`ArticleModel`) to restore indexation. |
| `/tao-bon/` | Page ID 3110 vs. Post ID 3797 | Page intercepts with `noindex`. Post is shadowed. | Must resolve to **Post** (`ArticleModel`) to restore indexation. |
| `/kien-thuc-ung-thu-da-day/` | Root Category ID 47 vs. Nested Page ID 4868 | Root URL = Category; Nested URL = Child Page | Root path must resolve to **Category Archive**; child path to Page. |
| `/kien-thuc-ung-thu-dai-trang/`| Root Category ID 48 vs. Nested Page ID 4860 | Root URL = Category; Nested URL = Child Page | Root path must resolve to **Category Archive**; child path to Page. |

---

## 3. Required Architectural Fix: Deterministic Content Resolver

To achieve 100% parity and avoid ambiguous routing, the application must eliminate the artificial `/blog/`, `/services/`, and `/specialties/` subpath structure and deploy a deterministic content resolver at `src/app/[slug]/page.tsx`:

```
Incoming Request: /[slug]/
   │
   ├─► 1. Exact 301 Redirect Table (next.config.ts)
   │      Legacy / duplicate URLs ──► 301 Permanent Redirect
   │
   ├─► 2. Commercial Packages & Products (9 items)
   │      Matches /goi-*-danh-cho-*/, /tam-soat-ung-thu-*/ ──► Package Detail Template
   │
   ├─► 3. Category Taxonomies (30 categories)
   │      Matches /ung-thu-da-day/, /tieu-hoa/ ──► Category Archive Template
   │
   ├─► 4. Medical Knowledge Articles (108 published posts)
   │      Matches /dau-thuong-vi/, /vi-khuan-hp/ ──► Medical Article Template
   │
   ├─► 5. Flat Standalone Clinical Pages (fallback)
   │      Matches /10-tieu-chuan-vang/, /bao-chi-dua-tin/ ──► General Page Template
   │
   └─► 6. Fallback ──► notFound() (HTTP 404)
```

---

## 4. Routing Audit Verdict: `CRITICAL FAIL`

The routing implementation in `d:\LandingPages\DoctorCheck` completely breaks the existing URL taxonomy of DoctorCheck.vn. Deploying this routing structure will instantly wipe out the website's organic SEO equity.
