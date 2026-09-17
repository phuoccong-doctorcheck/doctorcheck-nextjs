# DOCTORCHECK HTML SOURCE MAP
## Comprehensive DOM & Structural Blueprint of DoctorCheck.vn Homepage

> **Source Artifact:** `doctorcheck-source/html/homepage.html` (325,529 bytes)  
> **Source Platform:** WordPress 6.x + Flatsome 3.19.x Theme + DoctorCheck Child Theme  
> **Analysis Date:** March 2026  
> **Integrity Mode:** Strictly read-only analysis of local snapshot. No production crawling.

---

## 1. Top-Level Document Structure

```html
<!DOCTYPE html>
<html lang="vi" prefix="og: https://ogp.me/ns#">
<head>
  <!-- Charset, Viewport, Titles, OpenGraph, Stylesheets, Inline CSS -->
</head>
<body class="home wp-singular page-template page-template-page-blank page-template-page-blank-php page page-id-25 wp-theme-flatsome wp-child-theme-doctorcheck theme-flatsome lightbox nav-dropdown-has-arrow nav-dropdown-has-shadow nav-dropdown-has-border">
  <div id="wrapper">
    <header id="header" class="header has-sticky sticky-jump">...</header>
    <main id="main" class="">
      <div id="content" role="main" class="content-area">
        <!-- 11 Content Sections -->
      </div>
    </main>
    <footer id="footer" class="footer-wrapper">
      <!-- 2 Footer Sections -->
    </footer>
  </div>
  <!-- Off-canvas Mobile Drawer #main-menu -->
</body>
</html>
```

### Key `<head>` Configurations:
- **Viewport:** `width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no`
- **Canonical URL:** `https://www.doctorcheck.vn/`
- **Linked Stylesheets:** 18 distinct CSS bundles loaded via `<link rel="stylesheet">`
- **Inline `<style>` Blocks:** 88 blocks totaling 36,341 characters of scoped component styles

---

## 2. Header Blueprint (`#header`)

```html
<header id="header" class="header has-sticky sticky-jump" style="height: 90px;">
  <div class="header-wrapper">
    <div id="masthead" class="header-main has-sticky-logo">
      <div class="header-inner flex-row container logo-left medium-logo-left" role="navigation">
        
        <!-- Logo Column -->
        <div id="logo" class="flex-col logo">
          <a href="https://www.doctorcheck.vn/" title="Doctor Check - Tầm Soát Bệnh Để Sống Thọ Hơn" rel="home">
            <!-- Normal Sticky Logo (White on Teal) -->
            <img width="399" height="396" src="https://imagedelivery.net/VX_wpsBa_s5hNlg6_mgdXg/9c47f8ce-3635-4598-2d0e-6c7e9a9ab200/w=399,h=396" class="header-logo-sticky" alt="Doctor Check">
            <!-- Normal Default Logo (Color on White) -->
            <img width="281" height="281" src="https://imagedelivery.net/VX_wpsBa_s5hNlg6_mgdXg/700da2d8-a2da-4897-3616-647bc8083d00/w=281,h=281,fit=crop" class="header_logo header-logo" alt="Doctor Check">
            <!-- Dark Variant Logo -->
            <img width="399" height="396" src="https://imagedelivery.net/VX_wpsBa_s5hNlg6_mgdXg/9c47f8ce-3635-4598-2d0e-6c7e9a9ab200/w=399,h=396" class="header-logo-dark" alt="Doctor Check">
          </a>
        </div>

        <!-- Desktop Navigation Column -->
        <div class="flex-col hide-for-medium flex-left flex-grow">
          <ul class="header-nav header-nav-main nav nav-left nav-size-medium nav-spacing-small">
            <li id="menu-item-1501" class="menu-item menu-item-type-post_type menu-item-object-page menu-item-has-children has-dropdown">
              <a href="https://www.doctorcheck.vn/ve-chung-toi/" class="nav-top-link">Về<br> Doctor Check<i class="icon-angle-down"></i></a>
              <ul class="sub-menu nav-dropdown nav-dropdown-default">...</ul>
            </li>
            <li id="menu-item-1522" class="menu-item menu-item-type-post_type menu-item-object-page menu-item-has-children has-dropdown">
              <a href="https://www.doctorcheck.vn/goi-tam-soat-nu" class="nav-top-link">Tầm Soát Bệnh <br> Nữ<i class="icon-angle-down"></i></a>
              <ul class="sub-menu nav-dropdown nav-dropdown-default">...</ul>
            </li>
            <li id="menu-item-1521" class="menu-item menu-item-type-post_type menu-item-object-page menu-item-has-children has-dropdown">
              <a href="https://www.doctorcheck.vn/goi-tam-soat-nam" class="nav-top-link">Tầm Soát Bệnh <br> Nam<i class="icon-angle-down"></i></a>
              <ul class="sub-menu nav-dropdown nav-dropdown-default">...</ul>
            </li>
            <li id="menu-item-1846" class="menu-item menu-item-type-custom menu-item-object-custom menu-item-has-children has-dropdown">
              <a class="nav-top-link">6 Thói Quen<br> Sống Thọ<i class="icon-angle-down"></i></a>
              <ul class="sub-menu nav-dropdown nav-dropdown-default">...</ul>
            </li>
            <li id="menu-item-1651" class="label-vip premium menu-item menu-item-type-post_type menu-item-object-page menu-item-has-children has-dropdown">
              <a href="https://www.doctorcheck.vn/trung-tam-noi-soi-tieu-hoa-doctor-check/" class="nav-top-link">Trung Tâm <br>Nội Soi Tiêu Hóa<i class="icon-angle-down"></i></a>
              <ul class="sub-menu nav-dropdown nav-dropdown-default">...</ul>
            </li>
            <li id="menu-item-5685" class="label-minh-bach dc-hide menu-item menu-item-type-custom menu-item-object-custom menu-item-has-children has-dropdown">
              <a href="https://khamdoanhnghiep.doctorcheck.vn/" class="nav-top-link">Khám Sức Khỏe <br>Doanh Nghiệp<i class="icon-angle-down"></i></a>
              <ul class="sub-menu nav-dropdown nav-dropdown-default">...</ul>
            </li>
          </ul>
        </div>

        <!-- Desktop Right Elements (Search Toggle) -->
        <div class="flex-col hide-for-medium flex-right">
          <ul class="header-nav header-nav-main nav nav-right nav-size-medium nav-spacing-small">
            <li class="header-search header-search-dropdown has-icon has-dropdown menu-item-has-children">
              <a href="#" aria-label="Tìm kiếm" class="is-small"><i class="icon-search"></i></a>
              <ul class="nav-dropdown nav-dropdown-default">
                <li class="header-search-form search-form html relative has-icon">
                  <div class="header-search-form-wrapper">
                    <div class="searchform-wrapper ux-search-box relative is-normal">
                      <form role="search" method="get" class="searchform" action="https://www.doctorcheck.vn/">
                        <input type="search" class="search-field mb-0" name="s" value="" id="s" placeholder="Tìm kiếm" autocomplete="off">
                        <button type="submit" title="Gửi" aria-label="Gửi" class="ux-search-submit submit-button secondary button icon mb-0"><i class="icon-search"></i></button>
                      </form>
                    </div>
                  </div>
                </li>
              </ul>
            </li>
          </ul>
        </div>

        <!-- Mobile Right Elements (Hamburger) -->
        <div class="flex-col show-for-medium flex-right">
          <ul class="mobile-nav nav nav-right">
            <li class="nav-icon has-icon">
              <a href="#" data-open="#main-menu" data-pos="right" data-bg="main-menu-overlay" data-color="" class="is-small" aria-label="Menu" aria-controls="main-menu" aria-expanded="false">
                <i class="icon-menu"></i>
              </a>
            </li>
          </ul>
        </div>

      </div>
    </div>
    <div class="header-bg-container fill"><div class="header-bg-image fill"></div><div class="header-bg-color fill"></div></div>
  </div>
</header>
```

---

## 3. Main Content Sections Inventory

| # | Section ID | Root Classes | Screenshot Reference | Semantic Purpose |
|---|------------|--------------|----------------------|------------------|
| 1 | `section_380136169` | `section section-banner` | `desktop-homepage-02-hero.png` | Above-the-fold Hero banner linking to `#tu-van` |
| 2A | `section_294013533` | `section section-confuse` (Rows 1-2) | `desktop-homepage-03-confuse.png` | Four Patient Concerns (01, 02, 03, 04) |
| 2B | `section_294013533` | `section section-confuse` (Rows 3-12) | `desktop-homepage-04-video.png` | Customer Video Testimonials (YouTube Shorts Carousel) |
| 3 | `section_1967412634` | `section section-advanced` | `desktop-homepage-05-advanced.png` | 5 Clinical Advantages & Medical Accordion |
| 4 | `section_1563108974` | `section section-doctor` | `desktop-homepage-06-doctor.png` | 7 Specialist Physicians Carousel |
| 5 | `section_818310656` | `section section-facilities` | `desktop-homepage-07-facilities.png` | Modern Diagnostic Equipment Photographic Grid |
| 6 | `section_1936328654` | `section section-service circle-blur` | `desktop-homepage-08-service.png` | Comprehensive Screening Pricing Matrix (Nam/Nữ) |
| 7 | `section_991765975` | `section section-suggest dark` | `desktop-homepage-09-suggest.png` | Periodic Cancer Screening Clinical Advice (Dark theme) |
| 8 | `section_1899109699` | `section section-customer` | `desktop-homepage-10-customer.png` | 10,000+ Satisfied Patients In-Depth Case Studies |
| 9 | `section_1178718493` | `section section-cta dark` | `desktop-homepage-11-cta.png` | Appointment Booking & Consultation Form (`#tu-van`) |
| 10 | `section_1915240304` | `section section-faq` | `desktop-homepage-12-faq.png` | Frequently Asked Questions Accordion |
| 11 | `section_514095607` | `section section-banner-cta` | (Part of CTA flow) | Full-width Promotional Slogan Banner CTA |
| 12 | `section_2064860503` | `section` (in `#footer`) | `desktop-homepage-13-footer.png` | 4-Column Legal, Services, Navigation & App Footer |
| 13 | `section_1263006414` | `section footer-bottom dark` | `desktop-homepage-13-footer.png` | Copyright Notice, Compliance, Back-to-Top Button |

---

## 4. Deep Section Breakdown & DOM Mapping

### Section 1: Hero Banner (`#section_380136169`)
- **Root Element:** `<section class="section section-banner" id="section_380136169">`
- **DOM Hierarchy:**
  - `<div class="section-bg fill"></div>`
  - `<div class="section-content relative">`
    - `<div class="img has-hover btn-appointment hide-for-small ... id="image_1573834974">`: Desktop banner (`2560x1038`)
      - `<a href="#tu-van" title="Doctor Check...">`
    - `<div class="img has-hover btn-appointment show-for-small ... id="image_1006804480">`: Mobile banner (`856x1256`)
      - `<a href="#tu-van" title="Doctor Check...">`
- **Interactive Role:** Smooth scrolls directly to the `#tu-van` consultation form.

### Section 2: Patient Concerns & Video Testimonials (`#section_294013533`)
- **Root Element:** `<section class="section section-confuse" id="section_294013533">`
- **Part 1: 4 Patient Concerns (`row-1385660731`)**:
  - Headings:
    - Title: `"Tầm Soát Bệnh – Một Khởi Đầu Thông Thái Cho Năm Mới"`
    - Subtitle: `"Gỡ Bỏ 4 “Nỗi Lo” Khiến Bạn Chần Chừ Trước Khi Quyết Định Đi Tầm Soát Bệnh"`
  - 4 Column Grid (`col medium-6 large-3`):
    - `.icon-box.featured-box.icon-box-left.text-left`:
      - Card 1: `01` - Lo sợ phát hiện bệnh nặng
      - Card 2: `02` - Băn khoăn về chi phí
      - Card 3: `03` - Ngại quy trình rườm rà, chờ đợi
      - Card 4: `04` - Chưa tìm được nơi khám tin cậy
- **Part 2: Customer Video Testimonials (`row-1690800079` to `row-269552613`)**:
  - Headings:
    - `"Mời bạn lắng nghe những chia sẻ từ những khách hàng đã trải nghiệm"`
    - `"Kiểm Chứng Ngay Qua Những Chia Sẻ Từ Khách Hàng"`
  - Carousel Container: `.owl-carousel.owl-theme.custom-slider` or `.slider-wrapper`
  - Video Cards: Thumbnail image + `.play-button` + modal trigger (`popup-youtube-custom`)
  - Target Videos: 9 YouTube Shorts / Testimonial embeds (`A4BCCgKqwVI`, `80iE-7mnZGM`, `BpDdHblLz98`, `83eK9z4xptU`, `3ZVAQnYQQ4A`, etc.)

### Section 3: 5 Clinical Advantages (`#section_1967412634`)
- **Root Element:** `<section class="section section-advanced" id="section_1967412634">`
- **Heading:** `"5 quyền lợi bạn nhận được khi tầm soát bệnh tại Doctor Check:"`
- **Two Column Row (`row-1793740266`):**
  - Left Column (`col medium-12 large-7`):
    - Accordion Component: `.accordion.accordion-title-bordered`
    - Item 1: `1. Trung Tâm Đầu Tiên Chuyên Sâu Tầm Soát Bệnh`
    - Item 2: `2. Chẩn Đoán Dựa Vào Y Học Chứng Cứ 100%`
    - Item 3: `3. Quy Trình Tầm Soát Bệnh Chỉ Trong 60-90 Phút`
    - Item 4: `4. Kết Nối Bạn Với Chuyên Gia Bác Sĩ Hàng Đầu`
    - Item 5: `5. Hồ Sơ Bệnh Án Điện Tử & Theo Dõi Trọn Đời`
  - Right Column (`col medium-12 large-5`):
    - Visual photographic banner + video testimonial thumbnail (`w=534,h=329`)

### Section 4: Doctors Team Carousel (`#section_1563108974`)
- **Root Element:** `<section class="section section-doctor" id="section_1563108974">`
- **Heading:** `"Đội ngũ bác sĩ giàu kinh nghiệm, đến từ các bệnh viện lớn tại TP.HCM"`
- **Carousel Markup:**
  - Slider wrapper with Flickity / Owl (`.slider.slider-nav-circle.slider-nav-normal`):
  - 7 Doctor Cards (`col medium-4 large-3`):
    1. BSCKII Trịnh Ái Nhi (Nội Tiêu hóa - Gan Mật)
    2. BSCKII Châu Quỳnh Phi Nhã (Nội Tiêu hóa)
    3. ThS. BSCKII Nguyễn Ngọc Quỳnh Dung (Nội Tiêu hóa - Gan Mật)
    4. ThS. BSCKII Nguyễn Hồng Thanh (Nội Tổng quát)
    5. ThS. BSCKI Lưu Ngọc Mai (Chẩn đoán hình ảnh)
    6. BSCKI Thái Việt Nguyên (Nội soi tiêu hóa)
    7. BS Đặng Nguyễn Nhật Thanh Thi (Nội Tổng quát)
  - Card Structure: Portrait photo (`w=300,h=400`), Name, Degrees, Hospital experience badges, modal trigger link.

### Section 5: Facilities & Equipment Grid (`#section_818310656`)
- **Root Element:** `<section class="section section-facilities" id="section_818310656">`
- **Heading:** `"Khám Phá Sức Mạnh Từ Trang Thiết Bị Máy Móc Hiện Đại Tại Doctor Check"`
- **Grid Layout (`col medium-6 large-4` x 6 cards):**
  1. Hệ thống máy nội soi Olympus EVIS X1 (Nhật Bản)
  2. Hệ thống máy xét nghiệm tự động Cobas (Thụy Sĩ)
  3. Hệ thống máy siêu âm màu Siemens Acuson Sequoia (Mỹ)
  4. Máy chụp X-quang kỹ thuật số FDR Smart X (Fujifilm)
  5. Máy xét nghiệm vi khuẩn HP qua hơi thở C13/C14
  6. Máy đo điện tim 12 đạo trình kỹ thuật số

### Section 6: Screening Pricing Packages (`#section_1936328654`)
- **Root Element:** `<section class="section section-service circle-blur" id="section_1936328654">`
- **Heading:** `"Bảng Giá Các Gói Khám Tổng Quát tại Doctor Check"`
- **Tabs Navigation:**
  - Tab 1: `"Dành Cho Nam"`
  - Tab 2: `"Dành Cho Nữ"`
- **Package Cards Grid:**
  - Gói Khuyến Cáo
  - Gói Chuyên Sâu
  - Gói Nâng Cao
  - Gói Toàn Diện
  - Gói VIP Sống Thọ
- Card Anatomy: Badge, Package Title, Target Audience, Price display (`VND`), List of diagnostic items, CTA `"Đăng ký tư vấn"`.

### Section 7: Periodic Cancer Screening Guidelines (`#section_991765975`)
- **Root Element:** `<section class="section section-suggest dark" id="section_991765975">`
- **Color Theme:** Dark teal `#005570` background.
- **Heading:** `"Thế giới khuyến cáo tầm soát ung thư định kỳ"`
- **2 In-Depth Specialty Cards (`col medium-6 large-6`):**
  - Card 1: `"Tầm soát ung thư thực quản – dạ dày – tá tràng"`
  - Card 2: `"Tầm soát ung thư đại tràng – trực tràng"`
  - Content: Age indicators, clinical symptoms, risk factors, recommended interval.

### Section 8: Customer Stories & Case Studies (`#section_1899109699`)
- **Root Element:** `<section class="section section-customer" id="section_1899109699">`
- **Heading:** `"Hơn 10.000+ Khách hàng đã trải nghiệm hài lòng"`
- **3 Featured Case Studies:**
  - Case 1: Cô Liên (58 tuổi, TP.HCM)
  - Case 2: Chú Hồng Anh (62 tuổi, Đồng Nai)
  - Case 3: Trải nghiệm nội soi êm ái, không đau
- Structure: Before/after diagnosis card, patient portrait, testimonial quote, verified checkup date.

### Section 9: Consultation & Booking Form (`#section_1178718493`)
- **Root Element:** `<section class="section section-cta dark" id="section_1178718493">`
- **Heading:** `"Tầm Soát Bệnh Để Sống Khỏe & Sống Thọ Hơn"`
- **Anchor Target:** `<div id="tu-van"></div>`
- **Form Layout:**
  - Input Fields: Họ và tên, Số điện thoại, Năm sinh, Gói khám quan tâm, Lời nhắn
  - Hotline Box: `1800 6634` (Miễn phí cuộc gọi) - `028 3514 8888`
  - Action Button: `"ĐĂNG KÝ TƯ VẤN NGAY"`

### Section 10: Frequently Asked Questions (`#section_1915240304`)
- **Root Element:** `<section class="section section-faq" id="section_1915240304">`
- **Heading:** `"Câu hỏi thường gặp"`
- **Accordion Items (`.accordion`):**
  1. Các việc cần thực hiện trước khi tầm soát bệnh?
  2. Thời gian thăm khám tại trung tâm Doctor Check mất bao lâu?
  3. Chi phí khám sức khỏe tại Doctor Check là bao nhiêu?
  4. Phòng khám Doctor Check có thanh toán bảo hiểm y tế / bảo lãnh viện phí không?

### Section 11: Promotional Slogan Banner (`#section_514095607`)
- **Root Element:** `<section class="section section-banner-cta" id="section_514095607">`
- **Visual Asset:** Full width banner linking to appointment booking.
- **Desktop Sizing:** `1709x795`
- **Mobile Sizing:** `545x963`

### Sections 12 & 13: Footer (`#footer`)
- **Root Element:** `<footer id="footer" class="footer-wrapper">`
- **Main Section (`#section_2064860503`):**
  - Col 1: Doctor Check Information & Giấy phép Sở Y Tế TP.HCM (09489/HCM-GPHĐ), địa chỉ 429 Tô Hiến Thành, P.14, Q.10, TP.HCM.
  - Col 2: Dịch vụ nổi bật (Nội soi tiêu hóa không đau, Gói tầm soát bệnh).
  - Col 3: Tìm hiểu thêm (Về Doctor Check, Đội ngũ Bác sĩ, Trang thiết bị, Kiến thức y khoa).
  - Col 4: Tải app Doctor Check, Chứng nhận Bộ Công Thương, DMCA, Đối tác thanh toán / bảo hiểm.
- **Bottom Bar (`#section_1263006414.footer-bottom.dark`):**
  - Copyright: `© 2024 Doctor Check - Tầm Soát Bệnh Để Sống Thọ Hơn.`
  - Back to top anchor: `#top-link`

---

## 5. Off-Canvas Mobile Navigation Drawer (`#main-menu`)

```html
<div id="main-menu" class="mobile-sidebar no-scrollbar mfp-hide">
  <div class="sidebar-menu no-scrollbar">
    <ul class="nav nav-sidebar nav-vertical nav-uppercase" data-tab="1">
      <li class="header-search-form ...">...</li>
      <li class="menu-item ..."><a href="/ve-chung-toi/">Về Doctor Check</a></li>
      <li class="menu-item ..."><a href="/goi-tam-soat-nu">Tầm Soát Bệnh Nữ</a></li>
      <li class="menu-item ..."><a href="/goi-tam-soat-nam">Tầm Soát Bệnh Nam</a></li>
      <li class="menu-item ..."><a>6 Thói Quen Sống Thọ</a></li>
      <li class="menu-item ..."><a href="/trung-tam-noi-soi-tieu-hoa-doctor-check/">Trung Tâm Nội Soi Tiêu Hóa</a></li>
      <li class="menu-item ..."><a href="https://khamdoanhnghiep.doctorcheck.vn/">Khám Sức Khỏe Doanh Nghiệp</a></li>
    </ul>
  </div>
</div>
```

---

## 6. HTML Attributes & Responsive Class Matrix

| Flatsome Class | Behavioral Role in Source HTML |
|----------------|--------------------------------|
| `.hide-for-medium` | Visible only on Desktop (> 849px). Hidden on tablet and mobile. |
| `.show-for-medium` | Hidden on Desktop (> 849px). Visible on tablet and mobile (<= 849px). |
| `.hide-for-small` | Hidden on mobile (<= 549px). Used for Desktop Banner. |
| `.show-for-small` | Visible ONLY on mobile (<= 549px). Used for Mobile Banner. |
| `.container` | Fixed max-width: `1250px` with `padding: 0 15px`. |
| `.row` | Flex row grid container with standard 30px gutters (`margin: 0 -15px`). |
| `.row-collapse` | Flex row grid with zero gutters between columns. |
| `.circle-blur` | Decorative radial blurred circular backdrop behind content. |
| `.dark` | Color inversion context: white text, light borders on dark teal background. |
| `.has-hover` | Hover scaling and shadow micro-transitions. |
| `.stuck` | Class dynamically appended to `#header` upon window scroll >= 90px. |
