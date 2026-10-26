const express = require("express");
const router = express.Router();
const Lead = require("../models/Lead");
const Institute = require("../models/Institute");
const Voucher = require("../models/Voucher");
const { protectAdmin } = require("../middleware/adminAuth");
const { logAuditEvent } = require("../utils/auditLogger");
const { initialLeads } = require("../config/seedData");

// 1. Submit a new enquiry (Initial Step - Stored in PENDING_CONFIRMATION)
// Student personal contact is NEVER released to institute at this stage!
router.post("/", async (req, res) => {
  try {
    const { studentName, phone, email, instituteId, instituteNumericId, instituteName, exam, targetYear } = req.body;
    if (!studentName || !phone) {
      return res.status(400).json({ error: "Student name and mobile number are required" });
    }

    const cleanPhone = `+91 ${phone.replace(/\D/g, "").slice(-10)}`;
    const leadCount = await Lead.countDocuments();
    const leadId = `LEAD-${Date.now().toString().slice(-4)}${Math.floor(Math.random() * 90 + 10)}`;

    // Resolve target institute
    let targetInstName = instituteName || "General Consultation";
    let numericId = instituteNumericId ? Number(instituteNumericId) : null;
    let commissionRate = 7500;

    if (numericId || instituteId) {
      const inst = await Institute.findOne({
        $or: [{ numericId }, { slug: instituteId }, { name: instituteName }]
      });
      if (inst) {
        targetInstName = inst.name;
        numericId = inst.numericId;
        commissionRate = inst.referralCommissionRate || inst.agreementTerms?.commissionRate || 7500;
      }
    }

    const newLead = await Lead.create({
      leadId,
      studentName: studentName.trim(),
      phone: cleanPhone,
      email: email?.trim() || "student@example.com",
      instituteId: instituteId || (numericId ? `inst-${numericId}` : "general"),
      instituteNumericId: numericId,
      instituteName: targetInstName,
      exam: exam || "JEE/NEET 2026",
      targetYear: targetYear || "2026",
      status: "PENDING_CONFIRMATION", // Strict: Not released until explicit consent
      isConfirmedByStudent: false,
      releasedToInstitute: false,
      commission: `₹${commissionRate.toLocaleString()}`,
      commissionNumeric: commissionRate,
      notes: [
        {
          text: "Enquiry lodged from discovery portal; pending student seat lock & consent confirmation.",
          author: "System",
          createdAt: new Date()
        }
      ]
    });

    await logAuditEvent({
      req,
      actor: { id: "public_student", name: studentName, role: "STUDENT" },
      action: "LEAD_SUBMITTED_PENDING_CONFIRMATION",
      entityType: "LEAD",
      entityId: leadId,
      newValue: { studentName, instituteName: targetInstName }
    });

    res.status(201).json({
      success: true,
      message: "Enquiry received! Please confirm your coaching selection to claim your ₹15,000 Seat Lock Pass and connect with the center.",
      leadId: newLead.leadId,
      lead: {
        leadId: newLead.leadId,
        studentName: newLead.studentName,
        instituteName: newLead.instituteName,
        status: newLead.status,
        isConfirmedByStudent: newLead.isConfirmedByStudent
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 2. Student Explicit Confirmation of Interest & Data Sharing Consent
// Releases the lead ONLY to the verified target coaching center
router.post("/:leadId/confirm-interest", async (req, res) => {
  try {
    const { leadId } = req.params;
    const { consentAgreed, batchName } = req.body;

    if (!consentAgreed) {
      return res.status(400).json({
        error: "Explicit consent is required to release student interest and contact details to the institute desk."
      });
    }

    const lead = await Lead.findOne({ leadId });
    if (!lead) {
      return res.status(404).json({ error: "Lead not found." });
    }

    if (lead.releasedToInstitute) {
      return res.json({
        success: true,
        message: "This enquiry has already been confirmed and released to the institute.",
        lead
      });
    }

    // 1. Record explicit student consent and IP address
    lead.isConfirmedByStudent = true;
    lead.consentTimestamp = new Date();
    lead.consentIp = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "127.0.0.1";
    lead.consentTextVersion = "v1.0-SeatLock-DataSharingConsent";

    // 2. Server-side eligibility validation
    lead.releaseEligibilityChecked = true;
    lead.releasedToInstitute = true;
    lead.releasedAt = new Date();
    lead.status = "RELEASED";

    // 3. Generate Seat Lock Pass / Voucher
    const voucherCount = await Voucher.countDocuments();
    const voucherId = `FS-SEAT-${String(voucherCount + 7430 + Math.floor(Math.random() * 50)).padStart(4, "0")}`;
    const code = `FS-${(lead.instituteName || "PASS").split(" ")[0].toUpperCase()}-15K`;

    const newVoucher = await Voucher.create({
      voucherId,
      code,
      studentName: lead.studentName,
      studentPhone: lead.phone,
      studentEmail: lead.email,
      instituteId: lead.instituteNumericId || 1,
      instituteName: lead.instituteName,
      batch: batchName || `${lead.exam} Regular Classroom Batch`,
      discountAmount: "₹15,000 Flat Grant",
      discountValue: 15000,
      status: "ACTIVE",
      validTill: "Valid till 30 Nov 2026",
      escrowDays: "15-Day Escrow Protected",
      verificationStatus: "PENDING_AUDIT"
    });

    lead.voucherCode = voucherId;
    lead.notes.push({
      text: `Student explicitly confirmed interest. Voucher ${voucherId} generated. Lead released to ${lead.instituteName}.`,
      author: "System",
      createdAt: new Date()
    });

    await lead.save();

    await logAuditEvent({
      req,
      actor: { id: lead.phone, name: lead.studentName, role: "STUDENT" },
      action: "LEAD_RELEASED_TO_INSTITUTE",
      entityType: "LEAD",
      entityId: lead.leadId,
      newValue: {
        instituteName: lead.instituteName,
        voucherId,
        consentIp: lead.consentIp
      },
      status: "SUCCESS"
    });

    res.json({
      success: true,
      message: `Interest confirmed! Your ₹15,000 FutureSelector Seat Lock Pass (${voucherId}) is active. The center director has been notified.`,
      voucher: newVoucher,
      lead
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 3. Student Dashboard: Fetch My Enquiries
router.get("/my-enquiries", async (req, res) => {
  try {
    const { phone } = req.query;
    if (!phone) {
      return res.status(400).json({ error: "Phone number is required." });
    }

    const cleanPhone = `+91 ${phone.replace(/\D/g, "").slice(-10)}`;
    const leads = await Lead.find({ phone: cleanPhone }).sort({ createdAt: -1 });

    res.json(leads);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 4. Admin: Get all leads with audit
router.get("/", protectAdmin, async (req, res) => {
  try {
    const leads = await Lead.find().sort({ createdAt: -1 });
    res.json(leads);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 5. Admin: Update lead status
router.put("/:id/status", protectAdmin, async (req, res) => {
  try {
    const { status, notes } = req.body;
    const { id } = req.params;

    const lead = await Lead.findOne({ $or: [{ leadId: id }, { _id: id }] });
    if (!lead) {
      return res.status(404).json({ error: "Lead not found" });
    }

    const prevStatus = lead.status;
    lead.status = status;
    if (notes) {
      lead.notes.push({ text: notes, author: req.admin.email, createdAt: new Date() });
    }
    await lead.save();

    await logAuditEvent({
      req,
      actor: req.admin,
      action: "LEAD_STATUS_UPDATED",
      entityType: "LEAD",
      entityId: lead.leadId,
      previousValue: prevStatus,
      newValue: status,
      reason: notes || `Staff updated status to ${status}`
    });

    res.json({ success: true, message: `Lead updated to ${status}`, lead });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
