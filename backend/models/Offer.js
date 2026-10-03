const mongoose = require("mongoose")

const offerSchema = new mongoose.Schema(
  {
    practitioner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    type: {
      type: String,
      enum: ["session", "circle", "program"],
      required: true,
    },
    title: { type: String, required: true, trim: true },
    description: { type: String },
    price: { type: Number, required: true, min: 0 },
    durationMinutes: { type: Number, default: 50 }, // for 1:1 sessions
    maxSeats: { type: Number }, // for circle
    weekCount: { type: Number }, // for circle
    program: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course", // Existing Course model acts as Program schema
    },
    status: {
      type: String,
      enum: ["draft", "published"],
      default: "draft",
    },
    tags: [{ type: String }],
  },
  { timestamps: true }
)

module.exports = mongoose.model("Offer", offerSchema)
