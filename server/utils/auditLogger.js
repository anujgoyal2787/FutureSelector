const AuditLog = require("../models/AuditLog");

/**
 * Standardized Audit Logging Service
 */
const logAuditEvent = async ({
  req,
  actor,
  action,
  entityType,
  entityId,
  previousValue = null,
  newValue = null,
  reason = null,
  status = "SUCCESS"
}) => {
  try {
    const ipAddress = req?.headers["x-forwarded-for"] || req?.socket?.remoteAddress || "127.0.0.1";
    const userAgent = req?.headers["user-agent"] || "unknown";

    const logEntry = {
      actorId: actor?.id || actor?._id || "system",
      actorName: actor?.name || "System Administrator",
      actorEmail: actor?.email || "admin@futureselector.com",
      actorRole: actor?.role || "SUPER_ADMIN",
      ipAddress: String(ipAddress),
      userAgent: String(userAgent),
      action,
      entityType,
      entityId: entityId ? String(entityId) : null,
      previousValue,
      newValue,
      reason,
      status
    };

    await AuditLog.create(logEntry);
  } catch (error) {
    console.error("🔴 [AUDIT LOGGING FAILED]:", error.message);
  }
};

module.exports = { logAuditEvent };
