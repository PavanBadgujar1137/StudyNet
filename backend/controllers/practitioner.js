const User = require("../models/User")
const PractitionerProfile = require("../models/PractitionerProfile")
const Booking = require("../models/Booking")
const Payout = require("../models/Payout")
const Invoice = require("../models/Invoice")

exports.getPractitioners = async (req, res) => {
  try {
    const { need, fmt, lang, q, page = 1, limit = 50, sort = "featured" } = req.query

    // Clean out legacy sample dummy practitioners
    const dummyUsers = await User.find({ email: { $regex: /@openhand\.example$/i } }).select("_id")
    const dummyUserIds = dummyUsers.map((u) => u._id)

    if (dummyUserIds.length > 0) {
      await PractitionerProfile.deleteMany({ user: { $in: dummyUserIds } })
      await User.deleteMany({ _id: { $in: dummyUserIds } })
    }

    // Clean out legacy sample dummy profiles with default auto-generated bio
    await PractitionerProfile.deleteMany({ bio: { $regex: /Certified practitioner specializing in holistic guidance/i } })

    // Build query filters
    const queryFilter = {}
    if (need && need !== "all") {
      queryFilter.specialties = { $in: [new RegExp(need, "i")] }
    }
    if (fmt && fmt !== "all") {
      queryFilter.formats = { $in: [new RegExp(fmt, "i")] }
    }
    if (lang && lang !== "all") {
      queryFilter.languages = { $in: [new RegExp(lang, "i")] }
    }

    let allProfiles = await PractitionerProfile.find(queryFilter).populate({
      path: "user",
      select: "firstName lastName email image accountType",
    }).lean()

    // Filter out profiles without valid user or non-practitioners
    allProfiles = allProfiles.filter(
      (p) => p.user && ["Practitioner", "Instructor"].includes(p.user.accountType)
    )

    // Attach real practitioner offers from MongoDB
    const Offer = require("../models/Offer")
    for (let p of allProfiles) {
      if (p.user?._id) {
        const userOffers = await Offer.find({
          practitioner: p.user._id,
        }).lean()

        p.offers = userOffers || []
        if (userOffers.length > 0) {
          const minPrice = Math.min(...userOffers.map((o) => o.price || 0))
          if (minPrice > 0) p.sessionRate = minPrice
          const offerFormats = [...new Set(userOffers.map((o) => (o.type === "circle" ? "Group Circles" : "1:1 Sessions")))]
          if (offerFormats.length > 0) {
            p.formats = offerFormats
          }
        }
      }
    }

    // Search query filtering
    if (q) {
      const qLower = q.toLowerCase().trim()
      allProfiles = allProfiles.filter((p) => {
        const offerTitles = (p.offers || []).map((o) => o.title).join(" ")
        const fullText = `${p.user?.firstName} ${p.user?.lastName} ${p.credentials} ${p.bio} ${p.specialties?.join(" ")} ${offerTitles}`.toLowerCase()
        return fullText.includes(qLower)
      })
    }

    // Sort profiles
    if (sort === "rating") {
      allProfiles.sort((a, b) => (b.rating || 5) - (a.rating || 5))
    } else if (sort === "rate_low") {
      allProfiles.sort((a, b) => (a.sessionRate || 0) - (b.sessionRate || 0))
    } else if (sort === "rate_high") {
      allProfiles.sort((a, b) => (b.sessionRate || 0) - (a.sessionRate || 0))
    }

    // Calculate pagination
    const pageNum = Math.max(1, parseInt(page, 10) || 1)
    const limitNum = Math.max(1, parseInt(limit, 10) || 50)
    const totalPractitioners = allProfiles.length
    const totalPages = Math.ceil(totalPractitioners / limitNum) || 1

    const startIndex = (pageNum - 1) * limitNum
    const paginatedProfiles = allProfiles.slice(startIndex, startIndex + limitNum)

    return res.status(200).json({
      success: true,
      data: paginatedProfiles,
      practitioners: paginatedProfiles,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalPractitioners,
        limit: limitNum,
        hasPrev: pageNum > 1,
        hasNext: pageNum < totalPages,
      },
    })
  } catch (error) {
    console.error("Get Practitioners Error:", error)
    return res.status(500).json({
      success: false,
      message: "Failed to fetch practitioners directory",
      error: error.message,
    })
  }
}

exports.getPractitionerByHandle = async (req, res) => {
  try {
    const { handle } = req.params
    const profile = await PractitionerProfile.findOne({ handle }).populate({
      path: "user",
      select: "firstName lastName email image",
    })

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Practitioner not found",
      })
    }

    return res.status(200).json({
      success: true,
      data: profile,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch practitioner profile",
      error: error.message,
    })
  }
}

exports.getPractitionerDashboard = async (req, res) => {
  try {
    const userId = req.user.id
    const CircleCohort = require("../models/CircleCohort")
    const profile = await PractitionerProfile.findOne({ user: userId })
    const bookings = await Booking.find({ practitioner: userId }).populate("client", "firstName lastName email")
    const payouts = await Payout.find({ practitioner: userId }).sort({ createdAt: -1 })
    const circles = await CircleCohort.find({ practitioner: userId }).sort({ createdAt: -1 })

    const totalEarnings = bookings.reduce((sum, b) => sum + (b.netPayout || b.amount * 0.92), 0)
    const activeClientsCount = new Set(bookings.map((b) => b.client?._id?.toString())).size

    return res.status(200).json({
      success: true,
      telemetry: {
        totalEarnings,
        activeClientsCount,
        circleFillRate: "85%",
        wellbeingScore: 92,
        plan: profile?.plan || "starter",
        commissionPercentage: profile?.planCommission || 8,
        circles,
      },
      circles,
      bookings,
      payouts,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to load practitioner dashboard telemetry",
      error: error.message,
    })
  }
}

exports.getPayoutsAndInvoices = async (req, res) => {
  try {
    const userId = req.user.id
    const payouts = await Payout.find({ practitioner: userId }).sort({ createdAt: -1 })
    const invoices = await Invoice.find({ practitioner: userId }).sort({ createdAt: -1 })

    return res.status(200).json({
      success: true,
      payouts,
      invoices,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch payouts and invoices",
      error: error.message,
    })
  }
}

const ClientConnection = require("../models/ClientConnection")

// ── Client pays & requests connection (status: "pending_approval") ──
exports.connectClientWithPractitioner = async (req, res) => {
  try {
    const clientId = req.user.id
    const { practitionerId, amountPaid = 2500, paymentId, orderId } = req.body

    if (!practitionerId) {
      return res.status(400).json({ success: false, message: "Practitioner ID is required" })
    }

    let practUser = await User.findById(practitionerId)
    if (!practUser) {
      const pProfile = await PractitionerProfile.findById(practitionerId)
      if (pProfile) practUser = await User.findById(pProfile.user)
    }

    if (!practUser) {
      return res.status(404).json({ success: false, message: "Practitioner not found" })
    }

    const generatedPaymentId = paymentId || `pay_rzp_${Date.now()}`
    const generatedOrderId = orderId || `order_rzp_${Date.now()}`

    const connection = await ClientConnection.findOneAndUpdate(
      { client: clientId, practitioner: practUser._id },
      {
        status: "pending_approval",
        amountPaid: Number(amountPaid),
        paymentId: generatedPaymentId,
        orderId: generatedOrderId,
        paymentStatus: "paid",
      },
      { upsert: true, new: true }
    )

    return res.status(200).json({
      success: true,
      message: `Payment of ₹${amountPaid} received! Connection request sent to ${practUser.firstName} for approval.`,
      connection,
      status: "pending_approval",
    })
  } catch (error) {
    console.error("connectClientWithPractitioner error:", error)
    return res.status(500).json({ success: false, message: error.message })
  }
}

// ── Practitioner approves or rejects client payment & connection ──
exports.approveClientConnection = async (req, res) => {
  try {
    const practitionerId = req.user.id
    const { connectionId, clientId, status = "approved" } = req.body

    let connection
    if (connectionId) {
      connection = await ClientConnection.findById(connectionId)
    } else if (clientId) {
      connection = await ClientConnection.findOne({ client: clientId, practitioner: practitionerId })
    }

    if (!connection) {
      return res.status(404).json({ success: false, message: "Connection request not found" })
    }

    connection.status = status === "approved" ? "approved" : "rejected"
    await connection.save()

    if (status === "approved") {
      await User.findByIdAndUpdate(connection.client, {
        practitionerProfile: practitionerId,
      })
    }

    return res.status(200).json({
      success: true,
      message: status === "approved" ? "Client connection approved successfully!" : "Connection request rejected.",
      connection,
    })
  } catch (error) {
    console.error("approveClientConnection error:", error)
    return res.status(500).json({ success: false, message: error.message })
  }
}

// ── Client fetches their practitioner connections ──
exports.getClientConnections = async (req, res) => {
  try {
    const clientId = req.user.id
    const connections = await ClientConnection.find({ client: clientId })
      .populate("practitioner", "firstName lastName email image credentials sessionRate")
      .lean()

    return res.status(200).json({
      success: true,
      connections,
    })
  } catch (error) {
    console.error("getClientConnections error:", error)
    return res.status(500).json({ success: false, message: error.message })
  }
}

// ── Get Connected Clients & Pending Payment Approvals for Practitioner ──
exports.getConnectedClients = async (req, res) => {
  try {
    const userId = req.user.id

    const connections = await ClientConnection.find({
      practitioner: userId,
      status: { $in: ["approved", "active", "pending_approval"] },
    })
      .populate("client", "firstName lastName email image createdAt")
      .sort({ createdAt: -1 })
      .lean()

    const pendingApprovals = connections.filter((c) => c.status === "pending_approval")
    const activeApprovedConnections = connections.filter((c) => c.status === "approved" || c.status === "active")

    const connectedClientList = activeApprovedConnections.map((c) => c.client).filter(Boolean)
    const bookings = await Booking.find({ practitioner: userId }).populate("client", "firstName lastName email image createdAt").lean()
    const bookedClients = bookings.map((b) => b.client).filter(Boolean)

    const clientMap = new Map()
    connectedClientList.forEach((cl) => clientMap.set(cl._id.toString(), cl))
    bookedClients.forEach((cl) => clientMap.set(cl._id.toString(), cl))

    const finalClients = Array.from(clientMap.values())

    return res.status(200).json({
      success: true,
      clients: finalClients,
      pendingApprovals,
      connections,
    })
  } catch (error) {
    console.error("getConnectedClients error:", error)
    return res.status(500).json({ success: false, message: error.message })
  }
}
