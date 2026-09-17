# Homepage Topology Verification: DoctorCheck.vn

Audit of [docs/research/doctorcheck-vn/root/PAGE_TOPOLOGY.md](file:///d:/LandingPages/doctorcheck-nextjs/docs/research/doctorcheck-vn/root/PAGE_TOPOLOGY.md) against the live rendered DOM of `https://doctorcheck.vn/`.

Every section and assertion is classified as one of:
- **`CONFIRMED`**: Direct, unambiguous match found in live HTML source code, attributes, or text content.
- **`INFERRED`**: Logical deduction based on partial code evidence, plugin defaults, external scripts, or standard clinic UI patterns, but not an explicit standalone DOM block.
- **`UNKNOWN`**: Cannot be verified from public HTML or public REST API alone without authenticated access or real-time event capture.

---

## Verification Table

| # | Section Name in Topology | Status | Evidence in Live HTML / REST API | Verification Notes |
|---|---|---|---|---|
| 1 | **Top Utility Announcement Bar** | **`INFERRED`** | Phone `0939 010 101` and operating hours `07:30 - 17:00` are present in Schema.org JSON-LD and Footer. No dedicated `<div class="top-bar">` exists in desktop Flatsome markup. | In Flatsome desktop, the main header directly contains logo, nav, and search. Top bar was inferred as a desktop utility bar. For 1:1 fidelity, this can be integrated into the header or top banner. |
| 2 | **Main Navigation Header** | **`CONFIRMED`** | `<header class="header has-sticky sticky-jump">`, `<div class="header-main has-sticky-logo">`, `<div class="header-search-form-wrapper">`, logo image `w=399,h=396`. | Sticky header behavior with class toggling on scroll is directly confirmed. |
| 3 | **Hero Section** | **`CONFIRMED`** | `<h1>Tầm Soát Bệnh &#8211; Một Khởi Đầu Thông Thái Cho Năm Mới</h1>`, banner `HB1-Mobile.webp`, slider `slider-style-focus`. | Exact text, heading level, and banner imagery verified in live HTML. |
| 4 | **4 Patient Concerns Section ("Gỡ Bỏ 4 Nỗi Lo")** | **`CONFIRMED`** | `<h2>Gỡ Bỏ 4 &#8220;Nỗi Lo&#8221; Khiến Bạn Chần Chừ Trước Khi Quyết Định Đi Tầm Soát Bệnh</h2>`, `<div class="section_556189682">`. | Exact heading and 4 card structure confirmed. |
| 5 | **Video Testimonials Carousel** | **`CONFIRMED`** | `<h2>Mời bạn lắng nghe những chia sẻ từ những khách hàng đã trải nghiệm</h2>`, `<h2>Kiểm Chứng Ngay Qua Những Chia Sẻ Từ Khách Hàng</h2>`, YouTube video IDs (`A4BCCgKqwVI`, `80iE-7mnZGM`, `BpDdHblLz98`). | Video IDs and testimonials confirmed in HTML and Schema.org VideoObject. |
| 6 | **5 Golden Rights ("5 Quyền Lợi Vàng")** | **`CONFIRMED`** | `<h2>5 quyền lợi bạn nhận được khi tầm soát bệnh tại Doctor Check:</h2>`, 5 numbered H3 items (Chuyên sâu, Y học chứng cứ, 60-90 phút, Bác sĩ hàng đầu, Sống thọ 85 tuổi). | 100% exact match in live HTML headings hierarchy. |
| 7 | **Doctor Team Showcase** | **`CONFIRMED`** | `<h2>Đội ngũ bác sĩ giàu kinh nghiệm, đến từ các bệnh viện lớn tại TP.HCM</h2>`, custom stylesheet `doctor-boxes.css`, `<div class="row row-collapse doctor-slide">`, 7 doctor CPT profiles. | Confirmed via both live HTML and `/wp-json/wp/v2/doctor` endpoint. |
| 8 | **Facilities & Medical Equipment** | **`CONFIRMED`** | `<h2>Khám Phá Sức Mạnh Từ Trang Thiết Bị Máy Móc Hiện Đại Tại Doctor Check</h2>`, H3 tags for Olympus EVIS-X1, Abbott, Siemens, Vikomed, Fukuda, Fisher FanHp. | Exact items confirmed in live HTML and Schema.org ItemList. |
| 9 | **Pricing & Packages Matrix** | **`CONFIRMED`** | `<h2>Bảng Giá Các Gói Khám Tổng Quát tại Doctor Check</h2>`, tab filters for Nam / Nữ, 3 package tiers (Khuyến Cáo: 3M, Chuyên Sâu: 5M, Sống Thọ: 11.5M). | Confirmed via live HTML and Schema.org OfferCatalog. |
| 10 | **Cancer Screening Guidance** | **`CONFIRMED`** | `<h2>Thế giới khuyến cáo tầm soát ung thư định kỳ</h2>`, H3s for thực quản - dạ dày - tá tràng and đại tràng - trực tràng. | Exact headings and layout confirmed in live HTML. |
| 11 | **Customer Stories & Social Proof** | **`CONFIRMED`** | `<h2>Hơn 10.000+ Khách hàng đã trải nghiệm hài lòng</h2>`, H3 stories of Cô Liên, Chú Hồng Anh. | Exact testimonials confirmed in live HTML. |
| 12 | **FAQ Accordion** | **`CONFIRMED`** | `<h2>Câu hỏi thường gặp</h2>`, 4 accordion questions matching Schema.org FAQPage. | Verified in live HTML and Schema.org. |
| 13 | **Consultation & Booking Form** | **`CONFIRMED`** | `<h2>Đăng ký tư vấn</h2>`, `<form class="wpcf7-form">` with fields `customer_name`, `customer_phone`, `services-list`, `date-booking`, UTM parameters. | Exact form fields confirmed from live CF7 form structure. |
| 14 | **Comprehensive Footer** | **`CONFIRMED`** | `<h2>Doctor Check Tầm Soát Bệnh Để Sống Thọ Hơn</h2>`, address (429 Tô Hiến Thành), hotline, Sở Y Tế license, category links. | Confirmed in live HTML. |
| 15 | **Floating Quick Actions** | **`INFERRED` / `DETECTED`** | `<a class="back-to-top button icon invert plain fixed bottom z-1 ...">` is **CONFIRMED** in HTML. Floating Zalo & Hotline call buttons are injected via third-party scripts (Zalo SDK, Admicro) and mobile bottom bar `kdn.css`. | Back-to-top button is directly confirmed in DOM. Persistent Zalo and Phone floating buttons on desktop are third-party widget scripts, not static theme markup. |

---

## Summary of Verification
- **Confirmed Sections:** 13 of 15 sections directly verified in live HTML and Schema.org graph.
- **Inferred Sections:** 2 items (Top announcement bar structure and desktop floating Zalo button origin).
- **Unknown Items:** Exact CRM webhook receiver for Contact Form 7 submissions (hidden behind server-side WP mailer / API).
