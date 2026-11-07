/**
 * OpenHand Session & Course Notification Email Templates
 * Designed with modern, responsive, high-contrast aesthetics.
 */

const getBrandHeader = (titleBadge = "Official Practice Notification") => `
  <div style="text-align: center; padding-bottom: 24px; border-bottom: 1px solid #F1F5F9;">
    <a href="https://openhand.live" style="text-decoration: none; font-size: 26px; font-weight: 800; color: #0F172A; letter-spacing: -0.5px;">
      Open<span style="color: #2563EB;">Hand</span>
    </a>
    <div style="margin-top: 10px;">
      <span style="background: #EFF6FF; color: #1D4ED8; border: 1px solid #BFDBFE; padding: 4px 14px; border-radius: 20px; font-size: 11.5px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">
        ${titleBadge}
      </span>
    </div>
  </div>
`

const getBrandFooter = () => `
  <div style="margin-top: 36px; padding-top: 24px; border-top: 1px solid #F1F5F9; text-align: center; color: #94A3B8; font-size: 12.5px; line-height: 1.6;">
    <p style="margin: 0 0 6px 0;">OpenHand — The World's Top Holistic &amp; Clinical Health Platform</p>
    <p style="margin: 0 0 12px 0;">Need support or wish to reschedule? Contact us at <a href="mailto:connect@openhand.live" style="color: #2563EB; text-decoration: none;">connect@openhand.live</a></p>
    <p style="margin: 0; font-size: 11.5px; color: #CBD5E1;">© ${new Date().getFullYear()} OpenHand. All rights reserved.</p>
  </div>
`

// ── 1. Purchase / Booking Confirmed ──────────────────────────────────────────
exports.sessionBookingConfirmedEmail = ({
  learnerName = "Learner",
  practitionerName = "Practitioner",
  sessionTitle = "1:1 Consultation",
  scheduledDateStr = "Scheduled",
  durationMinutes = 50,
  meetingLink = "https://openhand.live/dashboard",
  amount = 0,
}) => {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Session Confirmed — OpenHand</title>
</head>
<body style="background-color: #F8FAFC; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 24px; color: #0F172A;">
  <div style="max-width: 600px; margin: 0 auto; background: #FFFFFF; border-radius: 20px; border: 1px solid #E2E8F0; padding: 36px; box-shadow: 0 10px 25px rgba(15, 23, 42, 0.04);">
    ${getBrandHeader("✅ Booking Confirmed")}

    <div style="padding: 24px 0 12px 0;">
      <h2 style="font-size: 22px; font-weight: 800; color: #0F172A; margin: 0 0 12px 0;">
        You're Booked with ${practitionerName}!
      </h2>
      <p style="font-size: 15px; color: #475569; line-height: 1.6; margin: 0 0 24px 0;">
        Hello <strong>${learnerName}</strong>, your direct session has been reserved and confirmed. Below are your session schedule and access coordinates.
      </p>

      <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 16px; padding: 20px; margin-bottom: 24px;">
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <tr>
            <td style="padding: 6px 0; color: #64748B; font-weight: 600;">Practitioner:</td>
            <td style="padding: 6px 0; color: #0F172A; font-weight: 700; text-align: right;">${practitionerName}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748B; font-weight: 600;">Topic / Format:</td>
            <td style="padding: 6px 0; color: #0F172A; font-weight: 700; text-align: right;">${sessionTitle}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748B; font-weight: 600;">Date &amp; Time:</td>
            <td style="padding: 6px 0; color: #2563EB; font-weight: 800; text-align: right;">${scheduledDateStr}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748B; font-weight: 600;">Duration:</td>
            <td style="padding: 6px 0; color: #0F172A; font-weight: 700; text-align: right;">${durationMinutes} Minutes</td>
          </tr>
          ${amount > 0 ? `
          <tr>
            <td style="padding: 6px 0; color: #64748B; font-weight: 600;">Amount Paid:</td>
            <td style="padding: 6px 0; color: #059669; font-weight: 800; text-align: right;">₹${amount.toLocaleString('en-IN')}</td>
          </tr>
          ` : ''}
        </table>
      </div>

      <div style="text-align: center; margin: 28px 0;">
        <a href="${meetingLink}" style="background: linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%); color: #FFFFFF; text-decoration: none; padding: 14px 28px; border-radius: 30px; font-weight: 800; font-size: 15px; display: inline-block; box-shadow: 0 4px 14px rgba(37, 99, 235, 0.3);">
          Access Session Room →
        </a>
      </div>

      <div style="background: #EFF6FF; border: 1px solid #BFDBFE; border-radius: 12px; padding: 14px; font-size: 13px; color: #1E40AF; line-height: 1.5;">
        📱 <strong>Automated Reminders Enabled:</strong> We will notify you via <strong>WhatsApp and Email</strong> at <strong>1 Hour</strong>, <strong>15 Minutes</strong>, and <strong>2 Minutes</strong> prior to session start so you never miss your call.
      </div>
    </div>

    ${getBrandFooter()}
  </div>
</body>
</html>`
}

// ── 2. 1-Hour Reminder ───────────────────────────────────────────────────────
exports.sessionReminder1HourEmail = ({
  learnerName = "Learner",
  practitionerName = "Practitioner",
  sessionTitle = "1:1 Consultation",
  scheduledTimeStr = "in 1 hour",
  meetingLink = "https://openhand.live/dashboard",
}) => {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Session Starting in 1 Hour — OpenHand</title>
</head>
<body style="background-color: #F8FAFC; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 24px; color: #0F172A;">
  <div style="max-width: 600px; margin: 0 auto; background: #FFFFFF; border-radius: 20px; border: 1px solid #E2E8F0; padding: 36px; box-shadow: 0 10px 25px rgba(15, 23, 42, 0.04);">
    ${getBrandHeader("⏰ 1-Hour Countdown")}

    <div style="padding: 24px 0 12px 0;">
      <h2 style="font-size: 22px; font-weight: 800; color: #0F172A; margin: 0 0 12px 0;">
        Your Session Starts in 1 Hour!
      </h2>
      <p style="font-size: 15px; color: #475569; line-height: 1.6; margin: 0 0 20px 0;">
        Hello <strong>${learnerName}</strong>, this is your friendly reminder that your 1-on-1 session with <strong>${practitionerName}</strong> will commence at <strong>${scheduledTimeStr}</strong>.
      </p>

      <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 16px; padding: 18px; margin-bottom: 24px;">
        <p style="margin: 0 0 8px 0; font-size: 14px; color: #64748B;">Topic: <strong style="color: #0F172A;">${sessionTitle}</strong></p>
        <p style="margin: 0; font-size: 14px; color: #64748B;">Practitioner: <strong style="color: #0F172A;">${practitionerName}</strong></p>
      </div>

      <div style="text-align: center; margin: 28px 0;">
        <a href="${meetingLink}" style="background: linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%); color: #FFFFFF; text-decoration: none; padding: 14px 28px; border-radius: 30px; font-weight: 800; font-size: 15px; display: inline-block; box-shadow: 0 4px 14px rgba(37, 99, 235, 0.3);">
          Join Meeting Room →
        </a>
      </div>

      <p style="font-size: 13.5px; color: #64748B; text-align: center; margin: 0;">
        Please find a quiet place and test your audio/camera prior to start time.
      </p>
    </div>

    ${getBrandFooter()}
  </div>
</body>
</html>`
}

// ── 3. 15-Minute Reminder ────────────────────────────────────────────────────
exports.sessionReminder15MinEmail = ({
  learnerName = "Learner",
  practitionerName = "Practitioner",
  sessionTitle = "1:1 Consultation",
  meetingLink = "https://openhand.live/dashboard",
}) => {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Session Starting in 15 Minutes — OpenHand</title>
</head>
<body style="background-color: #F8FAFC; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 24px; color: #0F172A;">
  <div style="max-width: 600px; margin: 0 auto; background: #FFFFFF; border-radius: 20px; border: 1px solid #E2E8F0; padding: 36px; box-shadow: 0 10px 25px rgba(15, 23, 42, 0.04);">
    ${getBrandHeader("🔔 15-Minute Alert")}

    <div style="padding: 24px 0 12px 0;">
      <h2 style="font-size: 22px; font-weight: 800; color: #0F172A; margin: 0 0 12px 0;">
        Your Session Begins in 15 Minutes
      </h2>
      <p style="font-size: 15px; color: #475569; line-height: 1.6; margin: 0 0 24px 0;">
        Hello <strong>${learnerName}</strong>, your practitioner <strong>${practitionerName}</strong> is preparing the session room for <em>${sessionTitle}</em>.
      </p>

      <div style="text-align: center; margin: 28px 0;">
        <a href="${meetingLink}" style="background: linear-gradient(135deg, #10B981 0%, #059669 100%); color: #FFFFFF; text-decoration: none; padding: 15px 32px; border-radius: 30px; font-weight: 800; font-size: 16px; display: inline-block; box-shadow: 0 4px 14px rgba(16, 185, 129, 0.3);">
          Enter Session Room Now →
        </a>
      </div>

      <p style="font-size: 13.5px; color: #64748B; text-align: center; margin: 0;">
        We recommend joining the room 2–3 minutes early to settle in comfortably.
      </p>
    </div>

    ${getBrandFooter()}
  </div>
</body>
</html>`
}

// ── 4. 2-Minute Final Reminder ───────────────────────────────────────────────
exports.sessionReminder2MinEmail = ({
  learnerName = "Learner",
  practitionerName = "Practitioner",
  sessionTitle = "1:1 Consultation",
  meetingLink = "https://openhand.live/dashboard",
}) => {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Starting in 2 Minutes — OpenHand</title>
</head>
<body style="background-color: #F8FAFC; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 24px; color: #0F172A;">
  <div style="max-width: 600px; margin: 0 auto; background: #FFFFFF; border-radius: 20px; border: 2px solid #EF4444; padding: 36px; box-shadow: 0 10px 25px rgba(239, 68, 68, 0.08);">
    ${getBrandHeader("🚀 Starting Right Now")}

    <div style="padding: 24px 0 12px 0; text-align: center;">
      <h2 style="font-size: 24px; font-weight: 800; color: #0F172A; margin: 0 0 12px 0;">
        Your Session is Starting in 2 Minutes!
      </h2>
      <p style="font-size: 15.5px; color: #475569; line-height: 1.6; margin: 0 0 28px 0;">
        Hello <strong>${learnerName}</strong>, <strong>${practitionerName}</strong> is entering the session room right now for <strong>${sessionTitle}</strong>.
      </p>

      <div style="margin: 28px 0;">
        <a href="${meetingLink}" style="background: linear-gradient(135deg, #EF4444 0%, #DC2626 100%); color: #FFFFFF; text-decoration: none; padding: 16px 36px; border-radius: 30px; font-weight: 800; font-size: 16.5px; display: inline-block; box-shadow: 0 6px 20px rgba(239, 68, 68, 0.35);">
          👉 Click to Join Room Instantly
        </a>
      </div>

      <p style="font-size: 13.5px; color: #64748B; margin: 0;">
        Direct link: <a href="${meetingLink}" style="color: #2563EB;">${meetingLink}</a>
      </p>
    </div>

    ${getBrandFooter()}
  </div>
</body>
</html>`
}

// ── 5. New Course Video Uploaded ─────────────────────────────────────────────
exports.courseNewVideoEmail = ({
  learnerName = "Learner",
  practitionerName = "Practitioner",
  courseTitle = "Course",
  videoTitle = "New Lecture",
  videoDuration = "15 mins",
  videoDescription = "",
  courseUrl = "https://openhand.live/dashboard/enrolled-courses",
}) => {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>New Video Lecture Added — ${courseTitle}</title>
</head>
<body style="background-color: #F8FAFC; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 24px; color: #0F172A;">
  <div style="max-width: 600px; margin: 0 auto; background: #FFFFFF; border-radius: 20px; border: 1px solid #E2E8F0; padding: 36px; box-shadow: 0 10px 25px rgba(15, 23, 42, 0.04);">
    ${getBrandHeader("🎬 New Video Lecture")}

    <div style="padding: 24px 0 12px 0;">
      <h2 style="font-size: 22px; font-weight: 800; color: #0F172A; margin: 0 0 10px 0;">
        New Lecture Added to ${courseTitle}
      </h2>
      <p style="font-size: 15px; color: #475569; line-height: 1.6; margin: 0 0 24px 0;">
        Hello <strong>${learnerName}</strong>, your instructor <strong>${practitionerName}</strong> has just uploaded a brand new video lesson to your curriculum!
      </p>

      <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 16px; padding: 22px; margin-bottom: 24px;">
        <div style="display: inline-block; background: #EFF6FF; color: #1D4ED8; font-size: 11.5px; font-weight: 700; padding: 3px 10px; border-radius: 6px; margin-bottom: 8px;">
          ⏱️ Duration: ${videoDuration}
        </div>
        <h3 style="font-size: 17px; font-weight: 800; color: #0F172A; margin: 0 0 8px 0;">
          ${videoTitle}
        </h3>
        ${videoDescription ? `
          <p style="font-size: 14px; color: #64748B; margin: 0; line-height: 1.55;">
            ${videoDescription}
          </p>
        ` : ''}
      </div>

      <div style="text-align: center; margin: 28px 0;">
        <a href="${courseUrl}" style="background: linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%); color: #FFFFFF; text-decoration: none; padding: 14px 28px; border-radius: 30px; font-weight: 800; font-size: 15px; display: inline-block; box-shadow: 0 4px 14px rgba(37, 99, 235, 0.3);">
          Stream New Lecture Now →
        </a>
      </div>

      <p style="font-size: 13.5px; color: #64748B; text-align: center; margin: 0;">
        Keep up the continuous growth on OpenHand!
      </p>
    </div>

    ${getBrandFooter()}
  </div>
</body>
</html>`
}
