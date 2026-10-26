const jwt = require("jsonwebtoken");
const User = require("../models/User");

const JWT_SECRET = process.env.JWT_SECRET || "fs_jwt_secret_2026";

/**
 * Protect Student Routes: Verifies Bearer JWT Token
 * Ensures that req.student and req.user are populated from MongoDB User record,
 * preventing any IDOR or profile tampering between students.
 */
const protectStudent = async (req, res, next) => {
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
      message: "Access denied. Valid Student Bearer token is missing."
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    if (!decoded.id) {
      return res.status(401).json({
        error: "Invalid Token",
        message: "Token signature does not contain valid student credentials."
      });
    }

    // Verify Student in Database
    const student = await User.findById(decoded.id);

    if (!student) {
      return res.status(401).json({
        error: "Student Not Found",
        message: "Student account was not found in FutureSelector database."
      });
    }

    req.student = student;
    req.user = student;
    next();
  } catch (error) {
    return res.status(401).json({
      error: "Authentication Failed",
      message: error.name === "TokenExpiredError" 
        ? "Session expired. Please log in again." 
        : "Invalid token signature or malformed credentials."
    });
  }
};

module.exports = { protectStudent };
