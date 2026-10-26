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
    exam: {
      type: String,
      default: "JEE Advanced 2026"
    },
    city: {
      type: String,
      default: "Kota, Rajasthan"
    },
    standard: {
      type: String,
      default: "12th Science / Dropper"
    },
    dreamCollege: {
      type: String,
      default: "IIT Bombay (Computer Science)"
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
