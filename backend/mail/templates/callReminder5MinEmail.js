exports.callReminder5MinEmail = ({
  name,
  planName = "Pro Plan (Yearly)",
  scheduledTimeSlot,
  googleMeetLink,
}) => {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Starting in 5 Minutes: Your Discovery Call!</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F8FAFC; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #F8FAFC; padding: 32px 16px;">
        <tr>
            <td align="center">
                <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; background-color: #ffffff; border: 1px solid #E2E8F0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);">
                    <tr>
                        <td height="5" style="background: linear-gradient(100deg, #10B981 0%, #2563EB 100%);">&nbsp;</td>
                    </tr>
                    <tr>
                        <td style="padding: 32px 32px 20px; text-align: center; border-bottom: 1px solid #F1F5F9;">
                            <div style="display: inline-block; background-color: #ECFDF5; color: #059669; font-size: 11px; font-weight: 800; padding: 4px 14px; border-radius: 9999px; text-transform: uppercase; letter-spacing: 0.08em; border: 1px solid #A7F3D0;">
                                🚀 STARTING IN 5 MINUTES
                            </div>
                            <h1 style="font-size: 22px; font-weight: 800; color: #0F172A; margin: 14px 0 6px;">
                                Your Discovery Call Starts in 5 Minutes!
                            </h1>
                            <p style="font-size: 14px; color: #64748B; margin: 0;">
                                Time: ${scheduledTimeSlot}
                            </p>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 28px 32px; text-align: center;">
                            <p style="font-size: 15px; color: #1E293B; margin: 0 0 16px; line-height: 1.6;">
                                Hi <strong>${name}</strong>, our team is ready to join you for your 30-minute discovery call!
                            </p>

                            <!-- Big Join Button or Notice -->
                            ${googleMeetLink ? `
                            <div style="margin: 24px 0;">
                                <a href="${googleMeetLink}" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%); color: #ffffff !important; font-weight: 800; font-size: 16px; text-decoration: none; padding: 15px 36px; border-radius: 12px; box-shadow: 0 6px 18px rgba(37, 99, 235, 0.35);">
                                    👉 Join Google Meet Now &rarr;
                                </a>
                            </div>

                            <div style="font-size: 13px; color: #64748B; word-break: break-all; margin-top: 14px;">
                                Direct Link: <a href="${googleMeetLink}" target="_blank" style="color: #2563EB; font-weight: 600;">${googleMeetLink}</a>
                            </div>
                            ` : `
                            <div style="background-color: #EFF6FF; border: 1px solid #BFDBFE; border-radius: 12px; padding: 18px 22px; margin: 20px 0; text-align: center;">
                                <div style="font-size: 13px; font-weight: 800; color: #1E40AF; text-transform: uppercase; margin-bottom: 6px;">
                                    📹 Meeting Room Ready Shortly
                                </div>
                                <p style="font-size: 13.5px; color: #1E3A8A; margin: 0; line-height: 1.5;">
                                    Your host will share the direct Google Meet room link to your WhatsApp and Email in just a moment. Please keep this tab or your WhatsApp open!
                                </p>
                            </div>
                            `}
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 18px 32px; background-color: #F8FAFC; border-top: 1px solid #F1F5F9; text-align: center; font-size: 12px; color: #94A3B8;">
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
