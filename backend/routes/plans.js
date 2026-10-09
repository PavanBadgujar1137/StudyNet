const express = require("express")
const router = express.Router()
const jwt = require("jsonwebtoken")
const {
  getPlans,
  createPlanOrder,
  verifyPlanPayment,
  createSubscriptionCallOrder,
  verifySubscriptionCallOrder,
} = require("../controllers/plans")

// Optional authentication helper so logged-in users get their ID attached
const optionalAuth = (req, res, next) => {
  try {
    const authHeader = req.header("Authorization") || req.header("authorization") || req.headers?.authorization
    let rawToken = req.cookies?.token || req.body?.token || (authHeader ? authHeader.replace(/^Bearer\s+/i, "") : null)
    if (rawToken) {
      let cleanToken = String(rawToken).trim()
      if ((cleanToken.startsWith('"') && cleanToken.endsWith('"')) || (cleanToken.startsWith("'") && cleanToken.endsWith("'"))) {
        cleanToken = cleanToken.slice(1, -1).trim()
      }
      const decode = jwt.verify(cleanToken, process.env.JWT_SECRET)
      req.user = decode
      if (!req.user.id && req.user._id) req.user.id = req.user._id
    }
  } catch (e) {
    // optional token parsing error ignored
  }
  next()
}

router.get("/", getPlans)
router.post("/create-order", optionalAuth, createPlanOrder)
router.post("/verify-payment", optionalAuth, verifyPlanPayment)

// Practitioner "Book a Call and Take Subscription" endpoints
router.post("/subscribe-and-schedule", optionalAuth, createSubscriptionCallOrder)
router.post("/verify-subscription-and-schedule", optionalAuth, verifySubscriptionCallOrder)

module.exports = router
