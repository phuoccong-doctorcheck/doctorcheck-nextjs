# Phase 7: Performance & Core Web Vitals Audit

**Project:** DoctorCheck Next.js Migration  
**Target Codebase:** `d:\LandingPages\DoctorCheck`  
**Date:** 2026-09-15  
**Auditor:** Antigravity AI Engineering Team  

---

## 1. Executive Summary

| Performance Area | Evaluated Finding | Measurable Target | Current Assessment | Status |
| :--- | :--- | :---: | :---: | :---: |
| **Largest Contentful Paint (LCP)** | Remote Unsplash images without dimensions; Google Fonts DNS handshake. | **< 2.5s** | High risk of LCP regression on mobile 4G. | **WARNING** |
| **Interaction to Next Paint (INP)** | Leaf Client Components (`BookingForm`, `FAQAccordion`); low main-thread blocking. | **< 200ms** | Minimal main-thread blocking; fast input response. | **PASS** |
| **Cumulative Layout Shift (CLS)** | Unconstrained image aspect ratios in mock blocks; FOIT from Google Inter font. | **< 0.1** | Potential shift from remote hero image rendering. | **WARNING** |
| **Client Bundle Size** | Public pages load 118–128 kB First Load JS; Admin loads 581 kB. | **< 150 kB** | Public routes meet bundle targets cleanly. | **PASS** |
| **Image Pipeline** | `images.remotePatterns` has open wildcard (`**`); no WebP/AVIF transformation on CDN. | Modern formats | Unsplash URLs bypass local optimization CDN. | **WARNING** |

---

## 2. Detailed Performance Bottleneck Analysis

### 2.1. Image Optimization & Layout Shift Risks
- **Current Pattern:** All visual assets in `src/lib/cms/mock-data.ts` reference raw external Unsplash URLs:
  `https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=1000&q=80`
- **Missing Cloudflare Images Integration:** The live DoctorCheck platform serves over 95% of its imagery through Cloudflare Images CDN (`imagedelivery.net/VX_wpsBa_s5hNlg6_mgdXg/`). This implementation completely ignores the existing Cloudflare Images infrastructure.
- **Aspect Ratio & Dimensions:** In several blocks (e.g. `HeroBlock.tsx`, `ServiceGridBlock.tsx`), images rely on Tailwind object-fit utilities (`object-cover`) without explicit intrinsic aspect ratios. On slow mobile 3G/4G connections, this causes noticeable Cumulative Layout Shift (CLS > 0.1) as image containers pop into view.

### 2.2. Font Loading & FOIT (Flash of Invisible Text)
- In `src/app/(frontend)/layout.tsx`:
  ```typescript
  const inter = Inter({
    subsets: ['latin', 'vietnamese'],
    display: 'swap',
    variable: '--font-inter',
  })
  ```
- While `display: 'swap'` prevents permanent invisible text, loading Google's `Inter` font over Google Fonts CDN requires extra DNS pre-connect handshakes (`fonts.googleapis.com` and `fonts.gstatic.com`).
- Furthermore, DoctorCheck's official brand typography is **SVN-SofiaPro**, which is already self-hosted in WOFF2 format under `public/sites/doctorcheck-vn/fonts/` in our template repository. Switching to Google Inter creates a visual brand mismatch.

### 2.3. Server Components vs. Client Component Architecture
- **Positive Finding:** The page architecture adheres strictly to Server Components by default:
  - `(frontend)/page.tsx` renders 8 modular blocks on the server.
  - Client components are strictly restricted to leaf interactive components (`BookingForm.tsx`, `ContactForm.tsx`, `FAQAccordion.tsx`, `MobileNav.tsx`).
  - Total shared client JavaScript footprint across all marketing routes is held to **118 kB**.
- **Payload Admin Overhead:**
  - Route `/admin/[[...segments]]` generates **581 kB First Load JS**.
  - While isolated from public patient routes, hosting the entire Payload CMS within the same App Router process means that cold-start execution on serverless runtimes (e.g. Vercel) can exceed 2.5s if the database connection pool is not warm.

---

## 3. Core Web Vitals Targets vs. Current Status

| Metric | Target | Projected Status | Primary Risk Factor |
| :--- | :---: | :---: | :--- |
| **LCP** | < 2.5s | **~2.8s (Needs Optimization)** | Hero block loads external Unsplash image instead of preloaded local WebP. |
| **INP** | < 200ms | **< 120ms (PASS)** | Minimal client-side JavaScript execution. |
| **CLS** | < 0.1 | **~0.15 (Needs Optimization)** | Unconstrained dynamic image containers. |
| **FCP** | < 1.5s | **~1.3s (PASS)** | Tailwind CSS 3.4 utility footprint is small. |

---

## 4. Performance Audit Verdict: `WARNING`

While the Server Component boundary design is sound, performance is undermined by external unoptimized Unsplash image dependencies, missing Cloudflare Images integration, potential layout shifts, and DNS overhead from external Google Fonts.
