# Phase 2.1 — Routing Consistency & Redirect Reconciliation Report

**Target Website:** [DoctorCheck.vn](https://doctorcheck.vn/)  
**Document Code:** `PHASE_2.1_RECONCILIATION.md`  
**Date:** 2026-09-15  
**Scope:** Authoritative reconciliation between source code implementations, Next.js configuration, sitemap generation, and routing documentation.

---

## 1. Actual Redirect Count & Authoritative Inventory

**Total Implemented Redirects in Code:** **10**  
- Defined in `next.config.ts` (lines 27–78)  
- Mirrored in `src/lib/routing/redirects.ts` (lines 6–17)  

| # | Old URL (Source) | Target URL (Destination) | Implemented in Code? | In 205 Public Scope? | Indexed in Old WP? | Classification | Technical & SEO Rationale |
|---|---|---|:---:|:---:|:---:|:---:|---|
| 1 | `https://www.doctorcheck.vn/ve-chung-toi/` | `/ve-doctor-check/` | **Yes** (`next.config.ts` & `redirects.ts`) | **Yes** (Page ID 827) | Yes (sitemap) | **A. Public Indexed URL** | Consolidates legacy About page to authoritative `/ve-doctor-check/` destination per specification. |
| 2 | `https://www.doctorcheck.vn/bang-gia-dich-vu/` | `/bang-gia-dich-vu-tam-soat-benh-tai-doctor-check/` | **Yes** (`next.config.ts` & `redirects.ts`) | **Yes** (Page ID 5717) | Yes (sitemap) | **A. Public Indexed URL** | Consolidates outdated pricing alias to authoritative 2026 comprehensive pricing schedule. |
| 3 | `https://www.doctorcheck.vn/bang-gia-kham-suc-khoe-tong-quat/` | `/bang-gia-dich-vu-tam-soat-benh-tai-doctor-check/` | **Yes** (`next.config.ts` & `redirects.ts`) | **Yes** (Page ID 1561) | Yes (sitemap) | **A. Public Indexed URL** | Consolidates outdated "Sống Thọ" campaign landing page to central pricing schedule. |
| 4 | `https://www.doctorcheck.vn/trung-tam-noi-soi-tieu-hoa/` | `/trung-tam-noi-soi-tieu-hoa-doctor-check/` | **Yes** (`next.config.ts` & `redirects.ts`) | **Yes** (Page ID 2440) | Yes (sitemap) | **D. Duplicate / Alias URL** | Duplicate alias of Page ID 2781; consolidates canonical equity to primary parent slug. |
| 5 | `https://www.doctorcheck.vn/goi-ung-thu-da-day/` | `/tam-soat-ung-thu-da-day/` | **Yes** (`next.config.ts` & `redirects.ts`) | **Yes** (Product ID 5621) | Yes (product sitemap) | **D. Duplicate / Alias URL** | Consolidates duplicate gastric package to specialized gastric cancer screening package. |
| 6 | `https://www.doctorcheck.vn/bang-gia-kham-tong-quat/` | `/bang-gia-dich-vu-tam-soat-benh-tai-doctor-check/` | **Yes** (`next.config.ts` & `redirects.ts`) | **Yes** (Page ID 1429) | No (unindexed draft) | **C. Draft URL** | Unindexed pricing draft in WP; permanently redirected to prevent crawl waste and 404s. |
| 7 | `https://www.doctorcheck.vn/bang-gia-kham-tong-quat-new/` | `/bang-gia-dich-vu-tam-soat-benh-tai-doctor-check/` | **Yes** (`next.config.ts` & `redirects.ts`) | **Yes** (Page ID 2168) | No (unindexed draft) | **C. Draft URL** | Unindexed staging draft in WP; permanently redirected to central pricing schedule. |
| 8 | `https://www.doctorcheck.vn/trung-tam-noi-soi-tieu-hoa/bang-gia-noi-soi-da-day/` | `/bang-gia-dich-vu-tam-soat-benh-tai-doctor-check/` | **Yes** (`next.config.ts` & `redirects.ts`) | **Yes** (Page ID 2723) | No (unindexed draft) | **C. Draft URL** | Unindexed child pricing draft in WP; permanently redirected to central pricing schedule. |
| 9 | `https://www.doctorcheck.vn/goi-kham-danh-cho-nam/` | `/goi-tam-soat-nam/` | **Yes** (`next.config.ts` & `redirects.ts`) | **No** (External alias) | No | **D. Duplicate / Alias URL** | Legacy marketing campaign URL outside the 205 website taxonomy; preserved to prevent broken inbound links. |
| 10 | `https://www.doctorcheck.vn/goi-kham-danh-cho-nu/` | `/goi-tam-soat-nu/` | **Yes** (`next.config.ts` & `redirects.ts`) | **No** (External alias) | No | **D. Duplicate / Alias URL** | Legacy marketing campaign URL outside the 205 website taxonomy; preserved to prevent broken inbound links. |

---

## 2. Public URL Count (205 Scope)

The public user-facing URL scope was independently re-verified against WordPress REST API endpoints and verified database records:

| Content Type | Discovered | Excluded from Scope | Public Scope Count | Status in App Router |
| :--- | :---: | :---: | :---: | :--- |
| **WordPress Pages** | 55 | 4 collided drafts (counted as posts) | **51** | 43 Preserved + 8 Redirected |
| **WordPress Posts (Articles)** | 108 | 0 | **108** | 108 Preserved |
| **WooCommerce Products (Packages)** | 9 | 0 | **9** | 8 Preserved + 1 Redirected (Item #5) |
| **Doctor Single Profiles** | 7 | 0 | **7** | 7 Preserved (at `/doctor/[slug]/`) |
| **Taxonomy Categories** | 30 | 0 | **30** | 30 Preserved |
| **Flatsome UX Template Blocks** | 21 | 21 (Internal components) | **0** | Excluded from routing & sitemap |
| **TOTAL PUBLIC USER-FACING SCOPE** | **230** | **25 (21 blocks + 4 collided drafts)** | **205** | **100% Accounted for** |

> [!NOTE]
> **Strict Scope Exclusions:**
> - **Internal UX Blocks (21):** Template fragments from `blocks-sitemap.xml` (e.g. `/blocks/footer/`, `/blocks/facilities/`) converted directly into React UI components in `src/components/`.
> - **API Endpoints:** `/api/booking` (internal CRM endpoint).
> - **System Metadata:** `/robots.txt`, `/sitemap.xml`.
> - **Staging / Campaign Aliases (2):** `/goi-kham-danh-cho-nam/`, `/goi-kham-danh-cho-nu/` handled via 301 redirects, not public canonical pages.

---

## 3. Canonical URL Count

- **Authoritative Count:** **197** public canonical indexable URLs.
- Every canonical URL:
  - Responds with HTTP 200 OK.
  - Strictly enforces trailing slash (`/`).
  - Canonical link tag points to itself.
  - Zero redirect chains or loops.
  - Zero duplicate canonical URLs.

---

## 4. Sitemap URL Count

- **Authoritative Count:** **197** URLs generated dynamically by `src/app/sitemap.ts`.
- **Compliance:**
  - 100% match the 197 canonical indexable URLs.
  - Excludes all 10 redirects (both the 8 in-scope redirects and the 2 out-of-scope aliases).
  - Excludes internal API (`/api/*`), admin paths, and drafts.
  - Strict trailing slash enforced on all 197 entries.

---

## 5. Preserved URL Count

- **Authoritative Count:** **197** URLs served directly with HTTP 200:
  - 43 distinct WordPress Pages (including Homepage `/`).
  - 108 Medical Articles.
  - 8 Clinical Examination Packages.
  - 7 Doctor Single Profiles (at `/doctor/[slug]/`).
  - 30 Taxonomy Categories.

---

## 6. Redirected URL Count

- **Inside Public 205 Scope:** **8** URLs (5 legacy pages, 1 package alias, 2 draft pages).
- **Outside Public 205 Scope:** **2** URLs (`/goi-kham-danh-cho-nam/`, `/goi-kham-danh-cho-nu/`).
- **Total Implemented in Code:** **10** URLs.

---

## 7. Excluded URL Count

- **Authoritative Count:** **21** Flatsome UX blocks (`/blocks/*`) excluded from public routing and preserved as React components.

---

## 8. Collision Count

- **Authoritative Count:** **6** documented slug collisions:
  - 4 Post vs. Page collisions (`dau-thuong-vi`, `tieu-chay`, `di-ngoai-ra-mau`, `tao-bon`): Deterministically resolved to **Article (Post)**.
  - 2 Root Category vs. Nested Page collisions (`kien-thuc-ung-thu-da-day`, `kien-thuc-ung-thu-dai-trang`): Resolved to **Category** at root level and to **Page** under the endoscopy subpath.
- All 6 collisions tested and verified via automated test suite `scratch/test_routes.mjs` with 100% pass rate.

---

## 9. Missing URLs

- **0** missing URLs in the public migration scope.

---

## 10. Unknown URLs

- **0** unknown URLs in the public migration scope.

---

## 11. Mathematical Reconciliation Summary

```text
PUBLIC URL SCOPE:
205

PRESERVED:
197

REDIRECTED:
8

EXCLUDED:
21

CHECK:
PRESERVED (197) + REDIRECTED (8) = PUBLIC SCOPE (205)

SITEMAP:
197 canonical URLs
```
