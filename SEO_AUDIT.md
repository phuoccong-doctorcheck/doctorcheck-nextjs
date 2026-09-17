# Phase 4: SEO & Structured Data Audit

**Project:** DoctorCheck Next.js Migration  
**Target Codebase:** `d:\LandingPages\DoctorCheck`  
**Date:** 2026-09-15  
**Auditor:** Antigravity AI Engineering Team  

---

## 1. Executive Summary

| SEO Evaluation Area | Finding in `DoctorCheck` Implementation | Severity | Status |
| :--- | :--- | :---: | :---: |
| **Title & Meta Descriptions** | Uses generic copy; claims clinic is in "Quận 1" (Real clinic is in "Quận 10"). | **CRITICAL** | **FAIL** |
| **Canonical Tags** | Lacks `trailingSlash: true`; canonicals omit trailing slashes. | **HIGH** | **FAIL** |
| **Robots Directives** | Disallows `/admin/` and `/api/`, allows search bots. | Normal | **PASS** |
| **XML Sitemap** | Submits non-existent URLs (`/blog/*`, `/services/*`, `/doctors/*`) to search engines. | **CRITICAL** | **FAIL** |
| **Structured Data (JSON-LD)** | Generates `MedicalClinic` with **fake physical address** and **fake phone numbers**! | **CRITICAL** | **FAIL** |
| **Breadcrumbs Schema** | Generates breadcrumbs pointing to non-existent `/blog` and `/services` paths. | **HIGH** | **FAIL** |
| **FAQPage Schema** | Injected in `FAQBlock`, but questions are generic mock copy. | Medium | **WARNING** |
| **Physician Schema** | Injected on `/doctors/[slug]`, but represents fictional non-existent doctors. | **CRITICAL** | **FAIL** |
| **Medical License Number** | Mandatory Ministry of Health License (`09789/HCM-GPHĐ`) is omitted from schema. | **HIGH** | **FAIL** |

---

## 2. Meta Tags & Title Hierarchy Audit

### 2.1. Root Metadata (`src/app/(frontend)/layout.tsx`)
```typescript
export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://doctorcheck.vn'),
  title: {
    default: 'DoctorCheck - Phòng Khám Đa Khoa Quốc Tế Chuẩn Y Khoa Hàng Đầu TP.HCM',
    template: '%s | DoctorCheck Clinic',
  },
  description:
    'Phòng Khám Đa Khoa Quốc Tế DoctorCheck. Chuyên khoa Nội tổng quát, Tiêu hóa, Tim mạch, Sản phụ khoa, Tai mũi họng. Tầm soát ung thư sớm, nội soi tiền mê không đau NBI cùng PGS, Tiến sĩ, Bác sĩ CKII.',
  keywords: [
    'phòng khám đa khoa',
    'phòng khám uy tín quận 1', // FAKE: Clinic is in District 10!
    'nội soi không đau',
    'nội soi dạ dày NBI',
    'tầm soát ung thư sớm',
    'khám tổng quát chuyên sâu',
    'bác sĩ tiêu hóa giỏi',
    'doctorcheck',
  ],
}
```
- **Defect 1:** The keyword list includes `'phòng khám uy tín quận 1'`. DoctorCheck's sole licensed operating facility is located at **429 Tô Hiến Thành, Phường 14, Quận 10**. Targeting District 1 misleads search engines and local patients searching for geographically relevant care.
- **Defect 2:** The title template suffix is `| DoctorCheck Clinic`, whereas DoctorCheck's established brand title suffix is `– Doctor Check Tầm Soát Bệnh Để Sống Thọ Hơn`.

---

## 3. Structured Data (JSON-LD) Audit

### 3.1. MedicalClinic Schema (`src/lib/seo/jsonld.ts`)
The `generateClinicJsonLd` function in `src/lib/seo/jsonld.ts` generates the following JSON-LD payload injected into the root layout:

```json
{
  "@context": "https://schema.org",
  "@type": "MedicalClinic",
  "name": "Phòng Khám Đa Khoa Quốc Tế DoctorCheck",
  "url": "https://doctorcheck.vn",
  "telephone": "028 3822 9999",
  "email": "tuvan@doctorcheck.vn",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "42A Nguyễn Huệ, Phường Bến Nghé, Quận 1",
    "addressLocality": "Quận 1",
    "addressRegion": "TP. Hồ Chí Minh",
    "addressCountry": "Việt Nam"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": 10.7742,
    "longitude": 106.7034
  }
}
```

> [!CAUTION]
> **Severe Google Rich Results & Local SEO Violation:**  
> 1. **Fictional Street Address:** Schema claims the clinic is at "42A Nguyễn Huệ, Phường Bến Nghé, Quận 1". DoctorCheck has no clinic at this address.  
> 2. **Fictional Phone Number:** Telephone is listed as `028 3822 9999`. Real telephone is `028 5678 9999`.  
> 3. **Fictional GeoCoordinates:** Coordinates point to a pedestrian shopping street in District 1, leading Google Maps algorithms to flag the clinic as spam or mislocated.  
> 4. **Missing Medical Accreditation:** Ministry of Health License (`09789/HCM-GPHĐ`) and AACI American Accreditation are completely missing from schema properties.

---

### 3.2. Physician Schema (`src/lib/seo/jsonld.ts`)
On `/doctors/[slug]`, the site injects `Physician` schema. However, because the doctors are fictional mock entities:
- `Physician` schema is generated for "PGS. TS. BS Trần Minh Trí", "BSCKII Nguyễn Thị Phương Thảo", "ThS. BS Lê Hoàng Nam", and "BSCKI Vũ Hồng Hạnh".
- None of these physicians exist on DoctorCheck's medical staff.
- This creates fraudulent medical authority signals under Google's E-E-A-T (Experience, Expertise, Authoritativeness, and Trustworthiness) guidelines and violates Google Search spam policies.

---

## 4. XML Sitemap & Robots Audit

### 4.1. `sitemap.ts` Review
`src/app/sitemap.ts` queries `getServices()`, `getDoctors()`, `getSpecialties()`, and `getBlogPosts()`. Because these functions return mock data:
- The generated `sitemap.xml` contains URLs like:
  - `https://doctorcheck.vn/services/kham-tong-quat-chuyen-sau`
  - `https://doctorcheck.vn/doctors/pgs-ts-bs-tran-minh-tri`
  - `https://doctorcheck.vn/blog/dau-hieu-canh-bao-ung-thu-da-day-som`
- **Zero** of the 108 real indexed medical articles appear in `sitemap.xml`.
- **Zero** of the 9 real packages appear in `sitemap.xml`.
- **Zero** of the 7 real doctors appear in `sitemap.xml`.
- All URLs lack trailing slashes.

### 4.2. `robots.ts` Review
`src/app/robots.ts` includes specialized rules for AI search bots (`GPTBot`, `PerplexityBot`, `ClaudeBot`). However, the `allow` rules reference the non-existent paths:
```typescript
allow: ['/', '/services/', '/doctors/', '/specialties/', '/blog/', '/about', '/contact']
```
These paths do not reflect the true URL structure of the clinic website.

---

## 5. SEO Audit Verdict: `CRITICAL FAIL`

The SEO implementation contains dangerous factual inaccuracies (fake clinic address, fake phone numbers, fake physician credentials in JSON-LD) and submits an invalid sitemap containing fictional routes while omitting all 108 real indexed medical articles.
