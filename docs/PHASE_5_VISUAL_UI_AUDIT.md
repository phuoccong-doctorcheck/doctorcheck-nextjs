# PHASE 5 — VISUAL / UI FIDELITY AUDIT

> **Document Code:** `PHASE_5_VISUAL_UI_AUDIT.md`
> **Date:** 2026-09-16
> **Auditor:** Antigravity AI (Claude Opus 4.6)
> **Status:** AUDIT ONLY — NO CODE MODIFIED
> **Scope:** Compare WordPress DoctorCheck.vn original UI against Next.js migration

---

## 1. Executive Summary

The Next.js migration of DoctorCheck.vn demonstrates **high structural fidelity** — the section order, content data, routing, and SEO are faithfully preserved from the WordPress original. However, the visual/UI fidelity reveals **significant divergences** from the Flatsome/UX Builder aesthetic. The Next.js implementation has introduced a **modernized design language** (larger rounded corners, gradient cards, shadcn/ui-influenced spacing, Lucide icon system) that departs from the original Flatsome commercial theme's more compact, traditional medical clinic aesthetic.

**Key Findings:**

- ✅ Font family preserved (SVN-SofiaPro, 5 weights, self-hosted WOFF2)
- ✅ Core brand colors preserved (#00475B teal, #FFB500 gold, #005570 navy)
- ✅ Content data migrated verbatim (108 articles, 7 doctors, 9 packages, 30 categories)
- ✅ Section order on homepage matches WordPress
- ⚠️ Flatsome CSS grid system (`container`, `row`, `col`, UX shortcodes) NOT reconstructed in most sections
- ⚠️ Typography sizes, weights, and spacing differ substantially across templates
- ⚠️ Component visual patterns are redesigned rather than reconstructed
- ⚠️ About page (ve-doctor-check) is the ONLY page with Flatsome-matched CSS
- ❌ Article template is completely redesigned (not reconstructed)
- ❌ Category archive lacks WordPress grid/image card pattern
- ❌ Package detail pages are redesigned with new card/metric patterns
- ❌ Doctor detail pages are redesigned with new layout
- ❌ Mobile sticky bottom bar missing
- ❌ WordPress header CSS classes are replicated in structure but significant visual details differ

**Overall Visual Fidelity Score: ~45-55%**

---

## 2. Available Evidence

### Source Materials Found in Repository

| Evidence Type | Location | Completeness |
| :--- | :--- | :--- |
| **WordPress Architecture Analysis** | `docs/research/doctorcheck-vn/WORDPRESS_ANALYSIS.md` | ✅ Complete |
| **Final Research Report** | `docs/research/doctorcheck-vn/FINAL_RESEARCH_REPORT.md` | ✅ Complete (674 lines) |
| **Responsive Analysis** | `docs/research/doctorcheck-vn/RESPONSIVE_ANALYSIS.md` | ✅ Complete |
| **Asset Inventory** | `docs/research/doctorcheck-vn/ASSET_INVENTORY.md` | ✅ Complete |
| **Navigation Analysis** | `docs/research/doctorcheck-vn/NAVIGATION_ANALYSIS.md` | ✅ Complete |
| **Page Inventory** | `docs/research/doctorcheck-vn/PAGE_INVENTORY.md` | ✅ Complete |
| **URL Migration Plan** | `docs/research/doctorcheck-vn/URL_MIGRATION_PLAN.md` | ✅ Complete |
| **WordPress Flatsome CSS (extracted)** | NOT found as standalone file | ❌ NOT EXTRACTED |
| **WordPress child-theme CSS (doctor-boxes.css, header-ldp.css, kdn.css, appv3.css)** | NOT found | ❌ NOT EXTRACTED |
| **Flatsome UX Block HTML structures** | NOT found as raw HTML | ❌ NOT EXTRACTED |
| **Screenshot references** | `docs/design-references/` directory exists but content unknown | ⚠️ PARTIAL |
| **About page source HTML** | Referenced in user requests as provided HTML source | ✅ Provided in conversation |
| **Header source HTML** | Referenced in user requests as provided HTML source | ✅ Provided in conversation |
| **about-us.css** | `src/components/sites/doctorcheck-vn/about/about-us.css` (915 lines) | ✅ Complete Flatsome reconstruction |

### Critical Evidence Gaps

> [!WARNING]
> **Flatsome parent theme CSS (`flatsome.css`) and child theme CSS modules (`doctor-boxes.css`, `header-ldp.css`, `kdn.css`, `appv3.css`) were NOT extracted/saved into the repository.** This limits the ability to precisely audit pixel-level visual fidelity for sections outside the About page and Header.

---

## 3. WordPress UI Architecture

### Source: `WORDPRESS_ANALYSIS.md` + `FINAL_RESEARCH_REPORT.md`

| Dimension | WordPress Implementation |
| :--- | :--- |
| **Theme** | Flatsome 3.19.8 parent + `doctorcheck` v3.0 child theme |
| **Page Builder** | Flatsome UX Builder with 21 reusable UX Blocks |
| **CSS System** | Flatsome Grid (`container`, `row`, `col`, `small-12`, `large-6`, etc.) + custom child-theme modules |
| **Container Width** | 1200px max-width (Flatsome default) |
| **Grid System** | 12-column flexbox grid with `col.small-12.large-6` pattern |
| **Typography** | SVN-SofiaPro (5 weights: 300, 400, 600, 700, 900) |
| **Icon System** | fl-icons (Flatsome) + dc-icons (Tabler-based custom icon font) |
| **Breakpoints** | Mobile: 375-650px, Tablet: 650-1024px, Desktop: 1024-1400px+ |
| **Spacing** | Flatsome standard: `padding-top/bottom` on sections, 15px column gutters |
| **Colors** | Main: #005570 / #00475B, Accent: #FFB500, Sky: #87E3DB, Tint: #EEF7FA |
| **Sections** | `<section>` wrappers with `section-bg`, `section-content`, inline style padding |
| **Cards** | Flatsome box model with `box-shadow`, `border-radius`, `col-inner` padding |
| **Buttons** | Flatsome `button` shortcodes, typically `border-radius: 99px`, uppercase text |

---

## 4. Next.js UI Architecture

### Source: Direct source code inspection

| Dimension | Next.js Implementation |
| :--- | :--- |
| **Framework** | Next.js 16 (App Router, RSC, TypeScript strict) |
| **Styling** | Tailwind CSS v4 + shadcn/ui base-nova + inline Tailwind utilities |
| **Container Width** | `max-w-[1200px]` or `max-w-[1250px]` (varies per section) |
| **Grid System** | Tailwind `grid grid-cols-*` and `flex` utilities |
| **Typography** | SVN-SofiaPro (5 weights, self-hosted) ✅ Matches |
| **Icon System** | Lucide React (NOT fl-icons or dc-icons) |
| **Breakpoints** | Tailwind defaults: `sm:640px`, `md:768px`, `lg:1024px`, `xl:1280px` |
| **Spacing** | Tailwind utilities: `py-14 md:py-20`, `px-4 sm:px-6`, `gap-6`, `gap-8` |
| **Colors** | Design tokens in globals.css matching WordPress palette |
| **Sections** | `<section>` with Tailwind bg/py classes |
| **Cards** | Tailwind `rounded-[24px]`, `rounded-2xl`, `shadow-xl`, `border` |
| **Buttons** | Tailwind `rounded-xl`, `font-bold`, various bg/text color combos |
| **CSS Architecture** | globals.css (124 lines) + about-us.css (915 lines, Flatsome-matched) + Header.tsx inline `<style>` (Flatsome-matched) |

---

## 5. Visual Component Inventory

| Component | WordPress Implementation | Next.js Implementation | Similarity | Missing Behavior/CSS | Severity |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **TopBar** | Custom HTML in header template, Flatsome utility bar | `TopBar.tsx` with Tailwind utilities, Lucide icons | ~60% | WordPress likely used fl-icons, different spacing/typography. Exact WordPress CSS NOT ENOUGH EVIDENCE | P3 |
| **Header/Navbar** | Flatsome sticky header with `.header-main`, `.header-inner`, `.flex-row`, `.container`, `.logo-left`, UX Builder nav | `Header.tsx` (1184 lines) with Flatsome CSS class names preserved + inline `<style>` block (~300 lines) | ~75% | Close replication of Flatsome header structure with CSS class names and dropdown behavior. Desktop nav matches well. Mobile drawer is reimplemented. | P2 |
| **Hero Banner** | Full-width banner image linked to booking, desktop/mobile variants via Flatsome `[ux_banner]` | `HeroSection.tsx` with `<Image>` with `aspect-[2560/1038]` desktop, `aspect-[856/1256]` mobile | ~80% | Good structural match. Image presentation similar. Missing: overlay text/CTAs if WordPress had them on banner | P3 |
| **PainPoints ("4 Noi Lo")** | Flatsome section with background gradient, `.dc-title` decorator, 4 cards in 2x2 grid + video carousel | `PainPointsSection.tsx` (234 lines) with Tailwind grid, embedded YouTube carousel | ~55% | Cards are redesigned. WordPress had structured click-to-reveal cards; Next.js uses a simplified carousel with YouTube iframes. | P1 |
| **Video Testimonials** | Flatsome slider/carousel with multiple video thumbnail cards | Merged into `PainPointsSection.tsx` (returns null separately) | ~50% | Carousel behavior differs from Flatsome Owl Carousel | P2 |
| **Benefits ("5 Quyen Loi")** | Flatsome accordion + sidebar banner image, 2-column layout | `BenefitsSection.tsx` with Accordion left + YouTube video right, 12-col grid | ~60% | Accordion style differs. Right column uses YouTube video modal instead of static banner image. | P2 |
| **Doctors Carousel** | Flatsome slider with 4 visible doctor cards, navigation arrows | `DoctorsSection.tsx` with Custom carousel with `slice` logic, 4 visible cards | ~55% | Card design completely different from `doctor-boxes.css` pattern | P2 |
| **Equipment Grid** | Flatsome 3x2 grid with equipment images + descriptions in UX Builder boxes | `EquipmentSection.tsx` with Tailwind `grid-cols-3` with card pattern | ~60% | Card design modernized with rounded-2xl, shadow-sm | P3 |
| **Pricing Matrix** | Flatsome tabs + WooCommerce product cards, popular elevated | `PricingSection.tsx` with Gender tabs + 3-column grid, popular card elevated | ~65% | Tab switcher redesigned (pill tabs vs Flatsome tabs) | P2 |
| **Cancer Screening** | Flatsome 2-column cards for Da Day and Dai Trang | `CancerScreeningSection.tsx` with 2 cards with Lucide icons, gradient background | ~50% | Cards completely redesigned from Flatsome pattern | P2 |
| **Customer Stories** | Flatsome section with narrative testimonial cards | `CustomerStoriesSection.tsx` (4078 bytes) | NOT ENOUGH EVIDENCE | Cannot compare without seeing WordPress source HTML | P2 |
| **FAQ Accordion** | Flatsome `[accordion]` shortcode with specific expand/collapse behavior | `FaqSection.tsx` with Custom accordion with rounded-2xl cards | ~55% | Visual style differs from Flatsome accordion | P3 |
| **Booking Form** | Contact Form 7 plugin with Flatsome styling | `BookingSection.tsx` (307 lines) with Gradient dark background, 2-column layout | ~45% | Completely redesigned with glassmorphism gradient | P1 |
| **Footer** | Flatsome 4-column footer with grid layout | `Footer.tsx` with 12-column grid (4+3+2+3), dark background | ~60% | Footer links use anchor links instead of page URLs | P2 |
| **Floating Widgets** | Zalo widget (bottom-right), phone dialer, back-to-top | `FloatingWidgets.tsx` with Zalo + Phone + ScrollTop, fixed position | ~70% | Missing: mobile sticky bottom contact bar | P2 |
| **Mobile Bottom Bar** | Persistent bottom contact bar with phone + Zalo + booking on mobile | NOT IMPLEMENTED | 0% | Completely missing from Next.js | P1 |
| **About Page** | Flatsome UX Builder page with gallery, video, timeline, booking form | `AboutUsPage.tsx` (1278 lines) + `about-us.css` (915 lines, Flatsome-matched) | ~80% | Best visual fidelity. Has dedicated Flatsome-matched CSS | P3 |

---

## 6. Homepage Audit

### Section-by-Section Deep Audit

#### 6.1 TopBar

| Aspect | WordPress Original | Next.js | Difference | Severity |
| :--- | :--- | :--- | :--- | :--- |
| Background | Dark teal, likely `#003848` or similar | `bg-[#003848]` | Minimal | P3 |
| Content | Working hours, address, hotline, license | Same content from `CLINIC_INFO` | ✅ Match | — |
| Icons | fl-icons or dc-icons glyphs | Lucide `Clock`, `MapPin`, `Phone` | Different icon set | P3 |
| Visibility | Hidden on mobile (Flatsome `show-for-medium`) | `hidden md:block` | Flatsome breakpoint is `850px`, Tailwind md is `768px` | P3 |

#### 6.2 Header/Navigation

| Aspect | WordPress Original | Next.js | Difference | Severity |
| :--- | :--- | :--- | :--- | :--- |
| Structure | Flatsome `.header-wrapper` > `.header-main` > `.header-inner.container` | Same class structure preserved in JSX | ✅ Close match | — |
| CSS | Flatsome `flatsome.css` + child `header-ldp.css` | Inline `<style>` block (~300 lines) in Header.tsx | Reconstructed, not identical | P2 |
| Logo | 3 variants (normal/sticky/dark) using Cloudflare Images | 3 `<img>` tags with local WebP files | ✅ Match | — |
| Desktop Nav | 7 parent items with dropdown menus | Fully implemented with hover/click dropdowns | ~80% match | P3 |
| Sticky behavior | Scroll threshold, class toggle `stuck is-sticky` | `scrollY > 90`, className toggle | ✅ Close match | — |
| Mobile Menu | Off-canvas slide-in drawer | Custom side drawer with accordion sub-menus | ~70% (different animation/styling) | P2 |

#### 6.3 Hero Banner

| Aspect | WordPress Original | Next.js | Difference | Severity |
| :--- | :--- | :--- | :--- | :--- |
| Desktop image | Full-width banner from Cloudflare Images | Local WebP at `banner-desktop-master.webp` | ✅ Same image, local hosting | — |
| Mobile image | Separate mobile banner | Local WebP at `banner-mobile-master.webp` | ✅ Same approach | — |
| Breakpoint | Flatsome responsive show/hide (likely 850px) | `hidden sm:block` / `block sm:hidden` (640px) | Different mobile/desktop switch point | P3 |

#### 6.4 PainPoints + Video Section

| Aspect | WordPress Original | Next.js | Difference | Severity |
| :--- | :--- | :--- | :--- | :--- |
| Layout | H1 + H2 subtitle + 4 concern cards + video carousel | Combined section with title + 4 clickable items + 3-video carousel | Similar structure, different visual treatment | P1 |
| Title | H1 at `1.7rem` with `.dc-title.bluesky` decoration | H1 at `1.7rem` with `.dc-title.bluesky` + underline dots | ✅ Title decoration replicated | P3 |
| Background | `linear-gradient(180deg, #E9F9FF 5.15%, ...)` | Matching inline `background` gradient | ✅ Match | — |
| Pain cards | 4 structured cards in 2x2 grid | 4 items as interactive buttons controlling video carousel | Card design differs significantly | P1 |

#### 6.5 Benefits Section ("5 Quyen Loi")

| Aspect | WordPress Original | Next.js | Difference | Severity |
| :--- | :--- | :--- | :--- | :--- |
| Layout | 2-column: accordion left, promotional image right | 2-column: accordion left, YouTube video right | Right column content differs | P2 |
| Background | `#FDFDF6` or similar warm cream | `bg-[#FDFDF6]` | ✅ Match | — |
| Accordion | Flatsome `[accordion]` shortcode | Custom accordion with active left indicator bar | ~55% similar | P2 |

#### 6.6 Doctors Section

| Aspect | WordPress Original | Next.js | Difference | Severity |
| :--- | :--- | :--- | :--- | :--- |
| Card design | WordPress `doctor-box` CSS from `doctor-boxes.css` | Rounded card with gradient overlay at bottom | Card design completely different | P1 |
| Navigation | Flatsome carousel arrows | Custom Lucide `ChevronLeft`/`ChevronRight` icons | Different arrow styling | P3 |

#### 6.7 Equipment Section

| Aspect | WordPress Original | Next.js | Difference | Severity |
| :--- | :--- | :--- | :--- | :--- |
| Layout | 3x2 grid of equipment cards | `grid-cols-3` with rounded cards | ✅ Similar grid | — |
| Card style | Flatsome box with image, title, description | Card with `rounded-2xl`, `shadow-sm`, hover effects | Card style modernized | P3 |

#### 6.8 Pricing Section

| Aspect | WordPress Original | Next.js | Difference | Severity |
| :--- | :--- | :--- | :--- | :--- |
| Tab switcher | Flatsome tabs (Nu/Nam) | Pill-shaped tab group with `rounded-full`, 3 tabs | Different tab UI pattern | P2 |
| Card layout | 3 columns, popular elevated `-10px` with gold border | 3 columns, popular with `lg:-translate-y-2.5` and ring | Similar concept, different implementation | P2 |

#### 6.9 Cancer Screening Section

| Aspect | WordPress Original | Next.js | Difference | Severity |
| :--- | :--- | :--- | :--- | :--- |
| Layout | NOT ENOUGH EVIDENCE for exact layout | 2-column card grid with icon headers | Cannot compare | P2 |

#### 6.10 FAQ Section

| Aspect | WordPress Original | Next.js | Difference | Severity |
| :--- | :--- | :--- | :--- | :--- |
| Accordion | Flatsome `[accordion]` shortcode | Custom accordion with `rounded-2xl` containers | Different visual treatment | P3 |
| Expand indicator | Flatsome default (likely +/- or arrow) | Circular ChevronDown with rotation animation | Different expand UI | P3 |

#### 6.11 Booking Form Section

| Aspect | WordPress Original | Next.js | Difference | Severity |
| :--- | :--- | :--- | :--- | :--- |
| Background | NOT ENOUGH EVIDENCE for exact background | Dark gradient with glow shapes | Likely redesigned | P1 |
| Form styling | CF7 + Flatsome form CSS | Glassmorphism-styled form with `backdrop-blur` | Completely redesigned visually | P1 |

---

## 7. Article Audit

| Aspect | WordPress Original | Next.js | Difference | Severity |
| :--- | :--- | :--- | :--- | :--- |
| **Container width** | Flatsome default likely ~900-1000px | `max-w-[1000px]` | Likely similar | P3 |
| **Category badge** | WordPress category link, Flatsome styling | Pill badge with `rounded-full bg-[#00475B]/10` | Redesigned | P2 |
| **Featured image** | WordPress featured image, Flatsome sizing | `rounded-2xl` with `aspect-[16/9]`, `shadow-sm` | Border radius differs (WP likely 0 or small) | P2 |
| **Clinical evidence box** | NOT present in WordPress | `ContentCallout` component added | ❌ New element not in original | P2 |
| **Content body** | WordPress post content with Flatsome typography | `ArticleContent` with `prose prose-slate` Tailwind typography | Typography system differs | P1 |
| **H2 style** | WordPress/Flatsome H2 | `border-l-4 border-[#00A896] pl-3` left-border style | ❌ Left border NOT in WordPress original | P2 |
| **Image styling** | WordPress/Flatsome default (likely square corners) | `rounded-2xl shadow-sm mx-auto` | ❌ Rounded corners NOT in original | P2 |
| **Sidebar** | WordPress article sidebar (likely present in Flatsome) | ❌ NO SIDEBAR | Sidebar completely missing | P1 |

---

## 8. Category Audit

| Aspect | WordPress Original | Next.js | Difference | Severity |
| :--- | :--- | :--- | :--- | :--- |
| **Header section** | WordPress category archive header | Gradient header with `BookOpen` icon badge | Redesigned | P2 |
| **Article grid** | 2-3 columns with featured images | 3-column with text-only cards (NO featured images) | ❌ Missing featured images | P1 |
| **Article card** | Post card with image + title + excerpt + date | Text card with title + date, no image, no excerpt | Significantly simplified | P1 |
| **Pagination** | WordPress pagination for multi-page archives | ❌ NO PAGINATION | Missing | P2 |

---

## 9. Package Audit

| Aspect | WordPress Original | Next.js | Difference | Severity |
| :--- | :--- | :--- | :--- | :--- |
| **Layout** | WooCommerce product page with Flatsome template | Custom 12-col grid: 8 info + 4 price sidebar | Redesigned layout | P2 |
| **Hero** | WooCommerce product header, likely simpler | Gradient hero with badges, metrics cards, price sidebar | Significantly redesigned | P1 |
| **Feature list** | WooCommerce product features/tabs | Numbered grid with `rounded-xl` items | Redesigned | P2 |

---

## 10. Doctor Audit

| Aspect | WordPress Original | Next.js | Difference | Severity |
| :--- | :--- | :--- | :--- | :--- |
| **Layout** | Custom `doctor` CPT template with Flatsome styling | 12-col grid: 4 avatar + 8 bio | Redesigned | P2 |
| **Avatar** | Doctor portrait, likely in Flatsome box | `rounded-2xl` with gradient overlay, `border-4 border-white` | Redesigned card | P2 |
| **Credentials** | Doctor details in Flatsome layout | Detailed credential list with Lucide icons | Enhanced | P3 |

---

## 11. Static Page Audit

| Aspect | WordPress Original | Next.js | Difference | Severity |
| :--- | :--- | :--- | :--- | :--- |
| **About page** | Flatsome UX Builder page with gallery, timeline | `AboutUsPage.tsx` (1278 lines) + `about-us.css` (915 lines) | ✅ BEST fidelity (~80%) | P3 |
| **Contact page** | WordPress contact page with map + CF7 form | Custom 3-card layout + RichText | Redesigned with info cards | P2 |
| **Generic pages** | Flatsome full-width content pages | `PageTemplate.tsx` with gradient header + RichText | Added gradient hero header not in original | P2 |
| **Content rendering** | WordPress shortcodes rendered to HTML | `RichText` with `dangerouslySetInnerHTML` + Tailwind prose | Flatsome shortcode classes may not render correctly | P1 |

---

## 12. Endoscopy Hub Audit

| Aspect | WordPress Original | Next.js | Difference | Severity |
| :--- | :--- | :--- | :--- | :--- |
| **Route** | `/trung-tam-noi-soi-tieu-hoa-doctor-check/` with 18 nested pages | Same route structure with `[...subpath]` catch-all | ✅ Route match | — |
| **Page template** | Flatsome UX Builder with specialty content | Renders via `PageTemplate` with `RichText` | NOT ENOUGH EVIDENCE for visual comparison | P2 |
| **Visual fidelity** | Flatsome layouts, UX blocks, medical diagrams | Generic page template with prose styling | Likely significant visual loss | P1 |

---

## 13. Responsive Audit

| Breakpoint | WordPress (Flatsome) | Next.js (Tailwind) | Difference | Severity |
| :--- | :--- | :--- | :--- | :--- |
| **Mobile Small** | 375px - 650px | < 640px (`sm` breakpoint) | Tailwind `sm` at 640px vs Flatsome 650px | P3 |
| **Tablet Portrait** | 650px - 820px | 640px - 768px | Different range | P3 |
| **Tablet Landscape** | 820px - 1024px | 768px - 1024px | Different range | P3 |
| **Desktop** | 1024px - 1400px | 1024px - 1280px | Different upper bound | P3 |

### Responsive Behavior Comparison

| Feature | WordPress | Next.js | Status |
| :--- | :--- | :--- | :--- |
| **Mobile menu** | Off-canvas slide-in drawer | Side drawer with accordion sub-menus | ✅ Implemented (different styling) |
| **Mobile bottom bar** | Persistent bottom contact bar (phone + Zalo + booking) | ❌ NOT IMPLEMENTED | **P1 MISSING** |
| **Hero mobile** | Separate mobile banner image | Separate mobile banner with `block sm:hidden` | ✅ Implemented |
| **Cards stacking** | Single column on mobile | Tailwind responsive grid | ✅ Implemented |

---

## 14. Typography Audit

| Property | WordPress (SVN-SofiaPro) | Next.js | Match |
| :--- | :--- | :--- | :--- |
| **Font family** | SVN-SofiaPro, 5 weights (300, 400, 600, 700, 900) | SVN-SofiaPro, 5 weights (300, 400, 600, 700, 900) | ✅ Exact match |
| **Font hosting** | Self-hosted at `/wp-content/themes/doctorcheck/assets/fonts/` | Self-hosted at `/sites/doctorcheck-vn/fonts/` | ✅ Match |
| **Font loading** | `font-display: swap` via WP/Perfmatters | `font-display: swap` in `@font-face` | ✅ Match |
| **Heading weights** | Likely `700` (Bold) or `900` (Black) for headings | Mix of `font-bold` (700), `font-extrabold` (800), `font-black` (900) | `font-extrabold` (800) NOT in SVN-SofiaPro |

> [!WARNING]
> **Critical Issue:** `font-extrabold` (weight 800) is used extensively in Next.js headings, but SVN-SofiaPro only has weights 300, 400, 600, 700, 900. Weight 800 does not exist and will be synthesized by the browser.

---

## 15. Color Audit

| Token | WordPress | Next.js | Match |
| :--- | :--- | :--- | :--- |
| **Primary (Main)** | `#005570` (headings, nav) | `--color-main: #00475B` / `--primary: #00475B` | ⚠️ **DIFFERENT** — WordPress uses `#005570`, Next.js uses `#00475B` interchangeably |
| **Secondary (Accent)** | `#FFB500` (CTAs, highlights) | `--color-second: #FFB500` / `--accent: #FFB500` | ✅ Match |
| **Sky** | `#87E3DB` | `--blue-sky: #87E3DB` / `--color-dc-sky: #87E3DB` | ✅ Match |
| **Background Tint** | `#EEF7FA` | `--bg-cyan: #EEF7FA` / `--color-dc-tint: #EEF7FA` | ✅ Match |
| **Text** | `#2A2F38` (base text) | `--base-text-color: #2A2F38` / `--foreground: #2A2F38` | ✅ Match |
| **Footer bg** | Dark teal, exact hex NOT ENOUGH EVIDENCE | `bg-[#002D3A]` | Cannot confirm match |

> [!IMPORTANT]
> **Color Discrepancy:** The Next.js codebase uses `#00475B` and `#005570` interchangeably as "primary" colors. WordPress `about-us.css` uses `--color-main: #005570` while `globals.css` uses `--primary: #00475B`. These are different colors.

---

## 16. Spacing / Dimension Audit

| Dimension | WordPress (Flatsome) | Next.js | Match |
| :--- | :--- | :--- | :--- |
| **Container max-width** | 1200px consistently | `max-w-[1200px]`, `max-w-[1250px]`, `max-w-[1220px]`, `max-w-[1100px]`, `max-w-[900px]`, `max-w-[1000px]` | ⚠️ **Inconsistent** |
| **Column gutter** | 15px padding (30px total) | `gap-6` (24px), `gap-8` (32px), `gap-10` (40px) | ❌ Different |
| **Section padding** | Inline `padding: 30px` | `py-14 md:py-20` (56px / 80px) | ❌ **Much larger** |
| **Page horizontal padding** | 15px column gutters | `px-4 sm:px-6` (16px / 24px) | ⚠️ Close but different |
| **Card border-radius** | Flatsome default (likely 0-8px) | `rounded-2xl` (16px), `rounded-3xl` (24px) | ❌ **Much larger** |
| **Card padding** | Flatsome `col-inner` (15px default) | `p-6` (24px), `p-7` (28px), `p-8` (32px) | ❌ **Larger** |

---

## 17. Image Presentation Audit

| Aspect | WordPress | Next.js | Match |
| :--- | :--- | :--- | :--- |
| **CDN source** | Cloudflare Images (`imagedelivery.net/`) | Mix of local WebP + remote Cloudflare via `next.config.ts` | ⚠️ Mixed |
| **Image optimization** | Cloudflare dynamic resizing | Next.js `<Image>` with automatic optimization | Different technology, similar result |
| **Border radius** | Flatsome default (likely `0` or very small) | `rounded-2xl` (16px) on article images, doctor avatars | ❌ Inconsistent with WordPress |
| **Lazy loading** | WordPress native + WP Rocket | Next.js automatic lazy loading + `priority` on hero | ✅ Similar |
| **Shadow** | NOT ENOUGH EVIDENCE | `shadow-sm`, `shadow-xl` on image containers | Likely NOT in WordPress |

---

## 18. Interaction Audit

| Interaction | WordPress | Next.js | Status |
| :--- | :--- | :--- | :--- |
| **Sticky header** | Flatsome sticky with class toggle at scroll | Custom `useEffect` with `scrollY > 90` | ✅ Implemented |
| **Desktop dropdown menus** | Flatsome hover + click dropdown | Custom hover/click with `openSubMenu` state | ✅ Implemented (different animation) |
| **Mobile drawer** | Flatsome off-canvas slide drawer | Custom side drawer with close button | ✅ Implemented (different animation) |
| **Tab switcher** | Flatsome tabs or WooCommerce tabs | Custom `useState` with pill tab buttons | ✅ Implemented (different UI) |
| **FAQ accordion** | Flatsome `[accordion]` shortcode | Custom accordion with `openId` state | ✅ Implemented (different styling) |
| **Video modal** | YouTube embed in Flatsome lightbox | `VideoModal.tsx` with portal overlay | ✅ Implemented (different UI) |
| **Booking form** | Contact Form 7 AJAX submission | Custom `fetch('/api/booking')` with Zod validation | ✅ Implemented |
| **Zalo chat** | Zalo SDK widget (`OA ID 309834292180920772`) | Custom floating button with Zalo URL link | ⚠️ No SDK integration |
| **Gallery slider** | Only on About page with Flatsome gallery | Custom gallery with tab filters + slide navigation | ✅ Implemented on About page |
| **Owl Carousel** | Video testimonials carousel | Custom carousel with index-based sliding | Different technology |
| **Hover effects** | Flatsome default hover (box-shadow, color change) | Tailwind `hover:shadow-xl`, `hover:-translate-y-1` | More aggressive hover animations |

---

## 19. Flatsome / UX Builder Fidelity Audit

### Critical Finding

> [!CAUTION]
> The only component that faithfully reconstructs the Flatsome CSS grid system is the **About page** (`AboutUsPage.tsx` + `about-us.css`). All other sections use Tailwind CSS utilities that produce a **modernized, redesigned** appearance rather than a pixel-level reconstruction.

### Flatsome Pattern Reconstruction Status

| Flatsome Pattern | About Page | Homepage Sections | Article Template | Other Templates |
| :--- | :--- | :--- | :--- | :--- |
| `.container` (1200px) | ✅ Preserved | ❌ `max-w-[1200px]` (close) | ❌ `max-w-[1000px]` | ❌ Various max-widths |
| `.row` (flex, -15px margin) | ✅ Preserved in CSS | ❌ Not used | ❌ Not used | ❌ Not used |
| `.col` (15px padding) | ✅ Preserved in CSS | ❌ Not used | ❌ Not used | ❌ Not used |
| `.small-12` / `.large-6` | ✅ Preserved in CSS | ❌ Tailwind `grid-cols-*` | ❌ Not used | ❌ Not used |
| `.section-bg` / `.section-content` | ✅ Preserved | ⚠️ Partially in PainPoints/Hero | ❌ Not used | ❌ Not used |

### Simplification Patterns Detected

1. **Doctor cards:** WordPress had dedicated `doctor-boxes.css`. Next.js uses generic Tailwind cards.
2. **Video testimonial cards:** WordPress had Flatsome slider with styled thumbnails. Next.js uses raw YouTube iframes.
3. **Category archive cards:** WordPress had image+text cards. Next.js has text-only cards without featured images.
4. **Package pages:** WooCommerce product template. Next.js has redesigned hero with metric cards.
5. **Booking form:** CF7 with Flatsome form CSS. Next.js has glassmorphism-themed dark gradient section.
6. **Article content:** Flatsome typography + WordPress editor styles. Next.js uses Tailwind `prose` plugin.

---

## 20. Visual Score

### Scoring Methodology

Scores are based on layout structure match, visual styling match, component pattern match, typography match, content fidelity, and interaction fidelity. Where evidence is insufficient, scores are conservative (lower bound).

| Area | Score | Notes |
| :--- | :--- | :--- |
| **Header** | **70%** | Closest reconstruction. Uses Flatsome class names + CSS. Mobile drawer differs. |
| **Homepage (overall)** | **55%** | Section order preserved. Individual section styling significantly differs. |
| **Article** | **40%** | Completely redesigned template. Sidebar missing. Typography system different. |
| **Category** | **35%** | Missing featured images. Text-only cards. No pagination. |
| **Package** | **40%** | Redesigned with new hero/metric pattern not in WordPress. |
| **Doctor** | **45%** | Layout redesigned. Card styling completely different from `doctor-boxes.css`. |
| **Static pages** | **55%** | About page at ~80% (best fidelity). Generic pages at ~40%. |
| **Endoscopy Hub** | **40%** | Generic page template, likely loses Flatsome UX Builder layouts. |
| **Mobile** | **50%** | Core responsive implemented but mobile bottom bar missing. Breakpoints differ. |
| **Typography** | **70%** | Same font family. Weights partially mismatched (`font-extrabold` 800 not available). |
| **Components** | **50%** | Functional equivalents exist but visual patterns are redesigned. |
| **Overall** | **~50%** | Content fidelity high (90%+). Visual fidelity moderate (45-55%). |

---

## 21. Issues

### P0 — Critical (UI Broken)

_None identified. Website is functional and usable._

### P1 — Major (Significant Visual Divergence)

| ID | Component | Issue |
| :--- | :--- | :--- |
| P1-01 | **Mobile Bottom Bar** | WordPress has a persistent mobile bottom contact bar. Completely missing from Next.js. |
| P1-02 | **Category Archive** | Article cards lack featured images. WordPress had image+text cards. |
| P1-03 | **Article Template** | Sidebar completely missing. Article layout is single-column only. |
| P1-04 | **Booking Section** | Completely redesigned with glassmorphism gradient. WordPress CF7 form had standard styling. |
| P1-05 | **Doctor Card Design** | Doctor cards use generic Tailwind styling instead of `doctor-boxes.css` patterns. |
| P1-06 | **PainPoints Section** | 4 concern cards redesigned as interactive carousel triggers instead of 2x2 info cards. |
| P1-07 | **Endoscopy Hub Pages** | Complex Flatsome UX Builder layouts reduced to generic RichText rendering. |

### P2 — Moderate (Component/Style Differences)

| ID | Component | Issue |
| :--- | :--- | :--- |
| P2-01 | **Tailwind Prose Typography** | Article content uses Tailwind `prose` plugin instead of Flatsome typography. H2 has non-original `border-l-4`. |
| P2-02 | **Video Testimonials** | YouTube iframes displayed instead of styled thumbnail cards with play overlays. |
| P2-03 | **Benefits Accordion** | Visual styling differs from Flatsome `[accordion]` pattern. |
| P2-04 | **Pricing Tab Switcher** | Pill-shaped tab group differs from Flatsome tab pattern. |
| P2-05 | **Mobile Menu** | Side drawer animation/styling differs from Flatsome off-canvas drawer. |
| P2-06 | **Footer Links** | Footer uses `#pricing`, `#doctors` anchor links instead of actual page URLs. |
| P2-07 | **Category Pagination** | No pagination implemented for category archives. |
| P2-08 | **Contact Page** | Redesigned with 3-card info layout not in WordPress. |
| P2-09 | **Package Detail** | Hero section redesigned with metric cards not matching WooCommerce template. |
| P2-10 | **Page Template Header** | Generic gradient hero header added to all pages not in WordPress. |
| P2-11 | **Cancer Screening Section** | Icon-based cards instead of likely image-heavy WordPress cards. |
| P2-12 | **About Page Route** | Route `ve-doctor-check` exists but may conflict with `ve-chung-toi`. |
| P2-13 | **Clinical Evidence Box** | New element added to articles that does not exist in WordPress. |

### P3 — Minor (Spacing/Color/Font Details)

| ID | Component | Issue |
| :--- | :--- | :--- |
| P3-01 | **Breakpoint Mismatch** | Tailwind breakpoints (640/768/1024/1280) differ from Flatsome (650/850/1024/1400). |
| P3-02 | **Container Width Inconsistency** | Different max-widths per section vs WordPress consistent 1200px. |
| P3-03 | **Section Vertical Padding** | Next.js `py-14 md:py-20` is much larger than WordPress `padding: 30px`. |
| P3-04 | **Card Border Radius** | `rounded-2xl` (16px) and `rounded-3xl` (24px) much larger than WordPress (0-8px). |
| P3-05 | **font-extrabold Usage** | Weight 800 NOT in SVN-SofiaPro weight set (300/400/600/700/900). |
| P3-06 | **Primary Color Inconsistency** | `#00475B` and `#005570` used interchangeably. |
| P3-07 | **Icon System** | Lucide React icons replace fl-icons and dc-icons throughout. |
| P3-08 | **Gap vs Gutter** | Tailwind `gap-6/8/10` (24-40px) differs from Flatsome 30px column gutters. |
| P3-09 | **Hero Breakpoint** | `sm:640px` for banner switch vs Flatsome ~850px. |
| P3-10 | **Hover Animations** | More aggressive hover effects than Flatsome defaults. |

---

## 22. Recommended Fix Order

### Phase 5a — Critical Fixes (P1)

1. **P1-01: Mobile Bottom Bar** — Implement persistent mobile bottom contact bar
2. **P1-02: Category Archive Images** — Add featured image thumbnails to category article cards
3. **P1-03: Article Sidebar** — Research if WordPress had sidebar, add if confirmed
4. **P1-04: Booking Section** — Reconstruct closer to WordPress CF7 form styling
5. **P1-05: Doctor Cards** — Reconstruct `doctor-boxes.css` card pattern
6. **P1-06: PainPoints Cards** — Reconstruct 2x2 card grid matching Flatsome layout
7. **P1-07: Endoscopy Hub** — Audit and reconstruct UX Builder layouts for endoscopy pages

### Phase 5b — Component Fixes (P2)

8. **P2-01: Article Typography** — Remove non-original `border-l-4` on H2, `rounded-2xl` on images
9. **P2-02: Video Testimonials** — Implement thumbnail cards with play button overlay
10. **P2-06: Footer Links** — Replace anchor links with actual page URLs
11. **P2-07: Category Pagination** — Implement pagination
12. **P2-10: Page Template** — Remove non-original gradient hero header
13. **P2-13: Clinical Evidence Box** — Consider removing if not in original

### Phase 5c — Polish (P3)

14. **P3-02: Container Widths** — Standardize to 1200px matching Flatsome
15. **P3-03: Section Padding** — Reduce vertical padding to match Flatsome values
16. **P3-04: Border Radius** — Reduce rounded corners to match WordPress (0-8px)
17. **P3-05: font-extrabold** — Replace with `font-bold` (700) or `font-black` (900)
18. **P3-06: Color Standardization** — Decide between `#00475B` and `#005570` for primary
19. **P3-08: Gutter System** — Adjust gap values to match Flatsome 30px column gutters

---

## 23. Final Verdict

### CONDITIONAL PASS — Significant Visual Rework Required

**Content Fidelity:** ✅ **HIGH** (~90%)
- All 108 articles, 7 doctors, 9 packages, 30 categories migrated
- Data accuracy preserved
- Internal links normalized
- SEO metadata intact

**Structural Fidelity:** ✅ **HIGH** (~85%)
- Routing architecture matches WordPress
- Section order on homepage matches
- Template hierarchy established
- Booking API functional

**Visual Fidelity:** ⚠️ **MODERATE** (~50%)
- Font family correct but weight usage needs correction
- Brand colors preserved but inconsistent primary (#00475B vs #005570)
- Component layouts significantly redesigned (not reconstructed)
- Flatsome CSS grid system only preserved in About page
- Section padding, border radius, and spacing differ from WordPress
- Mobile bottom bar completely missing

**Recommendation:**

The migration has successfully preserved content and structure, but the **visual reconstruction goal** ("RECONSTRUCT / PRESERVE VISUAL DESIGN CUA WEBSITE GOC") is only partially met. The About page demonstrates that faithful Flatsome CSS reconstruction IS achievable (via `about-us.css`), but this approach was not applied to the other sections/templates.

To reach the target visual fidelity (>80%), the recommended approach is:
1. Extract and save the actual WordPress Flatsome CSS + child theme CSS into the repository as reference files
2. Apply the same Flatsome-matched CSS approach used in `about-us.css` to all major sections
3. Fix the 7 P1 issues before proceeding to P2/P3

---

**AUDIT COMPLETE.**

**NO CODE HAS BEEN MODIFIED.**

**Awaiting user review before proceeding with any fixes.**
