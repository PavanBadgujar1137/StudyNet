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
      User.countDocuments({ accountType: { $in: ["Client", "Student"] } }),
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
      accountType: { $in: ["Client", "Student"] },
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
        .select("firstName lastName email image createdAt accountType active")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      User.countDocuments(query),
    ])

    // Enrich with subscription + booking data
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
        return {
          ...client,
          subscription: subscription ? { planKey: subscription.planKey, planName: subscription.planName, status: subscription.status, endDate: subscription.endDate } : null,
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
        .select("firstName lastName email image createdAt accountType active practitionerProfile")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      User.countDocuments(query),
    ])

    const enriched = await Promise.all(
      practitioners.map(async (pract) => {
        const [profile, bookingsCount, totalOwed, coursesCount] = await Promise.all([
          PractitionerProfile.findOne({ user: pract._id }).lean(),
          Booking.countDocuments({ practitioner: pract._id, status: { $in: ["confirmed", "completed"] } }),
          AdminPaymentLog.aggregate([
            { $match: { practitioner: pract._id, status: "received", practitionerSalaryPaid: false } },
            { $group: { _id: null, total: { $sum: "$amountOwedToPractitioner" } } },
          ]),
          Course.countDocuments({ practitioner: pract._id }),
        ])
        return {
          ...pract,
          profile: profile ? {
            plan: profile.plan,
            specialties: profile.specialties,
            verificationStatus: profile.verificationStatus,
            sessionRate: profile.sessionRate,
            experienceYears: profile.experienceYears,
          } : null,
          sessionsDelivered: bookingsCount,
          salaryOwed: totalOwed[0]?.total || 0,
          coursesCount,
        }
      })
    )

    return res.status(200).json({ success: true, practitioners: enriched, total, page: Number(page), limit: Number(limit) })
  } catch (error) {
    console.error("getAllPractitioners error:", error)
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

    if (!practitionerId || !amount) {
      return res.status(400).json({ success: false, message: "practitionerId and amount are required" })
    }

    // Create payout record
    const payout = await Payout.create({
      practitioner: practitionerId,
      amount,
      commissionDeducted: 0, // Admin decides externally
      netAmount: amount,
      status: "settled",
      settledAt: new Date(),
      payoutMethod: "manual_bank_transfer",
      bookingsCount: await Booking.countDocuments({
        practitioner: practitionerId,
        status: "completed",
      }),
    })

    // Mark all unsettled payment logs for this practitioner as salary-paid
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

    const practitioner = await User.findById(practitionerId).select("firstName lastName email")

    return res.status(200).json({
      success: true,
      message: `Salary of ₹${amount} marked as paid to ${practitioner?.firstName} ${practitioner?.lastName}`,
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
