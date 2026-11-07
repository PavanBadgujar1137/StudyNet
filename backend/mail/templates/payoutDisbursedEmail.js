exports.payoutDisbursedEmail = ({
  practitionerName,
  netAmount,
  grossAmount,
  platformFee,
  taxDeducted,
  payoutUtrNumber,
  bankName,
  accountMasked,
  upiId,
  sourceTitle,
  sourceType,
  settledAt,
}) => {
  const destinationText = bankName && accountMasked
    ? `${bankName} (A/C: ${accountMasked})`
    : upiId
    ? `UPI ID: ${upiId}`
    : "Direct Bank Account"

  const formattedDate = settledAt
    ? new Date(settledAt).toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }) + " (IST)"
    : "Just now"

  return `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Bank Payout Credited - OpenHand</title>
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
            background: linear-gradient(135deg, #064E3B 0%, #065F46 50%, #047857 100%);
            padding: 32px 24px;
            text-align: center;
            color: #ffffff;
        }
        .brand-name {
            font-size: 22px;
            font-weight: 800;
            letter-spacing: -0.5px;
            color: #ffffff;
            text-decoration: none;
            display: inline-block;
            margin-bottom: 8px;
        }
        .header-title {
            font-size: 20px;
            font-weight: 700;
            margin: 0;
            color: #ECFDF5;
        }
        .amount-card {
            background: #F0FDF4;
            border: 2px dashed #86EFAC;
            border-radius: 12px;
            margin: 24px 24px 16px;
            padding: 20px;
            text-align: center;
        }
        .amount-label {
            font-size: 13px;
            text-transform: uppercase;
            font-weight: 700;
            letter-spacing: 0.5px;
            color: #166534;
        }
        .amount-value {
            font-size: 36px;
            font-weight: 800;
            color: #065F46;
            margin: 6px 0;
        }
        .badge {
            display: inline-block;
            background: #DCFCE7;
            color: #15803D;
            font-size: 12px;
            font-weight: 700;
            padding: 4px 12px;
            border-radius: 20px;
        }
        .content {
            padding: 8px 24px 24px;
        }
        .table-box {
            background: #F8FAFC;
            border: 1px solid #E2E8F0;
            border-radius: 12px;
            padding: 16px;
            margin: 20px 0;
        }
        .row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid #EEF2F6;
            font-size: 13.5px;
        }
        .row:last-child {
            border-bottom: none;
        }
        .label {
            color: #64748B;
            font-weight: 500;
        }
        .val {
            color: #0F172A;
            font-weight: 700;
            text-align: right;
        }
        .utr-code {
            font-family: monospace;
            background: #F1F5F9;
            padding: 2px 8px;
            border-radius: 6px;
            color: #0F172A;
            letter-spacing: 0.5px;
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
            <h1 class="header-title">72-Hour Autopay Deposited</h1>
        </div>
        <div class="amount-card">
            <div class="amount-label">Direct Bank Payout Credited</div>
            <div class="amount-value">₹${Number(netAmount).toLocaleString("en-IN")}</div>
            <div class="badge">✓ Settled to Your Bank Account</div>
        </div>
        <div class="content">
            <p>Dear <strong>${practitionerName}</strong>,</p>
            <p>Your net earnings for <strong>${sourceTitle || "Course / Client Session"}</strong> have been successfully processed and transferred directly to your registered bank account via our automated 72-hour settlement cycle.</p>
            
            <div class="table-box">
                <div class="row">
                    <span class="label">Bank Destination</span>
                    <span class="val">${destinationText}</span>
                </div>
                <div class="row">
                    <span class="label">Bank UTR / Ref No.</span>
                    <span class="val utr-code">${payoutUtrNumber || "PAYG-DIRECT-TRANSFER"}</span>
                </div>
                <div class="row">
                    <span class="label">Disbursed At</span>
                    <span class="val">${formattedDate}</span>
                </div>
                <div class="row">
                    <span class="label">Source Type</span>
                    <span class="val">${sourceType === "course" ? "📘 Paid Course" : "🗓️ Offer / 1:1 Session"}</span>
                </div>
                <div class="row">
                    <span class="label">Gross Learner Payment</span>
                    <span class="val">₹${Number(grossAmount || netAmount).toLocaleString("en-IN")}</span>
                </div>
                ${platformFee > 0 ? `
                <div class="row">
                    <span class="label">Platform Fee Deducted</span>
                    <span class="val" style="color: #DC2626;">-₹${Number(platformFee).toLocaleString("en-IN")}</span>
                </div>` : ""}
                ${taxDeducted > 0 ? `
                <div class="row">
                    <span class="label">18% GST on Platform Service</span>
                    <span class="val" style="color: #DC2626;">-₹${Number(taxDeducted).toLocaleString("en-IN")}</span>
                </div>` : ""}
                <div class="row" style="font-size: 15px; padding-top: 10px; border-top: 2px solid #CBD5E1;">
                    <span class="label" style="color: #0F172A; font-weight: 800;">Net Credited to Bank</span>
                    <span class="val" style="color: #059669; font-weight: 900;">₹${Number(netAmount).toLocaleString("en-IN")}</span>
                </div>
            </div>

            <p style="font-size: 13px; color: #64748B;">You can download your detailed settlement statement and view all financial records under the <strong>Payouts</strong> tab in your OpenHand Practice Dashboard.</p>
        </div>
        <div class="footer">
            Automated settlement via OpenHand PayGlocal Gateway. For queries, contact <a href="mailto:finance@openhand.live" style="color: #047857;">finance@openhand.live</a>.
        </div>
    </div>
</body>
</html>`
}
