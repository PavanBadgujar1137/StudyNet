const Milestone = require("../models/Milestone")

exports.getMyMilestones = async (req, res) => {
  try {
    const userId = req.user.id
    const milestones = await Milestone.find({ client: userId }).sort({ dayNumber: 1, createdAt: -1 })

    // If no milestones recorded yet, return default starter journey milestones
    if (milestones.length === 0) {
      const starterMilestones = [
        { title: "First Session Booked", description: "Began journey with practitioner", dayNumber: 1 },
        { title: "7-Day Reflection Streak", description: "Completed 7 daily check-ins", dayNumber: 7 },
        { title: "Circle Container Joined", description: "Stepped into 6-week peer group", dayNumber: 30 },
        { title: "6-Week Milestone Marked", description: "Completed full circle transformation", dayNumber: 60 },
      ]
      return res.status(200).json({ success: true, milestones: starterMilestones })
    }

    return res.status(200).json({ success: true, milestones })
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message })
  }
}

exports.createMilestone = async (req, res) => {
  try {
    const userId = req.user.id
    const { title, description, dayNumber } = req.body

    const milestone = await Milestone.create({
      client: userId,
      title,
      description: description || "",
      dayNumber: dayNumber ? Number(dayNumber) : 1,
    })

    return res.status(201).json({
      success: true,
      message: "Milestone marked successfully! Ready to share.",
      milestone,
    })
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message })
  }
}
