const Booking = require("../models/Booking")
const LiveClass = require("../models/LiveClass")
const User = require("../models/User")
const Course = require("../models/Course")
const CourseVideo = require("../models/CourseVideo")
const ClientConnection = require("../models/ClientConnection")
const mailSender = require("../utils/mailSender")
const { sendWhatsAppMessage } = require("../utils/whatsappSender")
const {
  sessionBookingConfirmedEmail,
  sessionReminder1HourEmail,
  sessionReminder15MinEmail,
  sessionReminder2MinEmail,
  courseNewVideoEmail,
} = require("../mail/templates/sessionNotifications")

const FRONTEND_URL = process.env.FRONTEND_URL || "https://openhand.live"

function formatDateTimeIST(date) {
  if (!date) return "Scheduled Soon"
  const d = new Date(date)
  if (isNaN(d.getTime())) return "Scheduled Soon"
  return d.toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    weekday: "long",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }) + " (IST)"
}

function formatDurationText(seconds) {
  if (!seconds || seconds <= 0) return "15 mins"
  const mins = Math.round(seconds / 60)
  if (mins < 60) return `${mins} mins`
  const hrs = Math.floor(mins / 60)
  const remMins = mins % 60
  return remMins > 0 ? `${hrs}h ${remMins}m` : `${hrs} hrs`
}

/**
 * Resolve phone number for a user with fallback chains
 */
function resolveUserPhone(user, booking = null) {
  if (booking?.clientPhone && booking.clientPhone.trim()) {
    return booking.clientPhone.trim()
  }
  if (user?.whatsappNumber && user.whatsappNumber.trim()) {
    return user.whatsappNumber.trim()
  }
  if (user?.contactNumber && user.contactNumber.trim()) {
    return user.contactNumber.trim()
  }
  if (user?.additionalDetails?.contactNumber && user.additionalDetails.contactNumber.trim()) {
    return user.additionalDetails.contactNumber.trim()
  }
  return null
}

// ─── 1. PURCHASE / BOOKING CONFIRMATION NOTIFICATION ──────────────────────────
async function sendSessionPurchaseNotification(bookingIdOrDoc) {
  try {
    let booking = bookingIdOrDoc
    if (typeof booking === "string" || !booking.client?.email) {
      booking = await Booking.findById(booking._id || booking)
        .populate("client", "firstName lastName email contactNumber whatsappNumber additionalDetails")
        .populate("practitioner", "firstName lastName email credentials")
        .populate("offer", "title type price durationMinutes")
    }

    if (!booking || !booking.client) {
      console.warn("[NotificationService] Booking or client not found for purchase notification")
      return
    }

    const client = booking.client
    const practitioner = booking.practitioner || {}
    const offer = booking.offer || {}

    const clientName = `${client.firstName || "Valued"} ${client.lastName || "Learner"}`.trim()
    const practitionerName = `Dr. ${practitioner.firstName || ""} ${practitioner.lastName || ""}`.trim() || "Your Verified Practitioner"
    const sessionTitle = offer.title || "1:1 Personalized Consultation"
    const durationMinutes = offer.durationMinutes || 50
    const scheduledDateStr = formatDateTimeIST(booking.scheduledAt)

    const meetingLink =
      booking.meetingLink ||
      `${FRONTEND_URL}/live-classroom/${booking._id}?role=learner`

    // Ensure meetingLink is saved on booking
    if (!booking.meetingLink) {
      booking.meetingLink = meetingLink
    }

    const phone = resolveUserPhone(client, booking)

    // A. WhatsApp Message
    const whatsappText = `🌿 *OpenHand — 1:1 Session Confirmed!*

Dear *${clientName}*,
Your session with *${practitionerName}* has been reserved successfully!

📋 *Session Information:*
• *Topic:* ${sessionTitle}
• *Scheduled Time:* ${scheduledDateStr}
• *Duration:* ${durationMinutes} Minutes
• *Room Access Link:* ${meetingLink}

💡 *What to expect:*
• Please ensure you are in a quiet room with good internet.
• We will send you reminder notifications on WhatsApp and Email:
  ⏰ *1 Hour* before start
  🔔 *15 Minutes* before start
  🚀 *2 Minutes* before start

Need to reschedule or update your notes? Visit your dashboard:
🔗 ${FRONTEND_URL}/dashboard

Warmly,
*OpenHand Care Team*`

    // B. Send WhatsApp
    if (phone) {
      await sendWhatsAppMessage(phone, whatsappText)
    } else {
      console.log(`[NotificationService] No phone number available for client ${client.email}`)
    }

    // C. Send Email
    if (client.email) {
      const emailHtml = sessionBookingConfirmedEmail({
        learnerName: clientName,
        practitionerName,
        sessionTitle,
        scheduledDateStr,
        durationMinutes,
        meetingLink,
        amount: booking.amount || 0,
      })
      await mailSender(
        client.email,
        `Booking Confirmed: ${sessionTitle} with ${practitionerName}`,
        emailHtml
      )
    }

    // Mark as sent
    booking.reminderPurchaseSent = true
    await booking.save()
    console.log(`[NotificationService] ✅ Purchase notifications dispatched for booking ${booking._id}`)
  } catch (err) {
    console.error("[NotificationService] Error sending purchase notification:", err.message)
  }
}

// ─── 2. NOTIFICATION BEFORE 1 HOUR ───────────────────────────────────────────
async function sendSessionReminder1Hour(bookingIdOrDoc) {
  try {
    let booking = bookingIdOrDoc
    if (typeof booking === "string" || !booking.client?.email) {
      booking = await Booking.findById(booking._id || booking)
        .populate("client", "firstName lastName email contactNumber whatsappNumber")
        .populate("practitioner", "firstName lastName")
        .populate("offer", "title durationMinutes")
    }

    if (!booking || !booking.client || booking.reminder1hSent) return

    const client = booking.client
    const practitioner = booking.practitioner || {}
    const offer = booking.offer || {}

    const clientName = `${client.firstName || ""} ${client.lastName || ""}`.trim() || "Learner"
    const practitionerName = `${practitioner.firstName || ""} ${practitioner.lastName || ""}`.trim() || "Practitioner"
    const sessionTitle = offer.title || "1:1 Session"
    const scheduledTimeStr = formatDateTimeIST(booking.scheduledAt)
    const meetingLink = booking.meetingLink || `${FRONTEND_URL}/live-classroom/${booking._id}`
    const phone = resolveUserPhone(client, booking)

    // WhatsApp Message
    const whatsappText = `⏰ *OpenHand — 1 Hour Session Reminder*

Dear *${clientName}*,
Your session with *${practitionerName}* starts in *1 hour*!

🗓️ *Scheduled Time:* ${scheduledTimeStr}
📌 *Topic:* ${sessionTitle}
🔗 *Join Meeting Room:*
${meetingLink}

Please take a few moments to test your camera and microphone.

See you inside,
*OpenHand Care Team*`

    if (phone) {
      await sendWhatsAppMessage(phone, whatsappText)
    }

    if (client.email) {
      const emailHtml = sessionReminder1HourEmail({
        learnerName: clientName,
        practitionerName,
        sessionTitle,
        scheduledTimeStr,
        meetingLink,
      })
      await mailSender(
        client.email,
        `⏰ 1 Hour Reminder: Your session with ${practitionerName} starts soon`,
        emailHtml
      )
    }

    booking.reminder1hSent = true
    await booking.save()
    console.log(`[NotificationService] ✅ 1-Hour reminder sent for booking ${booking._id}`)
  } catch (err) {
    console.error("[NotificationService] Error sending 1h reminder:", err.message)
  }
}

// ─── 3. NOTIFICATION BEFORE 15 MINUTES ───────────────────────────────────────
async function sendSessionReminder15Min(bookingIdOrDoc) {
  try {
    let booking = bookingIdOrDoc
    if (typeof booking === "string" || !booking.client?.email) {
      booking = await Booking.findById(booking._id || booking)
        .populate("client", "firstName lastName email contactNumber whatsappNumber")
        .populate("practitioner", "firstName lastName")
        .populate("offer", "title durationMinutes")
    }

    if (!booking || !booking.client || booking.reminder15mSent) return

    const client = booking.client
    const practitioner = booking.practitioner || {}
    const offer = booking.offer || {}

    const clientName = `${client.firstName || ""} ${client.lastName || ""}`.trim() || "Learner"
    const practitionerName = `${practitioner.firstName || ""} ${practitioner.lastName || ""}`.trim() || "Practitioner"
    const sessionTitle = offer.title || "1:1 Session"
    const meetingLink = booking.meetingLink || `${FRONTEND_URL}/live-classroom/${booking._id}`
    const phone = resolveUserPhone(client, booking)

    // WhatsApp Message
    const whatsappText = `🔔 *OpenHand — 15 Minutes Until Your Session!*

Dear *${clientName}*,
Your session with *${practitionerName}* begins in just *15 minutes*.

🚀 *Join Room Here:*
${meetingLink}

Please join 2–3 minutes early so you are settled in comfortably.

See you shortly,
*OpenHand Care Team*`

    if (phone) {
      await sendWhatsAppMessage(phone, whatsappText)
    }

    if (client.email) {
      const emailHtml = sessionReminder15MinEmail({
        learnerName: clientName,
        practitionerName,
        sessionTitle,
        meetingLink,
      })
      await mailSender(
        client.email,
        `🔔 15 Min Reminder: Your session with ${practitionerName} is starting`,
        emailHtml
      )
    }

    booking.reminder15mSent = true
    await booking.save()
    console.log(`[NotificationService] ✅ 15-Minute reminder sent for booking ${booking._id}`)
  } catch (err) {
    console.error("[NotificationService] Error sending 15m reminder:", err.message)
  }
}

// ─── 4. NOTIFICATION BEFORE 2 MINUTES ────────────────────────────────────────
async function sendSessionReminder2Min(bookingIdOrDoc) {
  try {
    let booking = bookingIdOrDoc
    if (typeof booking === "string" || !booking.client?.email) {
      booking = await Booking.findById(booking._id || booking)
        .populate("client", "firstName lastName email contactNumber whatsappNumber")
        .populate("practitioner", "firstName lastName")
        .populate("offer", "title durationMinutes")
    }

    if (!booking || !booking.client || booking.reminder2mSent) return

    const client = booking.client
    const practitioner = booking.practitioner || {}
    const offer = booking.offer || {}

    const clientName = `${client.firstName || ""} ${client.lastName || ""}`.trim() || "Learner"
    const practitionerName = `${practitioner.firstName || ""} ${practitioner.lastName || ""}`.trim() || "Practitioner"
    const sessionTitle = offer.title || "1:1 Session"
    const meetingLink = booking.meetingLink || `${FRONTEND_URL}/live-classroom/${booking._id}`
    const phone = resolveUserPhone(client, booking)

    // WhatsApp Message
    const whatsappText = `🚀 *OpenHand — Session Starting in 2 Minutes!*

Dear *${clientName}*,
Your practitioner *${practitionerName}* is entering the room right now for *${sessionTitle}*!

👉 *Click to join the room instantly:*
${meetingLink}

Wishing you a transformative session!
*OpenHand Care Team*`

    if (phone) {
      await sendWhatsAppMessage(phone, whatsappText)
    }

    if (client.email) {
      const emailHtml = sessionReminder2MinEmail({
        learnerName: clientName,
        practitionerName,
        sessionTitle,
        meetingLink,
      })
      await mailSender(
        client.email,
        `🚀 Starting in 2 Minutes: Join your session with ${practitionerName}`,
        emailHtml
      )
    }

    booking.reminder2mSent = true
    await booking.save()
    console.log(`[NotificationService] ✅ 2-Minute reminder sent for booking ${booking._id}`)
  } catch (err) {
    console.error("[NotificationService] Error sending 2m reminder:", err.message)
  }
}

// ─── 5. NEW COURSE VIDEO UPLOADED NOTIFICATION ──────────────────────────────
async function sendCourseNewVideoNotification({
  courseId,
  videoId,
  videoTitle = "",
  videoDescription = "",
  durationSeconds = 0,
}) {
  try {
    const course = await Course.findById(courseId).populate("practitioner", "firstName lastName")
    if (!course) return

    let video = null
    if (videoId) {
      video = await CourseVideo.findById(videoId)
    }

    const effectiveTitle = videoTitle || video?.title || "New Video Lecture"
    const effectiveDescription = videoDescription || video?.description || ""
    const effectiveDuration = formatDurationText(durationSeconds || video?.durationSeconds || 0)

    const practitionerName = course.practitioner
      ? `${course.practitioner.firstName || ""} ${course.practitioner.lastName || ""}`.trim()
      : "Your Instructor"

    // Find all learners enrolled or associated
    const enrolledIds = (course.enrolledClients || []).map((id) => String(id))

    const usersWithCourse = await User.find({
      courses: courseId,
      isDeleted: { $ne: true },
      accountType: { $in: ["Learner", "Client", "Student"] },
    })
      .select("_id email firstName lastName contactNumber whatsappNumber")
      .lean()

    const activeConnections = await ClientConnection.find({
      practitioner: course.practitioner?._id || course.practitioner,
      status: { $in: ["approved", "active"] },
    })
      .select("client")
      .lean()

    const connectedIds = activeConnections.map((c) => String(c.client)).filter(Boolean)
    const allLearnerIds = Array.from(new Set([...enrolledIds, ...connectedIds]))

    const additionalLearners =
      allLearnerIds.length > 0
        ? await User.find({
            _id: { $in: allLearnerIds },
            isDeleted: { $ne: true },
            accountType: { $in: ["Learner", "Client", "Student"] },
          })
            .select("_id email firstName lastName contactNumber whatsappNumber")
            .lean()
        : []

    // Deduplicate unique learners by email or ID
    const learnerMap = new Map()
    usersWithCourse.forEach((u) => {
      if (u.email) learnerMap.set(u.email.toLowerCase(), u)
    })
    additionalLearners.forEach((u) => {
      if (u.email) learnerMap.set(u.email.toLowerCase(), u)
    })

    const learners = Array.from(learnerMap.values())
    if (learners.length === 0) {
      console.log(`[NotificationService] No enrolled learners found to notify for course "${course.title}"`)
      return
    }

    console.log(
      `[NotificationService] 🎬 Notifying ${learners.length} learner(s) about new video "${effectiveTitle}" in course "${course.title}"`
    )

    const courseWatchUrl = `${FRONTEND_URL}/dashboard/enrolled-courses`

    // Dispatch WhatsApp and Email to all unique learners
    const dispatchPromises = learners.map(async (learner) => {
      const learnerName = `${learner.firstName || ""} ${learner.lastName || ""}`.trim() || "Learner"
      const phone = resolveUserPhone(learner)

      // A. WhatsApp Message
      const whatsappText = `🎬 *OpenHand — New Video Lecture Added!*

Dear *${learnerName}*,
*${practitionerName}* has just published a brand new lesson to your course:
📚 *${course.title}*

✨ *Lecture:* "${effectiveTitle}"
⏱️ *Duration:* ${effectiveDuration}
${effectiveDescription ? `📝 *Overview:* ${effectiveDescription}\n` : ""}
Watch this lesson now from your learning dashboard:
🔗 ${courseWatchUrl}

Happy learning,
*OpenHand Education Team*`

      // Fire WhatsApp
      if (phone) {
        try {
          await sendWhatsAppMessage(phone, whatsappText)
        } catch (waErr) {
          console.warn(`[NotificationService] WhatsApp failed for ${phone}:`, waErr.message)
        }
      }

      // B. Fire Email
      if (learner.email) {
        try {
          const emailHtml = courseNewVideoEmail({
            learnerName,
            practitionerName,
            courseTitle: course.title,
            videoTitle: effectiveTitle,
            videoDuration: effectiveDuration,
            videoDescription: effectiveDescription,
            courseUrl: courseWatchUrl,
          })
          await mailSender(
            learner.email,
            `🎬 New Lecture: "${effectiveTitle}" in ${course.title}`,
            emailHtml
          )
        } catch (mailErr) {
          console.warn(`[NotificationService] Email failed for ${learner.email}:`, mailErr.message)
        }
      }
    })

    await Promise.allSettled(dispatchPromises)
    console.log(`[NotificationService] ✅ Finished dispatching course video notifications for "${effectiveTitle}"`)
  } catch (err) {
    console.error("[NotificationService] Error notifying course video upload:", err.message)
  }
}

module.exports = {
  sendSessionPurchaseNotification,
  sendSessionReminder1Hour,
  sendSessionReminder15Min,
  sendSessionReminder2Min,
  sendCourseNewVideoNotification,
}
