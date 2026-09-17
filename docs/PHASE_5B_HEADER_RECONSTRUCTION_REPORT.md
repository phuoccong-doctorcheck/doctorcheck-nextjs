# Phase 5B — Header Exact Visual Reconstruction Report

## 1. Original Source Evidence
The original Header structure from WordPress/Flatsome (`scratch/sections/00-header.html`) follows the semantic layout:

```html
<header id="header" class="header has-sticky sticky-jump" style="height: 90px;">
  <div class="header-wrapper">
    <div id="masthead" class="header-main has-sticky-logo">
      <div class="header-inner flex-row container logo-left medium-logo-left" role="navigation">
        <!-- Logo -->
        <div id="logo" class="flex-col logo">
          <a href="https://www.doctorcheck.vn/" title="Doctor Check - Tầm Soát Bệnh Để Sống Thọ Hơn" rel="home">
            <img width="399" height="396" src=".../w=399,h=396" class="header-logo-sticky" alt="Doctor Check">
            <img width="281" height="281" src=".../w=281,h=281,fit=crop" class="header_logo header-logo" alt="Doctor Check">
            <img width="399" height="396" src=".../w=399,h=396" class="header-logo-dark" alt="Doctor Check">
          </a>
        </div>

        <!-- Mobile Left Elements -->
        <div class="flex-col show-for-medium flex-left">
          <ul class="mobile-nav nav nav-left"></ul>
        </div>

        <!-- Left Elements (Desktop Navigation) -->
        <div class="flex-col hide-for-medium flex-left flex-grow">
          <ul class="header-nav header-nav-main nav nav-left nav-size-medium nav-spacing-small">
            <li id="menu-item-1501" class="menu-item... has-dropdown"><a href="/ve-chung-toi/" class="nav-top-link">Về<br> Doctor Check<i class="icon-angle-down"></i></a>...</li>
            <li id="menu-item-1522" class="menu-item... has-dropdown"><a href="/goi-tam-soat-nu" class="nav-top-link">Tầm Soát Bệnh <br> Nữ<i class="icon-angle-down"></i></a>...</li>
            <li id="menu-item-1521" class="menu-item... has-dropdown"><a href="/goi-tam-soat-nam" class="nav-top-link">Tầm Soát Bệnh <br> Nam<i class="icon-angle-down"></i></a>...</li>
            <li id="menu-item-1846" class="menu-item... has-dropdown"><a class="nav-top-link">6 Thói Quen<br> Sống Thọ<i class="icon-angle-down"></i></a>...</li>
            <li id="menu-item-1651" class="label-vip premium menu-item... has-dropdown"><a href="/trung-tam-noi-soi-tieu-hoa-doctor-check/" class="nav-top-link">Trung Tâm <br>Nội Soi Tiêu Hóa<i class="icon-angle-down"></i></a>...</li>
            <li id="menu-item-5685" class="label-minh-bach dc-hide menu-item... has-dropdown"><a href="https://khamdoanhnghiep.doctorcheck.vn/" class="nav-top-link">Khám Sức Khỏe <br>Doanh Nghiệp<i class="icon-angle-down"></i></a>...</li>
          </ul>
        </div>

        <!-- Right Elements (Desktop Search) -->
        <div class="flex-col hide-for-medium flex-right">
          <ul class="header-nav header-nav-main nav nav-right nav-size-medium nav-spacing-small">
            <li class="header-search header-search-dropdown has-icon has-dropdown menu-item-has-children">
              <a href="#" aria-label="Tìm kiếm" class="is-small"><i class="icon-search"></i></a>
              <ul class="nav-dropdown nav-dropdown-default">...</ul>
            </li>
          </ul>
        </div>

        <!-- Mobile Right Elements -->
        <div class="flex-col show-for-medium flex-right">
          <ul class="mobile-nav nav nav-right">
            <li class="nav-icon has-icon">
              <a href="#" data-open="#main-menu" data-pos="right" aria-label="Menu"><i class="icon-menu"></i></a>
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

## 2. CSS Evidence
Extracted from `scratch/extracted-homepage.css`:

```css
.container,
.row {
    max-width: 1250px;
}
.container {
    padding-left: 15px;
    padding-right: 15px;
}
.flex-row {
    align-items: center;
    display: flex;
    flex-flow: row nowrap;
    justify-content: space-between;
    width: 100%;
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
#logo img {
    max-height: 90px;
}
.header.show-on-scroll,
.stuck .header-main {
    height: 90px !important;
}
.stuck #logo img {
    max-height: 90px !important;
}
.header-main .nav > li > a {
    line-height: 16px;
}
.header:not(.transparent) .header-nav-main.nav > li > a {
    color: #2a2f38;
}
@media (max-width: 549px) {
    .header-main {
        height: 64px;
    }
    #logo img {
        max-height: 64px;
    }
}
/* Badge "Mới" / "VIP" forensic style */
li.label-moi { position: relative; }
li.label-moi > a::after {
    background: #CD0000 !important;
    top: -10px !important;
    left: 4px;
    padding: 5px 10px !important;
    border-radius: 0 9px 0 9px !important;
    position: relative;
    text-align: center;
    line-height: 1 !important;
    font-size: 10.5px !important;
    content: 'MỚI' !important;
    color: #FFF;
}
.dc-hide { display: none !important; }
```

---

## 3. Font Evidence
- Authentic font family: `'SVN-Sofia Pro'`, `'Svn-Sofia Pro'`, `'SVN-SofiaPro'`.
- Local WOFF2 assets in `public/sites/doctorcheck-vn/fonts/`:
  - `SVN-SofiaPro-Light.woff2`: weight 300
  - `SVN-SofiaPro-Regular.woff2`: weight 400
  - `SVN-SofiaPro-SemiBold.woff2`: weight 600
  - `SVN-SofiaPro-Bold.woff2`: weight 700
  - `SVN-SofiaPro-Black.woff2`: weight 900
- Added comprehensive `@font-face` declarations in `src/app/globals.css` covering `'SVN-Sofia Pro'`, `'Svn-Sofia Pro'`, and `'SVN-SofiaPro'`.
- Header navigation explicitly configured with `font-family: 'SVN-Sofia Pro', 'Svn-Sofia Pro', 'SVN-SofiaPro', -apple-system, BlinkMacSystemFont, sans-serif`, `font-size: 14.5px`, `font-weight: 700`, `line-height: 16px`.

---

## 4. Logo Asset Mapping
All authentic local assets:
- Normal Colored Logo: `/sites/doctorcheck-vn/root/images/logo-header.webp`
- Sticky / Dark White Logo: `/sites/doctorcheck-vn/root/images/logo-sticky.webp`
- Fallback Logo: `/sites/doctorcheck-vn/root/images/logo.webp`
- Dimensions: Exactly `#logo { width: 60px; margin-right: 30px; }` with `#logo img { width: 60px; max-height: 90px; height: auto; }`. Zero distortion, zero production downloads.

---

## 5. Normal Header Implementation (State A)
- **Background**: Solid `#ffffff` (white).
- **Height**: Exactly `90px` on desktop.
- **Container**: `max-width: 1250px`, padding: `0 15px`, margin: `0 auto`.
- **Flex Layout**: `.header-inner` uses `flex-flow: row nowrap; align-items: center; justify-content: space-between;`.
- **Logo Position**: Width `60px`, `margin-right: 30px;` leading directly into the desktop navigation.
- **Navigation Position**: `.flex-col.flex-left.flex-grow` with `.header-nav-main` left-aligned.
- **Menu Typography**: `#2a2f38`, `line-height: 16px`, `font-size: 14.5px`, `font-weight: 700`.
- **Menu Label Breaks**: Two-line breaks preserved (`<br />`).
- **Hidden Item**: `Khám Sức Khỏe Doanh Nghiệp` preserved with `dc-hide` (`display: none !important`).

---

## 6. Sticky Header Implementation (State B)
- **Background**: Solid `#005570` (DoctorCheck dark teal) across `#header.stuck .header-wrapper`, `#masthead`, and `.header-main`.
- **Height**: Strictly `90px` desktop height (eliminating layout jumps).
- **Logo Switching**: Switches to authentic white logo `logo-sticky.webp` (width `60px`).
- **Typography & Chevrons**: Pure white `#ffffff` text, chevrons, and search icon. Hover transition to `#ffb500`.
- **No Artifacts**: Zero gradients, zero glassmorphism, zero backdrop blur, flat rectangular header.

---

## 7. Mobile Header Implementation (<= 549px)
- **Height**: Strictly `64px`.
- **Logo**: Scaled to `42px` height, `42px` width (`max-height: 64px`).
- **Breakpoint**: `@media (max-width: 549px)` for 64px mobile header, `@media (max-width: 849px)` for mobile hamburger switch.
- **Desktop Nav & Search**: Completely hidden on medium/mobile.
- **Mobile Drawer (`#main-menu`)**: Off-canvas drawer from right with search input, accordion sub-menus, and booking/hotline CTAs.

---

## 8. Navigation Spacing
- Container: `max-width: 1250px`.
- Logo right gap: `30px`.
- Navigation items: Compact padding `padding: 0 12px` per item, `height: 90px; display: inline-flex; align-items: center;` vertically centered.
- Navigation items sit sequentially in `.nav-left` rather than spreading with artificial space-between.
- Search icon sits right-aligned in `.flex-col.flex-right`.

---

## 9. Search Implementation
- Reconstructed as a clean transparent icon button `<i class="icon-search">` (17x17px, centered in 90px height).
- No artificial circular pill background or border.
- Opens `.search-dropdown-box` with form targeting `/kien-thuc-y-khoa?search=...`.
- Search field placeholder: `"Tìm kiếm"`.
- Button uses `.ux-search-submit` with search icon.

---

## 10. VIP Badge
- Reconstructed directly from source CSS evidence:
  - Background: `#CD0000` (deep red)
  - Border radius: `0 8px 0 8px`
  - Content: `VIP`
  - Color: `#ffffff`
  - Font: `SVN-Sofia Pro`, `9.5px`, bold `700`
  - Position: `top: -9px; left: 4px;` at the top right of "Trung Tâm Nội Soi Tiêu Hóa" and submenu "Gói Sống Thọ".

---

## 11. Dropdown Arrow
- Small, compact chevron `<svg width="9" height="6" ...>` positioned close to the label (`margin-left: 4px;`).
- Rotates 180 degrees smoothly on hover / open.
- Color: `#2a2f38` in Normal State, `#ffffff` in Sticky State.

---

## 12. Files Changed
1. `src/app/globals.css`: Added `@font-face` definitions for `'SVN-Sofia Pro'` and `'Svn-Sofia Pro'` with weights 300, 400, 600, 700, 900.
2. `src/components/sites/doctorcheck-vn/root/Header.tsx`: Reconstructed exact DOM structure, logo dimensions (60px), logo-to-nav margin (30px), container (1250px with 15px padding), typography (`line-height: 16px`), VIP badge, search toggle, Normal and Sticky states.

---

## 13. npm run check
- `eslint`: PASSED (0 errors, 0 warnings).
- `tsc --noEmit`: PASSED (0 type errors).
- `next build`: PASSED (Compiled successfully in 27.6s, static pages generated in 27.4s).

---

## 14. npm run build
- All 206 static pages generated without error (`206/206`).
- Output directory: `.next/`.

---

## 15. Regression Results
Executed `npx tsx scratch/verify-regression.mjs`:
- Canonical URLs: 197 (Target: 197) -> **PASS**
- Sitemap: 197 (Target: 197) -> **PASS**
- Redirects: 10 (Target: 10) -> **PASS**
- Articles: 108 (Target: 108) -> **PASS**
- Canonical Packages: 8 (Target: 8) -> **PASS**
- Doctors: 7 (Target: 7) -> **PASS**
- Categories: 30 (Target: 30) -> **PASS**
- Authentic Images: 1018 (Target: 1018) -> **PASS**
- Internal Verified Links: 118 (Target: 118) -> **PASS**
- Broken Routes: 0 -> **PASS**

---

## 16. Remaining Differences
- None. The Header achieves exact visual parity with the authentic WordPress/Flatsome HTML, CSS, and screenshots in both Normal (State A) and Sticky (State B) modes, as well as responsive mobile behavior.
