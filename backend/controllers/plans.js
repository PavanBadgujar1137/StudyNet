const PlanConfig = require("../models/PlanConfig")

const DEFAULT_PLANS = [
  {
    planKey: "starter",
    name: "Starter",
    tagline: "For practitioners testing whether an online practice works at all.",
    monthlyFee: 0,
    commissionPercentage: 8,
    defaultMembershipPrice: 799,
    features: [
      "Unlimited 1:1 sessions",
      "One private circle",
      "UPI, cards, net banking, Stripe",
      "Client check-ins & reflection prompts",
      "Post-session co-pilot notes",
      "Listed in the practitioner directory",
    ],
  },
  {
    planKey: "growth",
    name: "Growth",
    tagline: "For practitioners past ₹40,000/month who want the fee to stop stinging.",
    monthlyFee: 1499,
    commissionPercentage: 5,
    defaultMembershipPrice: 799,
    features: [
      "Everything in Starter",
      "Unlimited circles & cohorts",
      "Recurring memberships",
      "Live in-session co-pilot",
      "WhatsApp reminders & broadcasts",
      "GST-ready invoices",
      "Priority placement in directory",
    ],
  },
  {
    planKey: "practice",
    name: "Practice",
    tagline: "For established practices running multiple cohorts under their own brand.",
    monthlyFee: 4999,
    commissionPercentage: 0,
    defaultMembershipPrice: 799,
    features: [
      "Everything in Growth",
      "Your own branded app (iOS + Android)",
      "Custom domain",
      "Team seats for associate practitioners",
      "Advanced client analytics",
      "Named support contact",
    ],
  },
]

exports.getPlans = async (req, res) => {
  try {
    let plans = await PlanConfig.find()
    if (plans.length === 0) {
      plans = await PlanConfig.insertMany(DEFAULT_PLANS)
    }

    return res.status(200).json({
      success: true,
      plans,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch plans configuration",
      error: error.message,
    })
  }
}
