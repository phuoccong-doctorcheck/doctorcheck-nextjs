# Design Tokens: DoctorCheck.vn

Extracted from `https://doctorcheck.vn/` stylesheet `:root` and computed styles.

## 1. Color Palette

### Brand Colors
- **Primary Brand (Teal):** `#00475B` (`rgb(0, 71, 91)` / `oklch(0.35 0.08 215)`)
  - Semantic use: Main headers, brand logos, primary button backgrounds, badges, dark section backgrounds.
- **Accent Action (Amber / Gold):** `#FFB500` (`rgb(255, 181, 0)` / `oklch(0.79 0.17 80)`)
  - Semantic use: Booking CTA buttons, highlight badges, star ratings, prominent notification text.
- **Info Deep Navy:** `#005570` (`rgb(0, 85, 112)`)
  - Semantic use: Secondary headings, card borders, active navigation states.
- **Soft Sky Accent:** `#87E3DB` (`rgb(135, 227, 219)`)
  - Semantic use: Decorative icons, pill backgrounds, subtle gradient highlights.
- **Light Tint Background (Cyan Tint):** `#EEF7FA` (`rgb(238, 247, 250)`)
  - Semantic use: Alternating section backgrounds, benefit cards background, doctor cards background.

### Neutral Colors
- **Base Text (Dark Charcoal):** `#2A2F38` (`rgb(42, 47, 56)`)
- **Muted Text (Slate):** `#4D5565` (`rgb(77, 85, 101)`)
- **Light Muted Text:** `#828282`
- **Border / Divider:** `#D0D5DD` / `#E5E7EB`
- **Pure White:** `#FFFFFF`
- **Dark Neutral Background:** `#0B1E28`

## 2. Typography

### Primary Font Family
- **Font Family:** `SVN-SofiaPro`, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif
- **Weights:**
  - Light: `300`
  - Regular: `400`
  - SemiBold: `600`
  - Bold: `700`
  - Black: `900`

### Type Hierarchy
- **Display / H1:** `36px` to `42px` (desktop), `24px` to `28px` (mobile), weight `700` / `900`, line-height `1.2`
- **Section Heading / H2:** `28px` to `34px` (desktop), `20px` to `24px` (mobile), weight `700`, line-height `1.3`, color `#00475B`
- **Sub-heading / H3:** `20px` to `24px` (desktop), `18px` to `20px` (mobile), weight `600`, line-height `1.3`
- **Card Title / H4:** `16px` to `18px`, weight `600` / `700`
- **Body Text:** `15px` to `16px`, weight `400`, line-height `1.6`, color `#2A2F38`
- **Caption / Small:** `13px` to `14px`, weight `400`, line-height `1.4`, color `#4D5565`

## 3. Spacing & Container Scale
- **Container Max-Width:** `1200px` standard, `1400px` full-bleed
- **Container Padding:** `16px` (mobile), `24px` (tablet), `32px` (desktop)
- **Section Vertical Padding:** `48px` to `64px`
- **Grid Gaps:** `16px` (mobile), `24px` to `32px` (desktop)

## 4. Border Radius & Shadows
- **Card Radius:** `var(--shape-rad, 20px)`
- **Image Radius:** `var(--img-rad, 12px)`
- **Pill / Button Radius:** `9999px` (full rounded) or `10px`
- **Card Shadow:** `0 4px 20px rgba(0, 71, 91, 0.08)`
- **Hover Shadow:** `0 8px 30px rgba(0, 71, 91, 0.15)`
