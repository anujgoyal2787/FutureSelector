# FutureSelector — Complete Static / Mock / Hardcoded Data Audit

> **Document Version:** 1.0.0  
> **Audit Date:** October 2026  
> **Auditor:** Antigravity Full-Stack QA & Security Lead  
> **Rule Applied:** Zero-tolerance verification. Distinguish legitimate seed fixtures from hardcoded production behavior.  

---

## 1. Executive Summary: Static & Mock Data Findings

During our deep-dive code inspection of all React components and Express controllers, we identified several critical architectural anomalies where the user interface appears dynamic and functional, but is actually powered by **hardcoded arrays**, **mock bypasses**, or **client-side state simulation**.

### The 4 Major Architectural Traps:
1. **The Comparison Engine Trap (`Compare.jsx`)**: The entire coaching comparison tool imports a static array of 10 institutes from `client/src/data/institutes.js`. When an administrator creates a new coaching in the Super Admin suite, it is saved in MongoDB Atlas, but it **never** appears in the comparison dropdowns or presets.
2. **The 4 Admin Mock Modules (`AdminCourses.jsx`, `AdminCMS.jsx`, `AdminSettings.jsx`, `AdminTeam.jsx`)**: These four pages in the Super Admin workspace are pure visual mockups (`UI_ONLY`). Submitting forms displays artificial green success toasts ("Synced to Edge CDN", "Settings saved") without making any network calls to the backend.
3. **The Static Landing Page Stats (`server.js`)**: The `/api/stats` endpoint returns hardcoded strings (`"120+"`, `"1,420+"`, `"52,400+"`, `"₹24,500"`) instead of performing real aggregation queries (`$count`, `$avg`) across the `institutes`, `leads`, and `counsellings` collections.
4. **The Mobile OTP Bypass (`authRoutes.js`)**: Registration and login accept any 10-digit number paired with fixed OTP `2026`. While acceptable for local demo staging, it blocks real public production launch.

---

## 2. Master Static Data Register

| Feature | Current Data Source | Evidence / File Path | Persisted in MongoDB? | API Connected? | Production Safe? | Required Action | Priority |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Comparison Contenders & Metrics** | Live MongoDB Atlas via `GET /api/institutes` | `client/src/pages/Compare.jsx` | ✅ YES (Atlas) | ✅ YES (`instituteAPI.getAll()`) | ✅ YES | **VERIFIED RESOLVED (FS-P0-01)**: Live published institutes load dynamically with fallback. | **RESOLVED** |
| **SMS OTP Verification** | Fixed string `"2026"` bypass | `server/routes/authRoutes.js` (L14-22, L64-75) | ❌ NO (OTP itself not in DB) | ⚠️ Partial (Endpoint works, but OTP is static) | ❌ NO (Security risk in production) | Integrate a real Indian DLT-compliant SMS gateway (Fast2SMS / Gupshup / Twilio). Generate cryptographically random 6-digit OTP stored in Redis/DB with 5-minute TTL. | **P0** |
| **Admin Website CMS Studio** | Local React state (`useState`) | `client/src/pages/admin/AdminCMS.jsx` (L8-13, L23-27) | ❌ NO | ❌ NO | ❌ NO (Fake toast gives false sense of persistence) | Create `CMSSetting` model in MongoDB, implement `GET /api/cms` and `PUT /api/admin/cms`, wire `Home.jsx` to read announcements dynamically. | **P1** |
| **Admin Course & Scholarship Catalog** | Hardcoded arrays `courses` and `scholarships` | `client/src/pages/admin/AdminCourses.jsx` (L11-70) | ❌ NO | ❌ NO | ❌ NO (Buttons fire dummy `alert()`) | Create `Course` and `Scholarship` Mongoose models, implement CRUD routes under `adminRoutes.js`, connect UI tables. | **P1** |
| **Platform Settings & DB Status** | Hardcoded string `"MongoDB Connected (Localhost:27017)"` | `client/src/pages/admin/AdminSettings.jsx` (L41) | ❌ NO | ❌ NO | ❌ NO (Misleading indicator; DB is actually Atlas) | Connect status indicator to `GET /api/health` `database.connected` response. Wire setting toggles to backend config store. | **P1** |
| **Admin Team Management** | Hardcoded array `teamMembers` (4 staff) | `client/src/pages/admin/AdminTeam.jsx` (L12-53) | ❌ NO (Only 1 `AdminUser` in DB) | ❌ NO | ❌ NO | Create full team management endpoints under `/api/admin/team` to manage roles and invite operators. | **P2** |
| **Landing Page Headline Statistics** | Hardcoded response object | `server/server.js` (L76-86) | ❌ NO | ⚠️ Endpoint exists, but data is mocked | ⚠️ OK for demo, Not OK for audit | Replace static strings with MongoDB aggregation pipeline querying real counts of institutes, verified admissions, and active passes. | **P2** |
| **Student Reviews & Testimonials** | Hardcoded arrays `featuredStories` | `client/src/component/SplitAndMarqueeTestimonials.jsx` (L10-60) | ❌ NO | ❌ NO | ⚠️ OK for demo (Curated content) | Add `Review` model in MongoDB with moderation workflow for students who completed admission. | **P3** |
| **Scholarship Entrance Exams & Slabs** | Hardcoded arrays `SCHOLARSHIP_EXAMS`, `MERIT_SLABS` | `client/src/pages/Scholarships.jsx` (L17-100) | ❌ NO | ❌ NO | ⚠️ OK for demo (Informational) | Keep static fallback for common national exams (TALLENTEX/ANTHE), but allow dynamic scholarships to be loaded from DB. | **P3** |
| **Client Locked Seats in LocalStorage** | `localStorage.getItem("fs_locked_seats")` | `client/src/context/AuthContext.jsx` (L45-53, L137) | ⚠️ Partial (Voucher saved to DB, but list cached in LS) | ⚠️ Partial | ⚠️ Safe with caution | Ensure `Dashboard.jsx` prioritizes live passes from `GET /api/vouchers/my-passes` and only uses localStorage as an offline cache. | **P2** |
| **Seed Data Coaching Fixtures** | Array of 5 institutes (Allen, Resonance, FIITJEE, Motion, Aakash) | `server/config/seedData.js` (L12-250) | ✅ YES (Populates Atlas on clean boot) | ✅ YES | ✅ SAFE (Legitimate initial database fixtures) | Safe to keep. Distinguish seed data from hardcoded UI behavior. | **SAFE** |

---

## 3. Disconnected APIs (APIs That Exist but Are Ignored by UI)

During our audit, we discovered endpoints that exist in the Express backend and are fully functional, but are not invoked by the client application:

1. **`GET /api/institutes/compare?ids=1,2`**:
   - Implemented in `server/routes/instituteRoutes.js`.
   - Returns full audited comparisons from MongoDB Atlas.
   - **Frontend Disconnect**: `client/src/pages/Compare.jsx` completely ignores this endpoint and instead filters `institutesData` locally!
2. **`GET /api/stats`**:
   - Implemented in `server/server.js`.
   - **Frontend Disconnect**: `client/src/pages/Home.jsx` hardcodes its counter metrics or uses separate state rather than consuming this endpoint.
3. **`Notification` Model (`server/models/Notification.js`)**:
   - Mongoose schema defined with fields (`recipientId`, `recipientRole`, `title`, `message`, `read`).
   - **Backend Disconnect**: No controller routes registered in `server.js` or `adminRoutes.js`; no notification bell or dropdown in client UI.

---

## 4. Frontend-Only Calculations Requiring Server Validation

1. **Scholarship Eligibility Calculator (`client/src/pages/Scholarships.jsx`)**:
   - Current: Evaluates percentile formulas purely in React component state.
   - Risk: Students calculate an estimated scholarship waiver on the website, but have no backend verification token or tamper-proof guarantee when visiting the center.
   - Recommended Fix: Add `/api/scholarships/estimate` endpoint that returns a signed estimate reference code.
2. **Voucher Discount Flat Amount (`SeatLockModal.jsx`)**:
   - Current: `discountAmount` ("₹15,000 Flat Grant") is sent in request body from frontend.
   - Backend Safety Check: In `voucherRoutes.js` (L26-39), the backend independently queries the `Institute` model to retrieve the agreed commission rate and validates terms. This is a good security practice that is already partially implemented.
