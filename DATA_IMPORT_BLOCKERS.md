# DATA IMPORT BLOCKERS — DOCTORCHECK MIGRATION PHASE 1

**Audit Date:** 2026-09-15  
**Migration Phase:** Phase 1 (Business, Medical & Data Layer Elimination of Fake Assets)  
**Strict Policy:** Zero Data Invention. Zero AI Content Rewriting. Zero Stock Profiles.

---

## 1. Executive Summary

During Phase 1, all fabricated, stock, and placeholder business entities were purged from the production codebase. An explicit, strongly-typed data layer was created under `src/lib/data/`:
- `clinic.ts`: Verified clinic contact, physical address, license, coordinates, and operating schedule.
- `doctors.ts`: 7 authentic licensed physicians with official CCHN numbers, specialties, and CDN portraits.
- `packages.ts`: 9 authentic DoctorCheck examination packages with verified pricing and benefits.
- `categories.ts`: 30 authentic WordPress taxonomy categories.
- `articles.ts`: Complete catalog of 108 authentic medical articles.

This document details the exact blockers and outstanding assets requiring Phase 2 database/CMS pipeline imports.

---

## 2. Medical Articles (108 Posts) — BLOCKED

| Item | Requirement | Current Status | Blocker Reason & Next Steps |
| :--- | :--- | :--- | :--- |
| **Article Metadata** | 108 posts (Title, Slug, Date, Categories, Link) | **VERIFIED (108/108)** | Fully cataloged in `src/lib/data/articles.ts` directly from the live WordPress REST API (`/wp/v2/posts`) and `post-sitemap.xml`. |
| **Article Body Content (HTML)** | Full sanitized article content body | **BLOCKED** | The local CMS / Markdown content storage has not been populated with full post HTML bodies. **In compliance with Phase 1 rules, NO AI content generation, summarizing, or rewriting was performed.** Full HTML bodies will be ingested during the Phase 2 Content Migration Pipeline. |
| **Article Featured Images** | 108 high-resolution featured images | **BLOCKED** | Image IDs are cataloged (`featuredMediaId`). Local high-res webp download script is scheduled for the asset migration pipeline. |

### Import Plan for Blocked Articles (Phase 2):
1. Execute automated WordPress REST API content extractor (`/wp/v2/posts?per_page=100`) with pagination.
2. Convert WordPress Gutenberg HTML to clean, sanitized JSX / Markdown / Rich Text blocks.
3. Download all referenced CDN images (`/wp-content/uploads/*`) to `public/images/articles/`.
4. Validate medical disclaimer, author attribution, and internal link preservation.

---

## 3. Physicians & Clinical Staff (7 Doctors) — RESOLVED & DOCUMENTED

All 7 physicians listed on DoctorCheck have been extracted and verified against official Ministry of Health / Sở Y Tế records:

| Physician Name | Degree & Title | Specialty | Practice License (CCHN) | Photo Asset Status |
| :--- | :--- | :--- | :--- | :--- |
| **Trịnh Ái Nhi** | BSCKII | Nội Tổng Hợp - Nội Soi Tiêu Hóa | `040144/HCM-CCHN` | Verified (`Hinh-5.webp`) |
| **Châu Quỳnh Phi Nhã** | BSCKII | Nội Tổng Hợp - Nội Soi Tiêu Hóa | `013479/HCM-CCHN` | Verified (`BS-Nha-1.webp`) |
| **Nguyễn Ngọc Quỳnh Dung** | ThS. BSCKII | Nội Khoa Tổng Quát | `005241/KH-CCHN` | Verified (`Hinh-3.webp`) |
| **Nguyễn Hồng Thanh** | ThS. BSCKII | Nội Khoa Tổng Quát - Nội Soi Tiêu Hóa | `0024841/HCM-CCHN` | Verified (`Hinh-2.webp`) |
| **Lưu Ngọc Mai** | ThS. BSCKI | Nội Khoa Tổng Quát - Nội Soi Tiêu Hóa | `034564/BYT-CCHN` | Verified (`Hinh-1.webp`) |
| **Thái Việt Nguyên** | ThS. BSNT | Nội Khoa Tổng Quát | `007376/BĐ-CCHN` | Verified (`BS-Nguyen.webp`) |
| **Đặng Nguyễn Nhật Thanh Thi** | BSCKI | Phụ Trách Ngoại - Bác Sĩ Nội Soi | `010862/HCM-CCHN` | Verified (`BS-Thi.webp`) |

### Missing Extended Physician Fields (Non-blocking for Phase 1):
- **Full Biography / Academic Publications:** Detailed CV text for each physician is not yet published in full length on DoctorCheck.vn. These remain marked as `UNKNOWN` rather than synthesized.

---

## 4. Examination Packages (9 Packages) — RESOLVED & DOCUMENTED

| Package Slug | Name | Gender | Price (VND) | Hạng mục | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `goi-khuyen-cao-danh-cho-nu` | Gói Khám Sức Khỏe Khuyến Cáo Nữ | Nữ | 3.000.000đ | 23 hạng mục | Verified |
| `goi-khuyen-cao-danh-cho-nam` | Gói Khám Bác Sĩ Khuyến Cáo Nam | Nam | 2.990.000đ | 23 hạng mục | Verified |
| `goi-tam-soat-chuyen-sau-danh-cho-nu` | Gói Khám Chuyên Sâu Nữ | Nữ | 5.000.000đ | 39 hạng mục | Verified |
| `goi-chuyen-sau-danh-cho-nam` | Gói Khám Sức Khỏe Chuyên Sâu Nam | Nam | 5.000.000đ | 34 hạng mục | Verified |
| `goi-kham-song-tho-danh-cho-nu` | Gói Khám Sống Thọ Nữ Toàn Diện | Nữ | 11.500.000đ | 47 hạng mục | Verified |
| `goi-song-tho-danh-cho-nam` | Gói Khám Sức Khỏe Sống Thọ Nam | Nam | 11.500.000đ | 42 hạng mục | Verified |
| `goi-ung-thu-da-day` | Gói Khám Tầm Soát Bệnh Lý Dạ Dày | Chung | Liên hệ tư vấn | Khám & Nội soi | Verified |
| `tam-soat-ung-thu-da-day` | Tầm Soát Ung Thư Dạ Dày Chuyên Sâu | Chung | Liên hệ tư vấn | NBI Phóng đại 4K | Verified |
| `tam-soat-ung-thu-dai-trang` | Tầm Soát Ung Thư Đại Trực Tràng Chuyên Sâu | Chung | Liên hệ tư vấn | Cắt polyp tức thì | Verified |

---

## 5. Contact & Regulatory Information — 100% RESOLVED

- **Address:** `429 Tô Hiến Thành, Phường 14, Quận 10, TP. Hồ Chí Minh`
- **Hotline:** `028 5678 9999`
- **Zalo OA:** `https://zalo.me/309834292180920772`
- **Health License:** `09789/HCM-GPHĐ` (Sở Y Tế TP. Hồ Chí Minh cấp)
- **All old fake values (`1900 88 99 22`, `028 3822 9999`, `42A Nguyễn Huệ`, `0901234567`, `0939 010 101`, `Phường Diên Hồng`) have been eliminated from `src/`.**
