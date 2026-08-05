const mongoose = require("mongoose")

const socialPostSchema = new mongoose.Schema(
  {
    practitioner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      trim: true,
      default: "",
    },
    caption: {
      type: String,
      required: true,
      trim: true,
    },
    mediaUrl: {
      type: String,
      default: "",
    },
    platforms: [
      {
        type: String,
        enum: ["instagram", "twitter", "linkedin", "facebook"],
      },
    ],
    status: {
      type: String,
      enum: ["draft", "published", "scheduled"],
      default: "draft",
    },
    scheduledAt: {
      type: Date,
    },
    publishedAt: {
      type: Date,
    },
    metrics: {
      views: { type: Number, default: 0 },
      likes: { type: Number, default: 0 },
      shares: { type: Number, default: 0 },
    },
    webShareIntents: {
      twitter: { type: String, default: "" },
      linkedin: { type: String, default: "" },
      facebook: { type: String, default: "" },
      whatsapp: { type: String, default: "" },
    },
  },
  { timestamps: true }
)

module.exports = mongoose.model("SocialPost", socialPostSchema)
