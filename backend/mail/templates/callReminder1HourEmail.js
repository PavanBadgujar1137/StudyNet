exports.callReminder1HourEmail = ({
  name,
  planName = "Pro Plan (Yearly)",
  scheduledDate,
  scheduledTimeSlot,
  timezone = "Asia/Kolkata (IST)",
  googleMeetLink,
}) => {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reminder: Your Discovery Call is in 1 Hour</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F8FAFC; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #F8FAFC; padding: 32px 16px;">
        <tr>
            <td align="center">
                <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; background-color: #ffffff; border: 1px solid #E2E8F0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);">
                    <tr>
                        <td height="5" style="background: linear-gradient(100deg, #2563EB 0%, #7C3AED 100%);">&nbsp;</td>
                    </tr>
                    <tr>
                        <td style="padding: 32px 32px 20px; text-align: center; border-bottom: 1px solid #F1F5F9;">
                            <div style="display: inline-block; background-color: #EFF6FF; color: #2563EB; font-size: 11px; font-weight: 800; padding: 4px 14px; border-radius: 9999px; text-transform: uppercase; letter-spacing: 0.08em; border: 1px solid #BFDBFE;">
                                ⏰ 1 HOUR COUNTDOWN
                            </div>
                            <h1 style="font-size: 22px; font-weight: 800; color: #0F172A; margin: 14px 0 6px;">
                                Your 30 Minute Discovery Call is in 1 Hour!
                            </h1>
                            <p style="font-size: 14px; color: #64748B; margin: 0;">
                                Scheduled for today: ${scheduledTimeSlot} (${timezone})
                            </p>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 28px 32px;">
                            <p style="font-size: 15px; color: #1E293B; margin: 0 0 16px; line-height: 1.6;">
                                Hi <strong>${name}</strong>,
                            </p>
                            <p style="font-size: 15px; color: #475569; margin: 0 0 20px; line-height: 1.6;">
                                This is a friendly reminder that your 30 Minute Discovery Call for your <strong>${planName}</strong> is starting in approximately <strong>1 hour</strong>.
                            </p>

                            <!-- Meet Link Box -->
                            ${googleMeetLink ? `
                            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #EEF2FF; border: 1px solid #C7D2FE; border-radius: 12px; margin: 0 0 24px; text-align: center;">
                                <tr>
                                    <td style="padding: 20px 24px;">
                                        <div style="font-size: 13px; font-weight: 800; color: #3730A3; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px;">
                                            📹 Your Google Meet Room
                                        </div>
                                        <div style="margin: 12px 0;">
                                            <a href="${googleMeetLink}" target="_blank" style="display: inline-block; background-color: #2563EB; color: #ffffff !important; font-weight: 700; font-size: 14px; text-decoration: none; padding: 12px 28px; border-radius: 10px; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);">
                                                Open Google Meet Room &rarr;
                                            </a>
                                        </div>
                                        <div style="font-size: 12px; color: #6366F1; word-break: break-all;">
                                            Direct Link: <a href="${googleMeetLink}" target="_blank" style="color: #2563EB;">${googleMeetLink}</a>
                                        </div>
                                    </td>
                                </tr>
                            </table>
                            ` : `
                            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #EFF6FF; border: 1px solid #BFDBFE; border-radius: 12px; margin: 0 0 24px; text-align: center;">
                                <tr>
                                    <td style="padding: 18px 22px;">
                                        <div style="font-size: 13px; font-weight: 800; color: #1E40AF; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 6px;">
                                            📹 Google Meet Conference Room
                                        </div>
                                        <p style="font-size: 13.5px; color: #1E3A8A; margin: 0; line-height: 1.5;">
                                            Your host is finalizing the conference room. Your dedicated Google Meet link will be delivered directly to your WhatsApp and Email prior to the call.
                                        </p>
                                    </td>
                                </tr>
                            </table>
                            `}

                            <div style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 10px; padding: 14px 18px; margin-bottom: 20px; font-size: 13px; color: #475569; line-height: 1.6;">
                                <strong>Quick Prep Tips:</strong><br />
                                • Find a quiet room with good lighting and stable internet.<br />
                                • We will review your courses/workshops roadmap, community growth, and platform migration.<br />
                                • We will send you another quick ping 5 minutes before the session!
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 18px 32px; background-color: #F8FAFC; border-top: 1px solid #F1F5F9; text-align: center; font-size: 12px; color: #94A3B8;">
                            Need help? Reply to this email or reach us at <a href="mailto:connect@openhand.live" style="color: #2563EB;">connect@openhand.live</a>.<br />
                            &copy; ${new Date().getFullYear()} StudyNet / OpenHand. All rights reserved.
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`
}
