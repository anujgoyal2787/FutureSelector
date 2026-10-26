const mongoose = require("mongoose");

const approvalRequestSchema = new mongoose.Schema(
  {
    requestId: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    changeType: {
      type: String,
      required: true,
      enum: [
        "FEE_STRUCTURE_UPDATE",
        "COMMISSION_RATE_OVERRIDE",
        "INSTITUTE_STATUS_CHANGE",
        "FACULTY_ROSTER_UPDATE",
        "BATCH_ADDITION",
        "OTHER"
      ]
    },
    entityType: {
      type: String,
      required: true,
      default: "Institute"
    },
    entityId: {
      type: String,
      trim: true
    },
    targetTitle: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: true
    },
    diff: {
      field: { type: String, required: true },
      oldValue: { type: String, required: true },
      newValue: { type: String, required: true }
    },
    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED"],
      default: "PENDING",
      index: true
    },
    requestedBy: {
      type: String,
      required: true
    },
    requestedByRole: {
      type: String,
      default: "OPERATIONS_MANAGER"
    },
    requestedAt: {
      type: Date,
      default: Date.now
    },
    reviewedBy: {
      type: String
    },
    reviewedByRole: {
      type: String
    },
    reviewedAt: {
      type: Date
    },
    reviewNote: {
      type: String
    },
    rejectionReason: {
      type: String
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("ApprovalRequest", approvalRequestSchema);
