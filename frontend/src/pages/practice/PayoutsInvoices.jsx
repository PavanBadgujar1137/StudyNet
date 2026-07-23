import React, { useEffect } from 'react'
import { OHCard } from '../../components/openhand'
import { apiConnector } from '../../services/apiConnector'
import toast from 'react-hot-toast'

export function PayoutsInvoices() {
  useEffect(() => {
    async function loadPayouts() {
      try {
        const res = await apiConnector('GET', '/api/v1/practitioner/payouts')
        if (res?.data?.success) {
          console.log('Payouts loaded:', res.data)
        }
      } catch (err) {
        console.warn('Payouts fetch error:', err)
      }
    }
    loadPayouts()
  }, [])

  return (
    <div className="practice-sec-payouts">
      <div className="htop">
        <div>
          <div className="crumb">Payouts &amp; invoices</div>
          <h1>Where your money is</h1>
          <p>Every rupee, and exactly when it lands in your bank.</p>
        </div>
        <button type="button" className="btn-g" onClick={() => toast.success('July statement PDF generated!')}>
          Download July statement
        </button>
      </div>

      {/* 4 Payout Telemetry Stats */}
      <div className="g4">
        <OHCard surface="white" pad="md" className="stat">
          <div className="lbl">Cleared this month</div>
          <div className="val">₹86,300</div>
          <div className="dl flat">In your bank</div>
        </OHCard>

        <OHCard surface="white" pad="md" className="stat">
          <div className="lbl">Clearing Thursday</div>
          <div className="val">₹38,200</div>
          <div className="dl flat">T+2 settlement</div>
        </OHCard>

        <OHCard surface="white" pad="md" className="stat">
          <div className="lbl">Pending confirmation</div>
          <div className="val">₹12,000</div>
          <div className="dl flat">Sessions not yet held</div>
        </OHCard>

        <OHCard surface="white" pad="md" className="stat">
          <div className="lbl">OpenHand fee, July</div>
          <div className="val">₹6,225</div>
          <div className="dl flat">5% on Growth plan</div>
        </OHCard>
      </div>

      {/* Settlement Timeline & Payouts */}
      <div className="g2">
        <OHCard surface="white" pad="lg">
          <div className="sechd"><h3>Settlement timeline</h3></div>
          <div className="tl">
            <div className="tli done">
              <b>Client pays — instantly</b>
              <span>UPI, card, or net banking at the moment of booking</span>
            </div>
            <div className="tli done">
              <b>Held until the session happens</b>
              <span>Protects both sides if plans change</span>
            </div>
            <div className="tli done">
              <b>Session completed</b>
              <span>Marked automatically when the room closes</span>
            </div>
            <div className="tli">
              <b>Settled to your bank — T+2</b>
              <span>Two working days later. Thursday, in this case.</span>
            </div>
            <div className="tli">
              <b>Invoice issued</b>
              <span>GST-ready, sent to your client and filed in your account</span>
            </div>
          </div>
        </OHCard>

        <OHCard surface="white" pad="lg">
          <div className="sechd"><h3>Recent payouts</h3></div>
          <div className="row">
            <div className="av g">↓</div>
            <div className="who"><b>₹42,100</b><span>15 Jul · HDFC ••4432</span></div>
            <div className="rt"><span className="pill ok">Cleared</span></div>
          </div>
          <div className="row">
            <div className="av g">↓</div>
            <div className="who"><b>₹44,200</b><span>8 Jul · HDFC ••4432</span></div>
            <div className="rt"><span className="pill ok">Cleared</span></div>
          </div>
          <div className="row">
            <div className="av g">↓</div>
            <div className="who"><b>₹38,200</b><span>24 Jul · scheduled</span></div>
            <div className="rt"><span className="pill wait">Pending</span></div>
          </div>
          <p className="note">Money goes to your bank account, not a platform wallet. There is nothing to withdraw.</p>
        </OHCard>
      </div>

      {/* Invoices Table */}
      <OHCard surface="white" pad="lg" style={{ marginTop: 18 }}>
        <div className="sechd">
          <h3>Invoices</h3>
          <a href="#export" onClick={() => toast.success('Exporting GST CSV...')} style={{ color: 'var(--oh-blue)', fontWeight: 600, fontSize: 13 }}>Export for accountant →</a>
        </div>
        <div className="scroll">
          <table className="tbl">
            <thead>
              <tr><th>Invoice</th><th>Client</th><th>Offer</th><th>Amount</th><th>GST</th><th>Status</th></tr>
            </thead>
            <tbody>
              <tr><td><b>OH-2607-118</b></td><td>Priya S.</td><td>Individual hour</td><td>₹3,500</td><td>Included</td><td><span className="pill ok">Paid</span></td></tr>
              <tr><td><b>OH-2607-117</b></td><td>Sara M.</td><td>Individual hour</td><td>₹3,500</td><td>Included</td><td><span className="pill ok">Paid</span></td></tr>
              <tr><td><b>OH-2607-116</b></td><td>Rehan A.</td><td>Circle seat — Aug</td><td>₹15,000</td><td>Included</td><td><span className="pill ok">Paid</span></td></tr>
              <tr><td><b>OH-2607-115</b></td><td>Nikhil D.</td><td>Individual hour</td><td>₹3,500</td><td>Included</td><td><span className="pill wait">Session pending</span></td></tr>
            </tbody>
          </table>
        </div>
        <p className="note">Whether GST applies depends on your registration and turnover — confirm with your accountant.</p>
      </OHCard>
    </div>
  )
}

export default PayoutsInvoices
