# Behaviors & Interaction Specifications: DoctorCheck.vn

## 1. Sticky Navigation Header
- **Scroll Behavior:**
  - At scroll `Y = 0`: Header has transparent or white background with border bottom, full height (~`80px`).
  - When scroll `Y > 60px`: Header gains `.is-scrolled` class with `position: fixed; top: 0; left: 0; right: 0; z-index: 50;`, compact height (~`68px`), background `rgba(255, 255, 255, 0.96)`, backdrop filter `blur(8px)`, and box-shadow `0 4px 20px rgba(0, 71, 91, 0.08)`.
  - Transition: `transition: all 0.25s ease-in-out`.
- **Navigation Dropdowns (Desktop):**
  - Hover on menu item with submenu triggers dropdown panel with subtle slide-down and fade-in (`opacity: 0 -> 1`, `transform: translateY(8px) -> translateY(0)`).
- **Mobile Menu Drawer:**
  - Hamburger button click toggles an off-canvas drawer from right or left with backdrop overlay.
  - Submenu items expand via accordion animation.

## 2. Pricing Package Switcher (Nam / Nữ)
- **Interaction Model:** Click-driven state switcher.
- **State A:** "Dành Cho Nữ" selected (default or first tab).
  - Shows 3 female packages:
    1. Gói Khuyến Cáo Nữ (3.000.000đ - 21 nhóm bệnh & 2 ung thư)
    2. Gói Chuyên Sâu Nữ (5.000.000đ - 24 nhóm bệnh & 5 ung thư)
    3. Gói Sống Thọ Nữ (11.500.000đ - 29 nhóm bệnh & 9 ung thư)
- **State B:** "Dành Cho Nam" clicked.
  - Smooth opacity crossfade (duration 200ms).
  - Shows 3 male packages:
    1. Gói Khuyến Cáo Nam (3.000.000đ - 21 nhóm bệnh & 2 ung thư)
    2. Gói Chuyên Sâu Nam (5.000.000đ - 24 nhóm bệnh & 5 ung thư)
    3. Gói Sống Thọ Nam (11.500.000đ - 29 nhóm bệnh & 9 ung thư)
- **Active Tab Styling:** Background `#00475B`, text `#FFFFFF`, border-radius `9999px`. Inactive tab: background `transparent` or `#EEF7FA`, text `#00475B`.

## 3. Video Testimonials & Modals
- **Carousel:** Left / right navigation arrows and touch swipe support.
- **Video Click:** Clicking a testimonial card opens a modal overlay with an embedded responsive 16:9 YouTube player with `autoplay=1`.
- **Close Triggers:** Click 'X' button, click backdrop overlay, or press `Escape` key.

## 4. Doctor Team Carousel & Profile Cards
- **Hover:** Card slightly elevates (`transform: translateY(-4px)`), box shadow deepens.
- **Click "Xem Chi Tiết":** Opens doctor detailed bio modal showing hospital credentials (ĐHYD, Chợ Rẫy), clinical experience, and consultation booking link.

## 5. FAQ Accordion
- **Interaction:** Clicking an accordion header toggles its open/closed state.
- **Icon:** Chevron rotates 180 degrees (`transform: rotate(180deg)`).
- **Content:** Smooth height transition with `overflow: hidden`.

## 6. Booking & Consultation Form
- **Fields:**
  - Họ và tên (`customer_name`) [Required]
  - Số điện thoại (`customer_phone`) [Required, Vietnamese phone format regex `/(03|05|07|08|09)+([0-9]{8})\b/`]
  - Gói dịch vụ quan tâm (`services-list`) [Select dropdown]
  - Ngày dự kiến thăm khám (`date-booking`) [Date picker]
  - Hidden attribution fields: `utm_source`, `utm_medium`, `utm_campaign`, `utm_term`, `utm_content`, `gclid`, `current_url`.
- **Submission:** Asynchronous `fetch('/api/booking', { method: 'POST' })`.
  - Submitting state: Button shows spinner and disabled state.
  - Success state: Shows confirmation message / modal, redirects or fires conversion tracking.
  - Error state: Displays inline field errors with red highlight.

## 7. Floating Quick-Action Bar
- **Zalo Chat Button:** Fixed bottom-right corner, pulsed ripple animation, links directly to `https://zalo.me/309834292180920772`.
- **Hotline Call Button:** Links to `tel:0939010101`.
- **Scroll-to-top Button:** Appears when scroll `Y > 400px`, smooth scrolls back to top on click.
