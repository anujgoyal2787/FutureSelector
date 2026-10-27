# FutureSelector — Project Changelog & Verification History

> **Document Version:** 1.0.0  
> **Repository:** `FutureSelector/FutureSelector`  
> **Format:** Keep a Changelog (Standard Semantic Versioning)  

---

## [Unreleased] — Verified Completed Tasks
- **[Task FS-P0-02 Completed & Verified]**: Production-Hardened Authentication & Demo/Prod Separation.
  - Implemented `server/utils/otpService.js` with cryptographically secure 4-digit numeric OTPs, 5-minute TTL, single-use consumption, max 3 attempts limit, and rolling window rate limiting (30s cooldown, max 5 per 15 min).
  - Explicitly separated demo and production authentication via `NODE_ENV`, `ALLOW_DEMO_OTP`, and `ALLOW_ADMIN_SECRET_KEY`.
  - Fixed demo OTP `2026` is strictly rejected in production mode with HTTP 400.
  - Production OTP requests return HTTP 503 Service Unavailable when `SMS_GATEWAY_API_KEY` is not configured, preventing fraudulent fake delivery claims.
  - Disabled administrative master secret key bypass in production mode with HTTP 403; removed synthetic `admin_master_root` object and enforced real MongoDB `AdminUser` bcrypt verification.
  - Added Dual-Mode Super Admin gateway in `AdminLayout.jsx` (Production Email/Password vs. Dev Secret Key).
  - Added comprehensive test suite `scripts/test_auth_security.cjs` (16/16 tests passed).
  - Verified student auth suite `scripts/test_student_auth.cjs` (13/13 tests passed).
  - Verified client production build (`npm --prefix client run build` completed in 5.11s).
- **[Task FS-P0-01 Completed & Verified]**: Connected `Compare.jsx` to live MongoDB Atlas via `instituteAPI.getAll()`.
  - Added live data synchronization hook with graceful fallback.
  - Added visual connection badge `Live MongoDB Atlas (X Centers)`.
  - Dynamic center selector dropdown now lists all published institutes from MongoDB Atlas.
  - Verified via automated suite `scripts/test_compare_live.cjs` (16/16 checks passed) and live browser subagent visual audit.
- Next Up: Phase 2 tasks (`FS-P1-01` to `FS-P1-04`: CMS, Courses, Settings, and Stats persistence).

---

## [1.2.0] — 2026-10-27 (Comprehensive Project Audit & Master Documentation)

### Added
- Created dedicated comprehensive documentation suite in `docs/`:
  - `docs/PROJECT_OVERVIEW.md`: System mission, personas, business model, and boundaries.
  - `docs/ARCHITECTURE.md`: Technical stack, Express 5.2/React 19 specs, directory tree, auth flow.
  - `docs/FEATURE_STATUS.md`: Feature-by-feature verification matrix across all roles.
  - `docs/STATIC_DATA_AUDIT.md`: Master static data register, priority, evidence, and replacement plan.
  - `docs/WORKFLOWS_HINGLISH.md`: Complete business workflows (A–S) in technical Hinglish with Mermaid flowcharts.
  - `docs/API_REFERENCE.md`: Complete REST endpoint catalog and end-to-end traceability matrix.
  - `docs/DATABASE_REFERENCE.md`: MongoDB Atlas collections, verified document counts, 13 Mongoose schemas, and indexes.
  - `docs/SECURITY_AUDIT.md`: Vulnerability review, IDOR immunity, and student privacy shield audit.
  - `docs/TESTING_AND_VERIFICATION.md`: Test suite analysis, results, and teardown debt report.
  - `docs/DEPLOYMENT_READINESS.md`: Readiness evaluation for College Demo, Private Beta, and Public Launch.
  - `docs/MASTER_EXECUTION_PLAN.md`: P0-P3 prioritized engineering roadmap with acceptance criteria.
  - `docs/DECISIONS_AND_OPEN_QUESTIONS.md`: Pending business decisions for the founder.
  - `docs/PROJECT_CHANGELOG.md`: Chronological log of verified milestones.
  - `docs/INTERVIEW_PREPARATION_HINGLISH.md`: Complete CSE student interview guide for SDE/Full Stack roles.

### Audited & Verified
- Inspected all 11 consumer pages, 13 Super Admin modular pages, 13 Mongoose models, 8 backend route controllers.
- Verified MongoDB Atlas cloud connection (`futureselector` database) and documented real document counts.
- Identified 4 `UI_ONLY` mock admin pages and the disconnected comparison engine.

---

## [1.1.0] — 2026-10-26 (Razorpay Live Gateway & Real Contact Migration - Commit `19f789e`)

### Added
- Live Razorpay merchant key integration (`rzp_live_TsfmDISCjEzDYj`) in server `.env` and `Counselling.jsx`.
- Verified HMAC SHA256 payment signature verification in `counsellingRoutes.js`.
- Automated Razorpay payment test suite (`scripts/test_counselling_payment.cjs`).

### Changed
- Replaced simulated fake persona mentors in counseling workflow with the official **FutureSelector Senior Academic Advisory Desk (Kota Central Hub)**.
- Integrated official WhatsApp support number `+91 90709 01847` across `Counselling.jsx`, `Dashboard.jsx`, and `mailer.js`.
- Upgraded counseling appointment booking to persist verified payment records in MongoDB Atlas.

---

## [1.0.0] — Initial MERN Architecture & Multi-Tenant Foundations
- Configured Express 5.2 server with Mongoose 9.11 database pooling.
- Implemented Super Admin 13-module operations suite.
- Implemented Multi-Tenant Partner Portal with student privacy shield and explicit consent enforcement.
- Built React 19 SPA with TailwindCSS, Framer Motion, and Three.js hero canvas.
- Configured initial seed data fixtures for Kota coaching hubs.
