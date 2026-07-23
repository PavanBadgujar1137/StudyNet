const mongoose = require("mongoose")

const coPilotSuggestionSchema = new mongoose.Schema(
  {
    session: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LiveSession",
      required: true,
    },
    practitioner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    suggestionType: {
      type: String,
      enum: ["next_question", "cross_session_pattern", "matching_technique"],
      required: true,
    },
    text: { type: String, required: true },
    status: {
      type: String,
      enum: ["pending", "accepted", "dismissed"],
      default: "pending",
    },
  },
  { timestamps: true }
)

module.exports = mongoose.model("CoPilotSuggestion", coPilotSuggestionSchema)
