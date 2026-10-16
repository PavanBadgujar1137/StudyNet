const mongoose = require("mongoose")

const referralCreditSchema = new mongoose.Schema(
  {
    referrer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    referredUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    amount: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "credited", "expired"],
      default: "pending",
    },
  },
  { timestamps: true }
)

module.exports = mongoose.model("ReferralCredit", referralCreditSchema)
