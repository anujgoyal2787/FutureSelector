const mongoose = require("mongoose");

const voucherSchema = new mongoose.Schema(
  {
    voucherId: {
      type: String,
      required: true,
      unique: true, // e.g., "FS-SEAT-7429"
      trim: true,
      index: true
    },
    code: {
      type: String, // e.g. "FS-AAKASH-15K"
      required: true,
      index: true
    },
    studentName: {
      type: String,
      required: true
    },
    studentPhone: {
      type: String,
      required: true,
      index: true
    },
    studentEmail: {
      type: String
    },
    instituteId: {
      type: Number,
      required: true,
      index: true
    },
    instituteName: {
      type: String,
      required: true
    },
    batch: {
      type: String,
      default: "2026 Regular Classroom Batch"
    },
    discountAmount: {
      type: String,
      default: "₹15,000 Flat Grant"
    },
    discountValue: {
      type: Number,
      default: 15000
    },
    status: {
      type: String,
      enum: ["ACTIVE", "REDEEMED", "EXPIRED", "CANCELLED"],
      default: "ACTIVE",
      index: true
    },
    validTill: {
      type: String,
      default: "Valid till 30 Nov 2026"
    },
    escrowDays: {
      type: String,
      default: "15-Day Escrow Protected"
    },
    redeemedAt: {
      type: Date
    },
    redeemedByStaff: {
      type: String
    },
    counterNotes: {
      type: String
    },
    // Offline Admission Evidence
    receiptNumber: {
      type: String,
      trim: true
    },
    receiptAmount: {
      type: Number,
      default: 0
    },
    receiptDate: {
      type: Date
    },
    receiptFileUrl: {
      type: String
    },
    grantApplied: {
      type: Number,
      default: 15000
    },
    // 4-Point Governance Verification by Super Admin
    verificationStatus: {
      type: String,
      enum: ["PENDING_AUDIT", "VERIFIED", "REJECTED", "FLAGGED"],
      default: "PENDING_AUDIT",
      index: true
    },
    verificationCriteria: {
      receiptMatchesPass: { type: Boolean, default: false },
      feeEligibilityMet: { type: Boolean, default: false },
      studentIdentityVerified: { type: Boolean, default: false },
      counterSignatureValid: { type: Boolean, default: false }
    },
    verifiedBy: {
      type: String
    },
    verifiedAt: {
      type: Date
    },
    verificationNotes: {
      type: String
    },
    rejectionReason: {
      type: String
    },
    // Connection to Commission Ledger
    commissionGenerated: {
      type: Boolean,
      default: false,
      index: true
    },
    commissionTxnId: {
      type: String,
      trim: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Voucher", voucherSchema);
