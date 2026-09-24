const Profile = require("../models/Profile")
const User = require("../models/User")
const Booking = require("../models/Booking")
const LiveClass = require("../models/LiveClass")
const PractitionerProfile = require("../models/PractitionerProfile")
const Offer = require("../models/Offer")
const CircleCohort = require("../models/CircleCohort")
const Payout = require("../models/Payout")
const Invoice = require("../models/Invoice")
const SessionNoteDraft = require("../models/SessionNoteDraft")
const CheckIn = require("../models/CheckIn")
const ReflectionPrompt = require("../models/ReflectionPrompt")
const RatingAndReview = require("../models/RatingandReview")
const CircleMembership = require("../models/CircleMembership")
const ClientConnection = require("../models/ClientConnection")
const Subscription = require("../models/Subscription")
const { uploadFileToS3 } = require("../utils/imageUploader")
const mongoose = require("mongoose")
const { convertSecondsToDuration } = require("../utils/secToDuration")

// Method for updating a profile
exports.updateProfile = async (req, res) => {
  try {
    const {
      title = "",
      firstName = "",
      lastName = "",
      dateOfBirth = "",
      about = "",
      contactNumber = "",
      gender = "",
    } = req.body
    const id = req.user.id

    // Find the user details
    const userDetails = await User.findById(id)
    if (!userDetails) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      })
    }

    // Find or create profile
    let profile = userDetails.additionalDetails
      ? await Profile.findById(userDetails.additionalDetails)
      : null

    if (!profile) {
      profile = await Profile.create({
        gender: gender || "",
        dateOfBirth: dateOfBirth || "",
        about: about || "",
        contactNumber: contactNumber || "",
      })
      userDetails.additionalDetails = profile._id
      await userDetails.save()
    } else {
      profile.dateOfBirth = dateOfBirth
      profile.about = about
      profile.contactNumber = contactNumber
      profile.gender = gender
      await profile.save()
    }

    // Update user details (learnerId is strictly immutable and cannot be modified)
    const updateUserData = {}
    if (title !== undefined) updateUserData.title = title
    if (firstName !== undefined) updateUserData.firstName = firstName
    if (lastName !== undefined) updateUserData.lastName = lastName
    if (contactNumber !== undefined) updateUserData.contactNumber = contactNumber

    await User.findByIdAndUpdate(id, updateUserData, { new: true })

    // Find the updated user details
    let updatedUserDetails = await User.findById(id)
      .populate("additionalDetails")
      .exec()

    // Auto-generate & assign learnerId if learner account is missing one
    const isLearner = updatedUserDetails.accountType === "Learner" || updatedUserDetails.accountType === "Client" || updatedUserDetails.accountType === "Student"
    if (isLearner && !updatedUserDetails.learnerId) {
      try {
        const { generateUniqueLearnerId } = require("../utils/learnerIdGenerator")
        updatedUserDetails.learnerId = await generateUniqueLearnerId(User)
        await updatedUserDetails.save()
      } catch (err) {
        console.error("Error auto-generating learnerId in updateProfile:", err.message)
      }
    }

    return res.json({
      success: true,
      message: "Profile updated successfully",
      updatedUserDetails,
    })
  } catch (error) {
    console.error("updateProfile error:", error)
    return res.status(500).json({
      success: false,
      error: error.message,
    })
  }
}

exports.deleteAccount = async (req, res) => {
  try {
    const id = req.user.id
    const user = await User.findById(id)
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    const scheduledAt = new Date()
    const effectiveDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)

    user.isDeleted = true
    user.deletionScheduledAt = scheduledAt
    user.deletionEffectiveDate = effectiveDate
    user.active = false
    user.token = null
    await user.save()

    return res.status(200).json({
      success: true,
      message: "Your account is scheduled for permanent deletion in 30 days. You will be signed out now.",
      deletionScheduledAt: scheduledAt,
      deletionEffectiveDate: effectiveDate,
      daysRemaining: 30,
    })
  } catch (error) {
    console.error("deleteAccount error:", error)
    return res.status(500).json({
      success: false,
      message: "Failed to schedule account deletion. Please try again.",
      error: error.message,
    })
  }
}

exports.getAllUserDetails = async (req, res) => {
  try {
    const id = req.user.id
    let userDetails = await User.findById(id)
      .populate("additionalDetails")
      .exec()
    if (!userDetails) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    // Auto-generate & assign learnerId if learner account is missing one
    const isLearner = userDetails.accountType === "Learner" || userDetails.accountType === "Client" || userDetails.accountType === "Student"
    if (isLearner && !userDetails.learnerId) {
      try {
        const { generateUniqueLearnerId } = require("../utils/learnerIdGenerator")
        userDetails.learnerId = await generateUniqueLearnerId(User)
        await userDetails.save()
      } catch (err) {
        console.error("Error auto-generating learnerId in getAllUserDetails:", err.message)
      }
    }

    res.status(200).json({
      success: true,
      message: "User Data fetched successfully",
      data: userDetails,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

exports.updateDisplayPicture = async (req, res) => {
  try {
    if (!req.files || !req.files.displayPicture) {
      return res.status(400).json({
        success: false,
        message: "No display picture uploaded",
      })
    }

    const displayPicture = req.files.displayPicture
    const userId = req.user.id
    const image = await uploadFileToS3(
      displayPicture,
      "profile_pictures"
    )
    const updatedProfile = await User.findByIdAndUpdate(
      userId,
      { image: image.url },
      { new: true }
    )
    return res.status(200).json({
      success: true,
      message: "Image Updated successfully",
      data: updatedProfile,
    })
  } catch (error) {
    console.log("UPDATE DISPLAY PICTURE ERROR:", error)
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

exports.deleteDisplayPicture = async (req, res) => {
  try {
    const userId = req.user.id
    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    const defaultImage = `https://api.dicebear.com/5.x/initials/svg?seed=${encodeURIComponent(user.firstName + " " + (user.lastName || ""))}`

    const updatedProfile = await User.findByIdAndUpdate(
      userId,
      { image: defaultImage },
      { new: true }
    )

    return res.status(200).json({
      success: true,
      message: "Profile picture removed successfully",
      data: updatedProfile,
    })
  } catch (error) {
    console.log("DELETE DISPLAY PICTURE ERROR:", error)
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

exports.getEnrolledCourses = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      data: [],
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

exports.instructorDashboard = async (req, res) => {
  try {
    res.status(200).json({ courses: [] })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server Error" })
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Real-time Dynamic Dashboard Aggregators
// ─────────────────────────────────────────────────────────────────────────────

exports.getClientDashboardData = async (req, res) => {
  try {
    const userId = req.user.id
    const user = await User.findById(userId).populate("additionalDetails")
    if (!user) return res.status(404).json({ success: false, message: "User not found" })

    const createdAt = user.createdAt || new Date()
    const daysActive = Math.max(1, Math.floor((Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24)))

    // Check-ins
    let checkIns = []
    try {
      checkIns = (await CheckIn.find({ client: userId }).sort({ createdAt: -1 })) || []
    } catch (e) { checkIns = [] }
    const checkInCount = checkIns.length
    
    // Calculate streak
    let streak = 0
    if (checkIns.length > 0) {
      const uniqueDates = new Set(checkIns.map((c) => new Date(c.createdAt).toDateString()))
      streak = uniqueDates.size
    }

    // Reflections
    let reflections = []
    try {
      reflections = (await ReflectionPrompt.find({ client: userId }).sort({ createdAt: -1 })) || []
    } catch (e) { reflections = [] }

    // Upcoming Live Classes (LiveKit)
    let upcomingClasses = []
    try {
      const rawClasses = (await LiveClass.find({
        status: { $in: ["scheduled", "live"] },
        $or: [
          { sessionType: "group" },
          { sessionType: { $exists: false } },
          { client: userId },
          { "attendees.user": userId },
        ],
      })
        .populate("instructor", "firstName lastName image")
        .populate("client", "firstName lastName image")
        .sort({ scheduledStart: 1 })
        .limit(10)
        .lean()) || []

      upcomingClasses = rawClasses.map((cls) => {
        let title = (cls.title || "").replace(/[*^%$#@!~`+={}\[\]\\|;"'<>,?]/g, " ").replace(/\s+/g, " ").trim()
        title = title.replace(/^[-:/&\s]+/, "").replace(/[-:/&\s]+$/, "")
        const alphaCount = (title.match(/[a-zA-Z0-9]/g) || []).length
        const hasVowelsOrDigits = /[aeiouyAEIOUY0-9]/.test(title)
        if (alphaCount < 2 || (!hasVowelsOrDigits && title.length >= 4)) {
          title = "Live Interactive Session"
        }
        return { ...cls, title }
      })
    } catch (e) { upcomingClasses = [] }

    // Circles
    let joinedCircles = []
    try {
      const CircleCohort = require("../models/CircleCohort")
      joinedCircles = (await CircleCohort.find({ members: userId })
        .populate("practitioner", "firstName lastName email image accountType credentials")
        .lean()) || []
    } catch (e) { joinedCircles = [] }

    let memberships = []
    try {
      memberships = (await CircleMembership.find({
        $or: [{ client: userId }, { user: userId }]
      }).populate("cohort").lean()) || []
    } catch (e) { memberships = [] }

    let conn = null
    try {
      conn = await ClientConnection.findOne({ client: userId, status: { $in: ["approved", "active"] } })
        .populate("practitioner", "firstName lastName email image")
        .lean()
    } catch (e) { conn = null }

    let activePractitioner = conn?.practitioner
    if (!activePractitioner && user.practitionerProfile) {
      try {
        activePractitioner = await User.findById(user.practitionerProfile).select("firstName lastName email image").lean()
      } catch (e) {}
    }

    // Dynamic milestones computed from real user activity
    const milestones = [
      { id: "joined", label: "Joined platform", date: new Date(createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" }), achieved: true },
      { id: "first_checkin", label: "First check-in", date: checkIns.length ? new Date(checkIns[checkIns.length - 1].createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : "Not yet", achieved: checkIns.length > 0 },
      { id: "checkin_count", label: `${checkInCount} check-in(s) logged`, date: checkIns.length ? new Date(checkIns[0].createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : "In progress", achieved: checkInCount >= 1 },
      { id: "circle_joined", label: joinedCircles.length ? `Joined ${joinedCircles.length} Circle(s)` : "Joined a circle", date: (joinedCircles.length || memberships.length) ? "Active" : "Not yet", achieved: (joinedCircles.length > 0 || memberships.length > 0) },
    ]

    // Auto-generate & assign learnerId if learner account is missing one
    const isLearner = user.accountType === "Learner" || user.accountType === "Client" || user.accountType === "Student"
    if (isLearner && !user.learnerId) {
      try {
        const { generateUniqueLearnerId } = require("../utils/learnerIdGenerator")
        user.learnerId = await generateUniqueLearnerId(User)
        await user.save()
      } catch (err) {
        console.error("Error auto-generating learnerId in getClientDashboardData:", err.message)
      }
    }

    return res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id,
          learnerId: user.learnerId,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          image: user.image,
          accountType: user.accountType,
          daysActive,
          createdAt: user.createdAt,
          activePlan: user.activePlan,
        },
        practitioner: activePractitioner ? {
          id: activePractitioner._id,
          name: `${activePractitioner.firstName} ${activePractitioner.lastName || ""}`.trim(),
          firstName: activePractitioner.firstName,
          lastName: activePractitioner.lastName,
          avatar: activePractitioner.image,
          email: activePractitioner.email,
        } : null,
        checkInCount,
        streak,
        checkIns,
        reflections,
        upcomingClasses,
        memberships,
        joinedCircles,
        milestones,
        subscriptionStatus: {
          subscription: null,
          hasActiveSubscription: true,
          isTrialActive: false,
          isFreeLearner: true,
          trialDaysRemaining: 0,
          trialExpiresAt: null,
          status: "free_learner",
          planName: "Free Learner Account",
        },
      },
    })
  } catch (error) {
    console.error("getClientDashboardData error:", error)
    return res.status(500).json({ success: false, message: error.message })
  }
}

exports.getPractitionerDashboardData = async (req, res) => {
  try {
    const userId = req.user.id
    const user = await User.findById(userId).populate("additionalDetails")

    // Upcoming live classes created by this instructor
    const upcomingClasses = await LiveClass.find({ instructor: userId })
      .sort({ scheduledStart: 1 })
      .lean()

    // Practitioner profile & offers
    const profile = await PractitionerProfile.findOne({ user: userId })
    const offers = await Offer.find({ practitioner: userId })
    const circles = await CircleCohort.find({ practitioner: userId })

    // Payouts & Invoices
    const payouts = await Payout.find({ practitioner: userId }).sort({ createdAt: -1 })
    const invoices = await Invoice.find({ practitioner: userId }).sort({ createdAt: -1 })
    const bookingsList = await Booking.find({ practitioner: userId })
      .populate({
        path: "client",
        select: "firstName lastName email image createdAt learnerId contactNumber additionalDetails",
        populate: { path: "additionalDetails", select: "contactNumber" },
      })
      .lean()

    // Compute earnings dynamically
    const bookingEarnings = bookingsList.reduce((sum, b) => sum + (b.netPayout || b.amount * 0.92 || 0), 0)
    const payoutEarnings = payouts.reduce((sum, p) => sum + (p.amount || 0), 0)
    const totalEarnings = Math.max(bookingEarnings, payoutEarnings)

    const monthlyBookingsEarnings = bookingsList
      .filter((b) => new Date(b.createdAt).getMonth() === new Date().getMonth())
      .reduce((sum, b) => sum + (b.netPayout || b.amount * 0.92 || 0), 0)
    const monthlyPayoutEarnings = payouts
      .filter((p) => new Date(p.createdAt).getMonth() === new Date().getMonth())
      .reduce((sum, p) => sum + (p.amount || 0), 0)
    const monthlyEarnings = Math.max(monthlyBookingsEarnings, monthlyPayoutEarnings)

    const clearingThisWeek = payouts
      .filter((p) => p.status === "pending" || p.status === "processing")
      .reduce((sum, p) => sum + (p.amount || 0), 0)

    // Dynamic Enrolled & Connected Clients — include both approved and active
    const connections = await ClientConnection.find({ practitioner: userId, status: { $in: ["approved", "active"] } })
      .populate({
        path: "client",
        select: "firstName lastName email image createdAt learnerId contactNumber additionalDetails",
        populate: { path: "additionalDetails", select: "contactNumber" },
      })
      .lean()

    const connectedClients = connections.map((c) => c.client).filter(Boolean)
    const bookedClients = bookingsList.map((b) => b.client).filter(Boolean)

    const clientMap = new Map()
    connectedClients.forEach((cl) => clientMap.set(cl._id.toString(), cl))
    bookedClients.forEach((cl) => clientMap.set(cl._id.toString(), cl))

    const dynamicClients = Array.from(clientMap.values())

    // Compute 12 months earnings history dynamically (Jan - Dec)
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    const currentYear = new Date().getFullYear()
    const monthlyHistory = []

    for (let mIdx = 0; mIdx < 12; mIdx++) {
      const mPayouts = payouts.filter((p) => {
        const pDate = new Date(p.createdAt)
        return pDate.getMonth() === mIdx && pDate.getFullYear() === currentYear
      })
      const mBookings = bookingsList.filter((b) => {
        const bDate = new Date(b.createdAt)
        return bDate.getMonth() === mIdx && bDate.getFullYear() === currentYear
      })

      const amount = mPayouts.reduce((s, p) => s + (p.amount || 0), 0) +
        mBookings.reduce((s, b) => s + (b.amount || 0), 0)

      monthlyHistory.push({
        month: monthNames[mIdx],
        amount,
      })
    }

    // Compute real wellbeing check-in score
    const clientIds = dynamicClients.map((c) => c._id)
    const clientCheckIns = await CheckIn.find({ client: { $in: clientIds } }).sort({ createdAt: 1 })
    const checkInClientCount = new Set(clientCheckIns.map((c) => c.client?.toString())).size
    const avgWellbeing = clientCheckIns.length > 0
      ? Math.round(clientCheckIns.reduce((s, c) => s + (c.score || c.wellbeing || 0), 0) / clientCheckIns.length)
      : 0

    // AURA session notes awaiting approval
    const pendingNotes = await SessionNoteDraft.find({ practitioner: userId, status: "draft" })
    const Testimonial = require("../models/Testimonial")
    const Course = require("../models/Course")

    const practitionerCourses = await Course.find({ instructor: userId }).select("_id").lean()
    const courseIds = practitionerCourses.map(c => c._id)

    const testimonials = await Testimonial.find({
      practitioner: userId,
      $or: [{ status: "approved" }, { isApproved: true }]
    }).sort({ createdAt: -1 }).lean()

    const courseReviews = await RatingAndReview.find({
      $or: [
        { practitioner: userId },
        { course: { $in: courseIds } }
      ],
      $and: [
        { $or: [{ status: "approved" }, { isApproved: true }] }
      ]
    }).populate("user", "firstName lastName image").sort({ createdAt: -1 }).lean()

    const practitionerReviews = [
      ...testimonials.map(t => ({
        _id: t._id,
        rating: t.adminRating !== undefined && t.adminRating !== null ? t.adminRating : (t.rating || 5),
        review: t.content,
        clientName: t.clientName || "Verified Client",
        createdAt: t.createdAt
      })),
      ...courseReviews.map(r => ({
        _id: r._id,
        rating: r.adminRating !== undefined && r.adminRating !== null ? r.adminRating : (r.rating || 5),
        review: r.review,
        clientName: r.user ? `${r.user.firstName || ''} ${r.user.lastName || ''}`.trim() : "Verified Client",
        createdAt: r.createdAt
      }))
    ]

    const totalSum = practitionerReviews.reduce((sum, r) => sum + Number(r.rating || 5), 0)
    const computedRating = practitionerReviews.length > 0 ? Number((totalSum / practitionerReviews.length).toFixed(1)) : null
    const finalRating = profile?.adminVerifiedRating !== undefined && profile?.adminVerifiedRating !== null ? profile.adminVerifiedRating : computedRating

    const nameSlug = `${user?.firstName || ''}-${user?.lastName || ''}`
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9-]/gi, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '') || `practitioner-${userId.toString().slice(-4)}`

    let currentHandle = profile?.handle
    if (profile && (!currentHandle || currentHandle === 'Test')) {
      currentHandle = nameSlug
      profile.handle = nameSlug
      await profile.save().catch(() => {})
    }

    return res.status(200).json({
      success: true,
      data: {
        practitioner: {
          id: user?._id,
          title: user?.title || "",
          name: user ? `${user.firstName} ${user.lastName}` : "Practitioner",
          firstName: user?.firstName || "Practitioner",
          lastName: user?.lastName || "",
          email: user?.email || "",
          image: user?.image || "",
          credentials: profile?.credentials || "Licensed Practitioner",
          handle: currentHandle || nameSlug,
          rating: finalRating,
        },
        stats: {
          monthlyEarnings: monthlyEarnings,
          totalEarnings: totalEarnings,
          activeClientsCount: dynamicClients.length,
          checkInClientCount: checkInClientCount,
          clearingThisWeek: clearingThisWeek,
          circleSeatsFilled: circles.reduce((sum, c) => sum + (c.enrolledCount || 0), 0),
          totalCircleCapacity: circles.reduce((sum, c) => sum + (c.maxCapacity || 0), 0),
          avgWellbeing: avgWellbeing,
        },
        monthlyHistory,
        upcomingClasses,
        offers,
        circles,
        payouts,
        invoices,
        clients: dynamicClients,
        pendingNotes,
        reviews: practitionerReviews,
      },
    })



  } catch (error) {
    console.error("getPractitionerDashboardData error:", error)
    return res.status(500).json({ success: false, message: error.message })
  }
}

// Update Practitioner Bio, Credentials, and Specialty Tags
exports.updatePractitionerProfileDetails = async (req, res) => {
  try {
    const userId = req.user.id
    const { bio, credentials, specialties, languages } = req.body

    let profile = await PractitionerProfile.findOne({ user: userId })
    const parsedSpecialties = Array.isArray(specialties)
      ? specialties
      : (specialties ? String(specialties).split(",").map((s) => s.trim()).filter(Boolean) : [])

    const parsedLanguages = Array.isArray(languages)
      ? languages
      : (languages ? String(languages).split(",").map((l) => l.trim()).filter(Boolean) : ["English"])

    if (!profile) {
      profile = await PractitionerProfile.create({
        user: userId,
        bio: bio || "",
        credentials: credentials || "",
        specialties: parsedSpecialties,
        languages: parsedLanguages,
      })
    } else {
      if (bio !== undefined) profile.bio = bio
      if (credentials !== undefined) profile.credentials = credentials
      if (specialties !== undefined) profile.specialties = parsedSpecialties
      if (languages !== undefined) profile.languages = parsedLanguages
      await profile.save()
    }

    // Also update User document credentials, bio, and specialties
    await User.findByIdAndUpdate(userId, {
      credentials: credentials || "",
      bio: bio || "",
      specialties: parsedSpecialties,
    })

    return res.status(200).json({
      success: true,
      message: "Practitioner profile & specialties updated successfully!",
      profile,
    })
  } catch (error) {
    console.error("updatePractitionerProfileDetails error:", error)
    return res.status(500).json({ success: false, message: error.message })
  }
}

