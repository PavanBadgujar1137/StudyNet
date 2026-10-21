const mongoose = require("mongoose")

const liveSessionSchema = new mongoose.Schema(
  {
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
    },
    cohort: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CircleCohort",
    },
    practitioner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    title: { type: String, required: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date },
    status: {
      type: String,
      enum: ["scheduled", "live", "ended"],
      default: "scheduled",
    },
    roomUrl: { type: String },
  },
  { timestamps: true }
)

module.exports = mongoose.model("LiveSession", liveSessionSchema)
