const mongoose = require("mongoose")

const circleCohortSchema = new mongoose.Schema(
  {
    offer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Offer",
      required: false,
    },
    practitioner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    name: { type: String, required: true },
    topic: { type: String, default: "" },
    scheduleText: { type: String, default: "Weekly Sessions" },
    startDate: { type: Date, required: false },
    endDate: { type: Date, required: false },
    status: {
      type: String,
      enum: ["forming", "active", "completed"],
      default: "forming",
    },
    seats: { type: Number, default: 10 },
    seatsFilledCount: { type: Number, default: 1 },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: "user" }],
    kanbanStage: {
      type: String,
      enum: ["forming", "active", "completed", "archived"],
      default: "forming",
    },
    feedPosts: [
      {
        author: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
        content: { type: String, required: true },
        isAnnouncement: { type: Boolean, default: false },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
)

module.exports = mongoose.model("CircleCohort", circleCohortSchema)
