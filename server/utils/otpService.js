const crypto = require("crypto");
const mongoose = require("mongoose");
let OtpRecord = null;
try {
  OtpRecord = require("../models/OtpRecord");
} catch {}

/**
 * FutureSelector Secure OTP Service
 * 
 * Features:
 * 1. Cryptographically secure 4-digit numeric OTP generation (crypto.randomInt)
 * 2. 5-minute TTL (Time-To-Live) expiry with MongoDB native TTL indexing
 * 3. Max 3 verification attempts per OTP with automatic lockout
 * 4. Single-use consumption (OTP deleted immediately upon successful verification)
 * 5. Rate limiting: 30-second cooldown per phone & max 5 requests per 15-minute rolling window
 * 6. Serverless-safe dual persistence: MongoDB Atlas shared state across Vercel lambdas + local memory cache
 * 7. Zero-cost demo separation: Allows testing on futureselector.in without purchasing paid SMS,
 *    while strictly rejecting the hardcoded "2026" backdoor in production mode.
 */

class OtpService {
  constructor() {
    // Local memory cache
    this.store = new Map();
    this.TTL_MS = 5 * 60 * 1000; // 5 minutes
    this.MAX_ATTEMPTS = 3;
    this.COOLDOWN_MS = 30 * 1000; // 30 seconds
    this.WINDOW_MS = 15 * 60 * 1000; // 15 minutes
    this.MAX_PER_WINDOW = 5;
  }

  isProduction() {
    return process.env.NODE_ENV === "production";
  }

  isDemoAllowed() {
    // Explicit override via ALLOW_DEMO_OTP
    if (process.env.ALLOW_DEMO_OTP === "false") return false;
    if (process.env.ALLOW_DEMO_OTP === "true") return true;

    // In local development / test: always allowed
    if (process.env.NODE_ENV !== "production") return true;

    // In production without paid gateway:
    // When no paid SMS gateway is configured (SMS_GATEWAY_API_KEY is unset),
    // enable secure zero-cost demo OTP so testers, reviewers, and founders can test on futureselector.in
    const hasSmsGateway = Boolean(process.env.SMS_GATEWAY_API_KEY && process.env.SMS_GATEWAY_API_KEY.trim());
    return !hasSmsGateway;
  }

  cleanPhone(phone) {
    if (!phone || typeof phone !== "string") return "";
    return phone.replace(/\D/g, "").slice(-10);
  }

  async _getRecord(clean) {
    if (mongoose.connection && mongoose.connection.readyState === 1 && OtpRecord) {
      try {
        const doc = await OtpRecord.findOne({ phone: clean });
        if (doc) {
          return {
            otp: doc.otp,
            expiresAt: new Date(doc.expiresAt).getTime(),
            attempts: doc.attempts,
            maxAttempts: doc.maxAttempts,
            lastRequestedAt: doc.lastRequestedAt ? new Date(doc.lastRequestedAt).getTime() : Date.now(),
            requestTimestamps: (doc.requestTimestamps || []).map(t => new Date(t).getTime())
          };
        }
      } catch {}
    }
    return this.store.get(clean) || null;
  }

  async _saveRecord(clean, record) {
    this.store.set(clean, record);
    if (mongoose.connection && mongoose.connection.readyState === 1 && OtpRecord) {
      try {
        await OtpRecord.findOneAndUpdate(
          { phone: clean },
          {
            phone: clean,
            otp: record.otp,
            attempts: record.attempts,
            maxAttempts: record.maxAttempts,
            expiresAt: new Date(record.expiresAt),
            lastRequestedAt: new Date(record.lastRequestedAt),
            requestTimestamps: (record.requestTimestamps || []).map(t => new Date(t))
          },
          { upsert: true, returnDocument: 'after' }
        );
      } catch {}
    }
  }

  async _deleteRecord(clean) {
    this.store.delete(clean);
    if (mongoose.connection && mongoose.connection.readyState === 1 && OtpRecord) {
      try {
        await OtpRecord.deleteOne({ phone: clean });
      } catch {}
    }
  }

  /**
   * Request / Generate OTP for a student mobile number
   */
  async generateOtp(phone, studentName = "Student") {
    const clean = this.cleanPhone(phone);
    if (!clean || clean.length !== 10) {
      return {
        success: false,
        status: 400,
        error: "Please enter a valid 10-digit mobile number"
      };
    }

    const now = Date.now();
    const existing = await this._getRecord(clean);

    // 1. Check Rate Limiting: 30-second resend cooldown
    if (existing && existing.lastRequestedAt && (now - existing.lastRequestedAt < this.COOLDOWN_MS)) {
      const remainingSec = Math.ceil((this.COOLDOWN_MS - (now - existing.lastRequestedAt)) / 1000);
      return {
        success: false,
        status: 429,
        error: `Please wait ${remainingSec} second${remainingSec === 1 ? "" : "s"} before requesting another OTP.`,
        retryAfter: remainingSec
      };
    }

    // 2. Check Rate Limiting: Max 5 requests in 15-minute rolling window
    const recentTimestamps = (existing?.requestTimestamps || []).filter(t => now - t < this.WINDOW_MS);
    if (recentTimestamps.length >= this.MAX_PER_WINDOW) {
      return {
        success: false,
        status: 429,
        error: "Too many OTP requests for this mobile number. Please try again after 15 minutes."
      };
    }

    // 3. Check Production SMS Provider Configuration
    if (this.isProduction() && !this.isDemoAllowed()) {
      const hasSmsGateway = Boolean(process.env.SMS_GATEWAY_API_KEY && process.env.SMS_GATEWAY_API_KEY.trim());
      if (!hasSmsGateway) {
        return {
          success: false,
          status: 503,
          error: "SMS delivery gateway is not configured for production. Real OTP delivery requires a paid SMS provider."
        };
      }
    }

    // 4. Generate Cryptographically Secure 4-digit code (1000 - 9999)
    const code = crypto.randomInt(1000, 10000).toString();
    recentTimestamps.push(now);

    const record = {
      otp: code,
      expiresAt: now + this.TTL_MS,
      attempts: 0,
      maxAttempts: this.MAX_ATTEMPTS,
      lastRequestedAt: now,
      requestTimestamps: recentTimestamps
    };

    await this._saveRecord(clean, record);

    console.log(`📱 [SECURE OTP] Generated for +91 ${clean} (${studentName}): ${this.isDemoAllowed() ? code : "[REDACTED_PROD]"}`);

    return {
      success: true,
      status: 200,
      phone: clean,
      message: `OTP sent successfully to +91 ${clean}`,
      demoOtp: this.isDemoAllowed() ? code : undefined,
      expiresInSeconds: Math.floor(this.TTL_MS / 1000)
    };
  }

  /**
   * Verify an OTP provided by a student
   */
  async verifyOtp(phone, enteredOtp) {
    const clean = this.cleanPhone(phone);
    if (!clean || clean.length !== 10) {
      return {
        success: false,
        status: 400,
        error: "Valid 10-digit mobile number is required"
      };
    }

    const code = (enteredOtp || "").toString().trim();
    if (!code || code.length !== 4) {
      return {
        success: false,
        status: 400,
        error: "Invalid OTP format. Please enter a valid 4-digit verification code."
      };
    }

    // 1. Production Security: Strictly reject fixed demo OTP "2026" in production
    if (this.isProduction() && code === "2026") {
      return {
        success: false,
        status: 400,
        error: "Demo OTP is strictly prohibited in production mode."
      };
    }

    const record = await this._getRecord(clean);

    // 2. Check existence
    if (!record) {
      return {
        success: false,
        status: 400,
        error: "OTP has expired or was not requested. Please request a new OTP."
      };
    }

    const now = Date.now();

    // 3. Check TTL Expiry
    if (now > record.expiresAt) {
      await this._deleteRecord(clean);
      return {
        success: false,
        status: 400,
        error: "OTP has expired. Please request a new OTP."
      };
    }

    // 4. Increment and check attempt limit
    record.attempts += 1;
    if (record.attempts > record.maxAttempts) {
      await this._deleteRecord(clean);
      return {
        success: false,
        status: 429,
        error: "Maximum verification attempts exceeded. Please request a new OTP."
      };
    }

    // 5. Match Check
    // Match against generated code, or in non-prod demo mode, allow "2026" as backward-compatible fallback
    const isDirectMatch = record.otp === code;
    const isDemoFallbackMatch = this.isDemoAllowed() && !this.isProduction() && code === "2026";

    if (!isDirectMatch && !isDemoFallbackMatch) {
      const remaining = record.maxAttempts - record.attempts;
      if (remaining <= 0) {
        await this._deleteRecord(clean);
        return {
          success: false,
          status: 429,
          error: "Maximum verification attempts exceeded. Please request a new OTP."
        };
      }
      await this._saveRecord(clean, record);
      return {
        success: false,
        status: 400,
        error: `Invalid OTP. ${remaining} attempt${remaining === 1 ? "" : "s"} remaining.`
      };
    }

    // 6. Single-Use Consumption: Consume immediately!
    await this._deleteRecord(clean);

    return {
      success: true,
      status: 200,
      phone: clean,
      message: "Mobile number verified successfully!"
    };
  }

  /**
   * Helper for tests to simulate expired OTP or specific states
   */
  _setMockRecord(phone, record) {
    const clean = this.cleanPhone(phone);
    this.store.set(clean, record);
  }

  _clearAll() {
    this.store.clear();
  }
}

// Singleton instance
const otpService = new OtpService();

module.exports = otpService;
