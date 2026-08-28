const crypto = require("crypto")
const { getRazorpayKeys } = require("../config/razorpay")
const mailSender = require("../utils/mailSender")
const User = require("../models/User")
const PractitionerProfile = require("../models/PractitionerProfile")
const Booking = require("../models/Booking")
const Payout = require("../models/Payout")
const Invoice = require("../models/Invoice")
const Offer = require("../models/Offer")


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
      const userOffers = await Offer.find({
        $or: [{ practitioner: u._id }, { practitioner: profile._id }],
      }).lean()
      profile.offers = userOffers || []
      profile.userOffers = userOffers || []

      if (userOffers.length > 0) {
        const minPrice = Math.min(...userOffers.map((o) => o.price || 0))
        profile.sessionRate = minPrice > 0 ? minPrice : 0
        const offerFormats = [...new Set(userOffers.map((o) => (o.type === "circle" ? "Group Circles" : "1:1 Sessions")))]
        profile.formats = offerFormats.length > 0 ? offerFormats : []
      } else {
        // Skip practitioners who have not published any offers yet
        continue
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
    const cleanParam = (handle || "").toLowerCase().trim().replace(/[^a-z0-9-]/gi, '-')

    let profile = await PractitionerProfile.findOne({
      $or: [
        { handle: cleanParam },
        { handle: new RegExp(`^${cleanParam}$`, "i") }
      ]
    }).populate({
      path: "user",
      select: "firstName lastName email image accountType credentials bio specialties languages",
    })

    if (!profile) {
      // Search user by name slug or handle or first name
      const nameParts = cleanParam.split("-")
      const firstNameRegex = new RegExp(`^${nameParts[0]}$`, "i")
      const lastNameRegex = nameParts.length > 1 ? new RegExp(`^${nameParts.slice(1).join(" ")}$`, "i") : null

      const userQuery = { firstName: firstNameRegex }
      if (lastNameRegex) userQuery.lastName = lastNameRegex

      let user = await User.findOne(userQuery).select("firstName lastName email image accountType credentials bio specialties languages").lean()

      if (!user) {
        user = await User.findOne({
          accountType: { $in: ["Practitioner", "Instructor"] },
          firstName: new RegExp(nameParts[0], "i"),
        }).select("firstName lastName email image accountType credentials bio specialties languages").lean()
      }

      if (!user) {
        user = await User.findOne({ accountType: { $in: ["Practitioner", "Instructor"] } }).select("firstName lastName email image accountType credentials bio specialties languages").lean()
      }

      if (user) {
        let existingProf = await PractitionerProfile.findOne({ user: user._id })
        if (!existingProf) {
          existingProf = await PractitionerProfile.create({
            user: user._id,
            handle: cleanParam || `${user.firstName?.toLowerCase() || 'practitioner'}`,
            credentials: user.credentials || "Verified Practitioner",
            bio: user.bio || "Welcome to my official practice booking page.",
            specialties: user.specialties?.length ? user.specialties : ["Holistic Care", "Wellness Coaching"],
            languages: user.languages?.length ? user.languages : ["English"],
            verified: true,
          })
        } else {
          existingProf.handle = cleanParam
          await existingProf.save()
        }
        profile = await PractitionerProfile.findById(existingProf._id).populate({
          path: "user",
          select: "firstName lastName email image accountType credentials bio specialties languages",
        })
      }
    }

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Practitioner profile not found",
      })
    }

    const Offer = require("../models/Offer")
    const RatingAndReview = require("../models/RatingandReview")

    const userOffers = await Offer.find({
      $or: [{ practitioner: profile.user?._id || profile.user }, { practitioner: profile._id }],
    }).lean()

    const reviews = await RatingAndReview.find({ practitioner: profile.user?._id || profile.user })
      .populate("user", "firstName lastName image")
      .lean()

    const profileObj = profile.toObject()
    profileObj.offers = userOffers || []
    profileObj.userOffers = userOffers || []
    profileObj.reviews = reviews || []

    return res.status(200).json({
      success: true,
      data: profileObj,
    })
  } catch (error) {
    console.error("Get Practitioner By Handle Error:", error)
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

    let profile = await PractitionerProfile.findOne({ user: userId }).populate({
      path: "user",
      select: "firstName lastName email image accountType credentials bio specialties languages",
    })

    if (!profile) {
      profile = await PractitionerProfile.create({
        user: userId,
        handle: `practitioner-${userId.toString().slice(-4)}`,
        credentials: "Verified Practitioner",
        bio: "Welcome to my official practice booking page.",
        specialties: ["Holistic Care", "Wellness Coaching"],
        languages: ["English"],
        verified: true,
      })
      profile = await PractitionerProfile.findById(profile._id).populate({
        path: "user",
        select: "firstName lastName email image accountType credentials bio specialties languages",
      })
    }

    const bookings = await Booking.find({ practitioner: userId }).populate("client", "firstName lastName email")
    const payouts = await Payout.find({ practitioner: userId }).sort({ createdAt: -1 })
    const circles = await CircleCohort.find({ practitioner: userId }).sort({ createdAt: -1 })

    const totalEarnings = bookings.reduce((sum, b) => sum + (b.netPayout || b.amount * 0.92), 0)
    const activeClientsCount = new Set(bookings.map((b) => b.client?._id?.toString())).size

    const totalSeats = circles.reduce((s, c) => s + (c.maxCapacity || 0), 0)
    const filledSeats = circles.reduce((s, c) => s + (c.enrolledCount || 0), 0)
    const circleFillRate = totalSeats > 0 ? `${Math.round((filledSeats / totalSeats) * 100)}%` : "0%"

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
      practitioner: profile,
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
    const {
      practitionerId,
      amountPaid,
      paymentId,
      orderId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      offerId,
    } = req.body

    if (!practitionerId) {
      return res.status(400).json({ success: false, message: "Practitioner ID is required" })
    }

    if (!amountPaid || isNaN(Number(amountPaid)) || Number(amountPaid) <= 0) {
      return res.status(400).json({ success: false, message: "Valid payment amount is required" })
    }

    let practUser = await User.findById(practitionerId)
    if (!practUser) {
      const pProfile = await PractitionerProfile.findById(practitionerId)
      if (pProfile) practUser = await User.findById(pProfile.user)
    }

    if (!practUser) {
      return res.status(404).json({ success: false, message: "Practitioner not found" })
    }

    const rzpOrderId = razorpay_order_id || orderId || `order_rzp_${Date.now()}`
    const rzpPaymentId = razorpay_payment_id || paymentId || `pay_rzp_${Date.now()}`

    // Verify Razorpay Signature if provided
    if (razorpay_signature && (razorpay_order_id || orderId) && (razorpay_payment_id || paymentId)) {
      try {
        const { key_secret } = getRazorpayKeys()
        const expectedSig = crypto
          .createHmac("sha256", key_secret)
          .update(`${rzpOrderId}|${rzpPaymentId}`)
          .digest("hex")

        if (expectedSig !== razorpay_signature) {
          return res.status(400).json({
            success: false,
            message: "Razorpay signature verification failed",
          })
        }
      } catch (sigErr) {
        console.warn("Razorpay verification warning:", sigErr.message)
      }
    }

    const grossAmount = Number(amountPaid)

    // Calculate commission rate based on practitioner profile plan
    let profile = await PractitionerProfile.findOne({ user: practUser._id })
    const commissionRate = profile
      ? profile.plan === "master" || profile.plan === "practice"
        ? 0
        : profile.plan === "growth"
        ? 5
        : 8
      : 8

    const commission = Math.round((grossAmount * commissionRate) / 100)
    const netPayout = grossAmount - commission

    // 1. Create/Update ClientConnection record
    const connection = await ClientConnection.findOneAndUpdate(
      { client: clientId, practitioner: practUser._id },
      {
        status: "pending_approval",
        amountPaid: grossAmount,
        paymentId: rzpPaymentId,
        orderId: rzpOrderId,
        paymentStatus: "paid",
      },
      { upsert: true, new: true }
    )

    // 2. Create Booking record
    let targetOfferId = offerId
    if (!targetOfferId) {
      const defaultOffer = await Offer.findOne({ practitioner: practUser._id })
      if (defaultOffer) targetOfferId = defaultOffer._id
    }

    const booking = await Booking.create({
      client: clientId,
      practitioner: practUser._id,
      offer: targetOfferId || new mongoose.Types.ObjectId(),
      offerType: "session",
      amount: grossAmount,
      commission,
      netPayout,
      paymentGateway: "razorpay",
      razorpayOrderId: rzpOrderId,
      razorpayPaymentId: rzpPaymentId,
      status: "confirmed",
      settlementStatus: "pending_t2",
      scheduledAt: new Date(Date.now() + 86400000),
    })

    // 3. Create Payout record crediting practitioner
    const payout = await Payout.create({
      practitioner: practUser._id,
      amount: grossAmount,
      commissionDeducted: commission,
      netAmount: netPayout,
      status: "settled",
      settledAt: new Date(),
      payoutMethod: "razorpay_direct_transfer",
      bookingsCount: 1,
    })

    // 4. Create Invoice record
    const invoiceNum = `OH-${Date.now().toString().slice(-6)}`
    await Invoice.create({
      booking: booking._id,
      client: clientId,
      practitioner: practUser._id,
      invoiceNumber: invoiceNum,
      subtotal: grossAmount,
      gstRatePercentage: 18,
      gstAmount: Math.round(grossAmount * 0.18),
      totalAmount: grossAmount,
      status: "paid",
    })

    // 4b. Log to Admin Payment Ledger
    try {
      const clientUserObj = await User.findById(clientId).select("firstName lastName")
      const clientNameStr = clientUserObj ? `${clientUserObj.firstName} ${clientUserObj.lastName}` : "Client"
      const AdminPaymentLog = require("../models/AdminPaymentLog")
      await AdminPaymentLog.create({
        paymentType: "offer_booking",
        client: clientId,
        clientName: clientNameStr,
        practitioner: practUser._id,
        practitionerName: `${practUser.firstName} ${practUser.lastName}`,
        description: `Practitioner Connection & Offer Booking`,
        amount: grossAmount,
        amountOwedToPractitioner: netPayout,
        paymentGateway: "razorpay",
        razorpayOrderId: rzpOrderId,
        razorpayPaymentId: rzpPaymentId,
        bookingId: booking._id,
        status: "received",
      })
    } catch (logErr) {
      console.warn("AdminPaymentLog creation warning:", logErr.message)
    }

    // 5. Update Practitioner monthly & total earnings telemetry
    if (profile) {
      profile.monthlyEarnings = (profile.monthlyEarnings || 0) + netPayout
      await profile.save()
    }

    // 6. Send notification email to Practitioner and Client
    try {
      const clientUser = await User.findById(clientId)
      const clientName = clientUser ? `${clientUser.firstName} ${clientUser.lastName}` : "A Client"

      if (practUser?.email) {
        await mailSender(
          practUser.email,
          `🎉 New Payment Received — ₹${netPayout} from ${clientName}`,
          `Hi ${practUser.firstName},\n\nYou received a new client payment of ₹${grossAmount} (Net Payout credited to your dashboard: ₹${netPayout} after ${commissionRate}% platform fee).\n\nClient: ${clientName} (${clientUser?.email || ""})\nPayment Ref: ${rzpPaymentId}\nOrder Ref: ${rzpOrderId}\n\nPlease log in to your dashboard under "My Clients" to review and connect.`
        )
      }

      if (clientUser?.email) {
        await mailSender(
          clientUser.email,
          `Payment Receipt — Counseling Session with ${practUser.firstName} ${practUser.lastName}`,
          `Hi ${clientUser.firstName},\n\nYour payment of ₹${grossAmount} for practitioner counseling session with ${practUser.firstName} ${practUser.lastName} was processed successfully via Razorpay.\n\nTransaction Ref: ${rzpPaymentId}\nOrder Ref: ${rzpOrderId}\n\nYour connection request is now sent to ${practUser.firstName} for approval.`
        )
      }
    } catch (mailErr) {
      console.warn("Notification email trigger warning:", mailErr.message)
    }

    return res.status(200).json({
      success: true,
      message: `Payment of ₹${grossAmount} verified & credited! Net Payout ₹${netPayout} allocated to ${practUser.firstName}.`,
      connection,
      booking,
      payout,
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

// ── Get Practitioner Bank Payout Details ──
exports.getBankDetails = async (req, res) => {
  try {
    const userId = req.user.id
    const profile = await PractitionerProfile.findOne({ user: userId }).select(
      "bankAccountName bankAccountNumber bankIfscCode bankName upiId"
    )

    return res.status(200).json({
      success: true,
      bankDetails: profile || {},
    })
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message })
  }
}

// ── Update Practitioner Bank Payout Details ──
exports.updateBankDetails = async (req, res) => {
  try {
    const userId = req.user.id
    const { bankAccountName, bankAccountNumber, bankIfscCode, bankName, upiId } = req.body

    let profile = await PractitionerProfile.findOne({ user: userId })
    if (!profile) {
      profile = await PractitionerProfile.create({ user: userId })
    }

    if (bankAccountName !== undefined) profile.bankAccountName = bankAccountName
    if (bankAccountNumber !== undefined) profile.bankAccountNumber = bankAccountNumber
    if (bankIfscCode !== undefined) profile.bankIfscCode = bankIfscCode
    if (bankName !== undefined) profile.bankName = bankName
    if (upiId !== undefined) profile.upiId = upiId

    await profile.save()

    return res.status(200).json({
      success: true,
      message: "Bank & payout details updated successfully",
      bankDetails: {
        bankAccountName: profile.bankAccountName,
        bankAccountNumber: profile.bankAccountNumber,
        bankIfscCode: profile.bankIfscCode,
        bankName: profile.bankName,
        upiId: profile.upiId,
      },
    })
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message })
  }
}

// ── Update Full Practitioner Profile & Public Link Details ──
exports.updatePractitionerProfile = async (req, res) => {
  try {
    const userId = req.user.id
    const {
      handle,
      credentials,
      bio,
      specialties,
      languages,
      sessionRate,
      bankAccountName,
      bankAccountNumber,
      bankIfscCode,
    } = req.body

    let profile = await PractitionerProfile.findOne({ user: userId })
    if (!profile) {
      profile = await PractitionerProfile.create({ user: userId })
    }

    if (handle) profile.handle = handle.toLowerCase().trim().replace(/[^a-z0-9-]/gi, '-')
    if (credentials !== undefined) profile.credentials = credentials
    if (bio !== undefined) profile.bio = bio
    if (Array.isArray(specialties)) profile.specialties = specialties
    if (Array.isArray(languages)) profile.languages = languages
    if (sessionRate !== undefined) profile.sessionRate = Number(sessionRate)
    if (bankAccountName !== undefined) profile.bankAccountName = bankAccountName
    if (bankAccountNumber !== undefined) profile.bankAccountNumber = bankAccountNumber
    if (bankIfscCode !== undefined) profile.bankIfscCode = bankIfscCode

    await profile.save()

    // Sync to User document
    const userUpdate = {}
    if (credentials !== undefined) userUpdate.credentials = credentials
    if (bio !== undefined) userUpdate.bio = bio
    if (Array.isArray(specialties)) userUpdate.specialties = specialties
    if (Array.isArray(languages)) userUpdate.languages = languages

    if (Object.keys(userUpdate).length > 0) {
      await User.findByIdAndUpdate(userId, userUpdate)
    }

    const updatedProfile = await PractitionerProfile.findOne({ user: userId }).populate("user", "firstName lastName email image")

    return res.status(200).json({
      success: true,
      message: "Practitioner profile updated successfully",
      profile: updatedProfile,
    })
  } catch (error) {
    console.error("Update Practitioner Profile Error:", error)
    return res.status(500).json({
      success: false,
      message: "Failed to update practitioner profile",
      error: error.message,
    })
  }
}

// ── Get Practitioner Intake Questions (Stage 02) ──
exports.getIntakeQuestions = async (req, res) => {
  try {
    const { practitionerId } = req.params
    const profile = await PractitionerProfile.findOne({ user: practitionerId })

    const defaultQuestions = [
      "What brought you to this session today?",
      "What have you tried so far to address this?",
      "What is your primary goal for our work together?",
      "How would you rate your current stress or burnout level (1-10)?",
      "Are there specific topics or boundaries you want to focus on?",
      "What outcome would make this journey a success for you in 6 weeks?",
    ]

    const questions = profile?.intakeQuestions?.length ? profile.intakeQuestions : defaultQuestions

    return res.status(200).json({
      success: true,
      questions,
    })
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message })
  }
}

// ── Update Practitioner Intake Questions ──
exports.updateIntakeQuestions = async (req, res) => {
  try {
    const userId = req.user.id
    const { questions } = req.body

    if (!Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ success: false, message: "Questions array is required" })
    }

    let profile = await PractitionerProfile.findOne({ user: userId })
    if (!profile) {
      profile = await PractitionerProfile.create({ user: userId })
    }

    profile.intakeQuestions = questions.slice(0, 6)
    await profile.save()

    return res.status(200).json({
      success: true,
      message: "Intake questions updated successfully",
      questions: profile.intakeQuestions,
    })
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message })
  }
}

// ── Submit Intake Answers for a Booking (Learner side) ──
exports.submitIntakeAnswers = async (req, res) => {
  try {
    const { bookingId, answers } = req.body

    if (!bookingId || !Array.isArray(answers)) {
      return res.status(400).json({ success: false, message: "bookingId and answers array are required" })
    }

    const booking = await Booking.findById(bookingId)
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" })
    }

    booking.intakeAnswers = answers
    await booking.save()

    return res.status(200).json({
      success: true,
      message: "Intake answers submitted successfully",
      intakeAnswers: booking.intakeAnswers,
    })
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message })
  }
}

// ── Get Intake Answers for a Booking ──
exports.getIntakeAnswers = async (req, res) => {
  try {
    const { bookingId } = req.params

    const booking = await Booking.findById(bookingId).populate("client", "firstName lastName email image")
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" })
    }

    return res.status(200).json({
      success: true,
      intakeAnswers: booking.intakeAnswers || [],
      client: booking.client,
      status: booking.status,
    })
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message })
  }
}

