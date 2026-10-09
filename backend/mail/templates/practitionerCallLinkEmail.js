exports.practitionerCallLinkEmail = ({
  name,
  planName = "Pro Plan (Yearly)",
  scheduledDate,
  scheduledTimeSlot,
  timezone = "Asia/Kolkata (IST)",
  googleMeetLink,
  adminNotes = "",
}) => {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your Onboarding Google Meet Link</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F8FAFC; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #F8FAFC; padding: 32px 16px;">
        <tr>
            <td align="center">
                <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 620px; background-color: #ffffff; border: 1px solid #E2E8F0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);">
                    
                    <!-- Top Gradient Line -->
                    <tr>
                        <td height="5" style="background: linear-gradient(100deg, #2563EB 0%, #7C3AED 100%); font-size: 0; line-height: 0;">&nbsp;</td>
                    </tr>

                    <!-- Header -->
                    <tr>
                        <td style="padding: 32px 32px 24px; text-align: center; border-bottom: 1px solid #F1F5F9;">
                            <a href="https://openhand.live" style="font-size: 26px; font-weight: 900; color: #0F172A; text-decoration: none; letter-spacing: -0.5px;">
                                OpenHand
                            </a>
                            <div style="margin-top: 10px;">
                                <span style="display: inline-block; background-color: #EFF6FF; color: #2563EB; font-size: 11px; font-weight: 800; padding: 4px 14px; border-radius: 9999px; text-transform: uppercase; letter-spacing: 0.08em; border: 1px solid #BFDBFE;">
                                    Google Meet Session Invitation
                                </span>
                            </div>
                            <h1 style="font-size: 22px; font-weight: 800; color: #0F172A; margin: 14px 0 6px; letter-spacing: -0.02em;">
                                Here Is Your Onboarding Call Link
                            </h1>
                            <p style="font-size: 14px; color: #64748B; margin: 0; font-weight: 500;">
                                We're excited to meet you and guide your practice growth!
                            </p>
                        </td>
                    </tr>

                    <!-- Body -->
                    <tr>
                        <td style="padding: 28px 32px;">
                            <p style="font-size: 15px; color: #1E293B; margin: 0 0 14px; line-height: 1.6;">
                                Dear <strong>${name}</strong>,
                            </p>
                            <p style="font-size: 15px; color: #475569; margin: 0 0 24px; line-height: 1.6;">
                                Our OpenHand Onboarding Team has confirmed your session for <strong>${planName}</strong>. Below is your dedicated Google Meet room link:
                            </p>

                            <!-- Primary Call Link Box -->
                            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #EEF2FF; border: 1px solid #C7D2FE; border-radius: 12px; margin: 0 0 24px; text-align: center;">
                                <tr>
                                    <td style="padding: 22px 24px;">
                                        <div style="font-size: 13px; font-weight: 800; color: #3730A3; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 10px;">
                                            📹 Dedicated Google Meet Room Link
                                        </div>
                                        <div style="margin: 10px 0;">
                                            <a href="${googleMeetLink}" target="_blank" style="display: inline-block; background-color: #1A73E8; color: #ffffff !important; font-weight: 800; font-size: 15px; text-decoration: none; padding: 13px 32px; border-radius: 10px; box-shadow: 0 4px 14px rgba(26, 115, 232, 0.35);">
                                                Join Google Meet Room &rarr;
                                            </a>
                                        </div>
                                        <div style="font-size: 12.5px; color: #6366F1; word-break: break-all; margin-top: 8px;">
                                            Direct URL: <a href="${googleMeetLink}" target="_blank" style="color: #2563EB; text-decoration: underline;">${googleMeetLink}</a>
                                        </div>
                                    </td>
                                </tr>
                            </table>

                            <!-- Schedule Details Table (Bulletproof 2 Columns) -->
                            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; margin: 0 0 24px; overflow: hidden;">
                                <tr>
                                    <td width="42%" style="padding: 13px 18px; border-bottom: 1px solid #E2E8F0; font-size: 13.5px; color: #64748B; font-weight: 600; text-align: left;">
                                        Scheduled Date
                                    </td>
                                    <td width="58%" style="padding: 13px 18px; border-bottom: 1px solid #E2E8F0; font-size: 14px; color: #0F172A; font-weight: 700; text-align: right;">
                                        ${scheduledDate}
                                    </td>
                                </tr>
                                <tr>
                                    <td width="42%" style="padding: 13px 18px; border-bottom: 1px solid #E2E8F0; font-size: 13.5px; color: #64748B; font-weight: 600; text-align: left;">
                                        Time Slot
                                    </td>
                                    <td width="58%" style="padding: 13px 18px; border-bottom: 1px solid #E2E8F0; font-size: 14px; color: #0F172A; font-weight: 700; text-align: right;">
                                        ${scheduledTimeSlot}
                                    </td>
                                </tr>
                                <tr>
                                    <td width="42%" style="padding: 13px 18px; border-bottom: 1px solid #E2E8F0; font-size: 13.5px; color: #64748B; font-weight: 600; text-align: left;">
                                        Timezone
                                    </td>
                                    <td width="58%" style="padding: 13px 18px; border-bottom: 1px solid #E2E8F0; font-size: 14px; color: #0F172A; font-weight: 700; text-align: right;">
                                        ${timezone}
                                    </td>
                                </tr>
                                <tr>
                                    <td width="42%" style="padding: 13px 18px; font-size: 13.5px; color: #64748B; font-weight: 600; text-align: left;">
                                        Platform
                                    </td>
                                    <td width="58%" style="padding: 13px 18px; font-size: 14px; color: #2563EB; font-weight: 700; text-align: right;">
                                        Google Meet (HD Video)
                                    </td>
                                </tr>
                            </table>

                            ${adminNotes ? `
                            <div style="background-color: #FEF3C7; border: 1px solid #FDE68A; border-radius: 10px; padding: 14px 18px; margin: 0 0 20px; color: #92400E; font-size: 13px; line-height: 1.5;">
                                <strong>Notes from our team:</strong><br />
                                ${adminNotes}
                            </div>
                            ` : ''}

                            <!-- Preparation Checklist -->
                            <div style="background-color: #F8FAFC; border-left: 4px solid #2563EB; padding: 14px 18px; margin: 0 0 24px; border-radius: 0 8px 8px 0;">
                                <div style="font-size: 13px; font-weight: 800; color: #0F172A; margin-bottom: 6px;">
                                    How to prepare:
                                </div>
                                <div style="font-size: 12.5px; color: #475569; line-height: 1.6;">
                                    &bull; Have your current practice details, modalities, and service pricing handy.<br />
                                    &bull; Note down any questions regarding client discovery or cohort programs.<br />
                                    &bull; Test your microphone and camera a couple of minutes prior to joining.
                                </div>
                            </div>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="padding: 20px 32px; background-color: #F8FAFC; border-top: 1px solid #F1F5F9; text-align: center; font-size: 12px; color: #94A3B8; line-height: 1.5;">
                            Need assistance or want to reschedule? Email our team at <a href="mailto:connect@openhand.live" style="color: #2563EB; text-decoration: none; font-weight: 600;">connect@openhand.live</a>.<br />
                            &copy; ${new Date().getFullYear()} OpenHand. All rights reserved.
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`
}
