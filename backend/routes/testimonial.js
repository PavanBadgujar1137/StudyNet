const express = require("express")
const router = express.Router()
const { submitTestimonial, getPractitionerTestimonials } = require("../controllers/testimonial")
const { auth } = require("../middleware/auth")

router.post("/", auth, submitTestimonial)
router.get("/practitioner/:practitionerId", getPractitionerTestimonials)

module.exports = router
