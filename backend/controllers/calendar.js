const PractitionerAvailability = require("../models/PractitionerAvailability")
const User = require("../models/User")
const { google } = require("googleapis")

// Resolve correct OAuth redirect URI dynamically based on env or request host
const resolveRedirectUri = (req) => {
  // 1. Explicit override passed from frontend
  if (req?.query?.redirectUri) {
    return req.query.redirectUri
  }
  if (req?.body?.redirectUri) {
    return req.body.redirectUri
  }

  // 2. Explicit environment override if configured and valid
  if (process.env.GOOGLE_REDIRECT_URI && !process.env.GOOGLE_REDIRECT_URI.includes("/api/v1/calendar/auth/callback")) {
    return process.env.GOOGLE_REDIRECT_URI
  }

  // 3. Fallback based on incoming request origin or referer
  if (req) {
    const origin = req.headers["origin"] || req.headers["referer"]
    if (origin) {
      try {
        const u = new URL(origin)
        return `${u.origin}/social-callback`
      } catch (e) {}
    }
  }

  const appEnv = String(process.env.APP_ENV || "").toLowerCase()
  if (appEnv === "production") {
    return "https://openhand.live/social-callback"
  }

  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000"
  if (frontendUrl.includes("localhost")) {
    return `${frontendUrl.replace(/\/$/, "")}/social-callback`
  }

  return "https://openhand.live/social-callback"
}

const createOAuthClient = (redirectUri) => {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID || "mock-client-id",
    process.env.GOOGLE_CLIENT_SECRET || "mock-client-secret",
    redirectUri
  )
}

exports.getGoogleAuthUrl = async (req, res) => {
  try {
    const userId = req.user.id
    const redirectUri = resolveRedirectUri(req)
    const returnTo = req.query.returnTo || "/practice"

    // Encode userId, redirectUri, returnTo, and flow identifier in state
    const state = Buffer.from(
      JSON.stringify({ userId, redirectUri, returnTo, isCalendar: true, type: "google_calendar" })
    ).toString("base64")

    const client = createOAuthClient(redirectUri)

    const url = client.generateAuthUrl({
      access_type: "offline",
      scope: ["https://www.googleapis.com/auth/calendar.events"],
      state,
      prompt: "consent",
      redirect_uri: redirectUri,
    })

    return res.status(200).json({ success: true, url, redirectUri })
  } catch (error) {
    console.error("Error generating auth url:", error)
    return res.status(500).json({ success: false, message: "Internal server error" })
  }
}

exports.googleAuthCallback = async (req, res) => {
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000"
  const isJsonRequest = req.method === "POST" || req.headers.accept?.includes("application/json") || req.is?.("json")
  
  try {
    const code = req.query?.code || req.body?.code
    const state = req.query?.state || req.body?.state
    const authError = req.query?.error || req.body?.error

    if (authError) {
      console.warn("Google OAuth was rejected or cancelled:", authError)
      if (isJsonRequest) {
        return res.status(400).json({ success: false, error: authError })
      }
      return res.redirect(`${frontendUrl}/practice?calendar_error=${encodeURIComponent(authError)}`)
    }

    if (!code || !state) {
      if (isJsonRequest) {
        return res.status(400).json({ success: false, message: "Invalid request: missing code or state" })
      }
      return res.status(400).send("Invalid callback request: missing code or state")
    }

    let parsedState = {}
    try {
      parsedState = JSON.parse(Buffer.from(state, "base64").toString("ascii"))
    } catch (parseErr) {
      try {
        parsedState = JSON.parse(decodeURIComponent(state))
      } catch (err2) {
        console.error("Failed to decode OAuth state:", parseErr)
        if (isJsonRequest) {
          return res.status(400).json({ success: false, message: "Invalid state parameter" })
        }
        return res.status(400).send("Invalid state parameter")
      }
    }

    const userId = parsedState.userId || req.user?.id
    const redirectUri = req.body?.redirectUri || parsedState.redirectUri || resolveRedirectUri(req)
    const returnTo = parsedState.returnTo || "/practice"

    if (!userId) {
      if (isJsonRequest) {
        return res.status(400).json({ success: false, message: "User ID missing from OAuth state" })
      }
      return res.status(400).send("User ID missing from OAuth state")
    }

    const effectiveRedirectUri = redirectUri || resolveRedirectUri(req)
    const client = createOAuthClient(effectiveRedirectUri)

    const { tokens } = await client.getToken({
      code,
      redirect_uri: effectiveRedirectUri,
    })
    
    // Save tokens in PractitionerAvailability
    let availability = await PractitionerAvailability.findOne({ practitioner: userId })
    if (!availability) {
      availability = new PractitionerAvailability({ practitioner: userId })
    }

    availability.googleCalendarConnected = true
    if (tokens.access_token) availability.googleAccessToken = tokens.access_token
    if (tokens.refresh_token) availability.googleRefreshToken = tokens.refresh_token
    if (tokens.expiry_date) availability.googleTokenExpiry = tokens.expiry_date

    await availability.save()

    if (isJsonRequest) {
      return res.status(200).json({
        success: true,
        message: "Google Calendar connected successfully",
        returnTo,
      })
    }

    // Redirect back to frontend
    const targetPath = returnTo || "/practice"
    return res.redirect(`${frontendUrl}${targetPath}?calendar_connected=true`)
  } catch (error) {
    console.error("Google Auth Callback Error:", error?.response?.data || error)
    if (isJsonRequest) {
      return res.status(500).json({
        success: false,
        message: error?.response?.data?.error_description || "Token exchange failed",
      })
    }
    return res.redirect(`${frontendUrl}/practice?calendar_error=token_exchange_failed`)
  }
}

exports.disconnectCalendar = async (req, res) => {
  try {
    const userId = req.user.id
    const availability = await PractitionerAvailability.findOne({ practitioner: userId })
    if (availability) {
      availability.googleCalendarConnected = false
      availability.googleAccessToken = null
      availability.googleRefreshToken = null
      availability.googleTokenExpiry = null
      await availability.save()
    }
    return res.status(200).json({ success: true, message: "Google Calendar disconnected successfully" })
  } catch (error) {
    console.error("Error disconnecting calendar:", error)
    return res.status(500).json({ success: false, message: "Server error" })
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
