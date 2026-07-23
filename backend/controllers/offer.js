const Offer = require("../models/Offer")
const PractitionerProfile = require("../models/PractitionerProfile")

exports.createOffer = async (req, res) => {
  try {
    const userId = req.user.id
    const { type, title, description, price, durationMinutes, maxSeats, weekCount, program, tags } = req.body

    if (!type || !title || price === undefined) {
      return res.status(400).json({
        success: false,
        message: "Offer type, title, and price are required",
      })
    }

    const offer = await Offer.create({
      practitioner: userId,
      type,
      title,
      description,
      price: Number(price),
      durationMinutes: durationMinutes ? Number(durationMinutes) : 50,
      maxSeats: maxSeats ? Number(maxSeats) : undefined,
      weekCount: weekCount ? Number(weekCount) : undefined,
      program: program || undefined,
      tags: Array.isArray(tags) ? tags : [],
      status: "published",
    })

    return res.status(201).json({
      success: true,
      message: "Offer created successfully",
      offer,
    })
  } catch (error) {
    console.error("Create Offer Error:", error)
    return res.status(500).json({
      success: false,
      message: "Failed to create offer",
      error: error.message,
    })
  }
}

exports.getPractitionerOffers = async (req, res) => {
  try {
    const userId = req.user.id
    const offers = await Offer.find({ practitioner: userId }).populate("program")

    return res.status(200).json({
      success: true,
      offers,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch offers",
      error: error.message,
    })
  }
}

exports.updateOffer = async (req, res) => {
  try {
    const { offerId } = req.params
    const userId = req.user.id
    const offer = await Offer.findOneAndUpdate(
      { _id: offerId, practitioner: userId },
      req.body,
      { new: true }
    )

    if (!offer) {
      return res.status(404).json({
        success: false,
        message: "Offer not found or unauthorized",
      })
    }

    return res.status(200).json({
      success: true,
      message: "Offer updated successfully",
      offer,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update offer",
      error: error.message,
    })
  }
}
