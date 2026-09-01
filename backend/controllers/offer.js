const Offer = require("../models/Offer")
const PractitionerProfile = require("../models/PractitionerProfile")

exports.createOffer = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id
    const { type, kind, title, description, price, durationMinutes, maxSeats, weekCount, program, tags } = req.body

    if (!title || price === undefined || price === null || price === "") {
      return res.status(400).json({
        success: false,
        message: "Offer title and price are required",
      })
    }

    const rawType = (type || kind || "session").toLowerCase()
    const validTypes = ["session", "circle", "program"]
    const finalType = validTypes.includes(rawType) ? rawType : "session"

    const offer = await Offer.create({
      practitioner: userId,
      type: finalType,
      title,
      description: description || "",
      price: Number(price),
      durationMinutes: durationMinutes ? Number(durationMinutes) : 50,
      maxSeats: maxSeats ? Number(maxSeats) : undefined,
      weekCount: weekCount ? Number(weekCount) : undefined,
      program: program || undefined,
      tags: Array.isArray(tags) ? tags : [],
      status: "published",
    })

    // Auto-update PractitionerProfile sessionRate & formats
    const userOffers = await Offer.find({ practitioner: userId })
    if (userOffers.length > 0) {
      const minRate = Math.min(...userOffers.map((o) => o.price || 0))
      const formats = [...new Set(userOffers.map((o) => (o.type === "circle" ? "circle" : "1:1")))]
      await PractitionerProfile.findOneAndUpdate(
        { user: userId },
        { sessionRate: minRate, formats }
      )
    }

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
    const { type, kind, title, description, price, durationMinutes, maxSeats, weekCount, status, tags } = req.body

    const updateData = {}
    if (title !== undefined) updateData.title = title
    if (description !== undefined) updateData.description = description
    if (price !== undefined) updateData.price = Number(price)
    if (durationMinutes !== undefined) updateData.durationMinutes = Number(durationMinutes)
    if (maxSeats !== undefined) updateData.maxSeats = Number(maxSeats)
    if (weekCount !== undefined) updateData.weekCount = Number(weekCount)
    if (status !== undefined) updateData.status = status
    if (tags !== undefined) updateData.tags = Array.isArray(tags) ? tags : String(tags).split(',').map((t) => t.trim()).filter(Boolean)

    if (type || kind) {
      const rawType = (type || kind).toLowerCase()
      const validTypes = ["session", "circle", "program"]
      if (validTypes.includes(rawType)) updateData.type = rawType
    }

    const offer = await Offer.findOneAndUpdate(
      { _id: offerId, practitioner: userId },
      updateData,
      { new: true }
    )

    if (!offer) {
      return res.status(404).json({
        success: false,
        message: "Offer not found or unauthorized",
      })
    }

    // Auto-update PractitionerProfile sessionRate & formats
    const userOffers = await Offer.find({ practitioner: userId, status: "published" })
    if (userOffers.length > 0) {
      const minRate = Math.min(...userOffers.map((o) => o.price || 0))
      const formats = [...new Set(userOffers.map((o) => (o.type === "circle" ? "circle" : "1:1")))]
      await PractitionerProfile.findOneAndUpdate(
        { user: userId },
        { sessionRate: minRate, formats }
      )
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

exports.deleteOffer = async (req, res) => {
  try {
    const { offerId } = req.params
    const userId = req.user.id

    const existingOffer = await Offer.findOne({ _id: offerId, practitioner: userId })
    if (!existingOffer) {
      return res.status(404).json({
        success: false,
        message: "Offer not found or unauthorized",
      })
    }

    // ITEM 24 FIX: Live published offers must be marked as draft before deletion
    if (existingOffer.status === "published") {
      return res.status(400).json({
        success: false,
        message: "Live published offers cannot be deleted directly. Please unpublish the offer to DRAFT status first.",
      })
    }

    await Offer.findByIdAndDelete(offerId)


    // Recalculate profile rate & formats
    const remainingOffers = await Offer.find({ practitioner: userId, status: "published" })
    if (remainingOffers.length > 0) {
      const minRate = Math.min(...remainingOffers.map((o) => o.price || 0))
      const formats = [...new Set(remainingOffers.map((o) => (o.type === "circle" ? "circle" : "1:1")))]
      await PractitionerProfile.findOneAndUpdate(
        { user: userId },
        { sessionRate: minRate, formats }
      )
    }

    return res.status(200).json({
      success: true,
      message: "Offer deleted successfully",
      offerId,
    })
  } catch (error) {
    console.error("Delete Offer Error:", error)
    return res.status(500).json({
      success: false,
      message: "Failed to delete offer",
      error: error.message,
    })
  }
}
