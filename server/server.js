const express = require('express');
const app = express();

// Enable CORS for frontend requests
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

app.use(express.json());

// In-memory Database for Institutes, Leads & Counselling bookings
const institutesDatabase = [
  {
    id: "allen",
    name: "Allen Career Institute",
    city: "Kota",
    exam: "JEE & NEET",
    fees: 142000,
    rating: 4.8,
    selectionRate: "12.8%",
    batchSize: 45,
    topRankAIR: "AIR 1, 4, 7 (JEE Adv 2025)",
    contact: "contact@allen.ac.in",
    verified: true
  },
  {
    id: "resonance",
    name: "Resonance Eduventures",
    city: "Kota",
    exam: "JEE Advanced",
    fees: 128000,
    rating: 4.6,
    selectionRate: "10.4%",
    batchSize: 55,
    topRankAIR: "AIR 6, 19, 32 (JEE Adv 2025)",
    contact: "admissions@resonance.ac.in",
    verified: true
  },
  {
    id: "aakash",
    name: "Aakash Institute",
    city: "Delhi",
    exam: "NEET Specialist",
    fees: 148000,
    rating: 4.7,
    selectionRate: "14.2%",
    batchSize: 40,
    topRankAIR: "AIR 2, 5, 8 (NEET UG 2025)",
    contact: "support@aakash.ac.in",
    verified: true
  },
  {
    id: "fiitjee",
    name: "FIITJEE",
    city: "Hyderabad",
    exam: "JEE Advanced",
    fees: 155000,
    rating: 4.5,
    selectionRate: "11.5%",
    batchSize: 35,
    topRankAIR: "AIR 3, 11, 24 (JEE Adv 2025)",
    contact: "info@fiitjee.com",
    verified: true
  },
  {
    id: "motion",
    name: "Motion Education",
    city: "Kota",
    exam: "JEE & NEET",
    fees: 115000,
    rating: 4.6,
    selectionRate: "9.8%",
    batchSize: 50,
    topRankAIR: "AIR 15, 48 (JEE Adv 2025)",
    contact: "helpdesk@motion.ac.in",
    verified: true
  },
  {
    id: "chaitanya",
    name: "Sri Chaitanya Academy",
    city: "Hyderabad",
    exam: "JEE & NEET",
    fees: 135000,
    rating: 4.5,
    selectionRate: "13.1%",
    batchSize: 50,
    topRankAIR: "AIR 1, 9, 14 (NEET & JEE 2025)",
    contact: "admissions@srichaitanya.net",
    verified: true
  }
];

let leadsDatabase = [
  {
    id: "LEAD-101",
    studentName: "Aman Sharma",
    phone: "+91 98765 43210",
    email: "aman.s@gmail.com",
    instituteId: "allen",
    instituteName: "Allen Career Institute",
    exam: "JEE Advanced",
    targetYear: "2026",
    status: "NEW", // NEW -> CONTACTED -> COUNSELING_SCHEDULED -> ADMISSION_CONFIRMED
    date: "2026-10-15",
    commission: "₹7,100"
  },
  {
    id: "LEAD-102",
    studentName: "Priya Nair",
    phone: "+91 98112 33445",
    email: "priya.nair@outlook.com",
    instituteId: "aakash",
    instituteName: "Aakash Institute",
    exam: "NEET",
    targetYear: "2026",
    status: "COUNSELING_SCHEDULED",
    date: "2026-10-14",
    commission: "₹7,400"
  },
  {
    id: "LEAD-103",
    studentName: "Rohit Verma",
    phone: "+91 97654 32190",
    email: "rohit.v@gmail.com",
    instituteId: "fiitjee",
    instituteName: "FIITJEE",
    exam: "JEE Advanced",
    targetYear: "2025",
    status: "ADMISSION_CONFIRMED",
    date: "2026-10-12",
    commission: "₹7,750"
  }
];

let counsellingBookings = [
  {
    id: "CNS-501",
    studentName: "Rahul Gupta",
    phone: "+91 99887 76655",
    targetExam: "JEE Mains + Adv",
    counsellorName: "Er. Rajesh Verma (IIT Delhi Alum)",
    slotTime: "11:00 AM - 11:45 AM",
    date: "Tomorrow",
    status: "Confirmed"
  }
];

// 1. Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", platform: "FutureSelector API", timestamp: new Date().toISOString() });
});

// 2. Get institutes (with search & filtering)
app.get("/api/institutes", (req, res) => {
  let results = [...institutesDatabase];
  const { city, exam, search } = req.query;

  if (city) {
    results = results.filter(i => i.city.toLowerCase() === city.toLowerCase());
  }
  if (exam) {
    results = results.filter(i => i.exam.toLowerCase().includes(exam.toLowerCase()));
  }
  if (search) {
    results = results.filter(i => 
      i.name.toLowerCase().includes(search.toLowerCase()) || 
      i.city.toLowerCase().includes(search.toLowerCase())
    );
  }

  res.json(results);
});

// 3. Lead & Admission Enquiries
app.get("/api/enquiries", (req, res) => {
  res.json(leadsDatabase);
});

app.post("/api/enquiries", (req, res) => {
  const { studentName, phone, email, instituteId, instituteName, exam, targetYear } = req.body;
  if (!studentName || !phone) {
    return res.status(400).json({ error: "Student name and phone are required." });
  }

  const newLead = {
    id: `LEAD-${Date.now().toString().slice(-4)}`,
    studentName,
    phone,
    email: email || "student@example.com",
    instituteId: instituteId || "general",
    instituteName: instituteName || "General Consultation",
    exam: exam || "JEE/NEET",
    targetYear: targetYear || "2026",
    status: "NEW",
    date: new Date().toISOString().split("T")[0],
    commission: "₹7,000"
  };

  leadsDatabase.unshift(newLead);
  res.status(201).json({ success: true, message: "Application submitted successfully!", lead: newLead });
});

// Update lead status (for Institute CRM)
app.put("/api/enquiries/:id/status", (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const lead = leadsDatabase.find(l => l.id === id);

  if (!lead) {
    return res.status(404).json({ error: "Lead not found" });
  }

  lead.status = status;
  res.json({ success: true, message: `Lead updated to ${status}`, lead });
});

// 4. Counselling Bookings
app.get("/api/counselling", (req, res) => {
  res.json(counsellingBookings);
});

app.post("/api/counselling", (req, res) => {
  const { studentName, phone, targetExam, counsellorName, slotTime, date } = req.body;
  if (!studentName || !phone) {
    return res.status(400).json({ error: "Name and phone are required for counselling booking." });
  }

  const newBooking = {
    id: `CNS-${Date.now().toString().slice(-4)}`,
    studentName,
    phone,
    targetExam: targetExam || "JEE/NEET",
    counsellorName: counsellorName || "Chief Academic Counsellor",
    slotTime: slotTime || "11:00 AM",
    date: date || "Upcoming Saturday",
    status: "Confirmed"
  };

  counsellingBookings.unshift(newBooking);
  res.status(201).json({ success: true, message: "Free counselling booked successfully!", booking: newBooking });
});

// 5. Overall Platform Stats
app.get("/api/stats", (req, res) => {
  res.json({
    totalInstitutes: institutesDatabase.length,
    activeLeads: leadsDatabase.length,
    placedStudents: "52,400+",
    verifiedReviews: "6,200+",
    averageFeeSavings: "₹24,500"
  });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`FutureSelector API Server running on http://localhost:${PORT}`);
});
