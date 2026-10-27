# FutureSelector — Complete REST API Reference & Traceability Matrix

> **Document Version:** 1.0.0  
> **Audit Date:** October 2026  
> **Backend Port:** 3000 (Default) | **Base Path:** `/api`  
> **Coverage:** 100% of registered Express routes inspected across 8 route modules + `server.js`.  

---

## 1. System Endpoints (`server.js`)

| Method & Path | Purpose | Access | Required Role | Request Body | Response Format | Relevant Models | Frontend Caller | Test Coverage | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **`GET /api/health`** | Live server and MongoDB connection health check | Public | None | None | `{ status: "OK", database: { connected: true, host: "..." } }` | None | Direct ping | `e2e_acceptance_suite.cjs`, `test_counselling_payment.cjs` | `WORKING_AND_VERIFIED` |
| **`GET /api/stats`** | Platform headline metrics counter | Public | None | None | `{ totalInstitutes: "120+", activeLeads: "1,420+", ... }` | None (Mocked response) | None (Disconnected) | None | `MOCKED_OR_SIMULATED` |

---

## 2. Authentication & Student Profile Endpoints (`server/routes/authRoutes.js`)

| Method & Path | Purpose | Access | Required Role | Request Body | Response Format | Relevant Models | Frontend Caller | Test Coverage | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **`POST /api/auth/send-otp`** | Request 4-digit mobile verification code | Public | None | `{ phone: "9876543210", name?: "..." }` | `{ success: true, message: "OTP sent" }` | None (In-memory verification) | `authAPI.sendOtp` in `AuthModal.jsx` | `test_student_auth.cjs` | `MOCKED_OR_SIMULATED` (Fixed OTP: `2026`) |
| **`POST /api/auth/verify-otp`** | Verify mobile OTP and issue student JWT | Public | None | `{ phone, otp, name?, exam?, city?, standard?, dreamCollege? }` | `{ success: true, token: "JWT...", user: { ... } }` | `User` (`users`) | `authAPI.verifyOtp` in `AuthModal.jsx` | `test_student_auth.cjs` | `WORKING_AND_VERIFIED` |
| **`POST /api/auth/google`** | Google 1-Click login and user upsert | Public | None | `{ token, name, email, photoURL?, phone? }` | `{ success: true, token: "JWT...", user: { ... } }` | `User` (`users`) | `authAPI.googleLogin` in `AuthModal.jsx` | `test_student_auth.cjs` | `WORKING_AND_VERIFIED` |
| **`GET /api/auth/me`** | Fetch authenticated student profile | Protected | Student | None (Bearer Token in Header) | `{ success: true, user: { ... } }` | `User` (`users`) | `authAPI.getMe` in `AuthContext.jsx` | `test_student_auth.cjs` | `WORKING_AND_VERIFIED` |
| **`PUT /api/auth/profile`** | Update student profile and shortlisted institutes | Protected | Student | `{ name?, exam?, city?, standard?, dreamCollege?, shortlisted? }` | `{ success: true, user: { ... } }` | `User` (`users`) | `authAPI.updateProfile` in `Dashboard.jsx` & `AuthContext.jsx` | `test_student_auth.cjs` | `WORKING_AND_VERIFIED` |

---

## 3. Public Coaching Catalog Endpoints (`server/routes/instituteRoutes.js`)

| Method & Path | Purpose | Access | Required Role | Query / Body Params | Response Format | Relevant Models | Frontend Caller | Test Coverage | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **`GET /api/institutes`** | Filter published coachings by city, exam, search | Public | None | Query: `?city=&exam=&search=` | Array of published `Institute` objects | `Institute` (`institutes`) | `instituteAPI.getAll` in `FindCoaching.jsx` | `e2e_acceptance_suite.cjs` | `WORKING_AND_VERIFIED` |
| **`GET /api/institutes/:idOrSlug`** | Fetch deep-dive institute profile | Public | None | Param: `:idOrSlug`, Query: `?preview=true` | Full `Institute` object with batches, faculties, fees | `Institute` (`institutes`) | `instituteAPI.getByIdOrSlug` in `InstituteProfile.jsx` | Manual inspection | `WORKING_AND_VERIFIED` |
| **`GET /api/institutes/compare`** | Fetch side-by-side comparison for institute IDs | Public | None | Query: `?ids=1,2` | Array of compared `Institute` objects with winner flags | `Institute` (`institutes`) | **NONE** (Disconnected link!) | None | `DISCONNECTED_INTEGRATION` |
| **`POST /api/institutes/partner-apply`** | Public coaching partnership application form | Public | None | Body: `{ instituteName, contactPerson, email, phone, city, coachingType, studentCapacity }` | `{ success: true, message: "Application received" }` | `PartnerApplication` (`partnerapplications`) | `instituteAPI.submitPartnerApplication` in `InstitutePortal.jsx` | Manual check | `WORKING_AND_VERIFIED` |

---

## 4. Admission Pass & Voucher Endpoints (`server/routes/voucherRoutes.js`)

| Method & Path | Purpose | Access | Required Role | Request Body | Response Format | Relevant Models | Frontend Caller | Test Coverage | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **`POST /api/vouchers/claim`** | Claim ₹15,000 pass with explicit consent & lead link | Public / Student | None | Body: `{ studentName, studentPhone, studentEmail, instituteId, instituteName, batch, discountAmount }` | `{ success: true, voucher: { ... } }` | `Voucher`, `Lead`, `AuditLog` | `voucherAPI.claimPass` in `SeatLockModal.jsx` | `e2e_acceptance_suite.cjs` | `WORKING_AND_VERIFIED` |
| **`GET /api/vouchers/my-passes`** | Get student's claimed admission vouchers | Public / Student | None | Query: `?phone=&email=` | Array of `Voucher` documents | `Voucher` (`vouchers`) | `voucherAPI.getMyPasses` in `Dashboard.jsx` | `e2e_acceptance_suite.cjs` | `WORKING_AND_VERIFIED` |
| **`GET /api/vouchers/verify/:code`** | Public counter check for voucher validity | Public | None | Param: `:code` | `{ valid: true, voucher: { ... } }` | `Voucher` (`vouchers`) | `voucherAPI.verifyCode` | None | `WORKING_AND_VERIFIED` |

---

## 5. Enquiry & Privacy Shield Endpoints (`server/routes/leadRoutes.js`)

| Method & Path | Purpose | Access | Required Role | Request Body | Response Format | Relevant Models | Frontend Caller | Test Coverage | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **`POST /api/enquiries`** | Submit unconfirmed inquiry (phone hidden from center) | Public | None | `{ studentName, phone, email?, instituteNumericId, exam }` | `{ success: true, leadId, lead: { status: "PENDING_CONFIRMATION" } }` | `Lead` (`leads`) | `leadAPI.submitEnquiry` in `InstituteProfile.jsx` | `e2e_acceptance_suite.cjs` | `WORKING_AND_VERIFIED` |
| **`POST /api/enquiries/:id/confirm-interest`** | Student gives explicit consent; releases contact | Public / Student | None | Param: `:id`, Body: `{ consentAgreed: true, batchName }` | `{ success: true, lead: { releasedToInstitute: true }, voucher }` | `Lead`, `Voucher` | `leadAPI.confirmInterest` | `e2e_acceptance_suite.cjs` | `WORKING_AND_VERIFIED` |
| **`GET /api/enquiries/my-enquiries`** | Student views submitted inquiries | Public / Student | None | Query: `?phone=` | Array of `Lead` documents | `Lead` (`leads`) | `leadAPI.getMyEnquiries` | None | `WORKING_AND_VERIFIED` |

---

## 6. 1-on-1 Academic Counseling & Razorpay Endpoints (`server/routes/counsellingRoutes.js`)

| Method & Path | Purpose | Access | Required Role | Request Body | Response Format | Relevant Models | Frontend Caller | Test Coverage | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **`POST /api/counselling/create-order`** | Generate Razorpay order for ₹11 advisory session | Public | None | `{ studentName, phone, email, date, timeSlot, topics, query }` | `{ success: true, orderId: "order_...", keyId: "rzp_live_...", amount: 1100 }` | None | `counsellingAPI.createPaymentOrder` in `Counselling.jsx` | `test_counselling_payment.cjs` | `WORKING_AND_VERIFIED` |
| **`POST /api/counselling/verify-payment`** | Verify Razorpay HMAC signature & persist booking | Public | None | `{ razorpay_order_id, razorpay_payment_id, razorpay_signature, studentName, phone, ... }` | `{ success: true, message: "Booking confirmed", booking: { ... } }` | `Counselling` (`counsellings`) | `counsellingAPI.verifyPayment` in `Counselling.jsx` | `test_counselling_payment.cjs` | `WORKING_AND_VERIFIED` |
| **`GET /api/counselling/my-sessions`** | View student's booked counseling sessions | Public | None | Query: `?phone=` | Array of `Counselling` documents | `Counselling` (`counsellings`) | `counsellingAPI.getMySessions` in `Dashboard.jsx` | Manual inspection | `WORKING_AND_VERIFIED` |

---

## 7. Institute Partner Portal Endpoints (`server/routes/partnerRoutes.js`)

| Method & Path | Purpose | Access | Required Role | Request Body | Response Format | Relevant Models | Frontend Caller | Test Coverage | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **`POST /api/partner/auth/login`** | Partner center login with email/password | Public | None | `{ email, password }` | `{ success: true, token: "JWT...", partner: { ... } }` | `PartnerUser`, `Institute` | `partnerAPI.login` in `InstitutePortal.jsx` | `e2e_acceptance_suite.cjs` | `WORKING_AND_VERIFIED` |
| **`POST /api/partner/auth/setup-password`** | Initial setup of password via invite token | Public | None | `{ token, newPassword }` | `{ success: true, message: "Password configured" }` | `PartnerUser` (`partnerusers`) | `partnerAPI.setupPassword` in `InstitutePortal.jsx` | Manual check | `WORKING_AND_VERIFIED` |
| **`GET /api/partner/leads`** | Get attributed leads with explicit student consent | Protected | Partner | None (Bearer Token) | `{ leads: [...], totalCount: N }` | `Lead` (`leads`) | `partnerAPI.getLeads` in `InstitutePortal.jsx` | `e2e_acceptance_suite.cjs` | `WORKING_AND_VERIFIED` |
| **`POST /api/partner/verify-counter`** | Verify student pass code at counter | Protected | Partner | `{ voucherCode }` | `{ valid: true, voucher: { ... } }` | `Voucher` (`vouchers`) | `partnerAPI.verifyCounterVoucher` in `InstitutePortal.jsx` | Manual check | `WORKING_AND_VERIFIED` |
| **`POST /api/partner/admissions/report`** | Report offline student enrollment with receipt | Protected | Partner | `{ voucherCode, studentName, studentPhone, receiptNumber, receiptAmount, receiptDate, counterNotes }` | `{ success: true, message: "Admission reported", voucher: { ... } }` | `Voucher`, `Lead`, `AuditLog` | `partnerAPI.reportAdmission` in `InstitutePortal.jsx` | `e2e_acceptance_suite.cjs` | `WORKING_AND_VERIFIED` |
| **`GET /api/partner/admissions`** | View reported admissions for institute | Protected | Partner | None | Array of reported admissions | `Voucher` (`vouchers`) | `partnerAPI.getAdmissions` in `InstitutePortal.jsx` | Manual check | `WORKING_AND_VERIFIED` |
| **`POST /api/partner/submit-for-approval`** | Submit sensitive fee/profile change request | Protected | Partner | `{ changeType, description, diff: { field, oldValue, newValue } }` | `{ success: true, request: { ... } }` | `ApprovalRequest`, `AuditLog` | `partnerAPI.submitForApproval` in `InstitutePortal.jsx` | `e2e_acceptance_suite.cjs` | `WORKING_AND_VERIFIED` |
| **`GET /api/partner/rms`** | View student dispute tickets assigned to center | Protected | Partner | None | Array of `RMSTicket` documents | `RMSTicket` (`rmstickets`) | `partnerAPI.getRMSTickets` in `InstitutePortal.jsx` | `e2e_acceptance_suite.cjs` | `WORKING_AND_VERIFIED` |
| **`POST /api/partner/rms/:id/respond`** | Submit official center response to dispute | Protected | Partner | Param: `:id`, Body: `{ responseText }` | `{ success: true, ticket: { status: "INSTITUTE_RESPONDED" } }` | `RMSTicket`, `AuditLog` | `partnerAPI.respondRMSTicket` in `InstitutePortal.jsx` | `e2e_acceptance_suite.cjs` | `WORKING_AND_VERIFIED` |

---

## 8. Grievance Redressal (RMS) Endpoints (`server/routes/rmsRoutes.js`)

| Method & Path | Purpose | Access | Required Role | Request Body | Response Format | Relevant Models | Frontend Caller | Test Coverage | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **`POST /api/rms/student-ticket`** | Student lodges dispute ticket | Public / Student | None | `{ studentName, studentPhone, instituteName, category, subject, description }` | `{ success: true, ticket: { ... } }` | `RMSTicket`, `AuditLog` | `rmsAPI.submitStudentTicket` in `Dashboard.jsx` | `e2e_acceptance_suite.cjs` | `WORKING_AND_VERIFIED` |
| **`GET /api/rms/my-tickets`** | Student views history of their lodged grievances | Public / Student | None | Query: `?phone=&email=` | `{ tickets: [...] }` | `RMSTicket` (`rmstickets`) | `rmsAPI.getMyTickets` in `Dashboard.jsx` | `e2e_acceptance_suite.cjs` | `WORKING_AND_VERIFIED` |
| **`POST /api/rms/:id/student-confirm`** | Student confirms resolution & closes ticket | Public / Student | None | Param: `:id`, Body: `{ studentFeedback }` | `{ success: true, ticket: { status: "CLOSED" } }` | `RMSTicket`, `AuditLog` | `rmsAPI.confirmResolution` in `Dashboard.jsx` | `e2e_acceptance_suite.cjs` | `WORKING_AND_VERIFIED` |
| **`POST /api/rms/:id/student-reopen`** | Student reopens ticket if unsatisfied | Public / Student | None | Param: `:id`, Body: `{ reopenReason }` | `{ success: true, ticket: { status: "REOPENED" } }` | `RMSTicket`, `AuditLog` | `rmsAPI.reopenTicket` in `Dashboard.jsx` | `e2e_acceptance_suite.cjs` | `WORKING_AND_VERIFIED` |

---

## 9. Super Admin Operations Endpoints (`server/routes/adminRoutes.js` - 59KB Controller)

| Method & Path | Purpose | Access | Required Role | Request Body | Response Format | Relevant Models | Frontend Caller | Test Coverage | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **`POST /api/admin/login`** | Authenticate Super Admin via secret key or password | Public | None | `{ secretKey }` or `{ email, password }` | `{ success: true, token: "JWT...", admin: { role: "SUPER_ADMIN" } }` | `AdminUser` (`adminusers`) | `adminAPI.login` in `AdminLayout.jsx` | `e2e_acceptance_suite.cjs` | `WORKING_AND_VERIFIED` |
| **`GET /api/admin/metrics`** | Platform dashboard overview counts & finance pipeline | Protected | Super Admin | None | `{ institutesCount, totalLeads, confirmedAdmissions, escrowPipeline, activeRMS, pendingApprovals }` | Multiple collections | `adminAPI.getMetrics` in `AdminDashboard.jsx` | `e2e_acceptance_suite.cjs` | `WORKING_AND_VERIFIED` |
| **`POST /api/admin/institutes/manual`** | Manually create new coaching institute in DRAFT mode | Protected | Super Admin | Body: Full institute metadata, contact person, agreement terms | `{ success: true, institute: { publicationStatus: "DRAFT" } }` | `Institute`, `AuditLog` | `adminAPI.manualAddInstitute` in `AdminInstitutes.jsx` | `e2e_acceptance_suite.cjs` | `WORKING_AND_VERIFIED` |
| **`POST /api/admin/institutes/:id/provision-partner`** | Generate partner login credentials and setup link | Protected | Super Admin | Param: `:id`, Body: `{ email, name, temporaryPassword }` | `{ success: true, partnerUser: { ... }, setupUrl }` | `PartnerUser`, `AuditLog` | `adminAPI.provisionPartner` in `AdminInstitutes.jsx` | `e2e_acceptance_suite.cjs` | `WORKING_AND_VERIFIED` |
| **`POST /api/admin/institutes/:id/publish`** | Publish institute to live public search directory | Protected | Super Admin | Param: `:id` | `{ success: true, institute: { publicationStatus: "PUBLISHED" } }` | `Institute`, `AuditLog` | `adminAPI.publishInstitute` in `AdminInstitutes.jsx` | `e2e_acceptance_suite.cjs` | `WORKING_AND_VERIFIED` |
| **`POST /api/admin/institutes/:id/suspend`** | Suspend institute and immediately revoke partner access | Protected | Super Admin | Param: `:id`, Body: `{ reason }` | `{ success: true, institute: { status: "SUSPENDED" } }` | `Institute`, `AuditLog` | `adminAPI.suspendInstitute` in `AdminInstitutes.jsx` | `e2e_acceptance_suite.cjs` | `WORKING_AND_VERIFIED` |
| **`GET /api/admin/approvals`** | List sensitive profile mutations pending approval | Protected | Super Admin | Query: `?status=PENDING` | Array of `ApprovalRequest` documents | `ApprovalRequest` | `adminAPI.getApprovals` in `AdminApprovals.jsx` | `e2e_acceptance_suite.cjs` | `WORKING_AND_VERIFIED` |
| **`POST /api/admin/approvals/:id/approve`** | Approve sensitive mutation and apply to Institute | Protected | Super Admin | Param: `:id`, Body: `{ reviewNote }` | `{ success: true, request: { status: "APPROVED" } }` | `ApprovalRequest`, `Institute`, `AuditLog` | `adminAPI.approveRequest` in `AdminApprovals.jsx` | `e2e_acceptance_suite.cjs` | `WORKING_AND_VERIFIED` |
| **`POST /api/admin/admissions/:id/verify`** | 4-Point admission audit and commission ledger creation | Protected | Super Admin | Param: `:id`, Body: `{ verificationNotes }` | `{ success: true, commissionTransaction: { payoutStatus: "ESCROW_LOCKED", amount: 8000 } }` | `Voucher`, `CommissionLedger`, `AuditLog` | `adminAPI.verifyAdmission` in `AdminAdmissions.jsx` | `e2e_acceptance_suite.cjs` | `WORKING_AND_VERIFIED` |
| **`GET /api/admin/finance/summary`** | Escrow totals, paid amounts, pending reconciliation | Protected | Super Admin | None | `{ totalEarned, inEscrow, eligiblePayouts, reconciledPaid }` | `CommissionLedger` | `adminAPI.getFinanceSummary` in `AdminFinance.jsx` | Manual check | `WORKING_AND_VERIFIED` |
| **`POST /api/admin/finance/payout/:id`** | Authorize commission payout release | Protected | Super Admin | Param: `:id`, Body: `{ notes }` | `{ success: true, ledger: { payoutStatus: "PAID" } }` | `CommissionLedger`, `AuditLog` | `adminAPI.authorizePayout` in `AdminFinance.jsx` | Manual check | `WORKING_AND_VERIFIED` |
| **`GET /api/admin/audit-logs`** | Retrieve tamper-evident security audit logs | Protected | Super Admin | None | Array of `AuditLog` documents | `AuditLog` (`auditlogs`) | `adminAPI.getAuditLogs` in `AdminAuditLogs.jsx` | `e2e_acceptance_suite.cjs` | `WORKING_AND_VERIFIED` |
| **`GET /api/admin/export-csv`** | Stream platform leads database as CSV file | Protected | Super Admin | None | CSV File Stream | `Lead` (`leads`) | `adminAPI.downloadLeadsCsv` in `AdminLeads.jsx` | Manual check | `WORKING_AND_VERIFIED` |

---

## 10. Traceability Matrix & Link Health

| UI Feature | Frontend Handler | API Client Method | Express Route | Middleware Stack | Controller Logic | Mongoose Model | MongoDB Collection | Test Suite | Traceability Health |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Student OTP Login** | `handleSubmit` in `AuthModal.jsx` | `authAPI.verifyOtp` | `POST /api/auth/verify-otp` | Pre-hook `connectDB` | `authRoutes.js` L50-130 | `User` | `users` | `test_student_auth.cjs` | 🟢 HEALTHY |
| **Counseling Booking** | `handleInitiatePayment` in `Counselling.jsx` | `counsellingAPI.createPaymentOrder` | `POST /api/counselling/create-order` | Pre-hook `connectDB` | `counsellingRoutes.js` L20-65 | None (Razorpay Order) | None | `test_counselling_payment.cjs` | 🟢 HEALTHY |
| **Counseling Payment Verification** | Razorpay handler callback in `Counselling.jsx` | `counsellingAPI.verifyPayment` | `POST /api/counselling/verify-payment` | Pre-hook `connectDB` | `counsellingRoutes.js` L67-150 | `Counselling` | `counsellings` | `test_counselling_payment.cjs` | 🟢 HEALTHY |
| **Admission Pass Lock** | `handleSubmit` in `SeatLockModal.jsx` | `voucherAPI.claimPass` | `POST /api/vouchers/claim` | Pre-hook `connectDB` | `voucherRoutes.js` L10-133 | `Voucher`, `Lead`, `AuditLog` | `vouchers`, `leads`, `auditlogs` | `e2e_acceptance_suite.cjs` | 🟢 HEALTHY |
| **Coaching Discovery** | `loadLiveInstitutes` in `FindCoaching.jsx` | `instituteAPI.getAll` | `GET /api/institutes` | Pre-hook `connectDB` | `instituteRoutes.js` L10-60 | `Institute` | `institutes` | `e2e_acceptance_suite.cjs` | 🟢 HEALTHY |
| **Coaching Comparison** | `selectedInstitutes` memo in `Compare.jsx` | **NONE** | **NONE** | None | None | None | None | None | 🔴 **BROKEN LINK**: `Compare.jsx` does not call `instituteAPI.compare`! |
| **Admin Sensitive Approvals** | `handleApprove` in `AdminApprovals.jsx` | `adminAPI.approveRequest` | `POST /api/admin/approvals/:id/approve` | `adminAuth` | `adminRoutes.js` L510-580 | `ApprovalRequest`, `Institute` | `approvalrequests`, `institutes` | `e2e_acceptance_suite.cjs` | 🟢 HEALTHY |
| **Admin Admission Verification** | `handleVerify` in `AdminAdmissions.jsx` | `adminAPI.verifyAdmission` | `POST /api/admin/admissions/:id/verify` | `adminAuth` | `adminRoutes.js` L650-730 | `Voucher`, `CommissionLedger` | `vouchers`, `commissionledgers` | `e2e_acceptance_suite.cjs` | 🟢 HEALTHY |
| **Admin Course Catalog** | Click update in `AdminCourses.jsx` | **NONE** | **NONE** | None | None | None | None | None | 🔴 **BROKEN LINK**: Pure `UI_ONLY` alert! |
| **Admin CMS Editor** | `handleSave` in `AdminCMS.jsx` | **NONE** | **NONE** | None | None | None | None | None | 🔴 **BROKEN LINK**: Pure `UI_ONLY` timeout! |
