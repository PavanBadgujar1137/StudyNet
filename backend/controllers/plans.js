const PlanConfig = require("../models/PlanConfig")

const DEFAULT_PLANS = [
  {
    planKey: "starter",
    name: "Starter Plan",
    tagline: "For practitioners starting & building their online therapy or coaching practice.",
    monthlyFee: 999,
    commissionPercentage: 0,
    defaultMembershipPrice: 799,
    razorpayButtonId: "pl_TIp5rKJwNIOFhi",
    features: [
      "Publish 1:1 session offers & free/paid courses",
      "Host 1 live private group circle",
      "Standard directory listing & client booking link",
      "Client mood check-in tracking & notes",
      "Post-session transcript & clinical note draft",
      "Razorpay direct payment gateway integration",
    ],
  },
  {
    planKey: "growth",
    name: "Growth Plan",
    tagline: "Full suite to scale your practice with unlimited circles, custom cohorts, and automations.",
    monthlyFee: 2999,
    commissionPercentage: 0,
    defaultMembershipPrice: 799,
    razorpayButtonId: "pl_TIpGvgepbsigNC",
    features: [
      "Everything in Starter Plan",
      "Unlimited live group circles & custom cohorts",
      "Unlimited course publishing (free & paid pricing)",
      "Automated client check-in & reflection sequences",
      "Priority directory placement & verified badge",
      "Custom branding & companion passes for clients",
    ],
  },
  {
    planKey: "master",
    name: "Master VIP Plan",
    tagline: "For established clinics and high-volume practitioners seeking maximum growth.",
    monthlyFee: 5999,
    commissionPercentage: 0,
    defaultMembershipPrice: 799,
    razorpayButtonId: "pl_TIpJ8iM19tFFtf",
    features: [
      "Everything in Growth Plan",
      "VIP clinic profile & multi-practitioner account support",
      "Dedicated account manager & 24/7 technical support",
      "Custom API & EHR integration support",
      "Zero platform commission on all booking transactions",
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
  starter: { price: 999, name: "Starter Plan", buttonId: "pl_TIp5rKJwNIOFhi" },
  growth: { price: 2999, name: "Growth Plan", buttonId: "pl_TIpGvgepbsigNC" },
  practice: { price: 5999, name: "Practice Plan", buttonId: "pl_TIpJ8iM19tFFtf" },
  master: { price: 5999, name: "Master VIP Plan", buttonId: "pl_TIpJ8iM19tFFtf" },
  pro_monthly: { price: 6000, name: "Practitioner Pro (Monthly)", buttonId: "pl_TIp5rKJwNIOFhi" },
  pro_annual: { price: 50000, name: "Practitioner Pro (Annual)", buttonId: "pl_TIpGvgepbsigNC" },
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
      const planPrices = {
        starter: 999,
        growth: 2999,
        practice: 5999,
        master: 5999,
        pro_monthly: 6000,
        pro_annual: 50000,
      }
      const planNames = {
        starter: "Starter Plan",
        growth: "Growth Plan",
        practice: "Practice Plan",
        master: "Master VIP Plan",
        pro_monthly: "Practitioner Pro (Monthly)",
        pro_annual: "Practitioner Pro (Annual)",
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

