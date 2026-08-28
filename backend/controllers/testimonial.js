const Testimonial = require("../models/Testimonial")
const User = require("../models/User")

exports.submitTestimonial = async (req, res) => {
  try {
    const userId = req.user.id
    const { practitionerId, content, rating = 5 } = req.body

    if (!practitionerId || !content) {
      return res.status(400).json({ success: false, message: "Practitioner ID and content are required" })
    }

    const learner = await User.findById(userId).select("firstName lastName")
    const clientName = learner ? `${learner.firstName} ${learner.lastName}` : "Verified Learner"

    const testimonial = await Testimonial.create({
      practitioner: practitionerId,
      clientName,
      content,
      rating: Number(rating),
      isApproved: true,
    })

    return res.status(201).json({
      success: true,
      message: "Testimonial submitted successfully! Thank you for sharing your transformation.",
      testimonial,
    })
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message })
  }
}

exports.getPractitionerTestimonials = async (req, res) => {
  try {
    const { practitionerId } = req.params
    const testimonials = await Testimonial.find({ practitioner: practitionerId, isApproved: true })
      .sort({ createdAt: -1 })
      .lean()

    return res.status(200).json({
      success: true,
      testimonials,
    })
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message })
  }
}
