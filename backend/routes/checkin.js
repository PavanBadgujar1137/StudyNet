const express = require("express")
const router = express.Router()
const { submitCheckIn, getClientCheckIns } = require("../controllers/checkin")
const { auth, isClient } = require("../middleware/auth")

router.post("/", auth, isClient, submitCheckIn)
router.get("/", auth, isClient, getClientCheckIns)

module.exports = router
