const mongoose = require("mongoose");

/**
 * OtpRecord Schema for Serverless-Safe OTP Storage
 * Uses MongoDB native TTL index for automatic expiration.
 */
const otpRecordSchema = new mongoose.Schema(
  {
    phone: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true
    },
    otp: {
      type: String,
      required: true
    },
    attempts: {
      type: Number,
      default: 0
    },
    maxAttempts: {
      type: Number,
      default: 3
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 } // MongoDB TTL: document automatically deleted when expiresAt is reached
    },
    lastRequestedAt: {
      type: Date,
      default: Date.now
    },
    requestTimestamps: {
      type: [Date],
      default: []
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.models.OtpRecord || mongoose.model("OtpRecord", otpRecordSchema);
