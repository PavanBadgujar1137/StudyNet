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

const { createPayCollectOrder, verifyPayGlocalPayment, getPayGlocalConfig } = require("../config/payglocal")
const crypto = require("crypto")
const mongoose = require("mongoose")
const User = require("../models/User")
const {
  recordPaymentOrder,
  findPaymentOrder,
  assertOrderAccess,
  assertOrderResourceBinding,
  consumePaymentOrder,
  markOrderFulfilled,
  isOrderFulfilled,
} = require("../utils/paymentOrders")

const requireVerifiedPlanOrder = async ({
  req,
  merchantTxnId,
  gid,
  token,
  signature,
  expectedKind,
  expectedPlanKey,
}) => {
  const order = await findPaymentOrder({ merchantTxnId, gid })
  const access = assertOrderAccess(order, req.user?.id)
  if (!access.ok) {
    return { ok: false, status: access.status, message: access.message }
  }
  const binding = assertOrderResourceBinding(order, {
    expectedKind,
    expectedPlanKey,
  })
  if (!binding.ok) {
    return { ok: false, status: binding.status, message: binding.message }
  }
  const verifyRes = await verifyPayGlocalPayment({
    gid: order.gid || gid,
    merchantTxnId: order.merchantTxnId,
    orderId: order.merchantTxnId,
    paymentId: order.gid || gid,
    token,
    signature,
    statusUrl: order.statusUrl,
    expectedAmount: order.amount,
    expectedCurrency: order.currency || "INR",
  })
  if (!verifyRes?.success) {
    return {
      ok: false,
      status: 400,
      message: verifyRes?.message || "PayGlocal payment verification failed",
    }
  }
  const consumed = await consumePaymentOrder(order.merchantTxnId)
  if (!consumed.order) {
    return { ok: false, status: 400, message: "Payment order could not be finalized" }
  }
  return { ok: true, order: consumed.order, first: consumed.first, verifyRes }
}

const PLAN_DETAILS = {
  open: { price: 0, name: "Open Plan", buttonId: "pl_open" },
  pro: { price: 9588, name: "Pro Plan (Yearly)", buttonId: "pl_pro_yearly" },
  pro_monthly: { price: 999, name: "Pro Plan (Monthly)", buttonId: "pl_pro_monthly" },
  pro_yearly: { price: 9588, name: "Pro Plan (Yearly)", buttonId: "pl_pro_yearly" },
  pro_annual: { price: 9588, name: "Pro Plan (Yearly)", buttonId: "pl_pro_yearly" },
  // Backward compatibility
  starter: { price: 999, name: "Pro Plan (Monthly)", buttonId: "pl_pro_monthly" },
  growth: { price: 9588, name: "Pro Plan (Yearly)", buttonId: "pl_pro_yearly" },
  master: { price: 9588, name: "Pro Plan (Yearly)", buttonId: "pl_pro_yearly" },
}

exports.createPlanOrder = async (req, res) => {
  try {
    const { planKey = "pro_monthly" } = req.body
    const keyLower = planKey.toLowerCase()
    const planInfo = PLAN_DETAILS[keyLower] || PLAN_DETAILS.pro_monthly
    const user = req.user ? await User.findById(req.user.id).select("firstName lastName email contactNumber") : null

    if (!PLAN_DETAILS[keyLower]) {
      return res.status(400).json({ success: false, message: "Invalid plan key" })
    }

    const order = await createPayCollectOrder({
      merchantTxnId: `plan_rcpt_${keyLower}_${Date.now()}`,
      amount: planInfo.price,
      currency: "INR",
      customer: {
        email: user?.email,
        firstName: user?.firstName,
        lastName: user?.lastName,
        contactNumber: user?.contactNumber,
      },
      notes: {
        planKey: keyLower,
        planName: planInfo.name,
      },
    })

    await recordPaymentOrder({
      merchantTxnId: order.merchantTxnId,
      gid: order.gid || "",
      userId: req.user?.id || null,
      kind: "plan",
      amount: planInfo.price,
      currency: "INR",
      planKey: keyLower,
      statusUrl: order.statusUrl || "",
      metadata: { planName: planInfo.name },
    })

    return res.status(200).json({
      success: true,
      order,
      gid: order.gid,
      merchantTxnId: order.merchantTxnId,
      redirectUrl: order.redirectUrl,
      key: order.keyId,
      amount: planInfo.price,
      planKey: keyLower,
      planName: planInfo.name,
      buttonId: planInfo.buttonId,
      gateway: "payglocal",
    })
  } catch (error) {
    console.error("createPlanOrder error:", error)
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to create PayGlocal plan order",
    })
  }
}

exports.verifyPlanPayment = async (req, res) => {
  try {
    const {
      payglocal_order_id,
      payglocal_payment_id,
      payglocal_gid,
      merchantTxnId,
      gid,
      signature,
      token,
    } = req.body

    const effectiveOrderId = payglocal_order_id || merchantTxnId
    const effectivePaymentId = payglocal_payment_id || gid || payglocal_gid

    if (!effectiveOrderId && !effectivePaymentId) {
      return res.status(400).json({
        success: false,
        message: "Missing PayGlocal payment verification parameters",
      })
    }

    const verified = await requireVerifiedPlanOrder({
      req,
      merchantTxnId: effectiveOrderId,
      gid: effectivePaymentId,
      token,
      signature,
      expectedKind: "plan",
      expectedPlanKey: req.body.planKey,
    })
    if (!verified.ok) {
      return res.status(verified.status).json({
        success: false,
        message: verified.message,
      })
    }
    const Subscription = require("../models/Subscription")
    const AdminPaymentLog = require("../models/AdminPaymentLog")
    const keyLower = String(verified.order.planKey || "pro_monthly").toLowerCase()

    let user = req.user?.id ? await User.findById(req.user.id).select("activePlan firstName lastName email") : null
    let existingSub = await Subscription.findOne({ payglocalOrderId: effectiveOrderId })
    let existingLog = await AdminPaymentLog.findOne({ payglocalOrderId: effectiveOrderId })

    const isFullyFulfilled =
      user?.activePlan === keyLower &&
      Boolean(existingSub) &&
      Boolean(existingLog)

    if (isFullyFulfilled && verified.order.fulfilled) {
      return res.status(200).json({
        success: true,
        message: "Payment was already confirmed",
        planKey: verified.order.planKey,
        replayed: true,
      })
    }

    const verifyRes = verified.verifyRes
    const planPrices = {
      open: 0,
      pro: 9588,
      pro_monthly: 999,
      pro_yearly: 9588,
      pro_annual: 9588,
      starter: 999,
      growth: 9588,
      master: 9588,
    }
    const planNames = {
      open: "Open Plan",
      pro: "Pro Plan (Yearly)",
      pro_monthly: "Pro Plan (Monthly)",
      pro_yearly: "Pro Plan (Yearly)",
      pro_annual: "Pro Plan (Yearly)",
      institution: "Institution Plan",
      starter: "Pro Plan (Monthly)",
      growth: "Pro Plan (Yearly)",
      master: "Pro Plan (Yearly)",
    }
    const keyLower = String(verified.order.planKey || "pro_monthly").toLowerCase()
    const amount = verified.order.amount ?? planPrices[keyLower] ?? 0

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

        let sub = await Subscription.findOne({ payglocalOrderId: effectiveOrderId })
        if (!sub) {
          try {
            sub = await Subscription.create({
              client: req.user.id,
              planKey: keyLower,
              planName: planNames[keyLower] || keyLower,
              amount,
              status: "active",
              startDate,
              endDate,
              paymentGateway: "payglocal",
              payglocalOrderId: effectiveOrderId,
              payglocalPaymentId: effectivePaymentId,
              payglocalGid: verifyRes.gid || effectivePaymentId,
            })
          } catch (subErr) {
            if (subErr.code === 11000) {
              sub = await Subscription.findOne({ payglocalOrderId: effectiveOrderId })
            } else {
              throw subErr
            }
          }
        }

        let adminLog = await AdminPaymentLog.findOne({ payglocalOrderId: effectiveOrderId })
        if (!adminLog) {
          const clientUser = await User.findById(req.user.id).select("firstName lastName")
          try {
            adminLog = await AdminPaymentLog.create({
              paymentType: "subscription",
              client: req.user.id,
              clientName: clientUser ? `${clientUser.firstName} ${clientUser.lastName}` : "Client",
              description: `${planNames[keyLower] || keyLower} Subscription`,
              planKey: keyLower,
              amount,
              currency: "INR",
              amountOwedToPractitioner: 0,
              paymentGateway: "payglocal",
              payglocalOrderId: effectiveOrderId,
              payglocalPaymentId: effectivePaymentId,
              payglocalGid: verifyRes.gid || effectivePaymentId,
              subscriptionId: sub?._id,
              status: "received",
            })
          } catch (logErr) {
            if (logErr.code === 11000) {
              adminLog = await AdminPaymentLog.findOne({ payglocalOrderId: effectiveOrderId })
            } else {
              throw logErr
            }
          }
        }

        if (sub && !sub.adminPaymentLog && adminLog) {
          sub.adminPaymentLog = adminLog._id
          await sub.save()
        }
      } catch (subErr) {
        console.warn("Subscription/AdminLog creation warning in plans controller:", subErr.message)
      }
    }

    await markOrderFulfilled(effectiveOrderId, { planKey: keyLower })

    return res.status(200).json({
      success: true,
      message: `Payment successful! Welcome to the ${planNames[keyLower] || planKey}.`,
      planKey: keyLower,
    })
  } catch (error) {
    console.error("verifyPlanPayment error:", error)
    return res.status(500).json({
      success: false,
      message: error.message || "Payment verification failed",
    })
  }
}

// ─── 4. CREATE PRACTITIONER CALL + SUBSCRIPTION ORDER ────────────────────────
exports.createSubscriptionCallOrder = async (req, res) => {
  try {
    const {
      planKey = "pro_yearly",
      scheduledDate,
      scheduledTimeSlot,
      timezone = "Asia/Kolkata (IST)",
      modality = "General Practice",
      goals = "",
      practitionerName = "",
      practitionerEmail = "",
      practitionerPhone = "",
      whatsappNumber = "",
      socialProfileLink = "",
      referralSource = "",
      courseSellingStatus = "",
      otherPlatforms = "",
      paidCommunityStrength = "",
      timelineToMove = "",
      callExpectations = "",
      guests = [],
    } = req.body

    const keyLower = planKey.toLowerCase()
    const planInfo = PLAN_DETAILS[keyLower] || PLAN_DETAILS.pro_yearly

    let user = null
    if (req.user?.id) {
      user = await User.findById(req.user.id).select("firstName lastName email contactNumber")
    }

    const effectiveName = practitionerName || (user ? `${user.firstName || ""} ${user.lastName || ""}`.trim() : "Practitioner")
    const effectiveEmail = practitionerEmail || user?.email || "practitioner@openhand.live"
    const effectivePhone = whatsappNumber || practitionerPhone || user?.contactNumber || ""

    if (!PLAN_DETAILS[keyLower]) {
      return res.status(400).json({ success: false, message: "Invalid plan key" })
    }

    const order = await createPayCollectOrder({
      merchantTxnId: `call_sub_${keyLower}_${Date.now()}`,
      amount: planInfo.price,
      currency: "INR",
      customer: {
        email: effectiveEmail,
        firstName: effectiveName.split(" ")[0] || "Practitioner",
        lastName: effectiveName.split(" ").slice(1).join(" ") || "",
        contactNumber: effectivePhone,
      },
      notes: {
        planKey: keyLower,
        planName: planInfo.name,
        scheduledDate: scheduledDate || "",
        scheduledTimeSlot: scheduledTimeSlot || "",
        timezone: timezone || "Asia/Kolkata (IST)",
        modality: modality || "",
        goals: goals || callExpectations || "",
        practitionerName: effectiveName,
        practitionerEmail: effectiveEmail,
        whatsappNumber: effectivePhone,
        socialProfileLink: socialProfileLink || "",
        referralSource: referralSource || "",
        paidCommunityStrength: paidCommunityStrength || "",
      },
    })

    await recordPaymentOrder({
      merchantTxnId: order.merchantTxnId,
      gid: order.gid || "",
      userId: req.user?.id || null,
      kind: "subscription_call",
      amount: planInfo.price,
      currency: "INR",
      planKey: keyLower,
      statusUrl: order.statusUrl || "",
      metadata: {
        planName: planInfo.name,
        practitionerEmail: effectiveEmail,
        practitionerName: effectiveName,
        scheduledDate: scheduledDate || "",
        scheduledTimeSlot: scheduledTimeSlot || "",
      },
    })

    return res.status(200).json({
      success: true,
      order,
      gid: order.gid,
      merchantTxnId: order.merchantTxnId,
      redirectUrl: order.redirectUrl,
      key: order.keyId,
      amount: planInfo.price,
      planKey: keyLower,
      planName: planInfo.name,
      buttonId: planInfo.buttonId,
      gateway: "payglocal",
    })
  } catch (error) {
    console.error("createSubscriptionCallOrder error:", error)
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to initialize PayGlocal call subscription order",
    })
  }
}

// ─── 5. VERIFY PRACTITIONER CALL + SUBSCRIPTION PAYMENT ──────────────────────
exports.verifySubscriptionCallOrder = async (req, res) => {
  try {
    const {
      payglocal_order_id,
      payglocal_payment_id,
      payglocal_gid,
      merchantTxnId,
      gid,
      signature,
      token,
      scheduledDate,
      scheduledTimeSlot,
      timezone = "Asia/Kolkata (IST)",
      modality = "General Practice",
      goals = "",
      practitionerName = "",
      practitionerEmail = "",
      practitionerPhone = "",
      whatsappNumber = "",
      socialProfileLink = "",
      referralSource = "",
      courseSellingStatus = "",
      otherPlatforms = "",
      paidCommunityStrength = "",
      timelineToMove = "",
      callExpectations = "",
      guests = [],
      googleCalendarEventUrl = "",
    } = req.body

    const effectiveOrderId = payglocal_order_id || merchantTxnId
    const effectivePaymentId = payglocal_payment_id || gid || payglocal_gid

    if (!effectiveOrderId && !effectivePaymentId) {
      return res.status(400).json({
        success: false,
        message: "Missing PayGlocal payment verification parameters",
      })
    }

    const verified = await requireVerifiedPlanOrder({
      req,
      merchantTxnId: effectiveOrderId,
      gid: effectivePaymentId,
      token,
      signature,
      expectedKind: "subscription_call",
    })
    if (!verified.ok) {
      return res.status(verified.status).json({
        success: false,
        message: verified.message,
      })
    }
    const SubscriptionModel = require("../models/Subscription")
    const AdminPaymentLogModel = require("../models/AdminPaymentLog")
    const PractitionerScheduleCallModel = require("../models/PractitionerScheduleCall")

    const existingCallSub = await SubscriptionModel.findOne({ payglocalOrderId: effectiveOrderId })
    const existingAdminLog = await AdminPaymentLogModel.findOne({ payglocalOrderId: effectiveOrderId })
    const existingCall = await PractitionerScheduleCallModel.findOne({ payglocalOrderId: effectiveOrderId })

    const isFullyFulfilled =
      Boolean(existingCallSub) &&
      Boolean(existingAdminLog) &&
      Boolean(existingCall)

    if (isFullyFulfilled && verified.order.fulfilled) {
      return res.status(200).json({
        success: true,
        message: "Subscription and onboarding call were already confirmed",
        replayed: true,
      })
    }

    const verifyRes = verified.verifyRes
    const keyLower = String(verified.order.planKey || "pro_yearly").toLowerCase()
    const planInfo = PLAN_DETAILS[keyLower] || PLAN_DETAILS.pro_yearly
    const amount = verified.order.amount ?? planInfo.price
    const trustedEmail = verified.order.metadata?.practitionerEmail || ""

    // Find or link user
    let user = null
    if (req.user?.id) {
      user = await User.findById(req.user.id)
    } else if (trustedEmail) {
      user = await User.findOne({ email: String(trustedEmail).toLowerCase().trim() })
    }

    const effectiveName = verified.order.metadata?.practitionerName || practitionerName || (user ? `${user.firstName || ""} ${user.lastName || ""}`.trim() : "Practitioner")
    const effectiveEmail = trustedEmail || user?.email || ""
    const effectivePhone = whatsappNumber || practitionerPhone || user?.contactNumber || ""

    // If user does not exist yet, create a practitioner account
    if (!user && trustedEmail) {
      try {
        const Profile = require("../models/Profile")
        const nameParts = effectiveName.split(" ")
        const fName = nameParts[0] || "Practitioner"
        const lName = nameParts.slice(1).join(" ") || "Member"
        const profileDetails = await Profile.create({
          gender: null,
          dateOfBirth: null,
          about: `Practitioner subscribed to ${planInfo.name}. Discovery session scheduled for ${scheduledDate}`,
          contactNumber: effectivePhone,
        })
        user = await User.create({
          firstName: fName,
          lastName: lName,
          email: String(trustedEmail).toLowerCase().trim(),
          contactNumber: effectivePhone,
          accountType: "Practitioner",
          activePlan: keyLower,
          additionalDetails: profileDetails._id,
          image: "",
        })
      } catch (userCreateErr) {
        console.warn("Could not auto-create user for guest practitioner:", userCreateErr.message)
      }
    }

    const effectiveUserId = user?._id || req.user?.id

    const startDate = new Date()
    const endDate = new Date()
    endDate.setFullYear(endDate.getFullYear() + 1) // 1-year yearly subscription

    // 1. Upgrade user if account exists
    if (user) {
      user.activePlan = keyLower
      user.accountType = "Practitioner"
      user.trialExpiresAt = endDate // Set full 1-year expiration on user model
      if (!user.contactNumber && effectivePhone) user.contactNumber = effectivePhone
      await user.save()
    }

    // 2. Create 1-Year Subscription Record
    const Subscription = require("../models/Subscription")
    const AdminPaymentLog = require("../models/AdminPaymentLog")
    const PractitionerScheduleCall = require("../models/PractitionerScheduleCall")
    const mailSender = require("../utils/mailSender")
    const { practitionerCallScheduledEmail } = require("../mail/templates/practitionerCallScheduledEmail")
    const { adminCallAlertEmail } = require("../mail/templates/adminCallAlertEmail")
    const { parseSlotToDate } = require("../services/meetingReminderService")

    if (effectiveUserId) {
      await Subscription.updateMany({ client: effectiveUserId, status: "active" }, { status: "expired" })
    }

    let sub = await Subscription.findOne({ payglocalOrderId: effectiveOrderId })
    if (!sub) {
      sub = await Subscription.create({
        client: effectiveUserId || new mongoose.Types.ObjectId(),
        planKey: keyLower,
        planName: planInfo.name,
        amount,
        status: "active",
        startDate,
        endDate,
        paymentGateway: "payglocal",
        payglocalOrderId: effectiveOrderId,
        payglocalPaymentId: effectivePaymentId,
        payglocalGid: verifyRes.gid || effectivePaymentId,
      })
    }

    // 3. Create Admin Payment Ledger Log (central OpenHand account revenue)
    let adminLog = await AdminPaymentLog.findOne({ payglocalOrderId: effectiveOrderId })
    if (!adminLog) {
      adminLog = await AdminPaymentLog.create({
        paymentType: "subscription",
        client: effectiveUserId || null,
        clientName: effectiveName,
        description: `Yearly Practitioner Subscription & Onboarding Call: ${planInfo.name}`,
        planKey: keyLower,
        amount,
        currency: "INR",
        amountOwedToPractitioner: 0, // Central OpenHand account
        paymentGateway: "payglocal",
        payglocalOrderId: effectiveOrderId,
        payglocalPaymentId: effectivePaymentId,
        payglocalGid: verifyRes.gid || effectivePaymentId,
        subscriptionId: sub._id,
        status: "received",
      })
    }

    sub.adminPaymentLog = adminLog._id
    await sub.save()

    // 4. Create PractitionerScheduleCall Record
    // Use configured persistent room if provided in environment, otherwise leave for admin assignment
    const configuredMeetLink = process.env.OPENHAND_DISCOVERY_MEET_LINK ? process.env.OPENHAND_DISCOVERY_MEET_LINK.trim() : null
    const effectiveMeetLink = configuredMeetLink || null
    const initialCallStatus = effectiveMeetLink ? "call_link_sent" : "scheduled"

    const parsedScheduledDateTime = parseSlotToDate(scheduledDate, scheduledTimeSlot)
    const guestList = Array.isArray(guests)
      ? guests.filter(Boolean)
      : typeof guests === "string" && guests.trim()
      ? guests.split(",").map((g) => g.trim()).filter(Boolean)
      : []

    const scheduleCall = await PractitionerScheduleCall.create({
      practitioner: effectiveUserId || sub.client,
      practitionerName: effectiveName,
      practitionerEmail: effectiveEmail,
      practitionerPhone: effectivePhone,
      whatsappNumber: effectivePhone,
      modality: modality || "General Practice",
      planKey: keyLower,
      planName: planInfo.name,
      amountPaid: amount,
      currency: "INR",
      scheduledDate: scheduledDate || new Date().toISOString().split("T")[0],
      scheduledTimeSlot: scheduledTimeSlot || "11:00 AM - 11:30 AM IST",
      timezone: timezone || "India Standard Time",
      scheduledDateTime: parsedScheduledDateTime,
      goals: callExpectations || goals || "",
      socialProfileLink: socialProfileLink || "",
      referralSource: referralSource || "",
      courseSellingStatus: courseSellingStatus || "",
      otherPlatforms: otherPlatforms || "",
      paidCommunityStrength: paidCommunityStrength || "",
      timelineToMove: timelineToMove || "",
      callExpectations: callExpectations || goals || "",
      guests: guestList,
      googleCalendarEventUrl: googleCalendarEventUrl || "",
      googleMeetLink: effectiveMeetLink,
      status: initialCallStatus,
      callLinkSentAt: effectiveMeetLink ? new Date() : null,
      paymentGateway: "payglocal",
      payglocalOrderId: effectiveOrderId,
      payglocalPaymentId: effectivePaymentId,
      payglocalGid: verifyRes.gid || effectivePaymentId,
      subscriptionId: sub._id,
      adminPaymentLog: adminLog._id,
      reminder1HourSent: false,
      reminder5MinSent: false,
    })

    // 5. Send Confirmation Email & WhatsApp to Practitioner with Google Meet Link
    try {
      await mailSender(
        effectiveEmail,
        `🎉 Confirmed: StudyNet ${planInfo.name} & 30-Minute Discovery Call Booked!`,
        practitionerCallScheduledEmail({
          name: effectiveName,
          planName: planInfo.name,
          amountPaid: amount,
          scheduledDate: scheduleCall.scheduledDate,
          scheduledTimeSlot: scheduleCall.scheduledTimeSlot,
          timezone: scheduleCall.timezone,
          googleCalendarUrl: googleCalendarEventUrl,
          googleMeetLink: effectiveMeetLink || "",
          orderId: effectiveOrderId,
          paymentId: effectivePaymentId,
        })
      )

      if (effectivePhone) {
        const { sendWhatsAppMessage } = require("../utils/whatsappSender")
        const meetWaLine = effectiveMeetLink
          ? `📹 *Google Meet Link:* ${effectiveMeetLink}`
          : `📹 *Google Meet Link:* Will be generated by host and shared prior to the session.`

        const waText = `🌿 *StudyNet — Discovery Call & Subscription Confirmed!*

Dear *${effectiveName}*,
Your *30 Minute Discovery Call* and *${planInfo.name}* subscription have been successfully booked!

📅 *Scheduled Date:* ${scheduleCall.scheduledDate}
⏰ *Time:* ${scheduleCall.scheduledTimeSlot} (${scheduleCall.timezone})
${meetWaLine}

We will remind you 1 hour and 5 minutes prior to the meeting.
We look forward to speaking with you!

Warmly,
*StudyNet Onboarding Team*`
        sendWhatsAppMessage(effectivePhone, waText).catch(e => console.warn("Practitioner WA send warning:", e.message))
      }
    } catch (emailErr) {
      console.warn("Practitioner call confirmation notification error:", emailErr.message)
    }

    // 6. Send Alert Email to Admin / Contact Team
    try {
      const adminAlertEmailAddress = process.env.ADMIN_ALERT_EMAIL || "connect@openhand.live"
      await mailSender(
        adminAlertEmailAddress,
        `📞 Alert: New Discovery Call Booked + Paid (₹${amount}) - ${effectiveName}`,
        adminCallAlertEmail({
          practitionerName: effectiveName,
          practitionerEmail: effectiveEmail,
          practitionerPhone: effectivePhone,
          whatsappNumber: effectivePhone,
          modality,
          planName: planInfo.name,
          amountPaid: amount,
          scheduledDate: scheduleCall.scheduledDate,
          scheduledTimeSlot: scheduleCall.scheduledTimeSlot,
          goals: callExpectations || goals,
          socialProfileLink,
          referralSource,
          courseSellingStatus,
          otherPlatforms,
          paidCommunityStrength,
          timelineToMove,
          callExpectations,
          guests: guestList,
          googleMeetLink: effectiveMeetLink || "",
          paymentId: effectivePaymentId,
        })
      )
    } catch (adminEmailErr) {
      console.warn("Admin call alert email error:", adminEmailErr.message)
    }

    await markOrderFulfilled(effectiveOrderId, { subscriptionId: sub?._id })

    return res.status(200).json({
      success: true,
      message: `🎉 Payment verified & Discovery Call confirmed for ${scheduleCall.scheduledDate}! Welcome to ${planInfo.name}.`,
      scheduleCall,
      subscription: sub,
      planKey: keyLower,
      user,
    })
  } catch (error) {
    console.error("verifySubscriptionCallOrder error:", error)
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to verify PayGlocal call subscription payment",
    })
  }
}


