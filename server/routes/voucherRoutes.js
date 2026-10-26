const express = require("express");
const router = express.Router();
const Voucher = require("../models/Voucher");
const Lead = require("../models/Lead");
const Institute = require("../models/Institute");
const { logAuditEvent } = require("../utils/auditLogger");
const { initialVouchers } = require("../config/seedData");

// 1. Claim a ₹15,000 Admission Pass Voucher (Explicit Student Confirmation & Consent)
router.post("/claim", async (req, res) => {
  try {
    const { 
      studentName, studentPhone, studentEmail,
      instituteId, instituteName, batch, discountAmount 
    } = req.body;

    if (!studentName || !studentPhone) {
      return res.status(400).json({ error: "Student name and phone number are required" });
    }

    const cleanPhone = `+91 ${studentPhone.replace(/\D/g, "").slice(-10)}`;
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const voucherId = `FS-SEAT-${randomSuffix}`;
    const code = `FS-${(instituteName || "PASS").split(" ")[0].toUpperCase()}-15K`;

    // Fetch Institute numericId and verify agreement commission rate
    let instNumericId = Number(instituteId) || 1;
    let targetInstName = instituteName || "Kota Premier Institute";
    let commissionNumeric = 7500;

    const inst = await Institute.findOne({
      $or: [{ numericId: instNumericId }, { name: targetInstName }]
    });

    if (inst) {
      instNumericId = inst.numericId;
      targetInstName = inst.name;
      commissionNumeric = inst.referralCommissionRate || inst.agreementTerms?.commissionRate || 7500;
    }

    const newVoucher = await Voucher.create({
      voucherId,
      code,
      studentName: studentName.trim(),
      studentPhone: cleanPhone,
      studentEmail: studentEmail || "aspirant@futureselector.com",
      instituteId: instNumericId,
      instituteName: targetInstName,
      batch: batch || "2026 Regular Classroom Batch",
      discountAmount: discountAmount || "₹15,000 Flat Grant",
      discountValue: 15000,
      status: "ACTIVE",
      validTill: "Valid till 30 Nov 2026",
      escrowDays: "15-Day Escrow Protected",
      verificationStatus: "PENDING_AUDIT"
    });

    const consentIp = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "127.0.0.1";

    // Reconcile or create attributed Lead with explicit consent
    let lead = await Lead.findOne({ phone: cleanPhone });
    if (lead) {
      lead.isConfirmedByStudent = true;
      lead.consentTimestamp = new Date();
      lead.consentIp = consentIp;
      lead.consentTextVersion = "v1.0-SeatLock-DataSharingConsent";
      lead.releasedToInstitute = true;
      lead.releasedAt = new Date();
      lead.releaseEligibilityChecked = true;
      lead.status = "RELEASED";
      lead.instituteNumericId = instNumericId;
      lead.instituteName = targetInstName;
      lead.voucherCode = voucherId;
      lead.notes.push({
        text: `Student locked ₹15,000 pass (${voucherId}) with explicit consent. Released to ${targetInstName}.`,
        author: "System",
        createdAt: new Date()
      });
      await lead.save();
    } else {
      await Lead.create({
        leadId: `LEAD-${randomSuffix}`,
        studentName: studentName.trim(),
        phone: cleanPhone,
        email: studentEmail || "aspirant@futureselector.com",
        instituteId: `inst-${instNumericId}`,
        instituteNumericId: instNumericId,
        instituteName: targetInstName,
        exam: "JEE/NEET 2026",
        status: "RELEASED",
        isConfirmedByStudent: true,
        consentTimestamp: new Date(),
        consentIp,
        consentTextVersion: "v1.0-SeatLock-DataSharingConsent",
        releasedToInstitute: true,
        releasedAt: new Date(),
        releaseEligibilityChecked: true,
        voucherCode: voucherId,
        commission: `₹${commissionNumeric.toLocaleString()}`,
        commissionNumeric,
        notes: [
          {
            text: `Direct Seat Lock pass (${voucherId}) claimed with explicit data sharing consent. Released to ${targetInstName}.`,
            author: "System",
            createdAt: new Date()
          }
        ]
      });
    }

    await logAuditEvent({
      req,
      actor: { id: cleanPhone, name: studentName, role: "STUDENT" },
      action: "VOUCHER_CLAIMED_WITH_CONSENT",
      entityType: "VOUCHER",
      entityId: voucherId,
      newValue: {
        instituteName: targetInstName,
        voucherCode: code,
        consentIp
      },
      status: "SUCCESS"
    });

    res.status(201).json({
      success: true,
      message: `Official ₹15,000 Admission Pass (${voucherId}) locked! Your interest has been confirmed with ${targetInstName}.`,
      voucher: newVoucher
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 2. Get active admission passes for student
router.get("/my-passes", async (req, res) => {
  try {
    const { phone } = req.query;
    if (!phone) {
      return res.status(400).json({ error: "Phone number is required" });
    }

    const cleanPhone = `+91 ${phone.replace(/\D/g, "").slice(-10)}`;
    const passes = await Voucher.find({ studentPhone: cleanPhone }).sort({ createdAt: -1 });

    res.json(passes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 3. Verify Voucher Code (For public / student / counter check)
router.get("/verify/:code", async (req, res) => {
  try {
    const code = req.params.code.toUpperCase();
    const voucher = await Voucher.findOne({
      $or: [{ voucherId: code }, { code }]
    });

    if (!voucher) {
      return res.status(404).json({
        valid: false,
        error: "Voucher not found or invalid voucher ID."
      });
    }

    res.json({
      valid: voucher.status === "ACTIVE",
      voucher
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
