const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    phone: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    email: {
      type: String,
      lowercase: true,
      trim: true
    },
    picture: {
      type: String,
      default: ""
    },
    googleId: {
      type: String,
      default: ""
    },
    exam: {
      type: String,
      default: ""
    },
    city: {
      type: String,
      default: ""
    },
    standard: {
      type: String,
      default: ""
    },
    dreamCollege: {
      type: String,
      default: ""
    },
    role: {
      type: String,
      enum: ["student", "counselor", "admin"],
      default: "student"
    },
    authMethod: {
      type: String,
      enum: ["phone_otp", "google"],
      default: "phone_otp"
    },
    verified: {
      type: Boolean,
      default: true
    },
    shortlistedInstitutes: [
      {
        type: Number // Institute numeric IDs
      }
    ],
    lastLogin: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("User", userSchema);
