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

exports.updateAvailability = async (req, res) => {
  try {
    const userId = req.user.id
    const { timezone, weeklySchedule } = req.body

    let availability = await PractitionerAvailability.findOne({ practitioner: userId })
    if (!availability) {
      availability = new PractitionerAvailability({ practitioner: userId })
    }

    if (timezone) availability.timezone = timezone
    if (weeklySchedule) availability.weeklySchedule = weeklySchedule

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
    const { date } = req.query // "YYYY-MM-DD"
    
    const availability = await PractitionerAvailability.findOne({ practitioner: practitionerId })
    if (!availability || !availability.weeklySchedule || availability.weeklySchedule.length === 0) {
      return res.status(200).json({ success: true, slots: [] })
    }

    const targetDate = new Date(date)
    const dayOfWeek = targetDate.getDay()

    const daySchedule = availability.weeklySchedule.find(d => d.day === dayOfWeek)
    if (!daySchedule || !daySchedule.slots || daySchedule.slots.length === 0) {
      return res.status(200).json({ success: true, slots: [] })
    }

    // Mock filtering with Google Calendar if connected (for demo we just return slots)
    // A real implementation would call calendar.events.freeBusy here
    
    // Generate 30-min slots based on ranges
    let availableSlots = []
    
    for (const range of daySchedule.slots) {
      const [startH, startM] = range.startTime.split(":").map(Number)
      const [endH, endM] = range.endTime.split(":").map(Number)
      
      let current = new Date(targetDate)
      current.setHours(startH, startM, 0, 0)
      
      const end = new Date(targetDate)
      end.setHours(endH, endM, 0, 0)

      while (current < end) {
        const slotTime = current.toTimeString().substring(0, 5)
        availableSlots.push(slotTime)
        current.setMinutes(current.getMinutes() + 30) // 30 min intervals
      }
    }

    return res.status(200).json({ success: true, slots: availableSlots })

  } catch (error) {
    console.error("Error getting slots:", error)
    return res.status(500).json({ success: false, message: "Server error" })
  }
}
