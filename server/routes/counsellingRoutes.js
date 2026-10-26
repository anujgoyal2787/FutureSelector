const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const Razorpay = require("razorpay");
const Counselling = require("../models/Counselling");
const { logAuditEvent } = require("../utils/auditLogger");
const { initialCounselling } = require("../config/seedData");

// Helper to get initialized Razorpay Instance
function getRazorpay() {
  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;
  if (!key_id || !key_secret) return null;
  try {
    return new Razorpay({ key_id, key_secret });
  } catch (err) {
    console.warn("⚠️ Razorpay SDK initialization warning:", err.message);
    return null;
  }
}

/**
 * 1. Get all counselling bookings
 */
router.get("/", async (req, res) => {
  try {
    const bookings = await Counselling.find().sort({ createdAt: -1 });
    res.json(bookings.length > 0 ? bookings : initialCounselling);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * 2. Create Razorpay Payment Order for ₹11 Counseling Fee
 * Initiates the 1-on-1 advisory booking in PENDING_PAYMENT state
 */
router.post("/create-order", async (req, res) => {
  try {
    const { 
      studentName, phone, targetExam, counsellorName, 
      counsellorId, slotTime, date, trackTitle, notes 
    } = req.body;

    if (!studentName || !phone) {
      return res.status(400).json({ error: "Student name and phone number are required" });
    }

    const cleanPhone = `+91 ${phone.replace(/\D/g, "").slice(-10)}`;
    if (cleanPhone.length < 13) {
      return res.status(400).json({ error: "Please enter a valid 10-digit mobile number" });
    }

    const bookingId = `CNS-${Date.now().toString().slice(-4)}`;
    const feeInRupees = 11;
    const amountInPaise = feeInRupees * 100; // 1100 paise = ₹11

    let orderId = `order_cns_${Date.now()}`;

    const keyId = process.env.RAZORPAY_KEY_ID || "rzp_test_futureselector2026";
    const rzp = getRazorpay();

    // Try creating live order via Razorpay API if credentials are valid
    if (rzp) {
      try {
        const order = await rzp.orders.create({
          amount: amountInPaise,
          currency: "INR",
          receipt: `rcpt_${bookingId}`,
          notes: {
            bookingId,
            studentName,
            phone: cleanPhone,
            purpose: "1-on-1 Senior Academic Advisory"
          }
        });
        if (order && order.id) {
          orderId = order.id;
          console.log(`💳 [RAZORPAY LIVE ORDER CREATED]: ${orderId} for ₹${feeInRupees}`);
        }
      } catch (rzpErr) {
        console.warn("ℹ️ Razorpay order creation notice:", rzpErr.message);
      }
    }

    // Persist pending booking in MongoDB
    const booking = await Counselling.create({
      bookingId,
      studentName,
      phone: cleanPhone,
      targetExam: targetExam || "JEE/NEET 2026",
      counsellorName: counsellorName || "Er. Raghavendra Singhal (IIT Bombay)",
      counsellorId: counsellorId || "raghavendra",
      slotTime: slotTime || "11:00 AM - 11:30 AM",
      date: date || "Upcoming Saturday",
      trackTitle: trackTitle || "Coaching & Batch Cap Reality Check",
      feeAmount: feeInRupees,
      paymentStatus: "PENDING",
      status: "Pending_Payment",
      razorpayOrderId: orderId,
      meetingLink: "https://meet.google.com/fs-academic-advisory"
    });

    res.status(201).json({
      success: true,
      message: "₹11 Counseling Order initiated successfully",
      bookingId: booking.bookingId,
      orderId,
      amount: amountInPaise,
      currency: "INR",
      keyId,
      studentName: booking.studentName,
      phone: cleanPhone
    });
  } catch (error) {
    console.error("❌ [COUNSELLING ORDER ERROR]:", error);
    res.status(500).json({ error: "Failed to create counseling order: " + error.message });
  }
});

/**
 * 3. Verify Razorpay Payment & Confirm Booking
 * Verifies HMAC SHA256 signature and marks booking as PAID
 */
router.post("/verify-payment", async (req, res) => {
  try {
    const { 
      bookingId, 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature 
    } = req.body;

    if (!bookingId || !razorpay_payment_id) {
      return res.status(400).json({ error: "Booking ID and Payment ID are required" });
    }

    const booking = await Counselling.findOne({ bookingId });
    if (!booking) {
      return res.status(404).json({ error: "Counseling booking not found for ID: " + bookingId });
    }

    // Verify HMAC SHA256 Signature
    let isSignatureValid = false;

    if (razorpay_signature && razorpay_order_id) {
      const keySecret = process.env.RAZORPAY_KEY_SECRET || "fs_razorpay_secret_test_2026";
      const generated_signature = crypto
        .createHmac("sha256", keySecret)
        .update(razorpay_order_id + "|" + razorpay_payment_id)
        .digest("hex");

      isSignatureValid = (generated_signature === razorpay_signature);
    }

    // Allow sandbox test tokens if in non-production environment
    const isSandboxMock = process.env.NODE_ENV !== "production" && 
      (razorpay_payment_id.startsWith("pay_sim_") || razorpay_payment_id.startsWith("pay_test_"));

    if (!isSignatureValid && !isSandboxMock) {
      return res.status(400).json({ 
        error: "Invalid Razorpay payment signature. Payment verification failed." 
      });
    }

    // Update MongoDB Booking to PAID & Confirmed
    booking.paymentStatus = "PAID";
    booking.status = "Confirmed";
    booking.razorpayPaymentId = razorpay_payment_id;
    booking.razorpaySignature = razorpay_signature || "verified_in_sandbox";
    booking.paidAt = new Date();
    await booking.save();

    await logAuditEvent({
      req,
      action: "COUNSELLING_FEE_PAID",
      entityType: "Counselling",
      entityId: booking.bookingId,
      actor: {
        id: booking.phone,
        name: booking.studentName,
        email: `${booking.phone.replace(/\D/g, "")}@student.fs`,
        role: "STUDENT"
      },
      reason: `Verified ₹11 token payment via Razorpay (${razorpay_payment_id}) for 1-on-1 session with ${booking.counsellorName}`,
      newValue: {
        paymentStatus: "PAID",
        amount: 11,
        razorpayPaymentId: razorpay_payment_id
      }
    });

    console.log(`💳 [PAYMENT SUCCESS] ₹11 paid for booking ${booking.bookingId} by ${booking.studentName}`);

    res.json({
      success: true,
      message: "₹11 Payment verified successfully! 1-on-1 Advisory session is confirmed.",
      booking
    });
  } catch (error) {
    console.error("❌ [PAYMENT VERIFICATION ERROR]:", error);
    res.status(500).json({ error: "Payment verification failed: " + error.message });
  }
});

/**
 * 4. Get Student's Booked Advisory Sessions
 */
router.get("/my-sessions", async (req, res) => {
  try {
    const { phone } = req.query;
    if (!phone) {
      return res.status(400).json({ error: "Phone number is required" });
    }

    const cleanPhone = `+91 ${phone.replace(/\D/g, "").slice(-10)}`;
    const sessions = await Counselling.find({ 
      phone: cleanPhone,
      paymentStatus: "PAID"
    }).sort({ createdAt: -1 });

    res.json(sessions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
