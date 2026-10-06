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
      status: "confirmed",
      scheduledAt: { $gte: minLookbehind, $lte: maxLookahead },
      $or: [
        { reminder1hSent: { $ne: true } },
        { reminder15mSent: { $ne: true } },
        { reminder2mSent: { $ne: true } },
      ],
    })
      .populate("client", "firstName lastName email contactNumber whatsappNumber")
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

    // ── 2. Check Scheduled Live Classes ──────────────────────────────────────
    const upcomingLiveClasses = await LiveClass.find({
      status: "scheduled",
      scheduledStart: { $gte: minLookbehind, $lte: maxLookahead },
      $or: [
        { reminder1hSent: { $ne: true } },
        { reminder15mSent: { $ne: true } },
        { reminder2mSent: { $ne: true } },
      ],
    })
      .populate("client", "firstName lastName email contactNumber whatsappNumber")
      .populate("instructor", "firstName lastName")

    for (const liveClass of upcomingLiveClasses) {
      if (!liveClass.scheduledStart || !liveClass.client) continue
      const diffMinutes = (new Date(liveClass.scheduledStart).getTime() - now.getTime()) / 60000

      // Create booking-like duck object for notification service
      const syntheticBooking = {
        _id: liveClass._id,
        client: liveClass.client,
        practitioner: liveClass.instructor,
        offer: { title: liveClass.title, durationMinutes: Math.round(((liveClass.scheduledEnd - liveClass.scheduledStart) || 3000000) / 60000) },
        scheduledAt: liveClass.scheduledStart,
        meetingLink: `${process.env.FRONTEND_URL || "https://openhand.live"}/live-classroom/${liveClass._id}`,
        reminder1hSent: liveClass.reminder1hSent,
        reminder15mSent: liveClass.reminder15mSent,
        reminder2mSent: liveClass.reminder2mSent,
        save: async () => {
          liveClass.reminder1hSent = syntheticBooking.reminder1hSent
          liveClass.reminder15mSent = syntheticBooking.reminder15mSent
          liveClass.reminder2mSent = syntheticBooking.reminder2mSent
          await liveClass.save()
        },
      }

      if (diffMinutes <= 65 && diffMinutes > 35 && !liveClass.reminder1hSent) {
        await sendSessionReminder1Hour(syntheticBooking)
      }

      if (diffMinutes <= 17 && diffMinutes > 4 && !liveClass.reminder15mSent) {
        await sendSessionReminder15Min(syntheticBooking)
      }

      if (diffMinutes <= 3 && diffMinutes >= -5 && !liveClass.reminder2mSent) {
        await sendSessionReminder2Min(syntheticBooking)
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
