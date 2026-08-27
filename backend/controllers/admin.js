const mongoose = require("mongoose")
const User = require("../models/User")
const Booking = require("../models/Booking")
const Subscription = require("../models/Subscription")
const AdminPaymentLog = require("../models/AdminPaymentLog")
const Payout = require("../models/Payout")
const OrgConversation = require("../models/OrgConversation")
const PractitionerProfile = require("../models/PractitionerProfile")
const Course = require("../models/Course")

// ─── Admin Dashboard Statistics ──────────────────────────────────────────────
exports.getAdminDashboardStats = async (req, res) => {
  try {
    const [
      totalClients,
      totalPractitioners,
      totalRevenue,
      pendingPayoutsResult,
      totalBookings,
      activeSubscriptions,
      newOrgConversations,
      recentPayments,
    ] = await Promise.all([
      User.countDocuments({ accountType: { $in: ["Client", "Student", "Learner"] } }),
      User.countDocuments({ accountType: { $in: ["Practitioner", "Instructor"] } }),
      AdminPaymentLog.aggregate([
        { $match: { status: "received" } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      AdminPaymentLog.aggregate([
        { $match: { status: "received", practitioner: { $exists: true, $ne: null }, practitionerSalaryPaid: false } },
        { $group: { _id: null, total: { $sum: "$amountOwedToPractitioner" } } },
      ]),
      Booking.countDocuments({ status: { $in: ["confirmed", "completed"] } }),
      Subscription.countDocuments({ status: "active" }),
      OrgConversation.countDocuments({ status: "new" }),
      AdminPaymentLog.find({ status: "received" })
        .sort({ createdAt: -1 })
        .limit(10)
        .populate("client", "firstName lastName email")
        .populate("practitioner", "firstName lastName")
        .lean(),
    ])

    // Revenue by type
    const revenueByType = await AdminPaymentLog.aggregate([
      { $match: { status: "received" } },
      { $group: { _id: "$paymentType", total: { $sum: "$amount" }, count: { $sum: 1 } } },
    ])

    // Compute Month-Over-Month (MoM) Growth Trends dynamically
    const startOfCurrentMonth = new Date()
    startOfCurrentMonth.setDate(1)
    startOfCurrentMonth.setHours(0, 0, 0, 0)

    const startOfLastMonth = new Date(startOfCurrentMonth)
    startOfLastMonth.setMonth(startOfLastMonth.getMonth() - 1)

    const [currentRevAgg, lastRevAgg, currentMonthClients, lastMonthClients] = await Promise.all([
      AdminPaymentLog.aggregate([
        { $match: { status: "received", createdAt: { $gte: startOfCurrentMonth } } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      AdminPaymentLog.aggregate([
        { $match: { status: "received", createdAt: { $gte: startOfLastMonth, $lt: startOfCurrentMonth } } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      User.countDocuments({ accountType: { $in: ["Client", "Student", "Learner"] }, createdAt: { $gte: startOfCurrentMonth } }),
      User.countDocuments({ accountType: { $in: ["Client", "Student", "Learner"] }, createdAt: { $gte: startOfLastMonth, $lt: startOfCurrentMonth } }),
    ])

    const curRev = currentRevAgg[0]?.total || 0
    const prevRev = lastRevAgg[0]?.total || 0
    let revenueTrend = undefined
    if (prevRev > 0) {
      revenueTrend = Math.round(((curRev - prevRev) / prevRev) * 100)
    } else if (curRev > 0) {
      revenueTrend = 100
    }

    let clientsTrend = undefined
    if (lastMonthClients > 0) {
      clientsTrend = Math.round(((currentMonthClients - lastMonthClients) / lastMonthClients) * 100)
    } else if (currentMonthClients > 0) {
      clientsTrend = 100
    }

    // Monthly revenue (last 6 months)
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
    const monthlyRevenue = await AdminPaymentLog.aggregate([
      { $match: { status: "received", createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
          total: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ])

    return res.status(200).json({
      success: true,
      stats: {
        totalClients,
        totalPractitioners,
        totalRevenue: totalRevenue[0]?.total || 0,
        pendingPayouts: pendingPayoutsResult[0]?.total || 0,
        totalBookings,
        activeSubscriptions,
        newOrgConversations,
        revenueTrend,
        clientsTrend,
      },
      revenueByType,
      monthlyRevenue,
      recentPayments,
    })
  } catch (error) {
    console.error("getAdminDashboardStats error:", error)
    return res.status(500).json({ success: false, message: error.message })
  }
}

// ─── All Clients ───────────────────────────────────────────────────────────────
exports.getAllClients = async (req, res) => {
  try {
    const { page = 1, limit = 50, search = "" } = req.query
    const skip = (Number(page) - 1) * Number(limit)

    const query = {
      accountType: { $in: ["Client", "Student", "Learner"] },
    }
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ]
    }

    const [clients, total] = await Promise.all([
      User.find(query)
        .select("firstName lastName email image createdAt accountType active trialStartedAt trialExpiresAt activePlan")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      User.countDocuments(query),
    ])

    const now = new Date()

    // Enrich with subscription + trial + booking data
    const enriched = await Promise.all(
      clients.map(async (client) => {
        const [subscription, bookingsCount, totalPaid] = await Promise.all([
          Subscription.findOne({ client: client._id, status: "active" })
            .sort({ createdAt: -1 })
            .lean(),
          Booking.countDocuments({
            client: client._id,
            status: { $in: ["confirmed", "completed"] },
          }),
          AdminPaymentLog.aggregate([
            { $match: { client: client._id, status: "received" } },
            { $group: { _id: null, total: { $sum: "$amount" } } },
          ]),
        ])

        const hasActiveSub = !!subscription && new Date(subscription.endDate) > now
        const isPractitioner = client.accountType === "Practitioner" || client.accountType === "Instructor"
        const isLearner = !isPractitioner
        const trialDays = isLearner ? 7 : 14
        const trialStartedAt = client.createdAt || client.trialStartedAt || now
        const calculatedExpiresAt = new Date(new Date(trialStartedAt).getTime() + trialDays * 24 * 60 * 60 * 1000)
        const trialExpiresAt = isLearner ? calculatedExpiresAt : (client.trialExpiresAt || calculatedExpiresAt)

        const msRemaining = trialExpiresAt.getTime() - now.getTime()
        const isTrialActive = !hasActiveSub && msRemaining > 0
        const trialDaysRemaining = isTrialActive
          ? Math.min(trialDays, Math.max(0, Math.ceil(msRemaining / (1000 * 60 * 60 * 24))))
          : 0

        let planDisplayStatus = "Trial Expired"
        if (hasActiveSub) {
          planDisplayStatus = `Subscribed (${subscription.planName || subscription.planKey})`
        } else if (isTrialActive) {
          planDisplayStatus = `${isLearner ? "7-Day" : "14-Day"} Trial (${trialDaysRemaining}d left)`
        }

        return {
          ...client,
          subscription: subscription ? { planKey: subscription.planKey, planName: subscription.planName, status: subscription.status, endDate: subscription.endDate } : null,
          hasActiveSub,
          isTrialActive,
          trialDaysRemaining,
          trialStartedAt,
          trialExpiresAt,
          planDisplayStatus,
          sessionsBooked: bookingsCount,
          totalPaid: totalPaid[0]?.total || 0,
        }
      })
    )

    return res.status(200).json({ success: true, clients: enriched, total, page: Number(page), limit: Number(limit) })
  } catch (error) {
    console.error("getAllClients error:", error)
    return res.status(500).json({ success: false, message: error.message })
  }
}

// ─── All Practitioners ─────────────────────────────────────────────────────────
exports.getAllPractitioners = async (req, res) => {
  try {
    const { page = 1, limit = 50, search = "" } = req.query
    const skip = (Number(page) - 1) * Number(limit)

    const query = { accountType: { $in: ["Practitioner", "Instructor"] } }
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ]
    }

    const [practitioners, total] = await Promise.all([
      User.find(query)
        .select("firstName lastName email image createdAt accountType active practitionerProfile trialStartedAt trialExpiresAt activePlan")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      User.countDocuments(query),
    ])

    const now = new Date()

    const enriched = await Promise.all(
      practitioners.map(async (pract) => {
        const [subscription, profile, bookingsCount, totalOwed, coursesCount, courseSalesAgg, sessionSalesAgg] = await Promise.all([
          Subscription.findOne({ client: pract._id, status: "active" }).sort({ createdAt: -1 }).lean(),
          PractitionerProfile.findOne({ user: pract._id }).lean(),
          Booking.countDocuments({ practitioner: pract._id, status: { $in: ["confirmed", "completed"] } }),
          AdminPaymentLog.aggregate([
            { $match: { practitioner: pract._id, status: "received", practitionerSalaryPaid: false } },
            { $group: { _id: null, total: { $sum: "$amountOwedToPractitioner" } } },
          ]),
          Course.countDocuments({ practitioner: pract._id }),
          AdminPaymentLog.aggregate([
            { $match: { practitioner: pract._id, paymentType: "paid_course", status: "received" } },
            { $group: { _id: null, total: { $sum: "$amount" } } },
          ]),
          AdminPaymentLog.aggregate([
            { $match: { practitioner: pract._id, paymentType: "offer_booking", status: "received" } },
            { $group: { _id: null, total: { $sum: "$amount" } } },
          ]),
        ])

        const courseSales = courseSalesAgg[0]?.total || 0
        const sessionSales = sessionSalesAgg[0]?.total || 0
        const grossGenerated = courseSales + sessionSales

        const hasActiveSub = !!subscription && new Date(subscription.endDate) > now
        const trialDays = 14
        const trialStartedAt = pract.createdAt || pract.trialStartedAt || now
        const trialExpiresAt = pract.trialExpiresAt || new Date(new Date(trialStartedAt).getTime() + trialDays * 24 * 60 * 60 * 1000)

        const msRemaining = trialExpiresAt.getTime() - now.getTime()
        const isTrialActive = !hasActiveSub && msRemaining > 0
        const trialDaysRemaining = isTrialActive
          ? Math.min(trialDays, Math.max(0, Math.ceil(msRemaining / (1000 * 60 * 60 * 24))))
          : 0

        let planDisplayStatus = "Trial Expired"
        if (hasActiveSub) {
          planDisplayStatus = `Subscribed (${subscription.planName || subscription.planKey})`
        } else if (isTrialActive) {
          planDisplayStatus = `14-Day Trial (${trialDaysRemaining}d left)`
        }

        return {
          ...pract,
          subscription: subscription ? { planKey: subscription.planKey, planName: subscription.planName, status: subscription.status, endDate: subscription.endDate } : null,
          hasActiveSub,
          isTrialActive,
          trialDaysRemaining,
          planDisplayStatus,
          profile: profile ? {
            plan: profile.plan,
            specialties: profile.specialties,
            verificationStatus: profile.verificationStatus,
            sessionRate: profile.sessionRate,
            experienceYears: profile.experienceYears,
            bankAccountName: profile.bankAccountName || "",
            bankAccountNumber: profile.bankAccountNumber || "",
            bankIfscCode: profile.bankIfscCode || "",
            bankName: profile.bankName || "",
            upiId: profile.upiId || "",
          } : null,
          sessionsDelivered: bookingsCount,
          salaryOwed: totalOwed[0]?.total || 0,
          coursesCount,
          totalCourseSales: courseSales,
          totalSessionSales: sessionSales,
          grossGenerated,
        }
      })
    )

    return res.status(200).json({ success: true, practitioners: enriched, total, page: Number(page), limit: Number(limit) })
  } catch (error) {
    console.error("getAllPractitioners error:", error)
    return res.status(500).json({ success: false, message: error.message })
  }
}

// ─── Practitioner Payment & Payout History (Admin) ───────────────────────────
exports.getPractitionerPaymentHistory = async (req, res) => {
  try {
    const { practitionerId } = req.params
    if (!practitionerId) {
      return res.status(400).json({ success: false, message: "practitionerId is required" })
    }

    const practitioner = await User.findById(practitionerId).select("firstName lastName email image accountType").lean()
    if (!practitioner) {
      return res.status(404).json({ success: false, message: "Practitioner not found" })
    }

    const [payouts, paymentLogs, profile] = await Promise.all([
      Payout.find({ practitioner: practitionerId }).sort({ createdAt: -1 }).lean(),
      AdminPaymentLog.find({ practitioner: practitionerId })
        .populate("client", "firstName lastName email")
        .sort({ createdAt: -1 })
        .lean(),
      PractitionerProfile.findOne({ user: practitionerId }).lean(),
    ])

    const practitionerObjId = mongoose.Types.ObjectId.isValid(practitionerId) ? new mongoose.Types.ObjectId(practitionerId) : practitionerId

    const totalOwedAgg = await AdminPaymentLog.aggregate([
      { $match: { practitioner: { $in: [practitionerId, practitionerObjId] }, status: "received", practitionerSalaryPaid: false } },
      { $group: { _id: null, total: { $sum: "$amountOwedToPractitioner" } } },
    ])
    const totalEarnedAgg = await AdminPaymentLog.aggregate([
      { $match: { practitioner: { $in: [practitionerId, practitionerObjId] }, status: "received" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ])

    return res.status(200).json({
      success: true,
      practitioner,
      profile,
      payouts,
      paymentLogs,
      pendingSalaryOwed: totalOwedAgg[0]?.total || 0,
      totalEarned: totalEarnedAgg[0]?.total || 0,
    })
  } catch (error) {
    console.error("getPractitionerPaymentHistory error:", error)
    return res.status(500).json({ success: false, message: error.message })
  }
}

// ─── All Payments (Admin Payment Log) ─────────────────────────────────────────
exports.getAllPayments = async (req, res) => {
  try {
    const { page = 1, limit = 50, type, startDate, endDate, search } = req.query
    const skip = (Number(page) - 1) * Number(limit)

    const query = {}
    if (type) query.paymentType = type
    if (startDate || endDate) {
      query.createdAt = {}
      if (startDate) query.createdAt.$gte = new Date(startDate)
      if (endDate) query.createdAt.$lte = new Date(endDate)
    }
    if (search) {
      query.$or = [
        { clientName: { $regex: search, $options: "i" } },
        { practitionerName: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ]
    }

    const [payments, total] = await Promise.all([
      AdminPaymentLog.find(query)
        .populate("client", "firstName lastName email")
        .populate("practitioner", "firstName lastName email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      AdminPaymentLog.countDocuments(query),
    ])

    return res.status(200).json({ success: true, payments, total, page: Number(page), limit: Number(limit) })
  } catch (error) {
    console.error("getAllPayments error:", error)
    return res.status(500).json({ success: false, message: error.message })
  }
}

// ─── All Subscriptions ────────────────────────────────────────────────────────
exports.getAllSubscriptions = async (req, res) => {
  try {
    const { page = 1, limit = 50, status } = req.query
    const skip = (Number(page) - 1) * Number(limit)

    const query = {}
    if (status) query.status = status

    const [subscriptions, total] = await Promise.all([
      Subscription.find(query)
        .populate("client", "firstName lastName email image")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Subscription.countDocuments(query),
    ])

    return res.status(200).json({ success: true, subscriptions, total, page: Number(page), limit: Number(limit) })
  } catch (error) {
    console.error("getAllSubscriptions error:", error)
    return res.status(500).json({ success: false, message: error.message })
  }
}

// ─── All Bookings ─────────────────────────────────────────────────────────────
exports.getAllBookings = async (req, res) => {
  try {
    const { page = 1, limit = 50, status, offerType } = req.query
    const skip = (Number(page) - 1) * Number(limit)

    const query = {}
    if (status) query.status = status
    if (offerType) query.offerType = offerType

    const [bookings, total] = await Promise.all([
      Booking.find(query)
        .populate("client", "firstName lastName email image")
        .populate("practitioner", "firstName lastName email image")
        .populate("offer", "title type price durationMinutes")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Booking.countDocuments(query),
    ])

    return res.status(200).json({ success: true, bookings, total, page: Number(page), limit: Number(limit) })
  } catch (error) {
    console.error("getAllBookings error:", error)
    return res.status(500).json({ success: false, message: error.message })
  }
}

// ─── All Org Conversations ────────────────────────────────────────────────────
exports.getOrgConversations = async (req, res) => {
  try {
    const { page = 1, limit = 50, status } = req.query
    const skip = (Number(page) - 1) * Number(limit)

    const query = {}
    if (status) query.status = status

    const [conversations, total] = await Promise.all([
      OrgConversation.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      OrgConversation.countDocuments(query),
    ])

    return res.status(200).json({ success: true, conversations, total, page: Number(page), limit: Number(limit) })
  } catch (error) {
    console.error("getOrgConversations error:", error)
    return res.status(500).json({ success: false, message: error.message })
  }
}

// ─── Update Org Conversation Status ──────────────────────────────────────────
exports.updateOrgConversation = async (req, res) => {
  try {
    const { id } = req.params
    const { status, adminNotes, assignedTo } = req.body

    const convo = await OrgConversation.findByIdAndUpdate(
      id,
      { status, adminNotes, assignedTo },
      { new: true }
    )
    if (!convo) return res.status(404).json({ success: false, message: "Conversation not found" })

    return res.status(200).json({ success: true, conversation: convo })
  } catch (error) {
    console.error("updateOrgConversation error:", error)
    return res.status(500).json({ success: false, message: error.message })
  }
}

// ─── Process Monthly Payout (Admin manually marks salary as paid) ─────────────
exports.processMonthlyPayout = async (req, res) => {
  try {
    const { practitionerId, amount, notes } = req.body

    if (!practitionerId || amount === undefined || amount === null) {
      return res.status(400).json({ success: false, message: "practitionerId and amount are required" })
    }

    const numAmount = Number(amount)
    if (isNaN(numAmount) || numAmount <= 0) {
      return res.status(400).json({ success: false, message: "Payout amount must be a valid positive number" })
    }

    // 1. Verify practitioner exists
    const practitioner = await User.findById(practitionerId).select("firstName lastName email accountType")
    if (!practitioner) {
      return res.status(404).json({ success: false, message: "Practitioner not found" })
    }

    // 2. Verify practitioner bank / UPI details exist
    const PractitionerProfile = require("../models/PractitionerProfile")
    const profile = await PractitionerProfile.findOne({ user: practitionerId }).lean()
    const hasBankDetails = !!((profile?.bankAccountNumber && profile?.bankIfscCode) || profile?.upiId)
    if (!hasBankDetails) {
      return res.status(400).json({
        success: false,
        message: `Cannot process payout: Dr. ${practitioner.firstName} ${practitioner.lastName} has not entered bank account or UPI details yet.`,
      })
    }

    // 3. Verify total pending salary owed
    const totalOwedAgg = await AdminPaymentLog.aggregate([
      { $match: { practitioner: new mongoose.Types.ObjectId(practitionerId), status: "received", practitionerSalaryPaid: false } },
      { $group: { _id: null, total: { $sum: "$amountOwedToPractitioner" } } },
    ])
    const pendingSalaryOwed = totalOwedAgg[0]?.total || 0

    if (pendingSalaryOwed <= 0) {
      return res.status(400).json({
        success: false,
        message: `Dr. ${practitioner.firstName} ${practitioner.lastName} has no pending salary balance owed.`,
      })
    }

    if (numAmount > pendingSalaryOwed) {
      return res.status(400).json({
        success: false,
        message: `Requested payout amount (₹${numAmount.toLocaleString('en-IN')}) exceeds practitioner's pending salary balance (₹${pendingSalaryOwed.toLocaleString('en-IN')}).`,
      })
    }

    // 4. Create payout record
    const payout = await Payout.create({
      practitioner: practitionerId,
      amount: numAmount,
      commissionDeducted: 0,
      netAmount: numAmount,
      status: "settled",
      settledAt: new Date(),
      payoutMethod: profile.bankAccountNumber ? "manual_bank_transfer" : "upi",
      bookingsCount: await Booking.countDocuments({
        practitioner: practitionerId,
        status: "completed",
      }),
    })

    // 5. Mark unsettled payment logs for this practitioner as salary-paid
    await AdminPaymentLog.updateMany(
      {
        practitioner: practitionerId,
        status: "received",
        practitionerSalaryPaid: false,
      },
      {
        practitionerSalaryPaid: true,
        salaryPaidAt: new Date(),
        salaryPayoutId: payout._id,
      }
    )

    return res.status(200).json({
      success: true,
      message: `Salary of ₹${numAmount.toLocaleString('en-IN')} successfully marked as paid to Dr. ${practitioner.firstName} ${practitioner.lastName}`,
      payout,
    })
  } catch (error) {
    console.error("processMonthlyPayout error:", error)
    return res.status(500).json({ success: false, message: error.message })
  }
}

// ─── Seed Admin Account ───────────────────────────────────────────────────────
// One-time use: POST /api/v1/admin/seed-admin (only works if no Admin exists)
exports.seedAdminAccount = async (req, res) => {
  try {
    const existingAdmin = await User.findOne({ accountType: "Admin" })
    if (existingAdmin) {
      return res.status(400).json({ success: false, message: "Admin account already exists. Login with existing admin credentials." })
    }

    const bcrypt = require("bcrypt")
    const Profile = require("../models/Profile")
    const email = req.body.email || "admin@openhand.com"
    const password = req.body.password || "AdminPassword123!"
    const firstName = req.body.firstName || "Super"
    const lastName = req.body.lastName || "Admin"

    const hashedPassword = await bcrypt.hash(password, 10)
    const profile = await Profile.create({ gender: null, dateOfBirth: null, about: "Platform Administrator", contactNumber: null })

    const admin = await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      accountType: "Admin",
      additionalDetails: profile._id,
      approved: true,
      active: true,
    })

    return res.status(201).json({
      success: true,
      message: "Admin account created successfully. You can now log in.",
      admin: { _id: admin._id, email: admin.email, firstName: admin.firstName },
    })
  } catch (error) {
    console.error("seedAdminAccount error:", error)
    return res.status(500).json({ success: false, message: error.message })
  }
}

// ─── Admin: Update Client Plan / Extend Trial ────────────────────────────────
exports.updateClientPlan = async (req, res) => {
  try {
    const { id } = req.params
    const { planKey, extendTrialDays } = req.body

    const user = await User.findById(id)
    if (!user) return res.status(404).json({ success: false, message: "Client not found" })

    if (extendTrialDays && !isNaN(extendTrialDays)) {
      const currentExpiry = user.trialExpiresAt && new Date(user.trialExpiresAt) > new Date()
        ? new Date(user.trialExpiresAt)
        : new Date()
      user.trialExpiresAt = new Date(currentExpiry.getTime() + Number(extendTrialDays) * 24 * 60 * 60 * 1000)
    }

    if (planKey !== undefined) {
      user.activePlan = planKey

      if (["beginner", "advance", "champion", "starter", "growth", "practice", "master"].includes(planKey)) {
        const planNameMap = {
          beginner: "Beginner Plan",
          advance: "Advance Plan",
          champion: "Champion Plan",
          starter: "Starter Plan",
          growth: "Growth Plan",
          practice: "Practice Plan",
          master: "Master VIP Plan",
        }

        // Create manual subscription record for client
        await Subscription.updateMany({ client: id, status: "active" }, { status: "expired" })
        const startDate = new Date()
        const endDate = new Date()
        endDate.setMonth(endDate.getMonth() + 1)

        await Subscription.create({
          client: id,
          planKey,
          planName: `${planNameMap[planKey] || planKey.toUpperCase()} (Admin Override)`,
          amount: 0,
          status: "active",
          startDate,
          endDate,
          paymentGateway: "manual",
        })
      } else if (planKey === "trial") {
        await Subscription.updateMany({ client: id, status: "active" }, { status: "expired" })
      } else if (planKey === "none") {
        await Subscription.updateMany({ client: id, status: "active" }, { status: "expired" })
        user.trialExpiresAt = new Date(Date.now() - 1000)
      }
    }

    await user.save()
    return res.status(200).json({ success: true, message: "Client plan updated successfully", user })
  } catch (error) {
    console.error("updateClientPlan error:", error)
    return res.status(500).json({ success: false, message: error.message })
  }
}

// ─── Admin: Get All Courses for Plan Assignment ──────────────────────────────
exports.getAllCoursesAdmin = async (req, res) => {
  try {
    const courses = await Course.find()
      .populate("practitioner", "firstName lastName email image")
      .populate("videos", "title durationSeconds")
      .sort({ createdAt: -1 })
      .lean()

    return res.status(200).json({ success: true, courses })
  } catch (error) {
    console.error("getAllCoursesAdmin error:", error)
    return res.status(500).json({ success: false, message: error.message })
  }
}

// ─── Admin: Update Course Required Plan & Status ──────────────────────────────
exports.updateCourseAdmin = async (req, res) => {
  try {
    const { id } = req.params
    const { requiredPlan, status } = req.body

    const course = await Course.findById(id)
    if (!course) return res.status(404).json({ success: false, message: "Course not found" })

    if (requiredPlan !== undefined) {
      course.requiredPlan = requiredPlan || null
    }
    if (status) {
      course.status = status
    }

    await course.save()
    return res.status(200).json({ success: true, message: "Course updated by Admin", course })
  } catch (error) {
    console.error("updateCourseAdmin error:", error)
    return res.status(500).json({ success: false, message: error.message })
  }
}
