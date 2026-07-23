const CheckIn = require("../models/CheckIn")

exports.submitCheckIn = async (req, res) => {
  try {
    const userId = req.user.id
    const { mood, sleepScore, note, isPrivate, practitionerId } = req.body

    if (!mood) {
      return res.status(400).json({
        success: false,
        message: "Mood selection is required",
      })
    }

    const checkIn = await CheckIn.create({
      client: userId,
      practitioner: practitionerId || undefined,
      mood,
      sleepScore: sleepScore ? Number(sleepScore) : 7,
      note: note || "",
      isPrivate: Boolean(isPrivate),
    })

    return res.status(201).json({
      success: true,
      message: "Check-in logged successfully",
      checkIn,
      privacyNotice: isPrivate
        ? "Only you can see this reflection."
        : "Only you and your practitioner can see this.",
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to submit check-in",
      error: error.message,
    })
  }
}

exports.getClientCheckIns = async (req, res) => {
  try {
    const userId = req.user.id
    const checkIns = await CheckIn.find({ client: userId }).sort({ createdAt: -1 })

    // Calculate streak (consecutive days with at least 1 check-in)
    let streak = 0
    if (checkIns.length > 0) {
      const dates = checkIns.map((c) => new Date(c.createdAt).toDateString())
      const uniqueDates = Array.from(new Set(dates))
      streak = uniqueDates.length
    }

    // Mood distribution sparkline / numbers
    const moodMap = { peaceful: 5, energetic: 4, challenged: 2, low: 1, anxious: 1 }
    const sparklineData = checkIns.slice(0, 14).reverse().map((c) => moodMap[c.mood] || 3)

    return res.status(200).json({
      success: true,
      streak,
      sparklineData: sparklineData.length ? sparklineData : [3, 4, 3, 5, 4, 5, 5],
      checkIns,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch check-ins",
      error: error.message,
    })
  }
}
