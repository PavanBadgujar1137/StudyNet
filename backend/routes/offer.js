const express = require("express")
const router = express.Router()
const { createOffer, getPractitionerOffers, updateOffer } = require("../controllers/offer")
const { auth, isPractitioner } = require("../middleware/auth")

router.post("/", auth, isPractitioner, createOffer)
router.get("/", auth, isPractitioner, getPractitionerOffers)
router.put("/:offerId", auth, isPractitioner, updateOffer)

module.exports = router
