const mongoose = require("mongoose");

const partnerApplicationSchema = new mongoose.Schema(
  {
    applicationId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true
    },
    instituteName: {
      type: String,
      required: true,
      trim: true
    },
    contactPerson: {
      name: { type: String, required: true, trim: true },
      designation: { type: String, trim: true },
      email: { type: String, required: true, lowercase: true, trim: true },
      phone: { type: String, required: true, trim: true }
    },
    city: {
      type: String,
      required: true
    },
    state: {
      type: String,
      default: "India"
    },
    targetExams: [String],
    currentEnrollment: String,
    branchesCount: {
      type: Number,
      default: 1
    },
    websiteUrl: String,
    message: String,
    status: {
      type: String,
      enum: ["PENDING_REVIEW", "APPROVED_ONBOARDING_INITIATED", "REJECTED"],
      default: "PENDING_REVIEW",
      index: true
    },
    adminNotes: String,
    reviewedBy: String,
    reviewedAt: Date
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("PartnerApplication", partnerApplicationSchema);
