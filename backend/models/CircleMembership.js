const mongoose = require("mongoose")

const circleMembershipSchema = new mongoose.Schema(
  {
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    cohort: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CircleCohort",
      required: true,
    },
    role: {
      type: String,
      enum: ["member", "peer_lead"],
      default: "member",
    },
    joinedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
)

module.exports = mongoose.model("CircleMembership", circleMembershipSchema)
