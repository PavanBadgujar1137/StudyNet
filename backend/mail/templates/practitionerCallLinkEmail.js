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
<html>
<head>
    <meta charset="UTF-8">
    <title>Your OpenHand Onboarding Call Link</title>
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
        .btn-meet {
            display: inline-block;
            background: #1A73E8;
            color: #ffffff !important;
            font-weight: 700;
            font-size: 16px;
            text-decoration: none;
            padding: 14px 32px;
            border-radius: 12px;
            box-shadow: 0 4px 14px rgba(26, 115, 232, 0.4);
            margin: 20px 0;
            text-align: center;
        }
        .notes-box {
            background: #FEF3C7;
            border: 1px solid #FDE68A;
            border-radius: 10px;
            padding: 14px 18px;
            margin: 16px 0;
            color: #92400E;
            font-size: 14px;
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
            <span class="badge">Google Meet Call Invitation</span>
            <h1 class="title">Here Is Your Onboarding Call Link</h1>
            <p style="color: #64748B; margin: 0; font-size: 14px;">We are excited to meet you and guide your practice setup!</p>
        </div>

        <p>Dear <b>${name}</b>,</p>
        <p>Our OpenHand Connect Team has assigned your guiding session for your <b>${planName}</b>. Below is your official Google Meet call link for our upcoming session:</p>

        <div style="text-align: center; margin: 24px 0;">
            <a href="${googleMeetLink}" target="_blank" class="btn-meet">
                📹 Join Google Meet Session
            </a>
            <div style="font-size: 12px; color: #64748B; margin-top: 8px;">
                Link: <a href="${googleMeetLink}" style="color: #1A73E8;">${googleMeetLink}</a>
            </div>
        </div>

        <div class="card">
            <div class="card-row">
                <span class="label">Date</span>
                <span class="value">${scheduledDate}</span>
            </div>
            <div class="card-row">
                <span class="label">Time</span>
                <span class="value">${scheduledTimeSlot}</span>
            </div>
            <div class="card-row">
                <span class="label">Timezone</span>
                <span class="value">${timezone}</span>
            </div>
            <div class="card-row">
                <span class="label">Call Platform</span>
                <span class="value">Google Meet (HD)</span>
            </div>
        </div>

        ${adminNotes ? `
        <div class="notes-box">
            <b>Notes from OpenHand Team:</b><br />
            ${adminNotes}
        </div>
        ` : ''}

        <p style="font-size: 14px; color: #475569;">
            <b>What to prepare:</b><br />
            &bull; Have your current practice details, services, or pricing handy.<br />
            &bull; List any questions regarding client discovery or workshop hosting.<br />
            &bull; Test your camera and microphone a couple of minutes beforehand.
        </p>

        <div class="footer">
            If you need to reschedule or have any questions, reply to this email or write to <a href="mailto:connect@openhand.live" style="color: #2563EB;">connect@openhand.live</a>.<br />
            &copy; ${new Date().getFullYear()} OpenHand. All rights reserved.
        </div>
    </div>
</body>
</html>`
}
