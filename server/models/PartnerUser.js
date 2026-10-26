const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const partnerUserSchema = new mongoose.Schema(
  {
    instituteId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Institute",
      required: true,
      index: true
    },
    instituteNumericId: {
      type: Number,
      index: true
    },
    instituteName: {
      type: String,
      required: true,
      trim: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true
    },
    password: {
      type: String,
      required: true,
      minlength: [8, "Password must be at least 8 characters"]
    },
    phone: {
      type: String,
      trim: true
    },
    designation: {
      type: String,
      default: "Center Director / Admissions In-Charge"
    },
    role: {
      type: String,
      default: "INSTITUTE_PARTNER"
    },
    // Fine-grained admin-controlled permissions
    permissions: {
      canEditProfile: { type: Boolean, default: true },
      canSubmitForApproval: { type: Boolean, default: true },
      canAccessLeads: { type: Boolean, default: true },
      canReportAdmissions: { type: Boolean, default: true },
      canRespondRMS: { type: Boolean, default: true },
      canViewAnalytics: { type: Boolean, default: true }
    },
    status: {
      type: String,
      enum: ["INVITED", "ACTIVE", "SUSPENDED", "INACTIVE"],
      default: "ACTIVE",
      index: true
    },
    invitationToken: {
      type: String,
      index: true
    },
    invitationExpiresAt: Date,
    lastLoginAt: Date,
    lastLoginIp: String
  },
  {
    timestamps: true
  }
);

// Hash password before saving
partnerUserSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password helper
partnerUserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("PartnerUser", partnerUserSchema);
