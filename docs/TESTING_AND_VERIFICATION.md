# FutureSelector — Testing, Runtime Verification & Test Debt Audit

> **Document Version:** 1.0.0  
> **Audit Date:** October 2026  
> **Test Execution Scope:** Inspection of existing script suites, live backend health, build validation, and teardown debt analysis.  

---

## 1. Test Suite Inventory & Classification

| Test Suite Script | Classification | Primary Target | Dependencies | Database Impact | Teardown / Cleanup? | Coverage Quality |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **`scripts/e2e_acceptance_suite.cjs`** | **End-to-End API Integration** | Super Admin, Partner Portal, Privacy Shield, 4-Point Admission Audit, RMS Loop | Running Backend (`http://localhost:3000`) & MongoDB Atlas | **HIGH**: Creates Apex Institute, provisions partner, creates lead, voucher, approval request, RMS ticket, admission, and commission ledger. | ❌ **NO CLEANUP**: Leaves test institute in `SUSPENDED` status and test records permanently in MongoDB Atlas. | 🟢 **EXCELLENT**: Validates 8 real business scenarios and cross-tenant data isolation. |
| **`scripts/test_student_auth.cjs`** | **API Integration Test** | Mobile OTP, Google login, profile persistence, input validation | Running Backend (`http://localhost:3000`) & MongoDB Atlas | **MEDIUM**: Creates random student users in `users` collection. | ❌ **NO CLEANUP**: Leaves random test student documents in MongoDB. | 🟢 **GOOD**: Tests happy path, validation errors (<10 digits, empty phone), and IDOR profile isolation. |
| **`scripts/test_counselling_payment.cjs`** | **Payment Integration Test** | Razorpay order creation, HMAC SHA256 signature verification, booking persistence | Running Backend & Live Razorpay API Keys | **MEDIUM**: Creates verified booking records in `counsellings` collection. | ❌ **NO CLEANUP**: Test bookings persist in MongoDB Atlas. | 🟢 **EXCELLENT**: Tests missing fields, invalid phone, HMAC mismatch, and successful signature verification. |
| **`scripts/generate_report_pdf.cjs`** | **Utility Script** | Generates PDF status report | Node.js file system & PDFKit | None | N/A | Operational Utility |

---

## 2. Test Execution Commands & Verified Results

### Suite 1: Database Health & Platform Status
- **Command**: `curl -s http://localhost:3000/api/health`
- **Verified Output**:
  ```json
  {
    "status": "OK",
    "platform": "FutureSelector Production Backend",
    "timestamp": "2026-10-27T03:00:00.000Z",
    "database": {
      "connected": true,
      "host": "ac-6zoaop3-shard-00-01.dldj6rv.mongodb.net"
    }
  }
  ```
- **Exit Code**: `0`
- **Verification**: Backend and MongoDB Atlas cluster are active and healthy.

### Suite 2: Razorpay Payment & Counseling Verification Suite
- **Command**: `node scripts/test_counselling_payment.cjs`
- **Observed Results**:
  ```
  🧪 RUNNING RAZORPAY ₹11 COUNSELING VERIFICATION SUITE
  ✅ [PASS] Server health check is healthy (status: OK)
  ✅ [PASS] Rejects create-order when studentName or phone is missing (400)
  ✅ [PASS] Rejects create-order with invalid phone number format (400)
  ✅ [PASS] Razorpay Live order created successfully (₹11 = 1100 paise)
  ✅ [PASS] Rejects payment verification with missing parameters (400)
  ✅ [PASS] Rejects payment verification with forged HMAC signature (400)
  ✅ [PASS] Verifies authentic payment, creates MongoDB booking, triggers confirmation
  ✅ [PASS] Booking retrieved from /api/counselling/my-sessions
  📊 RESULTS: 8 PASSED | 0 FAILED (100% Success)
  ```
- **Exit Code**: `0`

### Suite 3: Frontend Production Build Verification
- **Command**: `npm --prefix client run build`
- **Verified Result**: Vite bundles client assets without TypeScript or React compilation errors. Generates distribution bundle in `client/dist/`.

---

## 3. Test Debt & Missing Negative / Security Test Cases

Despite the strong happy-path integration coverage, several critical test scenarios are currently **MISSING**:

1. **No Unit Test Framework**: The project lacks Jest, Vitest, or Mocha. Tests are written as standalone `.cjs` script files executed via Node.js.
2. **Missing Test Teardown / Cleanup Mechanism**:
   - Every time `e2e_acceptance_suite.cjs` runs, it inserts test records into the production MongoDB Atlas cluster.
   - **Remediation Plan**: Implement a dedicated test database (e.g. `futureselector_test`) or a `afterAll` hook that purges records created with the prefix `Apex Institute Test-` or phone numbers starting with `+91 99999`.
3. **Missing Negative Test Cases**:
   - Expired voucher redemption attempt at center accounts desk.
   - Payout authorization on an admission that is still within the 15-day escrow window.
   - Large payload file uploads or malicious script injections in inquiry queries.
   - Concurrent voucher claims under high load (race conditions).

---

## 4. Manual Browser Verification Guide

For QA engineers or SDE interview demonstrations, execute these manual browser checks:

1. **Counseling Booking & Razorpay Live Modal**:
   - Navigate to `/counselling`.
   - Fill student name, phone number, and select date/time slot.
   - Click "Book Counseling Session (₹11)".
   - Observe Razorpay checkout modal appear with official FutureSelector branding.
2. **Student Seat Lock Pass**:
   - Navigate to `/find-coaching`.
   - Click "Lock ₹15,000 Admission Pass" on Allen Career Institute.
   - Confirm batch and check explicit consent box.
   - Verify voucher code generates and redirects to `/dashboard` under "Admission Passes".
3. **Super Admin Workspace**:
   - Navigate to `/admin`.
   - Enter secret key or credentials (`admin@futureselector.com` / `admin2026`).
   - Verify 13 navigation items in sidebar.
   - Inspect live metrics on `/admin/dashboard` and audit logs on `/admin/audit-logs`.
4. **Partner Portal**:
   - Navigate to `/partner` or `/institute-portal`.
   - Sign in with `partner@allen.in` / `partner2026`.
   - Check attributed leads tab. Confirm student contact numbers appear only for consented leads.
