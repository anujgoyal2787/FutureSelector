const jwt = require("jsonwebtoken");
const PartnerUser = require("../models/PartnerUser");
const Institute = require("../models/Institute");
const { logAuditEvent } = require("../utils/auditLogger");

const JWT_SECRET = process.env.JWT_SECRET || "fs_jwt_secret_2026";

/**
 * Protect Institute Partner Routes: Verifies Bearer JWT Token
 * Guarantees that req.partner and req.partner.instituteId are server-verified
 * from the database, preventing any IDOR or cross-tenant impersonation.
 */
const protectPartner = async (req, res, next) => {
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
      message: "Access denied. Valid Institute Partner Bearer token is missing."
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    if (!decoded.id || decoded.role !== "INSTITUTE_PARTNER") {
      return res.status(401).json({
        error: "Invalid Token",
        message: "Token signature does not belong to an authorized Institute Partner session."
      });
    }

    // Verify Partner User in Database
    const partner = await PartnerUser.findById(decoded.id).select("-password");

    if (!partner) {
      return res.status(401).json({
        error: "Account Not Found",
        message: "Partner account no longer exists in FutureSelector records."
      });
    }

    // Check account status
    if (partner.status !== "ACTIVE") {
      await logAuditEvent({
        req,
        actor: { id: partner._id, name: partner.name, role: partner.role },
        action: "SUSPENDED_PARTNER_ACCESS_ATTEMPT",
        entityType: "AUTH",
        status: "DENIED",
        reason: `Partner account status is ${partner.status}`
      });

      return res.status(403).json({
        error: "Account Suspended",
        message: `Your institute partner account is currently ${partner.status}. Contact FutureSelector Administration.`
      });
    }

    // Verify associated Institute exists and is active
    const institute = await Institute.findById(partner.instituteId);
    if (!institute) {
      return res.status(403).json({
        error: "Institute Inaccessible",
        message: "Associated coaching institute profile not found."
      });
    }

    if (institute.accountStatus === "SUSPENDED") {
      return res.status(403).json({
        error: "Institute Suspended",
        message: "The coaching institute's platform partnership has been suspended by Administration."
      });
    }

    // Attach verified server-side identity to request
    req.partner = {
      id: partner._id,
      name: partner.name,
      email: partner.email,
      role: partner.role,
      permissions: partner.permissions,
      instituteId: institute._id,
      instituteNumericId: institute.numericId,
      instituteSlug: institute.slug,
      instituteName: institute.name
    };

    req.institute = institute;

    next();
  } catch (err) {
    return res.status(401).json({
      error: "Token Expired or Invalid",
      message: "Your partner session has expired or is invalid. Please sign in again."
    });
  }
};

/**
 * Fine-Grained Permission Checker for Institute Partners
 * Example: requirePartnerPermission("canAccessLeads")
 */
const requirePartnerPermission = (permissionKey) => {
  return (req, res, next) => {
    if (!req.partner) {
      return res.status(401).json({ error: "Authentication required" });
    }

    if (!req.partner.permissions || !req.partner.permissions[permissionKey]) {
      return res.status(403).json({
        error: "Permission Denied",
        message: `Your partner account lacks the '${permissionKey}' privilege granted by Super Admin.`
      });
    }

    next();
  };
};

module.exports = { protectPartner, requirePartnerPermission };
