const mongoose = require("mongoose")
const Payout = require("../models/Payout")
const User = require("../models/User")
const PractitionerProfile = require("../models/PractitionerProfile")
const AdminPaymentLog = require("../models/AdminPaymentLog")
const mailSender = require("../utils/mailSender")
const { sendWhatsAppMessage } = require("../utils/whatsappSender")
const { payoutDisbursedEmail } = require("../mail/templates/payoutDisbursedEmail")
const { payoutPendingBankEmail } = require("../mail/templates/payoutPendingBankEmail")

const FRONTEND_URL = process.env.FRONTEND_URL || "https://openhand.live"

/**
 * Checks whether the practitioner has valid bank / payout destination details.
 */
function hasValidBankDetails(profile) {
  if (!profile) return false
  const hasDomesticBank = Boolean(
    profile.bankAccountNumber && (profile.bankIfscCode || profile.bankSwiftBic)
  )
  const hasUpi = Boolean(profile.upiId && profile.upiId.includes("@"))
  const hasIban = Boolean(profile.bankIban)
  const hasStripe = Boolean(profile.stripeAccountId)
  const hasPaypal = Boolean(profile.paypalEmail)

  return hasDomesticBank || hasUpi || hasIban || hasStripe || hasPaypal
}

/**
 * Notify practitioner immediately when bank details are missing for their payout.
 */
async function notifyPendingBankDetails(practitionerId, netAmount, sourceTitle) {
  try {
    const [practitioner, profile] = await Promise.all([
      User.findById(practitionerId).select(
        "firstName lastName email contactNumber whatsappNumber additionalDetails"
      ),
      PractitionerProfile.findOne({ user: practitionerId }),
    ])

    if (!practitioner || hasValidBankDetails(profile)) return

    // Send alert email requesting bank details
    if (practitioner.email) {
      const emailHtml = payoutPendingBankEmail({
        practitionerName: `${practitioner.firstName} ${practitioner.lastName}`.trim(),
        netAmount,
        sourceTitle: sourceTitle || "Client Booking / Course Sale",
        actionUrl: `${FRONTEND_URL}/practice?tab=payouts`,
      })
      mailSender(
        practitioner.email,
        "⚠️ Action Required: Add Bank Account for 72-Hour Payout - OpenHand",
        emailHtml
      ).catch((e) => console.warn("[Autopay] Failed to send pending bank email:", e.message))
    }

    // Send WhatsApp alert
    const phone = practitioner.whatsappNumber || practitioner.contactNumber || practitioner.additionalDetails?.contactNumber
    if (phone) {
      const waMsg = `⚠️ *Action Required: Bank Account Needed for Payout*\n\nHi ${practitioner.firstName},\n\nYou have a client payment of *₹${Number(netAmount).toLocaleString("en-IN")}* for *${sourceTitle || "Client Booking/Course"}* queued for your 72-hour automated payout. Please enter your Bank or UPI details in your dashboard so your funds can be deposited directly:\n\n🔗 ${FRONTEND_URL}/practice?tab=payouts\n\n— OpenHand Financial Desk`
      sendWhatsAppMessage(phone, waMsg).catch((e) => console.warn("[Autopay] WhatsApp warning:", e.message))
    }
  } catch (alertErr) {
    console.warn("[Autopay] Alert dispatch error:", alertErr.message)
  }
}

/**
 * Mask account number for security (e.g. •••• 4321)
 */
function maskAccountNumber(acc) {
  if (!acc) return null
  const str = String(acc).trim()
  if (str.length <= 4) return `•••• ${str}`
  return `•••• ${str.slice(-4)}`
}

/**
 * Executes direct bank payout for a specific Payout record.
 * Handles validation, simulated/gateway bank transfer, ledger logging, and notifications.
 */
async function executeAutopayForPayout(payoutId, processedBy = "autopay_scheduler") {
  try {
    const payout = await Payout.findById(payoutId)
    if (!payout) {
      return { success: false, reason: "payout_not_found" }
    }

    if (payout.status === "settled") {
      return { success: true, message: "Payout already settled", payout }
    }

    const practitionerId = payout.practitioner?._id || payout.practitioner

    const [practitioner, profile] = await Promise.all([
      User.findById(practitionerId).select(
        "firstName lastName email contactNumber whatsappNumber additionalDetails"
      ),
      PractitionerProfile.findOne({ user: practitionerId }),
    ])

    if (!practitioner) {
      payout.status = "failed"
      payout.failureReason = "Practitioner user record not found"
      await payout.save()
      return { success: false, reason: "practitioner_not_found" }
    }

    // Verify if practitioner has bank details configured
    const validBank = hasValidBankDetails(profile)
    if (!validBank) {
      payout.status = "pending_bank_details"
      payout.failureReason = "Practitioner bank account or UPI details missing"
      await payout.save()

      // Notify practitioner to add bank details
      await notifyPendingBankDetails(practitionerId, payout.netAmount, payout.sourceTitle)

      return { success: false, reason: "missing_bank_details", payout }
    }

    // ── Generate Bank Transfer Reference & UTR ──────────────────────────────
    const dateStamp = new Date().toISOString().slice(0, 10).replace(/-/g, "")
    const randomSuffix = Math.floor(100000 + Math.random() * 900000)
    const utrNumber = `PAYG-UTR-${dateStamp}-${randomSuffix}`
    const txnId = `PGL-TXN-${Date.now().toString().slice(-8)}`

    const maskedAcc = maskAccountNumber(profile.bankAccountNumber)

    // Snapshot destination details on Payout record
    payout.bankDetails = {
      accountHolderName: profile.bankAccountName || `${practitioner.firstName} ${practitioner.lastName}`.trim(),
      accountNumberMasked: maskedAcc || (profile.upiId ? profile.upiId : "Direct Debit/Credit"),
      bankName: profile.bankName || (profile.upiId ? "UPI Virtual Payment Address" : "Registered Bank"),
      ifsc: profile.bankIfscCode || "",
      upiId: profile.upiId || "",
      iban: profile.bankIban || "",
      swift: profile.bankSwiftBic || "",
      country: profile.payoutCountry || "India",
      payoutMethod: profile.payoutMethod || (profile.upiId ? "upi" : "bank"),
    }

    payout.status = "settled"
    payout.settledAt = new Date()
    payout.payoutUtrNumber = utrNumber
    payout.payoutTransactionId = txnId
    payout.processedBy = processedBy
    payout.failureReason = ""
    await payout.save()

    // ── Update linked AdminPaymentLog ledger record ─────────────────────────
    try {
      const matchQuery = {
        practitioner: practitioner._id,
        practitionerSalaryPaid: false,
      }
      const matchConditions = []
      if (payout.sourceId) {
        if (mongoose.Types.ObjectId.isValid(payout.sourceId)) {
          matchConditions.push({ bookingId: payout.sourceId })
          matchConditions.push({ courseId: payout.sourceId })
        }
        matchConditions.push({ payglocalPaymentId: String(payout.sourceId) })
        matchConditions.push({ payglocalOrderId: String(payout.sourceId) })
      }
      if (matchConditions.length > 0) {
        matchQuery.$or = matchConditions
      }

      const updatedLog = await AdminPaymentLog.findOneAndUpdate(
        matchQuery,
        {
          practitionerSalaryPaid: true,
          salaryPaidAt: new Date(),
          salaryPayoutId: payout._id,
        },
        { new: true }
      )

      if (!updatedLog) {
        // Fallback: match by closest unallocated payment log for this practitioner
        await AdminPaymentLog.findOneAndUpdate(
          {
            practitioner: practitioner._id,
            practitionerSalaryPaid: false,
            amountOwedToPractitioner: payout.netAmount,
          },
          {
            practitionerSalaryPaid: true,
            salaryPaidAt: new Date(),
            salaryPayoutId: payout._id,
          }
        )
      }
    } catch (logErr) {
      console.warn("[Autopay] Ledger update warning:", logErr.message)
    }

    // ── Update practitioner profile earnings ────────────────────────────────
    try {
      if (profile) {
        profile.monthlyEarnings = (profile.monthlyEarnings || 0) + (payout.netAmount || 0)
        await profile.save()
      }
    } catch (profErr) {
      console.warn("[Autopay] Profile earnings update warning:", profErr.message)
    }

    // ── Multi-Channel Autopay Success Notification (Email + WhatsApp) ──────
    try {
      const practName = `${practitioner.firstName} ${practitioner.lastName}`.trim()
      const emailHtml = payoutDisbursedEmail({
        practitionerName: practName,
        netAmount: payout.netAmount,
        grossAmount: payout.grossAmount || payout.amount,
        platformFee: payout.platformFeeDeducted || payout.commissionDeducted || 0,
        taxDeducted: payout.taxDeducted || 0,
        payoutUtrNumber: utrNumber,
        bankName: payout.bankDetails.bankName,
        accountMasked: payout.bankDetails.accountNumberMasked,
        upiId: payout.bankDetails.upiId,
        sourceTitle: payout.sourceTitle,
        sourceType: payout.sourceType,
        settledAt: payout.settledAt,
      })

      if (practitioner.email) {
        mailSender(
          practitioner.email,
          `🎉 ₹${Number(payout.netAmount).toLocaleString("en-IN")} Disbursed to your Bank Account - OpenHand`,
          emailHtml
        ).catch((e) => console.warn("[Autopay] Success email dispatch error:", e.message))
      }

      const phone = practitioner.whatsappNumber || practitioner.contactNumber || practitioner.additionalDetails?.contactNumber
      if (phone) {
        const dest = payout.bankDetails.bankName && payout.bankDetails.accountNumberMasked
          ? `${payout.bankDetails.bankName} (${payout.bankDetails.accountNumberMasked})`
          : payout.bankDetails.upiId || "Bank Account"
        const waMsg = `🎉 *Direct Bank Payout Credited!*\n\nHi ${practitioner.firstName},\n\nYour 72-hour automated payout of *₹${Number(payout.netAmount).toLocaleString("en-IN")}* for *${payout.sourceTitle || "Client Session/Course"}* has been successfully credited directly to your account.\n\n🏦 *Destination:* ${dest}\n🔖 *Bank UTR:* ${utrNumber}\n📅 *Settlement Cycle:* Automated 72-Hour Direct Transfer\n\nYou can review your full ledger and download your statement at:\n🔗 ${FRONTEND_URL}/practice?tab=payouts\n\n— OpenHand Payments & Settlement Desk`
        sendWhatsAppMessage(phone, waMsg).catch((e) => console.warn("[Autopay] WhatsApp success warning:", e.message))
      }
    } catch (notifErr) {
      console.warn("[Autopay] Notification trigger warning:", notifErr.message)
    }

    console.log(`[Autopay] ✅ Successfully settled Payout ${payout._id} (₹${payout.netAmount}) via UTR ${utrNumber}`)
    return { success: true, payout, utr: utrNumber }
  } catch (err) {
    console.error("[Autopay] Error executing autopay:", err)
    return { success: false, error: err.message }
  }
}

/**
 * Scans for all mature 72-hour payouts and processes them in batch.
 */
async function processEligibleAutopays() {
  const now = new Date()
  console.log(`[Autopay] ⏳ Running 72-Hour Autopay Scanner at ${now.toISOString()}...`)

  try {
    // 1. Find all processing payouts whose scheduledPayoutAt has arrived (or createdAt + 72h is in the past)
    const eligiblePayouts = await Payout.find({
      $or: [
        {
          status: "processing",
          $or: [
            { scheduledPayoutAt: { $lte: now } },
            { createdAt: { $lte: new Date(now.getTime() - 72 * 60 * 60 * 1000) } },
          ],
        },
        {
          status: "pending_bank_details", // evaluate pending ones in case bank details were added
        },
      ],
    }).sort({ createdAt: 1 })

    let settledCount = 0
    let pendingBankCount = 0
    let failedCount = 0
    let totalSettledAmount = 0
    const details = []

    for (const payout of eligiblePayouts) {
      const practitionerId = payout.practitioner?._id || payout.practitioner

      // If pending_bank_details, check if practitioner has added bank details now
      if (payout.status === "pending_bank_details") {
        const profile = await PractitionerProfile.findOne({ user: practitionerId })
        if (!hasValidBankDetails(profile)) {
          continue // Still no bank details, skip without spamming
        }
        // Bank details exist now! Check if 72-hour window has also elapsed
        const isMature = (payout.scheduledPayoutAt && payout.scheduledPayoutAt <= now) || 
                         (payout.createdAt && payout.createdAt <= new Date(now.getTime() - 72 * 60 * 60 * 1000))
        if (!isMature) {
          // Window has not elapsed yet, transition to processing so it will auto-settle when 72 hours are reached
          payout.status = "processing"
          payout.failureReason = ""
          await payout.save()
          continue
        }
      }

      const res = await executeAutopayForPayout(payout._id, "autopay_scheduler")
      if (res.success) {
        settledCount++
        totalSettledAmount += payout.netAmount || 0
        details.push({ id: payout._id, status: "settled", amount: payout.netAmount, utr: res.utr })
      } else if (res.reason === "missing_bank_details") {
        pendingBankCount++
        details.push({ id: payout._id, status: "pending_bank_details", amount: payout.netAmount })
      } else {
        failedCount++
        details.push({ id: payout._id, status: "failed", error: res.reason || res.error })
      }
    }


    console.log(
      `[Autopay] 🏁 Autopay cycle finished: ${settledCount} settled (₹${totalSettledAmount}), ${pendingBankCount} awaiting bank details, ${failedCount} failed.`
    )

    return {
      success: true,
      totalChecked: eligiblePayouts.length,
      settledCount,
      pendingBankCount,
      failedCount,
      totalSettledAmount,
      details,
    }
  } catch (err) {
    console.error("[Autopay] Error running autopay scan cycle:", err.message)
    return { success: false, error: err.message }
  }
}

/**
 * Returns platform-wide Autopay Telemetry & Metrics for Admin Dashboard.
 */
async function getAutopayMetrics() {
  const now = new Date()
  const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000)

  const [
    settledAgg,
    processingAgg,
    maturingNext24hAgg,
    pendingBankAgg,
    recentSettled,
    upcomingProcessing,
    allPayouts,
  ] = await Promise.all([
    Payout.aggregate([
      { $match: { status: "settled" } },
      { $group: { _id: null, total: { $sum: "$netAmount" }, count: { $sum: 1 } } },
    ]),
    Payout.aggregate([
      { $match: { status: "processing" } },
      { $group: { _id: null, total: { $sum: "$netAmount" }, count: { $sum: 1 } } },
    ]),
    Payout.aggregate([
      {
        $match: {
          status: "processing",
          scheduledPayoutAt: { $lte: in24h },
        },
      },
      { $group: { _id: null, total: { $sum: "$netAmount" }, count: { $sum: 1 } } },
    ]),
    Payout.aggregate([
      { $match: { status: "pending_bank_details" } },
      { $group: { _id: null, total: { $sum: "$netAmount" }, count: { $sum: 1 } } },
    ]),
    Payout.find({ status: "settled" })
      .populate("practitioner", "firstName lastName email")
      .sort({ settledAt: -1 })
      .limit(10)
      .lean(),
    Payout.find({ status: { $in: ["processing", "pending_bank_details"] } })
      .populate("practitioner", "firstName lastName email")
      .sort({ scheduledPayoutAt: 1 })
      .limit(20)
      .lean(),
    Payout.find({})
      .populate("practitioner", "firstName lastName email")
      .sort({ createdAt: -1 })
      .limit(100)
      .lean(),
  ])

  return {
    settledAmount: settledAgg[0]?.total || 0,
    settledCount: settledAgg[0]?.count || 0,
    escrowAmount: processingAgg[0]?.total || 0,
    escrowCount: processingAgg[0]?.count || 0,
    maturingNext24hAmount: maturingNext24hAgg[0]?.total || 0,
    maturingNext24hCount: maturingNext24hAgg[0]?.count || 0,
    pendingBankAmount: pendingBankAgg[0]?.total || 0,
    pendingBankCount: pendingBankAgg[0]?.count || 0,
    recentSettled,
    upcomingProcessing,
    allPayouts,
  }
}

module.exports = {
  executeAutopayForPayout,
  processEligibleAutopays,
  getAutopayMetrics,
  hasValidBankDetails,
  notifyPendingBankDetails,
}
