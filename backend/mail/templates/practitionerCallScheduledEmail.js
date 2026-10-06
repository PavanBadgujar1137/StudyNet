exports.practitionerCallScheduledEmail = ({
  name,
  planName = "Pro Plan (Yearly)",
  amountPaid = 9588,
  scheduledDate,
  scheduledTimeSlot,
  timezone = "Asia/Kolkata (IST)",
  googleCalendarUrl = "",
  googleMeetLink = "",
  orderId = "",
  paymentId = "",
}) => {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Practitioner Onboarding Call & Subscription Confirmed</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F8FAFC; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #F8FAFC; padding: 32px 16px;">
        <tr>
            <td align="center">
                <!-- Main Email Card -->
                <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 620px; background-color: #ffffff; border: 1px solid #E2E8F0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);">
                    
                    <!-- Top Gradient Accent Line -->
                    <tr>
                        <td height="5" style="background: linear-gradient(100deg, #2563EB 0%, #7C3AED 100%); font-size: 0; line-height: 0;">&nbsp;</td>
                    </tr>

                    <!-- Header Content -->
                    <tr>
                        <td style="padding: 32px 32px 24px; text-align: center; border-bottom: 1px solid #F1F5F9;">
                            <a href="https://openhand.live" style="font-size: 26px; font-weight: 900; color: #0F172A; text-decoration: none; letter-spacing: -0.5px;">
                                OpenHand
                            </a>
                            <div style="margin-top: 10px;">
                                <span style="display: inline-block; background-color: #EFF6FF; color: #2563EB; font-size: 11px; font-weight: 800; padding: 4px 14px; border-radius: 9999px; text-transform: uppercase; letter-spacing: 0.08em; border: 1px solid #BFDBFE;">
                                    Practitioner Yearly Onboarding
                                </span>
                            </div>
                            <h1 style="font-size: 22px; font-weight: 800; color: #0F172A; margin: 14px 0 6px; letter-spacing: -0.02em;">
                                Your Subscription &amp; Call Are Confirmed!
                            </h1>
                            <p style="font-size: 14px; color: #64748B; margin: 0; font-weight: 500;">
                                Welcome to OpenHand. Your 1-Year Pro Plan is officially active.
                            </p>
                        </td>
                    </tr>

                    <!-- Body Content -->
                    <tr>
                        <td style="padding: 28px 32px;">
                            <p style="font-size: 15px; color: #1E293B; margin: 0 0 14px; line-height: 1.6;">
                                Dear <strong>${name}</strong>,
                            </p>
                            <p style="font-size: 15px; color: #475569; margin: 0 0 22px; line-height: 1.6;">
                                Thank you for choosing OpenHand to scale your practice. We have received your subscription payment via <strong>PayGlocal</strong> and scheduled your 1-on-1 strategy call with our growth team.
                            </p>

                            <!-- Bulletproof Receipt / Schedule Table (Fixed 2 Columns) -->
                            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; margin: 0 0 24px; overflow: hidden;">
                                <tr>
                                    <td width="42%" style="padding: 13px 18px; border-bottom: 1px solid #E2E8F0; font-size: 13.5px; color: #64748B; font-weight: 600; text-align: left;">
                                        Plan Purchased
                                    </td>
                                    <td width="58%" style="padding: 13px 18px; border-bottom: 1px solid #E2E8F0; font-size: 14px; color: #2563EB; font-weight: 800; text-align: right;">
                                        ${planName}
                                    </td>
                                </tr>
                                <tr>
                                    <td width="42%" style="padding: 13px 18px; border-bottom: 1px solid #E2E8F0; font-size: 13.5px; color: #64748B; font-weight: 600; text-align: left;">
                                        Amount Paid
                                    </td>
                                    <td width="58%" style="padding: 13px 18px; border-bottom: 1px solid #E2E8F0; font-size: 14px; color: #0F172A; font-weight: 800; text-align: right;">
                                        ₹${amountPaid.toLocaleString('en-IN')} (Annual 1-Time)
                                    </td>
                                </tr>
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
                                        Scheduled Time Slot
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
                                    <td width="42%" style="padding: 13px 18px; ${orderId ? 'border-bottom: 1px solid #E2E8F0;' : ''} font-size: 13.5px; color: #64748B; font-weight: 600; text-align: left;">
                                        Payment Gateway
                                    </td>
                                    <td width="58%" style="padding: 13px 18px; ${orderId ? 'border-bottom: 1px solid #E2E8F0;' : ''} font-size: 13.5px; color: #059669; font-weight: 800; text-align: right;">
                                        PayGlocal Verified
                                    </td>
                                </tr>
                                ${orderId ? `
                                <tr>
                                    <td width="42%" style="padding: 13px 18px; font-size: 13.5px; color: #64748B; font-weight: 600; text-align: left;">
                                        Order / Txn ID
                                    </td>
                                    <td width="58%" style="padding: 13px 18px; font-size: 12px; font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace; color: #0F172A; font-weight: 700; text-align: right; word-break: break-all;">
                                        ${orderId}
                                    </td>
                                </tr>` : ''}
                            </table>

                            <!-- Google Meet Room Section -->
                            ${googleMeetLink ? `
                            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #EEF2FF; border: 1px solid #C7D2FE; border-radius: 12px; margin: 0 0 24px; text-align: center;">
                                <tr>
                                    <td style="padding: 20px 24px;">
                                        <div style="font-size: 13px; font-weight: 800; color: #3730A3; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px;">
                                            📹 Dedicated Google Meet Room Link
                                        </div>
                                        <div style="margin: 12px 0;">
                                            <a href="${googleMeetLink}" target="_blank" style="display: inline-block; background-color: #2563EB; color: #ffffff !important; font-weight: 700; font-size: 14px; text-decoration: none; padding: 12px 28px; border-radius: 10px; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);">
                                                Join Google Meet Room &rarr;
                                            </a>
                                        </div>
                                        <div style="font-size: 12px; color: #6366F1; word-break: break-all; margin-top: 6px;">
                                            Direct link: <a href="${googleMeetLink}" target="_blank" style="color: #2563EB; text-decoration: underline;">${googleMeetLink}</a>
                                        </div>
                                    </td>
                                </tr>
                            </table>
                            ` : `
                            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #ECFDF5; border: 1px solid #A7F3D0; border-radius: 12px; margin: 0 0 24px;">
                                <tr>
                                    <td style="padding: 16px 20px; font-size: 13.5px; color: #065F46; line-height: 1.5;">
                                        <strong>📞 Google Meet Room Linking:</strong><br />
                                        Our OpenHand growth team will send your auto-linked Google Meet conference room link before your session so we can guide you through profile setup and client discovery.
                                    </td>
                                </tr>
                            </table>
                            `}

                            <!-- Google Calendar Action -->
                            ${googleCalendarUrl ? `
                            <div style="text-align: center; margin: 0 0 24px;">
                                <a href="${googleCalendarUrl}" target="_blank" style="display: inline-block; background-color: #1A73E8; color: #ffffff !important; font-weight: 700; font-size: 13.5px; text-decoration: none; padding: 12px 24px; border-radius: 10px; box-shadow: 0 3px 10px rgba(26, 115, 232, 0.3);">
                                    📅 Add Event to Google Calendar
                                </a>
                            </div>
                            ` : ''}

                            <!-- What Happens Next -->
                            <div style="background-color: #F8FAFC; border-left: 4px solid #2563EB; padding: 14px 18px; margin: 0 0 24px; border-radius: 0 8px 8px 0;">
                                <div style="font-size: 13px; font-weight: 800; color: #0F172A; margin-bottom: 6px;">
                                    What happens next?
                                </div>
                                <div style="font-size: 12.5px; color: #475569; line-height: 1.6;">
                                    1. Check your calendar invite and test your audio/camera prior to the call.<br />
                                    2. Our team will guide your profile positioning, offer pricing, and booking flow.<br />
                                    3. 100% learner payments flow to your centralized OpenHand account with <strong>automated 72-hour payouts</strong> to your Bank / UPI (5% Pro fee).
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
