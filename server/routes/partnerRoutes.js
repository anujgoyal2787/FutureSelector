const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const jwt = require("jsonwebtoken");
const PartnerUser = require("../models/PartnerUser");
const Institute = require("../models/Institute");
const Voucher = require("../models/Voucher");
const Lead = require("../models/Lead");
const RMSTicket = require("../models/RMSTicket");
const ApprovalRequest = require("../models/ApprovalRequest");
const { protectPartner, requirePartnerPermission } = require("../middleware/partnerAuth");
const { logAuditEvent } = require("../utils/auditLogger");

const JWT_SECRET = process.env.JWT_SECRET || "fs_jwt_secret_2026";

// ==========================================
// 1. PARTNER AUTHENTICATION & SESSION
// ==========================================

/**
 * Partner Login (Email + Password)
 */
router.post("/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const partner = await PartnerUser.findOne({ email: email.toLowerCase().trim() });
    if (!partner || !(await partner.matchPassword(password))) {
      await logAuditEvent({
        req,
        actor: { id: "unknown", email, role: "PARTNER_GUEST" },
        action: "PARTNER_LOGIN_FAILED",
        entityType: "AUTH",
        status: "DENIED",
        reason: "Invalid email or password"
      });
      return res.status(401).json({ error: "Invalid partner credentials" });
    }

    if (partner.status !== "ACTIVE") {
      return res.status(403).json({
        error: "Account Suspended",
        message: `Your account is ${partner.status}. Contact FutureSelector Admin Desk.`
      });
    }

    const institute = await Institute.findById(partner.instituteId);
    if (!institute) {
      return res.status(404).json({ error: "Associated institute not found." });
    }

    // Update login timestamp & IP
    partner.lastLoginAt = new Date();
    partner.lastLoginIp = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "127.0.0.1";
    await partner.save();

    const token = jwt.sign(
      {
        id: partner._id,
        name: partner.name,
        email: partner.email,
        role: "INSTITUTE_PARTNER",
        instituteId: institute._id,
        instituteNumericId: institute.numericId,
        instituteName: institute.name
      },
      JWT_SECRET,
      { expiresIn: "48h" }
    );

    await logAuditEvent({
      req,
      actor: { id: partner._id, name: partner.name, email: partner.email, role: "INSTITUTE_PARTNER" },
      action: "PARTNER_LOGIN_SUCCESS",
      entityType: "AUTH",
      entityId: String(institute.numericId),
      status: "SUCCESS"
    });

    res.json({
      success: true,
      token,
      partner: {
        id: partner._id,
        name: partner.name,
        email: partner.email,
        phone: partner.phone,
        designation: partner.designation,
        permissions: partner.permissions
      },
      institute: {
        _id: institute._id,
        numericId: institute.numericId,
        name: institute.name,
        slug: institute.slug,
        location: institute.location,
        publicationStatus: institute.publicationStatus,
        verificationStatus: institute.verificationStatus,
        onboardingStatus: institute.onboardingStatus,
        accountStatus: institute.accountStatus,
        verified: institute.verified
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Partner First-Time Password Setup from Admin Invitation
 */
router.post("/auth/setup-password", async (req, res) => {
  try {
    const { invitationToken, password, name, phone } = req.body;
    if (!invitationToken || !password) {
      return res.status(400).json({ error: "Invitation token and new password are required" });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: "Password must be at least 8 characters long" });
    }

    const partner = await PartnerUser.findOne({ invitationToken });
    if (!partner) {
      return res.status(400).json({ error: "Invalid or expired invitation token." });
    }

    if (partner.invitationExpiresAt && partner.invitationExpiresAt < new Date()) {
      return res.status(400).json({ error: "This invitation link has expired. Request a new invite from Super Admin." });
    }

    partner.password = password;
    partner.status = "ACTIVE";
    partner.invitationToken = undefined;
    partner.invitationExpiresAt = undefined;
    if (name) partner.name = name.trim();
    if (phone) partner.phone = phone.trim();

    await partner.save();

    const institute = await Institute.findById(partner.instituteId);
    if (institute && institute.accountStatus === "INVITED") {
      institute.accountStatus = "ACTIVE";
      if (institute.onboardingStatus === "INVITATION_SENT") {
        institute.onboardingStatus = "WIZARD_IN_PROGRESS";
      }
      await institute.save();
    }

    await logAuditEvent({
      req,
      actor: { id: partner._id, name: partner.name, email: partner.email, role: "INSTITUTE_PARTNER" },
      action: "PARTNER_INVITATION_COMPLETED",
      entityType: "AUTH",
      status: "SUCCESS",
      reason: "Partner set initial password and activated portal access"
    });

    res.json({
      success: true,
      message: "Password set successfully! You may now sign in to your Partner Portal."
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Authenticated Partner Profile (Me)
 */
router.get("/auth/me", protectPartner, async (req, res) => {
  res.json({
    partner: req.partner,
    institute: {
      _id: req.institute._id,
      numericId: req.institute.numericId,
      name: req.institute.name,
      slug: req.institute.slug,
      location: req.institute.location,
      publicationStatus: req.institute.publicationStatus,
      verificationStatus: req.institute.verificationStatus,
      onboardingStatus: req.institute.onboardingStatus,
      accountStatus: req.institute.accountStatus,
      verified: req.institute.verified,
      fees: req.institute.fees,
      numericFee: req.institute.numericFee
    }
  });
});

// ==========================================
// 2. PROFILE STUDIO & ONBOARDING WIZARD
// ==========================================

/**
 * Get Full Profile Studio & Institute Data (Server-Verified Identity)
 */
router.get("/profile", protectPartner, async (req, res) => {
  try {
    const inst = await Institute.findById(req.partner.instituteId);
    if (!inst) {
      return res.status(404).json({ error: "Institute not found" });
    }
    res.json(inst);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Direct Update of Permitted Profile Studio Elements (Gallery, Announcements, Socials, Faculty)
 * Sensitive core fields (Tuition Fee, Name, Legal Entities) are protected.
 */
router.put(
  "/profile-studio",
  protectPartner,
  requirePartnerPermission("canEditProfile"),
  async (req, res) => {
    try {
      const { gallery, announcements, facultyRoster, hallOfFame, socialLinks, tagline, facilities } = req.body;
      const inst = req.institute;

      if (!inst.profileStudio) {
        inst.profileStudio = {};
      }

      if (gallery) inst.profileStudio.gallery = gallery;
      if (announcements) inst.profileStudio.announcements = announcements;
      if (facultyRoster) inst.profileStudio.facultyRoster = facultyRoster;
      if (hallOfFame) inst.profileStudio.hallOfFame = hallOfFame;
      if (socialLinks) inst.profileStudio.socialLinks = socialLinks;
      if (tagline) inst.profileStudio.tagline = tagline;
      if (facilities) inst.facilities = facilities;

      await inst.save();

      await logAuditEvent({
        req,
        actor: req.partner,
        action: "PARTNER_PROFILE_STUDIO_UPDATED",
        entityType: "INSTITUTE",
        entityId: String(inst.numericId),
        status: "SUCCESS"
      });

      res.json({
        success: true,
        message: "Profile Studio updated successfully!",
        profileStudio: inst.profileStudio,
        facilities: inst.facilities
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

/**
 * Partner Submits Sensitive Proposed Changes (Fees, New Courses, or Full Onboarding Profile)
 * Routed directly to Super Admin Approval Desk
 */
router.post(
  "/submit-for-approval",
  protectPartner,
  requirePartnerPermission("canSubmitForApproval"),
  async (req, res) => {
    try {
      const { changeType, description, diff, onboardingProfile } = req.body;
      const inst = req.institute;

      const count = await ApprovalRequest.countDocuments();
      const requestId = `REQ-2026-${String(count + 1).padStart(4, "0")}`;

      const newApproval = await ApprovalRequest.create({
        requestId,
        changeType: changeType || "FEE_STRUCTURE_UPDATE",
        entityType: "Institute",
        entityId: String(inst.numericId),
        targetTitle: inst.name,
        description: description || "Proposed institutional modifications submitted by Center Director",
        diff: {
          field: diff?.field || "Institutional Profile",
          oldValue: diff?.oldValue || JSON.stringify({ fees: inst.fees }),
          newValue: diff?.newValue || JSON.stringify(onboardingProfile || {})
        },
        status: "PENDING",
        requestedBy: req.partner.email,
        requestedByRole: "INSTITUTE_PARTNER"
      });

      // Update institute state to indicate pending changes
      inst.pendingChanges = onboardingProfile || diff;
      inst.pendingChangesAt = new Date();
      inst.pendingChangesBy = req.partner.email;
      if (inst.onboardingStatus === "WIZARD_IN_PROGRESS") {
        inst.onboardingStatus = "PROFILE_SUBMITTED";
        inst.publicationStatus = "SUBMITTED";
      }
      await inst.save();

      await logAuditEvent({
        req,
        actor: req.partner,
        action: "CHANGE_REQUEST_SUBMITTED",
        entityType: "APPROVAL_REQUEST",
        entityId: requestId,
        status: "SUCCESS"
      });

      res.status(201).json({
        success: true,
        message: `Change request ${requestId} submitted to FutureSelector Two-Person Governance for audit.`,
        request: newApproval
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// ==========================================
// 3. RELEASED LEADS (STRICT ISOLATION & STUDENT CONSENT)
// ==========================================

/**
 * Fetch Released Leads for THIS Institute
 * CRITICAL RULE: Server ignores any client-supplied institute ID and strictly uses req.partner.
 * Only leads where releasedToInstitute === true AND isConfirmedByStudent === true are exposed.
 */
router.get(
  "/leads",
  protectPartner,
  requirePartnerPermission("canAccessLeads"),
  async (req, res) => {
    try {
      const instNumericId = req.partner.instituteNumericId;
      const instSlug = req.partner.instituteSlug;

      // Strict query: ONLY released and confirmed leads for this partner
      const leads = await Lead.find({
        $and: [
          {
            $or: [
              { instituteNumericId: instNumericId },
              { instituteId: { $regex: new RegExp(`^${instSlug}$`, "i") } },
              { instituteId: { $regex: new RegExp(req.partner.instituteName.split(" ")[0], "i") } }
            ]
          },
          { releasedToInstitute: true },
          { isConfirmedByStudent: true }
        ]
      }).sort({ releasedAt: -1, createdAt: -1 });

      res.json({
        success: true,
        count: leads.length,
        leads
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// ==========================================
// 4. OFFLINE ADMISSION REPORTING & VERIFICATION
// ==========================================

/**
 * Partner Counter Desk - Instant Pass / Voucher Verification
 */
router.post("/verify-counter", async (req, res) => {
  try {
    const { voucherCode } = req.body;
    if (!voucherCode) {
      return res.status(400).json({ error: "Pass or Voucher Code is required" });
    }

    const cleanCode = voucherCode.trim().toUpperCase();
    const voucher = await Voucher.findOne({
      $or: [{ voucherId: cleanCode }, { code: cleanCode }]
    });

    if (!voucher) {
      return res.status(404).json({
        valid: false,
        error: "Invalid Voucher ID. No matching pass registered in FutureSelector system."
      });
    }

    res.json({
      valid: voucher.status === "ACTIVE",
      status: voucher.status,
      voucher: {
        voucherId: voucher.voucherId,
        code: voucher.code,
        studentName: voucher.studentName,
        studentPhone: voucher.studentPhone,
        instituteId: voucher.instituteId,
        instituteName: voucher.instituteName,
        batch: voucher.batch,
        discountAmount: voucher.discountAmount,
        discountValue: voucher.discountValue || 15000,
        escrowProtection: voucher.escrowDays,
        validTill: voucher.validTill,
        verificationStatus: voucher.verificationStatus
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Partner Reports Student Offline Admission (Includes Receipt & Evidence for Super Admin Audit)
 */
router.post(
  "/admissions/report",
  protectPartner,
  requirePartnerPermission("canReportAdmissions"),
  async (req, res) => {
    try {
      const {
        voucherCode,
        studentName,
        studentPhone,
        receiptNumber,
        receiptAmount,
        receiptDate,
        receiptFileUrl,
        batchName,
        counterNotes
      } = req.body;

      if (!voucherCode || !receiptNumber || !receiptAmount) {
        return res.status(400).json({
          error: "Voucher code, receipt number, and tuition fee paid amount are required."
        });
      }

      const cleanCode = voucherCode.trim().toUpperCase();
      let voucher = await Voucher.findOne({
        $or: [{ voucherId: cleanCode }, { code: cleanCode }]
      });

      if (!voucher) {
        // Create new voucher admission record if student walked in directly with booking
        voucher = new Voucher({
          voucherId: `FS-PASS-${Date.now().toString().slice(-4)}`,
          code: cleanCode,
          studentName: studentName || "Walk-In Candidate",
          studentPhone: studentPhone || "+91 99999 00000",
          instituteId: req.partner.instituteNumericId || 1,
          instituteName: req.partner.instituteName
        });
      }

      // Ensure institute matches authenticated partner
      if (voucher.instituteId && voucher.instituteId !== req.partner.instituteNumericId) {
        return res.status(403).json({
          error: "Cross-Institute Direct Access Prohibited",
          message: "This admission voucher belongs to another coaching institute."
        });
      }

      voucher.status = "REDEEMED";
      voucher.redeemedAt = new Date();
      voucher.redeemedByStaff = `${req.partner.name} (${req.partner.designation || 'Staff'})`;
      voucher.batch = batchName || voucher.batch;
      voucher.receiptNumber = receiptNumber.trim();
      voucher.receiptAmount = Number(receiptAmount);
      voucher.receiptDate = receiptDate ? new Date(receiptDate) : new Date();
      voucher.receiptFileUrl = receiptFileUrl || "";
      voucher.counterNotes = counterNotes || "Counter payment verified and stamped.";
      voucher.verificationStatus = "PENDING_AUDIT"; // Requires Super Admin 4-Point Audit

      await voucher.save();

      // Update Lead status if exists
      if (voucher.studentPhone) {
        await Lead.findOneAndUpdate(
          { phone: voucher.studentPhone },
          { status: "ADMISSION_CONFIRMED" }
        );
      }

      await logAuditEvent({
        req,
        actor: req.partner,
        action: "ADMISSION_REPORTED",
        entityType: "ADMISSION",
        entityId: voucher.voucherId,
        newValue: {
          receiptNumber,
          receiptAmount,
          instituteName: req.partner.instituteName
        },
        status: "SUCCESS"
      });

      res.json({
        success: true,
        message: `Admission reported successfully for ${voucher.studentName}! Sent to FutureSelector Super Admin Audit for verification.`,
        voucher
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

/**
 * Fetch Reported Admissions for THIS Institute
 */
router.get("/admissions", protectPartner, async (req, res) => {
  try {
    const admissions = await Voucher.find({
      instituteId: req.partner.instituteNumericId
    }).sort({ updatedAt: -1 });

    res.json(admissions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// 5. ASSIGNED RMS GRIEVANCES & RESOLUTIONS
// ==========================================

/**
 * Fetch RMS Tickets Assigned to THIS Institute
 */
router.get(
  "/rms",
  protectPartner,
  requirePartnerPermission("canRespondRMS"),
  async (req, res) => {
    try {
      const tickets = await RMSTicket.find({
        $or: [
          { instituteNumericId: req.partner.instituteNumericId },
          { instituteName: { $regex: new RegExp(req.partner.instituteName.split(" ")[0], "i") } }
        ]
      }).sort({ createdAt: -1 });

      res.json({
        success: true,
        count: tickets.length,
        tickets
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

/**
 * Institute Partner Responds to Assigned RMS Ticket
 */
router.post(
  "/rms/:ticketId/respond",
  protectPartner,
  requirePartnerPermission("canRespondRMS"),
  async (req, res) => {
    try {
      const { ticketId } = req.params;
      const { responseText } = req.body;

      if (!responseText) {
        return res.status(400).json({ error: "Official response message is required." });
      }

      const query = mongoose.Types.ObjectId.isValid(ticketId)
        ? { $or: [{ _id: ticketId }, { ticketId }] }
        : { ticketId };

      const ticket = await RMSTicket.findOne(query);

      if (!ticket) {
        return res.status(404).json({ error: "Ticket not found." });
      }

      ticket.instituteResponse = responseText.trim();
      ticket.instituteRespondedAt = new Date();
      ticket.instituteRespondedBy = `${req.partner.name} (${req.partner.designation || 'Center Desk'})`;
      ticket.status = "INSTITUTE_RESPONDED";

      ticket.messages.push({
        sender: `${req.partner.name} (${req.partner.instituteName})`,
        senderRole: "INSTITUTE_PARTNER",
        message: responseText.trim(),
        timestamp: new Date()
      });

      await ticket.save();

      await logAuditEvent({
        req,
        actor: req.partner,
        action: "RMS_INSTITUTE_RESPONDED",
        entityType: "RMS",
        entityId: ticket.ticketId,
        newValue: { response: responseText },
        status: "SUCCESS"
      });

      res.json({
        success: true,
        message: "Your official institute response has been dispatched to the student and central desk.",
        ticket
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

module.exports = router;
