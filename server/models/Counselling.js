const mongoose = require("mongoose");

const counsellingSchema = new mongoose.Schema(
  {
    bookingId: {
      type: String,
      required: true,
      unique: true // e.g. "CNS-501"
    },
    studentName: {
      type: String,
      required: true
    },
    phone: {
      type: String,
      required: true
    },
    targetExam: {
      type: String,
      default: "JEE Advanced 2026"
    },
    counsellorName: {
      type: String,
      default: "Er. Raghavendra Singhal (IIT Bombay)"
    },
    counsellorId: {
      type: String,
      default: "raghavendra"
    },
    slotTime: {
      type: String,
      default: "11:00 AM - 11:30 AM"
    },
    date: {
      type: String,
      default: "Upcoming Saturday"
    },
    trackTitle: {
      type: String,
      default: "Coaching & Batch Cap Reality Check"
    },
    status: {
      type: String,
      enum: ["Pending_Payment", "Confirmed", "Completed", "Cancelled"],
      default: "Pending_Payment"
    },
    feeAmount: {
      type: Number,
      default: 11 // ₹11 Commitment Token Fee
    },
    paymentStatus: {
      type: String,
      enum: ["PENDING", "PAID", "FAILED", "REFUNDED"],
      default: "PENDING"
    },
    razorpayOrderId: {
      type: String
    },
    razorpayPaymentId: {
      type: String
    },
    razorpaySignature: {
      type: String
    },
    paidAt: {
      type: Date
    },
    meetingLink: {
      type: String,
      default: "https://meet.google.com/fs-academic-advisory"
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Counselling", counsellingSchema);
