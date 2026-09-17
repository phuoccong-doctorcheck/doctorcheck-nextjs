# Tech Stack Analysis: DoctorCheck.vn

## Original vs Next.js Architecture Comparison

| Area | Current WordPress Implementation | Next.js 16 Rebuild Equivalent | Rationale & Benefits |
|---|---|---|---|
| **Core Framework** | WordPress 6.x + PHP | Next.js 16 (React 19, TypeScript strict) | Instant page transitions, sub-second TTFB, 0 server vulnerabilities. |
| **Theme / UI** | Flatsome 3.19.8 + custom child theme | Tailwind CSS v4 + shadcn/ui + Radix primitives | Zero CSS bloat, exact token alignment, mobile-first responsiveness. |
| **Icons** | Custom icon font (`dc-icons.woff2`, `fl-icons.woff2`) | Lucide React + standalone SVG components | Eliminates font layout shifting (FOUT), fully tree-shakeable. |
| **Image CDN** | Cloudflare Images (`imagedelivery.net`) | Next.js `<Image>` with Cloudflare Images remote patterns | WebP/AVIF auto-serving, responsive srcset, zero Cumulative Layout Shift (CLS). |
| **Sliders / Carousels** | jQuery + Owl Carousel + Splide + Swiper | Pure React swipeable slider / Embla Carousel / CSS scroll-snap | Removes jQuery dependency completely (~85KB saved). |
| **Forms** | Contact Form 7 + WP REST API | Native React form + Next.js App Router API Route (`/api/booking`) | Type-safe validation (Zod), CSRF protection, unified UTM capture. |
| **SEO & Schema** | Rank Math PRO | Next.js Metadata API + `next/script` JSON-LD Schema.org | Identical `MedicalClinic`, `Physician`, `OfferCatalog` schema parity. |
| **Fonts** | Self-hosted `SVN-SofiaPro` WOFF2 | `next/font/local` or self-hosted WOFF2 | Optimal preloading, zero font flash, full Vietnamese diacritic support. |
