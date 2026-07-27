const User = require("../models/User")
const PractitionerProfile = require("../models/PractitionerProfile")
const Booking = require("../models/Booking")
const Payout = require("../models/Payout")
const Invoice = require("../models/Invoice")

// Seed sample initial practitioners if directory is empty
const SAMPLE_PRACTITIONERS = [
  {
    firstName: "Meera",
    lastName: "Iyer",
    email: "meera.iyer@openhand.example",
    credentials: "Clinical Psychologist · 12 yrs",
    bio: "Works with high-functioning anxiety in people who look fine from the outside and aren't. Direct, warm, no jargon.",
    specialties: ["anxiety", "career", "burnout", "cbt"],
    formats: ["1:1", "circle"],
    languages: ["English", "Tamil"],
    sessionRate: 3500,
    avatarInitials: "MI",
    handle: "meera-iyer",
    verificationStatus: "verified",
    availabilityText: "Next slot in 2 days",
  },
  {
    firstName: "Rohan",
    lastName: "Deshmukh",
    email: "rohan.deshmukh@openhand.example",
    credentials: "Relationship Counsellor · 8 yrs",
    bio: "Couples work, mostly with people who've stopped arguing and started going quiet. Runs a six-week container twice a year.",
    specialties: ["relationships", "communication", "couples"],
    formats: ["1:1", "circle"],
    languages: ["English", "Marathi", "Hindi"],
    sessionRate: 4000,
    avatarInitials: "RD",
    handle: "rohan-deshmukh",
    verificationStatus: "verified",
    availabilityText: "Next slot in 5 days",
  },
  {
    firstName: "Aisha",
    lastName: "Rahman",
    email: "aisha.rahman@openhand.example",
    credentials: "Grief Practitioner · 15 yrs",
    bio: "Holds a monthly grief circle and private sessions. Believes grief isn't a problem to fix — it's a thing to be accompanied through.",
    specialties: ["grief", "trauma", "loss"],
    formats: ["circle", "membership"],
    languages: ["English", "Hindi", "Bengali"],
    sessionRate: 2800,
    avatarInitials: "AR",
    handle: "aisha-rahman",
    verificationStatus: "verified",
    availabilityText: "Circle starts 4 Aug",
  },
  {
    firstName: "Vikram",
    lastName: "Nair",
    email: "vikram.nair@openhand.example",
    credentials: "Executive Coach · 10 yrs",
    bio: "Ex-operator turned coach. Works with founders and senior managers who are functionally succeeding and privately unravelling.",
    specialties: ["career", "anxiety", "leadership", "burnout"],
    formats: ["1:1", "membership"],
    languages: ["English"],
    sessionRate: 6500,
    avatarInitials: "VN",
    handle: "vikram-nair",
    verificationStatus: "verified",
    availabilityText: "Next slot tomorrow",
  },
  {
    firstName: "Kavita",
    lastName: "Joshi",
    email: "kavita.joshi@openhand.example",
    credentials: "Psychotherapist · 18 yrs",
    bio: "Trauma-informed, somatic-leaning. Slow work, long arcs. Takes a small caseload and keeps it that way on purpose.",
    specialties: ["trauma", "anxiety", "somatic", "emdr"],
    formats: ["1:1"],
    languages: ["English", "Hindi", "Marathi"],
    sessionRate: 5000,
    avatarInitials: "KJ",
    handle: "kavita-joshi",
    verificationStatus: "verified",
    availabilityText: "Waitlist — 3 weeks",
  },
  {
    firstName: "Sneha",
    lastName: "Kulkarni",
    email: "sneha.kulkarni@openhand.example",
    credentials: "Parenting Coach · 7 yrs",
    bio: "For parents who read all the books and still feel like they're getting it wrong. Runs a monthly circle for new parents.",
    specialties: ["parenting", "relationships", "new parents"],
    formats: ["circle", "membership"],
    languages: ["English", "Marathi", "Hindi"],
    sessionRate: 799,
    avatarInitials: "SK",
    handle: "sneha-kulkarni",
    verificationStatus: "verified",
    availabilityText: "Circle starts 12 Aug",
  },
]

exports.getPractitioners = async (req, res) => {
  try {
    const { need, fmt, lang, q, page = 1, limit = 6, sort = "featured" } = req.query

    // 1. Seed initial sample practitioners if collection empty
    let count = await PractitionerProfile.countDocuments()
    if (count === 0) {
      for (const pData of SAMPLE_PRACTITIONERS) {
        let u = await User.findOne({ email: pData.email })
        if (!u) {
          u = await User.create({
            firstName: pData.firstName,
            lastName: pData.lastName,
            email: pData.email,
            password: "hashed_dummy_password_openhand",
            accountType: "Practitioner",
            additionalDetails: "600000000000000000000000",
          })
        }
        const profile = await PractitionerProfile.create({
          user: u._id,
          credentials: pData.credentials,
          bio: pData.bio,
          specialties: pData.specialties,
          formats: pData.formats,
          languages: pData.languages,
          sessionRate: pData.sessionRate,
          avatarInitials: pData.avatarInitials,
          handle: pData.handle,
          verificationStatus: pData.verificationStatus,
          availabilityText: pData.availabilityText,
        })
        u.practitionerProfile = profile._id
        await u.save()
      }
    }

    // 2. Ensure ALL registered users with accountType "Practitioner" or "Instructor" have a PractitionerProfile
    const registeredPractitioners = await User.find({
      accountType: { $in: ["Practitioner", "Instructor"] },
    })

    for (const u of registeredPractitioners) {
      let existingProfile = await PractitionerProfile.findOne({ user: u._id })
      if (!existingProfile) {
        const initials = `${u.firstName?.slice(0, 1) || 'P'}${u.lastName?.slice(0, 1) || 'R'}`.toUpperCase()
        const createdProfile = await PractitionerProfile.create({
          user: u._id,
          credentials: "Verified Clinical Practitioner",
          bio: `Certified practitioner specializing in holistic guidance, mental wellbeing, and client growth.`,
          specialties: ["anxiety", "mindfulness", "career"],
          formats: ["1:1", "circle"],
          languages: ["English", "Hindi"],
          sessionRate: 2500,
          avatarInitials: initials,
          handle: `${u.firstName.toLowerCase()}-${u.lastName.toLowerCase() || 'guide'}-${u._id.toString().slice(-4)}`,
          verificationStatus: "verified",
          availabilityText: "Accepting new clients",
        })
        u.practitionerProfile = createdProfile._id
        await u.save()
      }
    }

    // 3. Build query filters
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

    // Ensure every profile has a valid user object (fallback for sample/directory profiles)
    allProfiles = allProfiles.map((p) => {
      if (!p.user) {
        const handleParts = (p.handle || "verified-guide").split("-")
        const fName = handleParts[0] ? handleParts[0].charAt(0).toUpperCase() + handleParts[0].slice(1) : "Verified"
        const lName = handleParts[1] ? handleParts[1].charAt(0).toUpperCase() + handleParts[1].slice(1) : "Guide"
        p.user = {
          _id: p._id,
          firstName: fName,
          lastName: lName,
          email: `${p.handle || "guide"}@openhand.example`,
          accountType: "Practitioner",
        }
      }
      return p
    })

    // Attach active published offers & compute dynamic session rates
    const Offer = require("../models/Offer")
    for (let p of allProfiles) {
      if (p.user?._id) {
        const userOffers = await Offer.find({ practitioner: p.user._id, status: "published" }).lean()
        p.offers = userOffers
        if (userOffers.length > 0) {
          const minPrice = Math.min(...userOffers.map((o) => o.price || 0))
          p.sessionRate = minPrice
          const offerFormats = [...new Set(userOffers.map((o) => (o.type === "circle" ? "Group Circles" : "1:1 Sessions")))]
          if (offerFormats.length > 0) {
            p.formats = offerFormats
          }
        }
      }
    }

    // Filter out accounts that are not practitioners/instructors (if explicit accountType set)
    allProfiles = allProfiles.filter(
      (p) => !p.user?.accountType || ["Practitioner", "Instructor"].includes(p.user.accountType)
    )

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

    // 4. Calculate pagination
    const pageNum = Math.max(1, parseInt(page, 10) || 1)
    const limitNum = Math.max(1, parseInt(limit, 10) || 6)
    const totalPractitioners = allProfiles.length
    const totalPages = Math.ceil(totalPractitioners / limitNum) || 1

    const startIndex = (pageNum - 1) * limitNum
    const paginatedProfiles = allProfiles.slice(startIndex, startIndex + limitNum)

    return res.status(200).json({
      success: true,
      data: paginatedProfiles,
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
    const profile = await PractitionerProfile.findOne({ user: userId })
    const bookings = await Booking.find({ practitioner: userId }).populate("client", "firstName lastName email")
    const payouts = await Payout.find({ practitioner: userId }).sort({ createdAt: -1 })

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
      },
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
