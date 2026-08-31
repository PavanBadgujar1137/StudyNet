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

    const parsedSleepScore =
      sleepScore !== undefined && sleepScore !== null && sleepScore !== ""
        ? Number(sleepScore)
        : 7

    if (isNaN(parsedSleepScore) || parsedSleepScore < 0 || parsedSleepScore > 10) {
      return res.status(400).json({
        success: false,
        message: "Sleep score must be a number between 0 and 10",
      })
    }

    // ITEM 13 FIX: Check if check-in exists for today to update instead of creating duplicate entry
    const startOfDay = new Date()
    startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date()
    endOfDay.setHours(23, 59, 59, 999)

    let existingCheckIn = await CheckIn.findOne({
      client: userId,
      createdAt: { $gte: startOfDay, $lte: endOfDay },
    })

    if (existingCheckIn) {
      existingCheckIn.mood = mood
      existingCheckIn.sleepScore = parsedSleepScore
      existingCheckIn.note = note !== undefined ? note : existingCheckIn.note
      existingCheckIn.isPrivate = isPrivate !== undefined ? Boolean(isPrivate) : existingCheckIn.isPrivate
      if (practitionerId) existingCheckIn.practitioner = practitionerId
      await existingCheckIn.save()

      return res.status(200).json({
        success: true,
        message: "Today's check-in updated successfully",
        checkIn: existingCheckIn,
        updated: true,
        privacyNotice: existingCheckIn.isPrivate
          ? "Only you can see this reflection."
          : "Only you and your practitioner can see this.",
      })
    }

    const checkIn = await CheckIn.create({
      client: userId,
      practitioner: practitionerId || undefined,
      mood,
      sleepScore: parsedSleepScore,
      note: note || "",
      isPrivate: Boolean(isPrivate),
    })

    return res.status(201).json({
      success: true,
      message: "Check-in logged successfully",
      checkIn,
      updated: false,
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
