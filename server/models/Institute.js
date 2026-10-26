const mongoose = require("mongoose");

const instituteSchema = new mongoose.Schema(
  {
    numericId: {
      type: Number,
      required: true,
      unique: true,
      index: true
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    displayName: {
      type: String,
      trim: true
    },
    location: {
      type: String,
      required: true
    },
    locality: {
      type: String,
      required: true
    },
    cityKey: {
      type: String,
      required: true,
      index: true
    },
    type: {
      type: String, // "JEE & NEET", "JEE Advanced", "NEET Specialist"
      required: true
    },
    batches: [String],
    fees: {
      type: String,
      required: true
    },
    numericFee: {
      type: Number,
      required: true
    },
    rating: {
      type: Number,
      default: 4.5
    },
    reviews: {
      type: Number,
      default: 0
    },
    batchSize: {
      type: String,
      default: "45 students"
    },
    selectionRate: {
      type: String,
      default: "12%"
    },
    topRank: {
      type: String,
      default: "AIR Top 50"
    },
    doubtSupport: {
      type: String,
      default: "Dedicated Doubt Counters"
    },
    hostelDistance: {
      type: String,
      default: "Within 300m"
    },
    facultyHighlights: {
      type: String,
      default: "Senior Faculties"
    },
    image: {
      type: String
    },
    description: {
      type: String
    },
    verified: {
      type: Boolean,
      default: false
    },
    partnerStatus: {
      type: String,
      enum: ["PARTNER", "PREMIUM", "STANDARD"],
      default: "PARTNER"
    },
    referralCommissionRate: {
      type: Number,
      default: 7500 // In INR
    },
    // --- 3-Way Decoupled Lifecycle Statuses ---
    accountStatus: {
      type: String,
      enum: ["INVITED", "ACTIVE", "SUSPENDED", "INACTIVE"],
      default: "INVITED",
      index: true
    },
    verificationStatus: {
      type: String,
      enum: ["UNVERIFIED", "PENDING_AUDIT", "VERIFIED", "REJECTED"],
      default: "UNVERIFIED",
      index: true
    },
    publicationStatus: {
      type: String,
      enum: ["DRAFT", "SUBMITTED", "CHANGES_REQUESTED", "PUBLISHED", "SUSPENDED"],
      default: "DRAFT",
      index: true
    },
    onboardingStatus: {
      type: String,
      enum: ["DRAFT", "INVITATION_SENT", "WIZARD_IN_PROGRESS", "PROFILE_SUBMITTED", "APPROVED", "REJECTED"],
      default: "DRAFT",
      index: true
    },
    // Contact Person Details
    contactPerson: {
      name: { type: String, trim: true },
      designation: { type: String, trim: true },
      email: { type: String, trim: true, lowercase: true },
      phone: { type: String, trim: true }
    },
    // Multi-branch support
    branches: [
      {
        branchId: { type: String, default: () => `BR-${Date.now().toString().slice(-4)}` },
        name: { type: String, required: true },
        address: { type: String, required: true },
        city: { type: String, required: true },
        phone: String,
        isMainBranch: { type: Boolean, default: false }
      }
    ],
    // Facilities & Amenities
    facilities: [String],
    // Course catalog with fee tiers
    courses: [
      {
        courseId: { type: String, default: () => `CRS-${Date.now().toString().slice(-4)}` },
        name: { type: String, required: true },
        targetExam: { type: String, required: true },
        duration: String,
        fee: { type: Number, required: true },
        batchStartDate: String,
        eligibility: String
      }
    ],
    // Agreement and Commission Terms
    agreementTerms: {
      commissionType: { type: String, enum: ["PERCENTAGE", "FIXED"], default: "FIXED" },
      commissionRate: { type: Number, default: 7500 }, // in INR or %
      commissionNumericRate: { type: Number, default: 0.12 },
      escrowDays: { type: Number, default: 15 },
      agreementVersion: { type: String, default: "v1.0" },
      signedAt: Date,
      signedBy: String
    },
    // Profile Studio Elements (Instagram-Style Showcase)
    profileStudio: {
      logo: String,
      coverImage: String,
      tagline: String,
      socialLinks: {
        website: String,
        youtube: String,
        instagram: String
      },
      gallery: [
        {
          id: { type: String, default: () => `GAL-${Date.now().toString().slice(-5)}` },
          url: { type: String, required: true },
          caption: String,
          category: { type: String, enum: ["CAMPUS", "CLASSROOM", "FACULTY", "RESULTS", "HOSTEL"], default: "CAMPUS" },
          uploadedAt: { type: Date, default: Date.now }
        }
      ],
      announcements: [
        {
          id: { type: String, default: () => `ANN-${Date.now().toString().slice(-5)}` },
          title: { type: String, required: true },
          content: { type: String, required: true },
          badge: { type: String, default: "Update" },
          pinned: { type: Boolean, default: false },
          createdAt: { type: Date, default: Date.now }
        }
      ],
      facultyRoster: [
        {
          name: { type: String, required: true },
          subject: { type: String, required: true },
          experience: String,
          qualification: String,
          highlight: String,
          photo: String
        }
      ],
      hallOfFame: [
        {
          studentName: { type: String, required: true },
          exam: { type: String, required: true },
          airRank: { type: String, required: true },
          year: { type: String, default: "2025" },
          collegeAllotted: String,
          photo: String
        }
      ]
    },
    // Supporting Documents uploaded during onboarding
    verificationDocuments: [
      {
        docType: { type: String, enum: ["REGISTRATION_CERT", "GST_CERT", "ADDRESS_PROOF", "RESULTS_AUDIT", "DIRECTOR_ID"] },
        fileUrl: String,
        fileName: String,
        uploadedAt: { type: Date, default: Date.now },
        verified: { type: Boolean, default: false },
        reviewNotes: String
      }
    ],
    // Pending proposed edits awaiting Super Admin Two-Person Governance approval
    pendingChanges: {
      type: mongoose.Schema.Types.Mixed,
      default: null
    },
    pendingChangesAt: Date,
    pendingChangesBy: String,
    // Internal Administrative Notes
    adminNotes: String
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Institute", instituteSchema);
