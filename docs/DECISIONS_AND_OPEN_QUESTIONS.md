# FutureSelector — Decisions & Open Questions for the Founder

> **Document Version:** 1.0.0  
> **Audit Date:** October 2026  
> **Status:** Pending Founder Sign-Off Before Phase 1 Implementation  

---

## 1. Architectural Decisions Requiring Founder Guidance

### Decision 1: Mobile SMS OTP Provider & Indian DLT Registration
- **Current State**: Student mobile login uses in-memory fixed OTP `2026`.
- **Options**:
  - **Option A (Fast2SMS Quick Route)**: Quickest setup in India, supports transactional SMS without strict upfront DLT template delays during initial beta testing.
  - **Option B (Gupshup / MSG91 Enterprise)**: Full enterprise DLT compliance with custom sender header (e.g., `FUTSEL`). Requires 3–7 days for DLT entity approval.
  - **Option C (Twilio Global)**: Reliable internationally, but higher cost per SMS in India (~₹0.50 – ₹1.20/SMS).
- **Question for Founder**: Which SMS gateway provider should we integrate, or do you have an existing Indian DLT registration?

---

### Decision 2: Transactional Email Infrastructure
- **Current State**: `server/utils/mailer.js` is configured with Nodemailer supporting Hostinger/SMTP relay.
- **Options**:
  - **Option A (Free Custom SMTP via Existing Hosting)**: Zero monthly cost using cPanel / Hostinger business webmail (e.g., `noreply@futureselector.com`).
  - **Option B (Resend / SendGrid / AWS SES)**: High inbox deliverability (avoids student spam folder) with 100 free emails/day.
- **Question for Founder**: Do you have a domain email (`support@futureselector.com` or `noreply@...`) set up with SMTP credentials, or should we set up a dedicated cloud email relay like Resend?

---

### Decision 3: Comparison Engine Scope (Partners vs Unregistered Coachings)
- **Current State**: `client/src/data/institutes.js` includes both partner coachings and non-partner coachings.
- **Ambiguity**:
  - If a student compares Allen (Partner) vs a local non-partner coaching, can the student still lock a ₹15,000 pass for the non-partner coaching?
  - Currently, locking a pass for a non-partner coaching creates a voucher in MongoDB, but there is no partner desk to honor it.
- **Recommendation**:
  - Clearly display a "Verified Partner Center • ₹15,000 Pass Eligible" badge on partner coachings, and a "Directory Listing Only • Admission Pass Not Available" banner on non-partner institutes.
- **Question for Founder**: Should the platform allow passes only on verified partner centers?

---

### Decision 4: Admission Receipt Document Cloud Storage
- **Current State**: Offline admission receipts are reported as string metadata (`recipeNumber: "REC-APEX-1049"`).
- **Options**:
  - **Option A (Cloudinary)**: Free tier includes 25GB storage, instant automatic image optimization and CDN delivery. Very simple to integrate in Node.js.
  - **Option B (AWS S3)**: Enterprise standard, low cost, requires AWS IAM credentials and bucket setup.
- **Question for Founder**: Would you prefer Cloudinary (fastest setup) or AWS S3 for hosting student admission receipts and coaching center photos?

---

### Decision 5: Counseling Advisory Session Pricing
- **Current State**: Set to ₹11 live verification token charge processed via Razorpay Live Gateway.
- **Options**:
  - Keep ₹11 (filters out spam appointments while remaining accessible to all students).
  - Make counseling 100% Free (increases booking volume, but risks high no-show rate).
  - Tiered: ₹11 for General Guidance, ₹499 for Comprehensive 1-on-1 Ranker Roadmaps.
- **Question for Founder**: What is your preferred pricing strategy for the counseling desk?
