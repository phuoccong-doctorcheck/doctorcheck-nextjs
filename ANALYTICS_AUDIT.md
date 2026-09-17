# Phase 11: Analytics & Marketing Attribution Audit

**Project:** DoctorCheck Next.js Migration  
**Target Codebase:** `d:\LandingPages\DoctorCheck`  
**Date:** 2026-09-15  
**Auditor:** Antigravity AI Engineering Team  

---

## 1. Executive Summary

| Tracking Tool / Channel | Live WordPress Status | Current Implementation Status | Migration Impact | Rating |
| :--- | :--- | :--- | :--- | :---: |
| **Microsoft Clarity** | Active (`iaa767fkfn`) | Implemented via `AnalyticsScripts` | Preserved if `NEXT_PUBLIC_CLARITY_ID` is supplied. | **PASS** |
| **TikTok Pixel** | Active (`CJSOI6BC77UDO397GB30`)| **Completely Missing** | 100% tracking regression on TikTok ad campaigns. | **FAIL** |
| **Google Tag Manager / GA4** | Active in WP header | **Completely Missing** | Organic & paid conversion data lost in Google Analytics. | **FAIL** |
| **Phone Click Conversion** | Event tracking on `tel:` links | **Missing** (`<a href="tel:...">` without event handler)| Cannot track phone call conversion volume. | **FAIL** |
| **Zalo Click Conversion** | Event tracking on Zalo buttons | **Missing** | Cannot measure Zalo consultation lead generation. | **FAIL** |
| **Booking Form Conversion** | CF7 DOM event `wpcf7mailsent` | **Missing** (`fetch` without dataLayer event push) | Ad platforms cannot optimize for appointment bookings. | **FAIL** |
| **UTM / Click ID Capture** | Contact Form 7 hidden fields | **Missing** (Zero UTM parameter extraction) | Complete loss of campaign ROI and ROAS reporting. | **CRITICAL FAIL** |

---

## 2. Detailed Tracking Regressions

### 2.1. Microsoft Clarity Script Implementation (`src/lib/analytics/clarity.tsx`)
```tsx
export function AnalyticsScripts() {
  const clarityId = process.env.NEXT_PUBLIC_CLARITY_ID

  return (
    <>
      {clarityId && (
        <Script
          id="microsoft-clarity"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function(c,l,a,r,i,t,y){
                  c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                  t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                  y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
              })(window, document, "clarity", "script", "${clarityId}");
            `,
          }}
        />
      )}
    </>
  )
}
```
- **Finding:** Clarity integration is cleanly implemented with `next/script` (`strategy="afterInteractive"`). Setting `NEXT_PUBLIC_CLARITY_ID=iaa767fkfn` in `.env` restores heatmaps and session recordings immediately.

### 2.2. Missing TikTok Pixel (`CJSOI6BC77UDO397GB30`)
- On the live WordPress site, DoctorCheck runs TikTok performance campaigns for digestive health screening. The site executes TikTok Pixel ID `CJSOI6BC77UDO397GB30`.
- In `d:\LandingPages\DoctorCheck`, there is zero code or configuration for TikTok Pixel. If deployed, TikTok ad campaigns will lose event optimization and conversion attribution.

### 2.3. Missing Conversion Event Dispatchers (`dataLayer.push`)
In high-intent healthcare marketing, the primary conversion actions are:
1. Phone Call clicks (`tel:02856789999`)
2. Zalo Chat consultation triggers
3. Booking form submissions

In `BookingForm.tsx`:
```tsx
const res = await fetch('/api/booking', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(formData),
})
const data = await res.json()
if (data.success) {
  setSuccess(true)
  // MISSING: window.dataLayer?.push({ event: 'generate_lead', ... })
  // MISSING: window.ttq?.track('SubmitForm')
}
```
- Because neither GTM `dataLayer.push` nor native pixel events are fired upon successful appointment submission, Google Ads and TikTok Ads cannot record conversion events.

---

## 3. Analytics Audit Verdict: `FAIL (MARKETING REGRESSION)`

The implementation only retains Microsoft Clarity. It completely omits TikTok Pixel, Google Analytics/GTM dataLayer events for phone/Zalo clicks, and UTM parameter attribution, creating severe marketing blindspots.
