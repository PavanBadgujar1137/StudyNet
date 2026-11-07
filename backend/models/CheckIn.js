const mongoose = require("mongoose")

const checkInSchema = new mongoose.Schema(
  {
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    practitioner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
    mood: {
      type: String,
      enum: ["peaceful", "challenged", "energetic", "low", "anxious", "steady"],
      required: true,
    },
    sleepScore: { type: Number, min: 0, max: 10 },
    note: { type: String },
    isPrivate: { type: Boolean, default: false },
  },
  { timestamps: true }
)

module.exports = mongoose.model("CheckIn", checkInSchema)
