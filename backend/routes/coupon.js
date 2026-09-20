const express = require("express")
const router = express.Router()

const {
  createAdminCoupon,
  getAllAdminCoupons,
  updateAdminCoupon,
  deleteCoupon,
  getAdminCouponAnalytics,
  updateCouponSettings,
  getAllCouponUsages,
  createPractitionerCoupon,
  getMyPractitionerCoupons,
  updatePractitionerCoupon,
  toggleCouponStatus,
  createLearnerDiscount,
  getMyLearnerDiscounts,
  toggleLearnerDiscount,
  deleteLearnerDiscount,
  lookupLearner,
  calculateCheckoutDiscounts,
  getLearnerActivePersonalDiscount,
} = require("../controllers/coupon")

const { auth, isAdmin, isInstructor } = require("../middleware/auth")

// ─── Admin Coupon Routes ───────────────────────────────────────────────────────
router.post("/admin/create", auth, isAdmin, createAdminCoupon)
router.get("/admin/all", auth, isAdmin, getAllAdminCoupons)
router.put("/admin/:couponId", auth, isAdmin, updateAdminCoupon)
router.delete("/admin/:couponId", auth, isAdmin, deleteCoupon)
router.get("/admin/analytics", auth, isAdmin, getAdminCouponAnalytics)
router.post("/admin/settings", auth, isAdmin, updateCouponSettings)
router.get("/admin/usages", auth, isAdmin, getAllCouponUsages)

// ─── Practitioner Coupon Routes ───────────────────────────────────────────────
router.post("/practitioner/create", auth, isInstructor, createPractitionerCoupon)
router.get("/practitioner/mine", auth, isInstructor, getMyPractitionerCoupons)
router.put("/practitioner/:couponId", auth, isInstructor, updatePractitionerCoupon)
router.patch("/toggle/:couponId", auth, toggleCouponStatus)
router.delete("/practitioner/:couponId", auth, isInstructor, deleteCoupon)

// ─── Practitioner Personalized Learner Discounts & Lookup ────────────────────
router.post("/lookup-learner", auth, isInstructor, lookupLearner)
router.get("/lookup-learner/:query", auth, isInstructor, lookupLearner)
router.post("/learner-discount/create", auth, isInstructor, createLearnerDiscount)
router.get("/learner-discount/mine", auth, isInstructor, getMyLearnerDiscounts)
router.patch("/learner-discount/toggle/:discountId", auth, isInstructor, toggleLearnerDiscount)
router.delete("/learner-discount/:discountId", auth, isInstructor, deleteLearnerDiscount)

// ─── Learner Checkout & Validation Engine ─────────────────────────────────────
router.post("/calculate-checkout", auth, calculateCheckoutDiscounts)
router.get("/my-personal-discount", auth, getLearnerActivePersonalDiscount)

module.exports = router
