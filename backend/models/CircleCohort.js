const mongoose = require("mongoose")

const circleCohortSchema = new mongoose.Schema(
  {
    offer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Offer",
      required: true,
    },
    practitioner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    name: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    status: {
      type: String,
      enum: ["forming", "active", "completed"],
      default: "forming",
    },
    seats: { type: Number, required: true },
    seatsFilledCount: { type: Number, default: 0 },
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
