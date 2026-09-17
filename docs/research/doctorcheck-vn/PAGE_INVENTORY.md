# Website-Wide Page Inventory: DoctorCheck.vn

**Target Website:** [DoctorCheck.vn](https://doctorcheck.vn/)  
**Document Code:** `PAGE_INVENTORY.md`  
**Total Discovered URLs:** **226**  
**Audit Source:** Multi-source discovery across XML sitemaps (`post-sitemap.xml`, `page-sitemap.xml`, `product-sitemap.xml`, `category-sitemap.xml`, `blocks-sitemap.xml`), `robots.txt`, and WordPress REST API (`/wp-json/wp/v2/`).

---

## 1. Inventory Summary & Content Type Breakdown

| Content Type / Scope | URL Count | Classification | Recommended Architectural Action |
| :--- | :---: | :--- | :--- |
| **WordPress Pages (`post_type = 'page'`)** | **51** | Public User-Facing | Core templates (Homepage, Pricing, About, Contact, Clinical hubs). 44 in sitemap + 6 noindex API drafts + 1 Blog Index. |
| **WordPress Posts (`post_type = 'post'`)** | **108** | Public User-Facing | Medical knowledge articles. Preserved via dynamic ISR (`/[slug]/`). |
| **WooCommerce Products (`post_type = 'product'`)** | **9** | Public User-Facing | Clinical examination packages. Migrated to static/dynamic package templates. |
| **Doctor Profiles (`post_type = 'doctor'`)** | **7** | Public User-Facing | Clinical faculty credentials. Migrated to `/doctor/[slug]/` with Physician schema. |
| **Category Taxonomies (`taxonomy = 'category'`)** | **30** | Public User-Facing | Medical article category archives. Migrated via `/[slug]/` with BreadcrumbList schema. |
| **FAQs (`faq`)** | **0 standalone URLs** | Embedded Components | FAQs exist as embedded post-meta/ACF blocks on pages, not standalone public permalinks. |
| **SUBTOTAL: Public User-Facing Pages** | **205** | **Public Routes** | **All 205 URLs to be handled via Next.js App Router (200 OK or 301 Redirect).** |
| **Flatsome UX Blocks (`post_type = 'blocks'`)** | **21** | **Internal Components** | **DO NOT MIGRATE AS ROUTES.** Rebuild as reusable React UI components in `src/components/`. |
| **TOTAL DISCOVERED URLS** | **226** | **Global Footprint** | Complete verified catalog. |

> [!IMPORTANT]
> **Internal UX Blocks Must NOT Become Public Routes:**  
> The 21 URLs discovered in `blocks-sitemap.xml` (e.g. `/blocks/footer/`, `/blocks/doi-ngu-bac-si/`, `/blocks/facilities/`) are internal page builder template fragments. They are **not user-facing web pages** and must **never** be registered as public Next.js routes.

---

## 2. Complete Reconciled URL Catalog (All 226 URLs)

### Section A: Public User-Facing Routes (1 to 205)

| # | URL | Page Title | Template Architecture | True WordPress Type | Priority | Migrate Action |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | `https://www.doctorcheck.vn/` | Trang chủ | Homepage Template | Page | Critical (P0) | Yes (Core) |
| 2 | `https://www.doctorcheck.vn/cam-on/` | Cảm ơn | Contact & Booking Confirmation Template | Page | High (P1) | Yes |
| 3 | `https://www.doctorcheck.vn/doctor/chau-quynh-phi-nha/` | Châu Quỳnh Phi Nhã | Doctor Profile & Directory Template | Doctor Single | High (P1) | Yes |
| 4 | `https://www.doctorcheck.vn/doctor/dang-nguyen-nhat-thanh-thi/` | Đặng Nguyễn Nhật Thanh Thi | Doctor Profile & Directory Template | Doctor Single | High (P1) | Yes |
| 5 | `https://www.doctorcheck.vn/doctor/luu-ngoc-mai/` | Lưu Ngọc Mai | Doctor Profile & Directory Template | Doctor Single | High (P1) | Yes |
| 6 | `https://www.doctorcheck.vn/doctor/nguyen-hong-thanh/` | Nguyễn Hồng Thanh | Doctor Profile & Directory Template | Doctor Single | High (P1) | Yes |
| 7 | `https://www.doctorcheck.vn/doctor/nguyen-ngoc-quynh-dung/` | Nguyễn Ngọc Quỳnh Dung | Doctor Profile & Directory Template | Doctor Single | High (P1) | Yes |
| 8 | `https://www.doctorcheck.vn/doctor/thai-viet-nguyen/` | Thái Việt Nguyên | Doctor Profile & Directory Template | Doctor Single | High (P1) | Yes |
| 9 | `https://www.doctorcheck.vn/doctor/trinh-ai-nhi/` | Trịnh Ái Nhi | Doctor Profile & Directory Template | Doctor Single | High (P1) | Yes |
| 10 | `https://www.doctorcheck.vn/doi-ngu-bac-si-doctorcheck/` | Đội Ngũ Bác Sĩ | Doctor Profile & Directory Template | Page | High (P1) | Yes |
| 11 | `https://www.doctorcheck.vn/goi-chuyen-sau-danh-cho-nam/` | Gói Khám Sức Khỏe Chuyên Sâu Dành Cho Nam Giới - Doctor Check | Pricing & Package Detail Template | Product / Gói Khám | High (P1) | Yes |
| 12 | `https://www.doctorcheck.vn/goi-kham-song-tho-danh-cho-nu/` | Gói khám Sống Thọ cho nữ: Toàn diện, 47 hạng mục - Doctor Check | Pricing & Package Detail Template | Product / Gói Khám | High (P1) | Yes |
| 13 | `https://www.doctorcheck.vn/goi-khuyen-cao-danh-cho-nam/` | Gói khám Bác sĩ khuyến cáo dành cho nam giới - Doctor Check | Pricing & Package Detail Template | Product / Gói Khám | High (P1) | Yes |
| 14 | `https://www.doctorcheck.vn/goi-khuyen-cao-danh-cho-nu/` | Gói Khám Sức Khỏe Khuyến Cáo Dành Cho Nữ - Doctor Check | Pricing & Package Detail Template | Product / Gói Khám | High (P1) | Yes |
| 15 | `https://www.doctorcheck.vn/goi-song-tho-danh-cho-nam/` | Gói khám sức khỏe Sống Thọ dành cho nam giới - Doctor Check | Pricing & Package Detail Template | Product / Gói Khám | High (P1) | Yes |
| 16 | `https://www.doctorcheck.vn/goi-tam-soat-chuyen-sau-danh-cho-nu/` | Gói Khám Chuyên Sâu Dành Cho Nữ - Doctor Check | Pricing & Package Detail Template | Product / Gói Khám | High (P1) | Yes |
| 17 | `https://www.doctorcheck.vn/goi-tam-soat-nam/` | Gói tầm soát nam | Pricing & Package Detail Template | Page | High (P1) | Yes |
| 18 | `https://www.doctorcheck.vn/goi-tam-soat-nu/` | Gói tầm soát nữ | Pricing & Package Detail Template | Page | High (P1) | Yes |
| 19 | `https://www.doctorcheck.vn/goi-ung-thu-da-day/` | Ung thư dạ dày - Doctor Check | Pricing & Package Detail Template | Product / Gói Khám | High (P1) | Yes |
| 20 | `https://www.doctorcheck.vn/kham-suc-khoe-doanh-nghiep/` | Khám sức khỏe doanh nghiệp | Corporate B2B Health Template | Page | High (P1) | Yes |
| 21 | `https://www.doctorcheck.vn/kham-tong-quat/` | Khám tổng quát | Specialty Service & Clinical Template | Page | High (P1) | Yes |
| 22 | `https://www.doctorcheck.vn/lien-he/` | Liên hệ | Contact & Booking Confirmation Template | Page | High (P1) | Yes |
| 23 | `https://www.doctorcheck.vn/noi-soi-da-day-la-tieu-chuan-vang-chan-doan-benh-ly-chinh-xac/` | Nội soi dạ dày là tiêu chuẩn vàng chẩn đoán bệnh lý chính xác | Specialty Service & Clinical Template | Article / Blog | High (P1) | Yes |
| 24 | `https://www.doctorcheck.vn/noi-soi-da-day/` | Nội soi dạ dày | Specialty Service & Clinical Template | Page | High (P1) | Yes |
| 25 | `https://www.doctorcheck.vn/noi-soi-dai-trang/` | Nội soi đại tràng | Specialty Service & Clinical Template | Page | High (P1) | Yes |
| 26 | `https://www.doctorcheck.vn/so-sanh-3-goi-kham-nam/` | So sánh 3 gói khám nam | Pricing & Package Detail Template | Page | High (P1) | Yes |
| 27 | `https://www.doctorcheck.vn/so-sanh-3-goi-kham-nu/` | So sánh 3 gói khám nữ | Pricing & Package Detail Template | Page | High (P1) | Yes |
| 28 | `https://www.doctorcheck.vn/so-sanh-goi-kham-tong-quat-danh-cho-nam/` | So sánh Gói Khám Tổng Quát dành cho Nam | Pricing & Package Detail Template | Page | High (P1) | Yes |
| 29 | `https://www.doctorcheck.vn/so-sanh-goi-kham-tong-quat-danh-cho-nu/` | So sánh Gói Khám Tổng Quát dành cho Nữ | Pricing & Package Detail Template | Page | High (P1) | Yes |
| 30 | `https://www.doctorcheck.vn/tam-soat-ung-thu-da-day/` | Tầm soát ung thư dạ dày: Quy trình, bảng giá và lưu ý - Doctor Check | Pricing & Package Detail Template | Product / Gói Khám | High (P1) | Yes |
| 31 | `https://www.doctorcheck.vn/tam-soat-ung-thu-dai-trang/` | Tầm soát ung thư đại trực tràng: Quy trình & Lưu ý - Doctor Check | Pricing & Package Detail Template | Product / Gói Khám | High (P1) | Yes |
| 32 | `https://www.doctorcheck.vn/trung-tam-noi-soi-tieu-hoa-dau-tien-tai-viet-nam-dat-chuan-aaci-hoa-ky/` | Trung tâm nội soi tiêu hóa đầu tiên tại Việt Nam đạt chuẩn AACI Hoa Kỳ | Specialty Service & Clinical Template | Article / Blog | High (P1) | Yes |
| 33 | `https://www.doctorcheck.vn/trung-tam-noi-soi-tieu-hoa-doctor-check/` | Trung Tâm Nội Soi Tiêu Hóa Doctor Check | Specialty Service & Clinical Template | Page | High (P1) | Yes |
| 34 | `https://www.doctorcheck.vn/trung-tam-noi-soi-tieu-hoa-doctor-check/10-tieu-chuan-vang/` | 10 tiêu chuẩn vàng | Specialty Service & Clinical Template | Page | High (P1) | Yes |
| 35 | `https://www.doctorcheck.vn/trung-tam-noi-soi-tieu-hoa-doctor-check/bang-gia-2026/` | Bảng giá 2026 | Specialty Service & Clinical Template | Page | High (P1) | Yes |
| 36 | `https://www.doctorcheck.vn/trung-tam-noi-soi-tieu-hoa-doctor-check/bao-chi-dua-tin/` | Báo chí đưa tin | Specialty Service & Clinical Template | Page | High (P1) | Yes |
| 37 | `https://www.doctorcheck.vn/trung-tam-noi-soi-tieu-hoa-doctor-check/chuyen-khoa-da-day/` | Chuyên khoa dạ dày | Specialty Service & Clinical Template | Page | High (P1) | Yes |
| 38 | `https://www.doctorcheck.vn/trung-tam-noi-soi-tieu-hoa-doctor-check/chuyen-khoa-da-day/benh-ly-da-day/` | Bệnh lý dạ dày | Specialty Service & Clinical Template | Page | High (P1) | Yes |
| 39 | `https://www.doctorcheck.vn/trung-tam-noi-soi-tieu-hoa-doctor-check/chuyen-khoa-da-day/noi-soi-da-day-chan-doan-benh-ly/` | Nội soi dạ dày chẩn đoán bệnh lý | Specialty Service & Clinical Template | Page | High (P1) | Yes |
| 40 | `https://www.doctorcheck.vn/trung-tam-noi-soi-tieu-hoa-doctor-check/chuyen-khoa-da-day/trieu-chung-da-day/` | Triệu chứng dạ dày | Specialty Service & Clinical Template | Page | High (P1) | Yes |
| 41 | `https://www.doctorcheck.vn/trung-tam-noi-soi-tieu-hoa-doctor-check/chuyen-khoa-dai-trang/` | Chuyên khoa đại tràng | Specialty Service & Clinical Template | Page | High (P1) | Yes |
| 42 | `https://www.doctorcheck.vn/trung-tam-noi-soi-tieu-hoa-doctor-check/chuyen-khoa-dai-trang/benh-ly-dai-trang/` | Bệnh lý đại tràng | Specialty Service & Clinical Template | Page | High (P1) | Yes |
| 43 | `https://www.doctorcheck.vn/trung-tam-noi-soi-tieu-hoa-doctor-check/chuyen-khoa-dai-trang/noi-soi-dai-trang-chan-doan-benh-ly/` | Nội soi đại tràng chẩn đoán bệnh lý | Specialty Service & Clinical Template | Page | High (P1) | Yes |
| 44 | `https://www.doctorcheck.vn/trung-tam-noi-soi-tieu-hoa-doctor-check/chuyen-khoa-dai-trang/trieu-chung-dai-trang/` | Triệu chứng đại tràng | Specialty Service & Clinical Template | Page | High (P1) | Yes |
| 45 | `https://www.doctorcheck.vn/trung-tam-noi-soi-tieu-hoa-doctor-check/quyen-loi-bhyt-bhtn/` | Quyền lợi BHYT & BHTN - Doctor Check | Specialty Service & Clinical Template | Page | High (P1) | Yes |
| 46 | `https://www.doctorcheck.vn/trung-tam-noi-soi-tieu-hoa-doctor-check/tam-soat-ung-thu-da-day-tai-doctor-check/` | Tầm soát ung thư dạ dày | Specialty Service & Clinical Template | Page | High (P1) | Yes |
| 47 | `https://www.doctorcheck.vn/trung-tam-noi-soi-tieu-hoa-doctor-check/tam-soat-ung-thu-da-day-tai-doctor-check/kien-thuc-ung-thu-da-day/` | Kiến thức ung thư dạ dày | Specialty Service & Clinical Template | Page | High (P1) | Yes |
| 48 | `https://www.doctorcheck.vn/trung-tam-noi-soi-tieu-hoa-doctor-check/tam-soat-ung-thu-da-day-tai-doctor-check/quy-trinh-noi-soi-da-day/` | Quy trình nội soi dạ dày | Specialty Service & Clinical Template | Page | High (P1) | Yes |
| 49 | `https://www.doctorcheck.vn/trung-tam-noi-soi-tieu-hoa-doctor-check/tam-soat-ung-thu-dai-trang-tai-doctor-check/` | Tầm soát ung thư đại tràng | Specialty Service & Clinical Template | Page | High (P1) | Yes |
| 50 | `https://www.doctorcheck.vn/trung-tam-noi-soi-tieu-hoa-doctor-check/tam-soat-ung-thu-dai-trang-tai-doctor-check/kien-thuc-ung-thu-dai-trang/` | Kiến thức ung thư đại tràng | Specialty Service & Clinical Template | Page | High (P1) | Yes |
| 51 | `https://www.doctorcheck.vn/trung-tam-noi-soi-tieu-hoa-doctor-check/tam-soat-ung-thu-dai-trang-tai-doctor-check/quy-trinh-noi-soi-dai-trang/` | Quy trình nội soi đại tràng | Specialty Service & Clinical Template | Page | High (P1) | Yes |
| 52 | `https://www.doctorcheck.vn/trung-tam-noi-soi-tieu-hoa-viet-nam-dat-chuan-aaci-cua-hoa-ky/` | Trung tâm nội soi tiêu hóa Việt Nam đạt chuẩn AACI của Hoa Kỳ | Specialty Service & Clinical Template | Article / Blog | High (P1) | Yes |
| 53 | `https://www.doctorcheck.vn/trung-tam-noi-soi-tieu-hoa/` | Trung Tâm Nội Soi Tiêu Hóa DoctorCheck | Specialty Service & Clinical Template | Page | High (P1) | Yes |
| 54 | `https://www.doctorcheck.vn/trung-tam-noi-soi-tieu-hoa/bang-gia-noi-soi-da-day/` | Bảng giá nội soi dạ dày | Specialty Service & Clinical Template | WordPress Page | High (P1) | Yes |
| 55 | `https://www.doctorcheck.vn/10-diem-khong-co-nhung-anh-trung-trai-nghiem-tam-soat-benh-chi-90-phut/` | 10 Điểm Không Có Nhưng, Anh Trung Trải Nghiệm Tầm Soát Bệnh Chỉ 90 Phút | Medical Knowledge & Article Single Template | Article / Blog | Medium (P2) | Yes (CMS / Dynamic) |
| 56 | `https://www.doctorcheck.vn/10-phuong-phap-giup-chung-ta-song-tho-hon/` | Nhận Diện Ngay 5 Dấu Hiệu Của Đột Quỵ Để Kịp Thời Ứng Phó | Medical Knowledge & Article Single Template | Article / Blog | Medium (P2) | Yes (CMS / Dynamic) |
| 57 | `https://www.doctorcheck.vn/12-loai-ung-thu-thuong-gap/` | Chuyên mục: 12 Loại Ung Thư Thường Gặp (22 bài viết) | Category & Knowledge Archive Template | Category Archive | Medium (P2) | Yes |
| 58 | `https://www.doctorcheck.vn/22-nhom-tam-soat-can-biet/` | Chuyên mục: 22 Nhóm Tầm Soát Cần Biết (22 bài viết) | Category & Knowledge Archive Template | Category Archive | Medium (P2) | Yes |
| 59 | `https://www.doctorcheck.vn/25-polyp-trong-dai-trang-dau-hieu-ung-thu-dai-truc-trang-giai-doan-dau-loi-ich-cua-viec-tam-soat-som/` | 25 Polyp Trong Đại Tràng – Dấu Hiệu Ung Thư Đại Trực Tràng Giai Đoạn Đầu – Lợi Ích Của Việc Tầm Soát Sớm | Medical Knowledge & Article Single Template | Article / Blog | Medium (P2) | Yes (CMS / Dynamic) |
| 60 | `https://www.doctorcheck.vn/5-trieu-chung-da-day-hay-gap/` | Chuyên mục: 5 triệu chứng dạ dày hay gặp (5 bài viết) | Category & Knowledge Archive Template | Category Archive | Medium (P2) | Yes |
| 61 | `https://www.doctorcheck.vn/5-trieu-chung-dai-trang-hay-gap/` | Chuyên mục: 5 triệu chứng đại tràng hay gặp (5 bài viết) | Category & Knowledge Archive Template | Category Archive | Medium (P2) | Yes |
| 62 | `https://www.doctorcheck.vn/7-benh-ly-da-day-hay-gap/` | Chuyên mục: 7 bệnh lý dạ dày hay gặp (7 bài viết) | Category & Knowledge Archive Template | Category Archive | Medium (P2) | Yes |
| 63 | `https://www.doctorcheck.vn/7-benh-ly-dai-trang-hay-gap/` | Chuyên mục: 7 bệnh lý đại tràng hay gặp (7 bài viết) | Category & Knowledge Archive Template | Category Archive | Medium (P2) | Yes |
| 64 | `https://www.doctorcheck.vn/7-thoi-quen-giup-ban-co-cuoc-song-tot-hon/` | 3 Nguyên Nhân Chính Dẫn Đến Viêm Gan B - Bạn Cần Biết Để Phòng Tránh! - Doctor Check | Medical Knowledge & Article Single Template | Article / Blog | Medium (P2) | Yes (CMS / Dynamic) |
| 65 | `https://www.doctorcheck.vn/an-nhanh-no/` | Ăn nhanh no | Medical Knowledge & Article Single Template | Article / Blog | Medium (P2) | Yes (CMS / Dynamic) |
| 66 | `https://www.doctorcheck.vn/bang-gia-dich-vu-tam-soat-benh-tai-doctor-check/` | Bảng Giá Dịch Vụ Tầm Soát Bệnh Tại Doctor Check | General Page Template | Page | Medium (P2) | Yes |
| 67 | `https://www.doctorcheck.vn/bang-gia-dich-vu/` | Bảng Giá Dịch Vụ | General Page Template | Page | Medium (P2) | Yes |
| 68 | `https://www.doctorcheck.vn/bang-gia-kham-suc-khoe-tong-quat/` | Bảng giá khám sức khỏe tổng quát | General Page Template | Page | Medium (P2) | Yes |
| 69 | `https://www.doctorcheck.vn/bang-gia-kham-tong-quat-new/` | Bảng giá khám tổng quát new | General Page Template | WordPress Page | Medium (P2) | Yes |
| 70 | `https://www.doctorcheck.vn/bang-gia-kham-tong-quat/` | Bảng giá khám tổng quát | General Page Template | WordPress Page | Medium (P2) | Yes |
| 71 | `https://www.doctorcheck.vn/bao-chi/` | Chuyên mục: Báo chí (14 bài viết) | Category & Knowledge Archive Template | Category Archive | Medium (P2) | Yes |
| 72 | `https://www.doctorcheck.vn/bao-chi/afamily/` | Chuyên mục: AFamily (1 bài viết) | Category & Knowledge Archive Template | Category Archive | Medium (P2) | Yes |
| 73 | `https://www.doctorcheck.vn/bao-chi/alobacsi/` | Chuyên mục: Alobacsi (1 bài viết) | Category & Knowledge Archive Template | Category Archive | Medium (P2) | Yes |
| 74 | `https://www.doctorcheck.vn/bao-chi/cafebiz/` | Chuyên mục: Cafebiz (2 bài viết) | Category & Knowledge Archive Template | Category Archive | Medium (P2) | Yes |
| 75 | `https://www.doctorcheck.vn/bao-chi/dan-tri/` | Chuyên mục: Dân trí (1 bài viết) | Category & Knowledge Archive Template | Category Archive | Medium (P2) | Yes |
| 76 | `https://www.doctorcheck.vn/bao-chi/doanh-nhan-sg/` | Chuyên mục: Doanh nhân SG (1 bài viết) | Category & Knowledge Archive Template | Category Archive | Medium (P2) | Yes |
| 77 | `https://www.doctorcheck.vn/bao-chi/sai-gon-giai-phong/` | Chuyên mục: Sài gòn giải phóng (1 bài viết) | Category & Knowledge Archive Template | Category Archive | Medium (P2) | Yes |
| 78 | `https://www.doctorcheck.vn/bao-chi/suc-khoe-doi-song/` | Chuyên mục: Sức khỏe đời sống (1 bài viết) | Category & Knowledge Archive Template | Category Archive | Medium (P2) | Yes |
| 79 | `https://www.doctorcheck.vn/bao-chi/thanh-nien/` | Chuyên mục: Thanh niên (1 bài viết) | Category & Knowledge Archive Template | Category Archive | Medium (P2) | Yes |
| 80 | `https://www.doctorcheck.vn/bao-chi/tien-phong/` | Chuyên mục: Tiền Phong (1 bài viết) | Category & Knowledge Archive Template | Category Archive | Medium (P2) | Yes |
| 81 | `https://www.doctorcheck.vn/bao-chi/tuoi-tre/` | Chuyên mục: Tuổi trẻ (1 bài viết) | Category & Knowledge Archive Template | Category Archive | Medium (P2) | Yes |
| 82 | `https://www.doctorcheck.vn/bao-chi/vlr/` | Chuyên mục: VLR (1 bài viết) | Category & Knowledge Archive Template | Category Archive | Medium (P2) | Yes |
| 83 | `https://www.doctorcheck.vn/bao-chi/vne/` | Chuyên mục: VNE (2 bài viết) | Category & Knowledge Archive Template | Category Archive | Medium (P2) | Yes |
| 84 | `https://www.doctorcheck.vn/benh-crohn/` | Bệnh Crohn | Medical Knowledge & Article Single Template | Article / Blog | Medium (P2) | Yes (CMS / Dynamic) |
| 85 | `https://www.doctorcheck.vn/benh-cum/` | Bệnh cúm | Medical Knowledge & Article Single Template | Article / Blog | Medium (P2) | Yes (CMS / Dynamic) |
| 86 | `https://www.doctorcheck.vn/benh-di-truyen/` | Bệnh Di Truyền | Medical Knowledge & Article Single Template | Article / Blog | Medium (P2) | Yes (CMS / Dynamic) |
| 87 | `https://www.doctorcheck.vn/benh-do-nhiem-ky-sinh-trung/` | Bệnh Do Nhiễm Ký Sinh Trùng | Medical Knowledge & Article Single Template | Article / Blog | Medium (P2) | Yes (CMS / Dynamic) |
| 88 | `https://www.doctorcheck.vn/benh-dot-quy/` | Bệnh đột quỵ | Medical Knowledge & Article Single Template | Article / Blog | Medium (P2) | Yes (CMS / Dynamic) |
| 89 | `https://www.doctorcheck.vn/benh-gut/` | Bệnh gút | Medical Knowledge & Article Single Template | Article / Blog | Medium (P2) | Yes (CMS / Dynamic) |
| 90 | `https://www.doctorcheck.vn/benh-lay-qua-duong-tinh-duc/` | Bệnh lây qua đường tình dục | Medical Knowledge & Article Single Template | Article / Blog | Medium (P2) | Yes (CMS / Dynamic) |
| 91 | `https://www.doctorcheck.vn/benh-phu-khoa/` | Bệnh phụ khoa | Medical Knowledge & Article Single Template | Article / Blog | Medium (P2) | Yes (CMS / Dynamic) |
| 92 | `https://www.doctorcheck.vn/benh-thuong-gap-sau-tam-soat/` | Chuyên mục: Bệnh thường gặp sau tầm soát (22 bài viết) | Category & Knowledge Archive Template | Category Archive | Medium (P2) | Yes |
| 93 | `https://www.doctorcheck.vn/benh-tieu-duong/` | Bệnh tiểu đường | Medical Knowledge & Article Single Template | Article / Blog | Medium (P2) | Yes (CMS / Dynamic) |
| 94 | `https://www.doctorcheck.vn/benh-ung-thu-da-day/` | Ung thư dạ dày | Medical Knowledge & Article Single Template | Article / Blog | Medium (P2) | Yes (CMS / Dynamic) |
| 95 | `https://www.doctorcheck.vn/benh-ve-tuyen-giap/` | Bệnh về tuyến giáp | Medical Knowledge & Article Single Template | Article / Blog | Medium (P2) | Yes (CMS / Dynamic) |
| 96 | `https://www.doctorcheck.vn/bi-quyet-song-tho/` | Chuyên mục: Bí quyết sống thọ (5 bài viết) | Category & Knowledge Archive Template | Category Archive | Medium (P2) | Yes |
| 97 | `https://www.doctorcheck.vn/bi-tieu-duong-26-nam-nen-chu-hong-anh-muon-kiem-tra-suc-khoe-dinh-ky/` | Bị Tiểu Đường 26 Năm Nên Chú Hồng Anh Muốn Kiểm Tra Sức Khỏe Định Kỳ | Medical Knowledge & Article Single Template | Article / Blog | Medium (P2) | Yes (CMS / Dynamic) |
| 98 | `https://www.doctorcheck.vn/blog/` | Blog | Medical Knowledge & Article Single Template | Article / Blog | Medium (P2) | Yes (CMS / Dynamic) |
| 99 | `https://www.doctorcheck.vn/buon-non-non-keo-dai/` | Buồn nôn, nôn kéo dài | General Page Template | WordPress Page | Medium (P2) | Yes |
| 100 | `https://www.doctorcheck.vn/buon-non-non/` | Buồn nôn, nôn | Medical Knowledge & Article Single Template | Article / Blog | Medium (P2) | Yes (CMS / Dynamic) |
| 101 | `https://www.doctorcheck.vn/cac-yeu-to-cua-mot-dia-chi-tam-soat-benh-trong-mo/` | Các yếu tố của một địa chỉ tầm soát bệnh trong mơ | General Page Template | Page | Medium (P2) | Yes |
| 102 | `https://www.doctorcheck.vn/cau-chuyen-khach-hang/` | Chuyên mục: Câu chuyện khách hàng (10 bài viết) | Category & Knowledge Archive Template | Category Archive | Medium (P2) | Yes |
| 103 | `https://www.doctorcheck.vn/chi-so-co-the/` | Chỉ Số Cơ Thể | Medical Knowledge & Article Single Template | Article / Blog | Medium (P2) | Yes (CMS / Dynamic) |
| 104 | `https://www.doctorcheck.vn/chinh-sach-quyen-rieng-tu/` | Chính sách quyền riêng tư | Legal & Policy Template | Page | Medium (P2) | Yes |
| 105 | `https://www.doctorcheck.vn/chuc-nang-gan/` | Chức năng gan | Medical Knowledge & Article Single Template | Article / Blog | Medium (P2) | Yes (CMS / Dynamic) |
| 106 | `https://www.doctorcheck.vn/chuc-nang-than/` | Chức năng thận | Medical Knowledge & Article Single Template | Article / Blog | Medium (P2) | Yes (CMS / Dynamic) |
| 107 | `https://www.doctorcheck.vn/chuong-bung-day-hoi/` | Chướng bụng, đầy hơi | Medical Knowledge & Article Single Template | Article / Blog | Medium (P2) | Yes (CMS / Dynamic) |
| 108 | `https://www.doctorcheck.vn/co-nguoi-nha-bi-ung-thu-dai-trang-co-lien-quyet-dinh-den-doctor-check-de-tam-soat-ung-thu/` | Có Người Nhà Bị Ung Thư Đại Tràng, Cô Liên Quyết Định Đến Doctor Check Để Tầm Soát Ung Thư | Medical Knowledge & Article Single Template | Article / Blog | Medium (P2) | Yes (CMS / Dynamic) |
| 109 | `https://www.doctorcheck.vn/dao-tao-chuyen-sau-tu-aaci-nen-tang-cho-dich-vu-noi-soi-chinh-xac-chuan-quoc-te/` | Đào Tạo Chuyên Sâu Từ AACI: Nền Tảng Cho Dịch Vụ Nội Soi Chính Xác - Chuẩn Quốc Tế - Doctor Check | Medical Knowledge & Article Single Template | Article / Blog | Medium (P2) | Yes (CMS / Dynamic) |
| 110 | `https://www.doctorcheck.vn/dau-bung-am-i/` | Đau bụng âm ỉ | Medical Knowledge & Article Single Template | Article / Blog | Medium (P2) | Yes (CMS / Dynamic) |
| 111 | `https://www.doctorcheck.vn/dau-thuong-vi/` | Đau thượng vị | Medical Knowledge & Article Single Template | Article / Blog | Medium (P2) | Yes (CMS / Dynamic) |
| 112 | `https://www.doctorcheck.vn/di-ngoai-ra-mau/` | Đi ngoài ra máu | Medical Knowledge & Article Single Template | Article / Blog | Medium (P2) | Yes (CMS / Dynamic) |
| 113 | `https://www.doctorcheck.vn/di-ung-thuong-gap/` | Dị ứng thường gặp | Medical Knowledge & Article Single Template | Article / Blog | Medium (P2) | Yes (CMS / Dynamic) |
| 114 | `https://www.doctorcheck.vn/dich-vu/` | Dịch vụ | General Page Template | Page | Medium (P2) | Yes |
| 115 | `https://www.doctorcheck.vn/dieu-tri-tao-bon-di-cau-ra-mau/` | Điều trị táo bón đi cầu ra máu | General Page Template | WordPress Page | Medium (P2) | Yes |
| 116 | `https://www.doctorcheck.vn/dinh-duong-song-tho/` | Dinh Dưỡng Sống Thọ | Medical Knowledge & Article Single Template | Article / Blog | Medium (P2) | Yes (CMS / Dynamic) |
| 117 | `https://www.doctorcheck.vn/doctor-check-dat-chung-nhan-lam-sang-xuat-sac-cho-dich-vu-noi-soi-dau-tien-tai-viet-nam/` | Doctor Check: Đạt “Chứng nhận Lâm sàng Xuất sắc cho Dịch vụ Nội soi” đầu tiên tại Việt Nam | Medical Knowledge & Article Single Template | Article / Blog | Medium (P2) | Yes (CMS / Dynamic) |
| 118 | `https://www.doctorcheck.vn/doctor-check-diem-den-noi-soi-da-day-tai-tphcm/` | Doctor Check - điểm đến nội soi dạ dày tại TPHCM - Doctor Check | Medical Knowledge & Article Single Template | Article / Blog | Medium (P2) | Yes (CMS / Dynamic) |
| 119 | `https://www.doctorcheck.vn/don-vi-dau-tien-tai-viet-nam-dat-chung-nhan-lam-sang-xuat-sac-trong-noi-soi-tu-aaci-hoa-ky/` | Đơn vị đầu tiên tại Việt Nam đạt chứng nhận lâm sàng xuất sắc trong nội soi từ AACI Hoa Kỳ | Medical Knowledge & Article Single Template | Article / Blog | Medium (P2) | Yes (CMS / Dynamic) |
| 120 | `https://www.doctorcheck.vn/gan-mot-thang-toi-an-khong-ngon-ngu-cung-khong-yen/` | Gần một tháng, tôi ăn không ngon, ngủ cũng không yên. | Medical Knowledge & Article Single Template | Article / Blog | Medium (P2) | Yes (CMS / Dynamic) |
| 121 | `https://www.doctorcheck.vn/giac-ngu-song-tho/` | Giấc Ngủ Sống Thọ | Medical Knowledge & Article Single Template | Article / Blog | Medium (P2) | Yes (CMS / Dynamic) |
| 122 | `https://www.doctorcheck.vn/hai-tuan-lien-cu-uong-ca-phe-la-toi-bi-tieu-chay-phai-roi-lop/` | &quot;Có hôm đứng lớp, tôi phải rời đi vệ sinh đến 3 lần&quot; - Doctor Check | Medical Knowledge & Article Single Template | Article / Blog | Medium (P2) | Yes (CMS / Dynamic) |
| 123 | `https://www.doctorcheck.vn/hanh-trinh-tieu-hoa-khoe/` | Chuyên mục: Hành Trình Tiêu Hóa Khỏe (3 bài viết) | Category & Knowledge Archive Template | Category Archive | Medium (P2) | Yes |
| 124 | `https://www.doctorcheck.vn/hanh-trinh-vuot-200km-de-tam-soat-benh-cung-gia-dinh-chi-van/` | Hành Trình Vượt 200km Để Tầm Soát Bệnh Cùng Gia Đình Chị Vân | Medical Knowledge & Article Single Template | Article / Blog | Medium (P2) | Yes (CMS / Dynamic) |
| 125 | `https://www.doctorcheck.vn/hien-thuc-hoa-loi-hua-khong-bo-sot-ung-thu-da-day-dai-trang-giai-doan-som-doctor-check-tro-thanh-trung-tam-noi-soi-tieu-hoa-dau-tien-tai-viet-nam-dat-chung-nhan-lam-sang/` | Hiện Thực Hóa Lời Hứa “Không Bỏ Sót Ung Thư Dạ Dày – Đại Tràng Giai Đoạn Sớm” - Doctor Check Trở Thành Trung Tâm Nội Soi Tiêu Hóa Đầu Tiên Tại Việt Nam Đạt Chứng Nhận Lâm Sàng Xuất Sắc Cho Dịch Vụ Nội Soi - Doctor Check | Medical Knowledge & Article Single Template | Article / Blog | Medium (P2) | Yes (CMS / Dynamic) |
| 126 | `https://www.doctorcheck.vn/hoi-chung-ruot-kich-thich/` | Hội chứng ruột kích thích | Medical Knowledge & Article Single Template | Article / Blog | Medium (P2) | Yes (CMS / Dynamic) |
| 127 | `https://www.doctorcheck.vn/kho-nuot-dau-bung-suot-2-tuan-thay-giao-39-tuoi-quyet-di-400-km-tim-nguyen-nhan/` | Khó nuốt, đau bụng suốt 2 tuần — thầy giáo 39 tuổi quyết đi 400 km tìm nguyên nhân | Medical Knowledge & Article Single Template | Article / Blog | Medium (P2) | Yes (CMS / Dynamic) |
| 128 | `https://www.doctorcheck.vn/kho-tieu-chuc-nang/` | Khó tiêu chức năng | Medical Knowledge & Article Single Template | Article / Blog | Medium (P2) | Yes (CMS / Dynamic) |
| 129 | `https://www.doctorcheck.vn/kho-tieu/` | Khó tiêu | Medical Knowledge & Article Single Template | Article / Blog | Medium (P2) | Yes (CMS / Dynamic) |
| 130 | `https://www.doctorcheck.vn/kiem-soat-can-nang-va-bmi/` | Kiểm Soát Cân Nặng Và BMI | Medical Knowledge & Article Single Template | Article / Blog | Medium (P2) | Yes (CMS / Dynamic) |
| 131 | `https://www.doctorcheck.vn/kiem-soat-hoi-tho-de-song-tho/` | Kiểm Soát Hơi Thở Để Sống Thọ | Medical Knowledge & Article Single Template | Article / Blog | Medium (P2) | Yes (CMS / Dynamic) |
| 132 | `https://www.doctorcheck.vn/kiem-soat-stress-nong-gian/` | Kiểm Soát Stress, Nóng Giận | Medical Knowledge & Article Single Template | Article / Blog | Medium (P2) | Yes (CMS / Dynamic) |
| 133 | `https://www.doctorcheck.vn/kien-thuc-song-tho/` | Chuyên mục: Kiến Thức Sống Thọ (6 bài viết) | Category & Knowledge Archive Template | Category Archive | Medium (P2) | Yes |
| 134 | `https://www.doctorcheck.vn/kien-thuc-ung-thu-da-day/` | Chuyên mục: Kiến thức ung thư dạ dày (3 bài viết) | Category & Knowledge Archive Template | Category Archive | Medium (P2) | Yes |
| 135 | `https://www.doctorcheck.vn/kien-thuc-ung-thu-dai-trang/` | Chuyên mục: Kiến thức ung thư đại tràng (4 bài viết) | Category & Knowledge Archive Template | Category Archive | Medium (P2) | Yes |
| 136 | `https://www.doctorcheck.vn/lam-the-nao-de-nhan-biet-dot-quy/` | 5 Dấu Hiệu Suy Thận Nhẹ Mà Bạn Cần Biết Sớm | Medical Knowledge & Article Single Template | Article / Blog | Medium (P2) | Yes (CMS / Dynamic) |
| 137 | `https://www.doctorcheck.vn/lam-the-nao-de-song-tho-duoc-nhu-nguoi-nhat/` | 5 Loại Trái Cây Dành Cho Người Tiểu Đường Bạn Nên Biết | Medical Knowledge & Article Single Template | Article / Blog | Medium (P2) | Yes (CMS / Dynamic) |
| 138 | `https://www.doctorcheck.vn/le-ky-ket-kiem-dinh-thuc-hanh-lam-sang-xuat-sac-cho-dich-vu-noi-soi-do-aaci-hoa-ky-cung-cap/` | Lễ ký kết kiểm định Lâm sàng Xuất sắc cho Dịch vụ Nội soi do AACI - Hoa Kỳ cung cấp - Doctor Check | Medical Knowledge & Article Single Template | Article / Blog | Medium (P2) | Yes (CMS / Dynamic) |
| 139 | `https://www.doctorcheck.vn/loang-xuong/` | Loãng xương | Medical Knowledge & Article Single Template | Article / Blog | Medium (P2) | Yes (CMS / Dynamic) |
| 140 | `https://www.doctorcheck.vn/loi-ich-goi-song-tho/` | Lợi ích gói sống thọ | General Page Template | WordPress Page | Medium (P2) | Yes |
| 141 | `https://www.doctorcheck.vn/loi-ich-khi-kham-tong-quat-tai-doctor-check/` | Lợi ích khi khám tổng quát tại Doctor Check | General Page Template | Page | Medium (P2) | Yes |
| 142 | `https://www.doctorcheck.vn/mat-tu-tin-vi-hoi-tho-co-mui-anh-khoa-quyet-dinh-di-kham-va-phat-hien-viem-da-day-sau-6-tuan-anh-lay-lai-su-tu-tin/` | Mất tự tin vì hơi thở có mùi, anh Khoa quyết định đi khám và phát hiện viêm dạ dày.<br> Sau 6 tuần anh lấy lại sự tự tin. | Medical Knowledge & Article Single Template | Article / Blog | Medium (P2) | Yes (CMS / Dynamic) |
| 143 | `https://www.doctorcheck.vn/mo-mau/` | Mỡ Máu | Medical Knowledge & Article Single Template | Article / Blog | Medium (P2) | Yes (CMS / Dynamic) |
| 144 | `https://www.doctorcheck.vn/moi-nguoi-tre-nen-co-mot-cuoc-song-healthy-chia-se-cua-anh-tam-sau-trai-nghiem-tam-soat-benh-tai-doctor-check/` | “Mọi Người Trẻ Nên Có Một Cuộc Sống Healthy” – Chia Sẻ Của Anh Tâm Sau Trải Nghiệm Tầm Soát Bệnh Tại Doctor Check | Medical Knowledge & Article Single Template | Article / Blog | Medium (P2) | Yes (CMS / Dynamic) |
| 145 | `https://www.doctorcheck.vn/nhiem-doc-chat/` | Nhiễm Độc Chất | Medical Knowledge & Article Single Template | Article / Blog | Medium (P2) | Yes (CMS / Dynamic) |
| 146 | `https://www.doctorcheck.vn/nhiem-khuan-h-pylori/` | Nhiễm khuẩn H. pylori | Medical Knowledge & Article Single Template | Article / Blog | Medium (P2) | Yes (CMS / Dynamic) |
| 147 | `https://www.doctorcheck.vn/o-da-day/` | Ở dạ dày | Medical Knowledge & Article Single Template | Article / Blog | Medium (P2) | Yes (CMS / Dynamic) |
| 148 | `https://www.doctorcheck.vn/o-hong-va-thanh-quan/` | Ở họng và thanh quản | Medical Knowledge & Article Single Template | Article / Blog | Medium (P2) | Yes (CMS / Dynamic) |
| 149 | `https://www.doctorcheck.vn/o-ta-trang/` | Ở tá tràng | Medical Knowledge & Article Single Template | Article / Blog | Medium (P2) | Yes (CMS / Dynamic) |
| 150 | `https://www.doctorcheck.vn/o-thuc-quan/` | Ở thực quản | Medical Knowledge & Article Single Template | Article / Blog | Medium (P2) | Yes (CMS / Dynamic) |
| 151 | `https://www.doctorcheck.vn/phat-hien-som-nguy-co-ung-thu-nho-noi-soi-tieu-hoa/` | Phát hiện sớm nguy cơ ung thư nhờ nội soi tiêu hóa | Medical Knowledge & Article Single Template | Article / Blog | Medium (P2) | Yes (CMS / Dynamic) |
| 152 | `https://www.doctorcheck.vn/phong-kham-da-khoa-dau-tien-tai-viet-nam-dat-chung-nhan-aaci-my/` | Phòng khám đa khoa đầu tiên tại Việt Nam đạt chứng nhận AACI Mỹ | Medical Knowledge & Article Single Template | Article / Blog | Medium (P2) | Yes (CMS / Dynamic) |
| 153 | `https://www.doctorcheck.vn/phong-kham-dau-tien-tai-viet-nam-dat-chung-nhan-noi-soi-xuat-sac-tu-hoa-ky-2/` | Phòng khám đầu tiên tại Việt Nam đạt chứng nhận nội soi xuất sắc từ Hoa Kỳ | Medical Knowledge & Article Single Template | Article / Blog | Medium (P2) | Yes (CMS / Dynamic) |
| 154 | `https://www.doctorcheck.vn/phong-kham-dau-tien-tai-viet-nam-dat-chung-nhan-noi-soi-xuat-sac-tu-hoa-ky-3/` | Phòng khám đầu tiên tại Việt Nam đạt chứng nhận nội soi xuất sắc từ Hoa Kỳ | Medical Knowledge & Article Single Template | Article / Blog | Medium (P2) | Yes (CMS / Dynamic) |
| 155 | `https://www.doctorcheck.vn/phong-kham-dau-tien-tai-viet-nam-dat-chung-nhan-noi-soi-xuat-sac-tu-hoa-ky/` | Phòng khám đầu tiên tại Việt Nam đạt chứng nhận nội soi xuất sắc từ Hoa Kỳ | Medical Knowledge & Article Single Template | Article / Blog | Medium (P2) | Yes (CMS / Dynamic) |
| 156 | `https://www.doctorcheck.vn/phong-kham-doctor-check-duoc-trao-chung-nhan-noi-soi-xuat-sac-tu-hoa-ky/` | Phòng khám Doctor Check được trao chứng nhận nội soi xuất sắc từ Hoa Kỳ | Medical Knowledge & Article Single Template | Article / Blog | Medium (P2) | Yes (CMS / Dynamic) |
| 157 | `https://www.doctorcheck.vn/polyp-dai-trang/` | Polyp đại tràng | Medical Knowledge & Article Single Template | Article / Blog | Medium (P2) | Yes (CMS / Dynamic) |
| 158 | `https://www.doctorcheck.vn/roi-loan-tieu-hoa/` | Rối loạn tiêu hoá | Medical Knowledge & Article Single Template | Article / Blog | Medium (P2) | Yes (CMS / Dynamic) |
| 159 | `https://www.doctorcheck.vn/som-mot-buoc-khoe-mot-doi-tap-1-anh-oi-me-bi-ung-thu-truc-trang-di-can-roi/` | [Sớm Một Bước-Khoẻ Một Đời] Tập 1: Anh Ơi, Mẹ Bị Ung Thư Trực Tràng Di Căn Rồi…. | Medical Knowledge & Article Single Template | Article / Blog | Medium (P2) | Yes (CMS / Dynamic) |
| 160 | `https://www.doctorcheck.vn/su-kien/` | Chuyên mục: Sự kiện (5 bài viết) | Category & Knowledge Archive Template | Category Archive | Medium (P2) | Yes |
| 161 | `https://www.doctorcheck.vn/suc-khoe-sa-sut-vi-cong-viec-chi-dieu-den-doctor-check-de-tam-soat-suc-khoe/` | Sức Khỏe Sa Sút Vì Công Việc, Chị Diệu Đến Doctor Check Để Tầm Soát Sức Khỏe | Medical Knowledge & Article Single Template | Article / Blog | Medium (P2) | Yes (CMS / Dynamic) |
| 162 | `https://www.doctorcheck.vn/suc-khoe-sa-sut-vi-cong-viec-chi-dieu-den-kham-tong-quat-de-kiem-tra-2/` | Sức Khỏe Sa Sút Vì Công Việc, Chị Diệu Đến Khám Tổng Quát Để Kiểm Tra | Medical Knowledge & Article Single Template | Article / Blog | Medium (P2) | Yes (CMS / Dynamic) |
| 163 | `https://www.doctorcheck.vn/suc-khoe-sa-sut-vi-cong-viec-chi-dieu-den-kham-tong-quat-de-kiem-tra-3/` | Sức Khỏe Sa Sút Vì Công Việc, Chị Diệu Đến Khám Tổng Quát Để Kiểm Tra | Medical Knowledge & Article Single Template | Article / Blog | Medium (P2) | Yes (CMS / Dynamic) |
| 164 | `https://www.doctorcheck.vn/suc-khoe-sa-sut-vi-cong-viec-chi-dieu-den-kham-tong-quat-de-kiem-tra-4/` | Sức Khỏe Sa Sút Vì Công Việc, Chị Diệu Đến Khám Tổng Quát Để Kiểm Tra | Medical Knowledge & Article Single Template | Article / Blog | Medium (P2) | Yes (CMS / Dynamic) |
| 165 | `https://www.doctorcheck.vn/suc-khoe-sa-sut-vi-cong-viec-chi-dieu-den-kham-tong-quat-de-kiem-tra-5/` | Sức Khỏe Sa Sút Vì Công Việc, Chị Diệu Đến Khám Tổng Quát Để Kiểm Tra | Medical Knowledge & Article Single Template | Article / Blog | Medium (P2) | Yes (CMS / Dynamic) |
| 166 | `https://www.doctorcheck.vn/suc-khoe-sa-sut-vi-cong-viec-chi-dieu-den-kham-tong-quat-de-kiem-tra-6/` | Sức Khỏe Sa Sút Vì Công Việc, Chị Diệu Đến Khám Tổng Quát Để Kiểm Tra | Medical Knowledge & Article Single Template | Article / Blog | Medium (P2) | Yes (CMS / Dynamic) |
| 167 | `https://www.doctorcheck.vn/suc-khoe-sa-sut-vi-cong-viec-chi-dieu-den-kham-tong-quat-de-kiem-tra-7/` | Sức Khỏe Sa Sút Vì Công Việc, Chị Diệu Đến Khám Tổng Quát Để Kiểm Tra | Medical Knowledge & Article Single Template | Article / Blog | Medium (P2) | Yes (CMS / Dynamic) |
| 168 | `https://www.doctorcheck.vn/suc-khoe-sa-sut-vi-cong-viec-chi-dieu-den-kham-tong-quat-de-kiem-tra-8/` | Sức Khỏe Sa Sút Vì Công Việc, Chị Diệu Đến Khám Tổng Quát Để Kiểm Tra | Medical Knowledge & Article Single Template | Article / Blog | Medium (P2) | Yes (CMS / Dynamic) |
| 169 | `https://www.doctorcheck.vn/suc-khoe-sa-sut-vi-cong-viec-chi-dieu-den-kham-tong-quat-de-kiem-tra/` | Sức Khỏe Sa Sút Vì Công Việc, Chị Diệu Đến Khám Tổng Quát Để Kiểm Tra | Medical Knowledge & Article Single Template | Article / Blog | Medium (P2) | Yes (CMS / Dynamic) |
| 170 | `https://www.doctorcheck.vn/suy-gian-tinh-mach-chan/` | Suy giãn tĩnh mạch chân | Medical Knowledge & Article Single Template | Article / Blog | Medium (P2) | Yes (CMS / Dynamic) |
| 171 | `https://www.doctorcheck.vn/tai-sao-benh-ly-da-day-khong-thuyen-giam-du-da-noi-soi-nhieu-lan/` | Tại sao bệnh lý dạ dày không thuyên giảm dù đã nội soi nhiều lần? | Medical Knowledge & Article Single Template | Article / Blog | Medium (P2) | Yes (CMS / Dynamic) |
| 172 | `https://www.doctorcheck.vn/tai-sao-phai-noi-soi-da-day-chinh-xac-thi-moi-dieu-tri-benh-ly-hieu-qua/` | Tại sao phải nội soi dạ dày chính xác thì mới điều trị bệnh lý hiệu quả | Medical Knowledge & Article Single Template | Article / Blog | Medium (P2) | Yes (CMS / Dynamic) |
| 173 | `https://www.doctorcheck.vn/tam-soat-benh-giup-giam-ganh-nang-kinh-te-cho-con-cai-chia-se-cua-vo-chong-chu-hung/` | Tầm Soát Bệnh Giúp Giảm Gánh Nặng Kinh Tế Cho Con Cái – Chia Sẻ Của Vợ Chồng Chú Hùng | Medical Knowledge & Article Single Template | Article / Blog | Medium (P2) | Yes (CMS / Dynamic) |
| 174 | `https://www.doctorcheck.vn/tao-bon-keo-dai/` | Táo bón kéo dài | Medical Knowledge & Article Single Template | Article / Blog | Medium (P2) | Yes (CMS / Dynamic) |
| 175 | `https://www.doctorcheck.vn/tao-bon/` | Táo bón | Medical Knowledge & Article Single Template | Article / Blog | Medium (P2) | Yes (CMS / Dynamic) |
| 176 | `https://www.doctorcheck.vn/tham-dinh-chinh-thuc-doctor-check-xac-lap-chuan-muc-moi-trong-noi-soi-dat-chuan-quoc-te-tu-hoa-ky/` | Thẩm Định Chính Thức – Doctor Check xác lập chuẩn mực mới trong nội soi đạt chuẩn quốc tế từ Hoa Kỳ | Medical Knowledge & Article Single Template | Article / Blog | Medium (P2) | Yes (CMS / Dynamic) |
| 177 | `https://www.doctorcheck.vn/thieu-mau-do-thieu-sat/` | Thiếu Máu Do Thiếu Sắt | Medical Knowledge & Article Single Template | Article / Blog | Medium (P2) | Yes (CMS / Dynamic) |
| 178 | `https://www.doctorcheck.vn/thuoc-va-vat-tu-y-te/` | Thuốc và Vật tư y tế | General Page Template | Page | Medium (P2) | Yes |
| 179 | `https://www.doctorcheck.vn/tieu-chay-2/` | Tiêu chảy | Medical Knowledge & Article Single Template | Article / Blog | Medium (P2) | Yes (CMS / Dynamic) |
| 180 | `https://www.doctorcheck.vn/tieu-chay/` | Tiêu chảy | Medical Knowledge & Article Single Template | Article / Blog | Medium (P2) | Yes (CMS / Dynamic) |
| 181 | `https://www.doctorcheck.vn/tieu-phan-nhay-nhot/` | Tiêu phân nhầy nhớt | Medical Knowledge & Article Single Template | Article / Blog | Medium (P2) | Yes (CMS / Dynamic) |
| 182 | `https://www.doctorcheck.vn/ton-thuong-va-benh-ly/` | Chuyên mục: Tổn thương và Bệnh lý (4 bài viết) | Category & Knowledge Archive Template | Category Archive | Medium (P2) | Yes |
| 183 | `https://www.doctorcheck.vn/trao-nguoc-da-day-thuc-quan/` | Trào ngược dạ dày - thực quản - Doctor Check | Medical Knowledge & Article Single Template | Article / Blog | Medium (P2) | Yes (CMS / Dynamic) |
| 184 | `https://www.doctorcheck.vn/truyen-thong/` | Chuyên mục: Truyền thông (8 bài viết) | Category & Knowledge Archive Template | Category Archive | Medium (P2) | Yes |
| 185 | `https://www.doctorcheck.vn/tu-kiem-dinh-quoc-te-den-thuc-hanh-hang-ngay-trien-khai-aaci-trong-mo-hinh-phong-kham-tai-doctor-check/` | TỪ KIỂM ĐỊNH QUỐC TẾ ĐẾN THỰC HÀNH HÀNG NGÀY: TRIỂN KHAI AACI TRONG MÔ HÌNH PHÒNG KHÁM TẠI DOCTOR CHECK | Medical Knowledge & Article Single Template | Article / Blog | Medium (P2) | Yes (CMS / Dynamic) |
| 186 | `https://www.doctorcheck.vn/tuoi-sinh-hoc/` | Tuổi Sinh Học | Medical Knowledge & Article Single Template | Article / Blog | Medium (P2) | Yes (CMS / Dynamic) |
| 187 | `https://www.doctorcheck.vn/tuoi-tho-trung-binh-cua-nguoi-viet-la-bao-nhieu/` | Bật Mí 5 Món Ăn Thần Kỳ Giúp Người Nhật Tăng Tuổi Thọ | Medical Knowledge & Article Single Template | Article / Blog | Medium (P2) | Yes (CMS / Dynamic) |
| 188 | `https://www.doctorcheck.vn/uncategorized/` | Chuyên mục: Uncategorized (0 bài viết) | Category & Knowledge Archive Template | Category Archive | Medium (P2) | Yes |
| 189 | `https://www.doctorcheck.vn/ung-thu-da-day/` | Ung thư dạ dày | Medical Knowledge & Article Single Template | Article / Blog | Medium (P2) | Yes (CMS / Dynamic) |
| 190 | `https://www.doctorcheck.vn/ung-thu-dai-trang/` | Ung thư đại tràng | Medical Knowledge & Article Single Template | Article / Blog | Medium (P2) | Yes (CMS / Dynamic) |
| 191 | `https://www.doctorcheck.vn/ung-thu-dai-truc-trang/` | Ung thư đại trực tràng | Medical Knowledge & Article Single Template | Article / Blog | Medium (P2) | Yes (CMS / Dynamic) |
| 192 | `https://www.doctorcheck.vn/ung-thu-hau-mon/` | Ung thư hậu môn | Medical Knowledge & Article Single Template | Article / Blog | Medium (P2) | Yes (CMS / Dynamic) |
| 193 | `https://www.doctorcheck.vn/ung-thu-ta-trang/` | Ung thư tá tràng | Medical Knowledge & Article Single Template | Article / Blog | Medium (P2) | Yes (CMS / Dynamic) |
| 194 | `https://www.doctorcheck.vn/ung-thu-thuc-quan-2/` | Ung thư thực quản | Medical Knowledge & Article Single Template | Article / Blog | Medium (P2) | Yes (CMS / Dynamic) |
| 195 | `https://www.doctorcheck.vn/ung-thu-thuc-quan/` | Ung thư thực quản | Medical Knowledge & Article Single Template | Article / Blog | Medium (P2) | Yes (CMS / Dynamic) |
| 196 | `https://www.doctorcheck.vn/ung-thu-truc-trang/` | Ung thư trực tràng | Medical Knowledge & Article Single Template | Article / Blog | Medium (P2) | Yes (CMS / Dynamic) |
| 197 | `https://www.doctorcheck.vn/van-dong-song-tho/` | Vận Động Sống Thọ | Medical Knowledge & Article Single Template | Article / Blog | Medium (P2) | Yes (CMS / Dynamic) |
| 198 | `https://www.doctorcheck.vn/ve-chung-toi/` | Về chúng tôi | About & Accreditation Template | Page | Medium (P2) | Yes |
| 199 | `https://www.doctorcheck.vn/ve-doctor-check/` | Về Doctor Check | About & Accreditation Template | Page | Medium (P2) | Yes |
| 200 | `https://www.doctorcheck.vn/vi-chat-dinh-duong/` | Vi Chất Dinh Dưỡng | Medical Knowledge & Article Single Template | Article / Blog | Medium (P2) | Yes (CMS / Dynamic) |
| 201 | `https://www.doctorcheck.vn/viem-dai-trang/` | Viêm đại tràng | Medical Knowledge & Article Single Template | Article / Blog | Medium (P2) | Yes (CMS / Dynamic) |
| 202 | `https://www.doctorcheck.vn/viem-gan-vi-rut/` | Viêm gan vi rút | Medical Knowledge & Article Single Template | Article / Blog | Medium (P2) | Yes (CMS / Dynamic) |
| 203 | `https://www.doctorcheck.vn/viem-loet-da-day-ta-trang/` | Viêm loét dạ dày - tá tràng - Doctor Check | Medical Knowledge & Article Single Template | Article / Blog | Medium (P2) | Yes (CMS / Dynamic) |
| 204 | `https://www.doctorcheck.vn/viem-thuc-quan/` | Viêm thực quản | Medical Knowledge & Article Single Template | Article / Blog | Medium (P2) | Yes (CMS / Dynamic) |
| 205 | `https://www.doctorcheck.vn/xet-nghiem-cong-thuc-mau/` | Xét nghiệm công thức máu | Medical Knowledge & Article Single Template | Article / Blog | Medium (P2) | Yes (CMS / Dynamic) |

---

### Section B: Internal Flatsome UX Blocks (206 to 226 - NOT Public Routes)

| # | URL | Block Description | Target React Component | Action |
| :--- | :--- | :--- | :--- | :--- |
| 206 | `https://www.doctorcheck.vn/blocks/404-block/` | Flatsome Reusable Block: `404-block` | `src/components/sites/doctorcheck-vn/root/404-block.tsx` | **Convert to Component (No Route)** |
| 207 | `https://www.doctorcheck.vn/blocks/blog-banner-cta/` | Flatsome Reusable Block: `blog-banner-cta` | `src/components/sites/doctorcheck-vn/root/blog-banner-cta.tsx` | **Convert to Component (No Route)** |
| 208 | `https://www.doctorcheck.vn/blocks/blog-cta-mobile/` | Flatsome Reusable Block: `blog-cta-mobile` | `src/components/sites/doctorcheck-vn/root/blog-cta-mobile.tsx` | **Convert to Component (No Route)** |
| 209 | `https://www.doctorcheck.vn/blocks/blog-cta/` | Flatsome Reusable Block: `blog-cta` | `src/components/sites/doctorcheck-vn/root/blog-cta.tsx` | **Convert to Component (No Route)** |
| 210 | `https://www.doctorcheck.vn/blocks/blog-single-cta-mobile/` | Flatsome Reusable Block: `blog-single-cta-mobile` | `src/components/sites/doctorcheck-vn/root/blog-single-cta-mobile.tsx` | **Convert to Component (No Route)** |
| 211 | `https://www.doctorcheck.vn/blocks/cau-chuyen-khach-hang/` | Flatsome Reusable Block: `cau-chuyen-khach-hang` | `src/components/sites/doctorcheck-vn/root/cau-chuyen-khach-hang.tsx` | **Convert to Component (No Route)** |
| 212 | `https://www.doctorcheck.vn/blocks/doctor-cta-mobile/` | Flatsome Reusable Block: `doctor-cta-mobile` | `src/components/sites/doctorcheck-vn/root/doctor-cta-mobile.tsx` | **Convert to Component (No Route)** |
| 213 | `https://www.doctorcheck.vn/blocks/doctor-cta/` | Flatsome Reusable Block: `doctor-cta` | `src/components/sites/doctorcheck-vn/root/doctor-cta.tsx` | **Convert to Component (No Route)** |
| 214 | `https://www.doctorcheck.vn/blocks/doi-ngu-bac-si/` | Flatsome Reusable Block: `doi-ngu-bac-si` | `src/components/sites/doctorcheck-vn/root/doi-ngu-bac-si.tsx` | **Convert to Component (No Route)** |
| 215 | `https://www.doctorcheck.vn/blocks/facilities/` | Flatsome Reusable Block: `facilities` | `src/components/sites/doctorcheck-vn/root/facilities.tsx` | **Convert to Component (No Route)** |
| 216 | `https://www.doctorcheck.vn/blocks/footer-banner-cta/` | Flatsome Reusable Block: `footer-banner-cta` | `src/components/sites/doctorcheck-vn/root/footer-banner-cta.tsx` | **Convert to Component (No Route)** |
| 217 | `https://www.doctorcheck.vn/blocks/footer-custom-for-ldp/` | Flatsome Reusable Block: `footer-custom-for-ldp` | `src/components/sites/doctorcheck-vn/root/footer-custom-for-ldp.tsx` | **Convert to Component (No Route)** |
| 218 | `https://www.doctorcheck.vn/blocks/footer-kdn/` | Flatsome Reusable Block: `footer-kdn` | `src/components/sites/doctorcheck-vn/root/footer-kdn.tsx` | **Convert to Component (No Route)** |
| 219 | `https://www.doctorcheck.vn/blocks/footer-ldp/` | Flatsome Reusable Block: `footer-ldp` | `src/components/sites/doctorcheck-vn/root/footer-ldp.tsx` | **Convert to Component (No Route)** |
| 220 | `https://www.doctorcheck.vn/blocks/footer/` | Flatsome Reusable Block: `footer` | `src/components/sites/doctorcheck-vn/root/footer.tsx` | **Convert to Component (No Route)** |
| 221 | `https://www.doctorcheck.vn/blocks/form/` | Flatsome Reusable Block: `form` | `src/components/sites/doctorcheck-vn/root/form.tsx` | **Convert to Component (No Route)** |
| 222 | `https://www.doctorcheck.vn/blocks/header-nsdd/` | Flatsome Reusable Block: `header-nsdd` | `src/components/sites/doctorcheck-vn/root/header-nsdd.tsx` | **Convert to Component (No Route)** |
| 223 | `https://www.doctorcheck.vn/blocks/hinh-thuc-thanh-toan/` | Flatsome Reusable Block: `hinh-thuc-thanh-toan` | `src/components/sites/doctorcheck-vn/root/hinh-thuc-thanh-toan.tsx` | **Convert to Component (No Route)** |
| 224 | `https://www.doctorcheck.vn/blocks/pricing-archive/` | Flatsome Reusable Block: `pricing-archive` | `src/components/sites/doctorcheck-vn/root/pricing-archive.tsx` | **Convert to Component (No Route)** |
| 225 | `https://www.doctorcheck.vn/blocks/quy-trinh/` | Flatsome Reusable Block: `quy-trinh` | `src/components/sites/doctorcheck-vn/root/quy-trinh.tsx` | **Convert to Component (No Route)** |
| 226 | `https://www.doctorcheck.vn/blocks/ttns-aaci/` | Flatsome Reusable Block: `ttns-aaci` | `src/components/sites/doctorcheck-vn/root/ttns-aaci.tsx` | **Convert to Component (No Route)** |
