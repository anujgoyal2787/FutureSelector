const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    recipientType: {
      type: String,
      enum: ["STUDENT", "INSTITUTE_PARTNER", "ADMIN"],
      required: true,
      index: true
    },
    recipientId: {
      type: String, // student phone, partner user id / institute id, or admin email
      required: true,
      index: true
    },
    title: {
      type: String,
      required: true
    },
    message: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: [
        "ENQUIRY_CONFIRMED",
        "LEAD_RELEASED",
        "RMS_UPDATE",
        "ADMISSION_VERIFIED",
        "COMMISSION_PAID",
        "PROFILE_APPROVED",
        "CHANGES_REQUESTED",
        "GENERAL"
      ],
      default: "GENERAL"
    },
    read: {
      type: Boolean,
      default: false
    },
    meta: {
      type: mongoose.Schema.Types.Mixed
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Notification", notificationSchema);
