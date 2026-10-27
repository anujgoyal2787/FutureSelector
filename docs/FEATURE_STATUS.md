# FutureSelector — Feature-by-Feature Status Audit

> **Document Version:** 1.0.0  
> **Audit Date:** October 2026  
> **Methodology:** Direct inspection of React 19 client components, Express 5.2 routes, Mongoose 9.11 models, and MongoDB Atlas live collections.  

---

## 1. Status Categories Legend

| Status Category | Description |
| :--- | :--- |
| **`WORKING_AND_VERIFIED`** | Fully implemented across Frontend, Backend, and MongoDB, verified via automated test or manual live inspection. |
| **`IMPLEMENTED_BUT_NOT_FULLY_TESTED`** | Code exists end-to-end but edge cases or stress tests remain pending. |
| **`UI_ONLY`** | Component or page rendered in React with dummy state/alerts; no backend API or DB model exists. |
| **`STATIC_OR_HARDCODED`** | Feature renders hardcoded JS arrays/objects; ignores live database records. |
| **`MOCKED_OR_SIMULATED`** | Feature returns artificial responses, fixed OTPs, or mocked external services. |
| **`BACKEND_ONLY`** | Model and route exist in backend but have no frontend caller or page. |
| **`DISCONNECTED_INTEGRATION`** | Backend route exists and frontend exists, but frontend does not call it (or uses fallback). |
| **`BROKEN`** | Feature crashes or errors on execution. |
| **`NOT_IMPLEMENTED`** | Planned feature not yet written. |
| **`BLOCKED_BY_EXTERNAL_SERVICE`** | Requires paid external API credentials (e.g. DLT-registered SMS gateway). |

---

## 2. Comprehensive Feature Matrix

### A. Student & Public Portal

| Feature Name | Role | Frontend Path | Backend Path | MongoDB Model | API Endpoint | Data Source | Status | Evidence & Verification Notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **1. Mobile OTP Login / Signup** | Student | `client/src/component/AuthModal.jsx`, `client/src/pages/Login.jsx` | `server/routes/authRoutes.js`, `server/utils/otpService.js` | `User` (`users`) | `POST /api/auth/send-otp`, `POST /api/auth/verify-otp` | MongoDB Atlas | **`WORKING_AND_VERIFIED`** (Dev Mode) / **`BLOCKED_BY_EXTERNAL_SERVICE`** (Prod Real SMS) | Production-hardened with `otpService.js`. Enforces 5-minute TTL, single-use consumption, max 3 attempts lockout, and rate limiting (30s cooldown, max 5 per 15 min). Fixed demo OTP `2026` is strictly rejected in production. Real production SMS delivery returns 503 until a paid SMS provider (e.g. Fast2SMS / Twilio) is configured. Zero-cost demo authentication fully operational. Verified via `test_auth_security.cjs` (16/16 tests passed). |
| **2. Google 1-Click Login** | Student | `client/src/component/AuthModal.jsx`, `client/src/services/googleAuth.js` | `server/routes/authRoutes.js` | `User` (`users`) | `POST /api/auth/google` | Firebase + MongoDB | **`WORKING_AND_VERIFIED`** | Firebase client token verified; backend creates or updates `User` in Atlas. Generates random phone fallback if Google account has no phone. |
| **3. Student Profile Edit** | Student | `client/src/pages/Dashboard.jsx` | `server/routes/authRoutes.js` | `User` (`users`) | `PUT /api/auth/profile` | MongoDB Atlas | **`WORKING_AND_VERIFIED`** | Profile modal updates name, target exam, city, standard, dream college; persists via student JWT. |
| **4. Coaching Directory Search & Filter** | Public | `client/src/pages/FindCoaching.jsx` | `server/routes/instituteRoutes.js` | `Institute` (`institutes`) | `GET /api/institutes` | MongoDB with static fallback | **`WORKING_AND_VERIFIED`** | Loads institutes from `/api/institutes`. Falls back to `client/src/data/institutes.js` if API call fails. Filters by city, exam, batch size. |
| **5. Institute Deep-Dive Profile** | Public | `client/src/pages/InstituteProfile.jsx` | `server/routes/instituteRoutes.js` | `Institute` (`institutes`) | `GET /api/institutes/:idOrSlug` | MongoDB with static fallback | **`WORKING_AND_VERIFIED`** | Renders audited stats, faculty roster, fee structure, nearest hostels. Verified with both numeric ID and slug. |
| **6. Coaching Comparison Engine** | Public | `client/src/pages/Compare.jsx` | `server/routes/instituteRoutes.js` | `Institute` (`institutes`) | `GET /api/institutes`, `GET /api/institutes/compare` | MongoDB Atlas with static fallback | **`WORKING_AND_VERIFIED`** | Connected to live MongoDB Atlas via `instituteAPI.getAll()`. Dropdown and contenders query live published institutes. Verified via `test_compare_live.cjs` and browser subagent audit. |
| **7. Comparison PDF Export** | Public | `client/src/pages/Compare.jsx`, `client/src/utils/pdfGenerator.js` | None (Client-side jsPDF) | None | None | Client state | **`WORKING_AND_VERIFIED`** | Generates professional multi-page side-by-side comparison PDF using `jspdf` and `jspdf-autotable`. Works completely client-side. |
| **8. ₹15,000 Admission Pass Claim** | Student | `client/src/component/SeatLockModal.jsx` | `server/routes/voucherRoutes.js` | `Voucher` (`vouchers`), `Lead` (`leads`) | `POST /api/vouchers/claim` | MongoDB Atlas | **`WORKING_AND_VERIFIED`** | Locks pass, generates voucher ID, records explicit student consent, creates/reconciles Lead in Atlas, writes AuditLog. Verified in E2E suite. |
| **9. Student Passes Dashboard** | Student | `client/src/pages/Dashboard.jsx` | `server/routes/voucherRoutes.js` | `Voucher` (`vouchers`) | `GET /api/vouchers/my-passes` | MongoDB Atlas | **`WORKING_AND_VERIFIED`** | Queries vouchers by student phone or email. Renders pass card, QR representation, download PDF pass, and WhatsApp share. |
| **10. 1-on-1 Counseling Booking** | Student | `client/src/pages/Counselling.jsx` | `server/routes/counsellingRoutes.js` | `Counselling` (`counsellings`) | `POST /api/counselling/create-order`, `POST /api/counselling/verify-payment` | Razorpay Live + MongoDB Atlas | **`WORKING_AND_VERIFIED`** | Integrated with live Razorpay credentials (`rzp_live_...`). Verifies HMAC SHA256 signature, creates booking in Atlas, dispatches email via Nodemailer. |
| **11. Student Grievance Lodging (RMS)** | Student | `client/src/pages/Dashboard.jsx` | `server/routes/rmsRoutes.js` | `RMSTicket` (`rmstickets`) | `POST /api/rms/student-ticket`, `GET /api/rms/my-tickets` | MongoDB Atlas | **`WORKING_AND_VERIFIED`** | Students can submit counter dispute tickets, view history, confirm resolution, or reopen dispute. |
| **12. Scholarships & Exams Hub** | Public | `client/src/pages/Scholarships.jsx` | None | None | None | Hardcoded JS Arrays | **`STATIC_OR_HARDCODED`** | Lists TALLENTEX, ANTHE, FTRE, ResoFAST from static arrays. Scholarship calculator runs client-side formula. No backend model or API exists. |
| **13. Shortlist Coaching** | Student | `client/src/component/InstituteCard.jsx`, `client/src/pages/FindCoaching.jsx` | `server/routes/authRoutes.js` | `User` (`users`) | `PUT /api/auth/profile` | MongoDB Atlas + localStorage | **`WORKING_AND_VERIFIED`** | Saves array of shortlisted institute IDs to `User.shortlistedInstitutes` in Atlas and syncs with `localStorage`. |
| **14. Share With Parents Modal** | Public | `client/src/component/ShareWithParentsModal.jsx` | None | None | None | Client-side WhatsApp Web URL | **`WORKING_AND_VERIFIED`** | Generates pre-formatted WhatsApp deep-link message with institute metrics and counseling support contact. |

---

### B. Institute Partner Portal

| Feature Name | Role | Frontend Path | Backend Path | MongoDB Model | API Endpoint | Data Source | Status | Evidence & Verification Notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **15. Partner Login** | Partner | `client/src/pages/InstitutePortal.jsx` | `server/routes/partnerRoutes.js` | `PartnerUser` (`partnerusers`) | `POST /api/partner/auth/login` | MongoDB Atlas | **`WORKING_AND_VERIFIED`** | Verifies email and bcrypt password. Issues scoped partner JWT. Enforces active institute status. |
| **16. Partner Password Setup** | Partner | `client/src/pages/InstitutePortal.jsx` | `server/routes/partnerRoutes.js` | `PartnerUser` (`partnerusers`) | `POST /api/partner/auth/setup-password` | MongoDB Atlas | **`WORKING_AND_VERIFIED`** | Allows invited partner to set permanent password via temporary invite token. |
| **17. Attributed Leads Console** | Partner | `client/src/pages/InstitutePortal.jsx` | `server/routes/partnerRoutes.js` | `Lead` (`leads`) | `GET /api/partner/leads` | MongoDB Atlas | **`WORKING_AND_VERIFIED`** | Scoped strictly to partner's `instituteNumericId`. Shows only leads where `releasedToInstitute === true` (explicit student consent). |
| **18. Counter Voucher Verification** | Partner | `client/src/pages/InstitutePortal.jsx` | `server/routes/partnerRoutes.js` | `Voucher` (`vouchers`) | `POST /api/partner/verify-counter` | MongoDB Atlas | **`WORKING_AND_VERIFIED`** | Center receptionist enters voucher code to verify status, student name, and fee grant validity. |
| **19. Offline Admission Reporting** | Partner | `client/src/pages/InstitutePortal.jsx` | `server/routes/partnerRoutes.js` | `Voucher` (`vouchers`), `Lead` (`leads`) | `POST /api/partner/admissions/report` | MongoDB Atlas | **`WORKING_AND_VERIFIED`** | Partner reports student offline enrollment with receipt number, fee amount, and notes. Moves voucher status to `ADMISSION_REPORTED`. |
| **20. Partner Grievance Desk** | Partner | `client/src/pages/InstitutePortal.jsx` | `server/routes/partnerRoutes.js` | `RMSTicket` (`rmstickets`) | `GET /api/partner/rms`, `POST /api/partner/rms/:id/respond` | MongoDB Atlas | **`WORKING_AND_VERIFIED`** | Partner views assigned student dispute tickets and submits center response. Status transitions to `INSTITUTE_RESPONDED`. |
| **21. Sensitive Mutation Request** | Partner | `client/src/pages/InstitutePortal.jsx` | `server/routes/partnerRoutes.js` | `ApprovalRequest` (`approvalrequests`) | `POST /api/partner/submit-for-approval` | MongoDB Atlas | **`WORKING_AND_VERIFIED`** | Submits fee changes or profile alterations to Super Admin approval queue. |

---

### C. Super Admin Operations Suite (13 Modular Pages)

| Feature Name | Role | Frontend Path | Backend Path | MongoDB Model | API Endpoint | Data Source | Status | Evidence & Verification Notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **22. Admin Authentication** | Admin | `client/src/layout/AdminLayout.jsx` | `server/routes/adminRoutes.js` | `AdminUser` (`adminusers`) | `POST /api/admin/login` | MongoDB Atlas | **`WORKING_AND_VERIFIED`** | Authenticates via secret key or email/password. Issues admin JWT with `SUPER_ADMIN` role. |
| **23. Admin Metrics Dashboard** | Admin | `client/src/pages/admin/AdminDashboard.jsx` | `server/routes/adminRoutes.js` | Multiple | `GET /api/admin/metrics` | MongoDB Atlas | **`WORKING_AND_VERIFIED`** | Live counts of institutes, leads, admissions, ledger escrow, pending approvals, and active RMS tickets. |
| **24. Manual Institute Onboarding** | Admin | `client/src/pages/admin/AdminInstitutes.jsx` | `server/routes/adminRoutes.js` | `Institute` (`institutes`) | `POST /api/admin/institutes/manual` | MongoDB Atlas | **`WORKING_AND_VERIFIED`** | Admin manually adds new coaching with fees, contact person, agreement commission rate. Created in `DRAFT` status. |
| **25. Partner Account Provisioning** | Admin | `client/src/pages/admin/AdminInstitutes.jsx` | `server/routes/adminRoutes.js` | `PartnerUser` (`partnerusers`) | `POST /api/admin/institutes/:id/provision-partner` | MongoDB Atlas | **`WORKING_AND_VERIFIED`** | Generates partner credentials and setup URL. Idempotent (updates existing if already present). |
| **26. Institute Publication & Suspension** | Admin | `client/src/pages/admin/AdminInstitutes.jsx` | `server/routes/adminRoutes.js` | `Institute` (`institutes`) | `POST /api/admin/institutes/:id/publish`, `POST /api/admin/institutes/:id/suspend` | MongoDB Atlas | **`WORKING_AND_VERIFIED`** | Controls discovery visibility. Suspending immediately revokes partner portal access (HTTP 403). |
| **27. Attributed Leads Management & CSV** | Admin | `client/src/pages/admin/AdminLeads.jsx` | `server/routes/adminRoutes.js` | `Lead` (`leads`) | `GET /api/leads`, `GET /api/admin/export-csv` | MongoDB Atlas | **`WORKING_AND_VERIFIED`** | Filters all platform leads, status transitions, and exports complete CSV file. |
| **28. 4-Point Admission Verification** | Admin | `client/src/pages/admin/AdminAdmissions.jsx` | `server/routes/adminRoutes.js` | `Voucher`, `CommissionLedger` | `POST /api/admin/admissions/:id/verify` | MongoDB Atlas | **`WORKING_AND_VERIFIED`** | Verifies admission receipt, creates `CommissionLedger` in `ESCROW_LOCKED` status. Duplicate verification blocked. |
| **29. Commission Ledger & Escrow Payouts** | Admin | `client/src/pages/admin/AdminFinance.jsx` | `server/routes/adminRoutes.js` | `CommissionLedger` | `GET /api/admin/finance/summary`, `GET /api/admin/finance/ledger`, `POST /api/admin/finance/payout/:id` | MongoDB Atlas | **`WORKING_AND_VERIFIED`** | Tracks escrow pipeline, authorizes payout reconciliation, exports financial statement CSV. |
| **30. Two-Person Sensitive Approvals** | Admin | `client/src/pages/admin/AdminApprovals.jsx` | `server/routes/adminRoutes.js` | `ApprovalRequest` | `GET /api/admin/approvals`, `POST /api/admin/approvals/:id/approve` | MongoDB Atlas | **`WORKING_AND_VERIFIED`** | Reviews fee structure or faculty mutations submitted by partner centers. |
| **31. 3-Way RMS Grievance Assignment** | Admin | `client/src/pages/admin/AdminRMS.jsx` | `server/routes/adminRoutes.js` | `RMSTicket` | `GET /api/admin/rms`, `POST /api/admin/rms/:id/assign-institute`, `POST /api/admin/rms/:id/resolve` | MongoDB Atlas | **`WORKING_AND_VERIFIED`** | Super Admin assigns incoming student dispute tickets to institutes or marks them resolved. |
| **32. Immutable Security Audit Logs** | Admin | `client/src/pages/admin/AdminAuditLogs.jsx` | `server/routes/adminRoutes.js` | `AuditLog` (`auditlogs`) | `GET /api/admin/audit-logs` | MongoDB Atlas | **`WORKING_AND_VERIFIED`** | Displays tamper-evident chronological log of all sensitive operations, logins, and admissions. |
| **33. Platform Analytics & Trends** | Admin | `client/src/pages/admin/AdminAnalytics.jsx` | `server/routes/adminRoutes.js` | Multiple | `GET /api/admin/metrics` | MongoDB Atlas | **`IMPLEMENTED_BUT_NOT_FULLY_TESTED`** | Calculates city breakdowns and conversion percentages. |
| **34. Course Catalog Management** | Admin | `client/src/pages/admin/AdminCourses.jsx` | None | None | None | Hardcoded Array in component | **`UI_ONLY`** | **CRITICAL AUDIT FINDING**: 3 hardcoded courses (`CRS-JEE-01`, etc.) and 3 scholarships. "Update" button triggers dummy `alert()`. No database model exists. |
| **35. Website CMS & Visual Banner Manager** | Admin | `client/src/pages/admin/AdminCMS.jsx` | None | None | None | Local state in component | **`UI_ONLY`** | **CRITICAL AUDIT FINDING**: Visual editor for announcement ticker and hero text. Form submission triggers fake 3-second timeout claiming CDN sync without calling any backend API. |
| **36. Platform Settings & Relays** | Admin | `client/src/pages/admin/AdminSettings.jsx` | None | None | None | Local state in component | **`UI_ONLY`** | **CRITICAL AUDIT FINDING**: Displays hardcoded "MongoDB Connected (Localhost:27017)". Save button sets fake local state; does not persist settings. |
| **37. Admin Team Management** | Admin | `client/src/pages/admin/AdminTeam.jsx` | None | `AdminUser` (partially) | None | Hardcoded Array in component | **`UI_ONLY`** | **CRITICAL AUDIT FINDING**: Displays 4 hardcoded staff members (`ADM-001` to `ADM-004`). No API endpoint exists to add, edit, or invite team members. |
