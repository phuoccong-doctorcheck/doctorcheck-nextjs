# DOCTORCHECK UI GAPS
## Forensic Comparison: Original WordPress UI vs Existing Next.js Implementation

> **Source Evidence:** `doctorcheck-source/html/homepage.html`, `doctorcheck-source/css/`, `doctorcheck-source/screenshots/desktop/`  
> **Target Codebase:** `src/components/sites/doctorcheck-vn/root/`  
> **Analysis Date:** March 2026  
> **Analysis Mode:** Read-Only Forensic Gap Identification. Zero application source code modifications.

---

## 1. Master UI Gaps Matrix

| Component | Original | Current Next.js | Evidence | Required change | Priority |
|---|---|---|---|---|---|
| **Global Container** | Fixed `max-width: 1250px; padding: 0 15px;` across all sections via `.container` | Inconsistent: mix of `max-w-[1200px]`, `max-w-[1100px]`, `max-w-5xl`, `max-w-3xl`, and `max-w-[1250px]` | `flatsome.css` line 14: `.container, .row { max-width: 1250px; }`; `EquipmentSection.tsx` line 46 (`max-w-[1200px]`), `BenefitsSection.tsx` line 43 (`max-w-[1200px]`) | Standardize all section wrappers to strictly use `max-width: 1250px; padding: 0 15px;` | **P0** |
| **Global Typography / Font** | All headings and body inherit `font-family: 'SVN-Sofia Pro', sans-serif;` with exact weights 300, 400, 600, 700, 900 | Header now uses `SVN-Sofia Pro`, but body sections still use Tailwind default sans-serif font stack in several areas | `app.css` line 30: `@font-face { font-family: 'SVN-Sofia Pro'; ... }`; `HeroSection.tsx`, `PainPointsSection.tsx` lack explicit font declarations | Ensure root `<body>` and all headings/buttons explicitly inherit `'SVN-Sofia Pro'` across all weights | **P0** |
| **Section 2: Concerns & Video (Confuse)** | Single unified `<section id="section_294013533" class="section section-confuse">` containing both 4 concerns (01-04) and YouTube testimonials carousel | Split into two disparate React components: `PainPointsSection` (`#section_294013533`) and `VideoTestimonialsSection` (`#video-testimonials`) | `homepage.html` lines 500–1200; `desktop-homepage-03-confuse.png` & `desktop-homepage-04-video.png` | Reconcile DOM hierarchy so both rows reside inside unified `.section-confuse` with continuous background & `.circle-blur` decoration | **P0** |
| **Section 4: Doctors Section** | Carousel displays 4 doctors on desktop (>1024px) with authentic card framing, qualification badges, and subtle background texture (`doctor-bg-master.webp`) | Custom manual slider showing 3 doctors at a time; card geometry and badge styling differ from `doctor-boxes.css` | `doctor-boxes.css`; `desktop-homepage-06-doctor.png`; `DoctorsSection.tsx` line 9 | Align carousel stage to show 4 items on desktop (280px width), restore exact qualification tag colors (`#ffb500`, `#005570`), and apply background texture | **P0** |
| **Section 6: Services / Pricing Matrix** | 2 Tabs ("Dành Cho Nam" / "Dành Cho Nữ") switching between comprehensive pricing cards with badge, price in `#cd0000`, list of diagnostic exams, and scroll-to-booking CTA | Generic pricing cards using Tailwind grid without authentic Flatsome badge styling or tab indicator pill | `desktop-homepage-08-service.png`; `flatsome-shop.css`; `PricingSection.tsx` lines 18–120 | Reconstruct authentic tab styling (`.nav-tabs`), package badge geometry, and diagnostic feature checkmark bullets | **P0** |
| **Section 5: Facilities & Equipment** | 3x2 Grid of 6 photographic equipment cards with slight hover zoom (`transform: scale(1.04)`) and authentic metadata text | Cards use generic modern Tailwind rounded border card style; spacing and aspect ratios drift from screenshot | `desktop-homepage-07-facilities.png`; `EquipmentSection.tsx` lines 58–90 | Reconstruct exact 3x2 card dimensions, image aspect ratio, typography hierarchy, and subtle hover transition | **P1** |
| **Section 7: Cancer Screening (Suggest Dark)** | Solid deep teal `#005570` background with 2 large feature columns (Thực quản-dạ dày-tá tràng vs Đại tràng-trực tràng) with gold title `#ffb500` | Custom dark section with approximate card padding and modern button styling | `desktop-homepage-09-suggest.png`; `ldp-nsdd.css`; `CancerScreeningSection.tsx` | Align typography weights, gold heading color (`#ffb500`), and exact clinical text line breaks | **P1** |
| **Section 8: Customer Stories** | Testimonial cards with real patient photos (`w=1020,h=536`), quote text, and verification badges | Simplified cards without exact original portrait aspect ratios or quotation mark glyphs | `desktop-homepage-10-customer.png`; `appv3.css`; `CustomerStoriesSection.tsx` | Match exact testimonial card padding, patient portrait framing, and 5-star gold rating layout | **P1** |
| **Section 9: Consultation Form (#tu-van)** | Dark teal `#00475b` background with 2-column layout: left column hotline callout box, right column form with gold button `#ffb500` | Generic form container with mismatched input heights and button styling | `desktop-homepage-11-cta.png`; `BookingSection.tsx` | Match exact input height (45px), placeholder styling, hotline box border, and gold submit button styling | **P1** |
| **Section 3: 5 Benefits (Advanced)** | 2-column layout (7 cols accordion : 5 cols banner); accordion titles bordered with authentic chevron rotation | 12-col grid with 6:6 split (`lg:col-span-6`); uses Lucide Chevron icons instead of authentic Flatsome arrow | `desktop-homepage-05-advanced.png`; `BenefitsSection.tsx` line 54 | Adjust column width ratio to authentic 7:5, match accordion title font size (`18px`) and border colors | **P1** |
| **Section 12 & 13: Footer** | 4-column layout in `#fdfdf6` with official clinic license info, verified badges, and dark bottom bar `#00475b` | Modernized footer layout with Lucide icons (MapPin, Phone, FileText) instead of authentic vector styling | `desktop-homepage-13-footer.png`; `Footer.tsx` | Match authentic footer column widths, logo size, typography (`line-height: 1.8; font-size: 14px;`), and bottom bar `#00475b` | **P1** |
| **Header** | Phase 5B reconstructed exact 90px desktop / 64px mobile, 60px logo, 30px gap, 2-line menu items, `#005570` sticky | Fully reconstructed in Phase 5B. Minor remaining item: ensure sub-menu dropdown hover delay matches Flatsome `.nav-dropdown` | `desktop-homepage-01-header.png`; `Header.tsx` | Verify sub-menu hover delay (0.2s transition) and dropdown shadow | **P2** |
| **Hero Banner** | `section#section_380136169` with strictly mutually exclusive desktop (2560x1038) and mobile (856x1256) banners linking to `#tu-van` | Reconstructed with Next.js `Image` and scoped media query breakpoint at 549px | `desktop-homepage-02-hero.png`; `HeroSection.tsx` | Minor: ensure zero padding top/bottom and full container bleeding matches original | **P2** |
| **Section 10: FAQ Accordion** | Centered 900px wide accordion with 4 authentic clinical questions, subtle border-bottom divider | Full width accordion with Tailwind borders | `desktop-homepage-12-faq.png`; `FaqSection.tsx` | Restrict accordion max-width to centered 900px inside 1250px container | **P2** |
| **Section 11: Promotional Banner CTA** | Full-width slogan banner (`hero-banner-living-long.webp`) positioned directly above footer | Present as `BannerCtaSection`, but margins and padding vary slightly | `homepage.html` `#section_514095607`; `BannerCtaSection.tsx` | Remove extraneous padding to ensure flush banner presentation | **P2** |

---

## 2. Deep Dive: High-Priority Visual Gaps (P0)

### Gap P0-1: Global Container Width Inconsistency
- **Original Source Rule:**
  ```css
  .container, .row {
    max-width: 1250px;
  }
  .container {
    padding-left: 15px;
    padding-right: 15px;
  }
  ```
- **Current Next.js Drift:**
  - `BenefitsSection.tsx`: uses `max-w-[1200px]` with inner `max-w-[1100px]`.
  - `VideoTestimonialsSection.tsx`: uses `max-w-[1200px]` with inner `max-w-5xl`.
  - `EquipmentSection.tsx`: uses `max-w-[1200px]`.
  - `CancerScreeningSection.tsx`: uses `max-w-6xl`.
- **Visual Impact:** Content alignment jumps horizontally when scrolling down the page. Left and right content edges do not line up with the 1250px Header navigation and Footer boundaries.
- **Required Action:** Standardize all section content wrappers to strictly adhere to `max-width: 1250px; padding: 0 15px;`.

### Gap P0-2: Section 2 Structural Fragmentation (`section-confuse`)
- **Original Source Rule:**
  The original website has a single section `#section_294013533` with class `.section.section-confuse`. Inside it:
  - Row 1: Heading ("Tầm Soát Bệnh – Một Khởi Đầu Thông Thái Cho Năm Mới").
  - Row 2: 4 Number Boxes (`col medium-6 large-3`) with background radial blur (`.circle-blur`).
  - Row 3: Heading ("Mời bạn lắng nghe những chia sẻ...").
  - Rows 4–12: Owl Carousel of video testimonials.
- **Current Next.js Drift:**
  The Next.js implementation created two separate `<section>` elements: `PainPointsSection` and `VideoTestimonialsSection` with different background paddings and disparate container widths.
- **Visual Impact:** Breaks the continuous background flow and radial blur transition seen in `desktop-homepage-03-confuse.png` and `desktop-homepage-04-video.png`.
- **Required Action:** Unify or closely bind both sections under the identical background styling, container alignment, and decorative circle-blur pseudo-elements.

### Gap P0-3: Doctor Carousel Geometry & Stage Sizing
- **Original Source Rule:**
  The original doctor carousel displays **4 doctor cards simultaneously on desktop screens (>1024px)** with each card occupying 25% of the 1250px container minus 30px gutters (~280px card width).
- **Current Next.js Drift:**
  `DoctorsSection.tsx` manually slices and renders **3 doctor cards** on desktop in a custom React state carousel, making each card significantly wider than the original WordPress design.
- **Visual Impact:** Doctor cards appear oversized compared to `desktop-homepage-06-doctor.png`.
- **Required Action:** Update desktop viewport rendering to display 4 doctor cards per view, exactly matching the 4-column layout of the original WordPress/Flatsome site.

---

## 3. Recommended Sequential Reconstruction Roadmap

To achieve pixel-level visual fidelity without risking regression, the remaining sections should be reconstructed in this strict order:

1. **Global Tokens & Container Normalization (Phase 5B.1)**
   - Enforce `max-width: 1250px` container and `SVN-Sofia Pro` font across all page sections.
2. **Section 2 Reification: Concerns & Video Testimonials (Phase 5B.2)**
   - Unify `PainPointsSection` and `VideoTestimonialsSection` under authentic `.section-confuse` geometry, 4 number-box cards, and 9-video Shorts carousel.
3. **Section 3: 5 Clinical Benefits Accordion (Phase 5B.3)**
   - Reconstruct 7:5 column ratio, authentic accordion typography, and photographic banner card.
4. **Section 4: Doctors Carousel (Phase 5B.4)**
   - Reconstruct 4-card desktop carousel, authentic doctor card badges, and portrait cropping.
5. **Section 5: Facilities & Equipment Grid (Phase 5B.5)**
   - Reconstruct exact 3x2 photographic equipment grid with authentic card borders and hover zoom.
6. **Section 6: Pricing Matrix (Phase 5B.6)**
   - Reconstruct Nam/Nữ tabs, authentic price tags, and diagnostic inclusion checklists.
7. **Section 7: Cancer Screening Dark Section (Phase 5B.7)**
   - Reconstruct deep teal `#005570` background, gold `#ffb500` headings, and 2-column clinical structure.
8. **Sections 8–11: Customer Stories, CTA Form, FAQ, Banner CTA (Phase 5B.8)**
   - Align testimonials, consultation form inputs, FAQ accordion width, and slogan banner.
9. **Footer Normalization (Phase 5B.9)**
   - Align 4-column layout, license typography, and dark bottom bar.
