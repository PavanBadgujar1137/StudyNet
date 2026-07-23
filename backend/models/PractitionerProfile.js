const mongoose = require("mongoose")

const practitionerProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    credentials: { type: String, trim: true },
    specialties: [{ type: String }],
    languages: [{ type: String }],
    formats: [{ type: String }], // e.g., ["1:1", "circle", "membership"]
    verificationStatus: {
      type: String,
      enum: ["pending", "verified", "rejected"],
      default: "pending",
    },
    bio: { type: String },
    avatarInitials: { type: String, uppercase: true, maxlength: 3 },
    plan: {
      type: String,
      enum: ["starter", "growth", "practice"],
      default: "starter",
    },
    planCommission: { type: Number, default: 8 }, // % commission
    monthlyEarnings: { type: Number, default: 0 },
    handle: { type: String, unique: true, sparse: true, trim: true },
    experienceYears: { type: Number, default: 0 },
    sessionRate: { type: Number, default: 0 },
    availabilityText: { type: String, default: "Next slot available soon" },
  },
  { timestamps: true }
)

module.exports = mongoose.model("PractitionerProfile", practitionerProfileSchema)
