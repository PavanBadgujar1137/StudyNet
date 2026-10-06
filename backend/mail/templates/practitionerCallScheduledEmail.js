exports.practitionerCallScheduledEmail = ({
  name,
  planName = "Pro Plan (Yearly)",
  amountPaid = 9588,
  scheduledDate,
  scheduledTimeSlot,
  timezone = "Asia/Kolkata (IST)",
  googleCalendarUrl = "",
  orderId = "",
  paymentId = "",
}) => {
  return `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Practitioner Onboarding Call & Subscription Confirmed</title>
    <style>
        body {
            background-color: #F8FAFC;
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            font-size: 15px;
            line-height: 1.6;
            color: #1E293B;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 620px;
            margin: 24px auto;
            padding: 36px 32px;
            background-color: #ffffff;
            border-radius: 16px;
            border: 1px solid #E2E8F0;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
        }
        .header {
            text-align: center;
            border-bottom: 1px solid #F1F5F9;
            padding-bottom: 24px;
            margin-bottom: 28px;
        }
        .brand-name {
            font-size: 26px;
            font-weight: 800;
            color: #0F172A;
            text-decoration: none;
            letter-spacing: -0.5px;
        }
        .badge {
            display: inline-block;
            background: #EFF6FF;
            color: #2563EB;
            font-size: 12px;
            font-weight: 700;
            padding: 4px 14px;
            border-radius: 9999px;
            margin-top: 10px;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            border: 1px solid #BFDBFE;
        }
        .title {
            font-size: 22px;
            font-weight: 800;
            color: #0F172A;
            margin-top: 12px;
            margin-bottom: 8px;
        }
        .subtitle {
            font-size: 14px;
            color: #64748B;
            margin: 0;
        }
        .card {
            background: #F8FAFC;
            border: 1px solid #E2E8F0;
            border-radius: 12px;
            padding: 20px 24px;
            margin: 24px 0;
        }
        .card-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px dashed #E2E8F0;
            font-size: 14px;
        }
        .card-row:last-child {
            border-bottom: none;
            padding-bottom: 0;
        }
        .label {
            color: #64748B;
            font-weight: 500;
        }
        .value {
            color: #0F172A;
            font-weight: 700;
            text-align: right;
        }
        .highlight-box {
            background: #ECFDF5;
            border: 1px solid #A7F3D0;
            border-radius: 12px;
            padding: 16px 20px;
            margin: 20px 0;
            color: #065F46;
            font-size: 14px;
            line-height: 1.5;
        }
        .btn {
            display: inline-block;
            background: linear-gradient(135deg, #2563EB 0%, #7C3AED 100%);
            color: #ffffff !important;
            font-weight: 700;
            font-size: 14px;
            text-decoration: none;
            padding: 13px 28px;
            border-radius: 10px;
            box-shadow: 0 4px 14px rgba(37, 99, 235, 0.35);
            margin: 16px 0;
            text-align: center;
        }
        .footer {
            font-size: 12px;
            color: #94A3B8;
            margin-top: 32px;
            padding-top: 20px;
            border-top: 1px solid #F1F5F9;
            text-align: center;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <a href="https://openhand.live" class="brand-name">OpenHand</a><br />
            <span class="badge">Practitioner Onboarding</span>
            <h1 class="title">Your Subscription &amp; Call Are Confirmed!</h1>
            <p class="subtitle">Welcome to OpenHand. Your 1-Year Pro Plan is now active.</p>
        </div>

        <p>Dear <b>${name}</b>,</p>
        <p>Thank you for choosing OpenHand to grow your practice. We have received your payment via <b>PayGlocal</b> and reserved your 1-on-1 practitioner guiding &amp; onboarding call.</p>

        <div class="card">
            <div class="card-row">
                <span class="label">Plan Purchased</span>
                <span class="value" style="color: #2563EB;">${planName}</span>
            </div>
            <div class="card-row">
                <span class="label">Amount Paid</span>
                <span class="value">₹${amountPaid.toLocaleString('en-IN')} (Annual 1-Time)</span>
            </div>
            <div class="card-row">
                <span class="label">Scheduled Date</span>
                <span class="value">${scheduledDate}</span>
            </div>
            <div class="card-row">
                <span class="label">Scheduled Time Slot</span>
                <span class="value">${scheduledTimeSlot}</span>
            </div>
            <div class="card-row">
                <span class="label">Timezone</span>
                <span class="value">${timezone}</span>
            </div>
            <div class="card-row">
                <span class="label">Payment Gateway</span>
                <span class="value">PayGlocal</span>
            </div>
            ${orderId ? `
            <div class="card-row">
                <span class="label">Order / Txn ID</span>
                <span class="value" style="font-family: monospace; font-size: 12px;">${orderId}</span>
            </div>` : ''}
        </div>

        <div class="highlight-box">
            <b>📞 Next Step: Google Meet Link</b><br />
            Our OpenHand Growth &amp; Onboarding Team has been notified. You will receive an official Google Meet call link directly via email before your session so we can guide you on setup, client acquisition, and launching your offers.
        </div>

        ${googleCalendarUrl ? `
        <div style="text-align: center;">
            <a href="${googleCalendarUrl}" target="_blank" class="btn">
                📅 Add Call to Google Calendar
            </a>
        </div>
        ` : ''}

        <p style="font-size: 13px; color: #64748B;">
            <b>72-Hour Payout Benefit:</b> As a Pro practitioner, 100% of your earnings from learner courses and session bookings will be processed through our central OpenHand account and automatically disbursed to your bank or UPI within <b>72 hours</b> with a flat 5% platform fee.
        </p>

        <div class="footer">
            Need to reschedule or have questions? Email our connect team at <a href="mailto:connect@openhand.live" style="color: #2563EB;">connect@openhand.live</a>.<br />
            &copy; ${new Date().getFullYear()} OpenHand. All rights reserved.
        </div>
    </div>
</body>
</html>`
}
