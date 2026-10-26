const jwt = require("jsonwebtoken");
const AdminUser = require("../models/AdminUser");
const { logAuditEvent } = require("../utils/auditLogger");

const JWT_SECRET = process.env.JWT_SECRET || "fs_jwt_secret_2026";

/**
 * Protect Admin Routes: Verifies Bearer JWT Token
 */
const protectAdmin = async (req, res, next) => {
  let token = null;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({
      error: "Authentication required",
      message: "Access denied. Valid Super Admin Bearer token is missing."
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    // Verify token payload structure
    if (!decoded.id || !decoded.role) {
      return res.status(401).json({
        error: "Invalid Token",
        message: "Token signature does not contain valid administrative claims."
      });
    }

    // Check database to ensure admin still exists and is ACTIVE
    let admin = null;
    try {
      admin = await AdminUser.findById(decoded.id).select("-password");
    } catch {}

    if (admin && admin.status !== "ACTIVE") {
      await logAuditEvent({
        req,
        actor: { id: decoded.id, name: decoded.name, role: decoded.role },
        action: "SUSPENDED_LOGIN_ATTEMPT",
        entityType: "AUTH",
        status: "DENIED",
        reason: `Account status is ${admin.status}`
      });
      return res.status(403).json({
        error: "Account Suspended",
        message: "Your administrative privileges have been suspended. Contact Super Admin."
      });
    }

    req.admin = admin || {
      id: decoded.id,
      name: decoded.name || "Super Administrator",
      email: decoded.email || "admin@futureselector.com",
      role: decoded.role || "SUPER_ADMIN",
      permissions: decoded.permissions || ["*"]
    };

    next();
  } catch (err) {
    return res.status(401).json({
      error: "Token Expired or Invalid",
      message: "Your administrative session has expired or is invalid. Please sign in again."
    });
  }
};

/**
 * Role-Based Access Control Middleware
 * Example: requireRole("SUPER_ADMIN", "OPERATIONS_MANAGER")
 */
const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.admin) {
      return res.status(401).json({ error: "Authentication required" });
    }

    // SUPER_ADMIN always has master bypass
    if (req.admin.role === "SUPER_ADMIN") {
      return next();
    }

    if (!allowedRoles.includes(req.admin.role)) {
      logAuditEvent({
        req,
        actor: req.admin,
        action: "UNAUTHORIZED_ROLE_ACCESS",
        entityType: "AUTH",
        status: "DENIED",
        reason: `Role '${req.admin.role}' tried to access role restricted route.`
      });

      return res.status(403).json({
        error: "Permission Denied",
        message: `This action requires one of the following roles: [${allowedRoles.join(", ")}]. Current role: '${req.admin.role}'`
      });
    }

    next();
  };
};

module.exports = { protectAdmin, requireRole };
