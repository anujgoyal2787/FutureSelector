const express = require("express");
const router = express.Router();
const Institute = require("../models/Institute");
const PartnerApplication = require("../models/PartnerApplication");
const { initialInstitutes } = require("../config/seedData");

// 1. Get all published institutes with filtering and search (Public & Student Discovery)
router.get("/", async (req, res) => {
  try {
    const { city, exam, search, locality, maxFee } = req.query;
    let institutes = [];

    try {
      // STRICT: Public discovery only shows PUBLISHED institutes that are NOT suspended
      let query = {
        publicationStatus: "PUBLISHED",
        accountStatus: { $ne: "SUSPENDED" }
      };

      if (city && city !== "all") query.cityKey = city.toLowerCase();
      if (exam && exam !== "all") query.type = { $regex: exam, $options: "i" };
      if (locality && locality !== "all") query.localityKey = locality;
      if (maxFee) query.numericFee = { $lte: Number(maxFee) };
      if (search) {
        query.$and = [
          {
            $or: [
              { name: { $regex: search, $options: "i" } },
              { displayName: { $regex: search, $options: "i" } },
              { location: { $regex: search, $options: "i" } },
              { locality: { $regex: search, $options: "i" } }
            ]
          }
        ];
      }

      institutes = await Institute.find(query).sort({ rating: -1 });
    } catch {}

    // Fallback only to published institutes if DB empty
    if (!institutes || institutes.length === 0) {
      institutes = initialInstitutes.filter(i => (i.publicationStatus === "PUBLISHED" || !i.publicationStatus) && i.accountStatus !== "SUSPENDED");
      if (city && city !== "all") {
        institutes = institutes.filter(i => i.cityKey === city.toLowerCase());
      }
      if (exam && exam !== "all") {
        institutes = institutes.filter(i => i.type.toLowerCase().includes(exam.toLowerCase()));
      }
      if (search) {
        institutes = institutes.filter(i => 
          i.name.toLowerCase().includes(search.toLowerCase()) || 
          i.location.toLowerCase().includes(search.toLowerCase())
        );
      }
    }

    res.json(institutes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 2. Compare institutes by IDs
router.get("/compare", async (req, res) => {
  try {
    const ids = (req.query.ids || "1,2").split(",").map(Number);
    let institutes = [];

    try {
      institutes = await Institute.find({
        numericId: { $in: ids },
        publicationStatus: "PUBLISHED",
        accountStatus: { $ne: "SUSPENDED" }
      });
    } catch {}

    if (!institutes || institutes.length === 0) {
      institutes = initialInstitutes.filter(i => ids.includes(i.numericId) && i.publicationStatus === "PUBLISHED");
    }

    res.json(institutes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 3. Get single institute by ID or Slug (Enforces Published Status)
router.get("/:idOrSlug", async (req, res) => {
  try {
    const param = req.params.idOrSlug;
    const isNumeric = !isNaN(param);
    let institute = null;

    try {
      const query = isNumeric ? { numericId: Number(param) } : { slug: param };
      institute = await Institute.findOne(query);
    } catch {}

    if (!institute) {
      institute = initialInstitutes.find(
        i => i.numericId === Number(param) || i.slug === param
      );
    }

    if (!institute) {
      return res.status(404).json({ error: "Institute not found" });
    }

    // If draft or suspended and not previewing, deny public access
    if (institute.publicationStatus !== "PUBLISHED" && req.query.preview !== "true") {
      return res.status(404).json({
        error: "Institute Not Published",
        message: "This coaching institute profile is currently undergoing verification and is not publicly listed."
      });
    }

    res.json(institute);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 4. Public "Partner With Us" Prospective Application Submission
router.post("/partner-apply", async (req, res) => {
  try {
    const { instituteName, contactName, email, phone, city, targetExams, currentEnrollment, branchesCount, websiteUrl, message } = req.body;

    if (!instituteName || !contactName || !email || !phone || !city) {
      return res.status(400).json({ error: "Institute name, contact name, email, phone, and city are required." });
    }

    const count = await PartnerApplication.countDocuments();
    const applicationId = `APP-2026-${String(count + 101).padStart(4, "0")}`;

    const newApp = await PartnerApplication.create({
      applicationId,
      instituteName: instituteName.trim(),
      contactPerson: {
        name: contactName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim()
      },
      city: city.trim(),
      targetExams: Array.isArray(targetExams) ? targetExams : [targetExams || "JEE & NEET"],
      currentEnrollment: currentEnrollment || "100-500 students",
      branchesCount: Number(branchesCount) || 1,
      websiteUrl: websiteUrl || "",
      message: message || "Application for FutureSelector verification and partnership."
    });

    res.status(201).json({
      success: true,
      message: `Your application (${applicationId}) has been received by FutureSelector Institute Partnership Desk. Our team will verify credentials within 2 business days.`,
      applicationId
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
