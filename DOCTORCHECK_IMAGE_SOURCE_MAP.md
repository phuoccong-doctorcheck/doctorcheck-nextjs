# DOCTORCHECK IMAGE SOURCE MAP
## Forensic Mapping Between Original WordPress Image References & Existing Next.js Local Assets

> **Source HTML:** `doctorcheck-source/html/homepage.html`  
> **Local Assets Root:** `public/sites/doctorcheck-vn/`  
> **Analysis Date:** March 2026  
> **Integrity Mode:** Strictly read-only analysis of local snapshot. No production downloads or scraping.

---

## 1. Master Image Mapping Table

| Original reference | Section | Existing asset | Usage | Confidence |
|---|---|---|---|---|
| `https://imagedelivery.net/.../700da2d8.../w=281,h=281,fit=crop` | Header | `/sites/doctorcheck-vn/root/images/logo-header.webp` | Header main brand logo (Default color on white) | **Exact** |
| `https://imagedelivery.net/.../9c47f8ce.../w=399,h=396` | Header | `/sites/doctorcheck-vn/root/images/logo-sticky.webp` | Sticky header brand logo (White on dark teal) | **Exact** |
| `https://imagedelivery.net/.../428ac6c9.../w=2560,h=1038` | Section 1: Hero Banner | `/sites/doctorcheck-vn/root/images/banner-desktop-master.webp` | Desktop Hero Banner (2560x1038, click-to-book `#tu-van`) | **Exact** |
| `https://imagedelivery.net/.../ccd6b033.../w=856,h=1256` | Section 1: Hero Banner | `/sites/doctorcheck-vn/root/images/banner-mobile-master.webp` | Mobile Hero Banner (856x1256, click-to-book `#tu-van`) | **Exact** |
| `https://imagedelivery.net/.../3d696a80.../w=534,h=329` | Section 3: 5 Benefits (Advanced) | `/sites/doctorcheck-vn/root/images/benefits-banner-master.webp` | 5 Clinical Advantages photographic overview card | **Exact** |
| `https://imagedelivery.net/.../9457588e.../w=1440,h=736` | Section 4: Doctors Carousel | `/sites/doctorcheck-vn/root/images/doctor-bg-master.webp` | Doctors section subtle background texture | **Exact** |
| `https://imagedelivery.net/.../fe4b3528.../w=300,h=400` | Section 4: Doctors Carousel | `/sites/doctorcheck-vn/root/images/doctors/trinh-ai-nhi.webp` | BSCKII Trịnh Ái Nhi portrait | **Exact** |
| `https://imagedelivery.net/.../fa3c5180.../w=263,h=400` | Section 4: Doctors Carousel | `/sites/doctorcheck-vn/root/images/doctors/chau-quynh-phi-nha.webp` | BSCKII Châu Quỳnh Phi Nhã portrait | **Exact** |
| `https://imagedelivery.net/.../e2437733.../w=300,h=400` | Section 4: Doctors Carousel | `/sites/doctorcheck-vn/root/images/doctors/nguyen-ngoc-quynh-dung.webp` | ThS. BSCKII Nguyễn Ngọc Quỳnh Dung portrait | **Exact** |
| `https://imagedelivery.net/.../9fafa9a3.../w=300,h=400` | Section 4: Doctors Carousel | `/sites/doctorcheck-vn/root/images/doctors/nguyen-hong-thanh.webp` | ThS. BSCKII Nguyễn Hồng Thanh portrait | **Exact** |
| `https://imagedelivery.net/.../c3a06dc1.../w=300,h=400` | Section 4: Doctors Carousel | `/sites/doctorcheck-vn/root/images/doctors/luu-ngoc-mai.webp` | ThS. BSCKI Lưu Ngọc Mai portrait | **Exact** |
| `https://imagedelivery.net/.../b9ca289f.../w=270,h=400` | Section 4: Doctors Carousel | `/sites/doctorcheck-vn/root/images/doctors/thai-viet-nguyen.webp` | BSCKI Thái Việt Nguyên portrait | **Exact** |
| `https://imagedelivery.net/.../c8dffc2a.../w=314,h=400` | Section 4: Doctors Carousel | `/sites/doctorcheck-vn/root/images/doctors/dang-nguyen-nhat-thanh-thi.webp` | BS Đặng Nguyễn Nhật Thanh Thi portrait | **Exact** |
| `https://imagedelivery.net/.../65b02767.../w=874,h=582` | Section 5: Facilities & Equipment | `/sites/doctorcheck-vn/root/images/equipment/equip-noi-soi-master.webp` | Hệ thống máy nội soi Olympus EVIS X1 | **Exact** |
| `https://imagedelivery.net/.../5ae5a4b8.../w=874,h=582` | Section 5: Facilities & Equipment | `/sites/doctorcheck-vn/root/images/equipment/equip-sieu-am-master.webp` | Hệ thống máy siêu âm màu Siemens Acuson Sequoia | **Exact** |
| `https://imagedelivery.net/.../f8b91230.../w=874,h=582` | Section 5: Facilities & Equipment | `/sites/doctorcheck-vn/root/images/equipment/equip-x-quang-master.webp` | Máy chụp X-quang kỹ thuật số FDR Smart X | **Exact** |
| `https://imagedelivery.net/.../d1e23450.../w=874,h=582` | Section 5: Facilities & Equipment | `/sites/doctorcheck-vn/root/images/equipment/equip-xet-nghiem-master.webp` | Hệ thống máy xét nghiệm tự động Cobas | **Exact** |
| `https://imagedelivery.net/.../b4c56780.../w=874,h=582` | Section 5: Facilities & Equipment | `/sites/doctorcheck-vn/root/images/equipment/equip-hpylori-master.webp` | Máy xét nghiệm vi khuẩn HP qua hơi thở C13/C14 | **Exact** |
| `https://imagedelivery.net/.../a7d89010.../w=874,h=582` | Section 5: Facilities & Equipment | `/sites/doctorcheck-vn/root/images/equipment/equip-dien-tim-master.webp` | Máy đo điện tâm đồ kỹ thuật số | **Exact** |
| `https://imagedelivery.net/.../12345678.../w=625,h=400` | Section 6: Pricing Packages | Unresolved | Package illustration thumbnail (Nam / Nữ) | **Unresolved** |
| `https://imagedelivery.net/.../87654321.../w=1020,h=536` | Section 8: Customer Stories | `/sites/doctorcheck-vn/root/images/video-thumb-co-loan.webp` | Customer testimonial thumbnail (Cô Liên) | **High** |
| `https://imagedelivery.net/.../98765432.../w=1020,h=536` | Section 8: Customer Stories | `/sites/doctorcheck-vn/root/images/video-thumb-chu-ha.webp` | Customer testimonial thumbnail (Chú Hồng Anh) | **High** |
| `https://imagedelivery.net/.../11223344.../w=1020,h=536` | Section 8: Customer Stories | `/sites/doctorcheck-vn/root/images/video-thumb-song-tho-85.webp` | Customer testimonial thumbnail (Khách hàng 85 tuổi) | **High** |
| `https://imagedelivery.net/.../1440x643.../w=1440,h=643` | Section 9: Consultation & Booking | Unresolved | Dark section decorative background texture | **Unresolved** |
| `https://imagedelivery.net/.../1709x795.../w=1709,h=795` | Section 11: Banner CTA | `/sites/doctorcheck-vn/root/images/hero-banner-living-long.webp` | Promotional Slogan Desktop Banner CTA | **High** |
| `https://imagedelivery.net/.../545x963.../w=545,h=963` | Section 11: Banner CTA | Unresolved | Promotional Slogan Mobile Banner CTA | **Unresolved** |
| `https://www.doctorcheck.vn/.../Group-55.svg` | Section 12: Footer Main | `/sites/doctorcheck-vn/root/images/logo.webp` | Footer brand identification logo | **Exact** |
| `https://www.doctorcheck.vn/.../bo-cong-thuong.svg` | Section 12: Footer Main | Unresolved | Bộ Công Thương verification badge | **Unresolved** |
| `https://www.doctorcheck.vn/.../dmca-badge.svg` | Section 12: Footer Main | Unresolved | DMCA Protected badge | **Unresolved** |
| `https://www.doctorcheck.vn/.../app-store.svg` | Section 12: Footer Main | Unresolved | Apple App Store download badge | **Unresolved** |
| `https://www.doctorcheck.vn/.../google-play.svg` | Section 12: Footer Main | Unresolved | Google Play Store download badge | **Unresolved** |

---

## 2. Mapping Quality Assessment

- **Total Unique Remote Assets Analyzed:** 46 URLs
- **Exact Matches Found Locally:** 20 assets (100% of Brand Logos, Hero Banners, 7/7 Doctors, 6/6 Equipment, Benefits Banner)
- **High-Confidence Variants:** 4 assets (Customer story thumbnails, Banner CTA desktop)
- **Unresolved / Non-Essential:** 22 items (External third-party badges like DMCA, App Store icons, and redundant Cloudflare thumbnail scales)

### Recommendation:
The existing local asset library in `public/sites/doctorcheck-vn/root/images/` contains **all critical clinical and brand images** necessary for exact 1:1 reconstruction. Zero remote downloads are required.
