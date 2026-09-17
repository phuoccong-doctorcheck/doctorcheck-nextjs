# DOCTORCHECK UI SOURCE MAP
## Section-by-Section Forensic Blueprint of the DoctorCheck.vn Homepage

> **Source HTML:** `doctorcheck-source/html/homepage.html`  
> **Source CSS:** `doctorcheck-source/css/`  
> **Screenshots:** `doctorcheck-source/screenshots/desktop/` (13 PNGs)  
> **Analysis Date:** March 2026  
> **Integrity Mode:** Strictly read-only analysis. Zero production requests.

---

## 1. Header (`#header`)
- **HTML Root Element:** `<header id="header" class="header has-sticky sticky-jump" style="height: 90px;">`
- **Important IDs:** `#header`, `#masthead`, `#logo`, `#menu-item-1501`, `#menu-item-1522`, `#menu-item-1521`, `#menu-item-1846`, `#menu-item-1651`, `#menu-item-5685`, `#main-menu`
- **Important Classes:** `.header-wrapper`, `.header-main`, `.has-sticky-logo`, `.header-inner`, `.flex-row`, `.container`, `.logo-left`, `.medium-logo-left`, `.header-nav`, `.header-nav-main`, `.nav-size-medium`, `.nav-spacing-small`, `.label-vip`, `.dc-hide`
- **Relevant CSS Files:** `flatsome.css`, `app.css`, `responsive.css`, `dc-icons.min.css`
- **Relevant Selectors:** `.header-main { height: 90px; }`, `.stuck .header-main { height: 90px !important; }`, `#logo { width: 60px; }`, `.logo-left .logo { margin-right: 30px; }`, `.nav-top-link { line-height: 16px; font-size: 14.5px; }`
- **Container Width:** `1250px` (padding: `0 15px`)
- **Dimensions:** Desktop height `90px`; Mobile height `64px`
- **Spacing:** Logo right margin `30px`; Navigation item inline padding `12px`
- **Typography:** `font-family: 'SVN-Sofia Pro', sans-serif; font-weight: 700; line-height: 16px;`
- **Colors:**
  - Normal State: Background `#ffffff`, Text `#2a2f38`, Logo default color
  - Sticky State (`.stuck`): Background `#005570`, Text `#ffffff`, Logo white (`logo-sticky.webp`)
- **Images:**
  - Default Logo: `/sites/doctorcheck-vn/root/images/logo-header.webp`
  - Sticky Logo: `/sites/doctorcheck-vn/root/images/logo-sticky.webp`
- **Responsive Behavior:**
  - Desktop (> 849px): Full 6-item navigation + search dropdown toggle
  - Tablet/Mobile (<= 849px): Navigation & search hidden; Hamburger menu button visible
  - Mobile (<= 549px): Header height shrinks to `64px`, logo shrinks to `42px`
- **Interactive Behavior:** Dropdown menus on hover; Search popup form on click; Hamburger opens right-side off-canvas drawer (`#main-menu`)
- **Carousel Behavior:** None
- **Dependencies:** Font `SVN-Sofia Pro`, Icon glyphs (`icon-angle-down`, `icon-search`, `icon-menu`)

---

## 2. Hero Banner (`#section_380136169`)
- **HTML Root Element:** `<section class="section section-banner" id="section_380136169">`
- **Important IDs:** `#section_380136169`, `#image_1573834974` (desktop), `#image_1006804480` (mobile)
- **Important Classes:** `.section`, `.section-banner`, `.section-bg`, `.fill`, `.section-content`, `.img`, `.has-hover`, `.btn-appointment`, `.hide-for-small`, `.show-for-small`
- **Relevant CSS Files:** `flatsome.css`, `app.css`, `responsive.css`
- **Relevant Selectors:** `.section-banner { padding: 0 !important; }`, `.hide-for-small`, `.show-for-small`, `@media (max-width: 549px)`
- **Container Width:** Full viewport width (`100vw`)
- **Dimensions:** Desktop image `2560x1038`; Mobile image `856x1256`
- **Spacing:** Padding top `0`, padding bottom `0`
- **Typography:** Visual typography inside banner graphic; Semantic `<h1>` accessible
- **Colors:** Dominant Teal `#005570` and Gold `#ffb500` inside graphic
- **Images:**
  - Desktop: `/sites/doctorcheck-vn/root/images/banner-desktop-master.webp`
  - Mobile: `/sites/doctorcheck-vn/root/images/banner-mobile-master.webp`
- **Responsive Behavior:** Strict mutual exclusivity via `@media (max-width: 549px)`. Desktop banner hidden on mobile; Mobile banner hidden on desktop.
- **Interactive Behavior:** Clicking any part of the banner triggers smooth scroll to `#tu-van`
- **Carousel Behavior:** None
- **Dependencies:** Anchor link `#tu-van`

---

## 3. Four Concerns (`#section_294013533`, Part 1)
- **HTML Root Element:** `<section class="section section-confuse" id="section_294013533">`
- **Important IDs:** `#section_294013533`, `#row-64855036`, `#row-1385660731`
- **Important Classes:** `.section-confuse`, `.row-collapse`, `.align-middle`, `.align-center`, `.circle-blur`, `.icon-box`, `.featured-box`
- **Relevant CSS Files:** `flatsome.css`, `app.css`, `appv3.css`
- **Relevant Selectors:** `.section-confuse`, `.circle-blur`, `.featured-box`, `.icon-box-left`
- **Container Width:** `1250px`
- **Dimensions:** Auto height (~490px on desktop)
- **Spacing:** Section padding `50px 0`; 4-column row collapse with zero inner gutters
- **Typography:**
  - Main Title: `font-size: 28px; font-weight: 700; color: #005570;`
  - Subtitle: `font-size: 18px; font-weight: 600; color: #ffb500;`
  - Number Indicator: `font-size: 32px; font-weight: 900; color: #005570;`
- **Colors:** Background `#fdfdf6`, Radial blur `rgba(135,227,219,0.25)`
- **Images:** None (pure vector/typography number-boxes `01`, `02`, `03`, `04`)
- **Responsive Behavior:** 4 columns on desktop (`large-3`), 2 columns on tablet (`medium-6`), 1 column on mobile (`small-12`)
- **Interactive Behavior:** Hover micro-elevation on cards
- **Carousel Behavior:** None
- **Dependencies:** Flatsome grid `.col.medium-6.large-3`

---

## 4. Customer Video Testimonials (`#section_294013533`, Part 2)
- **HTML Root Element:** Part of `<section class="section section-confuse" id="section_294013533">`
- **Important IDs:** `#row-1690800079`, `#row-2043485159` to `#row-269552613`
- **Important Classes:** `.owl-carousel`, `.owl-theme`, `.custom-slider`, `.video-card`, `.play-button`, `.popup-youtube-custom`
- **Relevant CSS Files:** `owl.carousel.min.css`, `owl.theme.default.min.css`, `app.css`, `appv3.css`
- **Relevant Selectors:** `.owl-carousel .owl-item`, `.play-button`, `.popup-youtube-custom`
- **Container Width:** `1250px`
- **Dimensions:** Card aspect ratio 9:16 (YouTube Shorts) or 16:9; Carousel height ~676px
- **Spacing:** 15px gap between video cards
- **Typography:** Subtitles `font-size: 16px; font-weight: 600; color: #2a2f38;`
- **Colors:** Video frame background `#000000`, Play button `#ffb500` / `#ffffff`
- **Images:** Video poster thumbnails
- **Responsive Behavior:** 4 cards visible on desktop, 2 on tablet, 1.2 cards on mobile with touch drag
- **Interactive Behavior:** Clicking card opens modal dialog with active YouTube iframe embed
- **Carousel Behavior:** Continuous loop slider with dot navigation and arrow controls
- **Dependencies:** YouTube Embed IDs (`A4BCCgKqwVI`, `80iE-7mnZGM`, etc.)

---

## 5. 5 Clinical Benefits / Advanced (`#section_1967412634`)
- **HTML Root Element:** `<section class="section section-advanced" id="section_1967412634">`
- **Important IDs:** `#section_1967412634`, `#row-1793740266`
- **Important Classes:** `.section-advanced`, `.accordion`, `.accordion-title-bordered`, `.accordion-item`, `.accordion-title`, `.accordion-inner`
- **Relevant CSS Files:** `flatsome.css`, `app.css`, `appv3.css`
- **Relevant Selectors:** `.accordion-title { font-size: 18px; font-weight: 700; color: #005570; }`, `.accordion-inner`
- **Container Width:** `1250px`
- **Dimensions:** Section height ~905px on desktop
- **Spacing:** Section padding `60px 0`; Two-column split (7 cols accordion : 5 cols banner)
- **Typography:** Main title `28px; font-weight: 700; color: #005570;`; Accordion item `18px`
- **Colors:** Background `#ffffff` / `#fdfdf6`, Active accordion header `#eef7fa`
- **Images:** `/sites/doctorcheck-vn/root/images/benefits-banner-master.webp`
- **Responsive Behavior:** Stacks vertically on mobile (Accordion on top, graphic banner below)
- **Interactive Behavior:** Smooth accordion expansion (one open at a time, chevron rotation)
- **Carousel Behavior:** None
- **Dependencies:** Accordion toggle state

---

## 6. Doctors Carousel (`#section_1563108974`)
- **HTML Root Element:** `<section class="section section-doctor" id="section_1563108974">`
- **Important IDs:** `#section_1563108974`, `#row-1845109283`
- **Important Classes:** `.section-doctor`, `.slider`, `.slider-nav-circle`, `.slider-nav-normal`, `.box-doctor`, `.doctor-img`, `.doctor-name`
- **Relevant CSS Files:** `flatsome.css`, `app.css`, `doctor-boxes.css`, `responsive.css`
- **Relevant Selectors:** `.box-doctor { border-radius: 12px; background: #fff; box-shadow: 0 4px 20px rgba(0,0,0,0.06); }`, `.doctor-img img`
- **Container Width:** `1250px`
- **Dimensions:** Card width ~280px; Doctor portrait height `400px`
- **Spacing:** Section padding `60px 0`; Card margin `15px`
- **Typography:**
  - Section Title: `28px; font-weight: 700; color: #005570;`
  - Doctor Name: `20px; font-weight: 700; color: #005570;`
  - Degrees/Title: `14px; font-weight: 600; color: #ffb500;`
  - Description/Hospital: `14px; color: #2a2f38;`
- **Colors:** Background `#fdfdf6` with subtle texture `#9457588e...`
- **Images:** 7 Doctor portraits in `/sites/doctorcheck-vn/root/images/doctors/`
- **Responsive Behavior:** 4 doctors per view on desktop (>1024px), 2 on tablet, 1 on mobile
- **Interactive Behavior:** Clicking card opens comprehensive Doctor Profile Modal
- **Carousel Behavior:** Infinite touch slider with circular arrow buttons and progress dots
- **Dependencies:** Doctor Modal component & doctor profile data

---

## 7. Facilities & Equipment (`#section_818310656`)
- **HTML Root Element:** `<section class="section section-facilities" id="section_818310656">`
- **Important IDs:** `#section_818310656`, `#row-1456983210`
- **Important Classes:** `.section-facilities`, `.row-small`, `.col`, `.medium-6`, `.large-4`, `.card-facility`
- **Relevant CSS Files:** `flatsome.css`, `app.css`, `appv3.css`
- **Relevant Selectors:** `.card-facility { border-radius: 10px; overflow: hidden; background: #fff; }`, `.facility-img`
- **Container Width:** `1250px`
- **Dimensions:** Grid of 6 cards (3 columns x 2 rows on desktop)
- **Spacing:** Section padding `60px 0`; Gutters `20px`
- **Typography:**
  - Main Title: `28px; font-weight: 700; color: #005570;`
  - Equipment Name: `18px; font-weight: 700; color: #005570;`
  - Origin / Feature: `14px; color: #777777;`
- **Colors:** Card background `#ffffff`, Section background `#fdfdf6`
- **Images:** 6 Photographic equipment images in `/sites/doctorcheck-vn/root/images/equipment/`
- **Responsive Behavior:** 3 columns on desktop (`large-4`), 2 on tablet (`medium-6`), 1 on mobile (`small-12`)
- **Interactive Behavior:** Card hover zoom on image (`transform: scale(1.04)`)
- **Carousel Behavior:** None
- **Dependencies:** Local equipment photographic assets

---

## 8. Services & Pricing Packages (`#section_1936328654`)
- **HTML Root Element:** `<section class="section section-service circle-blur" id="section_1936328654">`
- **Important IDs:** `#section_1936328654`, `#row-pricing-tabs`, `#row-pricing-cards`
- **Important Classes:** `.section-service`, `.circle-blur`, `.nav-tabs`, `.tab-item`, `.active`, `.pricing-box`, `.price-tag`
- **Relevant CSS Files:** `flatsome.css`, `flatsome-shop.css`, `app.css`, `appv3.css`
- **Relevant Selectors:** `.pricing-box`, `.price-tag { font-size: 24px; font-weight: 700; color: #cd0000; }`, `.nav-tabs .active`
- **Container Width:** `1250px`
- **Dimensions:** Height ~741px on desktop
- **Spacing:** Section padding `70px 0`; Card padding `24px`
- **Typography:**
  - Main Title: `28px; font-weight: 700; color: #005570;`
  - Package Name: `20px; font-weight: 700; color: #005570;`
  - Price: `24px; font-weight: 700; color: #cd0000;`
- **Colors:** Background `#fdfdf6`, Active tab button `#005570` (white text)
- **Images:** Package graphic accents & SVG check icons
- **Responsive Behavior:** Tabs switch horizontally; Cards stack on tablet/mobile
- **Interactive Behavior:** Tab switching between "Dành Cho Nam" and "Dành Cho Nữ"; CTA button scrolls to `#tu-van`
- **Carousel Behavior:** None
- **Dependencies:** State management for active gender tab

---

## 9. Periodic Cancer Screening Suggestions (`#section_991765975`)
- **HTML Root Element:** `<section class="section section-suggest dark" id="section_991765975">`
- **Important IDs:** `#section_991765975`, `#row-1992837461`
- **Important Classes:** `.section-suggest`, `.dark`, `.col`, `.medium-6`, `.large-6`, `.box-suggest`
- **Relevant CSS Files:** `flatsome.css`, `app.css`, `ldp-nsdd.css`
- **Relevant Selectors:** `.section-suggest.dark { background-color: #005570; color: #fff; }`, `.box-suggest`
- **Container Width:** `1250px`
- **Dimensions:** Height ~658px on desktop
- **Spacing:** Section padding `60px 0`; Card padding `30px`
- **Typography:**
  - Main Title: `28px; font-weight: 700; color: #ffb500;`
  - Card Heading: `22px; font-weight: 700; color: #ffffff;`
  - Body Text: `15.5px; line-height: 1.6; color: #eef7fa;`
- **Colors:** Deep Teal Background `#005570`, Gold Accent `#ffb500`, Text `#ffffff`
- **Images:** None (pure typographical and clinical structure)
- **Responsive Behavior:** 2 columns on desktop (`large-6`), 1 column on mobile (`small-12`)
- **Interactive Behavior:** Internal links to endoscopy and cancer screening subpages
- **Carousel Behavior:** None
- **Dependencies:** Medical content parity

---

## 10. Customer Stories (`#section_1899109699`)
- **HTML Root Element:** `<section class="section section-customer" id="section_1899109699">`
- **Important IDs:** `#section_1899109699`, `#row-1899109699`
- **Important Classes:** `.section-customer`, `.testimonial-box`, `.quote`, `.author-info`
- **Relevant CSS Files:** `flatsome.css`, `app.css`, `appv3.css`
- **Relevant Selectors:** `.testimonial-box { background: #fff; border-radius: 12px; }`
- **Container Width:** `1250px`
- **Dimensions:** Height ~914px on desktop
- **Spacing:** Section padding `60px 0`; Card padding `25px`
- **Typography:** Title `28px; font-weight: 700; color: #005570;`; Quote `15px; italic; color: #2a2f38;`
- **Colors:** Background `#fdfdf6`, Star rating `#ffb500`
- **Images:** Customer portraits `/sites/doctorcheck-vn/root/images/video-thumb-*`
- **Responsive Behavior:** Grid collapses to vertical list on mobile
- **Interactive Behavior:** Read more toggle / modal video triggers
- **Carousel Behavior:** Optional slider track
- **Dependencies:** Patient case studies content

---

## 11. Consultation & Booking CTA (`#section_1178718493`)
- **HTML Root Element:** `<section class="section section-cta dark" id="section_1178718493">`
- **Important IDs:** `#section_1178718493`, `#tu-van`, `#booking-form`
- **Important Classes:** `.section-cta`, `.dark`, `.booking-wrapper`, `.form-group`, `.btn-submit`
- **Relevant CSS Files:** `flatsome.css`, `app.css`, `flatpickr.min.css`
- **Relevant Selectors:** `#tu-van`, `.section-cta.dark { background: #00475b; }`, `.btn-submit { background: #ffb500; color: #005570; font-weight: 700; }`
- **Container Width:** `1250px`
- **Dimensions:** Height ~658px on desktop
- **Spacing:** Section padding `70px 0`
- **Typography:** Heading `30px; font-weight: 700; color: #ffffff;`; Button `16px; font-weight: 700;`
- **Colors:** Deep Background `#00475b`, Button `#ffb500`, Text `#ffffff`
- **Images:** Background texture
- **Responsive Behavior:** 2 columns on desktop (Info/Hotlines left : Form right); 1 column on mobile
- **Interactive Behavior:** Form field validation, phone formatting, appointment request submission
- **Carousel Behavior:** None
- **Dependencies:** API endpoint or client-side form handler

---

## 12. Frequently Asked Questions (`#section_1915240304`)
- **HTML Root Element:** `<section class="section section-faq" id="section_1915240304">`
- **Important IDs:** `#section_1915240304`, `#faq-accordion`
- **Important Classes:** `.section-faq`, `.accordion`, `.accordion-title`, `.accordion-inner`
- **Relevant CSS Files:** `flatsome.css`, `app.css`
- **Relevant Selectors:** `.section-faq .accordion-title { font-weight: 700; font-size: 17px; }`
- **Container Width:** `1250px` (inner centered width `900px`)
- **Dimensions:** Height ~448px on desktop
- **Spacing:** Section padding `60px 0`
- **Typography:** Heading `28px; font-weight: 700; color: #005570;`; FAQ Title `17px; font-weight: 600;`
- **Colors:** Background `#ffffff` / `#fdfdf6`
- **Images:** None
- **Responsive Behavior:** Full width on mobile with touch-friendly touch targets (min 48px height)
- **Interactive Behavior:** Expand/collapse single FAQ item with chevron angle transition
- **Carousel Behavior:** None
- **Dependencies:** FAQ data array

---

## 13. Promotional Slogan Banner CTA (`#section_514095607`)
- **HTML Root Element:** `<section class="section section-banner-cta" id="section_514095607">`
- **Important IDs:** `#section_514095607`, `#image_banner_cta`
- **Important Classes:** `.section-banner-cta`, `.img-inner`
- **Relevant CSS Files:** `flatsome.css`, `app.css`
- **Relevant Selectors:** `.section-banner-cta { padding: 0 !important; }`
- **Container Width:** `100vw`
- **Dimensions:** Desktop `1709x795`; Mobile `545x963`
- **Spacing:** Zero padding
- **Typography:** Graphic typography
- **Colors:** Brand teal & gold
- **Images:** `/sites/doctorcheck-vn/root/images/hero-banner-living-long.webp`
- **Responsive Behavior:** Media queries toggle desktop vs mobile banners
- **Interactive Behavior:** Click scrolls to `#tu-van`
- **Carousel Behavior:** None
- **Dependencies:** Anchor link `#tu-van`

---

## 14. Footer & Footer Bottom (`#footer`)
- **HTML Root Element:** `<footer id="footer" class="footer-wrapper">`
- **Important IDs:** `#footer`, `#section_2064860503`, `#section_1263006414`, `#top-link`
- **Important Classes:** `.footer-wrapper`, `.footer-main`, `.footer-bottom`, `.dark`, `.col`, `.large-3`
- **Relevant CSS Files:** `flatsome.css`, `app.css`, `responsive.css`
- **Relevant Selectors:** `#footer { background-color: #fdfdf6; }`, `.footer-bottom.dark { background-color: #00475b; }`, `#top-link`
- **Container Width:** `1250px`
- **Dimensions:** Section 12 height ~650px; Section 13 height ~60px
- **Spacing:** Main footer padding `60px 0`; Bottom footer padding `15px 0`
- **Typography:**
  - Widget Title: `18px; font-weight: 700; color: #005570;`
  - Links & Text: `14px; color: #2a2f38; line-height: 1.8;`
  - Copyright: `13px; color: #ffffff;`
- **Colors:** Main Footer `#fdfdf6`, Bottom Footer `#00475b`, Copyright text `#ffffff`
- **Images:** Brand logo `/sites/doctorcheck-vn/root/images/logo.webp`, certification SVGs
- **Responsive Behavior:** 4 columns on desktop collapse to 2 columns on tablet, 1 column on mobile
- **Interactive Behavior:** Back to top smooth scroll; Phone dialer triggers; External links
- **Carousel Behavior:** None
- **Dependencies:** Social & legal links catalog
