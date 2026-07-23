const express = require("express")
const router = express.Router()
const { getOrgAggregateTelemetry } = require("../controllers/org")
const { auth, isOrgAdmin } = require("../middleware/auth")

router.get("/aggregate-stats", auth, isOrgAdmin, getOrgAggregateTelemetry)

module.exports = router
