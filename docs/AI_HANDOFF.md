# DOCTORCHECK NEXT.JS — AI MASTER HANDOFF & RECOVERY CHECKPOINT

> **Document Purpose:** This document is the single authoritative project checkpoint for current and future AI coding agents. It records locked architectures, canonical database counts, protected collision routes, visual fidelity benchmarks, test suites, and strict boundary rules.
>
> **Security Notice:** No credentials, database connection strings, passwords, API tokens, or secrets are stored in this document.

---

## 1. Executive Status & Component Lock Matrix

| Component / Subsystem | Status | Locked Date | Parity / Fidelity | Key Verification Target |
| :--- | :--- | :--- | :--- | :--- |
| **Database Architecture (DB-FINAL)** | **LOCKED** | 2026-09-17 | 100% SHA-256 Bit Parity | PostgreSQL canonical; zero database mutation |
| **CMS Architecture (CMS-FINAL)** | **LOCKED** | 2026-09-17 | 100% Feature Complete | CMS-1 through CMS-12, RBAC, Audit, Session, Redirects |
| **Authentication (AUTH HOTFIX)** | **LOCKED** | 2026-09-17 | 70/70 Tests Passing | `sanitizeReturnTo` handles null/empty/malformed safely |
| **Header & Navigation** | **LOCKED** | 2026-09-17 | 100% Pixel Faithful | Desktop 90px / Mobile 64px, SVG icons, Submenus |
| **Footer & Disclaimers** | **LOCKED** | 2026-09-17 | 100% Pixel Faithful | Scoped CSS, Ministry of Industry badges, Certifications |
| **Homepage UI** | **LOCKED** | 2026-09-17 | 100% Pixel Faithful | 14 sections, Hero slider, Doctors carousel, FAQ accordion |
| **Article Template UI** | **LOCKED** | 2026-09-17 | 100% Forensic Parity | Verified across 108 articles, 51 dynamic TOCs |
| **Pricing Template UI (P3)** | **LOCKED** | 2026-09-18 | 100% Forensic Parity | `bang-gia-2026`, `bang-gia-dich-vu-tam-soat-benh-tai-doctor-check`, `bang-gia-dich-vu` |
| **About Us UI (P4)** | **LOCKED** | 2026-09-18 | 100% Forensic Parity | `/ve-doctor-check/` (7 sections, 15-item gallery, modals) |
| **Protected Collisions** | **LOCKED** | 2026-09-18 | 6/6 Passing | Type resolution precedence preserved |
| **P5 Inner Page Discovery** | **LOCKED** | 2026-09-18 | 55/55 Pages Categorized | 6 Reusable Template Families Discovered |
| **P5.1 Family 1: Clinical Endoscopy Hub** | **LOCKED** | 2026-09-18 | 100% Forensic Parity | 10 Pages covered via `ClinicalEndoscopyTemplate.tsx` |
| **P5.2 Family 3: Health Checkup & Comparison** | **LOCKED** | 2026-09-18 | 100% Forensic Parity | 15 Pages covered via `PackageComparisonTemplate.tsx` |
| **P5.3 Family 4: Clinical Quality & Protocols** | **LOCKED** | 2026-09-18 | 100% Forensic Parity | 7 Pages covered via `ClinicalProtocolsTemplate.tsx` |
| **P5.4 Family 2: Clinical Symptom & Pathology Guide** | **LOCKED** | 2026-09-18 | 100% Forensic Parity | 6 Pages covered via `ClinicalGuideTemplate.tsx` |
| **P5.5 Family 6: Utility, Contact & Legal Content** | **LOCKED** | 2026-09-18 | 100% Forensic Parity | 5 Pages covered via `UtilityLegalTemplate.tsx` |
| **P5.6 Family 5: Cancer Screening Knowledge Hub** | **LOCKED** | 2026-09-18 | 100% Forensic Parity | 2 Pages covered via `KnowledgeHubTemplate.tsx` |
| **UI-FINAL: Full Site Visual & Responsive Acceptance** | **LOCKED** | 2026-09-18 | 100% Parity | 55/55 Pages, 108 Articles, 7 Doctors, 9 Packages, 7 Home Blocks |
| **WEB-FINAL: SEO, GEO, A11Y & Performance** | **LOCKED** | 2026-09-18 | 100% Structural & Security Pass | Robots, Sitemap, 108/108 Articles, 55/55 Pages, 7/7 Doctors, 9/9 Packages |
| **DEPLOYMENT-PREFLIGHT: Production Readiness** | **PASS CODE / INFRA ACTION REQUIRED** | 2026-09-18 | 100% Code Ready | Health routes, Docker, DB backup/restore, S3 adapter, Env validation |

---

## 2. Canonical Database Baseline

The PostgreSQL database is the single source of truth. All content and metadata have 100% SHA-256 bit-for-bit parity with the original WordPress/WooCommerce platform:

- **Articles:** `108`
- **Doctors:** `7`
- **Packages:** `9`
- **Pages:** `55`
- **Categories:** `30`
- **Homepage Blocks:** `7`

**Constraint:**
- `CONTENT DRIFT = 0`
- `ARTICLE HTML CHECKSUM DRIFT = 0`
- `PAGE HTML CHECKSUM DRIFT = 0`
- `PRICE DATA DRIFT = 0`
- No direct SQL / Drizzle schema mutations or content rewrites without explicit user mandate.

---

## 3. Six Protected Collision Slugs

The application handles 6 high-priority slug collisions where a single URL slug exists across multiple content types (e.g. Category vs Article vs Page). Precedence rules (`Article > Category > Page`) ensure zero route drift:

1. `/dau-thuong-vi/` $\rightarrow$ Article (`type: 'article'`)
2. `/tieu-chay/` $\rightarrow$ Article (`type: 'article'`)
3. `/di-ngoai-ra-mau/` $\rightarrow$ Article (`type: 'article'`)
4. `/tao-bon/` $\rightarrow$ Article (`type: 'article'`)
5. `/kien-thuc-ung-thu-da-day/` $\rightarrow$ Category (`type: 'category'`)
6. `/kien-thuc-ung-thu-dai-trang/` $\rightarrow$ Category (`type: 'category'`)

All 6 collision cases must pass validation on every build and test cycle.

---

## 4. Production Crawl & Network Safety Rules

- **DoctorCheck.vn Network Access:** `STRICTLY FORBIDDEN` (All production network access is closed; UI-FINAL and all testing operate local-first).
- **HTML Requests:** `0` (1 request for P5.1, P5.2, P5.3, P5.4, P5.5, P5.6 respectively; access now closed)
- **Asset Requests:** `0`
- **Forbidden Actions:**
  - No recursive crawling
  - No sitemap scraping
  - No link following
  - No `wp-content` asset bulk downloads
  - No parallel external HTTP probing
- **Local-First Mandate:** Always utilize local forensic evidence (`docs/research/`, `public/sites/doctorcheck-vn/root/images/`, `src/lib/content/data/`, local HTML snapshots, and CSS source maps).

---

## 5. Inner Page Families Matrix & Status

Total Canonical Pages: **55** | Covered: **55** (100%) | Uncovered: **0** | Unknown Templates: **0**

### All Six Families LOCKED:
1. **Locked Core / Specialized (10 pages)** — **LOCKED**
   - *Routes:* About Us (2: `ve-doctor-check`, `ve-chung-toi`), Pricing (3: `bang-gia-2026`, `bang-gia-dich-vu-tam-soat-benh-tai-doctor-check`, `bang-gia-dich-vu`), Article Collision Slugs (4: `dau-thuong-vi`, `tieu-chay`, `di-ngoai-ra-mau`, `tao-bon`), Homepage (1: `trang-chu`).
2. **Family 1: Clinical Endoscopy & Specialty Hub (10 pages)** — **LOCKED (P5.1)**
   - *Routes:* `/noi-soi-da-day/`, `/noi-soi-dai-trang/`, `/trung-tam-noi-soi-tieu-hoa-doctor-check/chuyen-khoa-da-day/`, `/trung-tam-noi-soi-tieu-hoa-doctor-check/chuyen-khoa-dai-trang/`, `/trung-tam-noi-soi-tieu-hoa/`, `/trung-tam-noi-soi-tieu-hoa-doctor-check/`, `/trung-tam-noi-soi-tieu-hoa-doctor-check/chuyen-khoa-da-day/noi-soi-da-day-chan-doan-benh-ly/`, `/trung-tam-noi-soi-tieu-hoa-doctor-check/chuyen-khoa-dai-trang/noi-soi-dai-trang-chan-doan-benh-ly/`, `/trung-tam-noi-soi-tieu-hoa-doctor-check/tam-soat-ung-thu-da-day-tai-doctor-check/`, `/trung-tam-noi-soi-tieu-hoa-doctor-check/tam-soat-ung-thu-dai-trang-tai-doctor-check/`.
   - *Template:* `ClinicalEndoscopyTemplate.tsx` + `src/styles/clinical-hub.css`.
3. **Family 3: Health Checkup & Package Comparison (15 pages)** — **LOCKED (P5.2)**
   - *Routes:* `/goi-tam-soat-nam/`, `/goi-tam-soat-nu/`, `/so-sanh-3-goi-kham-nam/`, `/so-sanh-3-goi-kham-nu/`, `/so-sanh-goi-kham-tong-quat-danh-cho-nam/`, `/so-sanh-goi-kham-tong-quat-danh-cho-nu/`, `/bang-gia-kham-tong-quat/`, `/bang-gia-kham-tong-quat-new/`, `/bang-gia-kham-suc-khoe-tong-quat/`, `/trung-tam-noi-soi-tieu-hoa/bang-gia-noi-soi-da-day/`, `/kham-tong-quat/`, `/kham-suc-khoe-doanh-nghiep/`, `/loi-ich-goi-song-tho/`, `/loi-ich-khi-kham-tong-quat-tai-doctor-check/`, `/cac-yeu-to-cua-mot-dia-chi-tam-soat-benh-trong-mo/`.
   - *Template:* `PackageComparisonTemplate.tsx` + `src/styles/package-comparison.css`.
4. **Family 4: Clinical Quality, Trust & Protocols (7 pages)** — **LOCKED (P5.3)**
   - *Routes:* `/trung-tam-noi-soi-tieu-hoa-doctor-check/10-tieu-chuan-vang/`, `/trung-tam-noi-soi-tieu-hoa-doctor-check/tam-soat-ung-thu-da-day-tai-doctor-check/quy-trinh-noi-soi-da-day/`, `/trung-tam-noi-soi-tieu-hoa-doctor-check/tam-soat-ung-thu-dai-trang-tai-doctor-check/quy-trinh-noi-soi-dai-trang/`, `/thuoc-va-vat-tu-y-te/`, `/doi-ngu-bac-si-doctorcheck/`, `/trung-tam-noi-soi-tieu-hoa-doctor-check/bao-chi-dua-tin/`, `/trung-tam-noi-soi-tieu-hoa-doctor-check/quyen-loi-bhyt-bhtn/`.
   - *Template:* `ClinicalProtocolsTemplate.tsx` + `src/styles/clinical-protocols.css`.
5. **Family 2: Clinical Symptom & Pathology Guide (6 pages)** — **LOCKED (P5.4)**
   - *Routes:* `/trung-tam-noi-soi-tieu-hoa-doctor-check/chuyen-khoa-da-day/trieu-chung-da-day/`, `/trung-tam-noi-soi-tieu-hoa-doctor-check/chuyen-khoa-da-day/benh-ly-da-day/`, `/trung-tam-noi-soi-tieu-hoa-doctor-check/chuyen-khoa-dai-trang/trieu-chung-dai-trang/`, `/trung-tam-noi-soi-tieu-hoa-doctor-check/chuyen-khoa-dai-trang/benh-ly-dai-trang/`, `/buon-non-non-keo-dai/`, `/dieu-tri-tao-bon-di-cau-ra-mau/`.
   - *Template:* `ClinicalGuideTemplate.tsx` + `src/styles/clinical-guide.css`.
6. **Family 6: Utility, Contact & Legal Content (5 pages)** — **LOCKED (P5.5)**
   - *Routes:* `/lien-he/`, `/chinh-sach-quyen-rieng-tu/` (and policy aliases: `/chinh-sach-bao-mat/`, `/chinh-sach-thanh-toan/`, `/chinh-sach-hoan-tien/`, `/dieu-khoan-su-dung/`), `/cam-on/`, `/dich-vu/`, `/blog/`.
   - *Template:* `UtilityLegalTemplate.tsx` + `src/styles/utility-legal.css`.
7. **Family 5: Cancer Screening Knowledge Hub (2 pages)** — **LOCKED (P5.6)**
   - *Routes:* `/trung-tam-noi-soi-tieu-hoa-doctor-check/tam-soat-ung-thu-da-day-tai-doctor-check/kien-thuc-ung-thu-da-day/` (`kien-thuc-ung-thu-da-day`), `/trung-tam-noi-soi-tieu-hoa-doctor-check/tam-soat-ung-thu-dai-trang-tai-doctor-check/kien-thuc-ung-thu-dai-trang/` (`kien-thuc-ung-thu-dai-trang`).
   - *Template:* `KnowledgeHubTemplate.tsx` + `src/styles/knowledge-hub.css`.

---

## 6. Verification & Test Suites

The repository contains dedicated forensic verification suites:

- `npm run ui-final:sweep` — Validates full database baseline, 55/55 canonical pages sweep, 108 articles, 7 doctors, 9 packages, 7 homepage blocks, and 6 protected collisions.
- `npm run knowledge-pages:test` — Validates Family 5 knowledge hub pages, section structure, 55/55 coverage, zero slug hacks.
- `npm run utility-pages:test` — Validates all 5 Family 6 utility/legal pages, contact box layout, clinic metadata, safe form contracts, and scoped typography.
- `npm run guide-pages:test` — Validates all 6 Family 2 pages, classification, canonical HTML, symptom grids, zero slug hacks, and protected collision non-regression.
- `npm run protocol-pages:test` — Validates all 7 Family 4 pages, classification, canonical HTML, and scoped styles.
- `npm run package-pages:test` — Validates all 15 Family 3 pages, classification, canonical HTML, canonical package prices, zero price drift, and scoped styles.
- `npm run clinical-pages:test` — Validates all 10 Family 1 pages, classification, canonical HTML, and scoped styles.
- `npm run about:test` — Validates canonical About route (`/ve-doctor-check/`), 301 legacy redirects, 7 authentic sections, 15-item gallery, modals, and design tokens.
- `npm run pricing:test` — Validates pricing routes, tabs, tables, packages, responsive contracts.
- `npm run article:verify` — Validates all 108 articles, dynamic TOCs, SEO metadata, table structure.
- `npm run check` — Runs ESLint, TypeScript compiler (`tsc --noEmit`), and Next.js production build.
- `npm run build` — Full production bundle compilation (234 routes compiled with 0 errors).

---

## 7. Next Workstream & Acceptance Target

- **Current Phase:** **`DEPLOYMENT-PREFLIGHT — PRODUCTION READINESS & INFRASTRUCTURE ACCEPTANCE`**
- **Status:** **PASS CODE / INFRASTRUCTURE ACTION REQUIRED**
- **Application Code Readiness:** **100% PASS** (Build, TypeScript, Lint, 234 routes SSG/Static, 0 leaks, DB backup/restore drills passing)
- **External Infrastructure Pending:**
  1. Production PostgreSQL provisioning (Private VPC, SSL enforced).
  2. S3/R2 Object Storage bucket provisioning & API keys.
  3. Automated daily DB backup cron job (`npm run db:backup`) with off-host sync.
  4. Production DNS / TLS termination at Reverse Proxy (Cloudflare / Nginx / ALB).
- **Next Phase:** **`CONTROLLED PRODUCTION DEPLOYMENT`** (Awaiting external infra provisioning and explicit user signoff).
- **Instruction:** DO NOT DEPLOY automatically. Await user confirmation.
