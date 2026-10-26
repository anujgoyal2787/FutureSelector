const express = require("express");
const router = express.Router();
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const { protectStudent } = require("../middleware/studentAuth");

const JWT_SECRET = process.env.JWT_SECRET || "fs_jwt_secret_2026";

/**
 * 1. Send OTP (Mobile Login)
 */
router.post("/send-otp", async (req, res) => {
  const { phone, name } = req.body;
  if (!phone) {
    return res.status(400).json({ error: "Mobile number is required" });
  }

  const cleanPhone = phone.replace(/\D/g, "").slice(-10);
  if (cleanPhone.length !== 10) {
    return res.status(400).json({ error: "Please enter a valid 10-digit mobile number" });
  }

  const demoOtp = "2026";
  console.log(`📱 [AUTH SERVICE] OTP issued for +91 ${cleanPhone} (${name || "Student"}): ${demoOtp}`);

  res.json({
    success: true,
    message: `OTP sent successfully to +91 ${cleanPhone}`,
    phone: cleanPhone,
    demoOtp: process.env.NODE_ENV === "production" ? undefined : demoOtp
  });
});

/**
 * 2. Verify OTP & Log In / Register Student
 * Persists student to MongoDB 'users' collection with Mongoose
 */
router.post("/verify-otp", async (req, res) => {
  const { phone, otp, name, exam, city, standard, dreamCollege } = req.body;

  const cleanPhone = (phone || "").replace(/\D/g, "").slice(-10);
  if (!cleanPhone || cleanPhone.length !== 10) {
    return res.status(400).json({ error: "Valid 10-digit phone number is required" });
  }

  // Developer / free demo code is 2026, or valid 4-digit code in test environments
  if (!otp || (otp !== "2026" && process.env.NODE_ENV === "production")) {
    return res.status(400).json({ error: "Invalid OTP. Please enter the valid verification code." });
  }

  try {
    const formattedPhone = `+91 ${cleanPhone}`;
    let user = await User.findOne({ phone: formattedPhone });

    if (!user) {
      // New Student Registration in MongoDB
      const studentName = (name && name.trim()) || "Aspirant";
      const emailUsername = studentName.toLowerCase().replace(/[^a-z0-9]/g, "") || "student";
      const generatedEmail = `${emailUsername}.${cleanPhone.slice(-4)}@futureselector.com`;

      user = await User.create({
        name: studentName,
        phone: formattedPhone,
        email: generatedEmail,
        exam: exam || "JEE Advanced 2026",
        city: city || "Kota, Rajasthan",
        standard: standard || "12th Science / Dropper",
        dreamCollege: dreamCollege || "IIT Bombay (Computer Science)",
        authMethod: "phone_otp",
        verified: true,
        shortlistedInstitutes: [1, 2],
        lastLogin: new Date()
      });
      console.log(`✨ [STUDENT REGISTRATION] Created new student profile in MongoDB: ${user.name} (${user.phone})`);
    } else {
      // Existing Student Login - update last login and optional profile updates
      user.lastLogin = new Date();
      if (name && name.trim()) user.name = name.trim();
      if (exam) user.exam = exam;
      if (city) user.city = city;
      await user.save();
      console.log(`🔑 [STUDENT LOGIN] Authenticated existing student: ${user.name} (${user.phone})`);
    }

    // Generate Student JWT Token
    const token = jwt.sign(
      { id: user._id, phone: user.phone, name: user.name, role: user.role || "student" },
      JWT_SECRET,
      { expiresIn: "30d" }
    );

    res.json({
      success: true,
      message: "Phone verified successfully!",
      user,
      token
    });
  } catch (error) {
    console.error("❌ [STUDENT AUTH ERROR]:", error);
    res.status(500).json({ error: "Failed to authenticate student: " + error.message });
  }
});

/**
 * 3. Google Sign-In (1-Click Student Auth)
 * Persists student to MongoDB 'users' collection
 */
router.post("/google", async (req, res) => {
  const { name, email, phone, exam, city, dreamCollege } = req.body;

  const studentEmail = (email || "").toLowerCase().trim();
  if (!studentEmail || !studentEmail.includes("@")) {
    return res.status(400).json({ error: "Valid email address is required for Google Sign-In" });
  }

  try {
    let user = await User.findOne({ email: studentEmail });

    if (!user) {
      const cleanPhone = phone ? phone.replace(/\D/g, "").slice(-10) : "";
      const formattedPhone = cleanPhone.length === 10 
        ? `+91 ${cleanPhone}` 
        : `+91 ${Math.floor(6000000000 + Math.random() * 3999999999)}`;

      user = await User.create({
        name: name || "Student Aspirant",
        email: studentEmail,
        phone: formattedPhone,
        exam: exam || "JEE Advanced 2026",
        city: city || "Kota, Rajasthan",
        standard: "12th Science / Dropper",
        dreamCollege: dreamCollege || "IIT Bombay (Computer Science)",
        authMethod: "google",
        verified: true,
        shortlistedInstitutes: [1, 2],
        lastLogin: new Date()
      });
      console.log(`✨ [GOOGLE REGISTRATION] Created new student profile: ${user.name} (${user.email})`);
    } else {
      user.lastLogin = new Date();
      if (name) user.name = name;
      await user.save();
      console.log(`🔑 [GOOGLE LOGIN] Authenticated existing student: ${user.name} (${user.email})`);
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, name: user.name, role: user.role || "student" },
      JWT_SECRET,
      { expiresIn: "30d" }
    );

    res.json({
      success: true,
      message: "Google sign-in successful!",
      user,
      token
    });
  } catch (error) {
    console.error("❌ [GOOGLE AUTH ERROR]:", error);
    res.status(500).json({ error: "Google authentication failed: " + error.message });
  }
});

/**
 * 4. Get Current Authenticated Student Profile
 * Protected by protectStudent middleware
 */
router.get("/me", protectStudent, async (req, res) => {
  try {
    const student = await User.findById(req.student._id).select("-__v");
    if (!student) {
      return res.status(404).json({ error: "Student profile not found" });
    }
    res.json({ success: true, user: student });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch student profile: " + error.message });
  }
});

/**
 * 5. Update Authenticated Student Profile
 * Protected by protectStudent middleware - IDOR Safe
 */
router.put("/profile", protectStudent, async (req, res) => {
  const { name, exam, city, standard, dreamCollege, shortlistedInstitutes } = req.body;

  try {
    const updateData = {};
    if (name) updateData.name = name.trim();
    if (exam) updateData.exam = exam.trim();
    if (city) updateData.city = city.trim();
    if (standard) updateData.standard = standard.trim();
    if (dreamCollege) updateData.dreamCollege = dreamCollege.trim();
    if (Array.isArray(shortlistedInstitutes)) updateData.shortlistedInstitutes = shortlistedInstitutes;

    const updatedUser = await User.findByIdAndUpdate(
      req.student._id,
      { $set: updateData },
      { returnDocument: "after", runValidators: true }
    );

    res.json({
      success: true,
      message: "Student profile updated successfully in database!",
      user: updatedUser
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to update profile: " + error.message });
  }
});

module.exports = router;
