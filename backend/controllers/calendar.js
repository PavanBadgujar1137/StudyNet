const PractitionerAvailability = require("../models/PractitionerAvailability")
const User = require("../models/User")
const { google } = require("googleapis")

// Initialize Google OAuth2 client
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID || "mock-client-id",
  process.env.GOOGLE_CLIENT_SECRET || "mock-client-secret",
  process.env.GOOGLE_REDIRECT_URI || "http://localhost:5000/api/v1/calendar/auth/callback"
)

exports.getGoogleAuthUrl = async (req, res) => {
  try {
    const userId = req.user.id
    // We encode the userId in the state parameter to know who is connecting
    const state = Buffer.from(JSON.stringify({ userId })).toString("base64")

    const url = oauth2Client.generateAuthUrl({
      access_type: "offline",
      scope: ["https://www.googleapis.com/auth/calendar.events"],
      state,
      prompt: "consent",
    })

    return res.status(200).json({ success: true, url })
  } catch (error) {
    console.error("Error generating auth url:", error)
    return res.status(500).json({ success: false, message: "Internal server error" })
  }
}

exports.googleAuthCallback = async (req, res) => {
  try {
    const { code, state } = req.query
    if (!code || !state) {
      return res.status(400).send("Invalid callback request")
    }

    const { userId } = JSON.parse(Buffer.from(state, "base64").toString("ascii"))

    const { tokens } = await oauth2Client.getToken(code)
    
    // Save tokens in PractitionerAvailability
    let availability = await PractitionerAvailability.findOne({ practitioner: userId })
    if (!availability) {
      availability = new PractitionerAvailability({ practitioner: userId })
    }

    availability.googleCalendarConnected = true
    availability.googleAccessToken = tokens.access_token
    if (tokens.refresh_token) {
      availability.googleRefreshToken = tokens.refresh_token
    }
    availability.googleTokenExpiry = tokens.expiry_date

    await availability.save()

    // Redirect back to frontend
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000"
    return res.redirect(`${frontendUrl}/dashboard/practitioner?calendar_connected=true`)
  } catch (error) {
    console.error("Google Auth Callback Error:", error)
    return res.status(500).send("Failed to connect Google Calendar")
  }
}

exports.getAvailability = async (req, res) => {
  try {
    const userId = req.user.id
    let availability = await PractitionerAvailability.findOne({ practitioner: userId })
    
    if (!availability) {
      availability = await PractitionerAvailability.create({ practitioner: userId })
    }

    return res.status(200).json({ success: true, availability })
  } catch (error) {
    console.error("Error getting availability:", error)
    return res.status(500).json({ success: false, message: "Server error" })
  }
}

const Booking = require("../models/Booking")
const LiveClass = require("../models/LiveClass")
const PractitionerProfile = require("../models/PractitionerProfile")

exports.updateAvailability = async (req, res) => {
  try {
    const userId = req.user.id
    const { timezone, weeklySchedule, maxSessionsPerDay, sessionDurationMinutes } = req.body

    let availability = await PractitionerAvailability.findOne({ practitioner: userId })
    if (!availability) {
      availability = new PractitionerAvailability({ practitioner: userId })
    }

    if (timezone) availability.timezone = timezone
    if (weeklySchedule) availability.weeklySchedule = weeklySchedule
    if (maxSessionsPerDay != null) availability.maxSessionsPerDay = Math.max(1, Number(maxSessionsPerDay))
    if (sessionDurationMinutes != null) availability.sessionDurationMinutes = Math.max(15, Number(sessionDurationMinutes))

    await availability.save()

    return res.status(200).json({ success: true, availability, message: "Schedule updated successfully" })
  } catch (error) {
    console.error("Error updating availability:", error)
    return res.status(500).json({ success: false, message: "Server error" })
  }
}

exports.getAvailableSlots = async (req, res) => {
  try {
    const { practitionerId } = req.params
    const { date, duration } = req.query // "YYYY-MM-DD", optional duration in minutes

    // 1. Resolve practitioner User ID (supports User ID or PractitionerProfile ID)
    let practUser = await User.findById(practitionerId)
    if (!practUser) {
      const prof = await PractitionerProfile.findById(practitionerId)
      if (prof) practUser = await User.findById(prof.user)
    }
    const practUserId = practUser ? practUser._id : practitionerId

    // 2. Fetch PractitionerAvailability
    let availability = await PractitionerAvailability.findOne({ practitioner: practUserId })

    const targetDate = new Date(date)
    if (isNaN(targetDate.getTime())) {
      return res.status(400).json({ success: false, message: "Invalid date format. Use YYYY-MM-DD." })
    }
    const dayOfWeek = targetDate.getDay() // 0 (Sun) to 6 (Sat)
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
    const dayLabel = dayNames[dayOfWeek]

    // If practitioner has never set up availability OR has 0 weekly schedule days configured:
    // DO NOT show any fake/dummy slots. Only show what practitioner explicitly created.
    if (!availability || !availability.weeklySchedule || availability.weeklySchedule.length === 0) {
      return res.status(200).json({
        success: true,
        date,
        dayLabel,
        maxSessionsPerDay: availability?.maxSessionsPerDay || 5,
        bookedCount: 0,
        remainingCount: 0,
        slots: [],
        message: `Practitioner has not created any schedule for ${dayLabel}s.`,
      })
    }

    const maxSessionsPerDay = availability.maxSessionsPerDay || 5
    const slotDuration = availability.sessionDurationMinutes || Number(duration) || 30

    const daySchedule = availability.weeklySchedule.find(d => d.day === dayOfWeek)
    if (!daySchedule || !daySchedule.slots || daySchedule.slots.length === 0) {
      return res.status(200).json({
        success: true,
        date,
        dayLabel,
        maxSessionsPerDay,
        bookedCount: 0,
        remainingCount: 0,
        slots: [],
        message: `Practitioner is unavailable on ${dayLabel}s.`,
      })
    }

    // 3. Find existing bookings and live classes for this practitioner on this date
    const dayStart = new Date(targetDate)
    dayStart.setHours(0, 0, 0, 0)
    const dayEnd = new Date(targetDate)
    dayEnd.setHours(23, 59, 59, 999)

    const existingBookings = await Booking.find({
      practitioner: practUserId,
      status: { $in: ["confirmed", "pending", "completed"] },
      scheduledAt: { $gte: dayStart, $lte: dayEnd },
    }).select("scheduledAt status offer").lean()

    const existingLiveClasses = await LiveClass.find({
      instructor: practUserId,
      status: { $in: ["scheduled", "live"] },
      scheduledStart: { $gte: dayStart, $lte: dayEnd },
    }).select("scheduledStart scheduledEnd status").lean()

    const bookedCount = existingBookings.length
    const dayIsFull = bookedCount >= maxSessionsPerDay
    const remainingCount = Math.max(0, maxSessionsPerDay - bookedCount)

    const now = new Date()
    const isToday = now.toISOString().split("T")[0] === date

    // 4. Generate discrete time slots strictly from practitioner's configured slots
    const generatedSlots = []

    for (const range of daySchedule.slots) {
      if (!range.startTime || !range.endTime) continue
      const [startH, startM] = range.startTime.split(":").map(Number)
      const [endH, endM] = range.endTime.split(":").map(Number)

      let currentMin = startH * 60 + startM
      const endMin = endH * 60 + endM
      const totalRangeMinutes = endMin - currentMin

      if (totalRangeMinutes <= 0) continue

      // Step by slotDuration (e.g. 30 mins, 45 mins, 50 mins, 60 mins)
      const step = Math.min(totalRangeMinutes, Math.max(15, slotDuration))

      while (currentMin + step <= endMin) {
        const slotStartH = Math.floor(currentMin / 60)
        const slotStartM = currentMin % 60
        const slotEndH = Math.floor((currentMin + step) / 60)
        const slotEndM = (currentMin + step) % 60

        const pad = (n) => String(n).padStart(2, "0")
        const startTimeStr = `${pad(slotStartH)}:${pad(slotStartM)}`
        const endTimeStr = `${pad(slotEndH)}:${pad(slotEndM)}`

        // Format to 12-hour AM/PM: e.g. "11:00 AM - 12:00 PM"
        const format12h = (h, m) => {
          const ampm = h >= 12 ? "PM" : "AM"
          const h12 = h % 12 || 12
          return `${pad(h12)}:${pad(m)} ${ampm}`
        }
        const label12h = `${format12h(slotStartH, slotStartM)} - ${format12h(slotEndH, slotEndM)}`

        // Exact timestamp for this slot on targetDate
        const slotStartDate = new Date(targetDate)
        slotStartDate.setHours(slotStartH, slotStartM, 0, 0)

        // Check if this slot conflicts with an existing booking
        const isBooked = existingBookings.some((b) => {
          const bTime = new Date(b.scheduledAt).getTime()
          return Math.abs(bTime - slotStartDate.getTime()) < 25 * 60 * 1000
        }) || existingLiveClasses.some((lc) => {
          const lcStart = new Date(lc.scheduledStart).getTime()
          return Math.abs(lcStart - slotStartDate.getTime()) < 25 * 60 * 1000
        })

        // Check if past
        const isPast = isToday && slotStartDate.getTime() <= (now.getTime() + 15 * 60 * 1000)

        const isAvailable = !isBooked && !isPast && !dayIsFull

        generatedSlots.push({
          time: startTimeStr,
          endTime: endTimeStr,
          label: label12h,
          fullDateTime: slotStartDate.toISOString(),
          isBooked,
          isPast,
          isAvailable,
        })

        currentMin += step
      }
    }

    return res.status(200).json({
      success: true,
      date,
      dayLabel,
      maxSessionsPerDay,
      bookedCount,
      remainingCount,
      dayIsFull,
      slots: generatedSlots,
    })
  } catch (error) {
    console.error("Error getting slots:", error)
    return res.status(500).json({ success: false, message: "Server error" })
  }
}
