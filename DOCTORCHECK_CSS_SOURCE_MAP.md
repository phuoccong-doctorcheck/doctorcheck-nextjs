# DOCTORCHECK CSS SOURCE MAP
## Comprehensive Analysis of All 18 Original CSS Bundles

> **Source Directory:** `doctorcheck-source/css/`  
> **Total Stylesheets:** 18 files  
> **Core Framework:** Flatsome 3.19.8 UX Builder Grid + Custom DoctorCheck SCSS Pipeline  
> **Analysis Date:** March 2026  
> **Integrity Mode:** Strictly read-only analysis of local snapshot. No production crawling.

---

## 1. Master CSS Files Inventory Table

| CSS file | Purpose | Important selectors | Relevant UI | Breakpoints | Priority |
|---|---|---|---|---|---|
| `flatsome.css` | Flatsome core grid, flexbox layout, typography base, buttons, form controls, responsive display classes | `.container`, `.row`, `.col`, `.button`, `.nav-top-link`, `.hide-for-medium`, `.show-for-medium`, `.hide-for-small`, `.show-for-small` | Global layout, Header, Hero, Footer, Grid systems | `549px`, `849px`, `1250px` | **P0** |
| `app.css` | Primary custom stylesheet: `@font-face` definitions for `SVN-Sofia Pro`, brand colors, badges, header hover states, button shadows | `@font-face`, `.label-vip`, `.btn-appointment`, `.nav-dropdown`, `.header-main`, `.stuck`, `.circle-blur`, `.header-search` | Header, Sticky Header, Hero, VIP badge, Doctor cards | `600px`, `768px` | **P0** |
| `appv3.css` | V3 design enhancements: modern blurred circle backdrops, mobile bottom navigation bar, customer review styling | `.circle-blur`, `.accordion-title`, `.post-item`, `.flickity-button`, `.bao-chi-slider`, `.mobile-bar` | Facilities, Pricing, Customer Stories, Mobile sticky bar | `390px`, `400px`, `576px`, `600px`, `767px`, `768px`, `991px`, `1100px` | **P0** |
| `responsive.css` | Critical breakpoint overrides for mobile & tablet screens: mobile header (64px), logo dimensions, spacing tightening | `@media (max-width: 549px)`, `.header-main`, `#logo`, `.section-banner`, `.nav-right`, `.mobile-sidebar` | Mobile Header, Mobile Hero, Mobile drawer navigation | `549px`, `768px`, `849px`, `991px` | **P0** |
| `doctor-boxes.css` | Doctor cards grid layout, circular portrait framing, specialty qualification tags, experience badges | `.box-doctor`, `.doctor-img`, `.doctor-name`, `.doctor-specialty`, `.doctor-exp`, `.doctor-badge` | Section 4: Đội ngũ Bác sĩ | `549px`, `768px` | **P1** |
| `dc-icons.min.css` | DoctorCheck custom vector icon font definition (`dc-icons.woff2` glyphs) & utility classes | `[class^="ti-"]`, `[class*=" ti-"]`, `.icon-search`, `.icon-angle-down`, `.icon-menu`, `.ti-phone` | Header icons, search icon, dropdown chevrons, feature bullets | None (vector font) | **P1** |
| `owl.carousel.min.css` | Owl Carousel slider library core structural rules (sliding stage, flex items, touch interaction) | `.owl-carousel`, `.owl-stage`, `.owl-stage-outer`, `.owl-item`, `.owl-nav`, `.owl-dots` | Section 2B: Customer video carousel, Section 4: Doctors | None | **P1** |
| `owl.theme.default.min.css` | Owl Carousel default visual skin (dot pagination colors, arrow hover shapes) | `.owl-theme .owl-dots .owl-dot`, `.owl-theme .owl-nav [class*="owl-"]` | Video & Doctor carousel navigation controls | None | **P1** |
| `flatsome-shop.css` | Flatsome WooCommerce eCommerce & product table layout: pricing matrix, diagnostic package lists | `.price`, `.amount`, `.add_to_cart_button`, `.woocommerce-Price-currencySymbol`, `.pricing-table` | Section 6: Bảng giá dịch vụ | `549px`, `849px` | **P1** |
| `ldp-nsdd.css` | Landing page Nội Soi Dạ Dày & Đại Tràng custom styling, procedure steps, diagnostic highlights | `.ldp-process`, `.ldp-feature-box`, `.ldp-badge`, `.ldp-callout` | Section 7: Cancer screening guidelines | `768px` | **P1** |
| `kdn.css` | Khám Doanh Nghiệp (Corporate health checkup) styles and enterprise consultation form | `.kdn-wrapper`, `.kdn-form`, `.kdn-card`, `.kdn-benefit` | Header Enterprise menu & corporate CTA | `768px` | **P2** |
| `swiper-bundle.css` | Swiper slider framework stylesheet: alternative touch carousel for cards and testimonials | `.swiper`, `.swiper-wrapper`, `.swiper-slide`, `.swiper-pagination` | Customer stories slider fallback | None | **P2** |
| `splide.min.css` | Splide carousel library styles: lightweight touch slider track and controls | `.splide`, `.splide__track`, `.splide__list`, `.splide__slide` | Testimonial carousel fallback | None | **P2** |
| `flatpickr.min.css` | Flatpickr datepicker calendar skin: calendar popover for appointment booking | `.flatpickr-calendar`, `.flatpickr-day`, `.flatpickr-months`, `.flatpickr-current-month` | Section 9: Form tư vấn (`#tu-van`) | None | **P2** |
| `public-main.css` | WordPress plugin frontend styling (social sharing, analytics tracking wrappers) | `.wp-plugin-wrapper`, `.social-share`, `.tracking-pixel` | Social links, analytics triggers | None | **P2** |
| `styles.css` | Child theme base stylesheet (WordPress template declaration & minimal overrides) | `body`, `a`, `.entry-content` | Base typography normalization | None | **P2** |
| `style.css` | Child theme metadata header | Theme header metadata comment block | WordPress theme loader only | None | **P2** |
| `header-ldp.css` | Empty placeholder file in source repository | N/A (0 bytes) | Unused | None | **P3** |

---

## 2. In-Depth Rules Analysis by Design Dimension

### A. Design Tokens & Color System
Extracted from `flatsome.css`, `app.css`, and `appv3.css`:
- **Primary Brand Color:** `#005570` (DoctorCheck Deep Teal)
  - Used in: Sticky Header background, Primary buttons, Heading accents, Active tabs, Section-suggest background.
- **Secondary Accent Color:** `#ffb500` (Warm Amber / Gold)
  - Used in: Rating stars, Highlight badges, Secondary CTA buttons, Selection highlights (`selection:bg-[#ffb500]`).
- **Page Canvas Background:** `#fdfdf6` (Soft Medical Warm White)
  - Used in: Main body background, Card backgrounds, Alternating section fills.
- **Body Text Color:** `#2a2f38` (Deep Charcoal Slate)
  - Used in: Main paragraphs, Navigation links, Form labels, Accordion titles.
- **Muted Text Color:** `#777777` / `#828282`
  - Used in: Subtitles, Timestamps, Disclaimers, Doctor titles.
- **Alert / Highlight Red:** `#cd0000` / `#db0000`
  - Used in: `.label-vip` VIP badge, Discount tags, Critical health warnings.
- **Borders & Dividers:** `#eef7fa` / `#d2d2d2` / `#dddddd`
  - Used in: Navigation dropdown borders, Card borders, Accordion separators.

### B. Typography Rules & Font System
Extracted from `app.css`:
```css
@font-face {
  font-family: 'SVN-Sofia Pro';
  src: url('/wp-content/themes/doctorcheck/assets/fonts/SVN-SofiaPro-Regular.woff2') format('woff2');
  font-weight: normal; /* 400 */
  font-style: normal;
  font-display: swap;
}
@font-face {
  font-family: 'SVN-Sofia Pro';
  src: url('/wp-content/themes/doctorcheck/assets/fonts/SVN-SofiaPro-Light.woff2') format('woff2');
  font-weight: 300;
  font-style: normal;
  font-display: swap;
}
@font-face {
  font-family: 'SVN-Sofia Pro';
  src: url('/wp-content/themes/doctorcheck/assets/fonts/SVN-SofiaPro-SemiBold.woff2') format('woff2');
  font-weight: 600;
  font-style: normal;
  font-display: swap;
}
@font-face {
  font-family: 'SVN-Sofia Pro';
  src: url('/wp-content/themes/doctorcheck/assets/fonts/SVN-SofiaPro-Bold.woff2') format('woff2');
  font-weight: bold; /* 700 */
  font-style: normal;
  font-display: swap;
}
@font-face {
  font-family: 'SVN-Sofia Pro';
  src: url('/wp-content/themes/doctorcheck/assets/fonts/SVN-SofiaPro-Black.woff2') format('woff2');
  font-weight: 900;
  font-style: normal;
  font-display: swap;
}
```
- **Global Typography Stack:** `font-family: 'SVN-Sofia Pro', sans-serif;`
- **Navigation Links (`.nav-top-link`):** `font-size: 14.5px; font-weight: 700; line-height: 16px;`
- **Headings (`h1`, `h2`):** `font-weight: 700; color: #005570; line-height: 1.25;`
- **Section Subtitles:** `font-size: 18px; font-weight: 400; color: #2a2f38;`

### C. Grid, Geometry & Dimensions
Extracted from `flatsome.css`:
```css
.container, .row {
  max-width: 1250px;
}
.container {
  padding-left: 15px;
  padding-right: 15px;
}
.header-main {
  height: 90px;
}
#logo {
  width: 60px;
}
.logo-left .logo {
  margin-left: 0;
  margin-right: 30px;
}
@media (max-width: 549px) {
  .header-main {
    height: 64px;
  }
}
```

### D. Sticky Header Behavior
Extracted from `flatsome.css` & `app.css`:
```css
.header.has-sticky.sticky-jump {
  position: relative;
  width: 100%;
  z-index: 1001;
}
.stuck {
  position: fixed !important;
  top: 0;
  left: 0;
  right: 0;
  background-color: #005570 !important;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  transition: background-color .3s;
}
.stuck .header-main {
  height: 90px !important;
}
.stuck .nav-top-link {
  color: #ffffff !important;
}
.stuck .header-logo-sticky {
  display: block !important;
}
.stuck .header_logo {
  display: none !important;
}
```

### E. VIP Badge & Micro-Decorations
Extracted from `app.css`:
```css
.label-vip:after {
  content: "VIP";
  background: #cd0000;
  color: #ffffff;
  font-size: 9.5px;
  font-weight: 700;
  border-radius: 0 8px 0 8px;
  padding: 1px 5px;
  position: absolute;
  top: -9px;
  right: -24px;
}
.circle-blur {
  position: relative;
  overflow: hidden;
}
.circle-blur:before {
  content: "";
  position: absolute;
  width: 350px;
  height: 350px;
  background: radial-gradient(circle, rgba(135,227,219,0.25) 0%, rgba(253,253,246,0) 70%);
  border-radius: 50%;
  pointer-events: none;
}
```
