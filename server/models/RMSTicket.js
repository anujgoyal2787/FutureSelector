const mongoose = require("mongoose");

const rmsTicketSchema = new mongoose.Schema(
  {
    ticketId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true // e.g. "RMS-2026-0104"
    },
    studentName: {
      type: String,
      required: true,
      trim: true
    },
    studentPhone: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    studentEmail: {
      type: String,
      trim: true
    },
    instituteName: {
      type: String,
      required: true,
      trim: true
    },
    instituteId: {
      type: String,
      index: true
    },
    instituteNumericId: {
      type: Number,
      index: true
    },
    category: {
      type: String,
      required: true,
      enum: [
        "PASS_DISCOUNT_DISPUTE",
        "BATCH_ALLOTMENT",
        "HOSTEL_COMPLAINT",
        "FACULTY_FEEDBACK",
        "REFUND_REQUEST",
        "OTHER"
      ]
    },
    subject: {
      type: String,
      required: true
    },
    description: {
      type: String
    },
    priority: {
      type: String,
      enum: ["CRITICAL", "MEDIUM", "LOW"],
      default: "MEDIUM",
      index: true
    },
    status: {
      type: String,
      enum: ["OPEN", "ASSIGNED_TO_INSTITUTE", "INSTITUTE_RESPONDED", "IN_PROGRESS", "RESOLVED", "CLOSED", "REOPENED"],
      default: "OPEN",
      index: true
    },
    slaHoursLeft: {
      type: Number,
      default: 24
    },
    // FutureSelector Operations Assignment
    assignedTo: {
      type: String,
      default: "Kunal Verma (Support Lead)"
    },
    assignedOfficerEmail: {
      type: String,
      default: "kunal.ops@futureselector.com"
    },
    assignedAt: Date,
    // Institute Partner Response
    assignedToInstitute: {
      type: Boolean,
      default: false
    },
    instituteResponse: {
      type: String
    },
    instituteRespondedAt: {
      type: Date
    },
    instituteRespondedBy: {
      type: String
    },
    // Student Confirmation & Reopen Loop
    studentConfirmedResolution: {
      type: Boolean,
      default: false
    },
    studentConfirmedAt: {
      type: Date
    },
    studentFeedback: {
      type: String
    },
    reopenHistory: [
      {
        reopenedAt: {
          type: Date,
          default: Date.now
        },
        reason: String,
        reopenedBy: String
      }
    ],
    // Audit timeline and resolution notes
    resolutionNotes: {
      type: String
    },
    resolvedAt: {
      type: Date
    },
    resolvedBy: {
      type: String
    },
    messages: [
      {
        sender: String,
        senderRole: {
          type: String,
          enum: ["STUDENT", "ADMIN", "INSTITUTE_PARTNER"]
        },
        message: String,
        timestamp: {
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

module.exports = mongoose.model("RMSTicket", rmsTicketSchema);
