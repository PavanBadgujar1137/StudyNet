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
    adminVerifiedRating: { type: Number, default: null },
    verifiedRatingCount: { type: Number, default: 0 },
    rating: { type: Number, default: null },
    viewCount: { type: Number, default: 0 }, // Used for ranking based on profile views
    badges: {
      type: [String],
      default: [
        "openhand-verified",
        "master-practitioner",
        "peoples-choice",
        "trusted-guide",
        "community-maker",
      ],
    },

    // Payout & Bank Details for Admin Salary Transfer (Domestic & Worldwide International)
    payoutCountry: { type: String, default: "India", trim: true },
    payoutMethod: { type: String, default: "bank", trim: true }, // "bank", "iban", "stripe", "paypal", "upi"
    bankAccountName: { type: String, trim: true },
    bankAccountNumber: { type: String, trim: true },
    bankIfscCode: { type: String, trim: true, uppercase: true },
    bankName: { type: String, trim: true },
    bankIban: { type: String, trim: true, uppercase: true },
    bankSwiftBic: { type: String, trim: true, uppercase: true },
    bankCity: { type: String, trim: true },
    upiId: { type: String, trim: true },
    stripeAccountId: { type: String, trim: true },
    paypalEmail: { type: String, trim: true, lowercase: true },
    // Intake Questionnaire Customization (Stage 02)
    intakeQuestions: {
      type: [String],
      default: [
        "What brought you to this session today?",
        "What have you tried so far to address this?",
        "What is your primary goal for our work together?",
        "How would you rate your current stress or burnout level (1-10)?",
        "Are there specific topics or boundaries you want to focus on?",
        "What outcome would make this journey a success for you in 6 weeks?",
      ],
    },
  },
  { timestamps: true }
)

module.exports = mongoose.model("PractitionerProfile", practitionerProfileSchema)
