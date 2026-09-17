# Page Topology: DoctorCheck.vn Homepage

## Layout & Flow Structure

```
+-------------------------------------------------------------------+
| 1. Top Utility Announcement Bar (Hotline 0939 010 101, Hours)      |
+-------------------------------------------------------------------+
| 2. Main Sticky Navigation Header (Logo, Nav Links, Search, CTA)   |
+-------------------------------------------------------------------+
| 3. Hero Section (H1, Promo Banner, Quick Booking CTA)             |
+-------------------------------------------------------------------+
| 4. 4 Patient Concerns ("Gỡ Bỏ 4 Nỗi Lo", 4 Cards Grid)             |
+-------------------------------------------------------------------+
| 5. Video Testimonials Carousel (Real Patient YouTube Stories)     |
+-------------------------------------------------------------------+
| 6. 5 Golden Rights ("5 Quyền Lợi Vàng", Evidence-based, 60-90min) |
+-------------------------------------------------------------------+
| 7. Doctor Team Showcase (BSCKII, ThS.BS Cards + Credentials)      |
+-------------------------------------------------------------------+
| 8. Facilities & Equipment (Olympus EVIS-X1, Siemens, Abbott/Roche)|
+-------------------------------------------------------------------+
| 9. Pricing & Packages Comparison (Gender Switcher, 3 Tiers)       |
+-------------------------------------------------------------------+
| 10. Cancer Screening Guide (Endoscopy Stomach & Colorectal)       |
+-------------------------------------------------------------------+
| 11. Customer Stories & Social Proof (10,000+ Happy Patients)      |
+-------------------------------------------------------------------+
| 12. FAQ Accordion (Preparation, Duration, Insurance BHYT)         |
+-------------------------------------------------------------------+
| 13. Consultation & Booking Form (With Full UTM/Ad Attribution)    |
+-------------------------------------------------------------------+
| 14. Comprehensive Footer (Address, Medical License, Legal)        |
+-------------------------------------------------------------------+
| [Sticky Floating Actions] Zalo Button, Call Hotline, Book Appt    |
+-------------------------------------------------------------------+
```

## Section Details & Interaction Models

| # | Section | Interaction Model | Dependencies |
|---|---|---|---|
| 1 | Top Announcement Bar | Static | None |
| 2 | Main Header | Scroll-driven (sticky + shadow on scroll) + Click-driven (dropdowns, mobile drawer, search modal) | Navigation items data |
| 3 | Hero Section | Static / Click-driven (booking link) | Cloudflare banner images |
| 4 | 4 Concerns Section | Static / Hover-driven (card elevate) | Custom SVG icons |
| 5 | Video Testimonials | Click-driven (carousel navigation + video modal popup) | YouTube video IDs |
| 6 | 5 Golden Rights | Static / Responsive grid | Icon set |
| 7 | Doctor Team | Click-driven (carousel swipe + doctor bio popup modal) | Doctors dataset |
| 8 | Facilities & Equipment | Static / Hover-driven | Equipment images |
| 9 | Pricing & Packages | Click-driven (Nam / Nữ tab switcher, package modal) | Packages pricing data |
| 10 | Cancer Screening | Static / Link-driven | Images |
| 11 | Customer Stories | Static / Read more link | Customer quotes |
| 12 | FAQ Accordion | Click-driven (single or multi-item accordion expand/collapse) | FAQ data |
| 13 | Consultation Form | Click/Form-driven (input validation, datepicker, submit API) | `/api/booking` route |
| 14 | Footer | Static / Link-driven | Footer links & credentials |
| 15 | Floating Widgets | Scroll-driven (reveal on scroll) + Click-driven (direct phone dial, Zalo link) | None |
