const mongoose = require("mongoose")

const sessionNoteDraftSchema = new mongoose.Schema(
  {
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
    },
    practitioner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    rawTranscript: { type: String },
    draftNotes: { type: String, required: true },
    suggestedReflectionPrompts: [{ type: String }],
    status: {
      type: String,
      enum: ["draft", "approved", "rejected"],
      default: "draft",
    },
    approvedAt: { type: Date },
  },
  { timestamps: true }
)

module.exports = mongoose.model("SessionNoteDraft", sessionNoteDraftSchema)
