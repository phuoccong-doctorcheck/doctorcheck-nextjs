# Phase 3: URL Migration & Redirect Audit

**Project:** DoctorCheck Next.js Migration  
**Target Codebase:** `d:\LandingPages\DoctorCheck`  
**Date:** 2026-09-15  
**Auditor:** Antigravity AI Engineering Team  

---

## 1. Executive Summary

| Audit Item | Current State in `DoctorCheck` | Severity | Impact |
| :--- | :--- | :---: | :--- |
| **Old URL Preservation** | 0 of 205 public URLs preserved in original canonical form. | **CRITICAL FAIL** | 100% of organic traffic will land on 404 error pages. |
| **301 Permanent Redirects** | **0 redirects** configured in `next.config.ts`. | **CRITICAL FAIL** | Known duplicates and legacy URLs break without redirects. |
| **Trailing Slash Configuration** | `trailingSlash: false` (omitted from `next.config.ts`). | **HIGH RISK** | Canonical mismatches; breaks parity with WordPress trailing slash permalinks. |
| **XML Sitemap Integrity** | Generates non-existent URLs (`/blog/*`, `/services/*`, `/doctors/*`) without trailing slashes. | **HIGH RISK** | Submits broken, uncanonicalized URLs to Google Search Console. |

---

## 2. Comparison: Old WordPress URLs vs. New Implementation

### 2.1. Core Static & Conversion Pages

| Old WordPress Canonical URL | New Implementation Route | Status | SEO Consequence |
| :--- | :--- | :---: | :--- |
| `https://www.doctorcheck.vn/` | `/` | **PASS** | Homepage resolves correctly. |
| `https://www.doctorcheck.vn/ve-chung-toi/` | `/about` | **FAIL** | Old URL returns 404; new URL introduces unranked English slug. |
| `https://www.doctorcheck.vn/lien-he/` | `/contact` | **FAIL** | Old URL returns 404; new URL introduces unranked English slug. |
| `https://www.doctorcheck.vn/doi-ngu-bac-si-doctorcheck/` | `/doctors` | **FAIL** | High-authority faculty page returns 404. |
| `https://www.doctorcheck.vn/bang-gia-dich-vu-tam-soat-benh-tai-doctor-check/` | `/services` | **FAIL** | Primary pricing schedule returns 404. |
| `https://www.doctorcheck.vn/kham-suc-khoe-doanh-nghiep/` | *None* | **FAIL** | B2B enterprise screening page completely omitted (404). |
| `https://www.doctorcheck.vn/chinh-sach-quyen-rieng-tu/` | *None* | **FAIL** | Legal privacy page completely omitted (404). |

---

### 2.2. Clinical Faculty Profiles (7 Doctors)

| Old WordPress Canonical URL | New Implementation Route | Status | SEO Consequence |
| :--- | :--- | :---: | :--- |
| `/doctor/trinh-ai-nhi/` | `/doctors/pgs-ts-bs-tran-minh-tri` (Mock) | **FAIL** | Real doctor profile 404s; replaced by fake doctor slug. |
| `/doctor/thai-viet-nguyen/` | `/doctors/bsckii-nguyen-thi-phuong-thao` (Mock) | **FAIL** | Real doctor profile 404s; replaced by fake doctor slug. |
| `/doctor/nguyen-ngoc-quynh-dung/` | `/doctors/ths-bs-le-hoang-nam` (Mock) | **FAIL** | Real doctor profile 404s; replaced by fake doctor slug. |
| `/doctor/nguyen-hong-thanh/` | `/doctors/bscki-vu-hong-hanh` (Mock) | **FAIL** | Real doctor profile 404s; replaced by fake doctor slug. |
| `/doctor/luu-ngoc-mai/` | *None* | **FAIL** | Real doctor profile 404s. |
| `/doctor/dang-nguyen-nhat-thanh-thi/` | *None* | **FAIL** | Real doctor profile 404s. |
| `/doctor/chau-quynh-phi-nha/` | *None* | **FAIL** | Real doctor profile 404s. |

*Notice the double failure: The directory prefix was altered from singular `/doctor/` to plural `/doctors/`, AND the real doctor slugs were replaced with invented mock names.*

---

### 2.3. Commercial Screening Packages & Products (9 Packages)

| Old WordPress Canonical URL | New Implementation Route | Status | SEO Consequence |
| :--- | :--- | :---: | :--- |
| `/goi-khuyen-cao-danh-cho-nu/` | `/services/kham-tong-quat-chuyen-sau` (Mock) | **FAIL** | 404 error; replaced by generic mock slug. |
| `/goi-khuyen-cao-danh-cho-nam/` | `/services/noi-soi-khong-dau` (Mock) | **FAIL** | 404 error; replaced by generic mock slug. |
| `/goi-chuyen-sau-danh-cho-nam/` | `/services/tam-soat-ung-thu-som` (Mock) | **FAIL** | 404 error; replaced by generic mock slug. |
| `/goi-tam-soat-chuyen-sau-danh-cho-nu/`| `/services/sieu-am-tim-holter` (Mock) | **FAIL** | 404 error; replaced by generic mock slug. |
| `/goi-song-tho-danh-cho-nam/` | `/services/kham-phu-khoa-chuyen-sau` (Mock) | **FAIL** | 404 error; replaced by generic mock slug. |
| `/goi-kham-song-tho-danh-cho-nu/` | `/services/noi-soi-tai-mui-hong-nbi` (Mock) | **FAIL** | 404 error; replaced by generic mock slug. |
| `/so-sanh-3-goi-kham-nam/` | *None* | **FAIL** | 404 error. |
| `/so-sanh-3-goi-kham-nu/` | *None* | **FAIL** | 404 error. |
| `/tam-soat-ung-thu-da-day/` | *None* | **FAIL** | 404 error. |

---

### 2.4. Medical Knowledge Articles (108 Posts)

| Old WordPress Canonical URL | New Implementation Route | Status | SEO Consequence |
| :--- | :--- | :---: | :--- |
| 108 Root-Level Articles (`/[slug]/`) | Only 3 Mock Articles under `/blog/[slug]` | **CATASTROPHIC FAIL** | **108 high-volume medical articles return 404.** Organic traffic for symptoms and diseases (e.g. "vi khuẩn HP", "đau thượng vị") wiped out completely. |

---

## 3. Missing 301 Permanent Redirects in `next.config.ts`

The live audit identified 7 essential redirects that are completely absent from `next.config.ts`:

```typescript
// REQUIRED REDIRECT ARRAY (Currently Missing from next.config.ts)
async redirects() {
  return [
    {
      source: '/trung-tam-noi-soi-tieu-hoa',
      destination: '/trung-tam-noi-soi-tieu-hoa-doctor-check/',
      permanent: true,
    },
    {
      source: '/ve-doctor-check',
      destination: '/ve-chung-toi/',
      permanent: true,
    },
    {
      source: '/bang-gia-dich-vu',
      destination: '/bang-gia-dich-vu-tam-soat-benh-tai-doctor-check/',
      permanent: true,
    },
    {
      source: '/bang-gia-kham-suc-khoe-tong-quat',
      destination: '/bang-gia-dich-vu-tam-soat-benh-tai-doctor-check/',
      permanent: true,
    },
    {
      source: '/bang-gia-kham-tong-quat',
      destination: '/bang-gia-dich-vu-tam-soat-benh-tai-doctor-check/',
      permanent: true,
    },
    {
      source: '/bang-gia-kham-tong-quat-new',
      destination: '/bang-gia-dich-vu-tam-soat-benh-tai-doctor-check/',
      permanent: true,
    },
    {
      source: '/trung-tam-noi-soi-tieu-hoa/bang-gia-noi-soi-da-day',
      destination: '/bang-gia-dich-vu-tam-soat-benh-tai-doctor-check/',
      permanent: true,
    },
  ]
}
```

---

## 4. Trailing Slash Configuration Audit

- **Live Site Behavior:** In WordPress, permalinks are configured with trailing slash: `/%postname%/`. Google has indexed all URLs with trailing slashes for multiple years.
- **Current Next.js Behavior:** `next.config.ts` does not specify `trailingSlash: true`. By default, Next.js strips trailing slashes (`/about` instead of `/about/`).
- **SEO Penalty:** Requests to `https://doctorcheck.vn/ve-chung-toi/` will trigger either 308 redirect loops or duplicate content penalties if canonical headers mismatch.
- **Required Fix:** Add `trailingSlash: true` to `next.config.ts`.

---

## 5. URL Migration Verdict: `BLOCKER`

The implementation in `d:\LandingPages\DoctorCheck` fails every single requirement of preserving existing URL equity. Deploying this version will cause an immediate catastrophic drop in organic traffic and revenue.
