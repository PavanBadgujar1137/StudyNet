const Testimonial = require("../models/Testimonial")
const User = require("../models/User")

exports.submitTestimonial = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id
    const { practitionerId, content, review, rating = 5 } = req.body

    const textContent = content || review

    if (!practitionerId || !textContent) {
      return res.status(400).json({ success: false, message: "Practitioner ID and review content are required" })
    }

    const learner = await User.findById(userId).select("firstName lastName email image")
    const clientName = learner ? `${learner.firstName} ${learner.lastName}`.trim() : "Verified Learner"

    const testimonial = await Testimonial.create({
      practitioner: practitionerId,
      user: userId,
      clientName,
      content: textContent,
      rating: Number(rating) || 5,
      status: "pending",
      isApproved: false,
    })

    return res.status(201).json({
      success: true,
      message: "Thank you! Your rating and feedback have been submitted for Admin Verification. It will become visible once approved by our moderation team.",
      testimonial,
    })
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message })
  }
}

exports.getPractitionerTestimonials = async (req, res) => {
  try {
    const { practitionerId } = req.params
    // Only return approved testimonials
    const testimonials = await Testimonial.find({
      practitioner: practitionerId,
      $or: [{ status: "approved" }, { isApproved: true }],
    })
      .populate("user", "firstName lastName image")
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
