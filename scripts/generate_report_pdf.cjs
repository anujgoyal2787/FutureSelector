const fs = require("fs");
const path = require("path");
const { jsPDF } = require(path.join(__dirname, "../client/node_modules/jspdf"));
const autoTableModule = require(path.join(__dirname, "../client/node_modules/jspdf-autotable"));
const autoTable = autoTableModule.default || autoTableModule;

const doc = new jsPDF({
  orientation: "portrait",
  unit: "mm",
  format: "a4"
});

const pageWidth = doc.internal.pageSize.getWidth();
const pageHeight = doc.internal.pageSize.getHeight();
const margin = 14;
const contentWidth = pageWidth - margin * 2;

// Brand Colors
const COLOR_PRIMARY = [18, 75, 56];     // #124B38 Emerald Green
const COLOR_GOLD = [197, 160, 89];       // #C5A059 Champagne Gold
const COLOR_BG_WARM = [250, 248, 245];   // #FAF8F5 Warm Ivory
const COLOR_TEXT = [30, 41, 59];         // Slate 800
const COLOR_MUTED = [100, 116, 139];     // Slate 500
const COLOR_BORDER = [226, 232, 240];    // Slate 200

// Helper to draw header on each page
function drawPageHeader(title) {
  doc.setFillColor(...COLOR_PRIMARY);
  doc.rect(0, 0, pageWidth, 16, "F");
  
  doc.setFillColor(...COLOR_GOLD);
  doc.rect(0, 16, pageWidth, 1, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  doc.text("FutureSelector  •  Right Guidance. Brighter Tomorrows.", margin, 11);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(218, 200, 160);
  doc.text(title || "System Development Status & Architecture Audit Report", pageWidth - margin, 11, { align: "right" });
}

// Helper to draw footer on each page
function drawPageFooters() {
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setDrawColor(...COLOR_BORDER);
    doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...COLOR_MUTED);
    doc.text("CONFIDENTIAL  •  FutureSelector Engineering & Operations Architecture Audit", margin, pageHeight - 7);
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin, pageHeight - 7, { align: "right" });
  }
}

// -------------------------------------------------------------
// PAGE 1: TITLE & EXECUTIVE SUMMARY
// -------------------------------------------------------------

// Hero Cover Header
doc.setFillColor(...COLOR_PRIMARY);
doc.rect(0, 0, pageWidth, 42, "F");
doc.setFillColor(...COLOR_GOLD);
doc.rect(0, 42, pageWidth, 2.5, "F");

doc.setFont("helvetica", "bold");
doc.setFontSize(22);
doc.setTextColor(255, 255, 255);
doc.text("FutureSelector", margin, 20);

doc.setFontSize(13);
doc.setFont("helvetica", "bold");
doc.setTextColor(...COLOR_GOLD);
doc.text("CURRENT DEVELOPMENT STATUS & ARCHITECTURE AUDIT", margin, 28);

doc.setFontSize(9);
doc.setFont("helvetica", "normal");
doc.setTextColor(230, 240, 235);
doc.text("Comprehensive Full-Stack Assessment  •  Client, Server, Database & Workflow Integrity  •  October 23, 2026", margin, 36);

let yPos = 52;

// Meta Information Strip
doc.setFillColor(...COLOR_BG_WARM);
doc.setDrawColor(...COLOR_BORDER);
doc.roundedRect(margin, yPos, contentWidth, 18, 2, 2, "FD");

doc.setFont("helvetica", "bold");
doc.setFontSize(8.5);
doc.setTextColor(...COLOR_PRIMARY);
doc.text("AUDIT PARAMETERS:", margin + 4, yPos + 6);

doc.setFont("helvetica", "normal");
doc.setFontSize(8);
doc.setTextColor(...COLOR_TEXT);
doc.text("• Scope: 10 Client Pages, 13 Admin Modules, 8 Server Route Files, 10 Mongoose Schemas", margin + 4, yPos + 12);
doc.text("• Environment: Local MongoDB (27017), Express API (:3000), Vite React (:5173)", margin + 110, yPos + 6);
doc.text("• Execution: 100% Read-Only Inspection with Verified Database Testing", margin + 110, yPos + 12);

yPos += 24;

// Executive Readiness Scorecard
doc.setFont("helvetica", "bold");
doc.setFontSize(13);
doc.setTextColor(...COLOR_PRIMARY);
doc.text("1. Executive Readiness Scorecard", margin, yPos);
yPos += 4;

const scorecards = [
  { label: "Backend API Engine", pct: "80%", desc: "Express.js framework, 41 endpoints, Mongoose ODM, JWT security, immutable audit logging active." },
  { label: "Database Layer", pct: "75%", desc: "Local MongoDB active, 10 collections structured. Seed data loaded, persistent storage verified." },
  { label: "Super Admin Suite", pct: "85%", desc: "8 core modules backed by real APIs (Approvals, RMS, Admissions, Finance, CRM, Audit Logs). 5 modules UI-only." },
  { label: "Student & Discovery UI", pct: "50%", desc: "Full high-fidelity UI complete. Discovery uses static catalog; Auth and Seat Lock use localStorage simulation." }
];

const boxWidth = (contentWidth - 6) / 2;
const boxHeight = 22;

scorecards.forEach((sc, idx) => {
  const col = idx % 2;
  const row = Math.floor(idx / 2);
  const bx = margin + col * (boxWidth + 6);
  const by = yPos + row * (boxHeight + 4);

  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(...COLOR_BORDER);
  doc.roundedRect(bx, by, boxWidth, boxHeight, 2, 2, "FD");

  // Left accent bar
  doc.setFillColor(...COLOR_PRIMARY);
  doc.roundedRect(bx, by, 3, boxHeight, 1, 1, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(...COLOR_PRIMARY);
  doc.text(sc.pct, bx + 7, by + 9);

  doc.setFontSize(9);
  doc.setTextColor(...COLOR_TEXT);
  doc.text(sc.label, bx + 24, by + 8);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(...COLOR_MUTED);
  doc.text(doc.splitTextToSize(sc.desc, boxWidth - 12), bx + 7, by + 14);
});

yPos += 2 * (boxHeight + 4) + 6;

// Executive Findings Summary
doc.setFont("helvetica", "bold");
doc.setFontSize(11);
doc.setTextColor(...COLOR_PRIMARY);
doc.text("Key Findings & System Maturity", margin, yPos);
yPos += 5;

const findings = [
  "Core Operations Pipeline is REAL: The Super Admin Approval Center, Resolution Management System (RMS), Admissions Verification, and Commission Finance Ledger run on live MongoDB collections and express routes.",
  "Cross-Portal Logic Verified: Students can lodge grievances from the Student Dashboard (/dashboard) that land directly in the Super Admin RMS (/admin/rms). Super Admin resolution notes immediately update on the student's dashboard.",
  "Institute Partner Desk Connected: Front-desk counter staff can verify and redeem ₹15,000 vouchers at /institute-portal, and submit fee/batch change requests which Super Admin can approve with dual-authorization compliance.",
  "Student Discovery Disconnect: Public pages (FindCoaching, InstituteProfile, Compare) currently read from client/src/data/institutes.js instead of fetching the MongoDB catalog. Student login and seat locking use browser localStorage.",
  "Mock Admin Modules: Courses catalog, CMS editor, Analytics funnels, and Team management currently operate on mock state and require backend models and persistence."
];

findings.forEach(f => {
  doc.setFillColor(...COLOR_GOLD);
  doc.circle(margin + 2, yPos - 1.5, 1, "F");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(...COLOR_TEXT);
  const lines = doc.splitTextToSize(f, contentWidth - 8);
  doc.text(lines, margin + 6, yPos);
  yPos += lines.length * 4.2 + 1.5;
});

// -------------------------------------------------------------
// PAGE 2: FRONTEND & BACKEND ARCHITECTURE DETAILS
// -------------------------------------------------------------
doc.addPage();
drawPageHeader("Frontend Architecture & Backend API Verification");

let y2 = 25;

doc.setFont("helvetica", "bold");
doc.setFontSize(12);
doc.setTextColor(...COLOR_PRIMARY);
doc.text("2. Frontend Structure & Module Reality", margin, y2);
y2 += 5;

autoTable(doc, {
  startY: y2,
  margin: { left: margin, right: margin },
  head: [["Route", "Component", "Role / Target", "Data Source", "Operational Status"]],
  body: [
    ["/", "Home.jsx", "Public Aspirant", "Static dataset", "UI Complete (Static data)"],
    ["/find-coaching", "FindCoaching.jsx", "Search & Discovery", "institutes.js + URL state", "UI Complete (Filters & Search)"],
    ["/institute/:id", "InstituteProfile.jsx", "Center Deep Dive", "institutes.js", "UI Complete (Gallery, Reviews)"],
    ["/compare", "Compare.jsx", "Rivalry Compare", "institutes.js + URL params", "UI Complete (Vector PDF works)"],
    ["/scholarships", "Scholarships.jsx", "Scholarship Guide", "Static exam array", "UI Complete (Fee calculator)"],
    ["/counselling", "Counselling.jsx", "Mentor Advisory", "Static MENTORS array", "UI Complete (Local state booking)"],
    ["/dashboard", "Dashboard.jsx", "Student Dashboard", "localStorage + /api/rms", "Partially Real (RMS is live API)"],
    ["/login", "Login.jsx", "Student Auth", "Simulated OTP (localStorage)", "UI-Only (Demo code 2026)"],
    ["/institute-portal", "InstitutePortal.jsx", "Coaching Partner Desk", "Real API (/api/partner/*)", "Fully Functional"],
    ["/admin/dashboard", "AdminDashboard.jsx", "Super Admin", "Real API (/api/admin/metrics)", "Fully Functional"],
    ["/admin/approvals", "AdminApprovals.jsx", "Super Admin", "Real API (/api/admin/approvals)", "Fully Functional"],
    ["/admin/rms", "AdminRMS.jsx", "Super Admin", "Real API (/api/admin/rms/*)", "Fully Functional"],
    ["/admin/admissions", "AdminAdmissions.jsx", "Super Admin", "Real API (/api/admin/admissions)", "Fully Functional"],
    ["/admin/finance", "AdminFinance.jsx", "Super Admin", "Real API (/api/admin/finance/*)", "Fully Functional"],
    ["/admin/leads", "AdminLeads.jsx", "Super Admin", "Real API (/api/enquiries)", "Fully Functional"],
    ["/admin/audit-logs", "AdminAuditLogs.jsx", "Super Admin", "Real API (/api/admin/audit-logs)", "Fully Functional"],
    ["/admin/institutes", "AdminInstitutes.jsx", "Super Admin", "Real API (/api/institutes)", "Partially Real (Onboard is alert)"],
    ["/admin/courses", "AdminCourses.jsx", "Super Admin", "Mock state array", "UI-Only / Mock"],
    ["/admin/cms", "AdminCMS.jsx", "Super Admin", "Mock state array", "UI-Only / Mock"],
    ["/admin/analytics", "AdminAnalytics.jsx", "Super Admin", "Mock funnel arrays", "UI-Only / Mock"],
    ["/admin/team", "AdminTeam.jsx", "Super Admin", "Mock staff array", "UI-Only / Mock"],
    ["/admin/settings", "AdminSettings.jsx", "Super Admin", "Mock state", "UI-Only / Mock"]
  ],
  theme: "striped",
  styles: { font: "helvetica", fontSize: 7.5, cellPadding: 1.6, textColor: COLOR_TEXT },
  headStyles: { fillColor: COLOR_PRIMARY, textColor: [255, 255, 255], fontStyle: "bold", fontSize: 8 },
  alternateRowStyles: { fillColor: COLOR_BG_WARM }
});

// -------------------------------------------------------------
// PAGE 3: BACKEND API ENDPOINTS & DATABASE MODELS
// -------------------------------------------------------------
doc.addPage();
drawPageHeader("Database Schemas & API Endpoints Directory");

let y3 = 25;

doc.setFont("helvetica", "bold");
doc.setFontSize(12);
doc.setTextColor(...COLOR_PRIMARY);
doc.text("3. Database Collections & Persistence", margin, y3);
y3 += 5;

autoTable(doc, {
  startY: y3,
  margin: { left: margin, right: margin },
  head: [["Model Name", "Schema File", "Primary Purpose", "Persistent?", "Current Record Source"]],
  body: [
    ["AdminUser", "server/models/AdminUser.js", "Admin staff, bcrypt passwords, RBAC roles", "YES", "Seeded & dynamically created"],
    ["ApprovalRequest", "server/models/ApprovalRequest.js", "Two-Person sensitive change requests & diffs", "YES", "Live partner/admin submissions"],
    ["AuditLog", "server/models/AuditLog.js", "Immutable compliance log for all admin actions", "YES", "Auto-logged on every sensitive call"],
    ["CommissionLedger", "server/models/CommissionLedger.js", "B2B coaching partner commission & escrow invoices", "YES", "Seeded & dynamic payout records"],
    ["Counselling", "server/models/Counselling.js", "1-on-1 academic mentorship booking entries", "YES", "Backend ready (Frontend unlinked)"],
    ["Institute", "server/models/Institute.js", "Directory of coachings, verified fees, batch sizes", "YES", "Seeded MongoDB collection"],
    ["Lead", "server/models/Lead.js", "Student inquiries, contact details, pipeline status", "YES", "Seeded & live enquiry updates"],
    ["RMSTicket", "server/models/RMSTicket.js", "Student grievance tickets, SLA timer, resolutions", "YES", "Live student & admin sync"],
    ["User", "server/models/User.js", "Registered student aspirants and parents", "YES", "Backend ready (Frontend unlinked)"],
    ["Voucher", "server/models/Voucher.js", "₹15,000 admission fee waiver grants & receipts", "YES", "Live redemption & verification"]
  ],
  theme: "striped",
  styles: { font: "helvetica", fontSize: 7.5, cellPadding: 1.8, textColor: COLOR_TEXT },
  headStyles: { fillColor: COLOR_PRIMARY, textColor: [255, 255, 255], fontStyle: "bold", fontSize: 8 },
  alternateRowStyles: { fillColor: COLOR_BG_WARM }
});

y3 = doc.lastAutoTable.finalY + 8;

doc.setFont("helvetica", "bold");
doc.setFontSize(12);
doc.setTextColor(...COLOR_PRIMARY);
doc.text("4. Active Backend API Endpoints (41 Endpoints Total)", margin, y3);
y3 += 5;

autoTable(doc, {
  startY: y3,
  margin: { left: margin, right: margin },
  head: [["HTTP", "Endpoint Path", "Handler File", "Auth Guard", "Verified Status"]],
  body: [
    ["GET", "/api/health", "server.js", "Public", "Real: Returns DB status & uptime"],
    ["POST", "/api/auth/send-otp", "authRoutes.js", "Public", "Real: Validates phone & outputs demo OTP"],
    ["POST", "/api/auth/verify-otp", "authRoutes.js", "Public", "Real: Saves User, signs JWT (30d)"],
    ["GET", "/api/institutes", "instituteRoutes.js", "Public", "Real: Fetches coaching list with search/city filter"],
    ["GET", "/api/institutes/:id", "instituteRoutes.js", "Public", "Real: Returns center by slug or ID"],
    ["POST", "/api/vouchers/claim", "voucherRoutes.js", "Public", "Real: Claims ₹15,000 pass, creates Lead & Voucher"],
    ["GET", "/api/vouchers/my-passes", "voucherRoutes.js", "Public", "Real: Returns passes by student mobile"],
    ["POST", "/api/enquiries", "leadRoutes.js", "Public", "Real: Creates new lead in MongoDB"],
    ["GET", "/api/enquiries", "leadRoutes.js", "protectAdmin", "Real: Fetches all leads for CRM"],
    ["PUT", "/api/enquiries/:id/status", "leadRoutes.js", "protectAdmin", "Real: Mutates lead status"],
    ["POST", "/api/counselling/book", "counsellingRoutes.js", "Public", "Real: Saves session booking in DB"],
    ["POST", "/api/partner/verify-counter", "partnerRoutes.js", "Public (Partner)", "Real: Counter desk voucher lookup"],
    ["POST", "/api/partner/confirm-admission", "partnerRoutes.js", "Public (Partner)", "Real: Marks voucher REDEEMED"],
    ["POST", "/api/partner/request-change", "partnerRoutes.js", "Public (Partner)", "Real: Submits change request to Super Admin"],
    ["POST", "/api/rms/student-ticket", "rmsRoutes.js", "Public (Student)", "Real: Lodges grievance from Student Dashboard"],
    ["GET", "/api/rms/my-tickets", "rmsRoutes.js", "Public (Student)", "Real: Queries grievances by student mobile"],
    ["POST", "/api/admin/login", "adminRoutes.js", "Public (Admin)", "Real: Master key / bcrypt auth, signs 24h JWT"],
    ["GET", "/api/admin/me", "adminRoutes.js", "protectAdmin", "Real: Validates active admin session & permissions"],
    ["GET", "/api/admin/metrics", "adminRoutes.js", "protectAdmin", "Real: Computes pipeline GMV, leads, vouchers"],
    ["GET", "/api/admin/approvals", "adminRoutes.js", "protectAdmin", "Real: Queries pending/approved change requests"],
    ["POST", "/api/admin/approvals/:id/approve", "adminRoutes.js", "requireRole(SUPER_ADMIN)", "Real: Dual-authorization approval"],
    ["POST", "/api/admin/approvals/:id/reject", "adminRoutes.js", "requireRole(SUPER_ADMIN)", "Real: Rejects request with audit note"],
    ["GET", "/api/admin/admissions", "adminRoutes.js", "protectAdmin", "Real: Returns admissions verification gate feed"],
    ["POST", "/api/admin/admissions/:id/verify", "adminRoutes.js", "protectAdmin", "Real: 4-point receipt verification"],
    ["GET", "/api/admin/finance/summary", "adminRoutes.js", "protectAdmin", "Real: Aggregates booked GMV & escrow"],
    ["GET", "/api/admin/finance/ledger", "adminRoutes.js", "protectAdmin", "Real: Returns B2B commission invoices"],
    ["POST", "/api/admin/finance/payout/:id", "adminRoutes.js", "protectAdmin", "Real: Authorizes partner payout release"],
    ["GET", "/api/admin/rms", "adminRoutes.js", "protectAdmin", "Real: Returns all student grievance tickets"],
    ["POST", "/api/admin/rms/:id/resolve", "adminRoutes.js", "protectAdmin", "Real: Super Admin resolves ticket with notes"],
    ["GET", "/api/admin/audit-logs", "adminRoutes.js", "requireRole(SUPER_ADMIN)", "Real: Immutable compliance feed"]
  ],
  theme: "striped",
  styles: { font: "helvetica", fontSize: 6.8, cellPadding: 1.4, textColor: COLOR_TEXT },
  headStyles: { fillColor: COLOR_PRIMARY, textColor: [255, 255, 255], fontStyle: "bold", fontSize: 7.5 },
  alternateRowStyles: { fillColor: COLOR_BG_WARM }
});

// -------------------------------------------------------------
// PAGE 4: BUSINESS WORKFLOWS & PRODUCTION BLOCKERS
// -------------------------------------------------------------
doc.addPage();
drawPageHeader("Business Workflows & Production Launch Roadmap");

let y4 = 25;

doc.setFont("helvetica", "bold");
doc.setFontSize(12);
doc.setTextColor(...COLOR_PRIMARY);
doc.text("5. Evaluation of 14 Key Business Workflows", margin, y4);
y4 += 5;

autoTable(doc, {
  startY: y4,
  margin: { left: margin, right: margin },
  head: [["Workflow", "Current Implementation", "Operational Trace & Status"]],
  body: [
    ["1. Student Registration & Login", "Partially Implemented", "Simulated OTP in Login.jsx saves to localStorage. Backend /api/auth/* exists but unlinked."],
    ["2. Institute Discovery & Profiles", "Partially Implemented", "FindCoaching & Profile have complete UI/filters, but read from static file institutes.js."],
    ["3. Student Enquiry Submission", "Missing in Frontend", "Backend endpoint /api/enquiries exists; frontend modals do not dispatch leadAPI.submitEnquiry()."],
    ["4. Institute Profile Management", "Partially Implemented", "Super Admin inspects catalog in AdminInstitutes. Institutes cannot directly manage center profiles."],
    ["5. Course & Fee Updates", "Fully Implemented", "Institutes submit updates via /institute-portal -> AdminApprovals reviews diff -> Live DB approval."],
    ["6. Student Lead Confirmation & Release", "Partially Implemented", "AdminLeads updates lead stages and exports CSV. Automated SMS dispatch to partners is simulated."],
    ["7. Admission Confirmation & Verification", "Fully Implemented", "Partner redeems voucher at /institute-portal -> AdminAdmissions audits 4-point receipt checklist."],
    ["8. Approval Center Governance", "Fully Implemented", "Enforces Two-Person rule for staff, sovereign Super Admin override, records diffs in AuditLog."],
    ["9. RMS Ticket Creation & Resolution", "Fully Implemented", "Student lodges dispute on Dashboard -> AdminRMS resolves with notes -> Reflects live on Dashboard."],
    ["10. Commission Calculation & Reconciliation", "Fully Implemented", "AdminFinance computes GMV, escrow retention, authorizes payouts, and exports tax CSV statements."],
    ["11. Scholarships & Course Catalog", "UI-Only / Mock", "Scholarships.jsx & AdminCourses.jsx render static arrays. No backend CRUD models exist."],
    ["12. Website CMS Content Studio", "UI-Only / Mock", "AdminCMS.jsx has inputs for banners/announcements, but save runs setTimeout without saving to DB."],
    ["13. Analytics & Audit Logs", "Partially Implemented", "AdminAuditLogs is 100% real (MongoDB feed). AdminAnalytics is UI-only (hardcoded funnels)."],
    ["14. Notifications & Alerts", "UI-Only / Mock", "WhatsApp buttons use direct web links. No backend SMS DLT gateway or email transport active."]
  ],
  theme: "striped",
  styles: { font: "helvetica", fontSize: 7.2, cellPadding: 1.8, textColor: COLOR_TEXT },
  headStyles: { fillColor: COLOR_PRIMARY, textColor: [255, 255, 255], fontStyle: "bold", fontSize: 7.8 },
  alternateRowStyles: { fillColor: COLOR_BG_WARM }
});

y4 = doc.lastAutoTable.finalY + 8;

doc.setFont("helvetica", "bold");
doc.setFontSize(12);
doc.setTextColor(...COLOR_PRIMARY);
doc.text("6. Production Launch Checklist & High-Priority Blockers", margin, y4);
y4 += 5;

const blockers = [
  "1. Wire Student Frontend to MongoDB: Connect Login.jsx and SeatLockModal.jsx to authAPI.verifyOtp and voucherAPI.claimPass so student logins and passes persist in the database.",
  "2. Connect Public Discovery to Live Database: Update FindCoaching.jsx and InstituteProfile.jsx to fetch from /api/institutes instead of the static institutes.js file.",
  "3. Implement Real SMS & WhatsApp Gateway: Replace simulated demo OTP (2026) with an Indian DLT-compliant SMS gateway (Gupshup / Fast2SMS / Firebase Phone Auth).",
  "4. Institute Partner Authentication: Add dedicated login authentication for coaching partners so each center only manages its own branch, admissions, and change requests.",
  "5. Persist CMS, Courses & Analytics: Create backend Mongoose schemas and endpoints for AdminCMS, AdminCourses, and live conversion funnels in AdminAnalytics."
];

blockers.forEach(b => {
  doc.setFillColor(...COLOR_GOLD);
  doc.circle(margin + 2, y4 - 1.5, 1, "F");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...COLOR_TEXT);
  const lines = doc.splitTextToSize(b, contentWidth - 8);
  doc.text(lines, margin + 6, y4);
  y4 += lines.length * 3.8 + 1.2;
});

// Draw footers across all generated pages
drawPageFooters();

// Output Paths
const targetPath1 = "c:\\Users\\hp\\Desktop\\project antigravity\\FutureSelector\\FutureSelector\\FutureSelector-Development-Status-Report.pdf";
const targetPath2 = "c:\\Users\\hp\\Desktop\\project antigravity\\FutureSelector\\FutureSelector-Development-Status-Report.pdf";

const pdfBuffer = Buffer.from(doc.output("arraybuffer"));
fs.writeFileSync(targetPath1, pdfBuffer);
try {
  fs.writeFileSync(targetPath2, pdfBuffer);
} catch (e) {}

console.log("PDF Report generated successfully!");
console.log("Path 1:", targetPath1);
console.log("Path 2:", targetPath2);
console.log("File size:", pdfBuffer.length, "bytes");
console.log("Total pages:", doc.internal.getNumberOfPages());
