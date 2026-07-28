const CircleCohort = require("../models/CircleCohort")
const CircleMembership = require("../models/CircleMembership")
const User = require("../models/User")

// Get all circles created by registered practitioners
exports.getAllCircles = async (req, res) => {
  try {
    const circles = await CircleCohort.find()
      .populate("practitioner", "firstName lastName email image accountType credentials")
      .populate("members", "firstName lastName email image accountType")
      .sort({ createdAt: -1 })

    return res.status(200).json({
      success: true,
      circles,
    })
  } catch (error) {
    console.error("getAllCircles error:", error)
    return res.status(500).json({
      success: false,
      message: "Failed to fetch circles",
      error: error.message,
    })
  }
}

// Create new circle (Practitioners only)
exports.createCircle = async (req, res) => {
  try {
    const { name, topic, seats = 10, scheduleText, startDate, endDate } = req.body
    const userId = req.user.id

    if (!name) {
      return res.status(400).json({ success: false, message: "Circle name is required" })
    }

    const circle = await CircleCohort.create({
      practitioner: userId,
      name,
      topic: topic || "",
      scheduleText: scheduleText || "Weekly sessions",
      startDate: startDate ? new Date(startDate) : new Date(),
      endDate: endDate ? new Date(endDate) : new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      seats: Number(seats) || 10,
      seatsFilledCount: 1,
      status: "active",
      kanbanStage: "active",
      members: [userId],
      feedPosts: [
        {
          author: userId,
          content: `Circle "${name}" created. Welcome members! Schedule: ${scheduleText || "Weekly sessions"}.`,
          isAnnouncement: true,
        },
      ],
    })

    const populatedCircle = await CircleCohort.findById(circle._id)
      .populate("practitioner", "firstName lastName email image accountType credentials")
      .populate("members", "firstName lastName email image accountType")

    return res.status(201).json({
      success: true,
      message: "Circle created successfully!",
      circle: populatedCircle,
    })
  } catch (error) {
    console.error("createCircle error:", error)
    return res.status(500).json({
      success: false,
      message: "Failed to create circle",
      error: error.message,
    })
  }
}

// Join circle (Clients)
exports.joinCircle = async (req, res) => {
  try {
    const { cohortId } = req.params
    const userId = req.user.id

    const circle = await CircleCohort.findById(cohortId)
    if (!circle) {
      return res.status(404).json({ success: false, message: "Circle not found" })
    }

    const isAlreadyMember = circle.members.some(
      (mId) => String(mId) === String(userId)
    )

    if (!isAlreadyMember) {
      circle.members.push(userId)
      circle.seatsFilledCount = (circle.seatsFilledCount || 0) + 1
      await circle.save()

      // Also create CircleMembership record
      let membership = await CircleMembership.findOne({ cohort: cohortId, user: userId })
      if (!membership) {
        await CircleMembership.create({
          cohort: cohortId,
          user: userId,
          status: "active",
        })
      }
    }

    const updatedCircle = await CircleCohort.findById(cohortId)
      .populate("practitioner", "firstName lastName email image accountType credentials")
      .populate("members", "firstName lastName email image accountType")

    return res.status(200).json({
      success: true,
      message: isAlreadyMember ? "You are already a member of this circle!" : "Successfully joined circle cohort!",
      circle: updatedCircle,
    })
  } catch (error) {
    console.error("joinCircle error:", error)
    return res.status(500).json({
      success: false,
      message: "Failed to join circle",
      error: error.message,
    })
  }
}

exports.getCohortDetail = async (req, res) => {
  try {
    const { cohortId } = req.params
    let cohort = await CircleCohort.findById(cohortId)
      .populate("practitioner", "firstName lastName email image accountType credentials")
      .populate("members", "firstName lastName email image accountType")
      .populate({
        path: "feedPosts.author",
        select: "firstName lastName image",
      })

    if (!cohort) {
      return res.status(404).json({ success: false, message: "Cohort not found" })
    }

    return res.status(200).json({
      success: true,
      cohort,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch circle cohort detail",
      error: error.message,
    })
  }
}

exports.updateKanbanStage = async (req, res) => {
  try {
    const { cohortId } = req.params
    const { kanbanStage } = req.body

    const cohort = await CircleCohort.findByIdAndUpdate(
      cohortId,
      { kanbanStage, status: kanbanStage === "active" ? "active" : "forming" },
      { new: true }
    )

    return res.status(200).json({
      success: true,
      message: `Circle stage updated to ${kanbanStage}`,
      cohort,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update circle stage",
      error: error.message,
    })
  }
}

exports.postToFeed = async (req, res) => {
  try {
    const { cohortId } = req.params
    const { content, isAnnouncement } = req.body
    const userId = req.user.id

    const cohort = await CircleCohort.findById(cohortId)
    if (!cohort) {
      return res.status(404).json({ success: false, message: "Cohort not found" })
    }

    cohort.feedPosts.push({
      author: userId,
      content,
      isAnnouncement: Boolean(isAnnouncement),
    })

    await cohort.save()

    return res.status(201).json({
      success: true,
      message: "Post added to cohort feed",
      cohort,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to post to feed",
      error: error.message,
    })
  }
}
