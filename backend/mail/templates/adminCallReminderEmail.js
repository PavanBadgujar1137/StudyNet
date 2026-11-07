exports.adminCallReminderEmail = ({
  stage = "1hour", // "1hour" | "5min"
  practitionerName,
  practitionerEmail,
  practitionerPhone = "—",
  scheduledDate,
  scheduledTimeSlot,
  googleMeetLink,
  planName = "Pro Plan (Yearly)",
}) => {
  const is1Hour = stage === "1hour"
  const stageTitle = is1Hour ? "⏰ Call in 1 Hour" : "🚨 Call in 5 Minutes"
  const stageHeader = is1Hour
    ? "Discovery Call Reminder: 1 Hour Remaining"
    : "Discovery Call Starting Now (5 Minutes)!"

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>${stageTitle} - Admin Alert</title>
</head>
<body style="margin: 0; padding: 20px; background-color: #F8FAFC; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 14px; color: #1E293B;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
            <td align="center">
                <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; background: #ffffff; border: 1px solid #E2E8F0; border-radius: 14px; overflow: hidden; box-shadow: 0 4px 14px rgba(0,0,0,0.04);">
                    <tr>
                        <td style="padding: 24px 28px; border-bottom: 1px solid #F1F5F9; background: ${is1Hour ? '#F8FAFC' : '#ECFDF5'};">
                            <div style="font-size: 18px; font-weight: 800; color: #0F172A; margin-bottom: 6px;">
                                ${stageTitle}: Discovery Call with ${practitionerName}
                            </div>
                            <p style="margin: 0; color: #64748B; font-size: 13.5px;">
                                ${stageHeader}. Prepare to join the practitioner on Google Meet.
                            </p>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 20px 28px;">
                            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 10px; overflow: hidden; margin-bottom: 20px;">
                                <tr>
                                    <td width="38%" style="padding: 10px 14px; border-bottom: 1px solid #E2E8F0; font-size: 13px; color: #64748B; font-weight: 600;">Practitioner</td>
                                    <td width="62%" style="padding: 10px 14px; border-bottom: 1px solid #E2E8F0; font-size: 13.5px; color: #0F172A; font-weight: 700; text-align: right;">${practitionerName}</td>
                                </tr>
                                <tr>
                                    <td width="38%" style="padding: 10px 14px; border-bottom: 1px solid #E2E8F0; font-size: 13px; color: #64748B; font-weight: 600;">Email</td>
                                    <td width="62%" style="padding: 10px 14px; border-bottom: 1px solid #E2E8F0; font-size: 13.5px; color: #0F172A; font-weight: 700; text-align: right;"><a href="mailto:${practitionerEmail}">${practitionerEmail}</a></td>
                                </tr>
                                <tr>
                                    <td width="38%" style="padding: 10px 14px; border-bottom: 1px solid #E2E8F0; font-size: 13px; color: #64748B; font-weight: 600;">WhatsApp / Phone</td>
                                    <td width="62%" style="padding: 10px 14px; border-bottom: 1px solid #E2E8F0; font-size: 13.5px; color: #0F172A; font-weight: 700; text-align: right;">${practitionerPhone}</td>
                                </tr>
                                <tr>
                                    <td width="38%" style="padding: 10px 14px; border-bottom: 1px solid #E2E8F0; font-size: 13px; color: #64748B; font-weight: 600;">Plan</td>
                                    <td width="62%" style="padding: 10px 14px; border-bottom: 1px solid #E2E8F0; font-size: 13.5px; color: #2563EB; font-weight: 700; text-align: right;">${planName}</td>
                                </tr>
                                <tr>
                                    <td width="38%" style="padding: 10px 14px; border-bottom: 1px solid #E2E8F0; font-size: 13px; color: #64748B; font-weight: 600;">Time Slot</td>
                                    <td width="62%" style="padding: 10px 14px; border-bottom: 1px solid #E2E8F0; font-size: 13.5px; color: #0F172A; font-weight: 700; text-align: right;">${scheduledDate} &bull; ${scheduledTimeSlot}</td>
                                </tr>
                                <tr>
                                    <td width="38%" style="padding: 10px 14px; font-size: 13px; color: #64748B; font-weight: 600;">Google Meet Link</td>
                                    <td width="62%" style="padding: 10px 14px; font-size: 13px; color: #2563EB; font-weight: 700; text-align: right;">
                                        ${googleMeetLink ? `<a href="${googleMeetLink}" target="_blank" style="color: #2563EB;">${googleMeetLink}</a>` : `<span style="color: #DC2626; font-style: italic;">Not assigned yet</span>`}
                                    </td>
                                </tr>
                            </table>

                            ${googleMeetLink ? `
                            <div style="text-align: center; margin-top: 18px;">
                                <a href="${googleMeetLink}" target="_blank" style="display: inline-block; background-color: #2563EB; color: #ffffff !important; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-weight: 700; font-size: 14px; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);">
                                    Join Google Meet Room &rarr;
                                </a>
                            </div>
                            ` : `
                            <div style="background-color: #FEF3C7; border: 1px solid #F59E0B; border-radius: 10px; padding: 14px 18px; margin-top: 18px; text-align: center; color: #92400E; font-size: 13px; font-weight: 700;">
                                ⚠️ ACTION REQUIRED: Google Meet link not assigned yet!<br />
                                Please open Admin Panel &rarr; Scheduled Calls tab, click &ldquo;+ Create Room&rdquo;, and send the link to the practitioner.
                            </div>
                            `}
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`
}
