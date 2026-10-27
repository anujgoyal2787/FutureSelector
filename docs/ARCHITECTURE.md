# FutureSelector — System Architecture & Technical Specifications

> **Document Version:** 1.0.0  
> **Audit Date:** October 2026  
> **Target Audience:** Engineering Leads, SDE Candidates, Technical Architects  
> **Source of Truth:** Inspected Codebase (`client/`, `server/`) & Live MongoDB Atlas  

---

## 1. High-Level Architecture Diagram

```mermaid
graph TD
    UserClient[Web Browser / Client Device]
    
    subgraph Frontend_Layer [React 19 SPA - Vite 8]
        Router[React Router v7]
        AuthCtx[AuthContext / AdminAuthContext]
        Pages[11 Consumer Pages + 13 Admin Pages]
        Services[api.js Client Module]
    end

    subgraph Network_Boundary [HTTP / REST API - Port 3000]
        CORS[CORS Middleware - Allow All Origin]
        Preflight[connectDB Middleware Pre-hook]
    end

    subgraph Backend_Layer [Node.js Express 5.2 Server]
        AuthRoutes[/api/auth]
        InstRoutes[/api/institutes]
        VoucherRoutes[/api/vouchers]
        LeadRoutes[/api/enquiries & /api/leads]
        CnsRoutes[/api/counselling]
        AdminRoutes[/api/admin]
        PartnerRoutes[/api/partner]
        RmsRoutes[/api/rms]
        
        AuthMW[adminAuth / partnerAuth / studentAuth Middleware]
        AuditUtil[auditLogger.js]
        MailUtil[mailer.js Nodemailer]
    end

    subgraph External_Integrations [External Services]
        RazorpayGateway[Razorpay Live API]
        SMTPRelay[Hostinger / Custom SMTP]
        FirebaseSDK[Firebase Google Auth Client]
    end

    subgraph Database_Layer [Database Persistence]
        AtlasDB[(MongoDB Atlas Cluster: futureselector)]
    end

    UserClient --> Router
    Router --> Pages
    Pages --> AuthCtx
    Pages --> Services
    Services -->|Fetch HTTP/JSON| CORS
    CORS --> Preflight
    Preflight --> AuthMW
    
    AuthMW --> AuthRoutes
    AuthMW --> InstRoutes
    AuthMW --> VoucherRoutes
    AuthMW --> LeadRoutes
    AuthMW --> CnsRoutes
    AuthMW --> AdminRoutes
    AuthMW --> PartnerRoutes
    AuthMW --> RmsRoutes

    CnsRoutes -->|Order & HMAC Verification| RazorpayGateway
    CnsRoutes -->|Confirmation Dispatch| MailUtil
    MailUtil -->|SMTP TLS| SMTPRelay
    Services -->|Google 1-Click Token| FirebaseSDK

    AuthRoutes --> AuditUtil
    AdminRoutes --> AuditUtil
    PartnerRoutes --> AuditUtil
    VoucherRoutes --> AuditUtil

    Backend_Layer -->|Mongoose 9.11 ODM Connection Pool| AtlasDB
```

---

## 2. Technology Stack & Runtime Environments

### Frontend (Client SPA)
- **Framework & Runtime**: React `19.2.8`, Vite `8.2.2` (ES Modules)
- **Routing**: `react-router-dom` `7.18.3` (BrowserRouter with custom `ScrollToTop`)
- **Styling**: TailwindCSS `3.4.19`, PostCSS `8.5.28`, Autoprefixer `10.6.1`
- **Animations**: `framer-motion` `13.4.1`
- **3D Graphics & Canvas**: Three.js `0.186.0`, `@react-three/fiber` `9.7.0`, `@react-three/drei` `10.7.8`
- **Document Generation**: `jspdf` `4.2.1`, `jspdf-autotable` `5.0.9`
- **Icons**: `lucide-react` `1.47.0`
- **Authentication Client**: Google Firebase Auth `11.x`

### Backend (REST API Server)
- **Runtime**: Node.js `v20.x` / `v22.x` (CommonJS module system)
- **Framework**: Express `5.2.1`
- **Database Driver / ODM**: Mongoose `9.11.3`
- **Security & Cryptography**: `bcryptjs` `3.0.3` (10 salt rounds), `jsonwebtoken` `9.0.3` (HS256 signature), Node.js native `crypto` (Razorpay HMAC SHA256)
- **Payment Processing**: `razorpay` `2.9.8` (Live Key Integration)
- **Email Delivery**: `nodemailer` `10.2.1` (SMTP with TLS pool fallback)
- **Environment Management**: `dotenv` `18.0.8` (Local + Server fallback cascading)
- **Cross-Origin Security**: `cors` `2.8.6`

### Persistence Layer
- **Database Engine**: MongoDB 7.0+ (Hosted on MongoDB Atlas AWS eu-north-1)
- **Database Name**: `futureselector`
- **ODM Modeling**: 13 Mongoose schemas with indexed references and unique constraints.

---

## 3. Directory Structure & Responsibilities

```
FutureSelector/
├── client/                     # Frontend Single Page Application
│   ├── src/
│   │   ├── component/          # Reusable UI & Modal components
│   │   │   ├── reactbits/      # Special interactive visual components (SpotlightCard, ShinyText, etc.)
│   │   │   ├── AuthModal.jsx   # OTP & Google student auth modal
│   │   │   ├── Navbar.jsx      # Sticky consumer navigation header
│   │   │   ├── SeatLockModal.jsx # ₹15,000 Admission Pass claiming modal
│   │   │   └── ...
│   │   ├── config/             # Client-side configuration (firebase.js)
│   │   ├── context/            # React state contexts (AuthContext.jsx, AdminAuthContext.jsx)
│   │   ├── data/               # Static datasets (institutes.js)
│   │   ├── layout/             # Layout templates (AdminLayout.jsx)
│   │   ├── pages/              # 11 Main Consumer Pages
│   │   │   ├── Home.jsx        # Landing hero, value props, Kota map, marquee
│   │   │   ├── FindCoaching.jsx# Filterable directory with search/filters
│   │   │   ├── Compare.jsx     # Side-by-side comparison engine & PDF export
│   │   │   ├── InstituteProfile.jsx # Deep-dive audit report per coaching
│   │   │   ├── Scholarships.jsx# National exams & eligibility calculator
│   │   │   ├── Counselling.jsx # 1-on-1 counseling booking & Razorpay modal
│   │   │   ├── Dashboard.jsx   # Student portal (Passes, shortlist, grievances)
│   │   │   ├── InstitutePortal.jsx # Partner center dashboard & lead console
│   │   │   ├── Login.jsx       # Dedicated student/partner/admin sign-in
│   │   │   └── Policies.jsx    # Terms, privacy, refund, grievance policies
│   │   ├── pages/admin/        # 13 Dedicated Super Admin Operations Pages
│   │   │   ├── AdminDashboard.jsx  # Overview metrics & quick action cards
│   │   │   ├── AdminInstitutes.jsx # Institute CRUD, partner provision, publish
│   │   │   ├── AdminLeads.jsx      # Attributed student leads ledger & CSV export
│   │   │   ├── AdminAdmissions.jsx # 4-Point admission verification suite
│   │   │   ├── AdminFinance.jsx    # Commission ledger, escrow, payout authorization
│   │   │   ├── AdminApprovals.jsx  # Two-person sensitive mutation review
│   │   │   ├── AdminRMS.jsx        # 3-Way grievance assignment & resolution
│   │   │   ├── AdminCourses.jsx    # Course directory (UI_ONLY)
│   │   │   ├── AdminCMS.jsx        # Banner/ticker editor (UI_ONLY)
│   │   │   ├── AdminAnalytics.jsx  # Platform trends & city analytics
│   │   │   ├── AdminTeam.jsx       # Staff directory (UI_ONLY)
│   │   │   ├── AdminAuditLogs.jsx  # Immutable system event logs
│   │   │   └── AdminSettings.jsx   # Operational integrations (UI_ONLY)
│   │   ├── services/           # HTTP API client wrappers (api.js, googleAuth.js)
│   │   └── utils/              # Utility helpers (pdfGenerator.js)
│   └── package.json
│
├── server/                     # Backend REST API Service
│   ├── config/
│   │   ├── db.js               # Mongoose connection pooling & status tracker
│   │   └── seedData.js         # Initial database fixtures for cold starts
│   ├── middleware/
│   │   ├── adminAuth.js        # Super Admin JWT & permission validator
│   │   ├── partnerAuth.js      # Partner JWT & tenant isolation validator
│   │   └── studentAuth.js      # Student JWT validator
│   ├── models/                 # 13 Mongoose Domain Models
│   │   ├── AdminUser.js        # Super Admin credentials, roles, permissions
│   │   ├── ApprovalRequest.js  # Sensitive mutation requests (fee, faculty, etc.)
│   │   ├── AuditLog.js         # Immutable security event logs
│   │   ├── CommissionLedger.js # Escrow & referral commission records
│   │   ├── Counselling.js      # Advisory bookings & Razorpay payment records
│   │   ├── Institute.js        # Full audited coaching profiles & agreement terms
│   │   ├── Lead.js             # Student enquiries, consent records, release flags
│   │   ├── Notification.js     # System notification model (currently dormant)
│   │   ├── PartnerApplication.js # Public partner applications
│   │   ├── PartnerUser.js      # Institute partner accounts & center scoping
│   │   ├── RMSTicket.js        # Student grievance tickets & audit history
│   │   ├── User.js             # Student user accounts & profile data
│   │   └── Voucher.js          # ₹15,000 Admission Pass records
│   ├── routes/                 # 8 Modular Express Routers
│   │   ├── adminRoutes.js      # 59KB core admin controller & workflows
│   │   ├── authRoutes.js       # Student mobile OTP & Google 1-click
│   │   ├── counsellingRoutes.js# Razorpay orders, HMAC verification & sessions
│   │   ├── instituteRoutes.js  # Public directory queries & partner apply
│   │   ├── leadRoutes.js       # Enquiry submission & explicit consent
│   │   ├── partnerRoutes.js    # Partner portal login, leads, admissions, RMS
│   │   ├── rmsRoutes.js        # Student grievance creation, confirm, reopen
│   │   └── voucherRoutes.js    # Admission pass claim, verification, lookup
│   ├── utils/
│   │   ├── auditLogger.js      # Audit log ingestion helper
│   │   └── mailer.js           # Multi-provider transactional email dispatcher
│   ├── server.js               # Express application entry point & listener
│   └── package.json
│
├── scripts/                    # Automated Test & Utility Suites
│   ├── e2e_acceptance_suite.cjs# Full E2E integration test suite (8 scenarios)
│   ├── test_counselling_payment.cjs # Razorpay ₹11 payment verification test
│   ├── test_student_auth.cjs   # Student OTP & profile persistence test
│   └── generate_report_pdf.cjs # PDF documentation report generator
├── package.json                # Root package workspace scripts
└── docs/                       # Project Documentation Suite
```

---

## 4. Authentication & Authorization Architecture

### 3 Distinct User Roles with Independent Session Stores
To prevent session collision when an administrator or developer tests multiple roles in the same browser, tokens and user state are stored under strictly separated keys:

| User Type | Token Storage Key | Profile Storage Key | Auth Header | Verification Middleware |
| :--- | :--- | :--- | :--- | :--- |
| **Student** | `localStorage.getItem("fs_token")` | `fs_student` | `Bearer <JWT>` | `middleware/studentAuth.js` |
| **Partner** | `localStorage.getItem("fs_partner_token")` | `fs_partner` | `Bearer <JWT>` | `middleware/partnerAuth.js` |
| **Super Admin** | `localStorage.getItem("fs_admin_token")` | `fs_admin` | `Bearer <JWT>` | `middleware/adminAuth.js` |

### Role-Based Access Control (RBAC)
- **Student Auth**:
  - Authenticated via 4-digit OTP (current bypass: `2026`) or Firebase Google Auth token.
  - Generates 30-day JWT signed with `JWT_SECRET`.
  - Student identity is tied to their validated phone number (`+91 XXXXX XXXXX`).
- **Partner Auth**:
  - Authenticated via email and bcrypt-hashed password.
  - Scoped to a specific `instituteId` and `instituteNumericId`.
  - Enforces `institute.status === "ACTIVE"`. If Super Admin suspends the institute, partner requests immediately return HTTP 403 Forbidden.
- **Super Admin Auth**:
  - Supports dual authentication: Master Secret Key (`ADMIN_SECRET_KEY`) or email/password verified against `AdminUser` collection via bcrypt.
  - Grants access to all administrative endpoints, approval workflows, and commission ledgers.
