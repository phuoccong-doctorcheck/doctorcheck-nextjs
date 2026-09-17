# Phase 8: Security & Privacy Audit

**Project:** DoctorCheck Next.js Migration  
**Target Codebase:** `d:\LandingPages\DoctorCheck`  
**Date:** 2026-09-15  
**Auditor:** Antigravity AI Engineering Team  

---

## 1. Executive Summary

| Security Domain | Evaluated Mechanism | Severity | Status |
| :--- | :--- | :---: | :---: |
| **Next.js Image Proxy Vulnerability** | `remotePatterns: [{ hostname: '**' }]` allows open image SSRF / DoS attacks. | **HIGH** | **FAIL** |
| **Patient PII Log Leakage** | Plaintext logging of patient names and mobile numbers in `/api/booking`. | **HIGH** | **FAIL** |
| **Serverless Rate Limiting Bypass** | In-memory token bucket rate limiting resets across stateless instances. | **MEDIUM** | **WARNING** |
| **HTTP Security Headers** | CSP, HSTS, X-Frame-Options DENY, X-Content-Type-Options nosniff configured. | Low | **PASS** |
| **Honeypot Anti-Bot Defense** | Hidden `website_url` input field filters automated spam submissions cleanly. | Low | **PASS** |
| **Input Validation & Sanitization** | Zod schemas enforce string length and regex boundaries on phone numbers. | Low | **PASS** |
| **Secrets & Credential Exposure** | No hardcoded API keys or database passwords committed to Git. | Low | **PASS** |

---

## 2. Detailed Vulnerability Findings

### 2.1. VULN-01: Open Image Optimization Proxy (SSRF / Cache Poisoning)
In `next.config.ts` lines 34–45:

```typescript
images: {
  formats: ['image/avif', 'image/webp'],
  deviceSizes: [640, 750, 828, 1080, 1200, 1920],
  imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  remotePatterns: [
    {
      protocol: 'https',
      hostname: '**', // WILDCARD HOSTNAME
    },
  ],
}
```

- **Vulnerability Explanation:**  
  Configuring `hostname: '**'` turns the Next.js `/_next/image` endpoint into an unrestricted open HTTP proxy. Attackers can request `/_next/image?url=https://malicious-site.com/huge-image.png&w=1920&q=75`, causing the Next.js server to download, transform, and cache arbitrary external payloads, exhausting server CPU and bandwidth.
- **Required Remediation:**  
  Restrict `remotePatterns` strictly to trusted CDN hostnames:
  ```typescript
  remotePatterns: [
    {
      protocol: 'https',
      hostname: 'imagedelivery.net',
      pathname: '/VX_wpsBa_s5hNlg6_mgdXg/**',
    },
  ]
  ```

---

### 2.2. VULN-02: Patient Health PII Leakage in Standard Output Logs
In `src/lib/cms/api.ts` line 108:

```typescript
console.log('[LEAD CAPTURED]:', entry)
```

- **Vulnerability Explanation:**  
  When a patient registers an appointment for sensitive services (e.g. colorectal endoscopy, cancer screening, gynecology), `entry` contains:
  - Patient Full Name (`patientName`)
  - Personal Mobile Phone Number (`phone`)
  - Email Address (`email`)
  - Requested Clinical Service (`service`)
  - Medical Notes & Symptoms (`notes`)
- This plaintext payload is printed directly to application logs. In cloud hosting environments, these logs are ingested by third-party log collectors, violating Vietnam's Personal Data Protection Decree (Decree 13/2023/NĐ-CP) regarding confidential patient healthcare data.
- **Required Remediation:**  
  Mask sensitive PII in all application logs (e.g. `phone: '090****123'`) and never log clinical notes to standard output.

---

### 2.3. VULN-03: In-Memory Rate Limiter Reset in Serverless Deployments
In `src/lib/security/ratelimit.ts`:
- Rate limiting is managed using an in-memory `Map<string, { tokens: number; lastRefill: number }>()`.
- On serverless platforms (e.g. Vercel, AWS Lambda, Cloudflare Workers), every incoming HTTP request can spin up an isolated container or worker instance.
- In-memory state is not shared between serverless functions. An attacker can distribute spam requests across multiple parallel connections, bypassing the token-bucket rate limiter entirely.
- **Required Remediation:**  
  Deploy distributed Redis-based rate limiting (e.g. Upstash Redis `@upstash/ratelimit`) or edge Cloudflare WAF rate limiting for production lead endpoints.

---

## 3. Security Audit Verdict: `WARNING (ACTION REQUIRED)`

While basic defenses (honeypot, Zod validation, security headers) are implemented, the open image proxy wildcard and plaintext patient PII logging pose critical security and legal compliance risks that must be fixed before deployment.
