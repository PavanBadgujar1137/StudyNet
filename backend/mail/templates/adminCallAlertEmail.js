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
<html>
<head>
    <meta charset="UTF-8">
    <title>New Practitioner Onboarding Call & Subscription</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 14px; color: #1E293B; background: #F8FAFC; margin: 0; padding: 20px; }
        .box { max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #E2E8F0; border-radius: 12px; padding: 24px; }
        .title { font-size: 18px; font-weight: 800; color: #0F172A; margin-bottom: 8px; }
        .row { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #F1F5F9; }
        .label { color: #64748B; font-weight: 600; }
        .val { color: #0F172A; font-weight: 700; text-align: right; }
        .action { margin-top: 20px; text-align: center; }
        .btn { display: inline-block; background: #2563EB; color: #fff !important; text-decoration: none; padding: 10px 20px; border-radius: 8px; font-weight: 700; font-size: 13px; }
    </style>
</head>
<body>
    <div class="box">
        <div class="title">📞 New Practitioner Call Booked + Subscription Paid</div>
        <p>A practitioner has taken a yearly subscription via PayGlocal and scheduled their 1-on-1 guiding call:</p>
        <div class="row"><span class="label">Practitioner</span><span class="val">${practitionerName}</span></div>
        <div class="row"><span class="label">Email</span><span class="val">${practitionerEmail}</span></div>
        <div class="row"><span class="label">Phone</span><span class="val">${practitionerPhone}</span></div>
        <div class="row"><span class="label">Modality / Practice</span><span class="val">${modality}</span></div>
        <div class="row"><span class="label">Plan</span><span class="val" style="color: #2563EB;">${planName}</span></div>
        <div class="row"><span class="label">Amount Paid</span><span class="val">₹${amountPaid.toLocaleString('en-IN')} (PayGlocal)</span></div>
        <div class="row"><span class="label">Payment ID</span><span class="val">${paymentId}</span></div>
        <div class="row"><span class="label">Scheduled Date</span><span class="val">${scheduledDate}</span></div>
        <div class="row"><span class="label">Time Slot</span><span class="val">${scheduledTimeSlot}</span></div>
        <div class="row"><span class="label">Goals / Notes</span><span class="val">${goals}</span></div>
        
        <div class="action">
            <p style="font-size: 12px; color: #64748B; margin-bottom: 12px;">Go to Admin Panel &gt; <b>Onboarding &amp; Calls</b> tab to assign and email the Google Meet link.</p>
            <a href="https://openhand.live/admin" class="btn">Open Admin Panel</a>
        </div>
    </div>
</body>
</html>`
}
