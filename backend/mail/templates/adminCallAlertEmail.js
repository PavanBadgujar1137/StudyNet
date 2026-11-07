exports.adminCallAlertEmail = ({
  practitionerName,
  practitionerEmail,
  practitionerPhone = "—",
  whatsappNumber = "",
  modality = "General",
  planName = "Pro Plan (Yearly)",
  amountPaid = 9588,
  scheduledDate,
  scheduledTimeSlot,
  goals = "—",
  socialProfileLink = "—",
  referralSource = "—",
  courseSellingStatus = "—",
  otherPlatforms = "—",
  paidCommunityStrength = "—",
  timelineToMove = "—",
  callExpectations = "—",
  guests = [],
  googleMeetLink = "",
  paymentId = "",
}) => {
  const displayPhone = whatsappNumber || practitionerPhone || "—"
  const guestsText = Array.isArray(guests) && guests.length > 0 ? guests.join(", ") : "None"

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>New Practitioner Discovery Call & Subscription</title>
</head>
<body style="margin: 0; padding: 20px; background-color: #F8FAFC; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 14px; color: #1E293B;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
            <td align="center">
                <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 650px; background: #ffffff; border: 1px solid #E2E8F0; border-radius: 14px; overflow: hidden; box-shadow: 0 4px 14px rgba(0,0,0,0.04);">
                    <tr>
                        <td style="padding: 24px 28px; border-bottom: 1px solid #F1F5F9; background: #FAFAFE;">
                            <div style="font-size: 18px; font-weight: 800; color: #0F172A; margin-bottom: 6px;">
                                📞 New Practitioner Discovery Call Booked + Subscription Paid
                            </div>
                            <p style="margin: 0; color: #64748B; font-size: 13.5px;">
                                A practitioner has completed their subscription payment and submitted their 30-minute discovery call questionnaire.
                            </p>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 20px 28px;">
                            <!-- Call & Payment Details -->
                            <div style="font-size: 13px; font-weight: 800; text-transform: uppercase; color: #475569; letter-spacing: 0.05em; margin-bottom: 8px;">
                                1. Schedule &amp; Plan
                            </div>
                            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 10px; overflow: hidden; margin-bottom: 20px;">
                                <tr>
                                    <td width="38%" style="padding: 10px 14px; border-bottom: 1px solid #E2E8F0; font-size: 13px; color: #64748B; font-weight: 600;">Practitioner</td>
                                    <td width="62%" style="padding: 10px 14px; border-bottom: 1px solid #E2E8F0; font-size: 13.5px; color: #0F172A; font-weight: 700; text-align: right;">${practitionerName}</td>
                                </tr>
                                <tr>
                                    <td width="38%" style="padding: 10px 14px; border-bottom: 1px solid #E2E8F0; font-size: 13px; color: #64748B; font-weight: 600;">Email</td>
                                    <td width="62%" style="padding: 10px 14px; border-bottom: 1px solid #E2E8F0; font-size: 13.5px; color: #0F172A; font-weight: 700; text-align: right;"><a href="mailto:${practitionerEmail}" style="color: #2563EB;">${practitionerEmail}</a></td>
                                </tr>
                                <tr>
                                    <td width="38%" style="padding: 10px 14px; border-bottom: 1px solid #E2E8F0; font-size: 13px; color: #64748B; font-weight: 600;">WhatsApp Number</td>
                                    <td width="62%" style="padding: 10px 14px; border-bottom: 1px solid #E2E8F0; font-size: 13.5px; color: #0F172A; font-weight: 700; text-align: right;">${displayPhone}</td>
                                </tr>
                                <tr>
                                    <td width="38%" style="padding: 10px 14px; border-bottom: 1px solid #E2E8F0; font-size: 13px; color: #64748B; font-weight: 600;">Plan</td>
                                    <td width="62%" style="padding: 10px 14px; border-bottom: 1px solid #E2E8F0; font-size: 13.5px; color: #2563EB; font-weight: 800; text-align: right;">${planName}</td>
                                </tr>
                                <tr>
                                    <td width="38%" style="padding: 10px 14px; border-bottom: 1px solid #E2E8F0; font-size: 13px; color: #64748B; font-weight: 600;">Amount Paid</td>
                                    <td width="62%" style="padding: 10px 14px; border-bottom: 1px solid #E2E8F0; font-size: 13.5px; color: #059669; font-weight: 800; text-align: right;">₹${amountPaid.toLocaleString('en-IN')} (Paid)</td>
                                </tr>
                                <tr>
                                    <td width="38%" style="padding: 10px 14px; border-bottom: 1px solid #E2E8F0; font-size: 13px; color: #64748B; font-weight: 600;">Scheduled Date</td>
                                    <td width="62%" style="padding: 10px 14px; border-bottom: 1px solid #E2E8F0; font-size: 13.5px; color: #0F172A; font-weight: 700; text-align: right;">${scheduledDate}</td>
                                </tr>
                                <tr>
                                    <td width="38%" style="padding: 10px 14px; border-bottom: 1px solid #E2E8F0; font-size: 13px; color: #64748B; font-weight: 600;">Time Slot</td>
                                    <td width="62%" style="padding: 10px 14px; border-bottom: 1px solid #E2E8F0; font-size: 13.5px; color: #0F172A; font-weight: 700; text-align: right;">${scheduledTimeSlot}</td>
                                </tr>
                                ${googleMeetLink ? `
                                <tr>
                                    <td width="38%" style="padding: 10px 14px; font-size: 13px; color: #64748B; font-weight: 600;">Google Meet Link</td>
                                    <td width="62%" style="padding: 10px 14px; font-size: 13px; color: #2563EB; font-weight: 700; text-align: right;"><a href="${googleMeetLink}" target="_blank" style="color: #2563EB;">${googleMeetLink}</a></td>
                                </tr>` : ''}
                            </table>

                            <!-- Discovery Questionnaire Responses -->
                            <div style="font-size: 13px; font-weight: 800; text-transform: uppercase; color: #475569; letter-spacing: 0.05em; margin-bottom: 8px;">
                                2. Discovery Questionnaire Answers
                            </div>
                            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 10px; overflow: hidden; margin-bottom: 20px;">
                                <tr>
                                    <td width="45%" style="padding: 10px 14px; border-bottom: 1px solid #E2E8F0; font-size: 12.5px; color: #64748B; font-weight: 600;">Social Profile Link</td>
                                    <td width="55%" style="padding: 10px 14px; border-bottom: 1px solid #E2E8F0; font-size: 12.5px; color: #0F172A; font-weight: 600; text-align: right; word-break: break-all;">
                                        ${socialProfileLink !== "—" ? `<a href="${socialProfileLink.startsWith('http') ? socialProfileLink : 'https://' + socialProfileLink}" target="_blank" style="color: #2563EB;">${socialProfileLink}</a>` : "—"}
                                    </td>
                                </tr>
                                <tr>
                                    <td width="45%" style="padding: 10px 14px; border-bottom: 1px solid #E2E8F0; font-size: 12.5px; color: #64748B; font-weight: 600;">How they found us</td>
                                    <td width="55%" style="padding: 10px 14px; border-bottom: 1px solid #E2E8F0; font-size: 12.5px; color: #0F172A; font-weight: 600; text-align: right;">${referralSource}</td>
                                </tr>
                                <tr>
                                    <td width="45%" style="padding: 10px 14px; border-bottom: 1px solid #E2E8F0; font-size: 12.5px; color: #64748B; font-weight: 600;">Sells courses / workshops</td>
                                    <td width="55%" style="padding: 10px 14px; border-bottom: 1px solid #E2E8F0; font-size: 12.5px; color: #0F172A; font-weight: 600; text-align: right;">${courseSellingStatus}</td>
                                </tr>
                                <tr>
                                    <td width="45%" style="padding: 10px 14px; border-bottom: 1px solid #E2E8F0; font-size: 12.5px; color: #64748B; font-weight: 600;">Other platforms used</td>
                                    <td width="55%" style="padding: 10px 14px; border-bottom: 1px solid #E2E8F0; font-size: 12.5px; color: #0F172A; font-weight: 600; text-align: right;">${otherPlatforms}</td>
                                </tr>
                                <tr>
                                    <td width="45%" style="padding: 10px 14px; border-bottom: 1px solid #E2E8F0; font-size: 12.5px; color: #64748B; font-weight: 600;">Paid community strength</td>
                                    <td width="55%" style="padding: 10px 14px; border-bottom: 1px solid #E2E8F0; font-size: 12.5px; color: #0F172A; font-weight: 700; text-align: right; color: #2563EB;">${paidCommunityStrength}</td>
                                </tr>
                                <tr>
                                    <td width="45%" style="padding: 10px 14px; border-bottom: 1px solid #E2E8F0; font-size: 12.5px; color: #64748B; font-weight: 600;">Timeline to move</td>
                                    <td width="55%" style="padding: 10px 14px; border-bottom: 1px solid #E2E8F0; font-size: 12.5px; color: #0F172A; font-weight: 600; text-align: right;">${timelineToMove}</td>
                                </tr>
                                <tr>
                                    <td width="45%" style="padding: 10px 14px; border-bottom: 1px solid #E2E8F0; font-size: 12.5px; color: #64748B; font-weight: 600;">Guests invited</td>
                                    <td width="55%" style="padding: 10px 14px; border-bottom: 1px solid #E2E8F0; font-size: 12.5px; color: #0F172A; font-weight: 600; text-align: right;">${guestsText}</td>
                                </tr>
                                <tr>
                                    <td width="45%" style="padding: 10px 14px; font-size: 12.5px; color: #64748B; font-weight: 600;">Expectations from call</td>
                                    <td width="55%" style="padding: 10px 14px; font-size: 12.5px; color: #0F172A; font-weight: 500; text-align: right;">${callExpectations || goals || "—"}</td>
                                </tr>
                            </table>

                            <div style="text-align: center; margin-top: 18px;">
                                <p style="font-size: 12px; color: #64748B; margin-bottom: 12px;">
                                    View in Admin Panel &gt; <b>Scheduled Calls</b> tab to manage Google Meet links and automatic reminders.
                                </p>
                                <a href="https://openhand.live/admin" style="display: inline-block; background-color: #2563EB; color: #ffffff !important; text-decoration: none; padding: 11px 24px; border-radius: 8px; font-weight: 700; font-size: 13px;">
                                    Open Admin Panel &rarr;
                                </a>
                            </div>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`
}
