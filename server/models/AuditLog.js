const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema(
  {
    actorId: {
      type: String,
      required: true
    },
    actorName: {
      type: String,
      default: "System"
    },
    actorEmail: {
      type: String,
      default: "system@futureselector.com"
    },
    actorRole: {
      type: String,
      default: "SUPER_ADMIN"
    },
    ipAddress: {
      type: String,
      default: "127.0.0.1"
    },
    userAgent: {
      type: String
    },
    action: {
      type: String,
      required: true,
      index: true
    },
    entityType: {
      type: String,
      required: true,
      index: true // e.g. 'AUTH', 'LEAD', 'INSTITUTE', 'ADMISSION', 'COMMISSION', 'RMS'
    },
    entityId: {
      type: String
    },
    previousValue: {
      type: mongoose.Schema.Types.Mixed
    },
    newValue: {
      type: mongoose.Schema.Types.Mixed
    },
    reason: {
      type: String
    },
    status: {
      type: String,
      enum: ["SUCCESS", "FAILED", "DENIED"],
      default: "SUCCESS"
    }
  },
  {
    timestamps: true
  }
);

// Index for high performance chronologically filtered queries
auditLogSchema.index({ createdAt: -1 });

module.exports = mongoose.model("AuditLog", auditLogSchema);
