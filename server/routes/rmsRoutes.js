const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const RMSTicket = require("../models/RMSTicket");
const Institute = require("../models/Institute");
const { logAuditEvent } = require("../utils/auditLogger");

// 1. Student Dashboard - Log Grievance / Dispute
router.post("/student-ticket", async (req, res) => {
  try {
    const { studentName, studentPhone, studentEmail, instituteName, category, subject, description, priority } = req.body;
    if (!studentName || !studentPhone || !instituteName || !subject) {
      return res.status(400).json({ error: "studentName, studentPhone, instituteName, and subject are required" });
    }

    const cleanPhone = `+91 ${studentPhone.replace(/\D/g, "").slice(-10)}`;
    const count = await RMSTicket.countDocuments();
    const ticketId = `RMS-2026-${String(count + 101).padStart(4, "0")}`;

    // Look up institute to link numericId
    let instituteNumericId = null;
    const inst = await Institute.findOne({ name: { $regex: new RegExp(instituteName.split(" ")[0], "i") } });
    if (inst) {
      instituteNumericId = inst.numericId;
    }

    const newTicket = await RMSTicket.create({
      ticketId,
      studentName: studentName.trim(),
      studentPhone: cleanPhone,
      studentEmail: studentEmail?.trim() || "",
      instituteName: instituteName.trim(),
      instituteNumericId,
      category: category || "PASS_DISCOUNT_DISPUTE",
      subject: subject.trim(),
      description: description?.trim() || "",
      priority: priority || (category === "PASS_DISCOUNT_DISPUTE" ? "CRITICAL" : "MEDIUM"),
      status: "OPEN",
      slaHoursLeft: category === "PASS_DISCOUNT_DISPUTE" ? 6 : 24,
      assignedTo: "Kunal Verma (Support Lead)",
      assignedOfficerEmail: "kunal.ops@futureselector.com",
      messages: [
        {
          sender: studentName.trim(),
          senderRole: "STUDENT",
          message: description?.trim() || subject.trim(),
          timestamp: new Date()
        }
      ]
    });

    await logAuditEvent({
      req,
      actor: { id: cleanPhone, name: studentName, role: "STUDENT" },
      action: "RMS_TICKET_CREATED",
      entityType: "RMSTicket",
      entityId: ticketId,
      newValue: { category, instituteName, subject }
    });

    res.status(201).json({
      success: true,
      message: `Your grievance has been lodged under Ticket ID ${ticketId}. Our central student desk is investigating.`,
      ticket: newTicket
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 2. Student Dashboard - Fetch My Raised Grievances / Tickets
router.get("/my-tickets", async (req, res) => {
  try {
    const { phone, email } = req.query;
    if (!phone && !email) {
      return res.status(400).json({ error: "Phone number or email is required to look up student grievances" });
    }

    const queryOr = [];
    if (phone) {
      const cleanPhone = phone.replace(/[^0-9]/g, "").slice(-10);
      if (cleanPhone) {
        queryOr.push({ studentPhone: { $regex: cleanPhone } });
      }
    }
    if (email) {
      queryOr.push({ studentEmail: email.toLowerCase().trim() });
    }

    const tickets = await RMSTicket.find(queryOr.length ? { $or: queryOr } : {}).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: tickets.length,
      tickets
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 3. Student Dashboard - Confirm Resolution & Close Dispute
router.post("/:ticketId/student-confirm", async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { studentFeedback } = req.body;

    const query = mongoose.Types.ObjectId.isValid(ticketId)
      ? { $or: [{ _id: ticketId }, { ticketId }] }
      : { ticketId };

    const ticket = await RMSTicket.findOne(query);

    if (!ticket) {
      return res.status(404).json({ error: "Ticket not found." });
    }

    ticket.studentConfirmedResolution = true;
    ticket.studentConfirmedAt = new Date();
    ticket.studentFeedback = studentFeedback || "Resolution accepted by student.";
    ticket.status = "CLOSED";
    ticket.slaHoursLeft = 0;

    ticket.messages.push({
      sender: ticket.studentName,
      senderRole: "STUDENT",
      message: `Student confirmed resolution: ${ticket.studentFeedback}`,
      timestamp: new Date()
    });

    await ticket.save();

    await logAuditEvent({
      req,
      actor: { id: ticket.studentPhone, name: ticket.studentName, role: "STUDENT" },
      action: "RMS_STUDENT_CONFIRMED_RESOLUTION",
      entityType: "RMSTicket",
      entityId: ticket.ticketId,
      status: "SUCCESS"
    });

    res.json({
      success: true,
      message: `Ticket ${ticket.ticketId} marked as successfully CLOSED by student confirmation.`,
      ticket
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 4. Student Dashboard - Reopen Dispute (If Institute / Admin Resolution is Unsatisfactory)
router.post("/:ticketId/student-reopen", async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { reopenReason } = req.body;

    if (!reopenReason) {
      return res.status(400).json({ error: "Please state the reason for reopening the dispute." });
    }

    const query = mongoose.Types.ObjectId.isValid(ticketId)
      ? { $or: [{ _id: ticketId }, { ticketId }] }
      : { ticketId };

    const ticket = await RMSTicket.findOne(query);

    if (!ticket) {
      return res.status(404).json({ error: "Ticket not found." });
    }

    const prevStatus = ticket.status;
    ticket.status = "REOPENED";
    ticket.priority = "CRITICAL";
    ticket.slaHoursLeft = 12;

    ticket.reopenHistory.push({
      reopenedAt: new Date(),
      reason: reopenReason.trim(),
      reopenedBy: ticket.studentName
    });

    ticket.messages.push({
      sender: ticket.studentName,
      senderRole: "STUDENT",
      message: `[DISPUTE REOPENED]: ${reopenReason.trim()}`,
      timestamp: new Date()
    });

    await ticket.save();

    await logAuditEvent({
      req,
      actor: { id: ticket.studentPhone, name: ticket.studentName, role: "STUDENT" },
      action: "RMS_STUDENT_REOPENED_DISPUTE",
      entityType: "RMSTicket",
      entityId: ticket.ticketId,
      previousValue: prevStatus,
      newValue: "REOPENED",
      reason: reopenReason
    });

    res.json({
      success: true,
      message: `Dispute ${ticket.ticketId} has been escalated and marked REOPENED for executive administrative review.`,
      ticket
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
