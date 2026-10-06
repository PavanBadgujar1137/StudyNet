exports.adminCallAlertEmail = ({
  practitionerName,
  practitionerEmail,
  practitionerPhone = "—",
  modality = "General",
  planName = "Pro Plan (Yearly)",
  amountPaid = 9588,
  scheduledDate,
  scheduledTimeSlot,
  goals = "—",
  paymentId = "",
}) => {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>New Practitioner Onboarding Call & Subscription</title>
</head>
<body style="margin: 0; padding: 20px; background-color: #F8FAFC; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 14px; color: #1E293B;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
            <td align="center">
                <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; background: #ffffff; border: 1px solid #E2E8F0; border-radius: 14px; overflow: hidden; box-shadow: 0 4px 14px rgba(0,0,0,0.04);">
                    <tr>
                        <td style="padding: 24px 28px; border-bottom: 1px solid #F1F5F9;">
                            <div style="font-size: 18px; font-weight: 800; color: #0F172A; margin-bottom: 6px;">
                                📞 New Practitioner Call Booked + Subscription Paid
                            </div>
                            <p style="margin: 0; color: #64748B; font-size: 13.5px;">
                                A practitioner has completed their 1-year Pro Plan subscription via PayGlocal and reserved an onboarding strategy session.
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
                                    <td width="62%" style="padding: 10px 14px; border-bottom: 1px solid #E2E8F0; font-size: 13.5px; color: #0F172A; font-weight: 700; text-align: right;"><a href="mailto:${practitionerEmail}" style="color: #2563EB;">${practitionerEmail}</a></td>
                                </tr>
                                <tr>
                                    <td width="38%" style="padding: 10px 14px; border-bottom: 1px solid #E2E8F0; font-size: 13px; color: #64748B; font-weight: 600;">Phone</td>
                                    <td width="62%" style="padding: 10px 14px; border-bottom: 1px solid #E2E8F0; font-size: 13.5px; color: #0F172A; font-weight: 700; text-align: right;">${practitionerPhone}</td>
                                </tr>
                                <tr>
                                    <td width="38%" style="padding: 10px 14px; border-bottom: 1px solid #E2E8F0; font-size: 13px; color: #64748B; font-weight: 600;">Practice Modality</td>
                                    <td width="62%" style="padding: 10px 14px; border-bottom: 1px solid #E2E8F0; font-size: 13.5px; color: #0F172A; font-weight: 700; text-align: right;">${modality}</td>
                                </tr>
                                <tr>
                                    <td width="38%" style="padding: 10px 14px; border-bottom: 1px solid #E2E8F0; font-size: 13px; color: #64748B; font-weight: 600;">Plan</td>
                                    <td width="62%" style="padding: 10px 14px; border-bottom: 1px solid #E2E8F0; font-size: 13.5px; color: #2563EB; font-weight: 800; text-align: right;">${planName}</td>
                                </tr>
                                <tr>
                                    <td width="38%" style="padding: 10px 14px; border-bottom: 1px solid #E2E8F0; font-size: 13px; color: #64748B; font-weight: 600;">Amount Paid</td>
                                    <td width="62%" style="padding: 10px 14px; border-bottom: 1px solid #E2E8F0; font-size: 13.5px; color: #059669; font-weight: 800; text-align: right;">₹${amountPaid.toLocaleString('en-IN')} (PayGlocal)</td>
                                </tr>
                                <tr>
                                    <td width="38%" style="padding: 10px 14px; border-bottom: 1px solid #E2E8F0; font-size: 13px; color: #64748B; font-weight: 600;">Scheduled Date</td>
                                    <td width="62%" style="padding: 10px 14px; border-bottom: 1px solid #E2E8F0; font-size: 13.5px; color: #0F172A; font-weight: 700; text-align: right;">${scheduledDate}</td>
                                </tr>
                                <tr>
                                    <td width="38%" style="padding: 10px 14px; border-bottom: 1px solid #E2E8F0; font-size: 13px; color: #64748B; font-weight: 600;">Time Slot</td>
                                    <td width="62%" style="padding: 10px 14px; border-bottom: 1px solid #E2E8F0; font-size: 13.5px; color: #0F172A; font-weight: 700; text-align: right;">${scheduledTimeSlot}</td>
                                </tr>
                                <tr>
                                    <td width="38%" style="padding: 10px 14px; font-size: 13px; color: #64748B; font-weight: 600;">Goals / Notes</td>
                                    <td width="62%" style="padding: 10px 14px; font-size: 13px; color: #0F172A; font-weight: 500; text-align: right;">${goals}</td>
                                </tr>
                            </table>

                            <div style="text-align: center; margin-top: 18px;">
                                <p style="font-size: 12px; color: #64748B; margin-bottom: 12px;">
                                    Go to Admin Panel &gt; <b>Onboarding &amp; Calls</b> tab to view this schedule and assign the Google Meet link.
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
