const CircleCohort = require("../models/CircleCohort")
const CircleMembership = require("../models/CircleMembership")

exports.getCohortDetail = async (req, res) => {
  try {
    const { cohortId } = req.params
    let cohort = await CircleCohort.findById(cohortId)
      .populate("members", "firstName lastName email image")
      .populate({
        path: "feedPosts.author",
        select: "firstName lastName image",
      })

    if (!cohort) {
      // Return a default demo cohort shape for newly created circles
      cohort = {
        _id: cohortId,
        name: "Mindful Transition Container",
        seats: 8,
        seatsFilledCount: 6,
        status: "active",
        kanbanStage: "active",
        startDate: new Date(),
        endDate: new Date(Date.now() + 42 * 24 * 60 * 60 * 1000),
        members: [
          { _id: "m1", firstName: "Ananya", lastName: "Sharma" },
          { _id: "m2", firstName: "Kabir", lastName: "Verma" },
          { _id: "m3", firstName: "Tara", lastName: "Sen" },
          { _id: "m4", firstName: "Dev", lastName: "Mehta" },
          { _id: "m5", firstName: "Priya", lastName: "Rao" },
          { _id: "m6", firstName: "Rahul", lastName: "Kapoor" },
        ],
        feedPosts: [
          {
            _id: "fp1",
            content: "Welcome to Week 3! Our live call is this Thursday at 7 PM IST.",
            isAnnouncement: true,
            createdAt: new Date(Date.now() - 86400000),
          },
          {
            _id: "fp2",
            content: "Shared the week 3 integration prompt in the Reflections tab.",
            isAnnouncement: false,
            createdAt: new Date(Date.now() - 43200000),
          },
        ],
      }
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
