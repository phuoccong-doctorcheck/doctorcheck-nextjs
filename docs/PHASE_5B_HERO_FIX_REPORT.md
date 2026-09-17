# Phase 5B Hero Fix Report — Forensic Reconstruction of DoctorCheck Homepage Hero

**Project:** DoctorCheck.vn Next.js Migration  
**Scope:** Homepage Hero (`section-banner` / `#section_380136169`) Forensic Reconstruction Only  
**Safety Protocol:** 100% Local Repository Artifacts — Zero Production Access  
**Status:** **PASS**

---

## 1. Original HTML Structure

From the authoritative WordPress homepage source (`media_1789485002687.txt` / `scratch/sections/01-section-section-banner-section_380136169.html`), the authentic Hero DOM structure is:

```html
<section class="section section-banner" id="section_380136169">
  <div class="section-bg fill"></div>
  <div class="section-content relative">
    <!-- Desktop Banner (2560x1038) -->
    <div class="img has-hover btn-appointment hide-for-small x md-x lg-x y md-y lg-y" id="image_1573834974">
      <div class="img-inner dark">
        <img decoding="async" width="2560" height="1038" 
             src="https://imagedelivery.net/VX_wpsBa_s5hNlg6_mgdXg/428ac6c9-bd35-483e-db56-281930032d00/w=2560,h=1038" 
             class="attachment-original size-original" alt="">
      </div>
      <style>
        #image_1573834974 { width: 100%; }
      </style>
    </div>

    <!-- Mobile Banner (856x1256) -->
    <div class="img has-hover btn-appointment show-for-small x md-x lg-x y md-y lg-y" id="image_1006804480">
      <div class="img-inner dark">
        <img decoding="async" width="856" height="1256" 
             src="https://imagedelivery.net/VX_wpsBa_s5hNlg6_mgdXg/ccd6b033-d84d-4f06-88f2-fa2bd08aaf00/w=856,h=1256" 
             class="attachment-original size-original" alt="">
      </div>
      <style>
        #image_1006804480 { width: 100%; }
      </style>
    </div>
  </div>
  <style>
    #section_380136169 {
      padding-top: 0px;
      padding-bottom: 0px;
    }
  </style>
</section>
```

---

## 2. Original CSS Evidence

The original HTML explicitly embedded the following scoped rules:

1. **Zero Section Padding:**
   ```css
   #section_380136169 {
     padding-top: 0px;
     padding-bottom: 0px;
   }
   ```
2. **Desktop Image Width:**
   ```css
   #image_1573834974 {
     width: 100%;
   }
   ```
3. **Mobile Image Width:**
   ```css
   #image_1006804480 {
     width: 100%;
   }
   ```
4. **No Row Container:**
   - Unlike sections 2 through 13 which enclose their content within `<div class="row ...">` (1250px max-width container), `section-banner` directly places the `.img` inside `.section-content relative`.
   - The hero banner is a 100% full-width element spanning the entire viewport.

---

## 3. Current Implementation Problems

Before this fix, the Hero exhibited severe visual drift:

- **Desktop Drift:**
  - The hero was constrained into an artificial centered card container (~1250px max-width).
  - A large rounded yellow pill background appeared around the hero.
  - The image had artificial padding, margins, and inline-flex alignment.
  - Hovering over the hero caused an unexpected `-2px` translateY jump with an amber color shift.
- **Mobile Drift:**
  - The mobile hero was artificially narrowed with excessive horizontal whitespace.
  - A duplicated yellow rounded wrapper was visible behind the mobile image.
  - The vertical rhythm between the 64px mobile header and the hero was broken.

---

## 4. Root Cause of Each Visual Mismatch

Forensic code audit revealed two distinct root causes in `src/styles/flatsome-core.css`:

1. **Selector Leak on `.btn-appointment`:**
   - In `flatsome-core.css` (lines 293–311), the button rule was defined as:
     ```css
     .btn-appointment,
     .button.secondary.btn-appointment {
       display: inline-flex;
       padding: 12px 28px;
       background-color: var(--dc-gold); /* #FFB500 */
       border-radius: 99px;
       box-shadow: 0 4px 12px rgba(255, 181, 0, 0.25);
       ...
     }
     ```
   - In WordPress, `.btn-appointment` on `<div class="img has-hover btn-appointment">` was purely an event trigger class for appointment consultation scheduling.
   - Because the CSS selector was a bare `.btn-appointment`, it matched the outer `<div>` wrapping the hero banner. Consequently, the hero wrapper was transformed into an inline-flex pill button with a bright gold/yellow background, 99px rounded corners, padding, and drop shadow.
2. **Container Constraint on `.section-content`:**
   - In `flatsome-core.css`, `.section-content` was defined with:
     ```css
     .section-content {
       max-width: var(--container-width); /* 1250px */
       padding-left: var(--gutter-half); /* 15px */
       padding-right: var(--gutter-half);
       margin-left: auto;
       margin-right: auto;
     }
     ```
   - While other sections employ `.row` for container constraints, `section-banner` relies on `.section-content` being unconstrained (`width: 100%`, `max-width: 100%`, `padding: 0`). The global rule forced the banner into a 1250px box with 15px side margins.

---

## 5. Inspection of Actual Image Assets

Both local image assets were inspected directly to ascertain their embedded graphic elements:

| Variant | Asset Path | Dimensions | Graphic Elements Embedded in Image |
| :--- | :--- | :---: | :--- |
| **Desktop** | `/public/sites/doctorcheck-vn/root/images/banner-desktop-master.webp` | 2560 × 1038 | • Gold/yellow rounded frame around quote text<br>• Soft cream gradient curved background<br>• Gold AACI International Accreditation medallion<br>• Multigenerational family portrait |
| **Mobile** | `/public/sites/doctorcheck-vn/root/images/banner-mobile-master.webp` | 856 × 1256 | • Gold/yellow rounded frame around quote text<br>• Soft cream background gradient<br>• Gold AACI medallion<br>• Centered vertical composition of family |

**Critical Finding:** The yellow frame and background are **100% embedded directly inside the photographic master WebP files**. Any CSS yellow background, rounded border, or wrapper was purely duplicative and erroneous.

---

## 6. Files Modified

Only two files were modified to resolve this issue:

1. `src/styles/flatsome-core.css`:
   - Scoped `.btn-appointment` strictly to button elements (`.button.btn-appointment`, `.button.secondary.btn-appointment`, `a.button.btn-appointment`, `button.btn-appointment`).
   - Added explicit reset `.img.btn-appointment { background: transparent !important; border-radius: 0 !important; padding: 0 !important; box-shadow: none !important; display: block !important; }`.
   - Added authentic forensic rules for `.section-banner` and `#section_380136169`.
2. `src/components/sites/doctorcheck-vn/root/HeroSection.tsx`:
   - Preserved authentic Flatsome DOM hierarchy.
   - Enforced `style={{ maxWidth: '100%', padding: 0, margin: 0 }}` on `.section-content relative`.
   - Verified anchor link `href="#tu-van"` for natural booking consultation behavior without visual distortion.

---

## 7. CSS Rules Changed

```css
/* 1. BUTTON SCOPING: Prevent .img elements from becoming yellow pill buttons */
.button.btn-appointment,
.button.secondary.btn-appointment,
a.button.btn-appointment,
button.btn-appointment {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 28px;
  background-color: var(--dc-gold);
  color: var(--dc-navy);
  font-weight: 700;
  font-size: 14px;
  border-radius: 99px;
  border: none;
  cursor: pointer;
  text-decoration: none;
  transition: all 0.25s ease;
  box-shadow: 0 4px 12px rgba(255, 181, 0, 0.25);
  box-sizing: border-box;
}

/* 2. IMAGE CONTAINER RESET */
.img.btn-appointment {
  background: transparent !important;
  border-radius: 0 !important;
  box-shadow: none !important;
  padding: 0 !important;
  display: block !important;
}

/* 3. FORENSIC SECTION-BANNER RULES */
.section-banner,
#section_380136169 {
  position: relative;
  width: 100%;
  padding-top: 0 !important;
  padding-bottom: 0 !important;
  margin: 0;
  background: transparent;
}

.section-banner .section-content {
  position: relative;
  width: 100% !important;
  max-width: 100% !important;
  margin: 0 !important;
  padding: 0 !important;
  z-index: 1;
}

.section-banner .img,
.section-banner .img.btn-appointment {
  position: relative;
  width: 100% !important;
  margin: 0 !important;
  padding: 0 !important;
  background: transparent !important;
  border-radius: 0 !important;
  box-shadow: none !important;
}

#image_1573834974,
#image_1006804480 {
  width: 100% !important;
}

/* 4. STRICT MUTUAL EXCLUSIVITY (Mobile vs Desktop Banners) */
@media (max-width: 549px) {
  #image_1573834974,
  .section-banner .hide-for-small {
    display: none !important;
  }
  #image_1006804480,
  .section-banner .show-for-small {
    display: block !important;
  }
}

@media (min-width: 550px) {
  #image_1006804480,
  .section-banner .show-for-small {
    display: none !important;
  }
  #image_1573834974,
  .section-banner .hide-for-small {
    display: block !important;
  }
}

.section-banner .img-inner {
  position: relative;
  width: 100% !important;
  margin: 0 !important;
  padding: 0 !important;
  overflow: hidden;
  background: transparent !important;
  border-radius: 0 !important;
}

.section-banner .img-inner img {
  width: 100% !important;
  height: auto !important;
  display: block !important;
  aspect-ratio: auto;
}

.section-banner .img.has-hover:hover {
  transform: none !important;
  box-shadow: none !important;
}
```

---

## 8. Desktop Result (1440 × 900, 1280 × 800, 1024 × 768)

- Hero begins immediately below the 90px sticky header (`padding-top: 0px`, `margin-top: 0px`).
- Spans 100% full viewport width without artificial side margins or container bounds.
- Renders the authentic `2560 × 1038` asset with natural aspect ratio (~2.466).
- Zero artificial yellow borders, zero duplicated background shapes, zero 99px rounded corners.
- Zero hover jitter (`transform: none !important`).

---

## 9. Mobile Result (390 × 844, 375 × 812)

- Automatically activates the mobile banner (`show-for-small` at `< 550px`), hiding the desktop banner (`hide-for-small`).
- Uses the authentic `856 × 1256` mobile master asset.
- Spans 100% full viewport width with natural aspect ratio (~0.681), zero clipping, and zero side margin narrowing.
- Begins immediately below the 64px mobile header with no vertical gap.

---

## 10. Regression Verification Results

All Phase 1–4 verified baseline metrics were tested using the automated regression harness:

| Parity Metric | Baseline Target | Post-Fix Verified | Status |
| :--- | :---: | :---: | :---: |
| **Legacy 301 Redirects** | **10** | **10** | **PASS** |
| **Doctor Profiles** | **7** | **7** | **PASS** |
| **Medical Articles** | **108** | **108** | **PASS** |
| **Taxonomy Categories** | **30** | **30** | **PASS** |
| **Canonical Packages** | **8** | **8** | **PASS** |
| **Sitemap URLs** | **197** | **197** | **PASS** |
| **Authentic Images** | **1,018** | **1,018** | **PASS** |
| **Internal Verified Links** | **118** | **118** | **PASS** |
| **TypeScript (tsc --noEmit)** | **0 errors** | **0 errors** | **PASS** |
| **Production Build (npm run build)** | **206 pages** | **206 pages** | **PASS** |

---

## 11. Confirmation: Other Sections Untouched

Per the strict instructions of this phase:
- **section-confuse:** UNTOUCHED
- **section-advanced:** UNTOUCHED
- **section-doctor:** UNTOUCHED
- **section-facilities:** UNTOUCHED
- **section-service:** UNTOUCHED
- **section-suggest:** UNTOUCHED
- **section-customer:** UNTOUCHED
- **section-cta:** UNTOUCHED
- **section-faq:** UNTOUCHED
- **section-banner-cta:** UNTOUCHED
- **footer:** UNTOUCHED
- **Routing / Sitemap / Redirects / Medical Data:** UNTOUCHED

---

## 12. Conclusion & Stop Condition

The DoctorCheck.vn homepage hero reconstruction is now **100% faithful to the authentic WordPress HTML, CSS, and image assets**. All artificial wrappers, yellow cards, rounded corners, and container constraints have been eliminated while preserving 100% regression parity across all previous phases.

**Execution stopped as instructed. Awaiting user review.**
