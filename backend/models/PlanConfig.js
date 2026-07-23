const mongoose = require("mongoose")

const planConfigSchema = new mongoose.Schema(
  {
    planKey: {
      type: String,
      enum: ["starter", "growth", "practice"],
      required: true,
      unique: true,
    },
    name: { type: String, required: true },
    tagline: { type: String },
    monthlyFee: { type: Number, required: true }, // 0, 1499, 4999
    commissionPercentage: { type: Number, required: true }, // 8, 5, 0
    features: [{ type: String }],
    defaultMembershipPrice: { type: Number, default: 799 }, // dynamic membership price
    nudgeThresholdEarnings: { type: Number, default: 40000 },
  },
  { timestamps: true }
)

module.exports = mongoose.model("PlanConfig", planConfigSchema)
