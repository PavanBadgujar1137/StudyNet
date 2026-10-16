const mongoose = require("mongoose")

const socialAccountSchema = new mongoose.Schema(
  {
    practitioner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    platform: {
      type: String,
      enum: ["instagram", "twitter", "linkedin", "facebook"],
      required: true,
    },
    handle: {
      type: String,
      default: "",
    },
    accountName: {
      type: String,
      default: "",
    },
    avatarUrl: {
      type: String,
      default: "",
    },
    isConnected: {
      type: Boolean,
      default: false,
    },
    isAuthorized: {
      type: Boolean,
      default: false,
    },
    accessToken: {
      type: String,
      default: "",
    },
    refreshToken: {
      type: String,
      default: "",
    },
    platformUserId: {
      type: String,
      default: "",
    },
    tokenExpiry: {
      type: Date,
    },
    connectedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
)

// Ensure unique index per practitioner per platform
socialAccountSchema.index({ practitioner: 1, platform: 1 }, { unique: true })

module.exports = mongoose.model("SocialAccount", socialAccountSchema)
