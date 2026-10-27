const crypto = require("crypto");

/**
 * FutureSelector Secure OTP Service
 * 
 * Features:
 * 1. Cryptographically secure 4-digit OTP generation (crypto.randomInt)
 * 2. In-memory store with 5-minute TTL (Time-To-Live) expiry
 * 3. Max 3 verification attempts per OTP with automatic lockout
 * 4. Single-use consumption (OTP deleted immediately upon successful verification)
 * 5. Rate limiting: 30-second cooldown per phone & max 5 requests per 15-minute rolling window
 * 6. Production separation: Rejects fixed demo OTP ("2026") in production; refuses OTP generation
 *    without real SMS gateway in production (zero-cost safe mode).
 */

class OtpService {
  constructor() {
    // Map: phone (10-digit) -> { otp, expiresAt, attempts, maxAttempts, lastRequestedAt, requestTimestamps }
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
    // Explicit override via ALLOW_DEMO_OTP, else permitted only in non-production
    if (process.env.ALLOW_DEMO_OTP === "false") return false;
    if (process.env.ALLOW_DEMO_OTP === "true") return true;
    return process.env.NODE_ENV !== "production";
  }

  cleanPhone(phone) {
    if (!phone || typeof phone !== "string") return "";
    return phone.replace(/\D/g, "").slice(-10);
  }

  /**
   * Request / Generate OTP for a student mobile number
   */
  generateOtp(phone, studentName = "Student") {
    const clean = this.cleanPhone(phone);
    if (!clean || clean.length !== 10) {
      return {
        success: false,
        status: 400,
        error: "Please enter a valid 10-digit mobile number"
      };
    }

    const now = Date.now();
    const existing = this.store.get(clean);

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

    this.store.set(clean, {
      otp: code,
      expiresAt: now + this.TTL_MS,
      attempts: 0,
      maxAttempts: this.MAX_ATTEMPTS,
      lastRequestedAt: now,
      requestTimestamps: recentTimestamps
    });

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
  verifyOtp(phone, enteredOtp) {
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

    const record = this.store.get(clean);

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
      this.store.delete(clean);
      return {
        success: false,
        status: 400,
        error: "OTP has expired. Please request a new OTP."
      };
    }

    // 4. Increment and check attempt limit
    record.attempts += 1;
    if (record.attempts > record.maxAttempts) {
      this.store.delete(clean); // Invalidate immediately to prevent brute-force
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
        this.store.delete(clean);
        return {
          success: false,
          status: 429,
          error: "Maximum verification attempts exceeded. Please request a new OTP."
        };
      }
      return {
        success: false,
        status: 400,
        error: `Invalid OTP. ${remaining} attempt${remaining === 1 ? "" : "s"} remaining.`
      };
    }

    // 6. Single-Use Consumption: Consume immediately!
    this.store.delete(clean);

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
