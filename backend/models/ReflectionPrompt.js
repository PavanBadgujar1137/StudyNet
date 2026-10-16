const mongoose = require("mongoose")

const reflectionPromptSchema = new mongoose.Schema(
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
    promptText: { type: String, required: true },
    answerText: { type: String },
    isPrivate: { type: Boolean, default: false }, // "Keep private"
    status: {
      type: String,
      enum: ["pending", "answered", "skipped"],
      default: "pending",
    },
    answeredAt: { type: Date },
  },
  { timestamps: true }
)

module.exports = mongoose.model("ReflectionPrompt", reflectionPromptSchema)
