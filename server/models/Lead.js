const mongoose = require("mongoose");

const leadSchema = new mongoose.Schema(
  {
    leadId: {
      type: String,
      required: true,
      unique: true,
      index: true // e.g. "LEAD-101"
    },
    studentName: {
      type: String,
      required: true,
      trim: true
    },
    phone: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    email: {
      type: String,
      trim: true
    },
    instituteId: {
      type: String,
      default: "general",
      index: true
    },
    instituteNumericId: {
      type: Number,
      index: true
    },
    instituteName: {
      type: String,
      default: "General Consultation"
    },
    exam: {
      type: String,
      default: "JEE Advanced 2026"
    },
    targetYear: {
      type: String,
      default: "2026"
    },
    // Strict lifecycle: Enquiry submitted -> Pending Student Confirmation -> Confirmed -> Released to Partner
    status: {
      type: String,
      enum: [
        "NEW",
        "PENDING_CONFIRMATION",
        "CONFIRMED",
        "RELEASED",
        "CONTACTED",
        "COUNSELING_SCHEDULED",
        "ADMISSION_CONFIRMED",
        "LOST"
      ],
      default: "NEW",
      index: true
    },
    // Explicit Student Consent & Data-Sharing Verification
    isConfirmedByStudent: {
      type: Boolean,
      default: false,
      index: true
    },
    consentTimestamp: {
      type: Date
    },
    consentIp: {
      type: String
    },
    consentTextVersion: {
      type: String,
      default: "v1.0-SeatLock-DataSharingConsent"
    },
    // Release Status to Partner
    releasedToInstitute: {
      type: Boolean,
      default: false,
      index: true
    },
    releasedAt: {
      type: Date
    },
    releaseEligibilityChecked: {
      type: Boolean,
      default: false
    },
    voucherCode: {
      type: String,
      trim: true
    },
    commission: {
      type: String,
      default: "₹7,500"
    },
    commissionNumeric: {
      type: Number,
      default: 7500
    },
    assignedCounselor: {
      type: String,
      default: "Senior Academic Desk"
    },
    notes: [
      {
        text: String,
        author: {
          type: String,
          default: "System"
        },
        createdAt: {
          type: Date,
          default: Date.now
        }
      }
    ]
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Lead", leadSchema);
