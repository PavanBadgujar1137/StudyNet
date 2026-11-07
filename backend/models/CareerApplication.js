const mongoose = require("mongoose");

const careerApplicationSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    city: {
      type: String,
      trim: true,
      default: "",
    },
    experience: {
      type: String,
      required: true,
      trim: true,
    },
    currentOrg: {
      type: String,
      trim: true,
      default: "",
    },
    linkedin: {
      type: String,
      trim: true,
      default: "",
    },
    portfolio: {
      type: String,
      trim: true,
      default: "",
    },
    expertise: {
      type: String,
      required: true,
      trim: true,
    },
    coverNote: {
      type: String,
      required: true,
      trim: true,
    },
    jobTitle: {
      type: String,
      trim: true,
      default: "General / Open Application",
    },
    resumeUrl: {
      type: String,
      default: "",
    },
    resumeName: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["New", "In Review", "Shortlisted", "Interviewing", "Rejected", "Hired"],
      default: "New",
    },
    adminNotes: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("CareerApplication", careerApplicationSchema);
