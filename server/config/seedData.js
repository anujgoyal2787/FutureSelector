const Institute = require("../models/Institute");
const Lead = require("../models/Lead");
const Voucher = require("../models/Voucher");
const Counselling = require("../models/Counselling");
const PartnerUser = require("../models/PartnerUser");

const initialInstitutes = [
  {
    numericId: 1,
    slug: "allen-career-institute-kota",
    name: "Allen Career Institute",
    displayName: "Allen Career Institute, Kota",
    location: "Kota, Rajasthan",
    locality: "Indraprastha (IPIA)",
    cityKey: "kota",
    type: "JEE & NEET",
    batches: ["11th", "12th", "dropper"],
    fees: "₹1,40,000 / Yr",
    numericFee: 140000,
    rating: 4.8,
    reviews: 1240,
    batchSize: "45 students",
    selectionRate: "12.8%",
    topRank: "AIR 1, 4 (2025)",
    doubtSupport: "Dedicated Doubt Counters",
    hostelDistance: "Within 200m",
    facultyHighlights: "120+ Kota Senior Faculties",
    image: "https://images.unsplash.com/photo-1562774053-701939374585?q=80&w=800&auto=format&fit=crop",
    description: "Famous for disciplined academic environment, top faculties, and rigorous All India Test Series in Kota.",
    verified: true,
    partnerStatus: "PREMIUM",
    referralCommissionRate: 8500,
    accountStatus: "ACTIVE",
    verificationStatus: "VERIFIED",
    publicationStatus: "PUBLISHED",
    onboardingStatus: "APPROVED",
    contactPerson: {
      name: "Dr. Rajesh Maheshwari",
      designation: "Zonal Director",
      email: "partner@allen.in",
      phone: "+91 94141 22334"
    },
    branches: [
      {
        branchId: "BR-ALLEN-KOTA-1",
        name: "Sankalp Campus (Main)",
        address: "CP-6, Indraprastha Industrial Area",
        city: "Kota",
        phone: "+91 744 2757575",
        isMainBranch: true
      },
      {
        branchId: "BR-ALLEN-KOTA-2",
        name: "Samyak Campus",
        address: "Landmark City, Kunadi",
        city: "Kota",
        phone: "+91 744 3556677",
        isMainBranch: false
      }
    ],
    facilities: [
      "AC Classrooms with Smart Boards",
      "Dedicated 24/7 Doubt Counters",
      "CCTV Monitored Self-Study Library",
      "Regular Student Health & Mental Wellness Desk",
      "On-Campus Canteen & Filtered RO Water"
    ],
    courses: [
      {
        courseId: "CRS-ALLEN-01",
        name: "Leader Batch (JEE Advanced 1-Year Dropper)",
        targetExam: "JEE Advanced",
        duration: "1 Year",
        fee: 140000,
        batchStartDate: "15 April 2026",
        eligibility: "12th Passed / Appearing"
      },
      {
        courseId: "CRS-ALLEN-02",
        name: "Enthusiast Batch (12th Cum Target NEET)",
        targetExam: "NEET UG",
        duration: "1 Year",
        fee: 135000,
        batchStartDate: "2 May 2026",
        eligibility: "11th Passed"
      }
    ],
    agreementTerms: {
      commissionType: "FIXED",
      commissionRate: 8500,
      commissionNumericRate: 0.12,
      escrowDays: 15,
      agreementVersion: "v1.0-KotaConsortium",
      signedAt: new Date("2025-12-01"),
      signedBy: "Dr. Rajesh Maheshwari"
    },
    profileStudio: {
      logo: "https://images.unsplash.com/photo-1562774053-701939374585?q=80&w=200&auto=format&fit=crop",
      coverImage: "https://images.unsplash.com/photo-1562774053-701939374585?q=80&w=1200&auto=format&fit=crop",
      tagline: "Path to Success — Kota's Benchmark of Academic Rigor",
      socialLinks: {
        website: "https://allen.ac.in",
        youtube: "https://youtube.com/@allencareerinstitute",
        instagram: "https://instagram.com/allen_career_institute"
      },
      gallery: [
        {
          id: "GAL-101",
          url: "https://images.unsplash.com/photo-1562774053-701939374585?q=80&w=800&auto=format&fit=crop",
          caption: "Sankalp Campus Main Academic Block",
          category: "CAMPUS",
          uploadedAt: new Date("2026-01-15")
        },
        {
          id: "GAL-102",
          url: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?q=80&w=800&auto=format&fit=crop",
          caption: "Smart Classroom with High-Resolution Digital Board",
          category: "CLASSROOM",
          uploadedAt: new Date("2026-01-18")
        },
        {
          id: "GAL-103",
          url: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=800&auto=format&fit=crop",
          caption: "1-on-1 Personalized Evening Doubt Counters",
          category: "FACULTY",
          uploadedAt: new Date("2026-02-01")
        }
      ],
      announcements: [
        {
          id: "ANN-101",
          title: "Admissions Open for Nurture & Leader Batches 2026-27",
          content: "Early Bird FutureSelector Passholders receive direct ₹15,000 scholarship grant upon counter verification.",
          badge: "Admissions 2026",
          pinned: true,
          createdAt: new Date("2026-02-10")
        },
        {
          id: "ANN-102",
          title: "Kota Campus Orientation & Diagnostic Test Schedule Announced",
          content: "Diagnostic testing for batch stratification commences from first Monday of April.",
          badge: "Academic",
          pinned: false,
          createdAt: new Date("2026-02-18")
        }
      ],
      facultyRoster: [
        {
          name: "Er. P.K. Agarwal",
          subject: "Physics (Advanced Mechanics)",
          experience: "22 Years",
          qualification: "B.Tech IIT Roorkee",
          highlight: "Mentored 18 Top-100 AIRs",
          photo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=300&auto=format&fit=crop"
        },
        {
          name: "Dr. S.K. Verma",
          subject: "Inorganic Chemistry",
          experience: "19 Years",
          qualification: "Ph.D. BHU",
          highlight: "Author of Benchmark NEET Series",
          photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=300&auto=format&fit=crop"
        }
      ],
      hallOfFame: [
        {
          studentName: "Devansh Singhal",
          exam: "JEE Advanced 2025",
          airRank: "AIR 1",
          year: "2025",
          collegeAllotted: "IIT Bombay (Computer Science)",
          photo: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=300&auto=format&fit=crop"
        }
      ]
    }
  },
  {
    numericId: 2,
    slug: "resonance-eduventures-kota",
    name: "Resonance Eduventures",
    displayName: "Resonance Eduventures, Kota",
    location: "Kota, Rajasthan",
    locality: "Indraprastha (IPIA)",
    cityKey: "kota",
    type: "JEE Advanced",
    batches: ["11th", "12th", "dropper"],
    fees: "₹1,30,000 / Yr",
    numericFee: 130000,
    rating: 4.6,
    reviews: 890,
    batchSize: "50 students",
    selectionRate: "10.4%",
    topRank: "AIR 6, 19 (2025)",
    doubtSupport: "Daily 2-Hour Faculty Desks",
    hostelDistance: "Within 250m",
    facultyHighlights: "Pioneering Kota Methodology",
    image: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=800&auto=format&fit=crop",
    description: "Renowned for comprehensive curriculum material, systematic DPPs, and structured classroom problem solving.",
    verified: true,
    partnerStatus: "PARTNER",
    referralCommissionRate: 7500,
    accountStatus: "ACTIVE",
    verificationStatus: "VERIFIED",
    publicationStatus: "PUBLISHED",
    onboardingStatus: "APPROVED",
    contactPerson: {
      name: "Er. Manoj Sharma",
      designation: "Vice President (Academics)",
      email: "partner@resonance.in",
      phone: "+91 94142 88990"
    },
    branches: [
      {
        branchId: "BR-RESO-1",
        name: "CG Tower Main Campus",
        address: "A-46 & 52, IPIA",
        city: "Kota",
        phone: "+91 744 2777777",
        isMainBranch: true
      }
    ],
    facilities: [
      "Comprehensive DPP Diagnostic Desks",
      "Air-Conditioned Modern Lecture Halls",
      "Central Library with 15,000+ Advanced Textbooks",
      "Hostel Tie-ups with Verified Kitchen Audits"
    ],
    courses: [
      {
        courseId: "CRS-RESO-01",
        name: "Vijetha Batch (Repeater Course for JEE Advanced)",
        targetExam: "JEE Advanced",
        duration: "1 Year",
        fee: 130000,
        batchStartDate: "25 April 2026",
        eligibility: "12th Passed"
      }
    ],
    agreementTerms: {
      commissionType: "FIXED",
      commissionRate: 7500,
      commissionNumericRate: 0.12,
      escrowDays: 15,
      agreementVersion: "v1.0",
      signedAt: new Date("2026-01-10"),
      signedBy: "Er. Manoj Sharma"
    },
    profileStudio: {
      logo: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=200&auto=format&fit=crop",
      coverImage: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=1200&auto=format&fit=crop",
      tagline: "Educating for better tomorrow with proven Kota pedagogy",
      socialLinks: {
        website: "https://resonance.ac.in",
        youtube: "https://youtube.com/@resonanceeduventures",
        instagram: "https://instagram.com/resonance_eduventures"
      },
      gallery: [],
      announcements: [],
      facultyRoster: [],
      hallOfFame: []
    }
  },
  {
    numericId: 3,
    slug: "aakash-institute-janakpuri",
    name: "Aakash Institute (Janakpuri)",
    displayName: "Aakash Institute, Janakpuri",
    location: "Delhi NCR",
    locality: "Janakpuri West",
    cityKey: "delhi",
    type: "NEET Specialist",
    batches: ["11th", "12th", "dropper"],
    fees: "₹1,45,000 / Yr",
    numericFee: 145000,
    rating: 4.7,
    reviews: 1120,
    batchSize: "40 students",
    selectionRate: "14.2%",
    topRank: "AIR 2, 5 (NEET 2025)",
    doubtSupport: "iTutor + In-person Doubt Desk",
    hostelDistance: "Metro Connected",
    facultyHighlights: "NCERT Authors & Medical Specialists",
    image: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=800&auto=format&fit=crop",
    description: "Benchmark for medical competitive exam preparation with specialized NCERT line-by-line focus and rigorous AIATS test series.",
    verified: true,
    partnerStatus: "PREMIUM",
    referralCommissionRate: 8000,
    accountStatus: "ACTIVE",
    verificationStatus: "VERIFIED",
    publicationStatus: "PUBLISHED",
    onboardingStatus: "APPROVED",
    branches: [
      {
        branchId: "BR-AAKASH-1",
        name: "Janakpuri Regional Flagship",
        address: "District Centre, Janakpuri",
        city: "Delhi",
        phone: "+91 11 47623456",
        isMainBranch: true
      }
    ]
  },
  {
    numericId: 4,
    slug: "fiitjee-kalu-sarai",
    name: "FIITJEE (Kalu Sarai)",
    displayName: "FIITJEE South Delhi (Kalu Sarai)",
    location: "Delhi NCR",
    locality: "Kalu Sarai (IIT Gate)",
    cityKey: "delhi",
    type: "JEE Advanced",
    batches: ["11th", "12th", "dropper"],
    fees: "₹1,60,000 / Yr",
    numericFee: 160000,
    rating: 4.5,
    reviews: 950,
    batchSize: "35 students",
    selectionRate: "11.5%",
    topRank: "AIR 3, 11 (2025)",
    doubtSupport: "GMP & Review Packages",
    hostelDistance: "Within 400m",
    facultyHighlights: "IIT Alumni Master Teachers",
    image: "https://images.unsplash.com/photo-1519452635265-7b1fbfd1e4e0?q=80&w=800&auto=format&fit=crop",
    description: "Intense competitive focus for Top 500 IIT aspirers with Grand Masters Package and deep analytical training.",
    verified: true,
    partnerStatus: "PARTNER",
    referralCommissionRate: 9000,
    accountStatus: "ACTIVE",
    verificationStatus: "VERIFIED",
    publicationStatus: "PUBLISHED",
    onboardingStatus: "APPROVED",
    branches: [
      {
        branchId: "BR-FIITJEE-1",
        name: "South Delhi Centre",
        address: "29-A, Kalu Sarai, Sarvapriya Vihar",
        city: "Delhi",
        phone: "+91 11 46106000",
        isMainBranch: true
      }
    ]
  },
  {
    numericId: 5,
    slug: "motion-education-kota",
    name: "Motion Education",
    displayName: "Motion Education, Kota",
    location: "Kota, Rajasthan",
    locality: "Vigyan Nagar",
    cityKey: "kota",
    type: "JEE & NEET",
    batches: ["11th", "12th", "dropper"],
    fees: "₹1,20,000 / Yr",
    numericFee: 120000,
    rating: 4.6,
    reviews: 740,
    batchSize: "45 students",
    selectionRate: "9.8%",
    topRank: "AIR 15, 48 (2025)",
    doubtSupport: "NV Sir Mentorship & Micro Batches",
    hostelDistance: "Within 150m",
    facultyHighlights: "NV Sir & Kota Star Educators",
    image: "https://images.unsplash.com/photo-1564981797816-1043664bf78d?q=80&w=800&auto=format&fit=crop",
    description: "Strong personalized mentorship with high teacher accessibility and customized batch pacing.",
    verified: true,
    partnerStatus: "PARTNER",
    referralCommissionRate: 7500,
    accountStatus: "ACTIVE",
    verificationStatus: "VERIFIED",
    publicationStatus: "PUBLISHED",
    onboardingStatus: "APPROVED",
    branches: [
      {
        branchId: "BR-MOTION-1",
        name: "Daksh Campus",
        address: "394, Rajeev Gandhi Nagar",
        city: "Kota",
        phone: "+91 744 2778899",
        isMainBranch: true
      }
    ]
  }
];

const initialLeads = [
  {
    leadId: "LEAD-101",
    studentName: "Aman Sharma",
    phone: "+91 98765 43210",
    email: "aman.s@gmail.com",
    instituteId: "allen",
    instituteNumericId: 1,
    instituteName: "Allen Career Institute",
    exam: "JEE Advanced 2026",
    targetYear: "2026",
    status: "RELEASED",
    isConfirmedByStudent: true,
    consentTimestamp: new Date("2026-02-15T10:30:00Z"),
    consentIp: "127.0.0.1",
    consentTextVersion: "v1.0-SeatLock-DataSharingConsent",
    releasedToInstitute: true,
    releasedAt: new Date("2026-02-15T10:30:00Z"),
    releaseEligibilityChecked: true,
    voucherCode: "FS-SEAT-7429",
    commission: "₹8,500",
    commissionNumeric: 8500,
    assignedCounselor: "Dr. Kunal Verma",
    notes: [
      { text: "Lead confirmed interest and approved data sharing via Seat Lock Pass", author: "System", createdAt: new Date("2026-02-15T10:30:00Z") }
    ]
  },
  {
    leadId: "LEAD-102",
    studentName: "Priya Patel",
    phone: "+91 98112 34567",
    email: "priya.p@gmail.com",
    instituteId: "resonance",
    instituteNumericId: 2,
    instituteName: "Resonance Eduventures",
    exam: "JEE Main & Adv 2026",
    targetYear: "2026",
    status: "RELEASED",
    isConfirmedByStudent: true,
    consentTimestamp: new Date("2026-02-16T14:15:00Z"),
    consentIp: "127.0.0.1",
    consentTextVersion: "v1.0-SeatLock-DataSharingConsent",
    releasedToInstitute: true,
    releasedAt: new Date("2026-02-16T14:15:00Z"),
    releaseEligibilityChecked: true,
    voucherCode: "FS-RESO-15K",
    commission: "₹7,500",
    commissionNumeric: 7500,
    assignedCounselor: "Er. Ananya Gupta",
    notes: [
      { text: "Confirmed interest in Kota classroom dropper batch", author: "System", createdAt: new Date("2026-02-16T14:15:00Z") }
    ]
  },
  {
    leadId: "LEAD-103",
    studentName: "Rohan Verma",
    phone: "+91 99223 34455",
    email: "rohan.v@outlook.com",
    instituteId: "aakash",
    instituteNumericId: 3,
    instituteName: "Aakash Institute (Janakpuri)",
    exam: "NEET Specialist",
    targetYear: "2026",
    status: "PENDING_CONFIRMATION",
    isConfirmedByStudent: false,
    releasedToInstitute: false,
    commission: "₹8,000",
    commissionNumeric: 8000,
    assignedCounselor: "Dr. Kunal Verma",
    notes: [
      { text: "Public enquiry submitted; pending student seat lock confirmation", author: "System", createdAt: new Date() }
    ]
  }
];

const initialVouchers = [
  {
    voucherId: "FS-SEAT-7429",
    code: "FS-AAKASH-15K",
    studentName: "Aryan Sharma",
    studentPhone: "+91 98765 43210",
    studentEmail: "aryan.jee2026@gmail.com",
    instituteId: 1,
    instituteName: "Allen Career Institute",
    batch: "2026 Regular Classroom Batch",
    discountAmount: "₹15,000 Flat Grant",
    discountValue: 15000,
    status: "ACTIVE",
    validTill: "Valid till 30 Nov 2026",
    escrowDays: "15-Day Escrow Protected",
    verificationStatus: "PENDING_AUDIT"
  },
  {
    voucherId: "FS-SEAT-8104",
    code: "FS-RESO-15K",
    studentName: "Priya Verma",
    studentPhone: "+91 98112 34567",
    studentEmail: "priya.verma@gmail.com",
    instituteId: 2,
    instituteName: "Resonance Eduventures",
    batch: "Leader Dropper Batch (JEE)",
    discountAmount: "₹15,000 Flat Grant",
    discountValue: 15000,
    status: "REDEEMED",
    validTill: "Valid till 30 Nov 2026",
    escrowDays: "15-Day Escrow Protected",
    redeemedAt: new Date(Date.now() - 3600000 * 24 * 3),
    redeemedByStaff: "Vikram Rathore (Admissions Desk)",
    receiptNumber: "REC-2026-9041",
    receiptAmount: 115000,
    receiptDate: new Date(Date.now() - 3600000 * 24 * 3),
    verificationStatus: "VERIFIED",
    verifiedBy: "admin@futureselector.com",
    verifiedAt: new Date(Date.now() - 3600000 * 24 * 2),
    verificationNotes: "4-point audit cleared: receipt matches pass code, fee matches audited tier",
    commissionGenerated: true,
    commissionTxnId: "TXN-2026-8812"
  }
];

const initialCounselling = [
  {
    bookingId: "CNS-101",
    studentName: "Devansh Mehta",
    phone: "+91 98192 83746",
    email: "devansh.m@gmail.com",
    counsellorName: "Er. Raghavendra Singhal (IIT Bombay)",
    counsellorId: "raghavendra",
    slotTime: "11:00 AM - 11:30 AM",
    date: "Upcoming Saturday",
    trackTitle: "Coaching & Batch Cap Reality Check",
    status: "Confirmed"
  }
];

const seedDatabase = async () => {
  try {
    // 1. Seed or backfill Institutes
    const instCount = await Institute.countDocuments();
    if (instCount === 0) {
      await Institute.insertMany(initialInstitutes);
      console.log(`📦 [SEED] Seeded ${initialInstitutes.length} verified coaching institutes.`);
    } else {
      // Ensure all existing institutes have publicationStatus and decoupled statuses
      await Institute.updateMany(
        { publicationStatus: { $exists: false } },
        { 
          $set: { 
            publicationStatus: "PUBLISHED",
            accountStatus: "ACTIVE",
            verificationStatus: "VERIFIED",
            onboardingStatus: "APPROVED"
          } 
        }
      );
    }

    // 2. Seed Leads
    const leadCount = await Lead.countDocuments();
    if (leadCount === 0) {
      await Lead.insertMany(initialLeads);
      console.log(`📦 [SEED] Seeded ${initialLeads.length} sample admission leads.`);
    }

    // 3. Seed Vouchers
    const voucherCount = await Voucher.countDocuments();
    if (voucherCount === 0) {
      await Voucher.insertMany(initialVouchers);
      console.log(`📦 [SEED] Seeded ${initialVouchers.length} admission vouchers.`);
    }

    // 4. Seed Counselling
    const cnsCount = await Counselling.countDocuments();
    if (cnsCount === 0) {
      await Counselling.insertMany(initialCounselling);
      console.log(`📦 [SEED] Seeded ${initialCounselling.length} counseling sessions.`);
    }

    // 5. Seed Initial Partner Account for Allen Career Institute
    const allenInst = await Institute.findOne({ numericId: 1 });
    if (allenInst) {
      const existingPartner = await PartnerUser.findOne({ email: "partner@allen.in" });
      if (!existingPartner) {
        await PartnerUser.create({
          instituteId: allenInst._id,
          instituteNumericId: 1,
          instituteName: allenInst.name,
          name: "Dr. Rajesh Maheshwari",
          email: "partner@allen.in",
          password: "partner2026", // pre-save hook hashes with bcrypt
          phone: "+91 94141 22334",
          designation: "Zonal Director",
          role: "INSTITUTE_PARTNER",
          status: "ACTIVE",
          permissions: {
            canEditProfile: true,
            canSubmitForApproval: true,
            canAccessLeads: true,
            canReportAdmissions: true,
            canRespondRMS: true,
            canViewAnalytics: true
          }
        });
        console.log("🔒 [SECURITY] Initial Institute Partner account seeded (partner@allen.in / partner2026)");
      }
    }
  } catch (error) {
    console.warn(`⚠️ [SEED WARNING]: ${error.message}`);
  }
};

module.exports = { seedDatabase, initialInstitutes, initialLeads, initialVouchers, initialCounselling };
