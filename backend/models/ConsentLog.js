const mongoose = require("mongoose")

const consentLogSchema = new mongoose.Schema(
  {
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    practitioner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
    },
    consentType: {
      type: String,
      enum: ["copilot_audio", "copilot_notes"],
      required: true,
    },
    grantedAt: { type: Date, default: Date.now },
    revokedAt: { type: Date },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
)

module.exports = mongoose.model("ConsentLog", consentLogSchema)
