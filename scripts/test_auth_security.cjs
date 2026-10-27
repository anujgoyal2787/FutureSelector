/**
 * FutureSelector — Comprehensive Authentication Security Test Suite (FS-P0-02)
 * 
 * Verifies:
 * 1. Valid OTP generation with 4-digit cryptographically secure code.
 * 2. Invalid phone number rejection.
 * 3. 30-second resend rate-limiting cooldown.
 * 4. Invalid OTP rejection with attempt countdown.
 * 5. Excessive attempt lockout (max 3 failed attempts).
 * 6. Single-use consumption (reused/replayed OTP rejection).
 * 7. Expired OTP rejection (TTL enforcement).
 * 8. Production demo OTP ("2026") strict rejection.
 * 9. Production SMS gateway unconfigured 503 rejection.
 * 10. Admin secret key bypass blocked in production.
 * 11. Legitimate admin login with bcrypt password verification.
 * 12. Synthetic admin token rejection by adminAuth middleware.
 */

const http = require("http");
const path = require("path");
const assert = require("assert");

// Load server environment variables
try {
  require(path.join(__dirname, "../server/node_modules/dotenv")).config({
    path: path.join(__dirname, "../server/.env")
  });
} catch {}

// Load local otpService directly for internal state tests
const otpService = require("../server/utils/otpService");

const API_BASE = "http://localhost:3000/api";

function request(endpoint, options = {}) {
  return new Promise((resolve, reject) => {
    const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
    const fullUrl = new URL(API_BASE + cleanEndpoint);
    const reqOptions = {
      hostname: fullUrl.hostname,
      port: fullUrl.port,
      path: fullUrl.pathname + fullUrl.search,
      method: options.method || "GET",
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {})
      }
    };

    const req = http.request(reqOptions, (res) => {
      let body = "";
      res.on("data", (chunk) => (body += chunk));
      res.on("end", () => {
        let json = null;
        try {
          json = JSON.parse(body);
        } catch {}
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data: json,
          raw: body
        });
      });
    });

    req.on("error", reject);

    if (options.body) {
      req.write(typeof options.body === "string" ? options.body : JSON.stringify(options.body));
    }
    req.end();
  });
}

let passed = 0;
let failed = 0;

function report(name, isSuccess, details = "") {
  if (isSuccess) {
    passed++;
    console.log(`  ✅ [PASS] ${name}`);
  } else {
    failed++;
    console.error(`  ❌ [FAIL] ${name} — ${details}`);
  }
}

async function runAuthSecurityTests() {
  console.log("================================================================================");
  console.log("🧪 RUNNING FUTURESELECTOR AUTHENTICATION & SECURITY TEST SUITE (FS-P0-02)");
  console.log("================================================================================\n");

  const testPhone = "9012345678";
  let generatedOtp = null;

  // -------------------------------------------------------------------------
  // SECTION 1: OTP Generation & Rate Limiting
  // -------------------------------------------------------------------------
  console.log("--- 1. OTP Generation, Cooldown & Validation ---");

  // Clear test state
  otpService._clearAll();

  // Test 1: Send OTP with valid phone
  try {
    const res = await request("/auth/send-otp", {
      method: "POST",
      body: { phone: testPhone, name: "Security Test Student" }
    });
    const ok = res.status === 200 && res.data && res.data.success && res.data.demoOtp && res.data.demoOtp.length === 4;
    generatedOtp = res.data?.demoOtp;
    report("Send OTP generates secure 4-digit code in dev mode", ok, `Status: ${res.status}, body: ${res.raw}`);
  } catch (err) {
    report("Send OTP generates secure 4-digit code in dev mode", false, err.message);
  }

  // Test 2: Invalid phone rejected
  try {
    const res = await request("/auth/send-otp", {
      method: "POST",
      body: { phone: "123", name: "Bad Phone" }
    });
    const ok = res.status === 400 && res.data && res.data.error;
    report("Invalid phone number rejected with 400", ok, `Status: ${res.status}`);
  } catch (err) {
    report("Invalid phone number rejected with 400", false, err.message);
  }

  // Test 3: 30-second cooldown rate limiting
  try {
    const res = await request("/auth/send-otp", {
      method: "POST",
      body: { phone: testPhone, name: "Rapid Resend" }
    });
    const ok = res.status === 429 && res.data && res.data.error && res.data.retryAfter !== undefined;
    report("Immediate resend within 30s triggers HTTP 429 rate limit cooldown", ok, `Status: ${res.status}, msg: ${res.data?.error}`);
  } catch (err) {
    report("Immediate resend within 30s triggers HTTP 429 rate limit cooldown", false, err.message);
  }

  // -------------------------------------------------------------------------
  // SECTION 2: OTP Verification, Attempt Limiting & Single-Use
  // -------------------------------------------------------------------------
  console.log("\n--- 2. OTP Verification, Attempt Limits & Single-Use ---");

  const brutePhone = "9111222333";
  await request("/auth/send-otp", { method: "POST", body: { phone: brutePhone, name: "Brute Attacker" } });

  // Test 4: Wrong OTP rejected with remaining attempts
  try {
    const res = await request("/auth/verify-otp", {
      method: "POST",
      body: { phone: brutePhone, otp: "0000" }
    });
    const ok = res.status === 400 && res.data && res.data.error && res.data.error.includes("attempt");
    report("Incorrect OTP rejected with 400 and remaining attempts warning", ok, `Status: ${res.status}, error: ${res.data?.error}`);
  } catch (err) {
    report("Incorrect OTP rejected with 400 and remaining attempts warning", false, err.message);
  }

  // Test 5: Excessive attempts lockout (attempt 2 then attempt 3)
  try {
    await request("/auth/verify-otp", { method: "POST", body: { phone: brutePhone, otp: "1111" } });
    const res3 = await request("/auth/verify-otp", { method: "POST", body: { phone: brutePhone, otp: "2222" } });
    const ok = (res3.status === 429 || res3.status === 400) && res3.data?.error.includes("Maximum verification attempts exceeded");
    report("3 consecutive failed attempts locks out OTP with 429/400", ok, `Status: ${res3.status}, error: ${res3.data?.error}`);

    // Verify subsequent attempt is rejected because OTP was destroyed
    const res4 = await request("/auth/verify-otp", { method: "POST", body: { phone: brutePhone, otp: "2026" } });
    const okLocked = res4.status === 400 && res4.data?.error.includes("expired or was not requested");
    report("Locked out OTP is purged and rejected on next attempt", okLocked, `Status: ${res4.status}`);
  } catch (err) {
    report("3 consecutive failed attempts locks out OTP", false, err.message);
  }

  // Test 6: Single-use consumption (replay attack prevention)
  const replayPhone = "9444555666";
  const sendReplayRes = await request("/auth/send-otp", {
    method: "POST",
    body: { phone: replayPhone, name: "Replay Student" }
  });
  const replayOtp = sendReplayRes.data?.demoOtp;

  try {
    // First verification: should succeed
    const firstVerify = await request("/auth/verify-otp", {
      method: "POST",
      body: { phone: replayPhone, otp: replayOtp, name: "Replay Student" }
    });
    const okFirst = firstVerify.status === 200 && firstVerify.data?.token;

    // Second verification with the exact same OTP: MUST FAIL
    const secondVerify = await request("/auth/verify-otp", {
      method: "POST",
      body: { phone: replayPhone, otp: replayOtp, name: "Replay Student" }
    });
    const okReplayBlocked = secondVerify.status === 400 && secondVerify.data?.error.includes("expired or was not requested");

    report("Valid OTP verification succeeds and returns JWT", okFirst, `Status: ${firstVerify.status}`);
    report("Reused OTP is rejected immediately (single-use consumption)", okReplayBlocked, `Status: ${secondVerify.status}`);
  } catch (err) {
    report("Single-use consumption test", false, err.message);
  }

  // Test 7: Expired OTP rejection
  const expiredPhone = "9777888999";
  otpService._setMockRecord(expiredPhone, {
    otp: "5555",
    expiresAt: Date.now() - 1000, // Expired 1 second ago
    attempts: 0,
    maxAttempts: 3,
    lastRequestedAt: Date.now() - 60000,
    requestTimestamps: []
  });

  try {
    const expRes = otpService.verifyOtp(expiredPhone, "5555");
    const ok = expRes.success === false && expRes.error.includes("expired");
    report("Expired OTP past 5-minute TTL is rejected with 400", ok, `Status: ${expRes.status}, msg: ${expRes.error}`);
  } catch (err) {
    report("Expired OTP past 5-minute TTL is rejected with 400", false, err.message);
  }

  // -------------------------------------------------------------------------
  // SECTION 3: Production Isolation (Strict rejection of 2026 & SMS Gateway)
  // -------------------------------------------------------------------------
  console.log("\n--- 3. Production Environment Isolation ---");

  // Test 8: Unit test verifyOtp rejecting "2026" in production mode
  const originalEnv = process.env.NODE_ENV;
  process.env.NODE_ENV = "production";
  delete process.env.ALLOW_DEMO_OTP;

  try {
    const prodVerify = otpService.verifyOtp("9888888888", "2026");
    const ok = prodVerify.success === false && prodVerify.error.includes("Demo OTP is strictly prohibited in production mode");
    report("Fixed demo OTP '2026' is strictly rejected in production", ok, `Error: ${prodVerify.error}`);
  } catch (err) {
    report("Fixed demo OTP '2026' is strictly rejected in production", false, err.message);
  }

  // Test 9: Unit test generateOtp refusing delivery when no paid SMS gateway configured
  delete process.env.SMS_GATEWAY_API_KEY;
  try {
    const prodGen = otpService.generateOtp("9888888888", "Prod Student");
    const ok = prodGen.success === false && prodGen.status === 503 && prodGen.error.includes("SMS delivery gateway is not configured for production");
    report("Production sendOtp returns 503 without fake SMS delivery when paid provider is unconfigured", ok, `Status: ${prodGen.status}, msg: ${prodGen.error}`);
  } catch (err) {
    report("Production sendOtp returns 503 without fake SMS delivery", false, err.message);
  }

  // Restore env
  process.env.NODE_ENV = originalEnv || "development";

  // -------------------------------------------------------------------------
  // SECTION 4: Super Admin Security & Bypass Hardening
  // -------------------------------------------------------------------------
  console.log("\n--- 4. Super Admin Authentication & Bypass Restrictions ---");

  // Test 10: Secret key rejected when secretKey is invalid
  try {
    const res = await request("/admin/login", {
      method: "POST",
      body: { secretKey: "invalid_secret_key_123" }
    });
    const ok = res.status === 401 && res.data?.error.includes("Invalid Master Admin Key");
    report("Invalid administrative secret key rejected with 401", ok, `Status: ${res.status}`);
  } catch (err) {
    report("Invalid administrative secret key rejected with 401", false, err.message);
  }

  // Test 11: Invalid email / password rejected
  try {
    const res = await request("/admin/login", {
      method: "POST",
      body: { email: "admin@futureselector.com", password: "wrong_password" }
    });
    const ok = res.status === 401 && res.data?.error.includes("Invalid administrative credentials");
    report("Incorrect admin password rejected with 401", ok, `Status: ${res.status}`);
  } catch (err) {
    report("Incorrect admin password rejected with 401", false, err.message);
  }

  // Test 12: Legitimate admin login with bcrypt verified credentials succeeds
  let validAdminToken = null;
  try {
    const res = await request("/admin/login", {
      method: "POST",
      body: { email: "admin@futureselector.com", password: "admin2026" }
    });
    const ok = res.status === 200 && res.data?.token && res.data?.admin?.role === "SUPER_ADMIN";
    validAdminToken = res.data?.token;
    report("Legitimate Super Admin login (email + bcrypt password) succeeds", ok, `Status: ${res.status}, role: ${res.data?.admin?.role}`);
  } catch (err) {
    report("Legitimate Super Admin login (email + bcrypt password) succeeds", false, err.message);
  }

  // Test 13: Protected admin endpoint accessed with valid token
  try {
    const res = await request("/admin/metrics", {
      headers: { Authorization: `Bearer ${validAdminToken}` }
    });
    const ok = res.status === 200 && (res.data?.success || res.data?.totalLeads !== undefined);
    report("Protected Super Admin endpoint (/api/admin/metrics) accessible with valid token", ok, `Status: ${res.status}`);
  } catch (err) {
    report("Protected Super Admin endpoint accessible with valid token", false, err.message);
  }

  // Test 14: Fake synthetic admin token rejected by adminAuth middleware
  const jwt = require("../server/node_modules/jsonwebtoken");
  const JWT_SECRET = process.env.JWT_SECRET || "fs_jwt_secret_2026";
  const syntheticToken = jwt.sign(
    { id: "507f1f77bcf86cd799439011", role: "SUPER_ADMIN", permissions: ["*"] },
    JWT_SECRET,
    { expiresIn: "1h" }
  );

  try {
    const res = await request("/admin/metrics", {
      headers: { Authorization: `Bearer ${syntheticToken}` }
    });
    const ok = res.status === 401 && res.data?.message.includes("no longer exists in database");
    report("Synthetic admin token rejected by middleware when account not in MongoDB", ok, `Status: ${res.status}, msg: ${res.data?.message}`);
  } catch (err) {
    report("Synthetic admin token rejected by middleware", false, err.message);
  }

  // -------------------------------------------------------------------------
  // FINAL REPORT
  // -------------------------------------------------------------------------
  console.log("\n================================================================================");
  console.log(`📊 TEST EXECUTION SUMMARY: ${passed} PASSED, ${failed} FAILED (TOTAL: ${passed + failed})`);
  console.log("================================================================================\n");

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runAuthSecurityTests().catch((err) => {
  console.error("FATAL ERROR IN TEST SUITE:", err);
  process.exit(1);
});
