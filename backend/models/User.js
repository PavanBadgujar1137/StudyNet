// Import the Mongoose library
const mongoose = require("mongoose")

// Define the user schema using the Mongoose Schema constructor
const userSchema = new mongoose.Schema(
  {
    // Define the name field with type String, required, and trimmed
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    // Define the email field with type String, required, and trimmed
    email: {
      type: String,
      required: true,
      trim: true,
    },

    // Define the password field with type String and required
    password: {
      type: String,
      required: true,
    },
    // OpenHand account types (with backward compatible Student & Instructor)
    accountType: {
      type: String,
      enum: ["Admin", "Client", "Learner", "Practitioner", "OrgAdmin", "Student", "Instructor"],
      required: true,
    },
    active: {
      type: Boolean,
      default: true,
    },
    approved: {
      type: Boolean,
      default: true,
    },
    additionalDetails: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Profile",
    },
    practitionerProfile: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PractitionerProfile",
    },
    circleMemberships: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "CircleMembership",
      },
    ],
    courses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
      },
    ],
    token: {
      type: String,
    },
    resetPasswordExpires: {
      type: Date,
    },
    image: {
      type: String,
    },
    courseProgress: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "courseProgress",
      },
    ],
    // Phase 1: batch enrollments
    enrolledBatches: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Batch",
      },
    ],
    // 7-day free trial & plan tracking
    trialStartedAt: {
      type: Date,
      default: Date.now,
    },
    trialExpiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
    activePlan: {
      type: String,
      enum: ["trial", "starter", "growth", "practice", "master", "none"],
      default: "trial",
    },
  },
  { timestamps: true }
)

// Export the Mongoose model for the user schema, using the name "user"
module.exports = mongoose.model("user", userSchema)
