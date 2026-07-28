const User = require("../models/User")
const PractitionerProfile = require("../models/PractitionerProfile")
const Booking = require("../models/Booking")
const Payout = require("../models/Payout")
const Invoice = require("../models/Invoice")

exports.getPractitioners = async (req, res) => {
  try {
    const { need, fmt, lang, q, page = 1, limit = 50, sort = "featured" } = req.query
    const Offer = require("../models/Offer")

    // Find all registered practitioners/instructors in database
    const practitionerUsers = await User.find({
      accountType: { $in: ["Practitioner", "Instructor"] },
    }).select("firstName lastName email image accountType credentials bio specialties languages").lean()

    const results = []

    for (let u of practitionerUsers) {
      // Find or create PractitionerProfile
      let profile = await PractitionerProfile.findOne({ user: u._id }).lean()

      if (!profile) {
        profile = await PractitionerProfile.create({
          user: u._id,
          credentials: u.credentials || "",
          bio: u.bio || "",
          specialties: u.specialties || [],
          languages: u.languages || ["English"],
          sessionRate: 0,
          formats: [],
          verified: true,
          rating: null,
          reviewCount: 0,
        })
        profile = profile.toObject()
      }

      // Populate user field
      profile.user = {
        _id: u._id,
        firstName: u.firstName,
        lastName: u.lastName,
        email: u.email,
        image: u.image,
        accountType: u.accountType,
      }

      // Attach all offers created by this practitioner from MongoDB
      const userOffers = await Offer.find({ practitioner: u._id }).lean()
      profile.offers = userOffers || []
      profile.userOffers = userOffers || []

      if (userOffers.length > 0) {
        const minPrice = Math.min(...userOffers.map((o) => o.price || 0))
        if (minPrice > 0) profile.sessionRate = minPrice
        const offerFormats = [...new Set(userOffers.map((o) => (o.type === "circle" ? "Group Circles" : "1:1 Sessions")))]
        if (offerFormats.length > 0) {
          profile.formats = offerFormats
        }
      }

      // Apply category/need filter
      if (need && need !== "all") {
        const needRegex = new RegExp(need, "i")
        const matchesSpecialties = (profile.specialties || []).some((s) => needRegex.test(s))
        const matchesOffers = (profile.offers || []).some((o) => needRegex.test(o.title) || needRegex.test(o.type))
        if (!matchesSpecialties && !matchesOffers) continue
      }

      // Apply format filter
      if (fmt && fmt !== "all") {
        const fmtRegex = new RegExp(fmt, "i")
        const matchesFormats = (profile.formats || []).some((f) => fmtRegex.test(f))
        if (!matchesFormats) continue
      }

      // Apply language filter
      if (lang && lang !== "all") {
        const langRegex = new RegExp(lang, "i")
        const matchesLang = (profile.languages || []).some((l) => langRegex.test(l))
        if (!matchesLang) continue
      }

      // Apply search query filter
      if (q && q.trim()) {
        const qLower = q.toLowerCase().trim()
        const offerTitles = (profile.offers || []).map((o) => o.title).join(" ")
        const fullText = `${u.firstName || ""} ${u.lastName || ""} ${profile.credentials || ""} ${profile.bio || ""} ${(profile.specialties || []).join(" ")} ${offerTitles}`.toLowerCase()
        if (!fullText.includes(qLower)) continue
      }

      results.push(profile)
    }

    // Sort results
    if (sort === "rating") {
      results.sort((a, b) => (b.rating || 5) - (a.rating || 5))
    } else if (sort === "rate_low") {
      results.sort((a, b) => (a.sessionRate || 0) - (b.sessionRate || 0))
    } else if (sort === "rate_high") {
      results.sort((a, b) => (b.sessionRate || 0) - (a.sessionRate || 0))
    }

    // Calculate pagination
    const pageNum = Math.max(1, parseInt(page, 10) || 1)
    const limitNum = Math.max(1, parseInt(limit, 10) || 50)
    const totalPractitioners = results.length
    const totalPages = Math.ceil(totalPractitioners / limitNum) || 1

    const startIndex = (pageNum - 1) * limitNum
    const paginatedProfiles = results.slice(startIndex, startIndex + limitNum)

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
      message: "Failed to fetch practitioners",
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

    const Offer = require("../models/Offer")
    const userOffers = await Offer.find({ practitioner: profile.user._id }).lean()
    const profileObj = profile.toObject()
    profileObj.offers = userOffers || []
    profileObj.userOffers = userOffers || []

    return res.status(200).json({
      success: true,
      data: profileObj,
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
    const CheckIn = require("../models/CheckIn")
    const ClientConnection = require("../models/ClientConnection")
    const profile = await PractitionerProfile.findOne({ user: userId })
    const bookings = await Booking.find({ practitioner: userId }).populate("client", "firstName lastName email")
    const payouts = await Payout.find({ practitioner: userId }).sort({ createdAt: -1 })
    const circles = await CircleCohort.find({ practitioner: userId }).sort({ createdAt: -1 })

    const totalEarnings = bookings.reduce((sum, b) => sum + (b.netPayout || b.amount * 0.92), 0)
    const activeClientsCount = new Set(bookings.map((b) => b.client?._id?.toString())).size

    // Compute real circle fill rate from actual enrollment data
    const totalSeats = circles.reduce((s, c) => s + (c.maxCapacity || 0), 0)
    const filledSeats = circles.reduce((s, c) => s + (c.enrolledCount || 0), 0)
    const circleFillRate = totalSeats > 0 ? `${Math.round((filledSeats / totalSeats) * 100)}%` : "0%"

    // Compute real avg wellbeing from connected client check-ins
    const connections = await ClientConnection.find({ practitioner: userId, status: { $in: ["approved", "active"] } })
    const clientIds = connections.map((c) => c.client)
    const checkIns = await CheckIn.find({ client: { $in: clientIds } })
    const wellbeingScore = checkIns.length > 0
      ? Math.round(checkIns.reduce((s, c) => s + (c.score || c.wellbeing || 0), 0) / checkIns.length)
      : 0

    return res.status(200).json({
      success: true,
      telemetry: {
        totalEarnings,
        activeClientsCount,
        circleFillRate,
        wellbeingScore,
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
    const { practitionerId, amountPaid, paymentId, orderId } = req.body

    if (!practitionerId) {
      return res.status(400).json({ success: false, message: "Practitioner ID is required" })
    }

    if (!amountPaid || isNaN(Number(amountPaid)) || Number(amountPaid) <= 0) {
      return res.status(400).json({ success: false, message: "Valid Razorpay payment amount is required" })
    }

    let practUser = await User.findById(practitionerId)
    if (!practUser) {
      const pProfile = await PractitionerProfile.findById(practitionerId)
      if (pProfile) practUser = await User.findById(pProfile.user)
    }

    if (!practUser) {
      return res.status(404).json({ success: false, message: "Practitioner not found" })
    }

    const numericAmount = Number(amountPaid)
    const transactionPaymentId = paymentId || `pay_rzp_${Date.now()}`
    const transactionOrderId = orderId || `order_rzp_${Date.now()}`

    // Create/Update ClientConnection record — this is the primary record for direct connections
    const connection = await ClientConnection.findOneAndUpdate(
      { client: clientId, practitioner: practUser._id },
      {
        status: "pending_approval",
        amountPaid: numericAmount,
        paymentId: transactionPaymentId,
        orderId: transactionOrderId,
        paymentStatus: "paid",
      },
      { upsert: true, new: true }
    )

    return res.status(200).json({
      success: true,
      message: `Payment of ₹${numericAmount} received! Connection request sent to ${practUser.firstName} for approval.`,
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
