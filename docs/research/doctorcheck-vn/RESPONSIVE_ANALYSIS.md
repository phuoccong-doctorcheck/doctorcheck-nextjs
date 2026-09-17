# Responsive Layout Analysis: DoctorCheck.vn

Audited across mobile (375px – 430px), tablet (768px – 1024px), and desktop (1200px – 1440px+) viewports.

---

## 1. Breakpoint System

Derived from theme stylesheets (`flatsome.css`, `responsive.css`, `kdn.css`):

| Breakpoint Token | Viewport Range | Devices | Primary Architectural Behavior |
| :--- | :--- | :--- | :--- |
| **Mobile Small / Standard** | `375px – 650px` | iPhone SE, 13/14/15/16, Android | Single column stack, off-canvas menu, sticky bottom contact bar, 1-card swiping carousels. |
| **Tablet Portrait** | `650px – 820px` | iPad Mini, iPad 10.2", Galaxy Tab | 2-column grids for cards and doctors, compact navigation, multi-item carousels. |
| **Tablet Landscape / Small Laptop** | `820px – 1024px` | iPad Pro, Small Laptops | 2-to-3 column grids, desktop navigation appears with compact padding. |
| **Standard Desktop** | `1024px – 1400px` | MacBooks, 1080p Desktop Displays | Full 1200px container, multi-column grids (3–4 columns), full dropdown menus. |
| **Wide Desktop** | `>1400px` | QHD / 4K Monitors | 1400px max container variants, elevated spacing and typography hierarchy. |

---

## 2. Section-by-Section Responsive Transformations

### 1. Navigation Header
- **Desktop (`>= 1024px`):** Full horizontal bar with logo, 7 parent dropdown items, search trigger, hotline, and "Đặt Lịch Khám" button. Sticky scroll transition active.
- **Tablet / Mobile (`< 1024px`):** Top utility bar hidden; main navigation links collapsed into hamburger menu icon; off-canvas slide-in drawer contains all parent and child items; mobile search bar displayed inside drawer.

### 2. Above-the-Fold Hero
- **Desktop:** 12-column grid layout with 7 columns for text content (H1, value propositions, dual CTA buttons) and 5 columns for the interactive clinic visual card and floating stats badge.
- **Mobile:** Stacks vertically into a single column. H1 typography reduces from `44px` to `28px` for optimal readability; CTA buttons expand to 100% width; visual card stacks directly below text.

### 3. Patient Concerns ("Gỡ Bỏ 4 Nỗi Lo")
- **Desktop:** 2x2 balanced card grid with generous 32px padding and hover elevation.
- **Mobile:** Stacks into a single-column vertical feed with 16px margins, preserving full card content without truncation.

### 4. Video Testimonials Carousel
- **Desktop:** 3 video cards displayed simultaneously side-by-side with hover states.
- **Tablet:** 2 video cards visible per slide.
- **Mobile:** 1 video card visible per slide with touch swipe pagination. Modal player expands to 100vw on mobile.

### 5. Clinical Specialist Roster (Doctors)
- **Desktop:** 4 doctor cards displayed in a single row (`grid-cols-4`).
- **Tablet:** 2x2 grid (`grid-cols-2`).
- **Mobile:** Horizontal scroll-snap or single-column stack with full-width doctor image and quick profile trigger.

### 6. Medical Technology & Facilities
- **Desktop:** 3x2 grid of 6 international equipment units.
- **Tablet:** 2x3 grid.
- **Mobile:** Single column stack with device image on top and feature bullet points below.

### 7. Pricing & Package Matrix
- **Desktop:** 3 pricing columns displayed side-by-side with the popular package ("Gói Chuyên Sâu") elevated by `-10px` and ringed with accent gold border.
- **Mobile:** 3 cards stacked vertically in order: Gói Khuyến Cáo &rarr; Gói Chuyên Sâu &rarr; Gói Sống Thọ. Sticky package tabs ("Dành Cho Nữ" / "Dành Cho Nam") remain easily reachable at the top.

### 8. Consultation Booking Form
- **Desktop:** 2-column layout with value guarantees on the left (6 cols) and interactive white form container on the right (6 cols).
- **Mobile:** Stacks into a single column: value points appear first, followed by the form card with full-width touch-friendly form inputs.

### 9. Footer
- **Desktop:** 4 semantic columns (`lg:col-span-4`, `3`, `2`, `3`).
- **Tablet:** 2x2 grid.
- **Mobile:** Stacks into 4 vertical sections with centered copyright and operating license details.

### 10. Persistent Quick Actions
- **Desktop:** Floating Zalo widget in bottom-right corner; back-to-top button on deep scroll.
- **Mobile:** Persistent bottom contact bar with direct phone dialer (`0939 010 101`), Zalo chat, and quick appointment booking trigger.
