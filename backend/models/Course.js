const mongoose = require("mongoose")

const courseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    thumbnail: { type: String, default: "" },

    // The practitioner (user) who owns this course
    practitioner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },

    // Videos in this course (ordered)
    videos: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "CourseVideo",
      },
    ],

    // Clients who have access (subscribed clients get auto-access)
    enrolledClients: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
      },
    ],

    // Category / specialty tags
    tags: [{ type: String }],

    status: {
      type: String,
      enum: ["draft", "published"],
      default: "draft",
    },

    // Subscription plan required to access (null = free, or "starter"/"growth"/"practice")
    requiredPlan: {
      type: String,
      enum: ["starter", "growth", "practice", "master", null],
      default: null,
    },

    // Price set by practitioner (0 = Free course included in learner plans, >0 = Paid course)
    price: {
      type: Number,
      default: 0,
      min: 0,
    },
    isFree: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
)

module.exports = mongoose.model("Course", courseSchema)
