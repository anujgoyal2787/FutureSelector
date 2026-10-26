# FutureSelector — Platform Architecture & Operations Manual 🎓
> **"Right Guidance. Brighter Tomorrows."**  
> Official Domain: `futureselector.in`  
> Brand Tokens: **Emerald Green** (`#124B38`), **Warm Ivory** (`#FAF8F5`), **Restrained Champagne-Gold** (`#C5A059`)

FutureSelector is an enterprise discovery, comparison, and verified admissions partner platform for JEE and NEET aspirants in India. Built with strict server-side multi-tenant data isolation, dual-authorization governance, and real MongoDB persistence.

---

## 🌟 The Three Distinct Experiences

```
                                  [ MongoDB Database ]
                                           │
                        ┌──────────────────┴──────────────────┐
                        ▼                                     ▼
            [ Student & Public Portal ]             [ Authenticated APIs ]
             (Live Published Data Only)                       │
                        │                  ┌──────────────────┴──────────────────┐
                        │                  ▼                                     ▼
                        │       [ Institute Partner Studio ]            [ Super Admin Operations Suite ]
                        │        - Password Setup Wizard                 - Manual Add Institute (Draft)
                        │        - Profile Studio (Instagram UI)         - Partner Account Provisioning
                        │        - Released Leads (Consent Only)         - Fine-Grained RBAC Permissions
                        │        - Offline Admission Reporting           - 2-Person Approval Center
                        │        - Assigned RMS Grievances               - 4-Point Admission Verification
                        │                                                - Commission Ledger (Escrow)
                        ▼                                                - Immutable Audit Logs
              /find-coaching (Published Only)
              /compare (Side-by-Side Matrix)
              /dashboard (Passes & Grievance)
```

### 1. Public Website & Student Experience
- **Live Search & Filter:** Queries live MongoDB via `/api/institutes` filtering strictly for `publicationStatus: "PUBLISHED"`. Draft, submitted, or suspended institutes never leak to students.
- **Seat Lock Pass & Voucher:** Student claims flat ₹15,000 fee grant waiver.
- **Explicit Data-Sharing Consent:** Personal contact details are held in `PENDING_CONFIRMATION` until the student explicitly confirms interest and authorizes data sharing with the specific center.
- **Student Dashboard (`/dashboard`):** Active admission passes, PDF pass downloads, 1-on-1 advisory sessions, and 3-way RMS grievance lodging with resolution confirmation and dispute reopening.

### 2. Institute Partner Portal (`/institute-portal`)
- **Strict Server Isolation:** Partner identity is verified via signed JWT (`protectPartner` middleware). The server extracts `req.partner.instituteId` from the database and ignores any client-supplied identifiers.
- **Instagram-Style Profile Studio:** Center directors directly manage permitted promotional media (Campus & Classroom Photo Gallery, Announcements Feed, Senior Faculty Roster, Star Achievers).
- **Dual-Authorization Sensitive Changes:** Material edits (Tuition Fees, New Batches, Target Exams) route directly to the Super Admin Approval Center.
- **Confirmed Leads Only:** Center directors only receive leads where `releasedToInstitute: true` AND `isConfirmedByStudent: true`. Raw or unconfirmed inquiries are never exposed.
- **Offline Admission Reporting:** Center enters pass code, student phone, tuition fee receipt number, and uploads payment proof for audit.
- **Assigned RMS Grievances:** Center responds to student fee disputes or batch allocation inquiries.

### 3. Super Admin Operations Suite (`/admin`)
- **Manual Institute Onboarding:** Admin adds draft institute records with unique numeric ID, contact person, branches, and commission terms. Draft records never appear on the student website.
- **Partner Account Provisioning:** Admin initiates idempotent partner invitations, generating secure setup links (`/institute-portal?setupToken=...`) without plaintext credentials.
- **Fine-Grained Permissions:** Individual toggles for profile editing, approval submission, lead access, admission reporting, RMS responses, and analytics.
- **2-Person Approval Center:** Review queue for fee structure changes, new batch additions, and profile updates.
- **4-Point Admission Verification:** Verifies receipt matches pass code, fee matches audited tier, student identity, and staff signature.
- **Automated Commission Ledger:** Upon verification, creates an immutable transaction in `ESCROW_LOCKED` status (15-day escrow period) calculating commission per the institute's agreement rate.
- **Immutable Audit Logging:** All sensitive administrative and partner events are recorded chronologically in `AuditLog`.

---

## 🛠️ Tech Stack & Directory Structure

- **Frontend:** React 19, Vite, Tailwind CSS, Framer Motion, Lucide Icons
- **Backend:** Node.js, Express.js, Mongoose ODM
- **Database:** MongoDB (Local or Atlas)
- **Security:** bcryptjs password hashing, JWT bearer tokens, CORS whitelist, helmet headers, IP/timestamp audit logging

```
FutureSelector/
├── client/                     # Frontend Vite Application
│   ├── src/
│   │   ├── component/          # UI Components & Modals (SeatLockModal, Navbar, etc.)
│   │   ├── pages/              # Public & Student Pages (FindCoaching, Dashboard, etc.)
│   │   │   ├── admin/          # 13 Super Admin Modular Workspaces
│   │   │   └── InstitutePortal.jsx  # Authenticated Partner Studio
│   │   └── services/api.js     # Centralized Frontend API Client
├── server/                     # Backend Express Application
│   ├── config/                 # Centralized DB Connection & Seeder
│   ├── middleware/             # adminAuth.js & partnerAuth.js Guards
│   ├── models/                 # Mongoose Schemas (Institute, PartnerUser, Lead, etc.)
│   ├── routes/                 # REST Endpoints (admin, partner, lead, rms, etc.)
│   └── server.js               # Express Server Entry Point (Port 3000)
├── scripts/
│   └── e2e_acceptance_suite.cjs # 36-Test Automated Acceptance Suite
└── tests/
```

---

## 🚀 Local Development Setup

### Prerequisites
- Node.js v18+ and npm
- MongoDB Community Server running locally on `mongodb://127.0.0.1:27017` OR a MongoDB Atlas cluster URI.

### 1. Environment Configuration
Create `server/.env` based on `server/.env.example`:
```env
PORT=3000
MONGODB_URI=mongodb://127.0.0.1:27017/futureselector
JWT_SECRET=fs_production_jwt_secret_kota_2026_super_secure
ADMIN_SECRET_KEY=fs_super_admin_secret_kota_2026
NODE_ENV=development
```

### 2. Start the Backend Server
```bash
cd server
npm install
node server.js
```
*The server will automatically connect to MongoDB and seed default Super Admin credentials and initial partner data.*

### 3. Start the Frontend Application
```bash
cd client
npm install
npm run dev
```
*Frontend runs at `http://localhost:5173`.*

---

## 🔑 Default Seeded Credentials

| Role | Portal URL | Login Email | Password / Key |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `http://localhost:5173/admin` | `admin@futureselector.com` | `admin2026` (or Secret Key: `admin2026`) |
| **Institute Partner** | `http://localhost:5173/institute-portal` | `partner@allen.in` | `partner2026` |
| **Student** | `http://localhost:5173/login` | Phone: `+91 98765 43210` | OTP: `2026` |

---

## 🧪 Automated Testing & Verification

Run the comprehensive end-to-end acceptance suite covering all 6 master prompt scenarios:
```bash
node scripts/e2e_acceptance_suite.cjs
```
### Test Coverage Summary:
- **Scenario A:** Admin Manual Institute Creation (Draft status, no public leak, partner provisioning, publication approval).
- **Scenario B:** Student Enquiry & Explicit Consent (Pending state, consent timestamp & IP, tenant-isolated lead release).
- **Scenario C:** Sensitive Profile Mutation (Dual-governance approval queue, live field update).
- **Scenario D:** 3-Way RMS Grievance Loop (Student lodges ticket, Admin assigns to institute, Partner responds, Student confirms resolution, ticket closes).
- **Scenario E:** 4-Point Admission Verification (Offline receipt submission, Super Admin verification, automatic `ESCROW_LOCKED` commission ledger generation, duplicate prevention).
- **Scenario F:** Security & RBAC Enforcement (401 unauthenticated rejection, cross-tenant IDOR rejection, suspended partner revocation).

---

## 🌐 Production Deployment Guide for `futureselector.in`

### Step 1: Production Environment Variables
Set the following on your production server (AWS EC2, Railway, or DigitalOcean):
```env
NODE_ENV=production
PORT=3000
MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.futureselector.mongodb.net/futureselector?retryWrites=true&w=majority
JWT_SECRET=<Generate a 64-character random hex string>
ADMIN_SECRET_KEY=<High-entropy administrative key>
FRONTEND_URL=https://futureselector.in
```

### Step 2: Build the Frontend Bundle
```bash
cd client
npm run build
```
*Production bundle output is generated in `client/dist`.*

### Step 3: Nginx Reverse Proxy & HTTPS Configuration
Point your domain `futureselector.in` and `www.futureselector.in` DNS A records to your server IP.

Example Nginx block:
```nginx
server {
    server_name futureselector.in www.futureselector.in;

    # Serve compiled React frontend
    location / {
        root /var/www/futureselector/client/dist;
        try_files $uri $uri/ /index.html;
    }

    # Proxy API requests to Node Express server
    location /api/ {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Step 4: Issue SSL Certificate via Let's Encrypt
```bash
sudo certbot --nginx -d futureselector.in -d www.futureselector.in
```

---

## 📄 License & Ownership
Copyright © 2026 FutureSelector India. All rights reserved.
Right Guidance. Brighter Tomorrows.
