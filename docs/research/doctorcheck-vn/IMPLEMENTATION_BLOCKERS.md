# Implementation Blockers & Open Architectural Decisions: DoctorCheck.vn

**Target Website:** [DoctorCheck.vn](https://doctorcheck.vn/)  
**Document Code:** `IMPLEMENTATION_BLOCKERS.md`  
**Classification:** Pre-Implementation Review  
**Date:** 2026-09-15  

> [!CAUTION]
> **Implementation Stop Order:**  
> No application code, route creation, component refactoring, or dependency installation may begin until all **CRITICAL** blockers have been explicitly resolved and approved by clinic stakeholders.

---

## 1. Summary of Blockers by Severity

| Severity Level | Count | Description | Action Required |
| :--- | :---: | :--- | :--- |
| **`CRITICAL`** | **3** | Core business logic, lead routing, and SEO data integrity issues that halt production deployment. | Client / Stakeholder Decision Required |
| **`HIGH`** | **2** | Content sourcing, domain architecture, and multi-subdomain routing decisions. | Technical Architecture Approval Required |
| **`MEDIUM`** | **2** | Data accuracy, pricing matrix validation, and legacy draft clean-up. | Content / Editorial Review Required |
| **`LOW`** | **1** | Third-party analytics verification and container configuration. | Marketing Team Verification |

---

## 2. Detailed Blockers Catalog

### 2.1. Critical Blockers (`CRITICAL`)

#### BLOCKER-01: Unknown CRM Lead Intake Destination & Authentication
- **Current State:** The live WordPress site uses Contact Form 7 submitting to `/feedback`. The downstream destination (Google Sheets, HubSpot, GetFly CRM, Salesforce, custom webhook, or SMTP email) is private behind Cloudflare and unobservable from public network interrogation.
- **Risk:** Without a verified production lead receiver, appointment bookings submitted on the Next.js site cannot reach the clinical sales/operations team, resulting in lost revenue and patient dissatisfaction.
- **Regulatory Requirement:** Patient health booking records must comply with Vietnam's Personal Data Protection Decree (Decree 13/2023/NĐ-CP). Unverified webhook storage risks data privacy violations.
- **Required Information Before Implementation:**
  1. Production CRM endpoint URL and protocol (REST webhook, GraphQL, SMTP, or native CRM SDK).
  2. Authentication mechanism (Bearer Token, API Key header, OAuth2 client credentials, or HMAC signature).
  3. Payload field mapping requirements (patient name, phone, birth year, desired service, appointment date, UTM parameters).
  4. Failure retry policy and dead-letter queue / fallback database requirements.
- **Status:** **`UNKNOWN`** (Blocker for Phase 1 booking integration).

---

#### BLOCKER-02: Resolution of 4 WordPress Page vs. Post Collisions
- **Current State:** Live DOM and REST API analysis identified four identical slugs that exist simultaneously as both a published WordPress Post and an unpublished/noindex WordPress Page:
  1. `/dau-thuong-vi/`: Page ID 3212 ("Đau thượng vị kéo dài") vs. Post ID 3622 ("Đau thượng vị")
  2. `/tieu-chay/`: Page ID 3162 ("Tiêu chảy kéo dài") vs. Post ID 3773 ("Tiêu chảy")
  3. `/di-ngoai-ra-mau/`: Page ID 3125 ("Đi ngoài ra máu") vs. Post ID 3750 ("Đi ngoài ra máu")
  4. `/tao-bon/`: Page ID 3110 ("Táo bón kéo dài") vs. Post ID 3797 ("Táo bón")
- **Live Defect Identified:** Because of WordPress template hierarchy precedence, WordPress serves the Page template for these URLs. However, all four Pages have been configured in Rank Math with `meta name="robots" content="nofollow, noindex"`. Meanwhile, `post-sitemap.xml` publishes these URLs expecting the Posts to be indexed.
- **Risk:** If Next.js migrates the Page version, organic traffic and indexing remain blocked. If Next.js migrates the Post version, it changes the live layout from a symptom landing page to an educational article.
- **Required Decision:**
  - **Option A (Recommended):** Route these 4 URLs to the comprehensive Medical Article template (`Post`), eliminating the accidental `noindex` tag and restoring organic rankings for high-volume symptom keywords.
  - **Option B:** Rebuild as clinical landing pages (`Page`) and explicitly remove the `noindex` directive.
- **Status:** **`DECISION REQUIRED`**.

---

#### BLOCKER-03: Canonical About Page Selection (`/ve-chung-toi/` vs `/ve-doctor-check/`)
- **Current State:** Two separate About pages exist:
  - Page ID 827 (`/ve-chung-toi/`): Title "Về chúng tôi", H1 "Doctor Check – Trung Tâm Tầm Soát Bệnh Chuyên Sâu", HTML size ~248KB, actively linked in the desktop and mobile header navigation.
  - Page ID 5702 (`/ve-doctor-check/`): Title "Về Doctor Check", H1 NONE, HTML size ~160KB, not linked in main navigation.
- **Risk:** Deploying both dilutes brand equity. Blindly redirecting `/ve-chung-toi/` to `/ve-doctor-check/` (as previously drafted) would break the active primary navigation link and point users to a page lacking an H1 heading.
- **Required Decision:**
  - **Recommended Action:** Preserve `/ve-chung-toi/` as the primary canonical route. Deploy a `301 Permanent Redirect` from `/ve-doctor-check/` &rarr; `/ve-chung-toi/`.
- **Status:** **`DECISION REQUIRED`**.

---

### 2.2. High Blockers (`HIGH`)

#### BLOCKER-04: Headless Content Architecture for 108 Articles & 30 Categories
- **Current State:** The existing site hosts 108 clinical articles and 30 category taxonomies written in Vietnamese. All 108 articles are actively indexed in Google and must be preserved to prevent catastrophic organic traffic loss.
- **Risk:** Hardcoding 108 articles as static JSON or MDX files creates maintenance overhead, while relying on the live WordPress REST API requires the WordPress instance to remain online indefinitely.
- **Required Decision:**
  - **Approach 1 (Headless CMS via WP REST API):** Keep current WordPress as a content repository; Next.js queries `/wp-json/wp/v2/posts` with ISR (`revalidate: 3600`).
  - **Approach 2 (Complete Decoupling / Static Export):** Export all 108 articles and 30 categories into a structured local database / headless CMS (e.g. Strapi, Sanity, or local JSON/MDX content collections) and decommission the PHP server entirely.
- **Status:** **`DECISION REQUIRED`**.

---

#### BLOCKER-05: External Campaign Subdomains vs. Root Domain Consolidation
- **Current State:** The footer navigation links to external subdomains:
  - `https://www.noisoidaday.doctorcheck.vn/`
  - `https://noisoidaitrang.doctorcheck.vn/`
- **Risk:** Fragmentation of domain authority (DA) and backlink equity across subdomains instead of consolidating authority under `doctorcheck.vn`.
- **Required Decision:**
  - **Option A:** Maintain subdomains as external links during initial cutover.
  - **Option B:** Consolidate subdomains into root paths (`/noi-soi-da-day/` and `/noi-soi-dai-trang/`) via DNS/reverse proxy 301 redirects.
- **Status:** **`DECISION REQUIRED`**.

---

### 2.3. Medium Blockers (`MEDIUM`)

#### BLOCKER-06: Commercial Pricing Schedule & Insurance Co-Pay Verification
- **Current State:** Pricing data is spread across:
  - `/bang-gia-dich-vu-tam-soat-benh-tai-doctor-check/` (Page ID 1258, main table)
  - `/bang-gia-dich-vu/` (Page ID 5717, legacy table)
  - `/trung-tam-noi-soi-tieu-hoa-doctor-check/bang-gia-2026/` (Endoscopy 2026 rates)
  - 9 WooCommerce products (`/goi-khuyen-cao-danh-cho-nu/`, etc.)
- **Risk:** Publishing outdated, contradictory, or incorrect medical fees violates price transparency regulations and misleads patients.
- **Required Action:** Clinic business management must review and provide a single authoritative 2026 Pricing Matrix before Phase 2 implementation.
- **Status:** **`PENDING CLINIC SIGN-OFF`**.

---

#### BLOCKER-07: Policy for 6 Internal / Draft Staging Pages
- **Current State:** REST API interrogations discovered 6 pages that return HTTP 200 but are tagged `noindex` by Rank Math and omitted from `page-sitemap.xml`:
  1. `/bang-gia-kham-tong-quat/` (Page ID 1429, noindex)
  2. `/bang-gia-kham-tong-quat-new/` (Page ID 2168, noindex)
  3. `/buon-non-non-keo-dai/` (Page ID 3269, noindex)
  4. `/dieu-tri-tao-bon-di-cau-ra-mau/` (Page ID 3054, noindex)
  5. `/loi-ich-goi-song-tho/` (Page ID 3011, noindex)
  6. `/trung-tam-noi-soi-tieu-hoa/bang-gia-noi-soi-da-day/` (Page ID 2723, noindex)
- **Required Decision:**
  - Redirect pricing drafts (`/bang-gia-kham-tong-quat*`) to `/bang-gia-dich-vu-tam-soat-benh-tai-doctor-check/` (301).
  - Exclude symptom drafts from production build or 301 redirect them to corresponding canonical articles.
- **Status:** **`DECISION REQUIRED`**.

---

### 2.4. Low Blockers (`LOW`)

#### BLOCKER-08: Third-Party Analytics & Container IDs
- **Current State:** Detected containers:
  - Microsoft Clarity: `iaa767fkfn`
  - TikTok Pixel: `CJSOI6BC77UDO397GB30`
  - Zalo OA: `309834292180920772`
- **Required Action:** Confirm whether existing container IDs should be carried over into environment variables (`NEXT_PUBLIC_CLARITY_ID`, `NEXT_PUBLIC_TIKTOK_PIXEL_ID`, etc.) or replaced with fresh tracking profiles.
- **Status:** **`VERIFICATION REQUIRED`**.

---

## 3. Decision Matrix & Action Plan

```
┌────────────────────────────────────────────────────────────────────────┐
│                        CRITICAL PATH DECISIONS                         │
├────────────────────────────────────────────────────────────────────────┤
│ 1. CRM Lead Receiver Interface & Endpoint Details (BLOCKER-01)         │
│ 2. Resolution of 4 Page vs Post Collisions (BLOCKER-02)                │
│ 3. About Page Canonicalization: /ve-chung-toi/ (BLOCKER-03)            │
├────────────────────────────────────────────────────────────────────────┤
│                          TECHNICAL DECISIONS                           │
├────────────────────────────────────────────────────────────────────────┤
│ 4. Decoupled Content Storage Strategy for 108 Articles (BLOCKER-04)    │
│ 5. Subdomain Migration or Outbound Link Strategy (BLOCKER-05)          │
│ 6. Final Authoritative 2026 Pricing Schedule Sign-off (BLOCKER-06)     │
└────────────────────────────────────────────────────────────────────────┘
```

**Implementation may NOT start until client alignment is achieved on Items 1, 2, and 3.**
