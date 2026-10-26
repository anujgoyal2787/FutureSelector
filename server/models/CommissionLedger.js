const mongoose = require("mongoose");

const commissionLedgerSchema = new mongoose.Schema(
  {
    transactionId: {
      type: String,
      required: true,
      unique: true,
      trim: true // e.g. "TXN-2026-8812"
    },
    instituteName: {
      type: String,
      required: true,
      trim: true
    },
    instituteId: {
      type: String
    },
    studentName: {
      type: String,
      required: true,
      trim: true
    },
    studentPhone: {
      type: String
    },
    voucherId: {
      type: String
    },
    courseName: {
      type: String,
      default: "JEE / NEET Classroom Batch"
    },
    admissionFee: {
      type: Number,
      required: true,
      default: 140000
    },
    grantDiscount: {
      type: Number,
      default: 15000
    },
    netFeePaid: {
      type: Number,
      default: 125000
    },
    commissionRate: {
      type: String,
      default: "12%"
    },
    commissionNumericRate: {
      type: Number,
      default: 0.12
    },
    commissionAmount: {
      type: Number,
      required: true,
      default: 16800
    },
    payoutStatus: {
      type: String,
      enum: ["ESCROW_LOCKED", "ELIGIBLE_FOR_PAYOUT", "PAID"],
      default: "ESCROW_LOCKED",
      index: true
    },
    dueDate: {
      type: Date
    },
    invoiceId: {
      type: String,
      trim: true
    },
    authorizedBy: {
      type: String
    },
    authorizedAt: {
      type: Date
    },
    payoutNotes: {
      type: String
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("CommissionLedger", commissionLedgerSchema);
