# Navigation Architecture Analysis: DoctorCheck.vn

Audited across desktop, tablet, and mobile viewports on `https://doctorcheck.vn/`.

---

## 1. Desktop Navigation Architecture

### Structure & Layout
- **Container Width:** Max-width 1200px, flex layout with logo on left, primary menu center-aligned, and utility actions on right.
- **Sticky Behavior:** Header has `.header.has-sticky.sticky-jump` in Flatsome. When scrolled past ~60px, it shrinks height slightly and receives `position: fixed` with box shadow and blurred background.
- **Primary Menu Items (Left to Right):**
  1. **Về Doctor Check:** Dropdown containing *Giới thiệu phòng khám*, *Đội ngũ bác sĩ*, *Cơ sở vật chất*, *10 tiêu chuẩn vàng*.
  2. **Tầm Soát Bệnh Nữ:** Dropdown containing *Gói Khuyến Cáo Nữ (3M)*, *Gói Chuyên Sâu Nữ (5M)*, *Gói Sống Thọ Nữ (11.5M)*, *So sánh 3 gói khám nữ*.
  3. **Tầm Soát Bệnh Nam:** Dropdown containing *Gói Khuyến Cáo Nam (3M)*, *Gói Chuyên Sâu Nam (5M)*, *Gói Sống Thọ Nam (11.5M)*, *So sánh 3 gói khám nam*.
  4. **6 Thói Quen Sống Thọ:** Dropdown linking to lifestyle pillars: *Kiểm soát cân nặng & BMI*, *Dinh dưỡng sống thọ*, *Giấc ngủ sống thọ*, *Vận động sống thọ*, *Kiểm soát stress*, *Kiểm soát hơi thở*.
  5. **Trung Tâm Nội Soi Tiêu Hóa:** Dropdown linking to *10 Tiêu Chuẩn Vàng*, *Chuyên khoa dạ dày*, *Chuyên khoa đại tràng*, *Nội soi chẩn đoán*, *Tầm soát ung thư*.
  6. **Khám Doanh Nghiệp:** Direct link to `/kham-suc-khoe-doanh-nghiep/`.
  7. **Bảng Giá:** Direct link to `/bang-gia-dich-vu-tam-soat-benh-tai-doctor-check/`.
- **Action Buttons & Search:**
  - Search trigger icon expanding search input (`GET /?s=...&post_type=...`).
  - Booking CTA Button: "Đặt Lịch Khám" (high contrast `#FFB500` background, `#00475B` text).

---

## 2. Mobile Navigation Architecture

- **Trigger:** Hamburger menu button located in the top-right header corner.
- **Drawer Behavior:** Slide-out drawer panel from left/right with dark backdrop overlay.
- **Submenu Interaction:** Nested items are collapsed by default; clicking parent arrows expands accordion submenus smoothly.
- **Mobile Bottom Quick-Action Bar:** Fixed bottom bar on mobile viewports featuring:
  - Direct call button (`tel:0939010101`)
  - Direct Zalo chat button
  - "Đặt Hẹn" CTA anchor button linking to `#booking` form.

---

## 3. Breadcrumbs Architecture

- On the homepage: Breadcrumbs are omitted from visual presentation but present in Schema.org JSON-LD.
- On internal pages (Articles, Category archives, Package details): Breadcrumb navigation is rendered above the main content (via Rank Math Breadcrumbs) in the format: `Trang chủ > [Chuyên mục / Dịch vụ] > [Tên trang hiện tại]`.

---

## 4. Footer Navigation Architecture

- Organized into 4 distinct semantic columns:
  1. **Thông tin phòng khám:** Logo, slogan ("Tầm Soát Bệnh Để Sống Thọ Hơn"), giới thiệu ngắn, giấy phép hoạt động Sở Y Tế cấp (09789/HCM-GPHĐ).
  2. **Gói khám tổng quát:** Links to nam/nữ packages, bảng giá niêm yết, bảng giá thuốc và vật tư y tế.
  3. **Chuyên khoa & Landing pages:** Links to external subdomains (`noisoidaday.doctorcheck.vn`, `noisoidaitrang.doctorcheck.vn`), bài viết báo chí, về chúng tôi.
  4. **Liên hệ & Giờ làm việc:** Địa chỉ (429 Tô Hiến Thành), hotline 0939 010 101, email, giờ mở cửa Thứ 2 - Thứ 7 (07:30 - 17:00).

---

## 5. Floating Actions Architecture

- **Back-to-top Button:** `<a class="back-to-top button icon invert plain fixed bottom z-1 ...">` fades into view when scroll depth exceeds 400px; smooth scrolls to top.
- **Zalo Chat Widget:** Floating Zalo icon in bottom-right corner with pulsed ring animation linking to official OA `https://zalo.me/309834292180920772`.
- **Hotline Dialer:** Mobile quick-call action floating widget.
