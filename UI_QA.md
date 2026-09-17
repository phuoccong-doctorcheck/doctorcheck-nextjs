# Phase 9: Responsive Design & Visual UI QA Audit

**Project:** DoctorCheck Next.js Migration  
**Target Codebase:** `d:\LandingPages\DoctorCheck`  
**Date:** 2026-09-15  
**Auditor:** Antigravity AI Engineering Team  

---

## 1. Executive Summary

| Viewport Category | Screen Width Range | Layout Integrity | Visual Brand Parity with DoctorCheck.vn | Status |
| :--- | :---: | :---: | :---: | :---: |
| **Small Mobile** | 320px – 375px | Responsive, no overflow-x. | Fails brand palette; uses generic sky blue instead of dark teal. | **WARNING** |
| **Standard Mobile** | 390px – 430px | Sticky bottom bar active. | Mobile hotline dialer points to fake `1900 88 99 22` number! | **CRITICAL FAIL** |
| **Tablet** | 768px – 1024px | Multi-column grid wraps cleanly. | Service grid cards lack DoctorCheck pricing tabs & test counts. | **WARNING** |
| **Desktop / Widescreen**| 1280px – 1920px | Header navigation sticky. | Visual hierarchy does not match DoctorCheck's 15 verified homepage sections. | **FAIL** |

---

## 2. Brand Identity & Visual Hierarchy Comparison

### 2.1. Brand Palette Mismatch
- **Official DoctorCheck.vn Tokens:**
  - Primary Brand Dark Teal: `#00475B` (`oklch(0.35 0.08 215)`)
  - Accent Gold: `#FFB500` (`oklch(0.79 0.17 80)`)
  - Secondary Navy: `#005570`
  - Sky Blue Tint: `#87E3DB`
  - Soft Background: `#EEF7FA`
- **Current `DoctorCheck` Implementation (`src/lib/cms/mock-data.ts` & `tailwind.config.ts`):**
  - Primary Color: `#0284c7` (Standard Tailwind Sky Blue 600)
  - Secondary Color: `#0f172a` (Slate 900)
  - Accent Color: `#f59e0b` (Amber 500)
- **Impact:** The site visually resembles a generic SaaS template or unrelated hospital website rather than the recognized, premium DoctorCheck brand identity.

### 2.2. Section Hierarchy Mismatch against Target Homepage
Our live DOM audit of DoctorCheck.vn established a rigorous 15-section conversion hierarchy. Comparing this against the implemented blocks in `src/app/(frontend)/page.tsx`:

| Target DoctorCheck.vn Section | Implemented in `DoctorCheck`? | Assessment |
| :--- | :---: | :--- |
| **1. TopBar & Hotline (`028 5678 9999`)** | **YES** | TopBar exists, but contains fake phone number (`028 3822 9999`). |
| **2. Header & Desktop Mega-Dropdowns** | **PARTIAL** | Standard flat header; lacks DoctorCheck multi-level medical specialty mega-menu. |
| **3. Hero Banner & 2 CTA Buttons** | **YES** | Hero exists, but uses generic stock family photo instead of clinic endoscopy hero banner. |
| **4. 4 Patient Anxiety Pain-Points Cards** | **NO** | Completely missing. Replaced by generic "IntroductionBlock". |
| **5. Video Testimonials (YouTube Player)** | **NO** | VideoBlock exists, but uses generic video instead of real patient interviews (Cô Đào, Chú Hùng). |
| **6. 5 Golden Rights Benefit Grid** | **NO** | Completely missing. |
| **7. Clinical Faculty Slider (7 Doctors)** | **PARTIAL** | DoctorGridBlock exists, but displays 4 fake doctors instead of real clinic faculty. |
| **8. Medical Equipment Matrix (Olympus X1)**| **NO** | Replaced by generic "FacilityBlock" with Unsplash hospital photos. |
| **9. Gender Pricing Tab Switcher (Nam/Nữ)** | **NO** | Completely missing. Displays static service cards without gender toggles or test counts. |
| **10. Early Gastric & Colorectal Cancer Guide** | **NO** | Completely missing. |
| **11. Narrative Case Studies (Chú Hồng Anh)**| **NO** | Completely missing. |
| **12. Collapsible FAQ Accordion** | **YES** | FAQBlock exists with 5 generic questions. |
| **13. Consultation Booking Section** | **YES** | Form exists, but lead storage is broken. |
| **14. Footer with Health License & Tax Code** | **PARTIAL** | Footer exists, but omits Ministry of Health license `09789/HCM-GPHĐ`. |
| **15. Floating Zalo & Phone Dialer** | **PARTIAL** | Floating widget points to fake Zalo and fake hotline. |

---

## 3. Responsive Breakpoint Testing Details

### 3.1. Mobile Bottom Bar (`MobileBottomBar.tsx`)
```tsx
// Line 25 in MobileBottomBar.tsx
<a
  href={`tel:${clinic.hotline.replace(/\s+/g, '')}`}
  className="flex flex-col items-center justify-center p-2 text-primary hover:bg-sky-50"
>
  <Phone className="w-5 h-5 mb-1" />
  <span className="text-[11px] font-medium">Hotline</span>
</a>
```
- **Operational Failure:** When a patient taps "Hotline" on an iPhone or Android device, the phone dials `1900889922` (or `02838229999`). Because these numbers do not belong to DoctorCheck, the patient is unable to connect with the clinic.

### 3.2. Mobile Nav Drawer (`MobileNav.tsx`)
- Drawer animation operates smoothly with CSS translate transitions.
- Backdrop click dismisses the drawer cleanly.
- However, menu items link to broken routes (`/about`, `/services`, `/doctors`, `/blog`, `/contact`), which fail to match DoctorCheck's actual site structure.

---

## 4. UI/Responsive QA Verdict: `FAIL`

While technical responsiveness (fluid grids, no horizontal overflow) passes, the visual hierarchy, color tokens, and interactive mobile phone dialers completely fail brand parity and route patients to non-existent numbers.
