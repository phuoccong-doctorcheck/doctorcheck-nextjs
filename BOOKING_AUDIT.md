# Phase 6: Booking & Form Conversion Audit

**Project:** DoctorCheck Next.js Migration  
**Target Codebase:** `d:\LandingPages\DoctorCheck`  
**Date:** 2026-09-15  
**Auditor:** Antigravity AI Engineering Team  

---

## 1. Executive Summary

| Form / Endpoint Component | Implementation Mechanism | Vulnerability / Defect Detected | Status |
| :--- | :--- | :--- | :---: |
| **Booking Form (`BookingForm.tsx`)** | Client-side React form with Zod schema | Submits to `/api/booking`. Lacks UTM attribution parameters. | **FAIL** |
| **Booking API Route (`/api/booking`)** | Route Handler with rate limiting & honeypot | **Leads saved to ephemeral in-memory array (`bookingsStore = []`).** Permanent data loss upon restart or serverless scale-down! | **CRITICAL BLOCKER** |
| **Contact Form (`ContactForm.tsx`)** | Client-side React form | Submits to `/api/contact`. | **PASS** |
| **Contact API Route (`/api/contact`)** | Route Handler with Zod schema | **Discards contact inquiries into `console.log`. Zero database or email persistence!** | **CRITICAL BLOCKER** |
| **CRM Integration** | None | **Production CRM lead receiver is UNKNOWN and unconfigured.** | **CRITICAL BLOCKER** |
| **Marketing Attribution** | None | Fails to extract `utm_source`, `utm_medium`, `utm_campaign`, `gclid`, or referrer. | **HIGH FAIL** |
| **Patient Data Privacy** | Plaintext logs | Patient names and phone numbers printed to unencrypted server stdout logs. | **HIGH RISK** |

---

## 2. Critical Defect Analysis: Lead Loss & Fake Persistence

### 2.1. In-Memory Array Data Loss Bug (`src/lib/cms/api.ts`)
Inspection of `src/lib/cms/api.ts` lines 98–110 reveals how patient appointment bookings are handled:

```typescript
// In-memory store for lead captures in current session (persisted via DB when configured)
const bookingsStore: BookingLead[] = []

export async function saveBookingLead(lead: BookingLead): Promise<{ success: boolean; id: string }> {
  const id = `lead-${Date.now()}`
  const entry: BookingLead = {
    ...lead,
    id,
    status: 'new',
    createdAt: new Date().toISOString(),
  }
  bookingsStore.push(entry)
  console.log('[LEAD CAPTURED]:', entry)
  return { success: true, id }
}
```

> [!CAUTION]
> **Total Patient Lead Discard Hazard:**  
> 1. `bookingsStore` is a simple JavaScript memory array variable inside Node.js memory.  
> 2. On Vercel, AWS Lambda, Docker container recycling, or any Node.js server restart, the memory array is wiped clean to `[]`.  
> 3. The user is presented with a success message: `"Đăng ký khám thành công! Bác sĩ tư vấn của DoctorCheck sẽ gọi lại xác nhận trong vòng 15 phút."`  
> 4. Meanwhile, the lead was never saved to PostgreSQL, SQLite, Payload CMS collections, CRM, email, or webhook.  
> 5. **Result: Patients receive confirmation but clinic staff never receive the booking. Patients arrive at the clinic without an appointment.**

---

### 2.2. Contact Form Silent Discard Bug (`src/app/api/contact/route.ts`)
Inspection of `src/app/api/contact/route.ts` lines 34–41 reveals how general patient inquiries are handled:

```typescript
console.log('[CONTACT MESSAGE RECEIVED]:', result.data)

return NextResponse.json({
  success: true,
  message: 'Cảm ơn bạn đã liên hệ! Bộ phận Chăm sóc Khách hàng DoctorCheck sẽ phản hồi sớm nhất.',
})
```

- **Analysis:** The contact API route parses the payload, logs it to stdout (`console.log`), and returns `success: true`. It does not persist the message to any database, does not create a ticket, and does not dispatch an email notification. The contact lead is discarded into volatile log streams.

---

### 2.3. Production CRM Receiver: `UNKNOWN` State
- The production lead receiver (Google Sheets, HubSpot, GetFly CRM, custom REST webhook, or SMTP notification) is **completely unconfigured and UNKNOWN**.
- Per audit guidelines:
  - Faking successful submissions without verified delivery is strictly unacceptable.
  - The booking flow cannot be declared production-ready until a verified `LeadReceiver` is implemented with fallback persistent storage (e.g. Supabase, PostgreSQL, or encrypted local storage) and automatic retry queuing.

---

## 3. Marketing Attribution & Tracking Regression

- The live WordPress site relies heavily on digital performance ads (Google Ads, Facebook Ads, TikTok Ads) using UTM parameters (`utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term`, `gclid`, `fbclid`).
- In `BookingForm.tsx`:
  - There is zero code to inspect `window.location.search`, `sessionStorage`, or URL search parameters.
  - The booking payload sent to `/api/booking` does not include UTM fields or landing page referrers.
  - **Marketing Consequence:** If launched, all paid marketing attribution drops to 0%, destroying return-on-ad-spend (ROAS) calculations for clinic marketing campaigns.

---

## 4. Patient Data Privacy & Compliance (Decree 13/2023/NĐ-CP)

- In both `/api/booking` and `/api/contact`:
  - Unmasked patient names, mobile phone numbers, and clinical symptoms are written directly to application standard output (`console.log('[LEAD CAPTURED]:', entry)`).
  - In cloud monitoring platforms (Datadog, CloudWatch, Vercel Logs), these logs expose unprotected Personal Identifiable Information (PII) and protected medical inquiry data to unauthorized log viewers.
  - Under Vietnam's Personal Data Protection Decree (Decree 13/2023/NĐ-CP), healthcare data requires strict encryption-at-rest, access control, and audit logging.

---

## 5. Booking & Form Audit Verdict: `BLOCKER`

Both the booking and contact flows present critical operational hazards: leads are discarded into volatile in-memory variables and console logs, the CRM endpoint is unintegrated, marketing attribution is completely lost, and patient PII is leaked in server logs.
