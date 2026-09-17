# Phase 3 — Medical Content Issues & Source Content Audit

This document records all anomalies, legacy references, unparsed shortcodes, and structural quirks identified in the original WordPress/Flatsome source content of [DoctorCheck.vn](https://www.doctorcheck.vn/).

In strict compliance with the **Medical Content Safety Protocol**, no medical claims, drug names, clinical statistics, or screening recommendations were altered, summarized, or fabricated. All source issues were preserved with deterministic normalization and logged below for clinical editorial review.

---

## Content Issues Log

### 1. Deactivated Table Builder Shortcode (`[wptb id=20590]`)
- **Source Content Issue:** The WordPress database contains the unparsed shortcode `[wptb id=20590]` inside the article body. Because the *WP Table Builder* plugin was deactivated or removed on the live WordPress instance, the live website literally prints the raw text string `[wptb id=20590]`.
- **Affected URLs:**
  - `https://doctorcheck.vn/ung-thu-dai-truc-trang/`
  - `https://doctorcheck.vn/ung-thu-truc-trang/`
- **Affected Section:** Under paragraph: *"Dưới đây là các khuyến cáo về tầm soát ung thư đại – trực tràng của các tổ chức trên thế giới:"* immediately preceding the explanatory legend for `gFOBT`, `HSgFOBT`, and `FIT`.
- **Recommended Review:** Clinic editorial team should provide an updated, responsive HTML comparison table summarizing the guidelines from the American Cancer Society (ACS) and U.S. Preventive Services Task Force (USPSTF).
- **Migration Impact:** The raw shortcode was preserved as rendered by WordPress without breaking layout. In Next.js, the surrounding text and medical terms are preserved with full fidelity.

---

### 2. Empty Page Container vs. Populated Legacy Page (`ve-doctor-check` vs. `ve-chung-toi`)
- **Source Content Issue:** Page ID 5702 (`/ve-doctor-check/`) has 0 body content in the WordPress database because it was created as an empty container. The actual, authentic "About Doctor Check" rich content (80,091 characters detailing clinic vision, mission, medical board, Olympus endoscopy suites, and sterile reprocessing standards) is stored under Page ID 81 (`/ve-chung-toi/`).
- **Affected URLs:**
  - `https://doctorcheck.vn/ve-doctor-check/`
  - `https://doctorcheck.vn/ve-chung-toi/`
- **Affected Section:** Entire page body.
- **Recommended Review:** Medical Director review of the clinic introduction text to ensure all clinical credentials and hospital affiliations are up to date.
- **Migration Impact:** In Phase 2 routing, `/ve-chung-toi/` 301 redirects to `/ve-doctor-check/`. In Phase 3, the Next.js content layer automatically hydrates `/ve-doctor-check/` with the authentic 80KB rich content from Page 81, ensuring users arriving at `/ve-doctor-check/` see the complete, authentic page rather than a blank template.

---

### 3. Hardcoded PHP Theme Templates for Pricing & Package Comparisons
- **Source Content Issue:** Three major commercial and clinical comparison pages returned 0 characters of content via the WordPress REST API (`content.rendered: ""`) because they were implemented as hardcoded PHP templates in Flatsome (`page-pricing.php`).
- **Affected URLs:**
  - `https://doctorcheck.vn/bang-gia-dich-vu-tam-soat-benh-tai-doctor-check/` (Page 1258)
  - `https://doctorcheck.vn/so-sanh-goi-kham-tong-quat-danh-cho-nu/` (Page 1597)
  - `https://doctorcheck.vn/so-sanh-goi-kham-tong-quat-danh-cho-nam/` (Page 1595)
- **Affected Section:** Full diagnostic pricing tables, itemized laboratory tests, ultrasound, digital radiography, and Olympus endoscopy tariffs.
- **Recommended Review:** Periodic tariff review by Doctor Check finance and clinical administration to ensure item prices match 2026 published service lists.
- **Migration Impact:** The authentic, live-rendered `<main>` HTML bodies (~108KB - 202KB) were extracted directly from the live production site and ingested into `pages-content.json`. All 3 pages render with 100% authentic tariffs, features, and comparison tables.

---

### 4. Legacy Year References in Internal Links (`/bang-gia-2025/`)
- **Source Content Issue:** Multiple medical articles authored in 2024-2025 contained hardcoded internal links to outdated 2025 tariffs, specifically `/trung-tam-noi-soi-tieu-hoa-doctor-check/bang-gia-2025/` and `/bang-gia-noi-soi-da-day-2025-new/`. On WordPress, these links trigger 404 or redirect loops.
- **Affected URLs:**
  - `https://doctorcheck.vn/ung-thu-da-day/`
  - `https://doctorcheck.vn/trao-nguoc-da-day-thuc-quan/`
  - `https://doctorcheck.vn/an-nhanh-no/`
  - `https://doctorcheck.vn/kho-tieu/`
  - `https://doctorcheck.vn/buon-non-non-keo-dai/`
  - `https://doctorcheck.vn/dau-thuong-vi/`
- **Affected Section:** Inline contextual CTA links.
- **Recommended Review:** Verify that all price references in article bodies align with current 2026 pricing.
- **Migration Impact:** `link-normalizer.ts` deterministically resolves these legacy paths directly to `/trung-tam-noi-soi-tieu-hoa-doctor-check/bang-gia-2026/` and `/bang-gia-dich-vu-tam-soat-benh-tai-doctor-check/`, ensuring zero broken links and zero unnecessary redirect hops for users and crawlers.

---

### 5. Subdomain Marketing Link in Symptom Guide (`buon-non-non`)
- **Source Content Issue:** In the medical article `buon-non-non` ("Buồn nôn, nôn"), the anchor text *"Chướng bụng"* was linked to an external campaign subdomain: `https://www.noisoidaday.doctorcheck.vn/day-bung/`.
- **Affected URLs:**
  - `https://doctorcheck.vn/buon-non-non/`
- **Affected Section:** Associated gastrointestinal symptoms list.
- **Recommended Review:** Confirm internal link anchor points to the canonical medical knowledge article on abdominal bloating.
- **Migration Impact:** In accordance with the single root-level canonical architecture, `link-normalizer.ts` maps this link directly to the authoritative canonical article `/chuong-bung-day-hoi/` ("Chướng bụng, đầy hơi"), eliminating external subdomain latency and preserving SEO link equity.

---

### 6. Lightbox Anchor Wrappers on Uploaded Medical Images
- **Source Content Issue:** Several clinical infographics and examination result diagrams were wrapped in `<a>` tags pointing directly to the uploaded file URL (e.g. `<a href="https://www.doctorcheck.vn/wp-content/uploads/2025/09/Screenshot_5-571x800-1.webp">`).
- **Affected URLs:**
  - `https://doctorcheck.vn/10-tieu-chuan-vang/`
  - `https://doctorcheck.vn/goi-tam-soat-nu/`
  - `https://doctorcheck.vn/goi-tam-soat-nam/`
- **Affected Section:** Clinical standard diagrams, biopsy reports, and equipment photos.
- **Recommended Review:** Image enlargement / lightbox behavior can be enhanced in a future phase with a clean modal component.
- **Migration Impact:** Link normalizer recognizes `/wp-content/uploads/` paths and preserves direct image URLs untouched, preventing them from being falsely treated as page routes.

---

## Summary Matrix

| Issue ID | Affected URL(s) | Category | Source Root Cause | Resolution in Next.js |
| :--- | :--- | :--- | :--- | :--- |
| **ISS-01** | `ung-thu-dai-truc-trang`, `ung-thu-truc-trang` | Unparsed Shortcode | Deactivated WP Table Builder | Preserved authentically; noted for editorial review |
| **ISS-02** | `ve-doctor-check`, `ve-chung-toi` | Empty Container | Page 5702 empty; Page 81 populated | Ingested authentic 80KB content from Page 81 |
| **ISS-03** | `bang-gia-dich-vu...`, `so-sanh-goi...` (x2) | Custom Theme Template | flatsome `page-pricing.php` | Extracted & ingested authentic live `<main>` HTML |
| **ISS-04** | `ung-thu-da-day`, `kho-tieu`, `an-nhanh-no` | Legacy Tariff Link | Obsolete 2025 tariff links | Deterministically mapped to 2026 canonical tariffs |
| **ISS-05** | `buon-non-non` | Subdomain Link | Subdomain marketing landing URL | Mapped to canonical article `/chuong-bung-day-hoi/` |
| **ISS-06** | `10-tieu-chuan-vang`, `goi-tam-soat...` | Image Attachment Link | Flatsome media lightbox wrapper | Preserved media upload path without route disruption |
