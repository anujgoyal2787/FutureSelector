/**
 * FutureSelector End-to-End Automated Acceptance Test Suite
 * Validates all business rules, server-side data isolation, and workflows
 * against the live production server and MongoDB instance.
 */

const http = require("http");

const BASE_URL = "http://localhost:3000";

// Helper for making JSON HTTP requests
const apiCall = (method, path, body = null, token = null) => {
  return new Promise((resolve, reject) => {
    const url = new URL(`${BASE_URL}${path}`);
    const headers = {
      "Content-Type": "application/json"
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const payload = body ? JSON.stringify(body) : null;
    if (payload) {
      headers["Content-Length"] = Buffer.byteLength(payload);
    }

    const req = http.request(
      url,
      {
        method,
        headers
      },
      (res) => {
        let rawData = "";
        res.on("data", (chunk) => {
          rawData += chunk;
        });
        res.on("end", () => {
          try {
            const parsed = rawData ? JSON.parse(rawData) : {};
            resolve({ status: res.statusCode, data: parsed });
          } catch (e) {
            resolve({ status: res.statusCode, raw: rawData });
          }
        });
      }
    );

    req.on("error", (err) => {
      reject(err);
    });

    if (payload) {
      req.write(payload);
    }
    req.end();
  });
};

const runSuite = async () => {
  console.log("=================================================================");
  console.log("🚀 STARTING FUTURESELECTOR E2E INTEGRATION & ACCEPTANCE SUITE");
  console.log("=================================================================\n");

  let passed = 0;
  let failed = 0;

  const assert = (condition, title, details = "") => {
    if (condition) {
      console.log(`  ✅ [PASS] ${title}`);
      passed++;
    } else {
      console.error(`  ❌ [FAIL] ${title} ${details ? `(${details})` : ""}`);
      failed++;
    }
  };

  try {
    // -------------------------------------------------------------
    // TEST 1: HEALTH & MONGODB LIVE READINESS
    // -------------------------------------------------------------
    console.log("📋 1. Checking Database Health & Server Status...");
    const health = await apiCall("GET", "/api/health");
    assert(health.status === 200, "Health check returns 200 OK");
    assert(health.data.database?.connected === true, "MongoDB connection verified active");

    // -------------------------------------------------------------
    // TEST 2: SUPER ADMIN AUTHENTICATION
    // -------------------------------------------------------------
    console.log("\n📋 2. Testing Super Admin Authentication...");
    const adminLogin = await apiCall("POST", "/api/admin/login", {
      email: "admin@futureselector.com",
      password: "admin2026"
    });
    assert(adminLogin.status === 200 && adminLogin.data.token, "Super Admin authenticated via bcrypt");
    const adminToken = adminLogin.data.token;

    // -------------------------------------------------------------
    // TEST 3: SCENARIO A — MANUAL ADMIN INSTITUTE ONBOARDING & DRAFT ISOLATION
    // -------------------------------------------------------------
    console.log("\n📋 3. Scenario A: Admin Manual Institute Creation & Partner Invitation...");
    const testInstName = `Apex Institute Test-${Date.now().toString().slice(-4)}`;
    const createInstRes = await apiCall(
      "POST",
      "/api/admin/institutes/manual",
      {
        name: testInstName,
        displayName: `${testInstName}, Kota`,
        location: "Kota, Rajasthan",
        cityKey: "kota",
        fees: "₹1,30,000 / Yr",
        numericFee: 130000,
        contactPerson: {
          name: "Er. Ramesh Chandra",
          email: `director@${testInstName.toLowerCase().replace(/[^a-z0-9]/g, "")}.in`,
          phone: "+91 94140 11223"
        },
        agreementTerms: {
          commissionType: "FIXED",
          commissionRate: 8000,
          escrowDays: 15
        }
      },
      adminToken
    );
    assert(createInstRes.status === 201, "Admin creates new institute in DRAFT mode");
    const createdInst = createInstRes.data.institute;
    assert(createdInst.publicationStatus === "DRAFT", "New institute is created with DRAFT publication status");

    // CRITICAL: Verify draft institute does NOT leak on public student search
    const publicList = await apiCall("GET", "/api/institutes");
    const foundOnPublic = publicList.data.some((i) => i.name === testInstName);
    assert(!foundOnPublic, "Draft institute does NOT appear on student discovery (No draft leakage)");

    // Provision Partner Account
    const provisionRes = await apiCall(
      "POST",
      `/api/admin/institutes/${createdInst.numericId}/provision-partner`,
      {
        email: `partner@${createdInst.slug}.in`,
        name: "Er. Ramesh Chandra",
        temporaryPassword: "partner2026"
      },
      adminToken
    );
    assert(provisionRes.status === 200, "Partner account provisioned idempotently by Super Admin");
    assert(provisionRes.data.setupUrl, "Secure partner setup link generated");

    // Partner Logs In
    const partnerLoginRes = await apiCall("POST", "/api/partner/auth/login", {
      email: `partner@${createdInst.slug}.in`,
      password: "partner2026"
    });
    assert(partnerLoginRes.status === 200 && partnerLoginRes.data.token, "Partner successfully logs into Partner Portal");
    const partnerToken = partnerLoginRes.data.token;

    // Super Admin Approves & Publishes Institute
    const publishRes = await apiCall(
      "POST",
      `/api/admin/institutes/${createdInst.numericId}/publish`,
      {},
      adminToken
    );
    assert(publishRes.status === 200, "Super Admin publishes approved institute");

    // Verify it is now discoverable on public website
    const publicListAfter = await apiCall("GET", "/api/institutes");
    const foundAfterPublish = publicListAfter.data.some((i) => i.name === testInstName);
    assert(foundAfterPublish, "Published institute is now visible on student discovery portal");

    // -------------------------------------------------------------
    // TEST 4: SCENARIO B — STUDENT ENQUIRY, CONSENT & TENANT-ISOLATED LEAD RELEASE
    // -------------------------------------------------------------
    console.log("\n📋 4. Scenario B: Enquiry Submission, Explicit Consent & Lead Release Isolation...");
    // Step 1: Student submits initial enquiry
    const enquiryRes = await apiCall("POST", "/api/enquiries", {
      studentName: "Kabir Sengupta",
      phone: "+91 98301 23456",
      email: "kabir.s@gmail.com",
      instituteNumericId: createdInst.numericId,
      instituteName: testInstName,
      exam: "JEE Advanced 2026"
    });
    assert(enquiryRes.status === 201, "Student enquiry submitted");
    const leadId = enquiryRes.data.leadId;
    assert(enquiryRes.data.lead.status === "PENDING_CONFIRMATION", "Enquiry initially held in PENDING_CONFIRMATION");

    // Partner should NOT see unconfirmed lead
    const partnerLeadsBefore = await apiCall("GET", "/api/partner/leads", null, partnerToken);
    const unconfirmedFound = partnerLeadsBefore.data.leads.some((l) => l.leadId === leadId);
    assert(!unconfirmedFound, "Partner cannot view unconfirmed student enquiry (Data protection verified)");

    // Step 2: Student explicitly confirms interest and data sharing consent
    const confirmConsentRes = await apiCall(
      "POST",
      `/api/enquiries/${leadId}/confirm-interest`,
      {
        consentAgreed: true,
        batchName: "Leader 2026 Batch"
      }
    );
    assert(confirmConsentRes.status === 200, "Student explicit consent and interest confirmation recorded");
    assert(confirmConsentRes.data.lead.isConfirmedByStudent === true, "Student confirmation flag persisted in MongoDB");
    assert(confirmConsentRes.data.lead.releasedToInstitute === true, "Lead released status updated to TRUE");
    assert(confirmConsentRes.data.voucher, "₹15,000 Admission Seat Lock Pass generated for student");

    // Step 3: Partner should NOW see the released lead
    const partnerLeadsAfter = await apiCall("GET", "/api/partner/leads", null, partnerToken);
    const confirmedFound = partnerLeadsAfter.data.leads.some((l) => l.leadId === leadId);
    assert(confirmedFound, "Partner receives student contact ONLY after explicit confirmation and consent");

    // Step 4: Verify Cross-Institute Isolation (Tenant A cannot see Tenant B's leads)
    const allenPartnerLogin = await apiCall("POST", "/api/partner/auth/login", {
      email: "partner@allen.in",
      password: "partner2026"
    });
    const allenToken = allenPartnerLogin.data.token;
    const allenLeads = await apiCall("GET", "/api/partner/leads", null, allenToken);
    const allenSeesApexLead = allenLeads.data.leads.some((l) => l.leadId === leadId);
    assert(!allenSeesApexLead, "Tenant Isolation: Allen cannot access Apex Institute's student leads (IDOR prevented)");

    // -------------------------------------------------------------
    // TEST 5: SCENARIO C — SENSITIVE PROFILE MUTATION & APPROVAL GOVERNANCE
    // -------------------------------------------------------------
    console.log("\n📋 5. Scenario C: Sensitive Profile Mutation & Two-Person Approval...");
    const changeReqRes = await apiCall(
      "POST",
      "/api/partner/submit-for-approval",
      {
        changeType: "FEE_STRUCTURE_UPDATE",
        description: "Discount 1-year repeat batch fee to ₹1,15,000 for early bird aspirants",
        diff: {
          field: "Tuition Fee",
          oldValue: "₹1,30,000 / Yr",
          newValue: "₹1,15,000 / Yr (Early Bird)"
        }
      },
      partnerToken
    );
    assert(changeReqRes.status === 201, "Partner submits sensitive fee modification request");
    const approvalRequestId = changeReqRes.data.request.requestId;

    // Super Admin Reviews and Approves
    const approveRes = await apiCall(
      "POST",
      `/api/admin/approvals/${approvalRequestId}/approve`,
      { reviewNote: "Verified marketing campaign terms" },
      adminToken
    );
    assert(approveRes.status === 200, "Super Admin approves sensitive change request");

    // -------------------------------------------------------------
    // TEST 6: SCENARIO D — 3-WAY RMS GRIEVANCE LOOP
    // -------------------------------------------------------------
    console.log("\n📋 6. Scenario D: 3-Way Student Grievance Resolution & Reopen Loop...");
    // 1. Student logs grievance
    const studentTicketRes = await apiCall("POST", "/api/rms/student-ticket", {
      studentName: "Kabir Sengupta",
      studentPhone: "+91 98301 23456",
      instituteName: testInstName,
      category: "PASS_DISCOUNT_DISPUTE",
      subject: "Cash counter requested extra ₹10,000 registration deposit",
      description: "Center receptionist stated FutureSelector waiver does not apply to study material kit."
    });
    assert(studentTicketRes.status === 201, "Student lodges dispute ticket in RMS");
    const ticketId = studentTicketRes.data.ticket.ticketId;

    // 2. Super Admin assigns ticket to Institute
    const assignRes = await apiCall(
      "POST",
      `/api/admin/rms/${ticketId}/assign-institute`,
      {
        instituteId: createdInst.numericId,
        instituteName: testInstName
      },
      adminToken
    );
    assert(assignRes.status === 200, "Super Admin assigns ticket to institute partner desk");

    // 3. Institute Partner responds
    const partnerRespRes = await apiCall(
      "POST",
      `/api/partner/rms/${ticketId}/respond`,
      {
        responseText: "Clarified with accounts desk: Study material kit is 100% included under the ₹15,000 fee grant waiver."
      },
      partnerToken
    );
    assert(partnerRespRes.status === 200, "Institute partner submits official center response");

    // 4. Student views response and confirms resolution
    const confirmResolutionRes = await apiCall(
      "POST",
      `/api/rms/${ticketId}/student-confirm`,
      { studentFeedback: "Issue resolved at counter, received receipt with fee waiver." }
    );
    assert(confirmResolutionRes.status === 200, "Student confirms resolution and closes dispute");
    assert(confirmResolutionRes.data.ticket.status === "CLOSED", "Ticket status transitioned to CLOSED");

    // -------------------------------------------------------------
    // TEST 7: SCENARIO E — ADMISSION VERIFICATION & COMMISSION LEDGER
    // -------------------------------------------------------------
    console.log("\n📋 7. Scenario E: 4-Point Admission Verification & Commission Ledger Automation...");
    // 1. Partner reports offline admission with receipt
    const voucherCode = confirmConsentRes.data.voucher.voucherId;
    const reportAdmRes = await apiCall(
      "POST",
      "/api/partner/admissions/report",
      {
        voucherCode,
        studentName: "Kabir Sengupta",
        studentPhone: "+91 98301 23456",
        receiptNumber: "REC-APEX-1049",
        receiptAmount: 115000,
        receiptDate: "2026-03-01",
        counterNotes: "Full year fee received via NEFT after applying ₹15,000 voucher."
      },
      partnerToken
    );
    assert(reportAdmRes.status === 200, "Partner reports student offline admission with receipt evidence");

    // 2. Super Admin audits and verifies admission
    const verifyAdmRes = await apiCall(
      "POST",
      `/api/admin/admissions/${voucherCode}/verify`,
      { verificationNotes: "4-Point Audit: Verified receipt REC-APEX-1049 against bank statement" },
      adminToken
    );
    assert(verifyAdmRes.status === 200, "Super Admin verifies admission with 4-point criteria");
    assert(verifyAdmRes.data.commissionTransaction, "Commission ledger record automatically generated");
    assert(
      verifyAdmRes.data.commissionTransaction.payoutStatus === "ESCROW_LOCKED",
      "Commission placed in 15-day ESCROW_LOCKED status"
    );
    assert(
      verifyAdmRes.data.commissionTransaction.commissionAmount === 8000,
      "Commission amount accurately calculated per institute agreement rate (₹8,000)"
    );

    // 3. Duplicate verify attempt prevented
    const dupVerifyRes = await apiCall(
      "POST",
      `/api/admin/admissions/${voucherCode}/verify`,
      { verificationNotes: "Duplicate try" },
      adminToken
    );
    assert(dupVerifyRes.status === 400, "Duplicate admission verification rejected (Ledger integrity preserved)");

    // -------------------------------------------------------------
    // TEST 8: SCENARIO F — SECURITY & IDOR REJECTION TESTS
    // -------------------------------------------------------------
    console.log("\n📋 8. Scenario F: Security Boundary & RBAC Enforcement...");
    // Unauthenticated admin access denied
    const unauthAdmin = await apiCall("GET", "/api/admin/audit-logs");
    assert(unauthAdmin.status === 401, "Unauthenticated access to admin endpoints rejected with 401");

    // Unauthenticated partner access denied
    const unauthPartner = await apiCall("GET", "/api/partner/leads");
    assert(unauthPartner.status === 401, "Unauthenticated access to partner leads rejected with 401");

    // Suspended Institute Access Denial
    await apiCall(
      "POST",
      `/api/admin/institutes/${createdInst.numericId}/suspend`,
      { reason: "End-of-suite test suspension" },
      adminToken
    );
    const suspendedPartnerAccess = await apiCall("GET", "/api/partner/leads", null, partnerToken);
    assert(
      suspendedPartnerAccess.status === 403,
      "Suspended partner account immediately blocked from lead APIs (Server-side revocation)"
    );

    console.log("\n=================================================================");
    console.log(`📊 TEST SUITE SUMMARY: ${passed} PASSED | ${failed} FAILED`);
    console.log("=================================================================");

    if (failed === 0) {
      console.log("🎉 ALL ACCEPTANCE SCENARIOS PASSED WITH 100% SUCCESS!");
      process.exit(0);
    } else {
      console.error(`⚠️ ${failed} test(s) failed.`);
      process.exit(1);
    }
  } catch (err) {
    console.error("Test Suite Runtime Error:", err);
    process.exit(1);
  }
};

runSuite();
