exports.payoutPendingBankEmail = ({
  practitionerName,
  netAmount,
  sourceTitle,
  actionUrl,
}) => {
  return `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Bank Account Required for Payout - OpenHand</title>
    <style>
        body {
            background-color: #F8FAFC;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            font-size: 15px;
            line-height: 1.5;
            color: #0F172A;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 24px auto;
            background-color: #ffffff;
            border-radius: 16px;
            border: 1px solid #E2E8F0;
            overflow: hidden;
            box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05);
        }
        .header {
            background: linear-gradient(135deg, #B45309 0%, #D97706 100%);
            padding: 32px 24px;
            text-align: center;
            color: #ffffff;
        }
        .brand-name {
            font-size: 22px;
            font-weight: 800;
            color: #ffffff;
            text-decoration: none;
            display: inline-block;
            margin-bottom: 8px;
        }
        .header-title {
            font-size: 20px;
            font-weight: 700;
            margin: 0;
            color: #FEF3C7;
        }
        .alert-card {
            background: #FFFBEB;
            border: 2px dashed #FCD34D;
            border-radius: 12px;
            margin: 24px 24px 16px;
            padding: 20px;
            text-align: center;
        }
        .alert-label {
            font-size: 13px;
            text-transform: uppercase;
            font-weight: 700;
            color: #92400E;
        }
        .amount-value {
            font-size: 32px;
            font-weight: 800;
            color: #B45309;
            margin: 6px 0;
        }
        .content {
            padding: 8px 24px 24px;
        }
        .cta-btn {
            display: block;
            background: #D97706;
            color: #ffffff !important;
            text-decoration: none;
            font-weight: 700;
            font-size: 15px;
            text-align: center;
            padding: 14px 24px;
            border-radius: 10px;
            margin: 24px 0 12px;
        }
        .footer {
            font-size: 12.5px;
            color: #94A3B8;
            padding: 20px 24px;
            text-align: center;
            border-top: 1px solid #E2E8F0;
            background-color: #FAFAFA;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <span class="brand-name">OpenHand</span>
            <h1 class="header-title">Bank Account Details Needed</h1>
        </div>
        <div class="alert-card">
            <div class="alert-label">Pending 72-Hour Payout Ready</div>
            <div class="amount-value">₹${Number(netAmount).toLocaleString("en-IN")}</div>
            <div style="font-size: 12px; color: #B45309; font-weight: 600;">Awaiting your Bank / UPI details for direct debit transfer</div>
        </div>
        <div class="content">
            <p>Dear <strong>${practitionerName}</strong>,</p>
            <p>Congratulations on your client payment for <strong>${sourceTitle || "Course / Client Session"}</strong>!</p>
            <p>Our platform promises 72-hour direct bank account payouts for all practitioner earnings. However, we noticed you haven't linked your bank account or UPI details yet.</p>
            <p>Please take 30 seconds to enter your bank details in your dashboard so our automated system can disburse your <strong>₹${Number(netAmount).toLocaleString("en-IN")}</strong> payout directly into your account without delay.</p>
            
            <a href="${actionUrl || "https://openhand.live/practice?tab=payouts"}" class="cta-btn">Add Bank Account Details Now &rarr;</a>
        </div>
        <div class="footer">
            OpenHand Practitioner Financial Services. For questions, contact <a href="mailto:finance@openhand.live" style="color: #B45309;">finance@openhand.live</a>.
        </div>
    </div>
</body>
</html>`
}
