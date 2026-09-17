# DoctorCheck Next.js Final Audit

**Project:** DoctorCheck.vn Reverse-Engineering & Next.js Rebuild  
**Audited Targets:** `d:\LandingPages\DoctorCheck` & `d:\LandingPages\doctorcheck-nextjs`  
**Date:** 2026-09-15  
**Audit Lead:** Antigravity AI Engineering Team  
**Scope:** Comprehensive pre-deployment quality assurance across build, routing, SEO, content parity, forms, performance, security, and analytics.

---

## 1. Executive Summary

This comprehensive audit investigated the codebase implemented in `d:\LandingPages\DoctorCheck` against the live target website `https://doctorcheck.vn/`.

While the implementation demonstrates clean technical foundations (Next.js 15 App Router compiles with zero TypeScript errors and passes ESLint with modular Server Components), the audit revealed **catastrophic content, routing, operational, and SEO discrepancies**:

1. **Complete Content Fabrication:** The implementation replaced DoctorCheck's real clinic address (429 Tô Hiến Thành, Q.10) with a fictional address (42A Nguyễn Huệ, Q.1), replaced real hotlines (`028 5678 9999`) with unowned numbers (`1900 88 99 22`), replaced all 7 verified physicians with 4 invented names, and omitted 97% of all medical articles.
2. **Catastrophic SEO & Routing Breakdown:** The implementation introduced Anglo-centric subdirectories (`/blog/[slug]`, `/services/[slug]`, `/doctors/[slug]`) and omitted root catch-all resolution. **Zero of the 205 live indexed WordPress URLs are preserved, and zero 301 redirects are configured.** If deployed, 100% of organic search traffic will hit 404 error pages.
3. **Severe Lead Loss Bug:** The booking API route saves patient appointments to an ephemeral JavaScript memory variable (`bookingsStore = []`). Leads are never persisted to any database, CRM, or email, resulting in permanent lead loss whenever serverless containers recycle or restart.

---

## 2. Build Status

- **Status:** **`WARNING`**
- **Evaluation:**
  - `tsc --noEmit`: **PASS** (0 errors).
  - `next lint`: **PASS** (0 warnings, 0 errors).
  - `next build`: **PASS (WITH WARNING)**. Generated 15 static pages and 8 dynamic routes. Minor warning regarding unrecognized `turbopack` key injected by `@payloadcms/next`.
  - **Decoupled Disconnect:** While Payload CMS 3.89 is compiled into `/admin`, the frontend completely bypasses the CMS and reads static mock data from `mock-data.ts`.

---

## 3. Routing Status

- **Status:** **`CRITICAL FAIL`**
- **Evaluation:**
  - Live DoctorCheck.vn uses flat root-level URLs (`/[slug]/`) for articles, packages, and categories.
  - Current implementation segregated content into subpaths: `/blog/[slug]`, `/services/[slug]`, `/doctors/[slug]`.
  - No root-level `[slug]` catch-all route exists.
  - No deterministic `resolveContent(slug)` resolver exists.
  - **Result: 100% of indexed WordPress URLs will return 404 Not Found.**

---

## 4. URL Migration Status

- **Status:** **`BLOCKER`**
- **Evaluation:**
  - **205 out of 205 public URLs** are broken or unmapped.
  - **0 of the 7 confirmed 301 redirects** are configured in `next.config.ts`.
  - `trailingSlash: false` breaks parity with WordPress's established trailing slash permalink structure.
  - Sitemaps submit invalid, uncanonicalized URLs to Google Search Console.

---

## 5. SEO Status

- **Status:** **`CRITICAL FAIL`**
- **Evaluation:**
  - Meta tags promote a false clinic location ("Quận 1" instead of "Quận 10").
  - `MedicalClinic` JSON-LD schema injects a **fake physical address, fake telephone number, and fake geo-coordinates**, creating immediate local SEO and spam penalties.
  - `Physician` schema is generated for fictional, non-existent doctors, violating Google's Healthcare E-E-A-T guidelines.
  - Mandatory Ministry of Health License (`09789/HCM-GPHĐ`) is omitted from schema.

---

## 6. Content Parity Status

- **Status:** **`CRITICAL FAIL`**
- **Evaluation:**
  - **Physical Address:** Hardcoded as `42A Nguyễn Huệ, Q.1` (Real: `429 Tô Hiến Thành, Q.10`).
  - **Hotline:** Hardcoded as `028 3822 9999` and `1900 88 99 22` (Real: `028 5678 9999`).
  - **Zalo OA:** Hardcoded as `https://zalo.me/0901234567` (Real: `https://zalo.me/309834292180920772`).
  - **Doctors:** 7 real physicians omitted; replaced by 4 fake doctors with stock Unsplash photos.
  - **Packages:** Real "Gói Sống Thọ" and 47-point screening checklists omitted; replaced by 6 generic services.
  - **Articles:** 105 of 108 medical knowledge articles (97.2%) are missing entirely.
  - **Equipment:** Olympus EVIS-X1 with NBI omitted; replaced by generic stock photos.

---

## 7. Booking/Form Status

- **Status:** **`BLOCKER`**
- **Evaluation:**
  - **Data Loss Hazard:** `saveBookingLead` writes to `bookingsStore: BookingLead[] = []` in volatile server RAM. Every server restart or container scale-down permanently erases all captured patient leads.
  - **Contact Form Discard:** `/api/contact` logs messages to `console.log` and discards them with zero storage or email dispatch.
  - **Unknown CRM:** Production CRM endpoint is unconfigured and **`UNKNOWN`**.
  - **Marketing Attribution:** Zero UTM parameters (`utm_source`, `utm_campaign`, `gclid`) are extracted or persisted.

---

## 8. Performance Status

- **Status:** **`WARNING`**
- **Evaluation:**
  - First Load JS is lightweight (118–128 kB for public pages).
  - Server Component boundaries are cleanly partitioned.
  - However, external Unsplash images lack intrinsic aspect ratios, creating Cumulative Layout Shift (CLS > 0.1).
  - Google Fonts (`Inter`) introduces DNS latency, replacing the brand's self-hosted `SVN-SofiaPro`.

---

## 9. Security Status

- **Status:** **`WARNING`**
- **Evaluation:**
  - `images.remotePatterns` has an open wildcard (`hostname: '**'`), exposing Next.js to open image proxy SSRF and DoS attacks.
  - Patient mobile numbers and health symptoms are printed in plaintext to server stdout logs, violating Vietnam's Personal Data Protection Decree (Decree 13/2023/NĐ-CP).
  - In-memory rate limiting resets across stateless serverless functions.
  - HTTP security headers (CSP, HSTS, X-Frame-Options) are well configured.

---

## 10. UI/Responsive Status

- **Status:** **`FAIL`**
- **Evaluation:**
  - Fluid mobile responsiveness (320px–1920px) passes with no horizontal scrolling.
  - However, brand color tokens are completely wrong (generic sky blue `#0284c7` instead of dark teal `#00475B` and gold `#FFB500`).
  - Mobile bottom bar hotline button triggers dialing of a fake phone number (`1900 88 99 22`).
  - The 15 conversion sections of DoctorCheck.vn are largely replaced by generic blocks.

---

## 11. Accessibility Status

- **Status:** **`PASS`**
- **Evaluation:**
  - Semantic HTML tags (`<main>`, `<header>`, `<footer>`) are used properly.
  - Form fields feature explicit `<label>` and `id` bindings.
  - Keyboard navigation and focus rings are preserved.
  - Minor color contrast warnings on light blue badge text.

---

## 12. Analytics Status

- **Status:** **`FAIL`**
- **Evaluation:**
  - Microsoft Clarity script is implemented via `NEXT_PUBLIC_CLARITY_ID`.
  - Google Analytics (GA4) / Google Tag Manager (GTM) is completely missing.
  - TikTok Pixel (`CJSOI6BC77UDO397GB30`) is completely missing.
  - Zero event dispatchers exist for phone call clicks or Zalo chat triggers.

---

## 13. Critical Blockers

1. **BLOCKER-01 (Data Loss):** In-memory ephemeral lead storage (`bookingsStore = []`) permanently loses patient appointment registrations.
2. **BLOCKER-02 (Fictional Medical & Business Data):** Fake clinic address (Quận 1 instead of Quận 10), fake phone numbers, fake Zalo, and fake doctor profiles must be eradicated immediately.
3. **BLOCKER-03 (Total SEO & Routing Breakage):** Subpath routing (`/blog/*`, `/services/*`) breaks 100% of the 205 indexed WordPress URLs. Zero 301 redirects are configured.
4. **BLOCKER-04 (Unknown CRM Destination):** The production lead receiving endpoint remains unconfigured.

---

## 14. High Priority Issues

5. **ISSUE-05:** 105 real medical articles and 30 category archives are completely missing from the site.
6. **ISSUE-06:** Zero UTM parameters or ad click IDs (`gclid`, `fbclid`) are captured by the booking form.
7. **ISSUE-07:** `trailingSlash: false` in `next.config.ts` breaks parity with WordPress trailing slash indexing.
8. **ISSUE-08:** Open image proxy vulnerability (`hostname: '**'`) in `next.config.ts`.
9. **ISSUE-09:** Plaintext logging of patient PII violating Decree 13/2023/NĐ-CP.
10. **ISSUE-10:** Missing TikTok Pixel (`CJSOI6BC77UDO397GB30`) and GTM conversion event tracking.

---

## 15. Medium Priority Issues

11. **ISSUE-11:** Generic brand palette (`#0284c7`) must be replaced with official tokens (`#00475B`, `#FFB500`).
12. **ISSUE-12:** Google Inter font must be replaced with self-hosted `SVN-SofiaPro` WOFF2 fonts.
13. **ISSUE-13:** External Unsplash images must be replaced with verified Cloudflare Images CDN assets.
14. **ISSUE-14:** In-memory rate limiting should be upgraded to distributed Upstash Redis.

---

## 16. Low Priority Issues

15. **ISSUE-15:** Turbopack configuration warning during `next build` due to Payload wrapper.
16. **ISSUE-16:** Color contrast on secondary badge text.

---

## 17. Recommended Fix Order

```
Step 1: Replace all fake business details with real DoctorCheck.vn data (Address, Phone, Zalo, License).
Step 2: Restructure routing to root-level [slug] with deterministic resolver to preserve 205 URLs.
Step 3: Configure 7 confirmed 301 redirects and enforce trailingSlash: true in next.config.ts.
Step 4: Fix /api/booking lead persistence (connect to verified CRM or PostgreSQL / Supabase fallback).
Step 5: Integrate UTM parameter extraction into booking forms and session storage.
Step 6: Import 108 authentic medical articles, 7 real doctors, and 9 authentic packages.
Step 7: Correct MedicalClinic and Physician Schema.org JSON-LD to reflect authentic clinic credentials.
Step 8: Close open image proxy wildcard in next.config.ts.
Step 9: Re-skin UI components with verified brand tokens (#00475B teal, #FFB500 gold, SVN-SofiaPro).
Step 10: Integrate GTM, TikTok Pixel, and click-to-call conversion events.
```

---

## 18. Production Readiness

```
┌─────────────────────────────────────────────────────────────┐
│                    PRODUCTION READINESS                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│                         NO (FAIL)                           │
│                                                             │
│   The application contains 4 CRITICAL BLOCKERS and 6 HIGH   │
│   severity defects that prevent production deployment.      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Consolidated Audit Summary Table

| Area | Status | Critical Issues | Recommended Action |
| :--- | :---: | :--- | :--- |
| **Build & Type Safety** | **WARNING** | Frontend bypasses Payload CMS; reads mock data. | Bind frontend to real data layer or persistent DB. |
| **Routing & URL Architecture** | **CRITICAL FAIL** | Subpaths break 100% of 205 indexed URLs; 0 redirects. | Restore root `[slug]` routing with deterministic resolver. |
| **URL Migration & Permalinks** | **BLOCKER** | 0 of 7 redirects configured; `trailingSlash` missing. | Add 301 redirect array and `trailingSlash: true` in config. |
| **SEO & Structured Data** | **CRITICAL FAIL** | Fake address, fake phone, and fake doctors in JSON-LD. | Rewrite Schema.org entities with authentic licensed data. |
| **Content Parity** | **CRITICAL FAIL** | Fake clinic address, fake hotline, 97% of articles missing. | Replace all mock data with authentic DoctorCheck content. |
| **Booking & Form Conversion** | **BLOCKER** | Ephemeral RAM lead storage; silent discard of contacts. | Persist leads to database / CRM; add UTM capture. |
| **Performance & Web Vitals** | **WARNING** | External Unsplash images create layout shift & latency. | Migrate to local/Cloudflare Images; preload hero image. |
| **Security & Privacy** | **WARNING** | Open image proxy wildcard `**`; plaintext PII logs. | Restrict image hostnames; mask patient PII in logs. |
| **Responsive & UI QA** | **FAIL** | Mobile hotline dials fake number; incorrect brand colors. | Fix mobile dialer link; apply dark teal & gold palette. |
| **Accessibility (a11y)** | **PASS** | Minor color contrast warnings on badge indicators. | Increase contrast ratio on light badge text. |
| **Analytics & Attribution** | **FAIL** | Missing TikTok pixel, GTM, phone/Zalo click tracking. | Deploy pixel containers and conversion event pushers. |

---

### What MUST Be Fixed Before Deployment:
1. **Fix Lead Data Loss:** Replace `bookingsStore: BookingLead[] = []` with persistent storage (PostgreSQL / Supabase / verified CRM). Do not allow patient leads to be erased upon server restart.
2. **Restore Authentic Business Details:** Correct clinic address to **429 Tô Hiến Thành, P.14, Q.10**, telephone to **028 5678 9999**, Zalo to `https://zalo.me/309834292180920772`, and include Health License **09789/HCM-GPHĐ**.
3. **Preserve URL Equity:** Eliminate artificial `/blog/`, `/services/`, and `/doctors/` subpaths. Deploy root-level `[slug]` handling with `trailingSlash: true` and configure all 7 permanent 301 redirects.
4. **Import Authentic Medical Content:** Replace fictional doctors with DoctorCheck's 7 licensed physicians; import all 108 indexed medical articles and 9 real examination packages.
5. **Close Image Security Hole:** Restrict `images.remotePatterns` from wildcard `**` to trusted Cloudflare Images domains.
6. **Capture Marketing Attribution:** Extract and forward UTM tags and ad click IDs with every booking lead.
