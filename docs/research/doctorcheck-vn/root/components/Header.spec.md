# Header Component Specification

## Overview
- **Target file:** `src/components/sites/doctorcheck-vn/root/Header.tsx`
- **Interaction model:** Scroll-driven (sticky styling + shadow) + click-driven (navigation dropdowns, search modal, mobile drawer).

## Structure
- Announcement TopBar:
  - Phone: `0939 010 101` (hotline)
  - Working Hours: `Thứ 2 - Thứ 7: 07:30 - 17:00`
  - Location badge: `429 Tô Hiến Thành, TP.HCM`
- Main Navbar:
  - Container (`max-width: 1200px`)
  - Left: Logo Doctor Check + Slogan ("Tầm Soát Bệnh Để Sống Thọ Hơn")
  - Center: Nav Menu (`Tầm Soát Bệnh`, `Gói Khám Nữ`, `Gói Khám Nam`, `Sống Thọ`, `Trung Tâm Nội Soi`, `Đội Ngũ Bác Sĩ`, `Bảng Giá`)
  - Right:
    - Search icon trigger
    - "Đặt Hẹn Ngay" CTA Button (`bg-[#FFB500]`, text `#00475B`, rounded-full)
    - Mobile hamburger toggle button

## Computed Styles
- Background: `#FFFFFF` (default), `rgba(255, 255, 255, 0.96)` with `backdrop-filter: blur(8px)` (scrolled)
- Border Bottom: `1px solid #E5E7EB`
- Box Shadow (scrolled): `0 4px 20px rgba(0, 71, 91, 0.08)`
- Height: `76px` (desktop), `64px` (mobile)
- Z-Index: `50`
- Transition: `all 0.25s ease-in-out`
