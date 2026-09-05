const mongoose = require("mongoose")

const milestoneSchema = new mongoose.Schema(
  {
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    title: { type: String, required: true },
    description: { type: String },
    dayNumber: { type: Number },
    achievedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
)

module.exports = mongoose.model("Milestone", milestoneSchema)
