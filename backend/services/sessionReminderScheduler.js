const cron = require("node-cron")
const Booking = require("../models/Booking")
const LiveClass = require("../models/LiveClass")
const {
  sendSessionReminder1Hour,
  sendSessionReminder15Min,
  sendSessionReminder2Min,
} = require("./notificationService")

let isJobRunning = false

async function checkAndDispatchReminders() {
  if (isJobRunning) return
  isJobRunning = true

  try {
    const now = new Date()
    // Scan window: Look ahead up to 75 minutes from now
    const maxLookahead = new Date(now.getTime() + 75 * 60 * 1000)
    const minLookbehind = new Date(now.getTime() - 10 * 60 * 1000)

    // ── 1. Check 1-on-1 Session Bookings ─────────────────────────────────────
    const upcomingBookings = await Booking.find({
      status: { $in: ["confirmed", "scheduled", "paid"] },
      scheduledAt: { $gte: minLookbehind, $lte: maxLookahead },
      $or: [
        { reminder1hSent: { $ne: true } },
        { reminder15mSent: { $ne: true } },
        { reminder2mSent: { $ne: true } },
      ],
    })
      .populate("client", "firstName lastName email contactNumber whatsappNumber additionalDetails")
      .populate("practitioner", "firstName lastName")
      .populate("offer", "title durationMinutes")

    for (const booking of upcomingBookings) {
      if (!booking.scheduledAt) continue
      const diffMinutes = (new Date(booking.scheduledAt).getTime() - now.getTime()) / 60000

      // A. 1-Hour Reminder Window: ~45 to 65 minutes ahead
      if (diffMinutes <= 65 && diffMinutes > 35 && !booking.reminder1hSent) {
        console.log(`[Scheduler] ⏰ Triggering 1-Hour reminder for booking ${booking._id} (in ${Math.round(diffMinutes)} mins)`)
        await sendSessionReminder1Hour(booking)
      }

      // B. 15-Minute Reminder Window: ~5 to 17 minutes ahead
      if (diffMinutes <= 17 && diffMinutes > 4 && !booking.reminder15mSent) {
        console.log(`[Scheduler] 🔔 Triggering 15-Min reminder for booking ${booking._id} (in ${Math.round(diffMinutes)} mins)`)
        await sendSessionReminder15Min(booking)
      }

      // C. 2-Minute Reminder Window: -5 to 3 minutes ahead (session starting right now)
      if (diffMinutes <= 3 && diffMinutes >= -5 && !booking.reminder2mSent) {
        console.log(`[Scheduler] 🚀 Triggering 2-Min countdown reminder for booking ${booking._id}`)
        await sendSessionReminder2Min(booking)
      }
    }

    // ── 2. Check Scheduled Live Classes (1-on-1 or Live Class Sections) ────────
    const upcomingLiveClasses = await LiveClass.find({
      status: { $in: ["scheduled", "live"] },
      scheduledStart: { $gte: minLookbehind, $lte: maxLookahead },
      $or: [
        { reminder1hSent: { $ne: true } },
        { reminder15mSent: { $ne: true } },
        { reminder2mSent: { $ne: true } },
      ],
    })
      .populate("client", "firstName lastName email contactNumber whatsappNumber additionalDetails")
      .populate("instructor", "firstName lastName")
      .populate({
        path: "course",
        select: "title enrolledClients",
        populate: {
          path: "enrolledClients",
          select: "firstName lastName email contactNumber whatsappNumber additionalDetails",
        },
      })

    for (const liveClass of upcomingLiveClasses) {
      if (!liveClass.scheduledStart) continue
      const diffMinutes = (new Date(liveClass.scheduledStart).getTime() - now.getTime()) / 60000

      const clientsToNotify = []
      if (liveClass.client) {
        clientsToNotify.push(liveClass.client)
      } else if (liveClass.course?.enrolledClients?.length > 0) {
        clientsToNotify.push(...liveClass.course.enrolledClients)
      }

      if (clientsToNotify.length === 0) continue

      const durationMins = Math.round(((liveClass.scheduledEnd - liveClass.scheduledStart) || 3000000) / 60000)
      const meetLink = `${process.env.FRONTEND_URL || "https://openhand.live"}/live-classroom/${liveClass._id}`

      // A. 1-Hour Reminder
      if (diffMinutes <= 65 && diffMinutes > 35 && !liveClass.reminder1hSent) {
        for (const targetClient of clientsToNotify) {
          const syntheticBooking = {
            _id: liveClass._id,
            client: targetClient,
            practitioner: liveClass.instructor,
            offer: { title: liveClass.title, durationMinutes: durationMins },
            scheduledAt: liveClass.scheduledStart,
            meetingLink: meetLink,
            reminder1hSent: false,
            save: async () => {},
          }
          await sendSessionReminder1Hour(syntheticBooking)
        }
        liveClass.reminder1hSent = true
        await liveClass.save()
      }

      // B. 15-Minute Reminder
      if (diffMinutes <= 17 && diffMinutes > 4 && !liveClass.reminder15mSent) {
        for (const targetClient of clientsToNotify) {
          const syntheticBooking = {
            _id: liveClass._id,
            client: targetClient,
            practitioner: liveClass.instructor,
            offer: { title: liveClass.title, durationMinutes: durationMins },
            scheduledAt: liveClass.scheduledStart,
            meetingLink: meetLink,
            reminder15mSent: false,
            save: async () => {},
          }
          await sendSessionReminder15Min(syntheticBooking)
        }
        liveClass.reminder15mSent = true
        await liveClass.save()
      }

      // C. 2-Minute Reminder
      if (diffMinutes <= 3 && diffMinutes >= -5 && !liveClass.reminder2mSent) {
        for (const targetClient of clientsToNotify) {
          const syntheticBooking = {
            _id: liveClass._id,
            client: targetClient,
            practitioner: liveClass.instructor,
            offer: { title: liveClass.title, durationMinutes: durationMins },
            scheduledAt: liveClass.scheduledStart,
            meetingLink: meetLink,
            reminder2mSent: false,
            save: async () => {},
          }
          await sendSessionReminder2Min(syntheticBooking)
        }
        liveClass.reminder2mSent = true
        await liveClass.save()
      }
    }
  } catch (err) {
    console.error("[Scheduler] Error in session reminder cron job:", err.message)
  } finally {
    isJobRunning = false
  }
}

function startSessionReminderScheduler() {
  console.log("[Scheduler] 🕒 Initializing Multi-Channel Session Reminder Scheduler (Every Minute)")

  // Run every minute: * * * * *
  const job = cron.schedule("* * * * *", () => {
    checkAndDispatchReminders()
  })

  // Also run an immediate check on startup
  setTimeout(() => {
    checkAndDispatchReminders()
  }, 5000)

  return job
}

module.exports = {
  startSessionReminderScheduler,
  checkAndDispatchReminders,
}
