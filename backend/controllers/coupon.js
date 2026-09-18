const Coupon = require("../models/Coupon")
const LearnerDiscount = require("../models/LearnerDiscount")
const CouponUsage = require("../models/CouponUsage")
const CouponSetting = require("../models/CouponSetting")
const Course = require("../models/Course")
const Offer = require("../models/Offer")
const User = require("../models/User")

// ─── Helper: Get or Init Global Stacking Settings ──────────────────────────────
async function getSettings() {
  let settings = await CouponSetting.findOne()
  if (!settings) {
    settings = await CouponSetting.create({
      allowStacking: true,
      stackingPriority: "personal_first",
      allowAdminPractitionerStacking: true,
    })
  }
  return settings
}

// ══════════════════════════════════════════════════════════════════════════════
// 1. ADMIN COUPON CONTROLLERS
// ══════════════════════════════════════════════════════════════════════════════

// Create Platform-wide Admin Coupon
exports.createAdminCoupon = async (req, res) => {
  try {
    const {
      code,
      name,
      description,
      discountType = "percentage",
      discountValue,
      applicableTo = "both",
      applicableCourses = [],
      applicableOffers = [],
      minOrderAmount = 0,
      maxDiscountAmount = null,
      startDate,
      expiryDate,
      usageLimit = null,
      perUserLimit = 1,
      isActive = true,
    } = req.body

    if (!code || !name || discountValue === undefined) {
      return res.status(400).json({
        success: false,
        message: "Code, name, and discount value are required.",
      })
    }

    const cleanCode = String(code).trim().toUpperCase()
    const existing = await Coupon.findOne({ code: cleanCode })
    if (existing) {
      return res.status(400).json({
        success: false,
        message: `Coupon code '${cleanCode}' already exists.`,
      })
    }

    const coupon = await Coupon.create({
      code: cleanCode,
      name: name.trim(),
      description: description || "",
      couponType: "admin",
      discountType,
      discountValue: Number(discountValue),
      applicableTo,
      applicableCourses: applicableCourses || [],
      applicableOffers: applicableOffers || [],
      practitioner: null,
      minOrderAmount: Number(minOrderAmount) || 0,
      maxDiscountAmount: maxDiscountAmount ? Number(maxDiscountAmount) : null,
      startDate: startDate ? new Date(startDate) : new Date(),
      expiryDate: expiryDate ? new Date(expiryDate) : null,
      usageLimit: usageLimit ? Number(usageLimit) : null,
      perUserLimit: Number(perUserLimit) || 1,
      isActive: Boolean(isActive),
      createdBy: req.user.id,
    })

    return res.status(201).json({
      success: true,
      message: `Admin coupon '${cleanCode}' created successfully.`,
      coupon,
    })
  } catch (error) {
    console.error("createAdminCoupon error:", error)
    return res.status(500).json({ success: false, message: error.message })
  }
}

// Get All Admin Coupons (Search, Filter, Paginate)
exports.getAllAdminCoupons = async (req, res) => {
  try {
    const { search, type, applicableTo, status } = req.query

    const filter = {}
    if (type) filter.couponType = type
    if (applicableTo) filter.applicableTo = applicableTo
    if (status === "active") filter.isActive = true
    if (status === "inactive") filter.isActive = false

    if (search) {
      filter.$or = [
        { code: { $regex: search, $options: "i" } },
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ]
    }

    const coupons = await Coupon.find(filter)
      .populate("practitioner", "firstName lastName email")
      .populate("applicableCourses", "title price")
      .populate("applicableOffers", "title price type")
      .populate("createdBy", "firstName lastName email")
      .sort({ createdAt: -1 })
      .lean()

    return res.status(200).json({
      success: true,
      total: coupons.length,
      coupons,
    })
  } catch (error) {
    console.error("getAllAdminCoupons error:", error)
    return res.status(500).json({ success: false, message: error.message })
  }
}

// Update Admin Coupon
exports.updateAdminCoupon = async (req, res) => {
  try {
    const { couponId } = req.params
    const updateData = { ...req.body }

    if (updateData.code) {
      updateData.code = String(updateData.code).trim().toUpperCase()
      const existing = await Coupon.findOne({
        code: updateData.code,
        _id: { $ne: couponId },
      })
      if (existing) {
        return res.status(400).json({
          success: false,
          message: `Coupon code '${updateData.code}' is already used by another coupon.`,
        })
      }
    }

    const coupon = await Coupon.findByIdAndUpdate(couponId, updateData, {
      new: true,
    })
      .populate("practitioner", "firstName lastName email")
      .populate("applicableCourses", "title price")
      .populate("applicableOffers", "title price type")

    if (!coupon) {
      return res.status(404).json({ success: false, message: "Coupon not found" })
    }

    return res.status(200).json({
      success: true,
      message: "Coupon updated successfully",
      coupon,
    })
  } catch (error) {
    console.error("updateAdminCoupon error:", error)
    return res.status(500).json({ success: false, message: error.message })
  }
}

// Delete Coupon
exports.deleteCoupon = async (req, res) => {
  try {
    const { couponId } = req.params
    const coupon = await Coupon.findByIdAndDelete(couponId)
    if (!coupon) {
      return res.status(404).json({ success: false, message: "Coupon not found" })
    }

    return res.status(200).json({
      success: true,
      message: `Coupon '${coupon.code}' deleted successfully`,
    })
  } catch (error) {
    console.error("deleteCoupon error:", error)
    return res.status(500).json({ success: false, message: error.message })
  }
}

// Global Coupon Analytics & Settings for Admin
exports.getAdminCouponAnalytics = async (req, res) => {
  try {
    const [totalCoupons, activeCoupons, totalUsages, usagesAgg, settings] = await Promise.all([
      Coupon.countDocuments(),
      Coupon.countDocuments({ isActive: true }),
      CouponUsage.countDocuments(),
      CouponUsage.aggregate([
        {
          $group: {
            _id: null,
            totalDiscountGiven: { $sum: "$discountAmount" },
            totalRevenueSaved: { $sum: "$finalPrice" },
          },
        },
      ]),
      getSettings(),
    ])

    const totalDiscountGiven = usagesAgg[0]?.totalDiscountGiven || 0
    const totalRevenue = usagesAgg[0]?.totalRevenueSaved || 0

    // Top 5 used coupons
    const topCoupons = await Coupon.find()
      .sort({ usedCount: -1 })
      .limit(5)
      .select("code name couponType discountValue usedCount isActive")
      .lean()

    return res.status(200).json({
      success: true,
      analytics: {
        totalCoupons,
        activeCoupons,
        totalUsages,
        totalDiscountGiven,
        totalRevenue,
        topCoupons,
      },
      settings,
    })
  } catch (error) {
    console.error("getAdminCouponAnalytics error:", error)
    return res.status(500).json({ success: false, message: error.message })
  }
}

// Update Global Stacking Settings
exports.updateCouponSettings = async (req, res) => {
  try {
    const { allowStacking, stackingPriority, allowAdminPractitionerStacking } = req.body
    let settings = await CouponSetting.findOne()
    if (!settings) {
      settings = new CouponSetting()
    }

    if (allowStacking !== undefined) settings.allowStacking = Boolean(allowStacking)
    if (stackingPriority) settings.stackingPriority = stackingPriority
    if (allowAdminPractitionerStacking !== undefined) {
      settings.allowAdminPractitionerStacking = Boolean(allowAdminPractitionerStacking)
    }
    settings.updatedBy = req.user.id
    await settings.save()

    return res.status(200).json({
      success: true,
      message: "Coupon stacking settings updated successfully",
      settings,
    })
  } catch (error) {
    console.error("updateCouponSettings error:", error)
    return res.status(500).json({ success: false, message: error.message })
  }
}

// Get All Coupon Redemptions (Ledger)
exports.getAllCouponUsages = async (req, res) => {
  try {
    const { search, productType, limit = 100 } = req.query
    const filter = {}
    if (productType) filter.productType = productType

    const usages = await CouponUsage.find(filter)
      .populate("learner", "firstName lastName email image")
      .populate("practitioner", "firstName lastName email image")
      .populate("course", "title price")
      .populate("offer", "title price type")
      .populate("coupon", "code name couponType discountValue")
      .sort({ usedAt: -1 })
      .limit(Number(limit))
      .lean()

    return res.status(200).json({
      success: true,
      total: usages.length,
      usages,
    })
  } catch (error) {
    console.error("getAllCouponUsages error:", error)
    return res.status(500).json({ success: false, message: error.message })
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// 2. PRACTITIONER COUPON & LEARNER DISCOUNT CONTROLLERS
// ══════════════════════════════════════════════════════════════════════════════

// Create Practitioner Coupon (Strictly for Practitioner's Products)
exports.createPractitionerCoupon = async (req, res) => {
  try {
    const practitionerId = req.user.id
    const {
      code,
      name,
      description,
      discountValue,
      applicableTo = "both",
      applicableCourses = [],
      applicableOffers = [],
      startDate,
      expiryDate,
      usageLimit = null,
      perUserLimit = 1,
      minOrderAmount = 0,
      maxDiscountAmount = null,
    } = req.body

    if (!code || !name || discountValue === undefined) {
      return res.status(400).json({
        success: false,
        message: "Code, name, and discount percentage are required.",
      })
    }

    const cleanCode = String(code).trim().toUpperCase()
    const existing = await Coupon.findOne({ code: cleanCode })
    if (existing) {
      return res.status(400).json({
        success: false,
        message: `Coupon code '${cleanCode}' is already taken. Please choose another code.`,
      })
    }

    // Verify that applicableCourses belong to this practitioner
    if (applicableCourses && applicableCourses.length > 0) {
      const ownedCourses = await Course.find({
        _id: { $in: applicableCourses },
        practitioner: practitionerId,
      })
      if (ownedCourses.length !== applicableCourses.length) {
        return res.status(403).json({
          success: false,
          message: "You can only create coupons for your own courses.",
        })
      }
    }

    // Verify that applicableOffers belong to this practitioner
    if (applicableOffers && applicableOffers.length > 0) {
      const ownedOffers = await Offer.find({
        _id: { $in: applicableOffers },
        practitioner: practitionerId,
      })
      if (ownedOffers.length !== applicableOffers.length) {
        return res.status(403).json({
          success: false,
          message: "You can only create coupons for your own sessions/offers.",
        })
      }
    }

    const coupon = await Coupon.create({
      code: cleanCode,
      name: name.trim(),
      description: description || "",
      couponType: "practitioner",
      discountType: "percentage",
      discountValue: Math.min(100, Math.max(1, Number(discountValue))),
      applicableTo,
      applicableCourses: applicableCourses || [],
      applicableOffers: applicableOffers || [],
      practitioner: practitionerId,
      minOrderAmount: Number(minOrderAmount) || 0,
      maxDiscountAmount: maxDiscountAmount ? Number(maxDiscountAmount) : null,
      startDate: startDate ? new Date(startDate) : new Date(),
      expiryDate: expiryDate ? new Date(expiryDate) : null,
      usageLimit: usageLimit ? Number(usageLimit) : null,
      perUserLimit: Number(perUserLimit) || 1,
      isActive: true,
      createdBy: practitionerId,
    })

    return res.status(201).json({
      success: true,
      message: `Practitioner coupon '${cleanCode}' created successfully!`,
      coupon,
    })
  } catch (error) {
    console.error("createPractitionerCoupon error:", error)
    return res.status(500).json({ success: false, message: error.message })
  }
}

// Get Practitioner's Own Coupons
exports.getMyPractitionerCoupons = async (req, res) => {
  try {
    const practitionerId = req.user.id
    const coupons = await Coupon.find({ practitioner: practitionerId })
      .populate("applicableCourses", "title price")
      .populate("applicableOffers", "title price type")
      .sort({ createdAt: -1 })
      .lean()

    // Aggregate total discount given by practitioner's coupons
    const usages = await CouponUsage.aggregate([
      { $match: { practitioner: practitionerId, couponType: "practitioner" } },
      {
        $group: {
          _id: null,
          totalDiscount: { $sum: "$discountAmount" },
          totalUses: { $sum: 1 },
        },
      },
    ])

    return res.status(200).json({
      success: true,
      coupons,
      stats: {
        totalCoupons: coupons.length,
        activeCoupons: coupons.filter((c) => c.isActive).length,
        totalUses: usages[0]?.totalUses || 0,
        totalDiscountGiven: usages[0]?.totalDiscount || 0,
      },
    })
  } catch (error) {
    console.error("getMyPractitionerCoupons error:", error)
    return res.status(500).json({ success: false, message: error.message })
  }
}

// Update Practitioner Coupon
exports.updatePractitionerCoupon = async (req, res) => {
  try {
    const practitionerId = req.user.id
    const { couponId } = req.params
    const {
      name,
      description,
      discountValue,
      applicableTo,
      applicableCourses,
      applicableOffers,
      startDate,
      expiryDate,
      usageLimit,
      perUserLimit,
      isActive,
    } = req.body

    const coupon = await Coupon.findOne({
      _id: couponId,
      practitioner: practitionerId,
    })
    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Coupon not found or you do not have permission to edit it.",
      })
    }

    if (name) coupon.name = name.trim()
    if (description !== undefined) coupon.description = description
    if (discountValue !== undefined) {
      coupon.discountValue = Math.min(100, Math.max(1, Number(discountValue)))
    }
    if (applicableTo) coupon.applicableTo = applicableTo
    if (applicableCourses !== undefined) coupon.applicableCourses = applicableCourses
    if (applicableOffers !== undefined) coupon.applicableOffers = applicableOffers
    if (startDate) coupon.startDate = new Date(startDate)
    if (expiryDate !== undefined) {
      coupon.expiryDate = expiryDate ? new Date(expiryDate) : null
    }
    if (usageLimit !== undefined) {
      coupon.usageLimit = usageLimit ? Number(usageLimit) : null
    }
    if (perUserLimit !== undefined) coupon.perUserLimit = Number(perUserLimit) || 1
    if (isActive !== undefined) coupon.isActive = Boolean(isActive)

    await coupon.save()

    return res.status(200).json({
      success: true,
      message: "Practitioner coupon updated successfully",
      coupon,
    })
  } catch (error) {
    console.error("updatePractitionerCoupon error:", error)
    return res.status(500).json({ success: false, message: error.message })
  }
}

// Toggle Coupon Active Status
exports.toggleCouponStatus = async (req, res) => {
  try {
    const { couponId } = req.params
    const userId = req.user.id
    const userRole = req.user.accountType

    const query = { _id: couponId }
    if (userRole !== "Admin") {
      query.practitioner = userId
    }

    const coupon = await Coupon.findOne(query)
    if (!coupon) {
      return res.status(404).json({ success: false, message: "Coupon not found" })
    }

    coupon.isActive = !coupon.isActive
    await coupon.save()

    return res.status(200).json({
      success: true,
      message: `Coupon '${coupon.code}' is now ${coupon.isActive ? "active" : "inactive"}.`,
      isActive: coupon.isActive,
    })
  } catch (error) {
    console.error("toggleCouponStatus error:", error)
    return res.status(500).json({ success: false, message: error.message })
  }
}

// ─── Practitioner-to-Learner Personalized Discounts ───────────────────────────

// Create Learner-Specific Personal Discount
exports.createLearnerDiscount = async (req, res) => {
  try {
    const practitionerId = req.user.id
    const {
      learnerId,
      productType = "all", // "course" | "session" | "all"
      courseId,
      offerId,
      discountPercentage = 100,
      isFreeAccess = false,
      startDate,
      expiryDate,
      usageLimit = 1,
      notes = "",
    } = req.body

    if (!learnerId) {
      return res.status(400).json({
        success: false,
        message: "Target learner is required.",
      })
    }

    const learnerUser = await User.findById(learnerId)
    if (!learnerUser) {
      return res.status(404).json({ success: false, message: "Learner not found." })
    }

    // Validate course ownership if course specific
    if (productType === "course" && courseId) {
      const course = await Course.findOne({
        _id: courseId,
        practitioner: practitionerId,
      })
      if (!course) {
        return res.status(403).json({
          success: false,
          message: "You can only grant discounts on your own courses.",
        })
      }
    }

    // Validate offer ownership if session specific
    if (productType === "session" && offerId) {
      const offer = await Offer.findOne({
        _id: offerId,
        practitioner: practitionerId,
      })
      if (!offer) {
        return res.status(403).json({
          success: false,
          message: "You can only grant discounts on your own sessions.",
        })
      }
    }

    const finalPct = isFreeAccess ? 100 : Math.min(100, Math.max(1, Number(discountPercentage)))

    const discount = await LearnerDiscount.create({
      practitioner: practitionerId,
      learner: learnerId,
      productType,
      course: courseId || null,
      offer: offerId || null,
      discountPercentage: finalPct,
      isFreeAccess: Boolean(isFreeAccess || finalPct === 100),
      startDate: startDate ? new Date(startDate) : new Date(),
      expiryDate: expiryDate ? new Date(expiryDate) : null,
      usageLimit: Number(usageLimit) || 1,
      isActive: true,
      notes: notes || "",
    })

    const populated = await LearnerDiscount.findById(discount._id)
      .populate("learner", "firstName lastName email image")
      .populate("course", "title price")
      .populate("offer", "title price type")

    return res.status(201).json({
      success: true,
      message: `Personal discount of ${finalPct}% granted to ${learnerUser.firstName} ${learnerUser.lastName}!`,
      discount: populated,
    })
  } catch (error) {
    console.error("createLearnerDiscount error:", error)
    return res.status(500).json({ success: false, message: error.message })
  }
}

// Get Practitioner's Granted Personal Discounts
exports.getMyLearnerDiscounts = async (req, res) => {
  try {
    const practitionerId = req.user.id
    const discounts = await LearnerDiscount.find({ practitioner: practitionerId })
      .populate("learner", "firstName lastName email image")
      .populate("course", "title price")
      .populate("offer", "title price type")
      .sort({ createdAt: -1 })
      .lean()

    return res.status(200).json({
      success: true,
      discounts,
    })
  } catch (error) {
    console.error("getMyLearnerDiscounts error:", error)
    return res.status(500).json({ success: false, message: error.message })
  }
}

// Toggle Learner Discount Active Status
exports.toggleLearnerDiscount = async (req, res) => {
  try {
    const practitionerId = req.user.id
    const { discountId } = req.params

    const discount = await LearnerDiscount.findOne({
      _id: discountId,
      practitioner: practitionerId,
    })
    if (!discount) {
      return res.status(404).json({ success: false, message: "Discount not found" })
    }

    discount.isActive = !discount.isActive
    await discount.save()

    return res.status(200).json({
      success: true,
      message: `Personal discount is now ${discount.isActive ? "active" : "disabled"}.`,
      isActive: discount.isActive,
    })
  } catch (error) {
    console.error("toggleLearnerDiscount error:", error)
    return res.status(500).json({ success: false, message: error.message })
  }
}

// Delete Learner Discount
exports.deleteLearnerDiscount = async (req, res) => {
  try {
    const practitionerId = req.user.id
    const { discountId } = req.params

    const discount = await LearnerDiscount.findOneAndDelete({
      _id: discountId,
      practitioner: practitionerId,
    })
    if (!discount) {
      return res.status(404).json({ success: false, message: "Discount not found" })
    }

    return res.status(200).json({
      success: true,
      message: "Personal learner discount removed successfully",
    })
  } catch (error) {
    console.error("deleteLearnerDiscount error:", error)
    return res.status(500).json({ success: false, message: error.message })
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// 3. CHECKOUT & STACKING CALCULATION ENGINE
// ══════════════════════════════════════════════════════════════════════════════

/**
 * Validates coupons and calculates stacked price breakdown
 * Request Body:
 * {
 *   productType: "course" | "session",
 *   productId: ObjectId (courseId or offerId),
 *   couponCodes: ["SUMMER50", "PRACT20"] // optional string or array of strings
 * }
 */
exports.calculateCheckoutDiscounts = async (req, res) => {
  try {
    const userId = req.user.id
    const { productType, productId, couponCodes = [] } = req.body

    if (!productType || !productId) {
      return res.status(400).json({
        success: false,
        message: "productType ('course' | 'session') and productId are required.",
      })
    }

    let product = null
    let originalPrice = 0
    let practitionerId = null
    let productTitle = ""

    if (productType === "course") {
      product = await Course.findById(productId).populate("practitioner", "firstName lastName email")
      if (!product) {
        return res.status(404).json({ success: false, message: "Course not found" })
      }
      originalPrice = Number(product.price) || 0
      practitionerId = product.practitioner?._id || product.practitioner
      productTitle = product.title
    } else if (productType === "session") {
      product = await Offer.findById(productId).populate("practitioner", "firstName lastName email")
      if (!product) {
        return res.status(404).json({ success: false, message: "Session offer not found" })
      }
      originalPrice = Number(product.price) || 0
      practitionerId = product.practitioner?._id || product.practitioner
      productTitle = product.title
    } else {
      return res.status(400).json({ success: false, message: "Invalid productType" })
    }

    if (originalPrice <= 0) {
      return res.status(200).json({
        success: true,
        originalPrice: 0,
        finalPrice: 0,
        totalDiscount: 0,
        isFree: true,
        breakdown: {
          originalPrice: 0,
          personalDiscountAmount: 0,
          practitionerDiscountAmount: 0,
          adminDiscountAmount: 0,
          finalPrice: 0,
        },
        appliedCoupons: [],
        message: "This item is already free.",
      })
    }

    const settings = await getSettings()
    const now = new Date()

    // ── 1. Check for Active Personal Learner Discount ───────────────────────────
    let personalDiscount = null
    const personalDiscounts = await LearnerDiscount.find({
      learner: userId,
      practitioner: practitionerId,
      isActive: true,
      startDate: { $lte: now },
      $or: [{ expiryDate: null }, { expiryDate: { $gte: now } }],
    }).sort({ discountPercentage: -1 })

    for (const d of personalDiscounts) {
      if (d.usedCount >= d.usageLimit) continue
      if (d.productType === "all") {
        personalDiscount = d
        break
      }
      if (productType === "course" && d.productType === "course") {
        if (!d.course || String(d.course) === String(productId)) {
          personalDiscount = d
          break
        }
      }
      if (productType === "session" && d.productType === "session") {
        if (!d.offer || String(d.offer) === String(productId)) {
          personalDiscount = d
          break
        }
      }
    }

    // ── 2. Validate Provided Coupon Codes ───────────────────────────────────────
    const rawCodes = Array.isArray(couponCodes) ? couponCodes : [couponCodes]
    const cleanCodes = [...new Set(rawCodes.map((c) => String(c).trim().toUpperCase()).filter(Boolean))]

    const validCoupons = []
    const invalidCouponErrors = []

    for (const code of cleanCodes) {
      const coupon = await Coupon.findOne({ code, isActive: true })
      if (!coupon) {
        invalidCouponErrors.push({ code, reason: "Coupon does not exist or is inactive." })
        continue
      }

      // Check dates
      if (coupon.startDate && new Date(coupon.startDate) > now) {
        invalidCouponErrors.push({ code, reason: "Coupon is not active yet." })
        continue
      }
      if (coupon.expiryDate && new Date(coupon.expiryDate) < now) {
        invalidCouponErrors.push({ code, reason: "Coupon has expired." })
        continue
      }

      // Check product applicability
      const targetApplicable = productType === "course" ? "courses" : "sessions"
      if (coupon.applicableTo !== "both" && coupon.applicableTo !== targetApplicable) {
        invalidCouponErrors.push({
          code,
          reason: `Coupon is only valid for ${coupon.applicableTo}.`,
        })
        continue
      }

      // Check specific courses / offers
      if (productType === "course" && coupon.applicableCourses?.length > 0) {
        const isEligibleCourse = coupon.applicableCourses.map(String).includes(String(productId))
        if (!isEligibleCourse) {
          invalidCouponErrors.push({
            code,
            reason: "Coupon is not applicable to this specific course.",
          })
          continue
        }
      }
      if (productType === "session" && coupon.applicableOffers?.length > 0) {
        const isEligibleOffer = coupon.applicableOffers.map(String).includes(String(productId))
        if (!isEligibleOffer) {
          invalidCouponErrors.push({
            code,
            reason: "Coupon is not applicable to this specific session.",
          })
          continue
        }
      }

      // Check practitioner restriction for practitioner coupons
      if (coupon.couponType === "practitioner") {
        if (String(coupon.practitioner) !== String(practitionerId)) {
          invalidCouponErrors.push({
            code,
            reason: "This coupon was created by a different practitioner.",
          })
          continue
        }
      }

      // Check global usage limit
      if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
        invalidCouponErrors.push({ code, reason: "Coupon usage limit reached." })
        continue
      }

      // Check per-user usage limit
      if (coupon.perUserLimit) {
        const userUsageCount = await CouponUsage.countDocuments({
          coupon: coupon._id,
          learner: userId,
        })
        if (userUsageCount >= coupon.perUserLimit) {
          invalidCouponErrors.push({
            code,
            reason: `You have reached the maximum usage limit (${coupon.perUserLimit}) for this coupon.`,
          })
          continue
        }
      }

      // Check min order amount
      if (coupon.minOrderAmount && originalPrice < coupon.minOrderAmount) {
        invalidCouponErrors.push({
          code,
          reason: `Minimum order amount of ₹${coupon.minOrderAmount} required.`,
        })
        continue
      }

      validCoupons.push(coupon)
    }

    // ── 3. Stacking & Priority Calculation ──────────────────────────────────────
    let currentPrice = originalPrice
    let personalDiscountAmount = 0
    let practitionerDiscountAmount = 0
    let adminDiscountAmount = 0
    const appliedList = []

    // 3A. Personal Discount Application
    if (personalDiscount) {
      const pct = personalDiscount.discountPercentage
      personalDiscountAmount = Math.round((currentPrice * pct) / 100)
      currentPrice = Math.max(0, currentPrice - personalDiscountAmount)

      appliedList.push({
        type: "personal",
        id: personalDiscount._id,
        name: personalDiscount.isFreeAccess ? "Personal Free Grant (100%)" : `Personal Discount (${pct}%)`,
        discountPercentage: pct,
        discountAmount: personalDiscountAmount,
      })
    }

    // If price reached 0 via personal discount, no other coupons need application
    if (currentPrice > 0 && validCoupons.length > 0) {
      let pracCoupon = validCoupons.find((c) => c.couponType === "practitioner")
      let admCoupon = validCoupons.find((c) => c.couponType === "admin")

      if (!settings.allowStacking) {
        // If stacking disabled, choose the single highest discount coupon
        const bestCoupon = validCoupons.sort((a, b) => b.discountValue - a.discountValue)[0]
        if (bestCoupon) {
          const discountAmt = Math.round((currentPrice * bestCoupon.discountValue) / 100)
          const cappedAmt = bestCoupon.maxDiscountAmount
            ? Math.min(discountAmt, bestCoupon.maxDiscountAmount)
            : discountAmt
          currentPrice = Math.max(0, currentPrice - cappedAmt)

          if (bestCoupon.couponType === "practitioner") practitionerDiscountAmount = cappedAmt
          else adminDiscountAmount = cappedAmt

          appliedList.push({
            type: bestCoupon.couponType,
            id: bestCoupon._id,
            code: bestCoupon.code,
            name: bestCoupon.name,
            discountPercentage: bestCoupon.discountValue,
            discountAmount: cappedAmt,
          })
        }
      } else {
        // Stacking Enabled: Apply Practitioner Coupon then Admin Coupon (or configured priority)
        const applyCoupon = (cpn) => {
          if (!cpn || currentPrice <= 0) return 0
          const calcAmt = Math.round((currentPrice * cpn.discountValue) / 100)
          const finalAmt = cpn.maxDiscountAmount
            ? Math.min(calcAmt, cpn.maxDiscountAmount)
            : calcAmt
          currentPrice = Math.max(0, currentPrice - finalAmt)

          appliedList.push({
            type: cpn.couponType,
            id: cpn._id,
            code: cpn.code,
            name: cpn.name,
            discountPercentage: cpn.discountValue,
            discountAmount: finalAmt,
          })
          return finalAmt
        }

        if (settings.stackingPriority === "admin_first") {
          adminDiscountAmount = applyCoupon(admCoupon)
          practitionerDiscountAmount = applyCoupon(pracCoupon)
        } else {
          practitionerDiscountAmount = applyCoupon(pracCoupon)
          adminDiscountAmount = applyCoupon(admCoupon)
        }
      }
    }

    const finalPrice = Math.max(0, currentPrice)
    const totalDiscountAmount = originalPrice - finalPrice

    return res.status(200).json({
      success: true,
      productTitle,
      productType,
      productId,
      originalPrice,
      finalPrice,
      totalDiscountAmount,
      isFree: finalPrice === 0,
      breakdown: {
        originalPrice,
        personalDiscountAmount,
        practitionerDiscountAmount,
        adminDiscountAmount,
        finalPrice,
      },
      hasPersonalDiscount: !!personalDiscount,
      personalDiscount: personalDiscount
        ? {
            id: personalDiscount._id,
            percentage: personalDiscount.discountPercentage,
            isFreeAccess: personalDiscount.isFreeAccess,
            notes: personalDiscount.notes,
          }
        : null,
      appliedCoupons: appliedList,
      invalidCoupons: invalidCouponErrors,
      message:
        finalPrice === 0
          ? "🎉 100% Discount Applied! Free Access."
          : `Discounts applied. Final payable: ₹${finalPrice}`,
    })
  } catch (error) {
    console.error("calculateCheckoutDiscounts error:", error)
    return res.status(500).json({ success: false, message: error.message })
  }
}

// ─── Get Active Personal Discount for specific course/session ─────────────────
exports.getLearnerActivePersonalDiscount = async (req, res) => {
  try {
    const userId = req.user.id
    const { productType, productId, practitionerId } = req.query

    const now = new Date()
    const query = {
      learner: userId,
      isActive: true,
      startDate: { $lte: now },
      $or: [{ expiryDate: null }, { expiryDate: { $gte: now } }],
    }

    if (practitionerId) {
      query.practitioner = practitionerId
    }

    const discounts = await LearnerDiscount.find(query)
      .populate("practitioner", "firstName lastName email")
      .populate("course", "title price")
      .populate("offer", "title price type")
      .sort({ discountPercentage: -1 })
      .lean()

    // Find specific matching discount
    let matched = null
    for (const d of discounts) {
      if (d.usedCount >= d.usageLimit) continue
      if (d.productType === "all") {
        matched = d
        break
      }
      if (productType === "course" && d.productType === "course") {
        if (!d.course || String(d.course._id || d.course) === String(productId)) {
          matched = d
          break
        }
      }
      if (productType === "session" && d.productType === "session") {
        if (!d.offer || String(d.offer._id || d.offer) === String(productId)) {
          matched = d
          break
        }
      }
    }

    return res.status(200).json({
      success: true,
      hasPersonalDiscount: !!matched,
      personalDiscount: matched,
    })
  } catch (error) {
    console.error("getLearnerActivePersonalDiscount error:", error)
    return res.status(500).json({ success: false, message: error.message })
  }
}

// ─── HELPER FUNCTIONS FOR PAYMENT PIPELINE ────────────────────────────────────

// Evaluates and returns calculated price & applied coupon objects
exports.evaluateDiscounts = async ({ userId, productType, productId, couponCodes = [] }) => {
  let product = null
  let originalPrice = 0
  let practitionerId = null
  let productTitle = ""

  if (productType === "course") {
    product = await Course.findById(productId).populate("practitioner", "firstName lastName email")
    if (!product) throw new Error("Course not found")
    originalPrice = Number(product.price) || 0
    practitionerId = product.practitioner?._id || product.practitioner
    productTitle = product.title
  } else {
    product = await Offer.findById(productId).populate("practitioner", "firstName lastName email")
    if (!product) throw new Error("Offer not found")
    originalPrice = Number(product.price) || 0
    practitionerId = product.practitioner?._id || product.practitioner
    productTitle = product.title
  }

  if (originalPrice <= 0) {
    return {
      originalPrice: 0,
      finalPrice: 0,
      totalDiscountAmount: 0,
      isFree: true,
      appliedCoupons: [],
      practitionerId,
      productTitle,
    }
  }

  const settings = await getSettings()
  const now = new Date()

  // 1. Check Personal Discount
  let personalDiscount = null
  const personalDiscounts = await LearnerDiscount.find({
    learner: userId,
    practitioner: practitionerId,
    isActive: true,
    startDate: { $lte: now },
    $or: [{ expiryDate: null }, { expiryDate: { $gte: now } }],
  }).sort({ discountPercentage: -1 })

  for (const d of personalDiscounts) {
    if (d.usedCount >= d.usageLimit) continue
    if (d.productType === "all") { personalDiscount = d; break }
    if (productType === "course" && d.productType === "course" && (!d.course || String(d.course) === String(productId))) { personalDiscount = d; break }
    if (productType === "session" && d.productType === "session" && (!d.offer || String(d.offer) === String(productId))) { personalDiscount = d; break }
  }

  // 2. Validate Coupons
  const rawCodes = Array.isArray(couponCodes) ? couponCodes : [couponCodes]
  const cleanCodes = [...new Set(rawCodes.map((c) => String(c).trim().toUpperCase()).filter(Boolean))]
  const validCoupons = []

  for (const code of cleanCodes) {
    const coupon = await Coupon.findOne({ code, isActive: true })
    if (!coupon) continue
    if (coupon.startDate && new Date(coupon.startDate) > now) continue
    if (coupon.expiryDate && new Date(coupon.expiryDate) < now) continue
    const targetApplicable = productType === "course" ? "courses" : "sessions"
    if (coupon.applicableTo !== "both" && coupon.applicableTo !== targetApplicable) continue
    if (productType === "course" && coupon.applicableCourses?.length > 0 && !coupon.applicableCourses.map(String).includes(String(productId))) continue
    if (productType === "session" && coupon.applicableOffers?.length > 0 && !coupon.applicableOffers.map(String).includes(String(productId))) continue
    if (coupon.couponType === "practitioner" && String(coupon.practitioner) !== String(practitionerId)) continue
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) continue
    if (coupon.minOrderAmount && originalPrice < coupon.minOrderAmount) continue

    validCoupons.push(coupon)
  }

  // 3. Stacking
  let currentPrice = originalPrice
  let personalDiscountAmount = 0
  let practitionerDiscountAmount = 0
  let adminDiscountAmount = 0
  const appliedList = []

  if (personalDiscount) {
    const pct = personalDiscount.discountPercentage
    personalDiscountAmount = Math.round((currentPrice * pct) / 100)
    currentPrice = Math.max(0, currentPrice - personalDiscountAmount)
    appliedList.push({
      type: "personal",
      id: personalDiscount._id,
      name: personalDiscount.isFreeAccess ? "Personal Free Grant" : `Personal Discount (${pct}%)`,
      discountPercentage: pct,
      discountAmount: personalDiscountAmount,
      doc: personalDiscount,
    })
  }

  if (currentPrice > 0 && validCoupons.length > 0) {
    let pracCoupon = validCoupons.find((c) => c.couponType === "practitioner")
    let admCoupon = validCoupons.find((c) => c.couponType === "admin")

    const applyCoupon = (cpn) => {
      if (!cpn || currentPrice <= 0) return 0
      const calcAmt = Math.round((currentPrice * cpn.discountValue) / 100)
      const finalAmt = cpn.maxDiscountAmount ? Math.min(calcAmt, cpn.maxDiscountAmount) : calcAmt
      currentPrice = Math.max(0, currentPrice - finalAmt)
      appliedList.push({
        type: cpn.couponType,
        id: cpn._id,
        code: cpn.code,
        name: cpn.name,
        discountPercentage: cpn.discountValue,
        discountAmount: finalAmt,
        doc: cpn,
      })
      return finalAmt
    }

    if (settings.stackingPriority === "admin_first") {
      adminDiscountAmount = applyCoupon(admCoupon)
      practitionerDiscountAmount = applyCoupon(pracCoupon)
    } else {
      practitionerDiscountAmount = applyCoupon(pracCoupon)
      adminDiscountAmount = applyCoupon(admCoupon)
    }
  }

  const finalPrice = Math.max(0, currentPrice)
  const totalDiscountAmount = originalPrice - finalPrice

  return {
    originalPrice,
    finalPrice,
    totalDiscountAmount,
    isFree: finalPrice === 0,
    appliedCoupons: appliedList,
    personalDiscount,
    practitionerId,
    productTitle,
  }
}

// Records usage & increments redemption counters
exports.recordDiscountUsage = async ({
  userId,
  practitionerId,
  productType,
  courseId = null,
  offerId = null,
  originalPrice,
  discountAmount,
  finalPrice,
  appliedCoupons = [],
  orderId = "",
  paymentId = "",
}) => {
  try {
    for (const item of appliedCoupons) {
      if (item.type === "personal" && item.id) {
        await LearnerDiscount.findByIdAndUpdate(item.id, { $inc: { usedCount: 1 } })
      } else if (item.id) {
        await Coupon.findByIdAndUpdate(item.id, { $inc: { usedCount: 1 } })
      }
    }

    await CouponUsage.create({
      coupon: appliedCoupons.find((c) => c.type !== "personal")?.id || null,
      learnerDiscount: appliedCoupons.find((c) => c.type === "personal")?.id || null,
      code: appliedCoupons.map((c) => c.code || "PERSONAL").join(", "),
      couponType: appliedCoupons[0]?.type || "admin",
      learner: userId,
      practitioner: practitionerId,
      productType,
      course: courseId,
      offer: offerId,
      originalPrice,
      discountAmount,
      finalPrice,
      appliedCoupons: appliedCoupons.map((c) => ({
        code: c.code || "PERSONAL",
        couponType: c.type,
        discountPercentage: c.discountPercentage,
        discountAmount: c.discountAmount,
      })),
      orderId,
      paymentId,
      usedAt: new Date(),
    })
  } catch (err) {
    console.error("recordDiscountUsage error:", err)
  }
}

