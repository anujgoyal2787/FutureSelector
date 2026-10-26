const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, ".env") });
require("dotenv").config(); // Also check root fallback
const express = require("express");
const cors = require("cors");
const { connectDB, getDBStatus } = require("./config/db");
const { seedDatabase } = require("./config/seedData");

// Route imports
const authRoutes = require("./routes/authRoutes");
const instituteRoutes = require("./routes/instituteRoutes");
const voucherRoutes = require("./routes/voucherRoutes");
const leadRoutes = require("./routes/leadRoutes");
const counsellingRoutes = require("./routes/counsellingRoutes");
const adminRoutes = require("./routes/adminRoutes");
const partnerRoutes = require("./routes/partnerRoutes");
const rmsRoutes = require("./routes/rmsRoutes");

const app = express();

// Middleware
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json());

// Request logger for developer debugging
app.use((req, res, next) => {
  console.log(`[API ${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
  next();
});

// Initialize Database & Seed
(async () => {
  await connectDB();
  await seedDatabase();
})();

// Health & System Status Endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    platform: "FutureSelector Production Backend",
    timestamp: new Date().toISOString(),
    database: getDBStatus()
  });
});

// Mount Production API Routes
app.use("/api/auth", authRoutes);
app.use("/api/institutes", instituteRoutes);
app.use("/api/vouchers", voucherRoutes);
app.use("/api/enquiries", leadRoutes);
app.use("/api/leads", leadRoutes);
app.use("/api/counselling", counsellingRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/partner", partnerRoutes);
app.use("/api/rms", rmsRoutes);

// Overall Platform Stats Endpoint
app.get("/api/stats", (req, res) => {
  res.json({
    totalInstitutes: "120+",
    activeLeads: "1,420+",
    placedStudents: "52,400+",
    verifiedReviews: "6,200+",
    averageFeeSavings: "₹24,500",
    voucherWaiverGrant: "₹15,000 Flat Grant"
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Unhandled Error:", err);
  res.status(500).json({ error: "Internal Server Error", message: err.message });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`======================================================`);
  console.log(`🚀 FutureSelector Production API Server`);
  console.log(`📡 URL: http://localhost:${PORT}`);
  console.log(`🩺 Health check: http://localhost:${PORT}/api/health`);
  console.log(`======================================================`);
});

module.exports = app;
