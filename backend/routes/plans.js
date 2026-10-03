const express = require("express")
const router = express.Router()
const { getPlans, createPlanOrder, verifyPlanPayment } = require("../controllers/plans")

router.get("/", getPlans)
router.post("/create-order", createPlanOrder)
router.post("/verify-payment", verifyPlanPayment)

module.exports = router

