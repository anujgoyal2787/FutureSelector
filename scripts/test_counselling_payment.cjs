/**
 * test_counselling_payment.cjs
 * Comprehensive Verification Suite for Razorpay ₹11 Counseling Payment Flow
 */

const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const API_BASE = "http://localhost:3000/api";
let RAZORPAY_KEY_SECRET = "wRCzftXSEjdH4223F12dm74o";
try {
  const envContent = fs.readFileSync(path.resolve(__dirname, "../server/.env"), "utf8");
  const match = envContent.match(/RAZORPAY_KEY_SECRET\s*=\s*([^\r\n]+)/);
  if (match && match[1]) RAZORPAY_KEY_SECRET = match[1].trim();
} catch (e) {}

async function runTests() {
  console.log("======================================================");
  console.log("🧪 RUNNING RAZORPAY ₹11 COUNSELING VERIFICATION SUITE");
  console.log("======================================================\n");

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ [PASS] ${message}`);
      passed++;
    } else {
      console.error(`  ❌ [FAIL] ${message}`);
      failed++;
    }
  }

  try {
    // 1. Health check
    const healthRes = await fetch(`${API_BASE}/health`);
    const health = await healthRes.json();
    assert(healthRes.status === 200 && health.status === "OK", "Server health check is healthy (status: OK)");

    // 2. Validation Test: Missing fields in /create-order
    const invalidOrderRes = await fetch(`${API_BASE}/counselling/create-order`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studentName: "" })
    });
    assert(invalidOrderRes.status === 400, "Rejects create-order when studentName or phone is missing (400)");

    // 3. Validation Test: Invalid phone number
    const invalidPhoneRes = await fetch(`${API_BASE}/counselling/create-order`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studentName: "Aakash Gupta", phone: "123" })
    });
    assert(invalidPhoneRes.status === 400, "Rejects create-order with invalid phone number format (400)");

    // 4. Create Order: Valid ₹11 Order
    const testPhone = "9876543210";
    const orderPayload = {
      studentName: "Aditya Sharma",
      phone: testPhone,
      targetExam: "JEE Advanced",
      counsellorName: "Er. Raghavendra Singhal",
      counsellorId: "raghavendra",
      slotTime: "Evening (6:00 PM - 9:00 PM)",
      date: "Today (Fast-Track)",
      trackTitle: "Coaching & Batch Cap Reality Check",
      notes: "Need guidance on Allen Leader batch"
    };

    const orderRes = await fetch(`${API_BASE}/counselling/create-order`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(orderPayload)
    });
    const orderData = await orderRes.json();

    assert(orderRes.status === 201, "Creates counseling order with HTTP 201 Created");
    assert(orderData.amount === 1100, "Counseling fee amount is exactly 1100 paise (₹11)");
    assert(orderData.currency === "INR", "Order currency is INR");
    assert(typeof orderData.bookingId === "string" && orderData.bookingId.startsWith("CNS-"), "Returns valid bookingId (e.g. CNS-xxxx)");
    assert(typeof orderData.orderId === "string" && orderData.orderId.length > 0, "Returns valid Razorpay orderId");

    const bookingId = orderData.bookingId;
    const orderId = orderData.orderId;

    // 5. Verify Payment: Tampered Signature Rejection
    const tamperedRes = await fetch(`${API_BASE}/counselling/verify-payment`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        bookingId,
        razorpay_order_id: orderId,
        razorpay_payment_id: "tampered_fake_payment_id",
        razorpay_signature: "invalid_tampered_signature_hex"
      })
    });
    assert(tamperedRes.status === 400, "Rejects tampered HMAC signature with HTTP 400");

    // 6. Verify Payment: Genuine HMAC SHA256 Signature Verification
    const validPaymentId = `pay_real_${Date.now()}`;
    const validSignature = crypto
      .createHmac("sha256", RAZORPAY_KEY_SECRET)
      .update(orderId + "|" + validPaymentId)
      .digest("hex");

    const verifyRes = await fetch(`${API_BASE}/counselling/verify-payment`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        bookingId,
        razorpay_order_id: orderId,
        razorpay_payment_id: validPaymentId,
        razorpay_signature: validSignature
      })
    });
    const verifyData = await verifyRes.json();

    assert(verifyRes.status === 200, "Genuine HMAC signature verified successfully with HTTP 200");
    assert(verifyData.success === true, "Response indicates success = true");
    assert(verifyData.booking.paymentStatus === "PAID", "Booking paymentStatus updated to PAID");
    assert(verifyData.booking.status === "Confirmed", "Booking status updated to Confirmed");
    assert(verifyData.booking.feeAmount === 11, "Booking feeAmount recorded as ₹11");
    assert(verifyData.booking.razorpayPaymentId === validPaymentId, "Recorded razorpayPaymentId matches verified ID");

    // 7. Verify /my-sessions retrieval
    const mySessionsRes = await fetch(`${API_BASE}/counselling/my-sessions?phone=${testPhone}`);
    const mySessions = await mySessionsRes.json();
    assert(mySessionsRes.status === 200, "Retrieves student's booked sessions");
    const foundBooking = mySessions.find(s => s.bookingId === bookingId);
    assert(Boolean(foundBooking), "Verified booking appears in student's confirmed sessions list");
    assert(foundBooking && foundBooking.paymentStatus === "PAID", "Found session has paymentStatus: PAID");

    console.log("\n======================================================");
    console.log(`📊 SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log("======================================================");

    process.exit(failed > 0 ? 1 : 0);
  } catch (err) {
    console.error("❌ Test script crashed:", err);
    process.exit(1);
  }
}

runTests();
