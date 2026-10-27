# FutureSelector — Security, Data Privacy & Vulnerability Audit

> **Document Version:** 1.0.0  
> **Audit Date:** October 2026  
> **Classification:** Confidential Technical Security Review  
> **Methodology:** Safe local static code analysis, route inspection, middleware evaluation, and RBAC boundary testing.  

---

## 1. Security Findings Executive Summary

| ID | Vulnerability / Architecture Issue | Severity | Target Component | Production Safe? | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **SEC-01** | Hardcoded Demo OTP Bypass (`2026`) | **HIGH** | `server/routes/authRoutes.js`, `server/utils/otpService.js` | ✅ YES (Isolated) | **`RESOLVED`** (FS-P0-02): Fixed demo OTP strictly rejected in prod. 5-min TTL, single-use, max 3 attempts, 30s cooldown enforced. |
| **SEC-02** | Master Secret Key Login Bypass (`ADMIN_SECRET_KEY`) | **MEDIUM** | `server/routes/adminRoutes.js`, `server/middleware/adminAuth.js` | ✅ YES (Isolated) | **`RESOLVED`** (FS-P0-02): Secret key bypass strictly blocked in production. Synthetic admin user removed; requires real MongoDB `AdminUser`. |
| **SEC-03** | Lack of Rate Limiting on Public Endpoints | **MEDIUM** | `server/utils/otpService.js` | ✅ YES (OTP) | **`PARTIALLY_RESOLVED`** (FS-P0-02): OTP endpoint hardened with 30s cooldown and max 5/15min window per phone. General endpoints pending. |
| **SEC-04** | Permissive CORS Configuration (`origin: "*"`) | **LOW** | `server/server.js` (L22-26) | ⚠️ Dev/Staging | Needs Domain Restriction |
| **SEC-05** | LocalStorage Token Storage (XSS Exposure Vector) | **LOW** | `client/src/context/` | ⚠️ Standard SPA | Mitigated by Sanitization |
| **SEC-06** | Student Data Privacy Shield (Consent Verification) | **VERIFIED** | `server/routes/leadRoutes.js` | ✅ YES | Tenant Isolated & Verified |
| **SEC-07** | IDOR Rejection on Cross-Institute Leads | **VERIFIED** | `server/routes/partnerRoutes.js` | ✅ YES | Tenant Isolated & Verified |
| **SEC-08** | Immediate Partner Revocation on Suspension | **VERIFIED** | `server/middleware/partnerAuth.js` | ✅ YES | Verified in E2E Suite |
| **SEC-09** | Duplicate Admission & Commission Prevention | **VERIFIED** | `server/routes/adminRoutes.js` | ✅ YES | Double Claim Blocked |

---

## 2. In-Depth Vulnerability Analysis & Remediation

---

### SEC-01 — Hardcoded Demo OTP Bypass (`2026`)
- **Severity**: **HIGH (P0 Blocker)**
- **Status**: **RESOLVED via Task FS-P0-02**
- **Remediated Files**: `server/utils/otpService.js`, `server/routes/authRoutes.js`, `client/src/pages/Login.jsx`, `client/src/component/AuthModal.jsx`
- **Implemented Security Controls**:
  1. Cryptographically secure 4-digit numeric OTP generation (`crypto.randomInt(1000, 10000)`).
  2. Automatic 5-minute TTL expiry.
  3. Single-use consumption (OTP is purged from memory immediately upon successful verification).
  4. Max 3 verification attempts limit before automatic lockout and purging.
  5. Per-phone rate limiting: 30-second resend cooldown and max 5 requests per 15-minute rolling window.
  6. **Production Separation**: In production (`NODE_ENV === "production"`), the fixed demo OTP `"2026"` is strictly rejected with HTTP 400. If `SMS_GATEWAY_API_KEY` is not configured, production OTP requests return HTTP 503 instead of fabricating delivery.
  7. **Automated Verification**: Verified across 16 unit and integration test cases in `scripts/test_auth_security.cjs`.

---

### SEC-02 — Master Secret Key Admin Authentication Bypass
- **Severity**: **MEDIUM (Operational Governance Risk)**
- **Status**: **RESOLVED via Task FS-P0-02**
- **Remediated Files**: `server/routes/adminRoutes.js`, `server/middleware/adminAuth.js`, `client/src/layout/AdminLayout.jsx`
- **Implemented Security Controls**:
  1. Secret key login is strictly disabled in production (`NODE_ENV === "production"` or `ALLOW_ADMIN_SECRET_KEY === "false"`), returning HTTP 403 Forbidden.
  2. Synthetic user bypass (`admin_master_root`) completely removed from codebase.
  3. All admin logins require an authenticated, active `AdminUser` document in MongoDB verified via bcrypt (`matchPassword`).
  4. Admin middleware (`protectAdmin`) verifies the `decoded.id` against the MongoDB database and blocks suspended or nonexistent administrators.
  5. Admin frontend UI updated with Dual-Mode login (Production standard Email/Password vs. Dev Secret Key).
  - Restrict production admin logins strictly to email + bcrypt password with multi-factor authentication (MFA). Deprecate the secret key login in production.

---

### SEC-03 — Lack of Rate Limiting on Public Endpoints
- **Severity**: **MEDIUM**
- **File & Location**: `server/server.js`
- **Current Observation**: No `express-rate-limit` middleware is mounted on `/api/auth/send-otp`, `/api/enquiries`, or `/api/counselling/create-order`.
- **Security Impact**: An attacker can execute a script sending 10,000 OTP requests per minute, exhausting SMS API credits or causing denial of service.
- **Recommended Remediation**:
  Mount `express-rate-limit`:
  ```javascript
  const rateLimit = require("express-rate-limit");
  const otpLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 OTP requests per window
    message: { error: "Too many OTP requests. Please try again after 15 minutes." }
  });
  app.use("/api/auth/send-otp", otpLimiter);
  ```

---

### SEC-04 — Permissive CORS Policy (`origin: "*"`)
- **Severity**: **LOW**
- **File & Location**: `server/server.js` (Lines 22–26)
- **Observation**: Server allows requests from any origin (`origin: "*"`).
- **Security Impact**: Any third-party malicious website could issue API calls using the user's IP address.
- **Recommended Remediation**:
  In production, whitelist only official domains:
  ```javascript
  const allowedOrigins = [
    "https://futureselector.com",
    "https://www.futureselector.com",
    "https://futureselector.vercel.app"
  ];
  app.use(cors({ origin: allowedOrigins, credentials: true }));
  ```

---

### SEC-05 — LocalStorage Token Storage
- **Severity**: **LOW**
- **File & Location**: `client/src/context/AuthContext.jsx`, `client/src/context/AdminAuthContext.jsx`
- **Observation**: JWT tokens are stored in browser `localStorage` (`fs_token`, `fs_partner_token`, `fs_admin_token`).
- **Security Impact**: Vulnerable to token theft if the web app contains an XSS vulnerability.
- **Mitigation Status**: Currently acceptable for React SPAs without third-party script injection. For high-security enterprise hardening, transition administrative tokens to `httpOnly`, `SameSite=Strict`, `Secure` cookies.

---

## 3. Verified Security Strengths (Positive Audit Findings)

### 1. Privacy Shield & Explicit Student Consent
- **Inspected Route**: `server/routes/leadRoutes.js`, `server/routes/partnerRoutes.js`
- **Verification Result**: Verified in E2E Test Suite. When a student submits an inquiry, `releasedToInstitute` is set to `false`. The partner portal API filters by `releasedToInstitute: true`. The center manager has zero visibility of the student's phone number until the student checks the consent box. Consent timestamp and client IP are permanently recorded in the `Lead` document.

### 2. Multi-Tenant Cross-Institute Data Isolation (IDOR Immunity)
- **Inspected Middleware**: `server/middleware/partnerAuth.js`
- **Verification Result**: Verified in E2E Test Suite. Partner tokens are cryptographically scoped to `instituteNumericId`. When Allen's partner attempts to fetch leads or tickets belonging to Apex Institute, the database query automatically scopes to Allen's ID (`{ instituteNumericId: req.partner.instituteNumericId }`), rendering cross-tenant data access structurally impossible.

### 3. Immediate Server-Side Access Revocation on Suspension
- **Inspected Middleware**: `server/middleware/partnerAuth.js`
- **Verification Result**: Verified in E2E Test Suite. Rather than relying solely on JWT expiry, the middleware queries the `Institute` model on every authenticated request. If the Super Admin suspends the institute, the partner's active JWT is immediately rejected with HTTP 403 Forbidden.

### 4. 4-Point Admission Verification & Duplicate Ledger Rejection
- **Inspected Controller**: `server/routes/adminRoutes.js`
- **Verification Result**: Verified in E2E Test Suite. The system checks if a commission transaction already exists for the voucher code. Duplicate verification attempts return HTTP 400, preventing double commission payouts.
