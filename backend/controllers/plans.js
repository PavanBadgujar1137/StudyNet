const PlanConfig = require("../models/PlanConfig")

const DEFAULT_PLANS = [
  {
    planKey: "starter",
    name: "Starter Plan",
    tagline: "For individuals starting their personal wellness & mental health journey.",
    monthlyFee: 999,
    commissionPercentage: 0,
    defaultMembershipPrice: 799,
    razorpayButtonId: "pl_TIp5rKJwNIOFhi",
    features: [
      "Access to core practitioner courses & library",
      "1 Monthly group circle pass included",
      "Daily mood check-ins & guided reflection prompts",
      "Personal AI health & reflection assistant (AURA)",
      "Standard 1:1 session booking access",
      "Secure digital health record vault",
    ],
  },
  {
    planKey: "growth",
    name: "Growth Plan",
    tagline: "For active wellness seekers wanting full access to courses, circles, and session discounts.",
    monthlyFee: 2999,
    commissionPercentage: 0,
    defaultMembershipPrice: 799,
    razorpayButtonId: "pl_TIpGvgepbsigNC",
    features: [
      "Everything in Starter",
      "Unlimited access to ALL practitioner courses & cohorts",
      "Unlimited access to live group circles",
      "15% discount on all 1:1 sessions with verified practitioners",
      "Live in-session AURA companion & real-time insights",
      "Priority session scheduling & waitlist bypass",
      "Monthly companion pass (gift 1 session/circle pass)",
    ],
  },
  {
    planKey: "master",
    name: "Master VIP Plan",
    tagline: "For complete wellbeing coverage with dedicated care, free monthly session, and VIP perks.",
    monthlyFee: 5999,
    commissionPercentage: 0,
    defaultMembershipPrice: 799,
    razorpayButtonId: "pl_TIpJ8iM19tFFtf",
    features: [
      "Everything in Growth",
      "1 Free 1:1 private session included per month",
      "25% discount on all additional 1:1 practitioner sessions",
      "Dedicated personal care manager & concierge support",
      "Family sharing (up to 3 family sub-accounts included)",
      "Custom wellness path & advanced biometric analytics",
      "24/7 Priority health helpline & instant AURA access",
    ],
  },
]


exports.getPlans = async (req, res) => {
  try {
    let plans = await PlanConfig.find()
    if (plans.length === 0) {
      plans = await PlanConfig.insertMany(DEFAULT_PLANS)
    } else {
      // Sync client-focused details into DB documents
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
  beginner: { price: 51, name: "Beginner Plan", buttonId: "pl_beginner" },
  advance: { price: 151, name: "Advance Plan", buttonId: "pl_advance" },
  champion: { price: 1500, name: "Champion Plan", buttonId: "pl_champion" },
  starter: { price: 999, name: "Starter Plan", buttonId: "pl_TIp5rKJwNIOFhi" },
  growth: { price: 2999, name: "Growth Plan", buttonId: "pl_TIpGvgepbsigNC" },
  master: { price: 5999, name: "Master Plan", buttonId: "pl_TIpJ8iM19tFFtf" },
}

exports.createPlanOrder = async (req, res) => {
  try {
    const { planKey = "starter" } = req.body
    const keyLower = planKey.toLowerCase()
    const planInfo = PLAN_DETAILS[keyLower] || PLAN_DETAILS.starter
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
      planKey = "starter",
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
      const planPrices = { starter: 999, growth: 2999, practice: 5999, master: 9999 }
      const planNames = { starter: "Starter Plan", growth: "Growth Plan", practice: "Practice Plan", master: "Master Plan" }
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
          endDate.setMonth(endDate.getMonth() + 1)

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
        message: `Payment successful! Welcome to the ${planKey} plan.`,
        planKey,
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

