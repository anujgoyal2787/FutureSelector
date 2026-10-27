# FutureSelector — Master Execution Plan & Engineering Roadmap

> **Document Version:** 1.0.0  
> **Audit Date:** October 2026  
> **Status Tracking:** Prioritized backlog of remaining tasks based on empirical audit findings.  
> **Rule:** No code will be modified until explicit founder approval is granted.  

---

## 1. Roadmap Prioritization Methodology

- **P0 (Immediate Blockers & Security)**: Broken core flows where UI contradicts database facts, or security vulnerabilities that prevent pilot testing.
- **P1 (Core Functional Integrity & Persistence)**: Converting mock/UI-only pages into real database-backed modules with persistent storage.
- **P2 (Production Integrations & Operational Rigor)**: External gateways (SMS DLT, Cloud storage, email relays, rate limiting).
- **P3 (Visual Polish, Reviews & Enhancements)**: Testimonials moderation, advanced analytics filters, UI micro-interactions.

---

## 2. Prioritized Task Registry

---

### Phase 1: Priority P0 — Critical Fixes & Broken Link Remediation

#### Task `FS-P0-01`: Connect Coaching Comparison Engine to Live MongoDB Atlas
- **Priority**: **P0** | **Complexity**: **Medium (M)** | **Status**: **`VERIFIED_COMPLETE`** (Verified via test_compare_live.cjs & Browser Subagent)
- **Description**: Migrate `client/src/pages/Compare.jsx` from the static `client/src/data/institutes.js` array to the live `GET /api/institutes` and `GET /api/institutes/compare` endpoints.
- **Reason & Impact**: Currently, any new coaching added by Super Admin in MongoDB Atlas never appears in comparison tables or selection dropdowns.
- **Relevant Files**:
  - `client/src/pages/Compare.jsx`
  - `client/src/services/api.js`
  - `server/routes/instituteRoutes.js`
- **Dependencies**: None.
- **Implementation Approach**:
  1. Add `useEffect` in `Compare.jsx` calling `instituteAPI.getAll()`.
  2. Map comparison contenders using live database `numericId` or MongoDB `_id`.
  3. Update preset buttons (Allen vs Resonance, etc.) to query live institutes by slug or ID.
- **Acceptance Criteria**:
  - Super Admin adds a new institute ("Apex Career Academy") in Admin suite.
  - Student visits `/compare`, searches "Apex", and selects it as Contender 2.
  - Fees, batch sizes, and faculty roster load dynamically from MongoDB Atlas.
- **Required Tests**: Manual browser check + automated E2E test.

---

#### Task `FS-P0-02`: Production-Hardened Authentication & Demo/Prod Separation
- **Priority**: **P0** | **Complexity**: **Medium (M)** | **Status**: **`COMPLETED_AND_VERIFIED`**
- **Description**: Secure student mobile OTP authentication and Super Admin access control. Separate development/demo mode from production, enforce 5-minute TTL expiry, single-use consumption, max 3 attempts limit, rate limiting (30s cooldown, max 5 per 15 min), and completely block demo OTP `2026` and admin master key bypass in production.
- **Reason & Impact**: Completely mitigates unauthorized account takeover and administrative backdoor bypasses without requiring paid SMS purchases during free development.
- **Relevant Files**:
  - `server/utils/otpService.js` (New Service)
  - `server/routes/authRoutes.js`
  - `server/routes/adminRoutes.js`
  - `server/middleware/adminAuth.js`
  - `client/src/component/AuthModal.jsx`
  - `client/src/pages/Login.jsx`
  - `client/src/pages/Dashboard.jsx`
  - `client/src/layout/AdminLayout.jsx`
  - `scripts/test_auth_security.cjs` (New Automated Test Suite)
- **Implementation Highlights**:
  1. Built `server/utils/otpService.js` with cryptographically secure 4-digit numeric OTPs (`crypto.randomInt`), 5-minute TTL, single-use consumption, max 3 attempts lockout, and per-phone rolling window rate limiting.
  2. Fixed demo OTP `2026` is strictly rejected in production with HTTP 400.
  3. Production OTP generation without configured `SMS_GATEWAY_API_KEY` cleanly returns HTTP 503 rather than inventing fake delivery.
  4. Blocked administrative master key bypass in production; eliminated synthetic `admin_master_root` object and enforced real MongoDB `AdminUser` bcrypt verification.
  5. Implemented Dual-Mode Super Admin login modal (Production Email/Password vs. Dev Secret Key).
- **Verification Evidence**:
  - Automated test suite `scripts/test_auth_security.cjs` passed (16/16 tests).
  - Existing `scripts/test_student_auth.cjs` passed (13/13 tests).
  - Existing `scripts/test_compare_live.cjs` passed (16/16 tests).
  - Existing `scripts/test_counselling_payment.cjs` passed (18/18 tests).
  - Production client build passed (`npm --prefix client run build` in 5.11s).

---

### Phase 2: Priority P1 — Real Data Persistence for Mock Admin Modules

#### Task `FS-P1-01`: Build Database-Backed Website CMS Engine
- **Priority**: **P1** | **Complexity**: **Medium (M)** | **Status**: **`NOT_STARTED`**
- **Description**: Convert `AdminCMS.jsx` from local React state into a real MongoDB-backed content management system.
- **Reason & Impact**: Currently, hero text and announcement marquee changes show a fake success toast and are lost on page refresh.
- **Relevant Files**:
  - `server/models/CMSContent.js` (New Model)
  - `server/routes/adminRoutes.js`
  - `client/src/pages/admin/AdminCMS.jsx`
  - `client/src/pages/Home.jsx`
- **Dependencies**: None.
- **Implementation Approach**:
  1. Create `CMSContent` schema with fields: `heroTitle`, `heroSubtitle`, `announcementText`, `announcementActive`, `featuredCities`.
  2. Implement `GET /api/cms` (public) and `PUT /api/admin/cms` (protected).
  3. Wire `AdminCMS.jsx` to fetch and save via `api.js`.
  4. Wire `Home.jsx` to display live announcement banner from `GET /api/cms`.
- **Acceptance Criteria**:
  - Admin changes announcement text to "🚨 TALLENTEX 2026 registrations extended till Sunday!".
  - Admin clicks "Save & Publish".
  - Student visits `/` (Home) and immediately sees the updated announcement ticker.
- **Required Tests**: Automated API test for CMS get/put.

---

#### Task `FS-P1-02`: Build Real Course & Scholarship Catalog Management
- **Priority**: **P1** | **Complexity**: **Large (L)** | **Status**: **`NOT_STARTED`**
- **Description**: Replace hardcoded arrays in `AdminCourses.jsx` and `Scholarships.jsx` with real Mongoose models and CRUD endpoints.
- **Reason & Impact**: Buttons in `AdminCourses.jsx` fire dummy `alert()` popups; courses cannot be added or updated.
- **Relevant Files**:
  - `server/models/Course.js` (New Model)
  - `server/models/Scholarship.js` (New Model)
  - `server/routes/adminRoutes.js`
  - `client/src/pages/admin/AdminCourses.jsx`
  - `client/src/pages/Scholarships.jsx`
- **Dependencies**: None.
- **Implementation Approach**:
  1. Create Mongoose models for `Course` and `Scholarship`.
  2. Mount CRUD endpoints under `/api/admin/courses` and `/api/admin/scholarships`.
  3. Replace static tables in `AdminCourses.jsx` with live data fetching and modal edit forms.
  4. Update `Scholarships.jsx` to load active scholarship exams from `/api/scholarships`.
- **Acceptance Criteria**:
  - Admin adds new course "Dropper Intensive NEET Crash Batch".
  - Course appears in course table and persists across backend restarts.
- **Required Tests**: CRUD API integration tests.

---

#### Task `FS-P1-03`: Wire Admin Platform Settings & Real Health Indicator
- **Priority**: **P1** | **Complexity**: **Small (S)** | **Status**: **`NOT_STARTED`**
- **Description**: Connect `AdminSettings.jsx` to live `/api/health` and persistent configuration storage.
- **Reason & Impact**: Page falsely displays "MongoDB Connected (Localhost:27017)" when connected to MongoDB Atlas.
- **Relevant Files**:
  - `client/src/pages/admin/AdminSettings.jsx`
  - `server/routes/adminRoutes.js`
- **Dependencies**: None.
- **Implementation Approach**:
  1. Call `GET /api/health` on mount to display actual connected host.
  2. Implement `GET /api/admin/settings` and `PUT /api/admin/settings`.
- **Acceptance Criteria**:
  - Status badge dynamically reflects MongoDB Atlas host and live latency.

---

#### Task `FS-P1-04`: Dynamic Platform Headline Statistics
- **Priority**: **P1** | **Complexity**: **Small (S)** | **Status**: **`NOT_STARTED`**
- **Description**: Replace hardcoded strings in `GET /api/stats` with real MongoDB aggregation queries.
- **Reason & Impact**: Currently returns static `"120+"`, `"1,420+"`.
- **Relevant Files**:
  - `server/server.js` (L76-86)
- **Dependencies**: None.
- **Implementation Approach**:
  1. In `/api/stats`, query:
     - `totalInstitutes`: `await Institute.countDocuments({ publicationStatus: "PUBLISHED" })`
     - `activeLeads`: `await Lead.countDocuments()`
     - `confirmedAdmissions`: `await CommissionLedger.countDocuments()`
     - `averageFeeSavings`: `"₹15,000 Flat Grant"`
- **Acceptance Criteria**:
  - Counter metrics reflect real database counts with dynamic increments.

---

### Phase 3: Priority P2 — Operational Security, Rate Limiting & Storage

#### Task `FS-P2-01`: Express Rate Limiting & Anti-Abuse
- **Priority**: **P2** | **Complexity**: **Small (S)** | **Status**: **`NOT_STARTED`**
- **Description**: Install and mount `express-rate-limit` on public routes.
- **Relevant Files**: `server/server.js`, `server/package.json`.
- **Implementation Approach**: Limit OTP requests to 5 per 15 mins per IP. Limit inquiry submissions to 10 per hour per IP.

---

#### Task `FS-P2-02`: Cloud File Upload Integration (AWS S3 / Cloudinary)
- **Priority**: **P2** | **Complexity**: **Medium (M)** | **Status**: **`NOT_STARTED`**
- **Description**: Add real image upload for coaching photos and student admission receipts (`REC-XXXX`).
- **Relevant Files**: `server/utils/uploader.js`, `server/routes/partnerRoutes.js`.

---

#### Task `FS-P2-03`: Automated Test Suite Teardown & Test Isolation
- **Priority**: **P2** | **Complexity**: **Medium (M)** | **Status**: **`NOT_STARTED`**
- **Description**: Update `scripts/e2e_acceptance_suite.cjs` and `scripts/test_student_auth.cjs` to purge created test institutes, leads, and student accounts at the end of each run.
- **Relevant Files**: `scripts/e2e_acceptance_suite.cjs`, `scripts/test_student_auth.cjs`.

---

### Phase 4: Priority P3 — Polish, Reviews & Enhancements

#### Task `FS-P3-01`: Student Review Submission & Moderation Pipeline
- **Priority**: **P3** | **Complexity**: **Medium (M)** | **Status**: **`NOT_STARTED`**
- **Description**: Replace static testimonials with dynamic reviews submitted by students whose admissions have been verified.
