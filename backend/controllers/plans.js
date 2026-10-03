const PlanConfig = require("../models/PlanConfig")

const DEFAULT_PLANS = [
  {
    planKey: "open",
    name: "Open",
    tagline: "Start your practice. We start bringing mentees.",
    monthlyFee: 0,
    commissionPercentage: 10,
    features: [
      "Flat 10% on every booking — your link or ours",
      "Growth Hand onboarding: profile & positioning review",
      "Listed in OpenHand mentee discovery",
      "1:1, group sessions, webinars & packages",
      "Built-in HD Session Room",
      "Verified Practitioner badge",
      "72-hour working day payouts (UPI / bank)",
    ],
  },
  {
    planKey: "pro",
    name: "Pro",
    tagline: "A growth partner working on your practice every month.",
    monthlyFee: 999,
    yearlyFee: 9588,
    commissionPercentage: 5,
    features: [
      "Everything in Open — commission drops to 5%",
      "Monthly growth review with an OpenHand mentor",
      "Priority mentee matching & featured placement",
      "Visibility campaigns: spotlights, collaborations, events",
      "Programs, cohorts & memberships",
      "AI session notes & client progress insights",
      "Custom domain & white-label booking page",
    ],
  },
  {
    planKey: "institution",
    name: "Institution",
    tagline: "Academies, colleges & coaching firms.",
    monthlyFee: 0,
    commissionPercentage: 0,
    features: [
      "Everything in Pro",
      "Custom commission — as low as 0%",
      "Dedicated growth & success manager",
      "Multi-practitioner teams & roles",
      "LMS, certification & cohort workflows",
      "API, SSO & data export",
    ],
  },
]

exports.getPlans = async (req, res) => {
  try {
    let plans = await PlanConfig.find()
    if (plans.length === 0) {
      plans = await PlanConfig.insertMany(DEFAULT_PLANS)
    } else {
      for (const def of DEFAULT_PLANS) {
        await PlanConfig.findOneAndUpdate(
          { planKey: def.planKey },
          {
            name: def.name,
            tagline: def.tagline,
            monthlyFee: def.monthlyFee,
            features: def.features,
          },
          { upsert: true }
        )
      }
      plans = await PlanConfig.find()
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

const { getRazorpayInstance, getRazorpayKeys } = require("../config/razorpay")
const crypto = require("crypto")
const User = require("../models/User")

const PLAN_DETAILS = {
  open: { price: 0, name: "Open Plan", buttonId: "pl_open" },
  pro: { price: 999, name: "Pro Plan", buttonId: "pl_pro_monthly" },
  pro_monthly: { price: 999, name: "Pro Plan (Monthly)", buttonId: "pl_pro_monthly" },
  pro_yearly: { price: 9588, name: "Pro Plan (Yearly)", buttonId: "pl_pro_yearly" },
  pro_annual: { price: 9588, name: "Pro Plan (Yearly)", buttonId: "pl_pro_yearly" },
  // Backward compatibility
  starter: { price: 999, name: "Pro Plan", buttonId: "pl_pro_monthly" },
  growth: { price: 999, name: "Pro Plan", buttonId: "pl_pro_monthly" },
  master: { price: 9588, name: "Pro Plan (Yearly)", buttonId: "pl_pro_yearly" },
}

exports.createPlanOrder = async (req, res) => {
  try {
    const { planKey = "pro_monthly" } = req.body
    const keyLower = planKey.toLowerCase()
    const planInfo = PLAN_DETAILS[keyLower] || PLAN_DETAILS.pro_monthly
    const amountInPaise = planInfo.price * 100

    const { key_id } = getRazorpayKeys()
    const instance = getRazorpayInstance()

    const options = {
      amount: amountInPaise,
      currency: "INR",
      receipt: `plan_rcpt_${keyLower}_${Date.now()}`,
      notes: {
        planKey: keyLower,
        planName: planInfo.name,
      },
    }

    const order = await instance.orders.create(options)

    return res.status(200).json({
      success: true,
      order,
      key: key_id,
      amount: planInfo.price,
      planKey: keyLower,
      planName: planInfo.name,
      buttonId: planInfo.buttonId,
    })
  } catch (error) {
    console.error("createPlanOrder error:", error)
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to create Razorpay plan order",
    })
  }
}

exports.verifyPlanPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      planKey = "pro_monthly",
    } = req.body

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Missing Razorpay payment verification parameters",
      })
    }

    const { key_secret } = getRazorpayKeys()
    const generated_signature = crypto
      .createHmac("sha256", key_secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex")

    if (generated_signature === razorpay_signature) {
      const planPrices = {
        open: 0,
        pro: 999,
        pro_monthly: 999,
        pro_yearly: 9588,
        pro_annual: 9588,
        starter: 999,
        growth: 999,
        master: 9588,
      }
      const planNames = {
        open: "Open Plan",
        pro: "Pro Plan",
        pro_monthly: "Pro Plan (Monthly)",
        pro_yearly: "Pro Plan (Yearly)",
        pro_annual: "Pro Plan (Yearly)",
        institution: "Institution Plan",
        starter: "Pro Plan",
        growth: "Pro Plan",
        master: "Pro Plan (Yearly)",
      }
      const keyLower = planKey.toLowerCase()
      const amount = planPrices[keyLower] || 999

      if (req.user?.id) {
        await User.findByIdAndUpdate(req.user.id, {
          activePlan: keyLower,
        })

        try {
          const Subscription = require("../models/Subscription")
          const AdminPaymentLog = require("../models/AdminPaymentLog")

          await Subscription.updateMany({ client: req.user.id, status: "active" }, { status: "expired" })

          const startDate = new Date()
          const endDate = new Date()
          if (keyLower.includes("yearly") || keyLower.includes("annual")) {
            endDate.setFullYear(endDate.getFullYear() + 1)
          } else {
            endDate.setMonth(endDate.getMonth() + 1)
          }

          const sub = await Subscription.create({
            client: req.user.id,
            planKey: keyLower,
            planName: planNames[keyLower] || keyLower,
            amount,
            status: "active",
            startDate,
            endDate,
            paymentGateway: "razorpay",
            razorpayOrderId: razorpay_order_id,
            razorpayPaymentId: razorpay_payment_id,
          })

          const clientUser = await User.findById(req.user.id).select("firstName lastName")
          const adminLog = await AdminPaymentLog.create({
            paymentType: "subscription",
            client: req.user.id,
            clientName: clientUser ? `${clientUser.firstName} ${clientUser.lastName}` : "Client",
            description: `${planNames[keyLower] || keyLower} Subscription`,
            planKey: keyLower,
            amount,
            currency: "INR",
            amountOwedToPractitioner: 0,
            paymentGateway: "razorpay",
            razorpayOrderId: razorpay_order_id,
            razorpayPaymentId: razorpay_payment_id,
            subscriptionId: sub._id,
            status: "received",
          })

          sub.adminPaymentLog = adminLog._id
          await sub.save()
        } catch (subErr) {
          console.warn("Subscription/AdminLog creation warning in plans controller:", subErr.message)
        }
      }

      return res.status(200).json({
        success: true,
        message: `Payment successful! Welcome to the ${planNames[keyLower] || planKey}.`,
        planKey: keyLower,
      })
    } else {
      return res.status(400).json({
        success: false,
        message: "Razorpay signature verification failed",
      })
    }
  } catch (error) {
    console.error("verifyPlanPayment error:", error)
    return res.status(500).json({
      success: false,
      message: error.message || "Payment verification failed",
    })
  }
}

