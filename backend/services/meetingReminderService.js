const cron = require("node-cron")
const PractitionerScheduleCall = require("../models/PractitionerScheduleCall")
const mailSender = require("../utils/mailSender")
const { sendWhatsAppMessage } = require("../utils/whatsappSender")
const { callReminder1HourEmail } = require("../mail/templates/callReminder1HourEmail")
const { callReminder5MinEmail } = require("../mail/templates/callReminder5MinEmail")
const { adminCallReminderEmail } = require("../mail/templates/adminCallReminderEmail")

let isReminderRunning = false

function parseSlotToDate(scheduledDate, scheduledTimeSlot) {
  if (!scheduledDate) return new Date()
  try {
    const parts = String(scheduledDate).split("-").map(Number)
    if (parts.length < 3) return new Date(scheduledDate)
    const [year, month, day] = parts

    let hour = 11
    let minute = 0
    const match = String(scheduledTimeSlot || "").match(/(\d{1,2}):(\d{2})\s*(am|pm)?/i)
    if (match) {
      let h = parseInt(match[1], 10)
      const m = parseInt(match[2], 10)
      const meridiem = (match[3] || "").toUpperCase()
      if (meridiem === "PM" && h < 12) h += 12
      if (meridiem === "AM" && h === 12) h = 0
      hour = h
      minute = m
    }

    // IST offset: UTC + 5:30 (330 minutes)
    return new Date(Date.UTC(year, month - 1, day, hour - 5, minute - 30, 0))
  } catch (e) {
    return new Date()
  }
}

/**
 * Scan all scheduled practitioner discovery calls and dispatch 1-hour and 5-minute reminders
 */
async function checkAndSendMeetingReminders() {
  if (isReminderRunning) return
  isReminderRunning = true

  try {
    const now = new Date()
    const activeCalls = await PractitionerScheduleCall.find({
      status: { $in: ["scheduled", "call_link_sent"] },
    })

    const adminEmail = process.env.ADMIN_ALERT_EMAIL || "connect@openhand.live"
    const adminPhone = process.env.ADMIN_WHATSAPP_NUMBER || process.env.ADMIN_PHONE || ""

    for (const call of activeCalls) {
      const scheduledTime = call.scheduledDateTime || parseSlotToDate(call.scheduledDate, call.scheduledTimeSlot)
      const diffMinutes = (new Date(scheduledTime).getTime() - now.getTime()) / 60000

      const hasRealMeetLink = Boolean(
        call.googleMeetLink &&
        !call.googleMeetLink.includes("ohp-") &&
        call.googleMeetLink.startsWith("http")
      )
      const meetLink = hasRealMeetLink ? call.googleMeetLink : ""
      const recipientPhone = call.whatsappNumber || call.practitionerPhone

      // ─── STAGE 1: 1 HOUR BEFORE (Between 35 and 65 mins remaining) ────────
      if (diffMinutes <= 65 && diffMinutes >= 35 && !call.reminder1HourSent) {
        console.log(`[MeetingReminder] ⏰ Dispatching 1-Hour Reminder for Call ${call._id} (${call.practitionerName})`)

        // Email to Practitioner
        try {
          await mailSender(
            call.practitionerEmail,
            `⏰ Reminder: Your 30 Minute Discovery Call is in 1 Hour (${call.scheduledTimeSlot})`,
            callReminder1HourEmail({
              name: call.practitionerName,
              planName: call.planName || "Pro Plan (Yearly)",
              scheduledDate: call.scheduledDate,
              scheduledTimeSlot: call.scheduledTimeSlot,
              timezone: call.timezone,
              googleMeetLink: meetLink,
            })
          )
        } catch (e) {
          console.warn("[MeetingReminder] Practitioner 1h email error:", e.message)
        }

        // WhatsApp to Practitioner
        if (recipientPhone) {
          try {
            const meetWaLine = hasRealMeetLink
              ? `📹 *Google Meet Room Link:* ${meetLink}`
              : `📹 *Google Meet Link:* Your host will share the room link shortly.`

            const waText = `⏰ *StudyNet / OpenHand Reminder: Discovery Call in 1 Hour!*

Dear *${call.practitionerName}*,
Your 30 Minute Discovery Call is scheduled in *1 hour* at *${call.scheduledTimeSlot}* (${call.timezone}) today!

${meetWaLine}

Please be in a quiet space with stable audio/video. We look forward to meeting you!

Warmly,
*StudyNet Team*`
            await sendWhatsAppMessage(recipientPhone, waText)
          } catch (e) {
            console.warn("[MeetingReminder] Practitioner 1h WhatsApp error:", e.message)
          }
        }

        // Email to Admin
        try {
          await mailSender(
            adminEmail,
            `⏰ Admin Alert: Discovery Call in 1 Hour with ${call.practitionerName}`,
            adminCallReminderEmail({
              stage: "1hour",
              practitionerName: call.practitionerName,
              practitionerEmail: call.practitionerEmail,
              practitionerPhone: recipientPhone,
              scheduledDate: call.scheduledDate,
              scheduledTimeSlot: call.scheduledTimeSlot,
              googleMeetLink: meetLink,
              planName: call.planName,
            })
          )
        } catch (e) {
          console.warn("[MeetingReminder] Admin 1h email error:", e.message)
        }

        // WhatsApp to Admin
        if (adminPhone) {
          try {
            const adminWa = hasRealMeetLink
              ? `⏰ *Admin Alert: Discovery Call in 1 Hour!*\nPractitioner: *${call.practitionerName}* (${call.practitionerEmail})\nSlot: *${call.scheduledDate}* at *${call.scheduledTimeSlot}*\nMeet: ${meetLink}`
              : `⚠️ *URGENT ADMIN ALERT: Discovery Call in 1 Hour with ${call.practitionerName}!*\n*NO Google Meet Link Assigned Yet!*\n👉 Visit Admin Panel -> Scheduled Calls, click "+ Create Room", and send the link now.`
            await sendWhatsAppMessage(adminPhone, adminWa)
          } catch (e) {
            // ignore
          }
        }

        call.reminder1HourSent = true
        call.reminder1HourSentAt = new Date()
        await call.save()
      }

      // ─── STAGE 2: 5 MINUTES BEFORE (Between -2 and 10 mins remaining) ──────
      if (diffMinutes <= 10 && diffMinutes >= -2 && !call.reminder5MinSent) {
        console.log(`[MeetingReminder] 🚨 Dispatching 5-Minute Reminder for Call ${call._id} (${call.practitionerName})`)

        // Email to Practitioner
        try {
          await mailSender(
            call.practitionerEmail,
            `🚨 Starting in 5 Minutes: Your 30 Minute Discovery Call!`,
            callReminder5MinEmail({
              name: call.practitionerName,
              planName: call.planName || "Pro Plan (Yearly)",
              scheduledTimeSlot: call.scheduledTimeSlot,
              googleMeetLink: meetLink,
            })
          )
        } catch (e) {
          console.warn("[MeetingReminder] Practitioner 5m email error:", e.message)
        }

        // WhatsApp to Practitioner
        if (recipientPhone) {
          try {
            const meetWaLine = hasRealMeetLink
              ? `👉 *Join Google Meet Now:* ${meetLink}`
              : `👉 *Google Meet:* Room link will be sent shortly by your host. Keep your WhatsApp open!`

            const waText = `🚀 *StudyNet / OpenHand: Discovery Call Starting in 5 Minutes!*

Dear *${call.practitionerName}*,
Your 30 Minute Discovery Call begins in just *5 minutes*!

${meetWaLine}

We are entering the room now. See you inside!`
            await sendWhatsAppMessage(recipientPhone, waText)
          } catch (e) {
            console.warn("[MeetingReminder] Practitioner 5m WhatsApp error:", e.message)
          }
        }

        // Email to Admin
        try {
          await mailSender(
            adminEmail,
            `🚨 Starting in 5 Minutes: Discovery Call with ${call.practitionerName}`,
            adminCallReminderEmail({
              stage: "5min",
              practitionerName: call.practitionerName,
              practitionerEmail: call.practitionerEmail,
              practitionerPhone: recipientPhone,
              scheduledDate: call.scheduledDate,
              scheduledTimeSlot: call.scheduledTimeSlot,
              googleMeetLink: meetLink,
              planName: call.planName,
            })
          )
        } catch (e) {
          console.warn("[MeetingReminder] Admin 5m email error:", e.message)
        }

        // WhatsApp to Admin
        if (adminPhone) {
          try {
            const adminWa = hasRealMeetLink
              ? `🚨 *Admin Alert: Discovery Call in 5 Minutes!*\nPractitioner: *${call.practitionerName}*\nSlot: *${call.scheduledTimeSlot}*\nJoin Meet: ${meetLink}`
              : `🚨 *URGENT ADMIN ALERT: Discovery Call in 5 Minutes with ${call.practitionerName}!*\n*NO Google Meet Link Assigned Yet!*\n👉 Please open Admin Panel -> Scheduled Calls, create a Meet room, and send it immediately!`
            await sendWhatsAppMessage(adminPhone, adminWa)
          } catch (e) {
            // ignore
          }
        }

        call.reminder5MinSent = true
        call.reminder5MinSentAt = new Date()
        await call.save()
      }
    }
  } catch (err) {
    console.error("[MeetingReminder] Scheduler run error:", err.message)
  } finally {
    isReminderRunning = false
  }
}

/**
 * Manually trigger a reminder (1hour, 5min, or instant meet link) for testing / admin action
 */
async function dispatchManualReminder(callId, type = "1hour") {
  const call = await PractitionerScheduleCall.findById(callId)
  if (!call) throw new Error("Call not found")

  const hasRealMeetLink = Boolean(
    call.googleMeetLink &&
    !call.googleMeetLink.includes("ohp-") &&
    call.googleMeetLink.startsWith("http")
  )
  const meetLink = hasRealMeetLink ? call.googleMeetLink : ""
  const recipientPhone = call.whatsappNumber || call.practitionerPhone
  const adminEmail = process.env.ADMIN_ALERT_EMAIL || "connect@openhand.live"

  if (type === "1hour") {
    await mailSender(
      call.practitionerEmail,
      `⏰ Reminder: Your 30 Minute Discovery Call is in 1 Hour (${call.scheduledTimeSlot})`,
      callReminder1HourEmail({
        name: call.practitionerName,
        planName: call.planName,
        scheduledDate: call.scheduledDate,
        scheduledTimeSlot: call.scheduledTimeSlot,
        timezone: call.timezone,
        googleMeetLink: meetLink,
      })
    )
    if (recipientPhone) {
      await sendWhatsAppMessage(
        recipientPhone,
        `⏰ *Discovery Call in 1 Hour Reminder*\nDear ${call.practitionerName},\nYour session is at ${call.scheduledTimeSlot}.\n📹 Link: ${meetLink}`
      )
    }
    call.reminder1HourSent = true
    call.reminder1HourSentAt = new Date()
    await call.save()
    return { success: true, message: "1-Hour Reminder dispatched via Email & WhatsApp!" }
  } else if (type === "5min") {
    await mailSender(
      call.practitionerEmail,
      `🚨 Starting in 5 Minutes: Your 30 Minute Discovery Call!`,
      callReminder5MinEmail({
        name: call.practitionerName,
        planName: call.planName,
        scheduledTimeSlot: call.scheduledTimeSlot,
        googleMeetLink: meetLink,
      })
    )
    if (recipientPhone) {
      await sendWhatsAppMessage(
        recipientPhone,
        `🚀 *Discovery Call Starting in 5 Minutes*\nDear ${call.practitionerName},\nYour session starts now!\n👉 Join: ${meetLink}`
      )
    }
    call.reminder5MinSent = true
    call.reminder5MinSentAt = new Date()
    await call.save()
    return { success: true, message: "5-Minute Reminder dispatched via Email & WhatsApp!" }
  } else if (type === "instant_meet") {
    // Send working Google Meet link email & WhatsApp
    const { practitionerCallLinkEmail } = require("../mail/templates/practitionerCallLinkEmail")
    await mailSender(
      call.practitionerEmail,
      `📹 Working Google Meet Link: Discovery Call (${call.scheduledDate})`,
      practitionerCallLinkEmail({
        name: call.practitionerName,
        planName: call.planName,
        scheduledDate: call.scheduledDate,
        scheduledTimeSlot: call.scheduledTimeSlot,
        timezone: call.timezone,
        googleMeetLink: meetLink,
        adminNotes: call.adminNotes || "Here is your working Google Meet room link. See you inside!",
      })
    )
    if (recipientPhone) {
      await sendWhatsAppMessage(
        recipientPhone,
        `📹 *Your Google Meet Link is Ready*\nDear ${call.practitionerName},\nHere is your meeting room link for your Discovery Call at ${call.scheduledTimeSlot}:\n👉 ${meetLink}`
      )
    }
    call.status = "call_link_sent"
    call.callLinkSentAt = new Date()
    await call.save()
    return { success: true, message: "Working Google Meet link sent to practitioner via Email & WhatsApp!" }
  }

  throw new Error("Invalid reminder type")
}

function startMeetingReminderScheduler() {
  console.log("[MeetingReminder] 🕒 Initializing automated 1-hour and 5-minute meeting reminder scheduler...")
  // Run once immediately
  checkAndSendMeetingReminders().catch((e) => console.warn("Initial reminder check error:", e.message))

  // Run every 60 seconds
  cron.schedule("* * * * *", () => {
    checkAndSendMeetingReminders().catch((e) => console.warn("Meeting reminder cron error:", e.message))
  })
}

module.exports = {
  startMeetingReminderScheduler,
  checkAndSendMeetingReminders,
  dispatchManualReminder,
  parseSlotToDate,
}
